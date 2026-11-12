import { createApp } from "../app.js";
import { loadConfig } from "../config.js";
import { createDb } from "../db/index.js";
import { migrate, seedMilestones } from "../db/migrate.js";
import { hashPassword } from "../services/auth.js";

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

const TRUNCATE = `TRUNCATE contacts, applications, application_files, subscribers, page_views, events, sessions, visitors,
                           admin_sessions, audit_log, admin_users RESTART IDENTITY CASCADE`;

/**
 * Boot the whole API on an ephemeral port against `db`, with a recording mailer.
 * `reset()` empties every table except the milestone seed, so each test starts clean.
 */
export async function startServer({ db, overrides = {} } = {}) {
  const ownDb = !db;
  db ??= await openTestDb();
  const config = loadConfig({ NODE_ENV: "test" }, { databaseUrl: "", pgliteDir: "", rateLimit: { limit: 1000 }, admin: { loginLimit: 1000 }, analytics: { collectLimit: 100000 }, ...overrides });
  const mails = [];
  const mailer = { enabled: true, send: async (mail) => (mails.push(mail), true) };
  const { app, repos } = createApp({ config, db, log: quiet, mailer });
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

  async function createAdmin({ email = ADMIN.email, password = ADMIN.password } = {}) {
    return repos.admin.createUser({ email, name: "Test Admin", passwordHash: await hashPassword(password) });
  }

  /** Create the admin (if needed), sign in, and return the cookie header value. */
  async function login({ email = ADMIN.email, password = ADMIN.password } = {}) {
    if (!(await repos.admin.findByEmail(email))) await createAdmin({ email, password });
    const response = await call("POST", "/api/admin/login", { admin: true, body: { email, password } });
    if (response.status !== 200) throw new Error(`login failed: ${response.status} ${JSON.stringify(response.data)}`);
    return response.headers.get("set-cookie").split(";")[0];
  }

  return {
    base, db, repos, config, mails, call, createAdmin, login,
    reset: async () => {
      mails.length = 0;
      await db.exec(TRUNCATE);
    },
    close: async () => {
      await new Promise((resolve) => server.close(resolve));
      if (ownDb) await db.close();
    },
  };
}

export const uuid = () => crypto.randomUUID();

export const PDF = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n");
export const DOCX = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.alloc(64, 7)]);

export function applicationForm(fields = {}, file = { name: "resume.pdf", type: "application/pdf", bytes: PDF }) {
  const form = new FormData();
  const values = { job: "vlsi-engineer", name: "Priya Patil", email: "Priya@Example.com", phone: "+91 98765 43210", track: "digital", consent: "true", ...fields };
  for (const [key, value] of Object.entries(values)) if (value !== undefined && value !== null) form.set(key, value);
  if (file) form.set("resume", new Blob([file.bytes], { type: file.type }), file.name);
  return form;
}

export const IOS_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";

/** A well-formed analytics beacon. */
export function beacon({ vid = uuid(), sid = uuid(), path = "/products", extra = [], ctx = {} } = {}) {
  return {
    vid,
    sid,
    payload: {
      v: 1, vid, sid,
      ctx: { start: Date.now(), landing: path, ref: "https://www.linkedin.com/feed/", utm: { source: "linkedin", medium: "social", campaign: "launch" }, lang: "en-IN", tz: "Asia/Kolkata", sw: 390, sh: 844, vw: 390, dpr: 3, tp: 5, ...ctx },
      ev: [{ t: "pv", ts: Date.now(), p: path, ti: "Products" }, ...extra],
    },
  };
}
