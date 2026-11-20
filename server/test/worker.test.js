import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { onRequest as pagesFunction } from "../../functions/api/[[path]].js";
import worker from "../../worker/index.js";
import { DEFAULT_API_ORIGIN } from "../../worker/proxy.js";

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });
const env = (extra = {}) => ({ API_ORIGIN: "https://api.example.com", ASSETS: { fetch: async () => new Response("asset") }, ...extra });

describe("Cloudflare worker", () => {
  it("serves non-API paths from the static assets", async () => {
    assert.equal(await (await worker.fetch(new Request("https://site.test/roadmap"), env())).text(), "asset");
  });

  it("forwards /api/* to the API with the real visitor address and the body", async () => {
    let seen;
    globalThis.fetch = async (req) => { seen = req; return new Response("{}", { status: 201, headers: { "set-cookie": "a=b" } }); };
    const res = await worker.fetch(new Request("https://site.test/api/contact?x=1", { method: "POST", body: "{\"a\":1}", headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.5", "x-forwarded-for": "6.6.6.6" } }), env());
    assert.equal(res.status, 201);
    assert.equal(res.headers.get("set-cookie"), "a=b");
    assert.equal(seen.url, "https://api.example.com/api/contact?x=1");
    assert.equal(seen.headers.get("x-forwarded-for"), "203.0.113.5", "a spoofed header is replaced");
    assert.equal(await seen.text(), "{\"a\":1}");
  });

  it("retries while the API wakes up, replaying the upload body", async () => {
    const bodies = [];
    let calls = 0;
    globalThis.fetch = async (req) => { bodies.push(await req.text()); calls += 1; return calls < 3 ? new Response("<html>Service waking</html>", { status: 503, headers: { "content-type": "text/html" } }) : new Response("{\"ok\":true}", { status: 201, headers: { "content-type": "application/json" } }); };
    const res = await worker.fetch(new Request("https://site.test/api/applications", { method: "POST", body: "payload" }), env({ RETRY_PAUSE_MS: 1 }));
    assert.equal(res.status, 201);
    assert.deepEqual(bodies, ["payload", "payload", "payload"]);
  });

  it("never passes HTML errors to the app, and passes real JSON errors through", async () => {
    globalThis.fetch = async () => new Response("<html>bad gateway</html>", { status: 502, headers: { "content-type": "text/html" } });
    const res = await worker.fetch(new Request("https://site.test/api/contact", { method: "POST", body: "x" }), env({ RETRIES: 2, RETRY_PAUSE_MS: 1 }));
    assert.equal(res.status, 503);
    assert.equal((await res.json()).error, "api_unreachable");
    globalThis.fetch = async () => Response.json({ ok: false, error: "validation_failed" }, { status: 400 });
    assert.equal((await worker.fetch(new Request("https://site.test/api/contact", { method: "POST", body: "x" }), env())).status, 400);
  });

  it("answers 503 JSON when the API is down", async () => {
    globalThis.fetch = async () => { throw new Error("down"); };
    const res = await worker.fetch(new Request("https://site.test/api/health"), env({ RETRY_PAUSE_MS: 1 }));
    assert.equal(res.status, 503);
    assert.equal((await res.json()).error, "api_unreachable");
  });

  it("falls back to the default API address when API_ORIGIN is not set", async () => {
    let seen;
    globalThis.fetch = async (req) => { seen = req; return Response.json({ ok: true }); };
    await worker.fetch(new Request("https://site.test/api/health"), env({ API_ORIGIN: undefined }));
    assert.equal(seen.url, `${DEFAULT_API_ORIGIN}/api/health`);
  });
});

describe("Cloudflare Pages Function", () => {
  it("forwards /api/* exactly like the Worker (sites hosted as a Pages project)", async () => {
    let seen;
    globalThis.fetch = async (req) => { seen = req; return Response.json({ ok: true, jobs: [] }, { status: 200 }); };
    const request = new Request("https://zenitheum.pages.dev/api/jobs", { headers: { "cf-connecting-ip": "198.51.100.7" } });
    const res = await pagesFunction({ request, env: {} });
    assert.equal(res.status, 200);
    assert.equal(seen.url, `${DEFAULT_API_ORIGIN}/api/jobs`);
    assert.equal(seen.headers.get("x-forwarded-for"), "198.51.100.7");
    assert.deepEqual(await res.json(), { ok: true, jobs: [] });
  });
});
