import express, { Router } from "express";
import rateLimit from "express-rate-limit";

import { APPLICATION_STATUSES, CONTACT_STATUSES, DEMO_STATUSES, ORDER_STATUSES, SUBSCRIBER_STATUSES } from "../../shared/crm.js";
import { ids } from "../../shared/market.js";
import { STATUS_LABELS } from "../../shared/milestones.js";
import { HttpError } from "../lib/errors.js";
import { isUuid, isoDate, text } from "../lib/validate.js";
import {
  COOKIE, adminConfigured, checkCredentials, clearCookie, createThrottle, readCookie, sessionCookie, signSession, verifySession,
} from "../services/auth.js";
import { COLUMNS, toCsv } from "../services/csv.js";

const EXPORT_CAP = 50_000;
const CHUNK = 2_000;

const str = (value, max = 100) => (typeof value === "string" && value.trim() ? value.trim().slice(0, max) : undefined);
const paging = (query) => ({
  limit: Math.min(Math.max(Number.parseInt(query.limit, 10) || 25, 1), 200),
  offset: Math.max(Number.parseInt(query.offset, 10) || 0, 0),
});
const oneOfIds = (list, value) => (typeof value === "string" && ids(list).includes(value) ? value : undefined);

const invalid = (errors) => new HttpError(400, "validation_failed", "Please check the highlighted fields.", { errors });
const notFound = () => new HttpError(404, "not_found", "Not found.");

/**
 * Staff console API. One account (ADMIN_EMAIL / ADMIN_PASSWORD) and a signed, expiring cookie: nothing about staff
 * sign-ins is stored in the database.
 */
export function createAdminRouter({ config, repos, google, log }) {
  const router = Router();
  const { leads, demos, orders, milestones, overview } = repos;
  const throttle = createThrottle();

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

  // CSRF: the cookie is SameSite=Strict, and every state-changing request must also carry a custom header.
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
    handler: (_req, res) => res.status(429).json({ ok: false, error: "rate_limited", message: "Too many sign-in attempts. Try again in a few minutes." }),
  });

  router.post("/login", loginLimiter, (req, res) => {
    if (!adminConfigured(config)) {
      throw new HttpError(503, "not_configured", "The staff console is not set up yet: set ADMIN_EMAIL and ADMIN_PASSWORD on the server.");
    }
    const body = req.body ?? {};
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
    const password = typeof body.password === "string" ? body.password.slice(0, 200) : "";
    const refuse = () => new HttpError(401, "invalid_credentials", "Incorrect email or password, or too many failed attempts. Try again in 15 minutes.");

    const keys = [`email:${email}`, `ip:${req.ip}`];
    if (keys.some((key) => throttle.locked(key))) throw refuse();
    if (!checkCredentials(config, email, password)) {
      keys.forEach((key) => throttle.fail(key));
      throw refuse();
    }
    keys.forEach((key) => throttle.clear(key));
    res.set("Set-Cookie", sessionCookie(signSession(config), { hours: config.admin.sessionHours, secure: secureCookie(req) }));
    res.json({ ok: true, admin: { email: config.admin.email, name: null } });
  });

  router.post("/logout", (req, res) => {
    res.set("Set-Cookie", clearCookie({ secure: secureCookie(req) }));
    res.json({ ok: true });
  });

  // ---- Everything below needs a signed-in administrator -------------------------------------------

  router.use((req, _res, next) => {
    const session = verifySession(config, readCookie(req.headers.cookie, COOKIE));
    if (!session) throw new HttpError(401, "unauthenticated", "Please sign in.");
    req.admin = session;
    next();
  });

  const idParam = (req) => {
    if (!isUuid(req.params.id)) throw notFound();
    return req.params.id.toLowerCase();
  };

  /** ?from=YYYY-MM-DD&to=YYYY-MM-DD -> exact instants (India time). */
  function windowOf(query) {
    const errors = {};
    const from = isoDate({ label: "From", required: false })(query.from);
    const to = isoDate({ label: "To", required: false })(query.to);
    if (from.error) errors.from = from.error;
    if (to.error) errors.to = to.error;
    if (Object.keys(errors).length) throw invalid(errors);
    const at = (day, plus = 0) => (day ? new Date(Date.parse(`${day}T00:00:00+05:30`) + plus).toISOString() : undefined);
    return { from: at(from.value), to: at(to.value, 86_400_000) };
  }

  router.get("/me", (req, res) => {
    res.json({ ok: true, admin: { email: req.admin.email, name: null } });
  });

  // ---- Home ------------------------------------------------------------------------------------------

  router.get("/overview", async (_req, res) => {
    const [counts, upcoming, newOrders] = await Promise.all([overview.counts(), demos.list({ upcoming: true, limit: 8 }), orders.list({ status: "new", limit: 5 })]);
    res.json({ counts, upcomingDemos: upcoming.rows, newOrders: newOrders.rows });
  });

  /** status / notes patches: "not sent" leaves a field alone, "" clears it. */
  function patchOf(body, { statuses, notesField = "notes" }) {
    const errors = {};
    const patch = {};
    if (body?.status !== undefined) {
      if (typeof body.status === "string" && ids(statuses).includes(body.status)) patch.status = body.status;
      else errors.status = "Status is not a valid choice.";
    }
    if (body?.[notesField] !== undefined) {
      const notes = text({ label: "Notes", max: 5000, multiline: true })(body[notesField]);
      if (notes.error) errors[notesField] = notes.error;
      else patch[notesField] = notes.value;
    }
    if (Object.keys(errors).length) throw invalid(errors);
    if (!Object.keys(patch).length) throw new HttpError(400, "empty_update", "Nothing to update.");
    return patch;
  }

  // ---- Contacts ------------------------------------------------------------------------------------

  const contactFilters = (q) => ({ status: oneOfIds(CONTACT_STATUSES, q.status), segment: str(q.segment, 40), chip: str(q.chip, 20), q: str(q.q, 80), ...windowOf(q) });
  router.get("/contacts", async (req, res) => res.json(await leads.listContacts({ ...contactFilters(req.query), ...paging(req.query) })));
  router.patch("/contacts/:id", async (req, res) => {
    const row = await leads.updateContact(idParam(req), patchOf(req.body, { statuses: CONTACT_STATUSES }));
    if (!row) throw notFound();
    res.json({ ok: true, contact: row });
  });
  router.delete("/contacts/:id", async (req, res) => {
    if (!(await leads.deleteContact(idParam(req)))) throw notFound();
    res.json({ ok: true });
  });

  // ---- Demos ---------------------------------------------------------------------------------------

  const demoFilters = (q) => ({ status: oneOfIds(DEMO_STATUSES, q.status), chip: str(q.chip, 20), upcoming: q.upcoming === "1" || q.upcoming === "true", q: str(q.q, 80) });
  router.get("/demos", async (req, res) => res.json(await demos.list({ ...demoFilters(req.query), ...paging(req.query) })));
  router.patch("/demos/:id", async (req, res) => {
    const id = idParam(req);
    const patch = patchOf(req.body, { statuses: DEMO_STATUSES });
    const before = await demos.get(id);
    if (!before) throw notFound();
    const row = await demos.update(id, patch);
    // Cancelling a booked demo also cancels the calendar event (everyone is told).
    if (patch.status === "cancelled" && before.calendarEventId && google.enabled) {
      google.cancelMeeting(before.calendarEventId).catch((error) => log.error?.(`[demo] could not cancel the calendar event: ${error.message}`));
    }
    res.json({ ok: true, demo: row });
  });
  /** Create the Meet link for a demo whose automatic scheduling failed (or was not configured). */
  router.post("/demos/:id/meeting", async (req, res) => {
    const demo = await demos.get(idParam(req));
    if (!demo) throw notFound();
    if (!google.enabled) throw new HttpError(503, "google_not_configured", "Google is not connected on the server yet (see the README).");
    if (demo.meetLink) return res.json({ ok: true, demo });
    try {
      const meeting = await google.createMeeting({
        title: `Zenitheum demo — ${demo.organisation}`,
        description: `${demo.name} · ${demo.email} · ${demo.phone}\n\n${demo.message || ""}`.trim(),
        startIso: new Date(demo.slotStart).toISOString(),
        endIso: new Date(demo.slotEnd).toISOString(),
        attendees: [...new Set([demo.email, config.google.teamEmail])],
      });
      return res.json({ ok: true, demo: await demos.setMeeting(demo.id, { meetLink: meeting.meetLink, eventId: meeting.eventId }) });
    } catch (error) {
      log.error?.(`[demo] manual meeting creation failed: ${error.message}`);
      throw new HttpError(502, "google_failed", "Google did not create the meeting. Check the server log.");
    }
  });
  router.delete("/demos/:id", async (req, res) => {
    if (!(await demos.delete(idParam(req)))) throw notFound();
    res.json({ ok: true });
  });

  // ---- Orders --------------------------------------------------------------------------------------

  const orderFilters = (q) => ({ status: oneOfIds(ORDER_STATUSES, q.status), chip: str(q.chip, 20), q: str(q.q, 80) });
  router.get("/orders", async (req, res) => res.json(await orders.list({ ...orderFilters(req.query), ...paging(req.query) })));
  router.patch("/orders/:id", async (req, res) => {
    const row = await orders.update(idParam(req), patchOf(req.body, { statuses: ORDER_STATUSES, notesField: "internalNotes" }));
    if (!row) throw notFound();
    res.json({ ok: true, order: row });
  });
  router.delete("/orders/:id", async (req, res) => {
    if (!(await orders.delete(idParam(req)))) throw notFound();
    res.json({ ok: true });
  });

  // ---- Applications ---------------------------------------------------------------------------------

  const applicationFilters = (q) => ({ job: str(q.job, 60), status: oneOfIds(APPLICATION_STATUSES, q.status), track: str(q.track, 40), q: str(q.q, 80), ...windowOf(q) });
  router.get("/applications", async (req, res) => res.json(await leads.listApplications({ ...applicationFilters(req.query), ...paging(req.query) })));
  router.patch("/applications/:id", async (req, res) => {
    const row = await leads.updateApplication(idParam(req), patchOf(req.body, { statuses: APPLICATION_STATUSES }));
    if (!row) throw notFound();
    res.json({ ok: true, application: row });
  });
  router.delete("/applications/:id", async (req, res) => {
    if (!(await leads.deleteApplication(idParam(req)))) throw notFound();
    res.json({ ok: true });
  });

  // ---- Subscribers ------------------------------------------------------------------------------------

  const subscriberFilters = (q) => ({ status: oneOfIds(SUBSCRIBER_STATUSES, q.status), chip: str(q.chip, 20), q: str(q.q, 80) });
  router.get("/subscribers", async (req, res) => res.json(await leads.listSubscribers({ ...subscriberFilters(req.query), ...paging(req.query) })));
  router.patch("/subscribers/:id", async (req, res) => {
    const status = req.body?.status;
    if (typeof status !== "string" || !ids(SUBSCRIBER_STATUSES).includes(status)) throw invalid({ status: "Status is not a valid choice." });
    const row = await leads.setSubscriberStatus(idParam(req), status);
    if (!row) throw notFound();
    res.json({ ok: true, subscriber: row });
  });
  router.delete("/subscribers/:id", async (req, res) => {
    if (!(await leads.deleteSubscriber(idParam(req)))) throw notFound();
    res.json({ ok: true });
  });

  // ---- Milestones (the public timeline) --------------------------------------------------------------

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
    res.json({ ok: true, milestone: row });
  });

  // ---- CSV export --------------------------------------------------------------------------------------

  const EXPORTS = {
    contacts: (q) => { const f = contactFilters(q); return (extra) => leads.listContacts({ ...f, ...extra }); },
    demos: (q) => { const f = demoFilters(q); return (extra) => demos.list({ ...f, ...extra }); },
    orders: (q) => { const f = orderFilters(q); return (extra) => orders.list({ ...f, ...extra }); },
    applications: (q) => { const f = applicationFilters(q); return (extra) => leads.listApplications({ ...f, ...extra }); },
    subscribers: (q) => { const f = subscriberFilters(q); return (extra) => leads.listSubscribers({ ...f, ...extra }); },
  };

  router.get("/export/:kind", async (req, res) => {
    const kind = String(req.params.kind);
    if (!Object.hasOwn(EXPORTS, kind)) throw notFound();
    const fetchPage = EXPORTS[kind](req.query);
    const rows = [];
    while (rows.length < EXPORT_CAP) {
      const chunk = (await fetchPage({ limit: CHUNK, offset: rows.length, maxLimit: CHUNK })).rows;
      rows.push(...chunk);
      if (chunk.length < CHUNK) break;
    }
    const tz = config.demo.timezone;
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
    res.set({ "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="zenitheum-${kind}-${day}.csv"` });
    res.send(toCsv(rows, COLUMNS[kind], { timeZone: tz }));
  });

  // Anything else under /api/admin that matched nothing above.
  router.use((_req, res) => {
    res.status(404).json({ ok: false, error: "not_found", message: "Unknown API route." });
  });

  return router;
}
