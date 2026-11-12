import fs from "node:fs";
import path from "node:path";
import express from "express";
import helmet from "helmet";
import multer from "multer";

import { loadConfig } from "./config.js";
import { HttpError } from "./lib/errors.js";
import { createMailer } from "./lib/mailer.js";
import { createAdminRepository } from "./repositories/admin.js";
import { createAnalyticsRepository } from "./repositories/analytics.js";
import { createLeadRepository } from "./repositories/leads.js";
import { createMilestoneRepository } from "./repositories/milestones.js";
import { createReportRepository } from "./repositories/reports.js";
import { createAdminRouter } from "./routes/admin.js";
import { createPublicRouter } from "./routes/public.js";

/** Pages the funnel report counts as "looked at a product". */
const PRODUCT_PATHS = ["/products", "/products/digital", "/products/analog", "/customers"];

/** The application tier: every repository is built once, from the one database handle. */
export function createRepositories(db, config) {
  const timezone = config.analytics.timezone;
  return {
    leads: createLeadRepository(db),
    analytics: createAnalyticsRepository(db),
    milestones: createMilestoneRepository(db, { timezone }),
    admin: createAdminRepository(db),
    reports: createReportRepository(db, { timezone, productPaths: PRODUCT_PATHS }),
  };
}

/**
 * Build the Express app. Everything environment-specific is injected (config, database, mailer, logger),
 * which is what lets the test-suite run it against an in-memory database with a fake mailer.
 */
export function createApp({ config = loadConfig(), db, log = console, mailer = createMailer(config, log) } = {}) {
  if (!db) throw new Error("createApp needs a database handle: pass `db` from createDb().");

  const repos = createRepositories(db, config);
  const app = express();
  app.disable("x-powered-by");
  if (config.trustProxy) app.set("trust proxy", config.trustProxy);

  const production = config.env === "production";

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          styleSrcAttr: ["'unsafe-inline'"], // React inline style={{}} attributes
          imgSrc: ["'self'", "data:"],
          fontSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          // Only upgrade in production: it would break plain-http localhost.
          ...(production ? { upgradeInsecureRequests: [] } : {}),
        },
      },
      strictTransportSecurity: production,
      crossOriginEmbedderPolicy: false,
    })
  );

  // Minimal request log: method, path (no query string, no bodies), status, time.
  app.use((req, res, next) => {
    const started = process.hrtime.bigint();
    res.on("finish", () => {
      const ms = Number(process.hrtime.bigint() - started) / 1e6;
      log.info?.(`${req.method} ${req.originalUrl.split("?")[0]} ${res.statusCode} ${ms.toFixed(0)}ms`);
    });
    next();
  });

  // Opt-in CORS, only for an explicit allow-list (same-origin needs none). Never for the admin console.
  app.use("/api", (req, res, next) => {
    const origin = req.headers.origin;
    if (origin && config.allowedOrigins.includes(origin) && !req.path.startsWith("/admin")) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      if (req.method === "OPTIONS") return res.sendStatus(204);
    }
    return next();
  });

  const deps = { config, db, repos, mailer, log };
  app.use("/api/admin", createAdminRouter(deps));
  app.use("/api", createPublicRouter(deps));

  // Unknown API route -> JSON 404 (never fall through to the SPA).
  app.use("/api", (_req, res) => {
    res.status(404).json({ ok: false, error: "not_found", message: "Unknown API route." });
  });

  // ---- The built React app (production) -----------------------------------
  const indexFile = path.join(config.distDir, "index.html");
  if (fs.existsSync(indexFile)) {
    app.use(
      express.static(config.distDir, {
        index: false,
        setHeaders(res, filePath) {
          // Vite fingerprints everything under /assets, so it can be cached forever.
          const hashed = filePath.includes(`${path.sep}assets${path.sep}`);
          res.setHeader("Cache-Control", hashed ? "public, max-age=31536000, immutable" : "public, max-age=3600");
        },
      })
    );

    // Client-side routing: any other GET for a page (no file extension) gets the shell.
    app.use((req, res, next) => {
      if ((req.method !== "GET" && req.method !== "HEAD") || path.extname(req.path)) return next();
      // The console is for staff only: keep it out of search results even if a crawler finds the URL.
      if (req.path === "/admin" || req.path.startsWith("/admin/")) res.setHeader("X-Robots-Tag", "noindex, nofollow");
      return res.sendFile(indexFile, { headers: { "Cache-Control": "no-cache" } });
    });
  } else {
    app.get("/", (_req, res) => {
      res.json({
        service: "zenitheum-api",
        message: "API is running. Start the web app with `npm run dev`, or build it with `npm run build`.",
      });
    });
  }

  app.use((_req, res) => res.status(404).type("text/plain").send("Not found"));

  // eslint-disable-next-line no-unused-vars
  app.use((error, _req, res, _next) => {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ ok: false, error: error.code, message: error.message, ...error.extra });
    }
    if (error instanceof multer.MulterError) {
      const tooBig = error.code === "LIMIT_FILE_SIZE";
      return res.status(tooBig ? 413 : 400).json({
        ok: false,
        error: tooBig ? "file_too_large" : "invalid_upload",
        message: tooBig
          ? `That file is too large. The limit is ${Math.round(config.upload.maxBytes / 1024 / 1024)} MB.`
          : "The upload could not be read.",
        errors: { resume: tooBig ? "File is too large." : "Invalid upload." },
      });
    }
    if (error?.type === "entity.parse.failed") {
      return res.status(400).json({ ok: false, error: "invalid_json", message: "The request body is not valid JSON." });
    }
    if (error?.type === "entity.too.large") {
      return res.status(413).json({ ok: false, error: "payload_too_large", message: "The request is too large." });
    }
    if (error?.status >= 400 && error?.status < 500 && error?.expose) {
      // Other body-parser rejections (unsupported charset / encoding / content type).
      return res.status(error.status).json({ ok: false, error: "bad_request", message: "The request could not be read." });
    }
    log.error?.(`[error] ${error?.stack || error}`);
    return res.status(500).json({
      ok: false,
      error: "server_error",
      message: "Something went wrong on our side. Please try again, or email us directly.",
    });
  });

  return { app, repos, mailer, config };
}
