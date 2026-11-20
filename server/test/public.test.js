import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import { DOCX, PDF, applicationForm, demoBody, fakeGoogle, orderBody, startServer } from "./helpers.js";

let t;
before(async () => {
  t = await startServer();
});
after(() => t.close());
beforeEach(() => t.reset());

const count = async (table) => (await t.db.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n;

describe("read-only content", () => {
  it("reports health including the database kind", async () => {
    const r = await t.call("GET", "/api/health");
    assert.equal(r.status, 200);
    assert.ok(["pglite", "postgres"].includes(r.data.db));
  });

  it("serves the jobs; the internship starts on 1 February, pays ₹10,000 a month and can become full-time", async () => {
    assert.equal((await t.call("GET", "/api/jobs")).data.jobs.length, 9);
    const { job } = (await t.call("GET", "/api/jobs/analog-design-intern")).data;
    assert.equal(job.stipend, "₹10,000 per month");
    assert.equal(job.start, "1 February 2027");
    assert.match(job.duration, /1 Feb – 31 Mar 2027/);
    assert.match(job.duration, /full-time/);
    assert.equal((await t.call("GET", "/api/jobs/astronaut")).status, 404);
  });

  it("serves a short list of broad milestones from the database", async () => {
    const { milestones } = (await t.call("GET", "/api/milestones")).data;
    assert.equal(milestones.length, 8);
    assert.ok(milestones.some((m) => m.status === "completed"));
    const programme = milestones.find((m) => m.title === "Design programme starts");
    assert.equal(programme.targetDate, "2027-02-01", "the plan starts on 1 February");
    const dates = milestones.map((m) => m.targetDate);
    assert.deepEqual(dates, [...dates].sort(), "listed in date order");
    assert.equal(dates.at(-1), "2028-02-29");
    assert.match(milestones[0].targetDate, /^\d{4}-\d{2}-\d{2}$/);
  });

  it("answers unknown API routes with JSON, and the removed analytics beacon is gone", async () => {
    assert.equal((await t.call("GET", "/api/nope")).data.error, "not_found");
    assert.equal((await t.call("POST", "/api/collect", { body: "{}" })).status, 404);
    assert.equal((await t.call("GET", "/api/roadmap")).status, 404);
  });
});

describe("book a demo", () => {
  it("stores the request, asks for nothing about a calendar, and e-mails the team and the customer", async () => {
    const r = await t.call("POST", "/api/demos", { body: demoBody() });
    assert.equal(r.status, 201);
    assert.match(r.data.id, /^ZT-[0-9A-F]{8}$/);
    assert.deepEqual(Object.keys(r.data).sort(), ["id", "ok"], "no slot, no meeting link");
    const row = (await t.db.query("SELECT *, preferred_date::text AS preferred_date FROM demos")).rows[0];
    assert.equal(row.status, "requested");
    assert.equal(row.email, "asha@example.com");
    assert.equal(row.chip, "both");
    assert.equal(row.analog_format, "hard");
    assert.equal(row.preferred_date, demoBody().preferredDate);
    assert.equal(row.preferred_time, "afternoon");
    assert.equal(t.mails.length, 2);
    assert.equal(t.mails[0].to, "zenitheumsolutions@gmail.com");
    assert.match(t.mails[0].text, /ZT-AFE1 delivery: Hard IP/);
    assert.match(t.mails[0].text, /ZT-SEC1: soft IP licence/);
    assert.match(t.mails[0].text, /Afternoon/);
    assert.equal(t.mails[1].to, "asha@example.com");
    assert.match(t.mails[1].subject, /^We received your demo request ZT-/);
  });

  it("has no booking calendar any more", async () => {
    assert.equal((await t.call("GET", "/api/demos/slots")).status, 404);
    const cols = (await t.db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'demos'")).rows.map((c) => c.column_name);
    for (const gone of ["slot_start", "slot_end", "meet_link", "calendar_event_id", "visitor_timezone"]) assert.ok(!cols.includes(gone), gone);
  });

  it("lets two customers ask for the same day: it is only a preference", async () => {
    const results = await Promise.all([t.call("POST", "/api/demos", { body: demoBody({ email: "a@example.com" }) }), t.call("POST", "/api/demos", { body: demoBody({ email: "b@example.com" }) })]);
    assert.deepEqual(results.map((r) => r.status), [201, 201]);
    assert.equal(await count("demos"), 2);
  });

  it("makes the preferred day and time optional, but checks them when given", async () => {
    assert.equal((await t.call("POST", "/api/demos", { body: demoBody({ preferredDate: "", preferredTime: "" }) })).status, 201);
    const row = (await t.db.query("SELECT preferred_date, preferred_time FROM demos")).rows[0];
    assert.deepEqual(row, { preferred_date: null, preferred_time: null });
    const past = await t.call("POST", "/api/demos", { body: demoBody({ preferredDate: "2020-01-01" }) });
    assert.ok(past.data.errors.preferredDate, "a day in the past is refused");
    assert.ok((await t.call("POST", "/api/demos", { body: demoBody({ preferredDate: "2027-02-30" }) })).data.errors.preferredDate, "a date that does not exist");
    assert.ok((await t.call("POST", "/api/demos", { body: demoBody({ preferredTime: "midnight" }) })).data.errors.preferredTime);
  });

  it("requires a delivery format only when ZT-AFE1 is involved (ZT-SEC1 is soft IP only)", async () => {
    const bad = await t.call("POST", "/api/demos", { body: demoBody({ analogFormat: "" }) });
    assert.equal(bad.status, 400);
    assert.ok(bad.data.errors.analogFormat);
    const digital = await t.call("POST", "/api/demos", { body: demoBody({ chip: "digital", analogFormat: "hard" }) });
    assert.equal(digital.status, 201);
    assert.equal((await t.db.query("SELECT analog_format FROM demos")).rows[0].analog_format, null, "digital is soft IP only: no format is stored");
  });

  it("requires the details a sales call needs", async () => {
    const r = await t.call("POST", "/api/demos", { body: { chip: "analog", analogFormat: "soft" } });
    assert.deepEqual(Object.keys(r.data.errors).sort(), ["consent", "email", "name", "organisation", "phone"]);
  });

  it("works whether or not Google is connected", async () => {
    const plain = await startServer({ db: t.db, google: fakeGoogle({ enabled: false }) });
    try {
      assert.equal((await plain.call("POST", "/api/demos", { body: demoBody() })).status, 201);
    } finally {
      await plain.close();
    }
  });

  it("drops honeypot submissions", async () => {
    const r = await t.call("POST", "/api/demos", { body: demoBody({ website: "spam" }) });
    assert.equal(r.status, 201);
    assert.equal(await count("demos"), 0);
  });
});

describe("place an order", () => {
  it("stores the order with every detail, notifies the team and confirms to the customer", async () => {
    const r = await t.call("POST", "/api/orders", { body: orderBody() });
    assert.equal(r.status, 201);
    assert.match(r.data.id, /^ZT-[0-9A-F]{8}$/);
    const row = (await t.db.query("SELECT *, delivery_date::text AS dd FROM orders")).rows[0];
    assert.equal(row.contact_name, "Ravi Kumar");
    assert.equal(row.email, "ravi@example.com");
    assert.equal(row.chip, "analog");
    assert.equal(row.analog_format, "both");
    assert.equal(row.quantity, 500);
    assert.match(row.dd, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(row.delivery_location, /Nashik/);
    assert.equal(row.status, "new");
    assert.equal(t.mails.length, 2);
    assert.equal(t.mails[0].to, "zenitheumsolutions@gmail.com");
    assert.equal(t.mails[1].to, "ravi@example.com");
    assert.match(t.mails[1].subject, /order request/);
  });

  it("validates quantity, delivery date, location and the single-chip rule", async () => {
    const past = await t.call("POST", "/api/orders", { body: orderBody({ deliveryDate: "2020-01-01", quantity: 0, deliveryLocation: "", contactName: "" }) });
    assert.deepEqual(Object.keys(past.data.errors).sort(), ["contactName", "deliveryDate", "deliveryLocation", "quantity"]);
    assert.equal((await t.call("POST", "/api/orders", { body: orderBody({ chip: "both" }) })).status, 400, "one chip per order");
    assert.ok((await t.call("POST", "/api/orders", { body: orderBody({ analogFormat: "" }) })).data.errors.analogFormat, "ZT-AFE1 needs soft / hard / both");
    assert.equal(await count("orders"), 0);
  });

  it("orders ZT-SEC1 as a soft-IP licence with no format choice", async () => {
    const r = await t.call("POST", "/api/orders", { body: orderBody({ chip: "digital", analogFormat: "hard", quantity: 2 }) });
    assert.equal(r.status, 201);
    const row = (await t.db.query("SELECT * FROM orders")).rows[0];
    assert.equal(row.analog_format, null);
    assert.match(t.mails[0].text, /ZT-SEC1: soft IP licence/);
  });

  it("drops honeypot orders", async () => {
    assert.equal((await t.call("POST", "/api/orders", { body: orderBody({ website: "x" }) })).status, 201);
    assert.equal(await count("orders"), 0);
  });
});

describe("questions", () => {
  it("stores a question and notifies the team", async () => {
    const r = await t.call("POST", "/api/contact", { body: { name: "Rohan", email: "R@Example.com", message: "Do you support RTD sensors?", segment: "instrumentation", chip: "analog", consent: true } });
    assert.equal(r.status, 201);
    const row = (await t.db.query("SELECT * FROM contacts")).rows[0];
    assert.equal(row.email, "r@example.com");
    assert.equal(row.segment, "instrumentation");
    assert.equal(t.mails.length, 1);
  });

  it("stores a customisation request with the chip and its delivery format (analog only)", async () => {
    const body = (extra) => ({ name: "Meera", email: "meera@example.com", message: "We need 8 channels and an SPI interface.", topic: "customisation", consent: true, ...extra });
    const noChip = await t.call("POST", "/api/contact", { body: body({}) });
    assert.equal(noChip.status, 400);
    assert.ok(noChip.data.errors.chip);
    const noFormat = await t.call("POST", "/api/contact", { body: body({ chip: "analog" }) });
    assert.equal(noFormat.status, 400);
    assert.ok(noFormat.data.errors.analogFormat, "analog needs soft / hard / both");

    assert.equal((await t.call("POST", "/api/contact", { body: body({ chip: "analog", analogFormat: "hard" }) })).status, 201);
    assert.equal((await t.call("POST", "/api/contact", { body: body({ chip: "digital", analogFormat: "hard" }) })).status, 201);
    const rows = (await t.db.query("SELECT topic, chip, analog_format FROM contacts ORDER BY created_at")).rows;
    assert.deepEqual(rows, [
      { topic: "customisation", chip: "analog", analog_format: "hard" },
      { topic: "customisation", chip: "digital", analog_format: null },
    ]);
    assert.match(t.mails.at(-1).subject, /^\[Customisation request\]/);
    assert.match(t.mails.at(-2).text, /ZT-AFE1 delivery: Hard IP/);
  });

  it("keeps ordinary questions as questions", async () => {
    await t.call("POST", "/api/contact", { body: { name: "Rohan", email: "r@example.com", message: "Do you support RTD sensors?", consent: true } });
    assert.equal((await t.db.query("SELECT topic FROM contacts")).rows[0].topic, "question");
    assert.equal((await t.call("POST", "/api/contact", { body: { name: "Rohan", email: "r@example.com", message: "Do you support RTD sensors?", topic: "spam", consent: true } })).status, 400);
  });

  it("reports every invalid field at once, and strips header-injection characters", async () => {
    const r = await t.call("POST", "/api/contact", { body: { name: "A", email: "nope", message: "short", segment: "made-up" } });
    assert.deepEqual(Object.keys(r.data.errors).sort(), ["consent", "email", "message", "name", "segment"]);
    await t.call("POST", "/api/contact", { body: { name: "Eve\r\nBcc: boss@example.com", email: "e@example.com", message: "A perfectly fine question.", consent: true } });
    assert.ok(!/[\r\n]/.test(t.mails[0].subject));
  });

  it("rejects malformed and oversized JSON", async () => {
    const bad = await fetch(`${t.base}/api/contact`, { method: "POST", headers: { "content-type": "application/json" }, body: "{nope" });
    assert.equal(bad.status, 400);
    assert.equal((await t.call("POST", "/api/contact", { body: { name: "x".repeat(60_000) } })).status, 413);
  });
});

describe("chip release news", () => {
  it("records the chip and ZT-AFE1 delivery preference, once per address", async () => {
    const first = await t.call("POST", "/api/subscribe", { body: { email: "Fan@Example.com", name: "Fan", chip: "both", analogFormat: "soft", source: "footer" } });
    const again = await t.call("POST", "/api/subscribe", { body: { email: "fan@example.com", chip: "digital", source: "footer" } });
    assert.equal(first.status, 201);
    assert.deepEqual(again.data, first.data);
    const rows = (await t.db.query("SELECT * FROM subscribers")).rows;
    assert.equal(rows.length, 1);
    assert.equal(rows[0].chip, "digital", "the latest preference wins");
    assert.equal(rows[0].analog_format, "soft", "an old format is kept when the new choice has none");
    assert.equal(t.mails.length, 1, "only the first sign-up notifies");
  });

  it("defaults to both chips and requires a format only when ZT-AFE1 is chosen", async () => {
    assert.equal((await t.call("POST", "/api/subscribe", { body: { email: "a@example.com" } })).status, 201);
    const row = (await t.db.query("SELECT * FROM subscribers")).rows[0];
    assert.equal(row.chip, "both");
    assert.equal(row.analog_format, "both");
    assert.equal((await t.call("POST", "/api/subscribe", { body: { email: "b@example.com", chip: "analog", analogFormat: "nope" } })).status, 400);
    assert.equal((await t.call("POST", "/api/subscribe", { body: { email: "nope" } })).status, 400);
  });

  it("reactivates an unsubscribed address that signs up again", async () => {
    await t.call("POST", "/api/subscribe", { body: { email: "x@example.com" } });
    await t.db.query("UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = now()");
    await t.call("POST", "/api/subscribe", { body: { email: "x@example.com" } });
    assert.equal((await t.db.query("SELECT status FROM subscribers")).rows[0].status, "active");
  });
});

describe("job applications", () => {
  it("stores the resume in Google Drive and keeps only its name and link in the database", async () => {
    const r = await t.call("POST", "/api/applications", { form: applicationForm() });
    assert.equal(r.status, 201);
    const app = (await t.db.query("SELECT * FROM applications")).rows[0];
    assert.equal(app.job_slug, "applications-integration-engineer");
    assert.equal(app.resume_name, "resume.pdf");
    assert.match(app.resume_url, /^https:\/\/drive\.google\.com\//);
    assert.equal(app.resume_file_id, "file-1");
    assert.equal(t.google.calls.uploads[0].mimeType, "application/pdf");
    assert.deepEqual(t.google.calls.uploads[0].buffer, PDF);
    assert.match(t.mails[0].text, /drive\.google\.com/);
    const tables = (await t.db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")).rows.map((x) => x.table_name);
    assert.ok(!tables.includes("application_files"), "no resumes in the database");
  });

  it("accepts a DOCX and identifies the file from its bytes", async () => {
    assert.equal((await t.call("POST", "/api/applications", { form: applicationForm({}, { name: "cv.docx", type: "application/octet-stream", bytes: DOCX }) })).status, 201);
    assert.match(t.google.calls.uploads[0].mimeType, /wordprocessingml/);
  });

  it("rejects files that are not documents, and uploads nothing", async () => {
    const r = await t.call("POST", "/api/applications", { form: applicationForm({}, { name: "resume.pdf", type: "application/pdf", bytes: Buffer.from("MZ not a pdf at all") }) });
    assert.equal(r.status, 400);
    assert.ok(r.data.errors.resume);
    assert.equal(t.google.calls.uploads.length, 0);
    assert.equal(await count("applications"), 0);
  });

  it("needs a resume or a profile link, and the right track", async () => {
    assert.ok((await t.call("POST", "/api/applications", { form: applicationForm({}, null) })).data.errors.resume);
    assert.equal((await t.call("POST", "/api/applications", { form: applicationForm({ profile: "github.com/priya" }, null) })).status, 201);
    assert.ok((await t.call("POST", "/api/applications", { form: applicationForm({ track: undefined }) })).data.errors.track);
    assert.ok((await t.call("POST", "/api/applications", { form: applicationForm({ track: "analog" }) })).data.errors.track, "only the tracks the role lists");
    assert.equal((await t.call("POST", "/api/applications", { form: applicationForm({ job: "astronaut" }) })).status, 404);
  });

  it("applies to the internship without a track", async () => {
    assert.equal((await t.call("POST", "/api/applications", { form: applicationForm({ job: "digital-design-intern", track: undefined }) })).status, 201);
  });

  it("enforces the upload size limit", async () => {
    const big = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(5 * 1024 * 1024 + 10)]);
    const r = await t.call("POST", "/api/applications", { form: applicationForm({}, { name: "big.pdf", type: "application/pdf", bytes: big }) });
    assert.equal(r.status, 413);
  });

  it("tells the applicant to retry when Drive fails, and stores nothing", async () => {
    const broken = await startServer({ db: t.db, google: fakeGoogle({ failUpload: true }) });
    try {
      const r = await broken.call("POST", "/api/applications", { form: applicationForm() });
      assert.equal(r.status, 503);
      assert.equal(r.data.error, "resume_storage_unavailable");
      assert.equal(await count("applications"), 0);
    } finally {
      await broken.close();
    }
  });

  it("in production refuses an upload it has nowhere to store, but still takes a profile link", async () => {
    const prod = await startServer({ db: t.db, google: fakeGoogle({ enabled: false }), overrides: { env: "production" } });
    try {
      assert.equal((await prod.call("POST", "/api/applications", { form: applicationForm() })).status, 503);
      assert.equal((await prod.call("POST", "/api/applications", { form: applicationForm({ profile: "github.com/p" }, null) })).status, 201);
    } finally {
      await prod.close();
    }
  });

  it("drops honeypot applications", async () => {
    assert.equal((await t.call("POST", "/api/applications", { form: applicationForm({ website: "spam" }) })).status, 201);
    assert.equal(await count("applications"), 0);
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
