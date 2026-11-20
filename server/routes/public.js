import express, { Router } from "express";
import rateLimit from "express-rate-limit";

import { jobs, findJob } from "../../shared/jobs.js";
import { ANALOG_FORMATS, CHIPS, DEMO_TIMES, SEGMENTS, ids, includesAnalog, labelOf } from "../../shared/market.js";
import { HttpError } from "../lib/errors.js";
import { INVALID_FILE_MESSAGE, createUpload, sniffExtension } from "../lib/upload.js";
import { consent, email, integer, isoDate, oneOf, optionalOneOf, phone, safeFileName, text, url, validate } from "../lib/validate.js";
import { todayInIndia } from "../lib/dates.js";

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

const FORMAT_LABEL = { soft: "Soft IP", hard: "Hard IP", both: "Soft and hard IP" };

/**
 * ZT-AFE1 (analog) is delivered as soft IP, hard IP or both, so a choice is required whenever it is part of the request.
 * ZT-SEC1 (digital) is licensed as soft IP only, so no choice exists for it.
 */
function analogFormat(chip, raw, errors) {
  if (!includesAnalog(chip)) return null;
  if (ANALOG_FORMATS.some((f) => f.id === raw)) return raw;
  errors.analogFormat = "Choose how you want ZT-AFE1 delivered: soft IP, hard IP, or both.";
  return null;
}

const chipLine = (chip, format) =>
  [labelOf(CHIPS, chip), includesAnalog(chip) ? `ZT-AFE1 delivery: ${FORMAT_LABEL[format]}` : null, chip !== "analog" ? "ZT-SEC1: soft IP licence" : null].filter(Boolean).join(" · ");

export function createPublicRouter({ config, db, repos, mailer, google, log }) {
  const router = Router();
  const jsonParser = express.json({ limit: "50kb" });
  const upload = createUpload(config.upload.maxBytes);
  const team = config.mail.toTeam;

  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    limit: config.rateLimit.limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res) =>
      res.status(429).json({ ok: false, error: "rate_limited", message: "Too many requests. Please try again in a few minutes." }),
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

  router.get("/milestones", async (_req, res) => {
    res.set("Cache-Control", "public, max-age=60");
    const rows = await repos.milestones.list();
    res.json({
      milestones: rows.map(({ id, track, kind, title, detail, targetDate, status, completedOn }) => ({ id, track, kind, title, detail, targetDate, status, completedOn })),
    });
  });

  // ---- Book a demo -----------------------------------------------------------------------------

  const demoSchema = {
    name: text({ label: "Name", required: true, min: 2, max: 100 }),
    email: email(),
    phone: phone({ required: true }),
    organisation: text({ label: "Company", required: true, max: 150 }),
    jobTitle: text({ label: "Role", max: 100 }),
    segment: optionalOneOf(ids(SEGMENTS), { label: "Segment" }),
    chip: oneOf(ids(CHIPS), { label: "Chip" }),
    preferredDate: isoDate({ label: "Preferred date", required: false }),
    preferredTime: optionalOneOf(ids(DEMO_TIMES), { label: "Preferred time" }),
    message: text({ label: "Message", max: 2000, multiline: true }),
    consent: consent(),
  };

  router.post("/demos", limiter, jsonParser, async (req, res) => {
    if (isHoneypot(req.body)) return res.status(201).json({ ok: true, id: fakeRef() });
    const { value, errors } = validate(req.body, demoSchema);
    value.analogFormat = analogFormat(value.chip, req.body?.analogFormat, errors);
    if (!errors.preferredDate && value.preferredDate && value.preferredDate <= todayInIndia()) errors.preferredDate = "Choose a date after today.";
    if (Object.keys(errors).length) return fail(res, errors);

    const demo = await repos.demos.create(value);
    const when = [value.preferredDate, value.preferredTime && labelOf(DEMO_TIMES, value.preferredTime)].filter(Boolean).join(", ");
    const summary = lines([
      ["Reference", demo.ref],
      ["Interest", chipLine(value.chip, value.analogFormat)],
      ["Preferred day and time (India time)", when],
      ["Segment", value.segment && labelOf(SEGMENTS, value.segment)],
    ]);
    mailer.send({
      to: team,
      replyTo: value.email,
      subject: `[Demo] ${value.organisation} — ${value.name}${when ? ` · ${when}` : ""}`,
      text: `${summary}\n\n${lines([["Name", value.name], ["Role", value.jobTitle], ["Company", value.organisation], ["Email", value.email], ["Phone", value.phone]])}\n\n${value.message || "(no message)"}\n`,
    });
    mailer.send({
      to: value.email,
      subject: `We received your demo request ${demo.ref}`,
      text: `Hello ${value.name},\n\nThank you. We have received your demo request and will email you a time that works shortly.\n\n${summary}\n\nZenitheum\n${team}\n`,
    });
    return res.status(201).json({ ok: true, id: demo.ref });
  });

  // ---- Place an order ----------------------------------------------------------------------------

  const orderSchema = {
    contactName: text({ label: "Contact person", required: true, min: 2, max: 100 }),
    email: email(),
    phone: phone({ required: true }),
    organisation: text({ label: "Company", required: true, max: 150 }),
    jobTitle: text({ label: "Role", max: 100 }),
    chip: oneOf(["analog", "digital"], { label: "Chip" }),
    quantity: integer({ label: "Quantity", min: 1, max: 10_000_000 }),
    deliveryDate: isoDate({ label: "Delivery date" }),
    deliveryLocation: text({ label: "Delivery location", required: true, min: 3, max: 300, multiline: true }),
    customisation: text({ label: "Customisation", max: 3000, multiline: true }),
    notes: text({ label: "Notes", max: 2000, multiline: true }),
    consent: consent(),
  };

  router.post("/orders", limiter, jsonParser, async (req, res) => {
    if (isHoneypot(req.body)) return res.status(201).json({ ok: true, id: fakeRef() });
    const { value, errors } = validate(req.body, orderSchema);
    value.analogFormat = analogFormat(value.chip, req.body?.analogFormat, errors);
    if (!errors.deliveryDate && value.deliveryDate <= todayInIndia()) errors.deliveryDate = "Choose a delivery date after today.";
    if (Object.keys(errors).length) return fail(res, errors);

    const order = await repos.orders.create(value);
    const summary = lines([
      ["Reference", order.ref],
      ["Chip", chipLine(value.chip, value.analogFormat)],
      ["Quantity", String(value.quantity)],
      ["Delivery by", value.deliveryDate],
      ["Delivery location", value.deliveryLocation],
      ["Customisation", value.customisation],
      ["Notes", value.notes],
    ]);
    mailer.send({
      to: team,
      replyTo: value.email,
      subject: `[Order] ${value.organisation} — ${value.quantity} × ${value.chip === "analog" ? "ZT-AFE1" : "ZT-SEC1"} (${order.ref})`,
      text: `${summary}\n\n${lines([["Contact", value.contactName], ["Role", value.jobTitle], ["Company", value.organisation], ["Email", value.email], ["Phone", value.phone]])}\n`,
    });
    mailer.send({
      to: value.email,
      subject: `We received your order request ${order.ref}`,
      text: `Hello ${value.contactName},\n\nThank you. We have received your order request and will confirm quantity, price and delivery with you shortly.\n\n${summary}\n\nZenitheum\n${team}\n`,
    });
    return res.status(201).json({ ok: true, id: order.ref });
  });

  // ---- Questions ------------------------------------------------------------------------------------

  const contactSchema = {
    name: text({ label: "Name", required: true, min: 2, max: 100 }),
    email: email(),
    phone: phone(),
    organisation: text({ label: "Company", max: 150 }),
    jobTitle: text({ label: "Role", max: 100 }),
    topic: optionalOneOf(["question", "customisation"], { label: "Type" }),
    segment: optionalOneOf(ids(SEGMENTS), { label: "Segment" }),
    chip: optionalOneOf(ids(CHIPS), { label: "Chip" }),
    message: text({ label: "Message", required: true, min: 10, max: 4000, multiline: true }),
    consent: consent(),
  };

  router.post("/contact", limiter, jsonParser, async (req, res) => {
    if (isHoneypot(req.body)) return res.status(201).json({ ok: true, id: fakeRef() });
    const { value, errors } = validate(req.body, contactSchema);
    value.topic = value.topic || "question";
    // A customisation request says which chip to tailor, and for ZT-AFE1 how it should be delivered.
    if (value.topic === "customisation") {
      if (!value.chip) errors.chip = "Choose the chip you want customised.";
      else value.analogFormat = analogFormat(value.chip, req.body?.analogFormat, errors);
    }
    if (Object.keys(errors).length) return fail(res, errors);
    const record = await repos.leads.createContact(value);
    const custom = value.topic === "customisation";
    mailer.send({
      to: team,
      replyTo: value.email,
      subject: `[${custom ? "Customisation request" : "Question"}] ${value.name}${value.organisation ? ` (${value.organisation})` : ""}`,
      text: `${lines([
        ["Reference", record.ref],
        ["Name", value.name],
        ["Email", value.email],
        ["Phone", value.phone],
        ["Company", value.organisation],
        ["Role", value.jobTitle],
        ["Segment", value.segment && labelOf(SEGMENTS, value.segment)],
        [custom ? "Interest" : "Chip", value.chip && (custom ? chipLine(value.chip, value.analogFormat) : labelOf(CHIPS, value.chip))],
      ])}\n\n${value.message}\n`,
    });
    return res.status(201).json({ ok: true, id: record.ref });
  });

  // ---- Chip release news -------------------------------------------------------------------------------

  const subscribeSchema = {
    email: email(),
    name: text({ label: "Name", max: 100 }),
    chip: oneOf(ids(CHIPS), { label: "Chip" }),
    source: text({ label: "Source", max: 40 }),
  };

  router.post("/subscribe", limiter, jsonParser, async (req, res) => {
    if (isHoneypot(req.body)) return res.status(201).json({ ok: true });
    const input = { ...req.body, chip: req.body?.chip || "both" };
    const { value, errors } = validate(input, subscribeSchema);
    value.analogFormat = analogFormat(value.chip, input.analogFormat || "both", errors);
    if (Object.keys(errors).length) return fail(res, errors);

    // Identical answer whether or not the address was already listed: the endpoint cannot be used to probe the list.
    const { created } = await repos.leads.subscribe(value);
    if (created) {
      mailer.send({ to: team, subject: `[News] ${value.email} subscribed`, text: `${lines([["Email", value.email], ["Name", value.name], ["Interest", chipLine(value.chip, value.analogFormat)], ["From", value.source]])}\n` });
    }
    return res.status(201).json({ ok: true });
  });

  // ---- Job applications (multipart, optional resume stored in Google Drive) ----------------------------------

  const MIME = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

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

    let resume = null;
    if (req.file) {
      const file = { name: safeFileName(req.file.originalname), mimeType: MIME[extension], buffer: req.file.buffer };
      if (google.enabled) {
        try {
          const stored = await google.uploadResume({ name: `${value.name} — ${job.title} — ${file.name}`.slice(0, 180), mimeType: file.mimeType, buffer: file.buffer });
          resume = { name: file.name, url: stored.url, fileId: stored.fileId };
        } catch (error) {
          log.error?.(`[application] resume upload failed: ${error.message}`);
          throw new HttpError(503, "resume_storage_unavailable", "We could not save your resume just now. Please try again in a minute, or share a profile link instead.");
        }
      } else if (config.env === "production") {
        throw new HttpError(503, "resume_storage_unavailable", "Resume uploads are temporarily unavailable. Please share a profile link, or e-mail your resume to us.");
      } else {
        resume = { name: file.name, url: null, fileId: null }; // development: nothing to store it in
      }
    }

    const record = await repos.leads.createApplication({ ...value, jobSlug: job.slug, jobTitle: job.title }, resume);
    mailer.send({
      to: team,
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
        ["Resume (Google Drive)", resume?.url],
      ])}\n\n${value.note || "(no note)"}\n`,
      attachments: req.file ? [{ filename: resume?.name ?? "resume", content: req.file.buffer }] : undefined,
    });
    return res.status(201).json({ ok: true, id: record.ref });
  });

  return router;
}
