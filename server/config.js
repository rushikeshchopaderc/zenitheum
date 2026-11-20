import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "../shared/site.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Load .env and .env.local from the project root if present. Real environment variables win.
for (const name of [".env", ".env.local"]) {
  try {
    process.loadEnvFile?.(path.join(root, name));
  } catch {
    /* file not present — that is fine */
  }
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

    // ---- Staff console: one account from the environment, a signed cookie for the session ----------
    admin: {
      email: (env.ADMIN_EMAIL || "").trim().toLowerCase(),
      password: env.ADMIN_PASSWORD || "",
      secret: env.SESSION_SECRET || "", // optional; derived from the password when empty
      sessionHours: toInt(env.ADMIN_SESSION_HOURS, 8),
      loginLimit: toInt(env.ADMIN_LOGIN_LIMIT, 10), // attempts per IP per 15 min
      // "auto" = Secure in production or over https; "false" only for trying a production build on http://localhost.
      secureCookie: ["true", "false"].includes(env.ADMIN_COOKIE_SECURE) ? env.ADMIN_COOKIE_SECURE : "auto",
    },

    // ---- Google (Drive for resumes, Gmail for notifications). All optional. ----------
    google: {
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
      refreshToken: env.GOOGLE_REFRESH_TOKEN || "",
      driveFolderId: (env.GOOGLE_DRIVE_FOLDER_ID || "").trim(), // an existing folder to store resumes in (preferred)
      driveFolderName: env.GOOGLE_DRIVE_FOLDER || "Zenitheum applications", // used only when no folder id is given
      teamEmail: env.TEAM_EMAIL || SITE.emails.team,
    },

    // ---- Fallback e-mail over SMTP (note: free hosts such as Render block SMTP; use the Google/Gmail route there) ----
    smtp: {
      host: env.SMTP_HOST || "",
      port: toInt(env.SMTP_PORT, 587),
      user: env.SMTP_USER || "",
      pass: env.SMTP_PASS || "",
    },
    mail: {
      from: env.MAIL_FROM || `${SITE.name} Website <${SITE.emails.team}>`,
      toTeam: env.MAIL_TO_TEAM || env.TEAM_EMAIL || SITE.emails.team,
    },
  };

  const merged = { ...base, ...overrides };
  for (const key of ["rateLimit", "upload", "admin", "google", "smtp", "mail"]) {
    merged[key] = { ...base[key], ...overrides[key] };
  }
  return merged;
}
