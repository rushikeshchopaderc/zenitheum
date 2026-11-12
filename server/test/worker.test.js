import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import worker from "../../worker/index.js";

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

  it("answers 502 JSON when the API is down and 503 when unconfigured", async () => {
    globalThis.fetch = async () => { throw new Error("down"); };
    assert.equal((await worker.fetch(new Request("https://site.test/api/health"), env())).status, 502);
    assert.equal((await worker.fetch(new Request("https://site.test/api/health"), env({ API_ORIGIN: "" }))).status, 503);
  });
});
