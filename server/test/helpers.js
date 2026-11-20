import { createApp } from "../app.js";
import { loadConfig } from "../config.js";
import { createDb } from "../db/index.js";
import { migrate, seedMilestones } from "../db/migrate.js";

const quiet = { info() {}, warn() {}, error() {} };

export const ADMIN = { email: "admin@example.com", password: "correct horse battery staple" };

/** A fresh database: in-memory PGlite by default, or a real PostgreSQL when TEST_DATABASE_URL is set. */
export async function openTestDb() {
  const url = process.env.TEST_DATABASE_URL || "";
  const config = loadConfig({ NODE_ENV: "test" }, { databaseUrl: url, pgliteDir: "" });
  const db = await createDb(config, quiet);
  if (url) await db.exec("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  await migrate(db);
  await seedMilestones(db);
  return db;
}

const TRUNCATE = "TRUNCATE contacts, applications, subscribers, demos, orders RESTART IDENTITY CASCADE";

/** A stand-in for the Google integration that records what the API asked of it. */
export function fakeGoogle({ enabled = true, failMeeting = false, failUpload = false } = {}) {
  const calls = { meetings: [], uploads: [], cancelled: [] };
  return {
    enabled,
    calls,
    async createMeeting(input) {
      if (failMeeting) throw new Error("calendar down");
      calls.meetings.push(input);
      return { meetLink: "https://meet.google.com/abc-defg-hij", eventId: `evt-${calls.meetings.length}`, htmlLink: "https://calendar.google.com/x" };
    },
    async cancelMeeting(id) {
      calls.cancelled.push(id);
    },
    async uploadResume(input) {
      if (failUpload) throw new Error("drive down");
      calls.uploads.push(input);
      return { fileId: `file-${calls.uploads.length}`, url: `https://drive.google.com/file/d/file-${calls.uploads.length}/view` };
    },
    async sendMail() {},
  };
}

/**
 * Boot the whole API on an ephemeral port against `db`, with a recording mailer and a fake Google.
 * `reset()` empties every business table except the milestone seed, so each test starts clean.
 */
export async function startServer({ db, overrides = {}, google = fakeGoogle() } = {}) {
  const ownDb = !db;
  db ??= await openTestDb();
  const config = loadConfig({ NODE_ENV: "test" }, { databaseUrl: "", pgliteDir: "", rateLimit: { limit: 1000 }, admin: { ...ADMIN, loginLimit: 1000 }, ...overrides });
  const mails = [];
  const mailer = { enabled: true, send: async (mail) => (mails.push(mail), true) };
  const { app, repos } = createApp({ config, db, log: quiet, mailer, google });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;

  async function call(method, path, { body, form, cookie, admin, headers = {} } = {}) {
    const response = await fetch(base + path, {
      method,
      headers: {
        ...(body !== undefined ? { "content-type": typeof body === "string" ? "text/plain" : "application/json" } : {}),
        ...(cookie ? { cookie } : {}),
        ...(admin ? { "x-zenitheum-admin": "1" } : {}),
        ...headers,
      },
      body: form ?? (body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body)),
    });
    const type = response.headers.get("content-type") || "";
    const raw = Buffer.from(await response.arrayBuffer());
    const data = type.includes("json") ? JSON.parse(raw.toString("utf8") || "null") : type.startsWith("text/") ? raw.toString("utf8") : raw;
    return { status: response.status, data, headers: response.headers, raw };
  }

  /** Sign in to the console and return the cookie header value. */
  async function login({ email = ADMIN.email, password = ADMIN.password } = {}) {
    const response = await call("POST", "/api/admin/login", { admin: true, body: { email, password } });
    if (response.status !== 200) throw new Error(`login failed: ${response.status} ${JSON.stringify(response.data)}`);
    return response.headers.get("set-cookie").split(";")[0];
  }

  /** The first free demo slot (an ISO string). */
  async function freeSlot(skip = 0) {
    const { data } = await call("GET", "/api/demos/slots");
    return data.slots.filter((s) => s.available)[skip].start;
  }

  return {
    base, db, repos, config, mails, google, call, login, freeSlot,
    reset: async () => {
      mails.length = 0;
      google.calls.meetings.length = 0;
      google.calls.uploads.length = 0;
      google.calls.cancelled.length = 0;
      await db.exec(TRUNCATE);
    },
    close: async () => {
      await new Promise((resolve) => server.close(resolve));
      if (ownDb) await db.close();
    },
  };
}

export const PDF = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n");
export const DOCX = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.alloc(64, 7)]);

export function applicationForm(fields = {}, file = { name: "resume.pdf", type: "application/pdf", bytes: PDF }) {
  const form = new FormData();
  const values = { job: "vlsi-engineer", name: "Priya Patil", email: "Priya@Example.com", phone: "+91 98765 43210", track: "digital", consent: "true", ...fields };
  for (const [key, value] of Object.entries(values)) if (value !== undefined && value !== null) form.set(key, value);
  if (file) form.set("resume", new Blob([file.bytes], { type: file.type }), file.name);
  return form;
}

export const demoBody = (slot, extra = {}) => ({
  name: "Asha Rao",
  email: "Asha@Example.com",
  phone: "+91 98765 43210",
  organisation: "Acme Meters",
  jobTitle: "Head of Hardware",
  segment: "energy-metering",
  chip: "both",
  analogFormat: "hard",
  message: "We ship 50,000 meters a year and want a custom variant.",
  visitorTimezone: "Asia/Kolkata",
  slot,
  consent: true,
  ...extra,
});

export const orderBody = (extra = {}) => ({
  contactName: "Ravi Kumar",
  email: "Ravi@Example.com",
  phone: "+91 98765 43210",
  organisation: "Kumar Instruments",
  jobTitle: "Purchase manager",
  chip: "analog",
  analogFormat: "both",
  quantity: 500,
  deliveryDate: new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10),
  deliveryLocation: "Plot 12, MIDC, Nashik, Maharashtra",
  customisation: "8 channels, QFN-32 pin-out",
  notes: "Please confirm lead time.",
  consent: true,
  ...extra,
});
