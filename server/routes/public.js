import express, { Router } from "express";
import rateLimit from "express-rate-limit";

import { jobs, findJob } from "../../shared/jobs.js";
import { CHIPS, CONTACT_TOPICS, SEGMENTS, VOLUMES, ids } from "../../shared/market.js";
import roadmap from "../../shared/roadmap.js";
import { HttpError } from "../lib/errors.js";
import { isBot } from "../lib/ua.js";
import { INVALID_FILE_MESSAGE, createUpload, sniffExtension } from "../lib/upload.js";
import {
  consent, email, oneOf, optionalOneOf, optionalUuid, phone, safeFileName, text, url, validate,
} from "../lib/validate.js";
import { attributionFor } from "../repositories/shared.js";
import { parseCollect } from "../services/collect.js";

const TOPIC_LABEL = Object.fromEntries(CONTACT_TOPICS.map((t) => [t.id, t.label]));

/** A filled honeypot field means a bot: answer "success" and quietly drop it. */
const isHoneypot = (body) => typeof body?.website === "string" && body.website.trim() !== "";
const fakeRef = () => `ZT-${Math.random().toString(16).slice(2, 10).toUpperCase().padEnd(8, "0")}`;

const lines = (pairs) =>
  pairs
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

const fail = (res, errors) =>
  res.status(400).json({ ok: false, error: "validation_failed", message: "Please check the highlighted fields and try again.", errors });

/** Visitor / session ids are optional: they are only sent when the visitor accepted analytics. */
const trackingIds = (body) => ({ visitorId: optionalUuid(body?.visitorId), sessionId: optionalUuid(body?.sessionId) });

export function createPublicRouter({ config, db, repos, mailer, log }) {
  const router = Router();
  const jsonParser = express.json({ limit: "50kb" });
  const upload = createUpload(config.upload.maxBytes);

  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    limit: config.rateLimit.limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res) =>
      res.status(429).json({ ok: false, error: "rate_limited", message: "Too many requests. Please try again in a few minutes." }),
  });

  const collectLimiter = rateLimit({
    windowMs: 60_000,
    limit: config.analytics.collectLimit,
    standardHeaders: false,
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).end(),
  });

  // ---- Health & read-only content ------------------------------------------------------------

  router.get("/health", async (_req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      await db.query("SELECT 1");
      res.json({ status: "ok", service: "zenitheum-api", db: db.kind, time: new Date().toISOString() });
    } catch {
      res.status(503).json({ status: "degraded", service: "zenitheum-api", db: "unreachable", time: new Date().toISOString() });
    }
  });

  router.get("/jobs", (_req, res) => {
    res.set("Cache-Control", "public, max-age=300");
    res.json({ jobs });
  });

  router.get("/jobs/:slug", (req, res) => {
    const job = findJob(req.params.slug);
    if (!job) throw new HttpError(404, "unknown_job", "That role is not open.");
    res.set("Cache-Control", "public, max-age=300");
    res.json({ job });
  });

  router.get("/roadmap", (_req, res) => {
    res.set("Cache-Control", "public, max-age=300");
    res.json(roadmap);
  });

  router.get("/milestones", async (_req, res) => {
    res.set("Cache-Control", "public, max-age=60");
    const rows = await repos.milestones.list();
    res.json({
      milestones: rows.map(({ id, track, kind, title, detail, targetDate, status, completedOn }) => ({
        id, track, kind, title, detail, targetDate, status, completedOn,
      })),
    });
  });

  // ---- Enquiries from prospective customers --------------------------------------------------

  const contactSchema = {
    name: text({ label: "Name", required: true, min: 2, max: 100 }),
    email: email(),
    phone: phone(),
    organisation: text({ label: "Organisation", max: 150 }),
    jobTitle: text({ label: "Job title", max: 100 }),
    topic: oneOf(ids(CONTACT_TOPICS), { label: "Topic" }),
    segment: optionalOneOf(ids(SEGMENTS), { label: "Segment" }),
    chip: optionalOneOf(ids(CHIPS), { label: "Chip" }),
    volume: optionalOneOf(ids(VOLUMES), { label: "Volume" }),
    message: text({ label: "Message", required: true, min: 10, max: 4000, multiline: true }),
    consent: consent(),
  };

  router.post("/contact", limiter, jsonParser, async (req, res) => {
    if (isHoneypot(req.body)) return res.status(201).json({ ok: true, id: fakeRef() });
    const { value, errors } = validate(req.body, contactSchema);
    if (Object.keys(errors).length) return fail(res, errors);

    const attribution = await attributionFor(db, trackingIds(req.body));
    const record = await repos.leads.createContact(value, attribution);

    mailer.send({
      to: config.mail.toContact,
      replyTo: value.email,
      subject: `[Website] ${TOPIC_LABEL[value.topic]} — ${value.name}${value.organisation ? ` (${value.organisation})` : ""}`,
      text: `${lines([
        ["Reference", record.ref],
        ["Topic", TOPIC_LABEL[value.topic]],
        ["Name", value.name],
        ["Email", value.email],
        ["Phone", value.phone],
        ["Organisation", value.organisation],
        ["Job title", value.jobTitle],
        ["Segment", SEGMENTS.find((s) => s.id === value.segment)?.label],
        ["Chip", CHIPS.find((c) => c.id === value.chip)?.label],
        ["Annual volume", VOLUMES.find((v) => v.id === value.volume)?.label],
        ["Came from", attribution.channel && `${attribution.channel}${attribution.utm_campaign ? ` / ${attribution.utm_campaign}` : ""}`],
      ])}\n\n${value.message}\n`,
    });

    return res.status(201).json({ ok: true, id: record.ref });
  });

  // ---- Early-access list ----------------------------------------------------------------------

  const subscribeSchema = { email: email(), source: text({ label: "Source", max: 40 }) };

  router.post("/subscribe", limiter, jsonParser, async (req, res) => {
    if (isHoneypot(req.body)) return res.status(201).json({ ok: true });
    const { value, errors } = validate(req.body, subscribeSchema);
    if (Object.keys(errors).length) return fail(res, errors);

    // Identical answer whether or not the address was already listed: the endpoint can't be used to probe the list.
    const { created } = await repos.leads.subscribe(value, await attributionFor(db, trackingIds(req.body)));
    if (created) {
      mailer.send({
        to: config.mail.toContact,
        subject: `[Website] Early-access sign-up — ${value.email}`,
        text: `${value.email} joined the early-access list${value.source ? ` from "${value.source}"` : ""}.\n`,
      });
    }
    return res.status(201).json({ ok: true });
  });

  // ---- Job applications (multipart, optional resume) ------------------------------------------

  router.post("/applications", limiter, upload.single("resume"), async (req, res) => {
    const body = req.body ?? {};
    if (isHoneypot(body)) return res.status(201).json({ ok: true, id: fakeRef() });

    const job = findJob(String(body.job ?? ""));
    if (!job) throw new HttpError(404, "unknown_job", "That role is not open.");

    const schema = {
      name: text({ label: "Name", required: true, min: 2, max: 100 }),
      email: email(),
      phone: phone({ required: true }),
      organisation: text({ label: "Current institute or employer", max: 150 }),
      profile: url({ label: "Profile link" }),
      track: job.tracks ? oneOf(job.tracks.map((t) => t.id), { label: "Preferred track" }) : () => ({ value: "" }),
      note: text({ label: "Note", max: 3000, multiline: true }),
      consent: consent(),
    };
    const { value, errors } = validate(body, schema);

    let extension = null;
    if (req.file) {
      extension = sniffExtension(req.file.buffer);
      if (!extension) errors.resume = INVALID_FILE_MESSAGE;
    } else if (!value.profile && !errors.profile) {
      errors.resume = "Attach your resume, or share a profile link (GitHub, LinkedIn or portfolio).";
    }
    if (Object.keys(errors).length) return fail(res, errors);

    const MIME = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    const file = req.file && { filename: safeFileName(req.file.originalname), mimeType: MIME[extension], buffer: req.file.buffer };

    const attribution = await attributionFor(db, trackingIds(body));
    const record = await repos.leads.createApplication({ ...value, jobSlug: job.slug, jobTitle: job.title }, attribution, file);

    mailer.send({
      to: config.mail.toCareers,
      replyTo: value.email,
      subject: `[Careers] ${job.title} — ${value.name}`,
      text: `${lines([
        ["Reference", record.ref],
        ["Role", job.title],
        ["Track", job.tracks?.find((t) => t.id === value.track)?.name],
        ["Name", value.name],
        ["Email", value.email],
        ["Phone", value.phone],
        ["Institute / employer", value.organisation],
        ["Profile", value.profile],
      ])}\n\n${value.note || "(no note)"}\n`,
      attachments: file ? [{ filename: file.filename, content: file.buffer }] : undefined,
    });

    return res.status(201).json({ ok: true, id: record.ref });
  });

  // ---- Website analytics beacon ---------------------------------------------------------------
  // Always answers 204: a visitor must never see an error because measurement failed, and a rejected
  // beacon must not tell a scraper why.

  router.post(
    "/collect",
    collectLimiter,
    express.json({ type: ["application/json", "text/plain"], limit: "16kb" }),
    async (req, res) => {
      try {
        const userAgent = req.get("user-agent") || "";
        const optedOut = req.get("sec-gpc") === "1" || req.get("dnt") === "1";
        if (!config.analytics.enabled || optedOut || isBot(userAgent)) return res.status(204).end();

        const batch = parseCollect(req.body, { userAgent, ownHost: req.hostname, headers: req.headers });
        if (batch) await repos.analytics.ingest(batch);
      } catch (error) {
        log.error?.(`[collect] ${error.message}`);
      }
      return res.status(204).end();
    },
    // A malformed or oversized body is still answered 204: the beacon is fire-and-forget.
    // eslint-disable-next-line no-unused-vars
    (_error, _req, res, _next) => res.status(204).end()
  );

  return router;
}
