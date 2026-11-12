import crypto from "node:crypto";

export const COOKIE = "zt_admin";

// scrypt cost: 64 MiB of memory per hash, comfortably above OWASP's minimums, ~150 ms per login.
const N = 2 ** 16;
const R = 8;
const P = 1;
const KEYLEN = 64;
const MAXMEM = 256 * 1024 * 1024;

const scrypt = (password, salt, { n = N, r = R, p = P } = {}) =>
  new Promise((resolve, reject) =>
    crypto.scrypt(password.normalize("NFKC"), salt, KEYLEN, { N: n, r, p, maxmem: MAXMEM }, (error, key) =>
      error ? reject(error) : resolve(key)
    )
  );

/** "scrypt$N$r$p$salt$hash" (base64) — self-describing, so the cost can be raised later. */
export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, n, r, p, salt, hash] = String(stored).split("$");
  if (scheme !== "scrypt" || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scrypt(password, Buffer.from(salt, "base64"), { n: Number(n), r: Number(r), p: Number(p) });
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

let dummy;
/** Verify against a throw-away hash so an unknown e-mail costs the same time as a wrong password. */
export async function burnTime(password) {
  dummy ??= await hashPassword(crypto.randomBytes(12).toString("hex"));
  await verifyPassword(password, dummy);
}

export const passwordProblem = (password) =>
  typeof password !== "string" || password.length < 12
    ? "Use at least 12 characters."
    : password.length > 200
      ? "That password is too long."
      : null;

export const newToken = () => crypto.randomBytes(32).toString("base64url");
export const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

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
