import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";

import { openTestDb, startServer } from "./helpers.js";

let dir;
let db;
let t;
before(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "zt-dist-"));
  await fs.mkdir(path.join(dir, "assets"), { recursive: true });
  await fs.writeFile(path.join(dir, "index.html"), "<!doctype html><title>SPA-SHELL</title>");
  await fs.writeFile(path.join(dir, "assets", "app-abc123.js"), "console.log(1)");
  db = await openTestDb();
  t = await startServer({ db, overrides: { distDir: dir, allowedOrigins: ["https://partner.example"] } });
});
after(async () => {
  await t.close();
  await db.close();
  await fs.rm(dir, { recursive: true, force: true });
});

describe("serving the built web app", () => {
  it("falls back to the SPA shell for page URLs, uncached", async () => {
    const page = await t.call("GET", "/roadmap");
    assert.equal(page.status, 200);
    assert.match(page.data, /SPA-SHELL/);
    assert.equal(page.headers.get("cache-control"), "no-cache");
  });

  it("caches fingerprinted assets forever and never answers a missing file with the shell", async () => {
    assert.match((await t.call("GET", "/assets/app-abc123.js")).headers.get("cache-control"), /immutable/);
    assert.equal((await t.call("GET", "/assets/missing.js")).status, 404);
  });

  it("keeps the staff console out of search results", async () => {
    const page = await t.call("GET", "/admin/leads");
    assert.match(page.data, /SPA-SHELL/);
    assert.match(page.headers.get("x-robots-tag"), /noindex/);
    assert.equal((await t.call("GET", "/")).headers.get("x-robots-tag"), null);
  });
});

describe("security headers and CORS", () => {
  it("sends a strict content-security policy and the usual hardening headers", async () => {
    const h = (await t.call("GET", "/api/health")).headers;
    const csp = h.get("content-security-policy");
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /frame-ancestors 'none'/);
    assert.match(csp, /connect-src 'self'/);
    assert.ok(!/unsafe-eval/.test(csp));
    assert.equal(h.get("x-content-type-options"), "nosniff");
    assert.equal(h.get("x-powered-by"), null);
  });

  it("allows only listed origins, and never for the admin API", async () => {
    const ok = await t.call("GET", "/api/jobs", { headers: { origin: "https://partner.example" } });
    assert.equal(ok.headers.get("access-control-allow-origin"), "https://partner.example");
    const other = await t.call("GET", "/api/jobs", { headers: { origin: "https://evil.example" } });
    assert.equal(other.headers.get("access-control-allow-origin"), null);
    const admin = await t.call("GET", "/api/admin/me", { headers: { origin: "https://partner.example" } });
    assert.equal(admin.headers.get("access-control-allow-origin"), null);
  });

  it("never caches admin responses", async () => {
    assert.equal((await t.call("GET", "/api/admin/me")).headers.get("cache-control"), "no-store");
  });
});
