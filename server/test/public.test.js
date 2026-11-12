import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import { DOCX, PDF, applicationForm, beacon, startServer, uuid } from "./helpers.js";

let t;
before(async () => {
  t = await startServer();
});
after(() => t.close());
beforeEach(() => t.reset());

const contact = (extra = {}) => ({
  name: "Asha Rao",
  email: "Asha@Example.com",
  organisation: "Acme Meters",
  topic: "design-partner",
  segment: "energy-metering",
  chip: "digital",
  volume: "10k-100k",
  message: "We ship 50,000 meters a year and want to evaluate a secure element.",
  consent: true,
  ...extra,
});

describe("read-only content", () => {
  it("reports health including the database kind", async () => {
    const r = await t.call("GET", "/api/health");
    assert.equal(r.status, 200);
    assert.equal(r.data.status, "ok");
    assert.ok(["pglite", "postgres"].includes(r.data.db));
  });

  it("serves the job listings and a single job", async () => {
    const list = await t.call("GET", "/api/jobs");
    assert.equal(list.data.jobs.length, 4);
    const one = await t.call("GET", "/api/jobs/vlsi-prototyping-intern");
    assert.equal(one.data.job.stipend, "₹10,000 per month");
    assert.match(one.data.job.duration, /2 months/);
    assert.equal((await t.call("GET", "/api/jobs/astronaut")).status, 404);
  });

  it("serves the roadmap and the seeded milestones", async () => {
    const roadmap = await t.call("GET", "/api/roadmap");
    assert.equal(roadmap.data.STEPS.length, 10);
    const ms = await t.call("GET", "/api/milestones");
    assert.equal(ms.status, 200);
    assert.ok(ms.data.milestones.length >= 25);
    const done = ms.data.milestones.filter((m) => m.status === "completed");
    assert.ok(done.length >= 2);
    assert.ok(done.every((m) => /^\d{4}-\d{2}-\d{2}$/.test(m.completedOn)), "dates are plain YYYY-MM-DD strings");
    assert.deepEqual(Object.keys(ms.data.milestones[0]).sort(), ["completedOn", "detail", "id", "kind", "status", "targetDate", "title", "track"]);
  });

  it("answers unknown API routes with JSON, never the SPA", async () => {
    const r = await t.call("GET", "/api/nope");
    assert.equal(r.status, 404);
    assert.equal(r.data.error, "not_found");
  });
});

describe("POST /api/contact", () => {
  it("stores the enquiry, normalises the email and notifies the team", async () => {
    const r = await t.call("POST", "/api/contact", { body: contact() });
    assert.equal(r.status, 201);
    assert.match(r.data.id, /^ZT-[0-9A-F]{8}$/);
    const { rows } = await t.db.query("SELECT * FROM contacts");
    assert.equal(rows.length, 1);
    assert.equal(rows[0].email, "asha@example.com");
    assert.equal(rows[0].segment, "energy-metering");
    assert.equal(rows[0].chip, "digital");
    assert.equal(rows[0].status, "new");
    assert.equal(t.mails.length, 1);
    assert.match(t.mails[0].subject, /Become a design partner/);
    assert.equal(t.mails[0].replyTo, "asha@example.com");
  });

  it("reports every invalid field at once", async () => {
    const r = await t.call("POST", "/api/contact", { body: { name: "A", email: "nope", topic: "zzz", segment: "made-up", message: "short" } });
    assert.equal(r.status, 400);
    assert.deepEqual(Object.keys(r.data.errors).sort(), ["consent", "email", "message", "name", "segment", "topic"]);
    assert.equal((await t.db.query("SELECT count(*)::int AS n FROM contacts")).rows[0].n, 0);
  });

  it("accepts a minimal enquiry with no optional fields", async () => {
    const r = await t.call("POST", "/api/contact", { body: { name: "Rohan", email: "r@example.com", topic: "other", message: "Hello, I have a question.", consent: true } });
    assert.equal(r.status, 201);
    const row = (await t.db.query("SELECT * FROM contacts")).rows[0];
    assert.equal(row.segment, null);
    assert.equal(row.phone, null);
  });

  it("silently drops honeypot submissions", async () => {
    const r = await t.call("POST", "/api/contact", { body: contact({ website: "http://spam.example" }) });
    assert.equal(r.status, 201);
    assert.equal((await t.db.query("SELECT count(*)::int AS n FROM contacts")).rows[0].n, 0);
    assert.equal(t.mails.length, 0);
  });

  it("strips control characters so nothing can inject a mail header", async () => {
    await t.call("POST", "/api/contact", { body: contact({ name: "Eve\r\nBcc: boss@example.com" }) });
    assert.ok(!/[\r\n]/.test(t.mails[0].subject));
  });

  it("rejects malformed and oversized JSON", async () => {
    const bad = await fetch(`${t.base}/api/contact`, { method: "POST", headers: { "content-type": "application/json" }, body: "{nope" });
    assert.equal(bad.status, 400);
    const big = await t.call("POST", "/api/contact", { body: contact({ message: "x".repeat(60_000) }) });
    assert.equal(big.status, 413);
  });

  it("copies the visit's marketing attribution onto the lead", async () => {
    const b = beacon();
    const ua = { "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Version/17.4 Mobile/15E148 Safari/604.1" };
    assert.equal((await t.call("POST", "/api/collect", { headers: ua, body: JSON.stringify(b.payload) })).status, 204);
    await t.call("POST", "/api/contact", { body: contact({ visitorId: b.vid, sessionId: b.sid }) });
    const row = (await t.db.query("SELECT * FROM contacts")).rows[0];
    assert.equal(row.channel, "social");
    assert.equal(row.utm_campaign, "launch");
    assert.equal(row.referrer_host, "linkedin.com");
    assert.equal(row.landing_path, "/products");
    assert.equal(row.session_id, b.sid);
  });

  it("ignores a session id it has never seen instead of failing", async () => {
    const r = await t.call("POST", "/api/contact", { body: contact({ visitorId: uuid(), sessionId: uuid() }) });
    assert.equal(r.status, 201);
    assert.equal((await t.db.query("SELECT channel FROM contacts")).rows[0].channel, null);
  });
});

describe("POST /api/subscribe", () => {
  it("adds an address once and answers identically for a repeat", async () => {
    const first = await t.call("POST", "/api/subscribe", { body: { email: "Fan@Example.com", source: "footer" } });
    const again = await t.call("POST", "/api/subscribe", { body: { email: "fan@example.com", source: "footer" } });
    assert.equal(first.status, 201);
    assert.deepEqual(again.data, first.data);
    assert.equal((await t.db.query("SELECT count(*)::int AS n FROM subscribers")).rows[0].n, 1);
    assert.equal(t.mails.length, 1, "only the first sign-up notifies");
  });

  it("reactivates an unsubscribed address that signs up again", async () => {
    await t.call("POST", "/api/subscribe", { body: { email: "x@example.com" } });
    await t.db.query("UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = now()");
    await t.call("POST", "/api/subscribe", { body: { email: "x@example.com" } });
    const row = (await t.db.query("SELECT * FROM subscribers")).rows[0];
    assert.equal(row.status, "active");
    assert.equal(row.unsubscribed_at, null);
  });

  it("validates the address", async () => {
    const r = await t.call("POST", "/api/subscribe", { body: { email: "nope" } });
    assert.equal(r.status, 400);
    assert.ok(r.data.errors.email);
  });
});

describe("POST /api/applications", () => {
  it("stores the application and keeps the resume in the database", async () => {
    const r = await t.call("POST", "/api/applications", { form: applicationForm() });
    assert.equal(r.status, 201);
    const app = (await t.db.query("SELECT * FROM applications")).rows[0];
    assert.equal(app.job_slug, "vlsi-engineer");
    assert.equal(app.email, "priya@example.com");
    assert.equal(app.track, "digital");
    const file = (await t.db.query("SELECT * FROM application_files")).rows[0];
    assert.equal(file.application_id, app.id);
    assert.equal(file.mime_type, "application/pdf");
    assert.equal(file.size_bytes, PDF.length);
    assert.match(file.sha256, /^[0-9a-f]{64}$/);
    assert.equal(t.mails[0].attachments[0].filename, "resume.pdf");
  });

  it("accepts a DOCX and identifies it from its bytes", async () => {
    const r = await t.call("POST", "/api/applications", { form: applicationForm({}, { name: "cv.docx", type: "application/octet-stream", bytes: DOCX }) });
    assert.equal(r.status, 201);
    assert.match((await t.db.query("SELECT mime_type FROM application_files")).rows[0].mime_type, /wordprocessingml/);
  });

  it("rejects a file whose bytes are not a document, whatever its name says", async () => {
    const r = await t.call("POST", "/api/applications", { form: applicationForm({}, { name: "resume.pdf", type: "application/pdf", bytes: Buffer.from("MZ this is an executable") }) });
    assert.equal(r.status, 400);
    assert.ok(r.data.errors.resume);
    assert.equal((await t.db.query("SELECT count(*)::int AS n FROM applications")).rows[0].n, 0);
  });

  it("rejects a disallowed extension", async () => {
    const r = await t.call("POST", "/api/applications", { form: applicationForm({}, { name: "run.exe", type: "application/octet-stream", bytes: PDF }) });
    assert.equal(r.status, 400);
  });

  it("needs a resume or a profile link", async () => {
    const none = await t.call("POST", "/api/applications", { form: applicationForm({}, null) });
    assert.equal(none.status, 400);
    assert.ok(none.data.errors.resume);
    const link = await t.call("POST", "/api/applications", { form: applicationForm({ profile: "github.com/priya" }, null) });
    assert.equal(link.status, 201);
    assert.equal((await t.db.query("SELECT profile_url FROM applications")).rows[0].profile_url, "https://github.com/priya");
    assert.equal((await t.db.query("SELECT count(*)::int AS n FROM application_files")).rows[0].n, 0);
  });

  it("requires a track where the role has tracks, and refuses unknown roles", async () => {
    const noTrack = await t.call("POST", "/api/applications", { form: applicationForm({ track: undefined }) });
    assert.equal(noTrack.status, 400);
    assert.ok(noTrack.data.errors.track);
    const unknown = await t.call("POST", "/api/applications", { form: applicationForm({ job: "astronaut" }) });
    assert.equal(unknown.status, 404);
  });

  it("enforces the upload size limit", async () => {
    const big = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(5 * 1024 * 1024 + 10)]);
    const r = await t.call("POST", "/api/applications", { form: applicationForm({}, { name: "big.pdf", type: "application/pdf", bytes: big }) });
    assert.equal(r.status, 413);
    assert.equal(r.data.error, "file_too_large");
  });

  it("records the intern track-free application and the visit attribution", async () => {
    const b = beacon({ path: "/careers" });
    await t.call("POST", "/api/collect", { headers: { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.4 Safari/605.1.15" }, body: JSON.stringify(b.payload) });
    const r = await t.call("POST", "/api/applications", { form: applicationForm({ job: "vlsi-prototyping-intern", track: undefined, visitorId: b.vid, sessionId: b.sid }) });
    assert.equal(r.status, 201);
    const row = (await t.db.query("SELECT * FROM applications")).rows[0];
    assert.equal(row.job_slug, "vlsi-prototyping-intern");
    assert.equal(row.channel, "social");
  });

  it("silently drops honeypot applications", async () => {
    const r = await t.call("POST", "/api/applications", { form: applicationForm({ website: "spam" }) });
    assert.equal(r.status, 201);
    assert.equal((await t.db.query("SELECT count(*)::int AS n FROM applications")).rows[0].n, 0);
  });
});

describe("rate limiting", () => {
  it("throttles repeated form posts with a clear message", async () => {
    const limited = await startServer({ db: t.db, overrides: { rateLimit: { limit: 3, windowMs: 60_000 } } });
    try {
      const codes = [];
      for (let i = 0; i < 5; i += 1) codes.push((await limited.call("POST", "/api/subscribe", { body: { email: `a${i}@example.com` } })).status);
      assert.deepEqual(codes, [201, 201, 201, 429, 429]);
    } finally {
      await limited.close();
    }
  });
});
