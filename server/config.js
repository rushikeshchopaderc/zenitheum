import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "../shared/site.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Load .env from the project root if there is one. Real environment variables win.
try {
  process.loadEnvFile?.(path.join(root, ".env"));
} catch {
  /* no .env file — that is fine */
}

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseTrustProxy = (value) => {
  if (value === undefined || value === "" || value === "false") return false;
  if (value === "true") return true;
  return /^\d+$/.test(value) ? Number(value) : value;
};

/**
 * Build the runtime configuration from environment variables.
 * `overrides` is used by the test-suite to point at an in-memory database and loosen limits.
 */
export function loadConfig(env = process.env, overrides = {}) {
  const dataDir = env.DATA_DIR ? path.resolve(env.DATA_DIR) : path.join(root, "server", "data");

  const base = {
    env: env.NODE_ENV || "development",
    port: toInt(env.PORT, 8787),
    host: env.HOST || "0.0.0.0",
    root,
    distDir: path.join(root, "dist"),
    trustProxy: parseTrustProxy(env.TRUST_PROXY),
    allowedOrigins: (env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    rateLimit: { windowMs: 15 * 60 * 1000, limit: toInt(env.RATE_LIMIT_MAX, 30) },
    upload: { maxBytes: 5 * 1024 * 1024 },

    // ---- Data tier -------------------------------------------------------------------------
    // DATABASE_URL -> PostgreSQL (required in production). Without it, development and tests use an
    // embedded PostgreSQL (PGlite) persisted in `pgliteDir` — same SQL, zero setup.
    databaseUrl: env.DATABASE_URL || "",
    databaseSsl: env.DATABASE_SSL || "", // "" | "true" | "no-verify"
    pgPoolMax: toInt(env.PG_POOL_MAX, 10),
    pgliteDir: env.PGLITE_DIR ? path.resolve(env.PGLITE_DIR) : path.join(dataDir, "pg"),

    // ---- Admin console ---------------------------------------------------------------------
    admin: {
      sessionHours: toInt(env.ADMIN_SESSION_HOURS, 8),
      loginLimit: toInt(env.ADMIN_LOGIN_LIMIT, 10), // login attempts per IP per 15 min
      bootstrapEmail: env.ADMIN_EMAIL || "",
      bootstrapPassword: env.ADMIN_PASSWORD || "",
      // "auto" = Secure in production or over https; "false" only for trying a production build on http://localhost.
      secureCookie: ["true", "false"].includes(env.ADMIN_COOKIE_SECURE) ? env.ADMIN_COOKIE_SECURE : "auto",
    },

    // ---- Website analytics (first-party, consent-based) -----------------------------------
    analytics: {
      enabled: env.ANALYTICS_ENABLED !== "false",
      retentionDays: toInt(env.ANALYTICS_RETENTION_DAYS, 540),
      timezone: env.ANALYTICS_TZ || "Asia/Kolkata",
      collectLimit: toInt(env.COLLECT_RATE_MAX, 240), // collect requests per IP per minute
    },

    smtp: {
      host: env.SMTP_HOST || "",
      port: toInt(env.SMTP_PORT, 587),
      user: env.SMTP_USER || "",
      pass: env.SMTP_PASS || "",
    },
    mail: {
      from: env.MAIL_FROM || `${SITE.name} Website <no-reply@zenitheum.com>`,
      toContact: env.MAIL_TO_CONTACT || SITE.emails.support,
      toCareers: env.MAIL_TO_CAREERS || SITE.emails.careers,
    },
  };

  const merged = { ...base, ...overrides };
  for (const key of ["rateLimit", "upload", "admin", "analytics", "smtp", "mail"]) {
    merged[key] = { ...base[key], ...overrides[key] };
  }
  return merged;
}
