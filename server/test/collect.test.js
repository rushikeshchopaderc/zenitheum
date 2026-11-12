import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import { IOS_UA, beacon, startServer, uuid } from "./helpers.js";

let t;
before(async () => {
  t = await startServer();
});
after(() => t.close());
beforeEach(() => t.reset());

const send = (payload, headers = {}) =>
  t.call("POST", "/api/collect", { headers: { "user-agent": IOS_UA, ...headers }, body: typeof payload === "string" ? payload : JSON.stringify(payload) });
const count = async (table) => (await t.db.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n;

describe("POST /api/collect", () => {
  it("records a visit: visitor, session with attribution and device, page view", async () => {
    const b = beacon();
    assert.equal((await send(b.payload)).status, 204);
    assert.equal(await count("visitors"), 1);
    const s = (await t.db.query("SELECT * FROM sessions")).rows[0];
    assert.equal(s.id, b.sid);
    assert.equal(s.channel, "social");
    assert.equal(s.utm_campaign, "launch");
    assert.equal(s.referrer_host, "linkedin.com");
    assert.equal(s.device_type, "mobile");
    assert.equal(s.browser, "Safari");
    assert.equal(s.os, "iOS");
    assert.equal(s.language, "en-IN");
    assert.equal(s.page_views, 1);
    assert.equal(s.pixel_ratio, 3);
    const pv = (await t.db.query("SELECT * FROM page_views")).rows[0];
    assert.equal(pv.path, "/products");
    assert.equal(pv.title, "Products");
  });

  it("adds up time on page and keeps the deepest scroll across reports", async () => {
    const b = beacon();
    await send(b.payload);
    const later = (d, s) => ({ v: 1, vid: b.vid, sid: b.sid, ev: [{ t: "lv", ts: Date.now(), p: "/products", d, s }] });
    await send(later(4000, 40));
    await send(later(6000, 25));
    const pv = (await t.db.query("SELECT * FROM page_views")).rows[0];
    assert.equal(pv.duration_ms, 10_000);
    assert.equal(pv.max_scroll_pct, 40);
    assert.equal((await t.db.query("SELECT active_ms FROM sessions")).rows[0].active_ms, 10_000);
  });

  it("stores custom events and counts them on the session", async () => {
    const b = beacon({ extra: [{ t: "ev", ts: Date.now(), n: "cta_click", p: "/products", pr: { id: "hero-design-partner", junk: { nested: 1 } } }] });
    await send(b.payload);
    const e = (await t.db.query("SELECT * FROM events")).rows[0];
    assert.equal(e.name, "cta_click");
    assert.deepEqual(e.props, { id: "hero-design-partner" }, "only flat, bounded props survive");
    assert.equal((await t.db.query("SELECT events_count FROM sessions")).rows[0].events_count, 1);
  });

  it("never errors for the visitor: bad bodies are answered 204 and stored as nothing", async () => {
    assert.equal((await send("{not json")).status, 204);
    assert.equal((await send({ v: 2 })).status, 204);
    assert.equal((await send({ v: 1, vid: "x", sid: "y", ev: [] })).status, 204);
    assert.equal((await send("x".repeat(40_000))).status, 204);
    assert.equal(await count("sessions"), 0);
  });

  it("ignores crawlers, Do Not Track and Global Privacy Control", async () => {
    const b = beacon();
    await send(b.payload, { "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" });
    await send(b.payload, { dnt: "1" });
    await send(b.payload, { "sec-gpc": "1" });
    assert.equal(await count("sessions"), 0);
  });

  it("does not let one visitor write into another visitor's session", async () => {
    const owner = beacon();
    await send(owner.payload);
    const thief = beacon({ sid: owner.sid }); // new visitor id, same session id
    await send(thief.payload);
    assert.equal(await count("page_views"), 1);
    assert.equal((await t.db.query("SELECT visitor_id FROM sessions")).rows[0].visitor_id, owner.vid);
  });

  it("survives two beacons of a brand-new session arriving together", async () => {
    const b = beacon();
    const second = { v: 1, vid: b.vid, sid: b.sid, ctx: b.payload.ctx, ev: [{ t: "ev", ts: Date.now(), n: "form_start", p: "/contactus", pr: { form: "contact" } }] };
    const results = await Promise.all([send(b.payload), send(second)]);
    assert.deepEqual(results.map((r) => r.status), [204, 204]);
    assert.equal(await count("sessions"), 1);
    assert.equal(await count("page_views"), 1);
    assert.equal(await count("events"), 1);
    assert.equal((await t.db.query("SELECT sessions_count FROM visitors")).rows[0].sessions_count, 1);
  });

  it("never tracks the admin console and keeps paths clean", async () => {
    const b = beacon({ path: "/admin/leads?token=secret", extra: [{ t: "pv", ts: Date.now(), p: "/contactus?email=a@b.c#x" }] });
    await send(b.payload);
    const paths = (await t.db.query("SELECT path FROM page_views")).rows.map((r) => r.path);
    assert.deepEqual(paths, ["/contactus"], "query strings are dropped and /admin is refused");
  });

  it("bounds the work per beacon and ignores out-of-range timestamps", async () => {
    const many = Array.from({ length: 80 }, (_, i) => ({ t: "pv", ts: Date.now() + i, p: `/p${i}` }));
    const b = beacon({ extra: many });
    await send(b.payload);
    assert.ok((await count("page_views")) <= 25);
    const old = beacon({ ctx: { start: 1 }, extra: [{ t: "pv", ts: 1, p: "/old" }] });
    await send(old.payload);
    const stamp = (await t.db.query("SELECT occurred_at FROM page_views WHERE path = '/old'")).rows[0].occurred_at;
    assert.ok(Date.now() - new Date(stamp).getTime() < 60_000, "an implausible timestamp is replaced by 'now'");
  });

  it("classifies the channel from UTM tags, then from the referrer", async () => {
    const cases = [
      [{ utm: { medium: "email", source: "newsletter" }, ref: "" }, "email"],
      [{ utm: { medium: "cpc" }, ref: "https://www.google.com/" }, "paid"],
      [{ utm: {}, ref: "https://www.google.com/search?q=sensor" }, "search"],
      [{ utm: {}, ref: "https://t.co/abc" }, "social"],
      [{ utm: {}, ref: "https://some-blog.example/post" }, "referral"],
      [{ utm: {}, ref: "" }, "direct"],
    ];
    for (const [ctx, expected] of cases) {
      const b = beacon({ ctx });
      await send(b.payload);
      assert.equal((await t.db.query("SELECT channel FROM sessions WHERE id = $1", [b.sid])).rows[0].channel, expected, JSON.stringify(ctx));
    }
  });

  it("answers 204 and records nothing when analytics are switched off", async () => {
    const off = await startServer({ db: t.db, overrides: { analytics: { enabled: false } } });
    try {
      const b = beacon();
      const r = await off.call("POST", "/api/collect", { headers: { "user-agent": IOS_UA }, body: JSON.stringify(b.payload) });
      assert.equal(r.status, 204);
      assert.equal(await count("sessions"), 0);
    } finally {
      await off.close();
    }
  });

  it("uses a CDN country header when there is one, and never stores an IP", async () => {
    const b = beacon();
    await send(b.payload, { "cf-ipcountry": "IN", "x-forwarded-for": "203.0.113.9" });
    assert.equal((await t.db.query("SELECT country FROM sessions")).rows[0].country, "IN");
    const dump = JSON.stringify((await t.db.query("SELECT * FROM sessions")).rows) + JSON.stringify((await t.db.query("SELECT * FROM visitors")).rows);
    assert.ok(!dump.includes("203.0.113.9"));
  });

  it("is rate limited per client", async () => {
    const limited = await startServer({ db: t.db, overrides: { analytics: { collectLimit: 4 } } });
    try {
      const codes = [];
      for (let i = 0; i < 6; i += 1) codes.push((await limited.call("POST", "/api/collect", { headers: { "user-agent": IOS_UA }, body: JSON.stringify(beacon().payload) })).status);
      assert.deepEqual(codes, [204, 204, 204, 204, 429, 429]);
    } finally {
      await limited.close();
    }
  });
});

describe("visitor erasure keeps what a person typed but drops what they did", () => {
  it("unlinks leads and deletes the visitor's history", async () => {
    const b = beacon();
    await send(b.payload);
    await t.call("POST", "/api/contact", { body: { name: "Asha Rao", email: "a@example.com", topic: "other", message: "Please erase my browsing data.", consent: true, visitorId: b.vid, sessionId: b.sid } });
    const cookie = await t.login();
    const r = await t.call("DELETE", `/api/admin/visitors/${b.vid}`, { cookie, admin: true });
    assert.equal(r.data.erased, true);
    assert.equal((await t.db.query("SELECT count(*)::int AS n FROM sessions")).rows[0].n, 0);
    const lead = (await t.db.query("SELECT * FROM contacts")).rows[0];
    assert.equal(lead.name, "Asha Rao");
    assert.equal(lead.visitor_id, null);
    assert.equal(lead.session_id, null);
    assert.equal(lead.channel, "social", "the campaign note on the lead stays");
  });
});

void uuid;
