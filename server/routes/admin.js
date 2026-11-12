import express, { Router } from "express";
import rateLimit from "express-rate-limit";

import { APPLICATION_STATUSES, CONTACT_STATUSES, SUBSCRIBER_STATUSES } from "../../shared/crm.js";
import { ids } from "../../shared/market.js";
import { STATUS_LABELS } from "../../shared/milestones.js";
import { HttpError } from "../lib/errors.js";
import { isUuid, isoDate, text } from "../lib/validate.js";
import {
  COOKIE, burnTime, clearCookie, newToken, readCookie, sessionCookie, sha256, verifyPassword,
} from "../services/auth.js";
import { COLUMNS, toCsv } from "../services/csv.js";
import { previousRange, resolveRange } from "../services/ranges.js";

const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;
const EXPORT_CAP = { contacts: 20_000, applications: 20_000, subscribers: 50_000, sessions: 50_000, events: 50_000 };
const CHUNK = 2_000;

const str = (value, max = 100) => (typeof value === "string" && value.trim() ? value.trim().slice(0, max) : undefined);
const paging = (query) => ({
  limit: Math.min(Math.max(Number.parseInt(query.limit, 10) || 25, 1), 200),
  offset: Math.max(Number.parseInt(query.offset, 10) || 0, 0),
});
const oneOfIds = (list, value) => (typeof value === "string" && ids(list).includes(value) ? value : undefined);

const invalid = (errors) => new HttpError(400, "validation_failed", "Please check the highlighted fields.", { errors });
const notFound = () => new HttpError(404, "not_found", "Not found.");

export function createAdminRouter({ config, repos, log }) {
  const router = Router();
  const { admin, leads, analytics, milestones, reports } = repos;
  const tz = config.analytics.timezone;

  const secureCookie = (req) => {
    const mode = config.admin.secureCookie;
    if (mode === "true") return true;
    if (mode === "false") return false;
    return config.env === "production" || req.secure;
  };

  // Nothing in the console is ever cached by the browser or a proxy.
  router.use((_req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.set("X-Robots-Tag", "noindex, nofollow");
    next();
  });

  // CSRF: the session cookie is SameSite=Strict, and every state-changing request must also carry a
  // custom header. A cross-site page cannot set one without a CORS preflight, which we never grant.
  router.use((req, _res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    if (req.get("x-zenitheum-admin") !== "1") throw new HttpError(403, "csrf", "Missing request header.");
    return next();
  });

  router.use(express.json({ limit: "20kb" }));

  // ---- Sign in / out -----------------------------------------------------------------------------

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: config.admin.loginLimit,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res) =>
      res.status(429).json({ ok: false, error: "rate_limited", message: "Too many sign-in attempts. Try again in a few minutes." }),
  });

  router.post("/login", loginLimiter, async (req, res) => {
    const body = req.body ?? {};
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
    const password = typeof body.password === "string" ? body.password.slice(0, 200) : "";
    const refuse = () =>
      new HttpError(401, "invalid_credentials", "Incorrect email or password, or the account is temporarily locked after repeated failures.");

    if (!email || !password) throw refuse();
    const user = await admin.findByEmail(email);

    // Unknown address and locked account cost the same time as a wrong password.
    if (!user || (user.lockedUntil && new Date(user.lockedUntil) > new Date())) {
      await burnTime(password);
      await admin.audit(user?.id, "login_refused", "admin", user?.id ?? null, { known: Boolean(user) });
      throw refuse();
    }
    if (!(await verifyPassword(password, user.passwordHash))) {
      await admin.recordFailure(user.id, { maxFailures: MAX_FAILURES, lockMinutes: LOCK_MINUTES });
      await admin.audit(user.id, "login_failed", "admin", user.id);
      throw refuse();
    }

    await admin.recordSuccess(user.id);
    const token = newToken();
    await admin.createSession({ tokenHash: sha256(token), adminId: user.id, hours: config.admin.sessionHours, userAgent: req.get("user-agent") });
    await admin.audit(user.id, "login", "admin", user.id);
    res.set("Set-Cookie", sessionCookie(token, { hours: config.admin.sessionHours, secure: secureCookie(req) }));
    res.json({ ok: true, admin: { email: user.email, name: user.name } });
  });

  router.post("/logout", async (req, res) => {
    const token = readCookie(req.headers.cookie, COOKIE);
    if (token) {
      const session = await admin.findSession(sha256(token));
      await admin.deleteSession(sha256(token));
      if (session) await admin.audit(session.id, "logout", "admin", session.id);
    }
    res.set("Set-Cookie", clearCookie({ secure: secureCookie(req) }));
    res.json({ ok: true });
  });

  // ---- Everything below needs a signed-in administrator -------------------------------------------

  router.use(async (req, _res, next) => {
    const token = readCookie(req.headers.cookie, COOKIE);
    const session = token ? await admin.findSession(sha256(token)) : null;
    if (!session) throw new HttpError(401, "unauthenticated", "Please sign in.");
    req.admin = session;
    next();
  });

  const audit = (req, action, entity, entityId, detail) => admin.audit(req.admin.id, action, entity, entityId, detail);

  const idParam = (req) => {
    if (!isUuid(req.params.id)) throw notFound();
    return req.params.id.toLowerCase();
  };

  /** ?from=YYYY-MM-DD&to=YYYY-MM-DD in the business time zone -> exact instants for the repositories. */
  async function windowOf(query) {
    const errors = {};
    const from = isoDate({ label: "From", required: false })(query.from);
    const to = isoDate({ label: "To", required: false })(query.to);
    if (from.error) errors.from = from.error;
    if (to.error) errors.to = to.error;
    if (Object.keys(errors).length) throw invalid(errors);
    if (!from.value && !to.value) return {};
    const edge = await reports.bounds({ fromDate: from.value ?? "2000-01-01", toDate: to.value ?? "2999-12-31" });
    return { from: from.value ? edge.from : undefined, to: to.value ? edge.to : undefined };
  }

  router.get("/me", (req, res) => {
    res.json({ ok: true, admin: { email: req.admin.email, name: req.admin.name } });
  });

  // ---- Dashboard ------------------------------------------------------------------------------------

  router.get("/overview", async (req, res) => {
    const range = resolveRange(req.query, tz);
    const [overview, pipeline] = await Promise.all([reports.overview(range, previousRange(range)), reports.pipeline()]);
    res.json({ ...overview, pipeline });
  });

  router.get("/campaigns", async (req, res) => {
    res.json(await reports.campaigns(resolveRange(req.query, tz)));
  });

  router.get("/audience", async (req, res) => {
    res.json(await reports.audience(resolveRange(req.query, tz)));
  });

  // ---- Leads ----------------------------------------------------------------------------------------

  const contactFilters = async (query) => ({
    status: oneOfIds(CONTACT_STATUSES, query.status),
    topic: str(query.topic, 40),
    segment: str(query.segment, 40),
    chip: str(query.chip, 20),
    channel: str(query.channel, 20),
    q: str(query.q, 80),
    ...(await windowOf(query)),
  });

  const applicationFilters = async (query) => ({
    job: str(query.job, 60),
    status: oneOfIds(APPLICATION_STATUSES, query.status),
    track: str(query.track, 40),
    channel: str(query.channel, 20),
    q: str(query.q, 80),
    ...(await windowOf(query)),
  });

  const subscriberFilters = (query) => ({ status: oneOfIds(SUBSCRIBER_STATUSES, query.status), q: str(query.q, 80) });

  const sessionFilters = async (query) => ({
    channel: str(query.channel, 20),
    device: str(query.device, 20),
    converted: query.converted === "1" || query.converted === "true",
    ...(await windowOf(query)),
  });

  const eventFilters = async (query) => ({ name: str(query.name, 40), ...(await windowOf(query)) });

  /** The notes field distinguishes "not sent" (leave alone) from "" (clear it). */
  function patchOf(body, statuses) {
    const errors = {};
    const patch = {};
    if (body?.status !== undefined) {
      if (typeof body.status === "string" && ids(statuses).includes(body.status)) patch.status = body.status;
      else errors.status = "Status is not a valid choice.";
    }
    if (body?.notes !== undefined) {
      const notes = text({ label: "Notes", max: 5000, multiline: true })(body.notes);
      if (notes.error) errors.notes = notes.error;
      else patch.notes = notes.value;
    }
    if (Object.keys(errors).length) throw invalid(errors);
    if (!Object.keys(patch).length) throw new HttpError(400, "empty_update", "Nothing to update.");
    return patch;
  }

  router.get("/contacts", async (req, res) => {
    res.json(await leads.listContacts({ ...(await contactFilters(req.query)), ...paging(req.query) }));
  });
  router.patch("/contacts/:id", async (req, res) => {
    const id = idParam(req);
    const patch = patchOf(req.body, CONTACT_STATUSES);
    const row = await leads.updateContact(id, patch);
    if (!row) throw notFound();
    await audit(req, "contact_updated", "contact", id, { status: patch.status, notes: patch.notes !== undefined });
    res.json({ ok: true, contact: row });
  });
  router.delete("/contacts/:id", async (req, res) => {
    const id = idParam(req);
    if (!(await leads.deleteContact(id))) throw notFound();
    await audit(req, "contact_deleted", "contact", id);
    res.json({ ok: true });
  });

  router.get("/applications", async (req, res) => {
    res.json(await leads.listApplications({ ...(await applicationFilters(req.query)), ...paging(req.query) }));
  });
  router.patch("/applications/:id", async (req, res) => {
    const id = idParam(req);
    const patch = patchOf(req.body, APPLICATION_STATUSES);
    const row = await leads.updateApplication(id, patch);
    if (!row) throw notFound();
    await audit(req, "application_updated", "application", id, { status: patch.status, notes: patch.notes !== undefined });
    res.json({ ok: true, application: row });
  });
  router.delete("/applications/:id", async (req, res) => {
    const id = idParam(req);
    if (!(await leads.deleteApplication(id))) throw notFound();
    await audit(req, "application_deleted", "application", id);
    res.json({ ok: true });
  });
  router.get("/applications/:id/resume", async (req, res) => {
    const id = idParam(req);
    const file = await leads.getResume(id);
    if (!file) throw notFound();
    await audit(req, "resume_downloaded", "application", id);
    // RFC 5987 form keeps non-ASCII names intact; the plain filename is an ASCII fallback.
    const ascii = file.filename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
    res.set({
      "Content-Type": file.mimeType,
      "Content-Length": String(file.content.length),
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
    });
    res.send(file.content);
  });

  router.get("/subscribers", async (req, res) => {
    res.json(await leads.listSubscribers({ ...subscriberFilters(req.query), ...paging(req.query) }));
  });
  router.patch("/subscribers/:id", async (req, res) => {
    const id = idParam(req);
    const status = req.body?.status;
    if (typeof status !== "string" || !ids(SUBSCRIBER_STATUSES).includes(status)) throw invalid({ status: "Status is not a valid choice." });
    const row = await leads.setSubscriberStatus(id, status);
    if (!row) throw notFound();
    await audit(req, "subscriber_updated", "subscriber", id, { status });
    res.json({ ok: true, subscriber: row });
  });
  router.delete("/subscribers/:id", async (req, res) => {
    const id = idParam(req);
    if (!(await leads.deleteSubscriber(id))) throw notFound();
    await audit(req, "subscriber_deleted", "subscriber", id);
    res.json({ ok: true });
  });

  // ---- Website activity -----------------------------------------------------------------------------

  router.get("/sessions", async (req, res) => {
    res.json(await analytics.listSessions({ ...(await sessionFilters(req.query)), ...paging(req.query) }));
  });
  router.get("/sessions/:id", async (req, res) => {
    const detail = await analytics.getSession(idParam(req));
    if (!detail) throw notFound();
    res.json(detail);
  });
  router.get("/events", async (req, res) => {
    const [list, names] = await Promise.all([
      analytics.listEvents({ ...(await eventFilters(req.query)), ...paging(req.query) }),
      analytics.eventNames(),
    ]);
    res.json({ ...list, names });
  });

  /** Erase everything stored about one visitor (a right-to-erasure request). Leads keep what the person typed. */
  router.delete("/visitors/:id", async (req, res) => {
    const id = idParam(req);
    const erased = await analytics.eraseVisitor(id);
    await audit(req, "visitor_erased", "visitor", id, { found: erased });
    res.json({ ok: true, erased });
  });

  // ---- Roadmap milestones ---------------------------------------------------------------------------

  router.get("/milestones", async (_req, res) => {
    res.json({ milestones: await milestones.list(), statuses: Object.entries(STATUS_LABELS).map(([id, label]) => ({ id, label })) });
  });

  router.patch("/milestones/:id", async (req, res) => {
    const id = String(req.params.id);
    if (!/^[A-Za-z0-9-]{2,24}$/.test(id)) throw notFound();
    const body = req.body ?? {};
    const errors = {};
    const patch = {};

    if (body.status !== undefined) {
      if (Object.hasOwn(STATUS_LABELS, body.status)) patch.status = body.status;
      else errors.status = "Status is not a valid choice.";
    }
    for (const [field, label] of [["targetDate", "Target date"], ["completedOn", "Completed on"]]) {
      if (body[field] === undefined || body[field] === null || body[field] === "") continue;
      const result = isoDate({ label })(body[field]);
      if (result.error) errors[field] = result.error;
      else patch[field] = result.value;
    }
    if (body.detail !== undefined) {
      const detail = text({ label: "Detail", max: 600, multiline: true })(body.detail);
      if (detail.error) errors.detail = detail.error;
      else patch.detail = detail.value;
    }
    if (Object.keys(errors).length) throw invalid(errors);
    if (!Object.keys(patch).length) throw new HttpError(400, "empty_update", "Nothing to update.");

    const row = await milestones.update(id, patch);
    if (!row) throw notFound();
    await audit(req, "milestone_updated", "milestone", id, patch);
    res.json({ ok: true, milestone: row });
  });

  // ---- CSV export (the marketing team's hand-off) ---------------------------------------------------

  const EXPORTS = {
    contacts: async (query) => {
      const filters = await contactFilters(query);
      return (extra) => leads.listContacts({ ...filters, ...extra });
    },
    applications: async (query) => {
      const filters = await applicationFilters(query);
      return (extra) => leads.listApplications({ ...filters, ...extra });
    },
    subscribers: async (query) => {
      const filters = subscriberFilters(query);
      return (extra) => leads.listSubscribers({ ...filters, ...extra });
    },
    sessions: async (query) => {
      const filters = await sessionFilters(query);
      return (extra) => analytics.listSessions({ ...filters, ...extra });
    },
    events: async (query) => {
      const filters = await eventFilters(query);
      return (extra) => analytics.listEvents({ ...filters, ...extra });
    },
  };

  router.get("/export/:kind", async (req, res) => {
    const kind = String(req.params.kind);
    if (!Object.hasOwn(EXPORTS, kind)) throw notFound();
    const fetchPage = await EXPORTS[kind](req.query);

    const cap = EXPORT_CAP[kind];
    const rows = [];
    while (rows.length < cap) {
      const chunk = (await fetchPage({ limit: CHUNK, offset: rows.length, maxLimit: CHUNK })).rows;
      rows.push(...chunk);
      if (chunk.length < CHUNK) break;
    }
    rows.length = Math.min(rows.length, cap);

    await audit(req, "export", kind, null, { rows: rows.length });
    log.info?.(`[admin] export ${kind}: ${rows.length} rows`);
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
    res.set({
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="zenitheum-${kind}-${day}.csv"`,
    });
    res.send(toCsv(rows, COLUMNS[kind], { timeZone: tz }));
  });

  router.get("/audit", async (_req, res) => {
    res.json({ rows: await admin.listAudit(100) });
  });

  // Anything else under /api/admin that matched nothing above.
  router.use((_req, res) => {
    res.status(404).json({ ok: false, error: "not_found", message: "Unknown API route." });
  });

  return router;
}
