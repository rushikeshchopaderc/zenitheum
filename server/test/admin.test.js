import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import { ADMIN, IOS_UA, PDF, applicationForm, beacon, startServer } from "./helpers.js";

let t;
before(async () => {
  t = await startServer();
});
after(() => t.close());
beforeEach(() => t.reset());

const lead = (extra = {}) => ({ name: "Asha Rao", email: "asha@example.com", organisation: "Acme Meters", topic: "design-partner", segment: "energy-metering", chip: "digital", message: "We would like to evaluate ZT-SEC1.", consent: true, ...extra });
const visit = async (extra = {}) => {
  const b = beacon(extra);
  await t.call("POST", "/api/collect", { headers: { "user-agent": IOS_UA }, body: JSON.stringify(b.payload) });
  return b;
};
const adminGet = (path, cookie) => t.call("GET", `/api/admin${path}`, { cookie });
const adminSend = (method, path, cookie, body) => t.call(method, `/api/admin${path}`, { cookie, admin: true, body });

describe("sign-in", () => {
  it("requires a session for everything but login", async () => {
    for (const path of ["/me", "/overview", "/contacts", "/applications", "/subscribers", "/sessions", "/milestones", "/audit", "/export/contacts"]) {
      assert.equal((await adminGet(path)).status, 401, path);
    }
  });

  it("refuses state-changing requests without the custom header (CSRF)", async () => {
    await t.createAdmin();
    const r = await t.call("POST", "/api/admin/login", { body: ADMIN });
    assert.equal(r.status, 403);
    assert.equal(r.data.error, "csrf");
    const cookie = await t.login();
    const patch = await t.call("PATCH", "/api/admin/contacts/00000000-0000-4000-8000-000000000000", { cookie, body: { status: "new" } });
    assert.equal(patch.status, 403);
  });

  it("sets a hardened cookie and never stores the raw token", async () => {
    await t.createAdmin();
    const r = await t.call("POST", "/api/admin/login", { admin: true, body: ADMIN });
    assert.equal(r.status, 200);
    const cookie = r.headers.get("set-cookie");
    assert.match(cookie, /^zt_admin=[\w-]{43}/);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Strict/);
    assert.match(cookie, /Path=\/api\/admin/);
    const token = cookie.split(";")[0].split("=")[1];
    const rows = (await t.db.query("SELECT token_hash FROM admin_sessions")).rows;
    assert.equal(rows.length, 1);
    assert.notEqual(rows[0].token_hash, token);
    assert.match(rows[0].token_hash, /^[0-9a-f]{64}$/);
    assert.equal((await adminGet("/me", cookie.split(";")[0])).data.admin.email, ADMIN.email);
  });

  it("gives one answer for an unknown address and a wrong password", async () => {
    await t.createAdmin();
    const wrong = await t.call("POST", "/api/admin/login", { admin: true, body: { email: ADMIN.email, password: "nope nope nope nope" } });
    const unknown = await t.call("POST", "/api/admin/login", { admin: true, body: { email: "who@example.com", password: "nope nope nope nope" } });
    assert.equal(wrong.status, 401);
    assert.deepEqual(unknown.data, wrong.data);
  });

  it("locks the account after repeated failures, even for the right password", async () => {
    await t.createAdmin();
    for (let i = 0; i < 5; i += 1) await t.call("POST", "/api/admin/login", { admin: true, body: { email: ADMIN.email, password: `wrong-${i}-password` } });
    const right = await t.call("POST", "/api/admin/login", { admin: true, body: ADMIN });
    assert.equal(right.status, 401);
    await t.db.query("UPDATE admin_users SET locked_until = now() - interval '1 minute'");
    assert.equal((await t.call("POST", "/api/admin/login", { admin: true, body: ADMIN })).status, 200, "the lock expires");
  });

  it("limits sign-in attempts per client", async () => {
    const limited = await startServer({ db: t.db, overrides: { admin: { loginLimit: 3 } } });
    try {
      await limited.createAdmin();
      const codes = [];
      for (let i = 0; i < 5; i += 1) codes.push((await limited.call("POST", "/api/admin/login", { admin: true, body: { email: "a@example.com", password: "wrong wrong wrong" } })).status);
      assert.deepEqual(codes.slice(3), [429, 429]);
    } finally {
      await limited.close();
    }
  });

  it("ends the session on logout and when it expires", async () => {
    const cookie = await t.login();
    await t.db.query("UPDATE admin_sessions SET expires_at = now() - interval '1 second'");
    assert.equal((await adminGet("/me", cookie)).status, 401, "expired");
    const fresh = await t.login();
    assert.equal((await adminSend("POST", "/logout", fresh)).status, 200);
    assert.equal((await adminGet("/me", fresh)).status, 401, "logged out");
  });

  it("rejects a forged cookie", async () => {
    assert.equal((await adminGet("/me", "zt_admin=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")).status, 401);
  });
});

describe("leads, applications and subscribers", () => {
  it("lists, filters, searches and pages contacts", async () => {
    const cookie = await t.login();
    for (let i = 0; i < 5; i += 1) await t.call("POST", "/api/contact", { body: lead({ name: `Person ${i}`, email: `p${i}@example.com`, segment: i < 2 ? "weighing" : "iot", chip: i < 2 ? "analog" : "digital" }) });
    assert.equal((await adminGet("/contacts", cookie)).data.total, 5);
    assert.equal((await adminGet("/contacts?segment=weighing", cookie)).data.rows.length, 2);
    assert.equal((await adminGet("/contacts?chip=digital", cookie)).data.total, 3);
    assert.equal((await adminGet("/contacts?q=person%204", cookie)).data.rows[0].email, "p4@example.com");
    const page = await adminGet("/contacts?limit=2&offset=2", cookie);
    assert.equal(page.data.rows.length, 2);
    assert.equal(page.data.total, 5);
    assert.equal((await adminGet("/contacts?q=%25", cookie)).data.total, 0, "LIKE wildcards in a search are literal");
    assert.equal((await adminGet("/contacts?from=2999-01-01", cookie)).data.total, 0);
    assert.equal((await adminGet("/contacts?from=2026-13-45", cookie)).status, 400);
  });

  it("updates status and notes, rejects bad values, and writes an audit entry", async () => {
    const cookie = await t.login();
    await t.call("POST", "/api/contact", { body: lead() });
    const id = (await adminGet("/contacts", cookie)).data.rows[0].id;
    const ok = await adminSend("PATCH", `/contacts/${id}`, cookie, { status: "qualified", notes: "Call on Monday" });
    assert.equal(ok.status, 200);
    assert.equal(ok.data.contact.status, "qualified");
    assert.equal(ok.data.contact.notes, "Call on Monday");
    assert.equal((await adminSend("PATCH", `/contacts/${id}`, cookie, { status: "nope" })).status, 400);
    assert.equal((await adminSend("PATCH", `/contacts/${id}`, cookie, {})).status, 400);
    assert.equal((await adminSend("PATCH", `/contacts/${id}`, cookie, { notes: "" })).data.contact.notes, "", "notes can be cleared");
    assert.equal((await adminSend("PATCH", "/contacts/not-a-uuid", cookie, { status: "new" })).status, 404);
    const audit = (await adminGet("/audit", cookie)).data.rows.map((r) => r.action);
    assert.ok(audit.includes("contact_updated"));
  });

  it("deletes a contact", async () => {
    const cookie = await t.login();
    await t.call("POST", "/api/contact", { body: lead() });
    const id = (await adminGet("/contacts", cookie)).data.rows[0].id;
    assert.equal((await adminSend("DELETE", `/contacts/${id}`, cookie)).status, 200);
    assert.equal((await adminSend("DELETE", `/contacts/${id}`, cookie)).status, 404);
  });

  it("downloads a resume byte for byte, as an attachment", async () => {
    const cookie = await t.login();
    await t.call("POST", "/api/applications", { form: applicationForm() });
    const apps = (await adminGet("/applications", cookie)).data;
    assert.equal(apps.rows[0].hasResume, true);
    assert.equal(apps.rows[0].resumeName, "resume.pdf");
    const r = await adminGet(`/applications/${apps.rows[0].id}/resume`, cookie);
    assert.equal(r.status, 200);
    assert.deepEqual(Buffer.from(r.raw), PDF);
    assert.match(r.headers.get("content-disposition"), /^attachment; filename="resume\.pdf"/);
    assert.equal(r.headers.get("content-type"), "application/pdf");
    assert.equal(r.headers.get("cache-control"), "no-store");
    assert.equal((await adminGet(`/applications/${apps.rows[0].id}/resume`)).status, 401, "needs a session");
  });

  it("moves an application through the pipeline and filters by role", async () => {
    const cookie = await t.login();
    await t.call("POST", "/api/applications", { form: applicationForm() });
    await t.call("POST", "/api/applications", { form: applicationForm({ job: "devops-engineer", track: undefined, email: "dev@example.com" }) });
    const id = (await adminGet("/applications?job=devops-engineer", cookie)).data.rows[0].id;
    assert.equal((await adminSend("PATCH", `/applications/${id}`, cookie, { status: "interview" })).data.application.status, "interview");
    assert.equal((await adminGet("/applications?status=interview", cookie)).data.total, 1);
    assert.equal((await adminSend("PATCH", `/applications/${id}`, cookie, { status: "won" })).status, 400, "contact statuses are not application statuses");
  });

  it("manages subscribers", async () => {
    const cookie = await t.login();
    await t.call("POST", "/api/subscribe", { body: { email: "fan@example.com", source: "footer" } });
    const id = (await adminGet("/subscribers", cookie)).data.rows[0].id;
    const r = await adminSend("PATCH", `/subscribers/${id}`, cookie, { status: "unsubscribed" });
    assert.equal(r.data.subscriber.status, "unsubscribed");
    assert.ok(r.data.subscriber.unsubscribedAt);
    assert.equal((await adminGet("/subscribers?status=active", cookie)).data.total, 0);
    assert.equal((await adminSend("DELETE", `/subscribers/${id}`, cookie)).status, 200);
  });
});

describe("website activity and reports", () => {
  it("lists visits with their journey and whether they converted", async () => {
    const cookie = await t.login();
    const b = await visit({ extra: [{ t: "ev", ts: Date.now(), n: "cta_click", p: "/products", pr: { id: "hero" } }] });
    await t.call("POST", "/api/contact", { body: lead({ visitorId: b.vid, sessionId: b.sid }) });
    const list = (await adminGet("/sessions", cookie)).data;
    assert.equal(list.total, 1);
    assert.equal(list.rows[0].lead, true);
    assert.deepEqual(list.rows[0].pages, ["/products"]);
    assert.equal((await adminGet("/sessions?converted=1", cookie)).data.total, 1);
    assert.equal((await adminGet("/sessions?channel=email", cookie)).data.total, 0);
    const detail = (await adminGet(`/sessions/${b.sid}`, cookie)).data;
    assert.equal(detail.pageViews.length, 1);
    assert.equal(detail.events[0].name, "cta_click");
    assert.equal((await adminGet("/events", cookie)).data.names[0].name, "cta_click");
  });

  it("builds the overview: totals, previous period, series, channels, funnel and pipeline", async () => {
    const cookie = await t.login();
    const b = await visit({ extra: [{ t: "ev", ts: Date.now(), n: "cta_click", p: "/products", pr: { id: "x" } }, { t: "ev", ts: Date.now(), n: "form_start", p: "/contactus", pr: { form: "contact" } }, { t: "ev", ts: Date.now(), n: "form_submit", p: "/contactus", pr: { form: "contact" } }] });
    await t.call("POST", "/api/contact", { body: lead({ visitorId: b.vid, sessionId: b.sid }) });
    await t.call("POST", "/api/subscribe", { body: { email: "s@example.com" } });
    const o = (await adminGet("/overview?range=7d", cookie)).data;
    assert.equal(o.range.days, 7);
    assert.equal(o.series.length, 7);
    assert.deepEqual(o.totals, { visitors: 1, sessions: 1, pageViews: 1, bounces: 0, avgActiveMs: 0, leads: 1, applications: 0, subscribers: 1 });
    assert.equal(o.previous.sessions, 0);
    assert.equal(o.series.at(-1).sessions, 1);
    assert.equal(o.series.at(-1).leads, 1);
    assert.deepEqual(o.channels[0], { channel: "social", sessions: 1, visitors: 1, leads: 1, applications: 0 });
    assert.deepEqual(o.funnel, { visits: 1, viewedProducts: 1, clickedCta: 1, startedForm: 1, submittedForm: 1 });
    assert.equal(o.pipeline.contacts.new, 1);
    assert.equal(o.leadMix[0].segment, "energy-metering");
    assert.equal(o.activeNow, 1);
    assert.equal((await adminGet("/overview?from=2026-11-01&to=2026-11-30", cookie)).data.range.days, 30);
  });

  it("attributes leads to campaigns", async () => {
    const cookie = await t.login();
    const b = await visit();
    await t.call("POST", "/api/contact", { body: lead({ visitorId: b.vid, sessionId: b.sid }) });
    const c = (await adminGet("/campaigns", cookie)).data;
    assert.deepEqual(c.rows[0], { campaign: "launch", source: "linkedin", medium: "social", sessions: 1, visitors: 1, leads: 1, applications: 0, subscribers: 0 });
    const a = (await adminGet("/audience", cookie)).data;
    assert.equal(a.devices[0].label, "mobile");
    assert.equal(a.screens[0].label, "Under 480 px");
  });
});

describe("roadmap milestones", () => {
  it("completing a milestone stamps today's date and survives re-seeding", async () => {
    const cookie = await t.login();
    const r = await adminSend("PATCH", "/milestones/C-05", cookie, { status: "completed" });
    assert.equal(r.status, 200);
    assert.equal(r.data.milestone.status, "completed");
    assert.match(r.data.milestone.completedOn, /^\d{4}-\d{2}-\d{2}$/);
    const { seedMilestones } = await import("../db/migrate.js");
    await seedMilestones(t.db);
    assert.equal((await t.call("GET", "/api/milestones")).data.milestones.find((m) => m.id === "C-05").status, "completed");
    const back = await adminSend("PATCH", "/milestones/C-05", cookie, { status: "upcoming", targetDate: "2026-12-15" });
    assert.equal(back.data.milestone.completedOn, null);
    assert.equal(back.data.milestone.targetDate, "2026-12-15");
  });

  it("validates edits", async () => {
    const cookie = await t.login();
    assert.equal((await adminSend("PATCH", "/milestones/C-05", cookie, { status: "done" })).status, 400);
    assert.equal((await adminSend("PATCH", "/milestones/C-05", cookie, { targetDate: "2027-02-30" })).status, 400);
    assert.equal((await adminSend("PATCH", "/milestones/ZZ-99", cookie, { status: "completed" })).status, 404);
    assert.equal((await adminSend("PATCH", "/milestones/C-05", cookie, {})).status, 400);
  });
});

describe("CSV export", () => {
  it("exports leads for marketing with a BOM, attribution columns and an audit entry", async () => {
    const cookie = await t.login();
    const b = await visit();
    await t.call("POST", "/api/contact", { body: lead({ visitorId: b.vid, sessionId: b.sid }) });
    const r = await adminGet("/export/contacts", cookie);
    assert.equal(r.status, 200);
    assert.match(r.headers.get("content-type"), /^text\/csv/);
    assert.match(r.headers.get("content-disposition"), /^attachment; filename="zenitheum-contacts-\d{4}-\d{2}-\d{2}\.csv"$/);
    const text = r.raw.toString("utf8");
    assert.ok(text.startsWith("﻿Reference,Received,Status,"), "UTF-8 BOM for Excel");
    const [header, row] = text.slice(1).trim().split("\r\n");
    assert.match(header, /UTM campaign/);
    assert.match(row, /asha@example\.com/);
    assert.match(row, /launch/);
    assert.match(row, /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/, "local timestamp Excel can sort");
    assert.ok((await adminGet("/audit", cookie)).data.rows.some((a) => a.action === "export"));
  });

  it("neutralises spreadsheet formulas typed into public forms", async () => {
    const cookie = await t.login();
    await t.call("POST", "/api/contact", { body: lead({ name: "=HYPERLINK(\"http://evil.example\",\"x\")", organisation: "+cmd|' /C calc'!A0" }) });
    const text = (await adminGet("/export/contacts", cookie)).raw.toString("utf8");
    assert.ok(text.includes("\"'=HYPERLINK("), "leading = is defused");
    assert.ok(text.includes("'+cmd"), "leading + is defused");
  });

  it("exports subscribers, applications, sessions and events; refuses unknown kinds", async () => {
    const cookie = await t.login();
    await t.call("POST", "/api/subscribe", { body: { email: "fan@example.com" } });
    await t.call("POST", "/api/applications", { form: applicationForm() });
    await visit();
    for (const kind of ["subscribers", "applications", "sessions", "events"]) assert.equal((await adminGet(`/export/${kind}`, cookie)).status, 200, kind);
    assert.equal((await adminGet("/export/admin_users", cookie)).status, 404);
  });
});
