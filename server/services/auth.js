import crypto from "node:crypto";

export const COOKIE = "zt_admin";

export const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

/** Constant-time string comparison (compares fixed-length digests, so lengths never leak). */
export function safeEqual(a, b) {
  const x = crypto.createHash("sha256").update(String(a)).digest();
  const y = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}

/** Is the staff console switched on? It needs both an e-mail and a password in the environment. */
export const adminConfigured = (config) => Boolean(config.admin.email && config.admin.password);

/** Check a sign-in against the single account in the environment. Always does both comparisons. */
export function checkCredentials(config, email, password) {
  const emailOk = safeEqual(String(email ?? "").trim().toLowerCase(), config.admin.email);
  const passwordOk = safeEqual(password ?? "", config.admin.password);
  return adminConfigured(config) && emailOk && passwordOk;
}

/** The key that signs session cookies: SESSION_SECRET, or one derived from the password (so changing it signs everyone out). */
const secretOf = (config) => config.admin.secret || sha256(`zenitheum-session:${config.admin.email}:${config.admin.password}`);

const b64 = (value) => Buffer.from(value).toString("base64url");
const mac = (secret, payload) => crypto.createHmac("sha256", secret).update(payload).digest("base64url");

/** A signed, expiring session token: base64url(json).signature. Nothing is stored server-side. */
export function signSession(config, now = Date.now()) {
  const payload = b64(JSON.stringify({ e: config.admin.email, x: now + config.admin.sessionHours * 3_600_000 }));
  return `${payload}.${mac(secretOf(config), payload)}`;
}

export function verifySession(config, token, now = Date.now()) {
  if (!adminConfigured(config) || typeof token !== "string") return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, mac(secretOf(config), payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.x > now && data.e === config.admin.email ? { email: data.e } : null;
  } catch {
    return null;
  }
}

export function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index > 0 && part.slice(0, index).trim() === name) return decodeURIComponent(part.slice(index + 1).trim());
  }
  return null;
}

/** HttpOnly + SameSite=Strict, scoped to the admin API only; Secure whenever the site is served over HTTPS. */
export const sessionCookie = (token, { hours, secure }) =>
  `${COOKIE}=${encodeURIComponent(token)}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${hours * 3600}${secure ? "; Secure" : ""}`;

export const clearCookie = ({ secure }) =>
  `${COOKIE}=; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=0${secure ? "; Secure" : ""}`;

/** Remembers failed sign-ins in memory: 5 failures lock an e-mail or address for 15 minutes. */
export function createThrottle({ max = 5, lockMs = 15 * 60_000 } = {}) {
  const map = new Map();
  const live = (key, now) => {
    const entry = map.get(key);
    if (entry && entry.until && entry.until <= now) map.delete(key);
    return map.get(key);
  };
  return {
    locked: (key, now = Date.now()) => Boolean(live(key, now)?.until),
    fail(key, now = Date.now()) {
      const entry = live(key, now) ?? { count: 0, until: 0 };
      entry.count += 1;
      if (entry.count >= max) entry.until = now + lockMs;
      map.set(key, entry);
      if (map.size > 5000) map.clear(); // bounded memory
    },
    clear: (key) => map.delete(key),
  };
}
