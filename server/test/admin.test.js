import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import { signSession } from "../services/auth.js";
import { ADMIN, PDF, applicationForm, demoBody, fakeGoogle, orderBody, startServer } from "./helpers.js";

let t;
before(async () => {
  t = await startServer();
});
after(() => t.close());
beforeEach(() => t.reset());

const get = (path, cookie) => t.call("GET", `/api/admin${path}`, { cookie });
const send = (method, path, cookie, body) => t.call(method, `/api/admin${path}`, { cookie, admin: true, body });
const question = (extra = {}) => ({ name: "Asha Rao", email: "asha@example.com", organisation: "Acme", message: "A question about ZT-AFE1.", segment: "weighing", chip: "analog", consent: true, ...extra });

describe("sign-in (one account from the environment, a signed cookie, nothing stored)", () => {
  it("requires a session for everything but login", async () => {
    for (const path of ["/me", "/overview", "/contacts", "/demos", "/orders", "/applications", "/subscribers", "/milestones", "/export/orders"]) {
      assert.equal((await get(path)).status, 401, path);
    }
  });

  it("refuses state-changing requests without the custom header (CSRF)", async () => {
    const r = await t.call("POST", "/api/admin/login", { body: ADMIN });
    assert.equal(r.status, 403);
    assert.equal(r.data.error, "csrf");
    const cookie = await t.login();
    assert.equal((await t.call("PATCH", "/api/admin/contacts/00000000-0000-4000-8000-000000000000", { cookie, body: { status: "new" } })).status, 403);
  });

  it("signs in with the environment credentials and sets a hardened, expiring cookie", async () => {
    const r = await t.call("POST", "/api/admin/login", { admin: true, body: { email: "ADMIN@example.com", password: ADMIN.password } });
    assert.equal(r.status, 200);
    const cookie = r.headers.get("set-cookie");
    assert.match(cookie, /^zt_admin=[\w-]+\.[\w-]+;/);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Strict/);
    assert.match(cookie, /Path=\/api\/admin/);
    assert.match(cookie, /Max-Age=28800/);
    assert.equal((await get("/me", cookie.split(";")[0])).data.admin.email, ADMIN.email);
  });

  it("gives one answer for a wrong password and an unknown address", async () => {
    const wrong = await t.call("POST", "/api/admin/login", { admin: true, body: { email: ADMIN.email, password: "nope nope nope nope" } });
    const unknown = await t.call("POST", "/api/admin/login", { admin: true, body: { email: "who@example.com", password: "nope nope nope nope" } });
    assert.equal(wrong.status, 401);
    assert.deepEqual(unknown.data, wrong.data);
  });

  it("locks after five failures, even for the right password", async () => {
    const locked = await startServer({ db: t.db });
    try {
      for (let i = 0; i < 5; i += 1) await locked.call("POST", "/api/admin/login", { admin: true, body: { email: ADMIN.email, password: `wrong-${i}-password` } });
      assert.equal((await locked.call("POST", "/api/admin/login", { admin: true, body: ADMIN })).status, 401);
    } finally {
      await locked.close();
    }
  });

  it("limits sign-in attempts per client", async () => {
    const limited = await startServer({ db: t.db, overrides: { admin: { loginLimit: 3 } } });
    try {
      const codes = [];
      for (let i = 0; i < 5; i += 1) codes.push((await limited.call("POST", "/api/admin/login", { admin: true, body: { email: `x${i}@example.com`, password: "wrong wrong wrong" } })).status);
      assert.deepEqual(codes.slice(3), [429, 429]);
    } finally {
      await limited.close();
    }
  });

  it("rejects a forged, tampered or expired cookie, and clears the cookie on logout", async () => {
    assert.equal((await get("/me", "zt_admin=AAAA.BBBB")).status, 401);
    const cookie = await t.login();
    const [payload, sig] = decodeURIComponent(cookie.split("=")[1]).split(".");
    const forged = Buffer.from(JSON.stringify({ e: ADMIN.email, x: Date.now() + 1e9 })).toString("base64url");
    assert.equal((await get("/me", `zt_admin=${forged}.${sig}`)).status, 401, "payload changed, signature kept");
    void payload;
    const expired = signSession(t.config, Date.now() - 9 * 3600_000);
    assert.equal((await get("/me", `zt_admin=${expired}`)).status, 401);
    const out = await send("POST", "/logout", cookie);
    assert.match(out.headers.get("set-cookie"), /Max-Age=0/);
  });

  it("is switched off when no credentials are configured", async () => {
    const off = await startServer({ db: t.db, overrides: { admin: { email: "", password: "" } } });
    try {
      const r = await off.call("POST", "/api/admin/login", { admin: true, body: ADMIN });
      assert.equal(r.status, 503);
      assert.equal(r.data.error, "not_configured");
    } finally {
      await off.close();
    }
  });

  it("stores nothing about staff in the database", async () => {
    await t.login();
    const tables = (await t.db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1")).rows.map((r) => r.table_name);
    assert.deepEqual(tables.filter((n) => n !== "schema_migrations"), ["applications", "contacts", "demos", "milestones", "orders", "subscribers"]);
  });
});

describe("demos", () => {
  it("lists upcoming demos with the Meet link, filters, updates status and notes", async () => {
    const cookie = await t.login();
    await t.call("POST", "/api/demos", { body: demoBody(await t.freeSlot(0)) });
    await t.call("POST", "/api/demos", { body: demoBody(await t.freeSlot(0), { email: "b@example.com", organisation: "Beta", chip: "digital" }) });
    const all = (await get("/demos?upcoming=1", cookie)).data;
    assert.equal(all.total, 2);
    assert.ok(all.rows[0].slotStart < all.rows[1].slotStart, "soonest first");
    assert.equal(all.rows[0].meetLink, "https://meet.google.com/abc-defg-hij");
    assert.equal((await get("/demos?chip=digital", cookie)).data.total, 1);
    assert.equal((await get("/demos?q=beta", cookie)).data.rows[0].organisation, "Beta");
    const id = all.rows[0].id;
    const done = await send("PATCH", `/demos/${id}`, cookie, { status: "completed", notes: "Went well" });
    assert.equal(done.data.demo.status, "completed");
    assert.equal((await send("PATCH", `/demos/${id}`, cookie, { status: "nope" })).status, 400);
  });

  it("cancelling a booked demo cancels the calendar event and frees the slot", async () => {
    const cookie = await t.login();
    const slot = await t.freeSlot();
    await t.call("POST", "/api/demos", { body: demoBody(slot) });
    const id = (await get("/demos", cookie)).data.rows[0].id;
    await send("PATCH", `/demos/${id}`, cookie, { status: "cancelled" });
    assert.deepEqual(t.google.calls.cancelled, ["evt-1"]);
    assert.equal((await t.call("GET", "/api/demos/slots")).data.slots.find((s) => s.start === slot).available, true);
    assert.equal((await t.call("POST", "/api/demos", { body: demoBody(slot, { email: "next@example.com" }) })).status, 201);
  });

  it("creates the Meet link afterwards when the automatic step failed", async () => {
    const flaky = fakeGoogle({ failMeeting: true });
    const s = await startServer({ db: t.db, google: flaky });
    try {
      const cookie = await s.login();
      await s.call("POST", "/api/demos", { body: demoBody(await s.freeSlot()) });
      const id = (await s.call("GET", "/api/admin/demos", { cookie })).data.rows[0].id;
      assert.equal((await s.call("POST", `/api/admin/demos/${id}/meeting`, { cookie, admin: true })).status, 502);
    } finally {
      await s.close();
    }
    const ok = await startServer({ db: t.db });
    try {
      const cookie = await ok.login();
      const id = (await ok.call("GET", "/api/admin/demos", { cookie })).data.rows[0].id;
      const r = await ok.call("POST", `/api/admin/demos/${id}/meeting`, { cookie, admin: true });
      assert.equal(r.data.demo.status, "scheduled");
      assert.match(r.data.demo.meetLink, /meet\.google\.com/);
    } finally {
      await ok.close();
    }
  });
});

describe("orders, questions, applications and subscribers", () => {
  it("lists orders with the delivery details and moves them through the pipeline", async () => {
    const cookie = await t.login();
    await t.call("POST", "/api/orders", { body: orderBody() });
    await t.call("POST", "/api/orders", { body: orderBody({ organisation: "Other Co", chip: "digital", quantity: 3 }) });
    const list = (await get("/orders", cookie)).data;
    assert.equal(list.total, 2);
    const order = list.rows.find((o) => o.organisation === "Kumar Instruments");
    assert.equal(order.quantity, 500);
    assert.match(order.deliveryDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal((await get("/orders?chip=digital", cookie)).data.total, 1);
    const r = await send("PATCH", `/orders/${order.id}`, cookie, { status: "confirmed", internalNotes: "Quoted ₹X" });
    assert.equal(r.data.order.status, "confirmed");
    assert.equal(r.data.order.internalNotes, "Quoted ₹X");
    assert.equal((await send("PATCH", `/orders/${order.id}`, cookie, { status: "won" })).status, 400);
    assert.equal((await send("DELETE", `/orders/${order.id}`, cookie)).status, 200);
  });

  it("lists, filters, pages, updates and deletes questions", async () => {
    const cookie = await t.login();
    for (let i = 0; i < 5; i += 1) await t.call("POST", "/api/contact", { body: question({ name: `Person ${i}`, email: `p${i}@example.com`, segment: i < 2 ? "weighing" : "iot" }) });
    assert.equal((await get("/contacts", cookie)).data.total, 5);
    assert.equal((await get("/contacts?segment=weighing", cookie)).data.rows.length, 2);
    assert.equal((await get("/contacts?topic=customisation", cookie)).data.total, 0);
    assert.equal((await get("/contacts?topic=question", cookie)).data.total, 5);
    assert.equal((await get("/contacts?topic=nonsense", cookie)).data.total, 5, "an unknown type is ignored");
    assert.equal((await get("/contacts?q=person%204", cookie)).data.rows[0].email, "p4@example.com");
    assert.equal((await get("/contacts?limit=2&offset=2", cookie)).data.rows.length, 2);
    assert.equal((await get("/contacts?q=%25", cookie)).data.total, 0, "LIKE wildcards are literal");
    assert.equal((await get("/contacts?from=2026-13-45", cookie)).status, 400);
    const id = (await get("/contacts", cookie)).data.rows[0].id;
    assert.equal((await send("PATCH", `/contacts/${id}`, cookie, { status: "qualified", notes: "Call Monday" })).data.contact.notes, "Call Monday");
    assert.equal((await send("PATCH", `/contacts/${id}`, cookie, {})).status, 400);
    assert.equal((await send("PATCH", "/contacts/not-a-uuid", cookie, { status: "new" })).status, 404);
    assert.equal((await send("DELETE", `/contacts/${id}`, cookie)).status, 200);
    assert.equal((await send("DELETE", `/contacts/${id}`, cookie)).status, 404);
  });

  it("shows the Drive link for a resume and moves applicants through the pipeline", async () => {
    const cookie = await t.login();
    await t.call("POST", "/api/applications", { form: applicationForm() });
    await t.call("POST", "/api/applications", { form: applicationForm({ job: "devops-engineer", track: undefined, email: "dev@example.com", profile: "github.com/dev" }, null) });
    const rows = (await get("/applications", cookie)).data.rows;
    assert.equal(rows.find((r) => r.jobSlug === "applications-integration-engineer").hasResume, true);
    assert.match(rows.find((r) => r.jobSlug === "applications-integration-engineer").resumeUrl, /drive\.google\.com/);
    assert.equal(rows.find((r) => r.jobSlug === "devops-engineer").hasResume, false);
    const id = rows[0].id;
    assert.equal((await send("PATCH", `/applications/${id}`, cookie, { status: "interview" })).data.application.status, "interview");
    assert.equal((await send("PATCH", `/applications/${id}`, cookie, { status: "won" })).status, 400);
    assert.equal((await get("/applications?job=devops-engineer", cookie)).data.total, 1);
    assert.equal(PDF.length > 0, true);
  });

  it("manages subscribers, with the chip and delivery preference", async () => {
    const cookie = await t.login();
    await t.call("POST", "/api/subscribe", { body: { email: "fan@example.com", chip: "analog", analogFormat: "hard", source: "footer" } });
    const row = (await get("/subscribers", cookie)).data.rows[0];
    assert.equal(row.analogFormat, "hard");
    assert.equal((await get("/subscribers?chip=digital", cookie)).data.total, 0);
    const r = await send("PATCH", `/subscribers/${row.id}`, cookie, { status: "unsubscribed" });
    assert.ok(r.data.subscriber.unsubscribedAt);
    assert.equal((await send("DELETE", `/subscribers/${row.id}`, cookie)).status, 200);
  });

  it("summarises everything for the home screen", async () => {
    const cookie = await t.login();
    await t.call("POST", "/api/demos", { body: demoBody(await t.freeSlot()) });
    await t.call("POST", "/api/orders", { body: orderBody() });
    await t.call("POST", "/api/contact", { body: question() });
    await t.call("POST", "/api/subscribe", { body: { email: "s@example.com" } });
    const o = (await get("/overview", cookie)).data;
    assert.equal(o.counts.demos.scheduled, 1);
    assert.equal(o.counts.orders.new, 1);
    assert.equal(o.counts.contacts.new, 1);
    assert.equal(o.counts.subscribers.active, 1);
    assert.equal(o.upcomingDemos.length, 1);
    assert.equal(o.newOrders.length, 1);
  });
});

describe("milestones", () => {
  it("completing one stamps today's date and survives re-seeding; invalid edits are refused", async () => {
    const cookie = await t.login();
    const r = await send("PATCH", "/milestones/M-02", cookie, { status: "completed" });
    assert.equal(r.data.milestone.status, "completed");
    assert.match(r.data.milestone.completedOn, /^\d{4}-\d{2}-\d{2}$/);
    const { seedMilestones } = await import("../db/migrate.js");
    await seedMilestones(t.db);
    assert.equal((await t.call("GET", "/api/milestones")).data.milestones.find((m) => m.id === "M-02").status, "completed");
    assert.equal((await send("PATCH", "/milestones/M-02", cookie, { status: "done" })).status, 400);
    assert.equal((await send("PATCH", "/milestones/M-02", cookie, { targetDate: "2027-02-30" })).status, 400);
    assert.equal((await send("PATCH", "/milestones/ZZ-99", cookie, { status: "completed" })).status, 404);
  });
});

describe("CSV export", () => {
  it("exports every business table with a BOM, readable headers and neutralised spreadsheet formulas", async () => {
    const cookie = await t.login();
    await t.call("POST", "/api/demos", { body: demoBody(await t.freeSlot()) });
    await t.call("POST", "/api/orders", { body: orderBody({ organisation: "=HYPERLINK(\"http://evil.example\",\"x\")" }) });
    await t.call("POST", "/api/contact", { body: question() });
    await t.call("POST", "/api/applications", { form: applicationForm() });
    await t.call("POST", "/api/subscribe", { body: { email: "s@example.com" } });
    for (const kind of ["demos", "orders", "contacts", "applications", "subscribers"]) {
      const r = await get(`/export/${kind}`, cookie);
      assert.equal(r.status, 200, kind);
      assert.match(r.headers.get("content-disposition"), new RegExp(`^attachment; filename="zenitheum-${kind}-\\d{4}-\\d{2}-\\d{2}\\.csv"$`));
      assert.ok(r.raw.toString("utf8").startsWith("﻿"), "UTF-8 BOM for Excel");
    }
    const orders = (await get("/export/orders", cookie)).raw.toString("utf8");
    assert.match(orders, /Delivery location/);
    assert.ok(orders.includes("\"'=HYPERLINK("), "a leading = is defused");
    assert.match((await get("/export/demos", cookie)).raw.toString("utf8"), /meet\.google\.com/);
    assert.equal((await get("/export/admin_users", cookie)).status, 404);
  });
});
