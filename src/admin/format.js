/*
 * Pure formatting and safety helpers for the admin console (no React in here).
 * Everything shown in the console originates from public form input or browser telemetry, so anything that
 * becomes a link (http, mailto, tel) is built here, in one place, with strict validation and encoding.
 */

/** Calendar days in filters and reports follow this zone (the API's ANALYTICS_TZ default). */
export const BUSINESS_TZ = "Asia/Kolkata";

const DASH = "–"; // en dash: "no value"

const intFormat = new Intl.NumberFormat();
const compactFormat = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });

const isNum = (n) => typeof n === "number" && Number.isFinite(n);

/** 1,284 */
export const fmtInt = (n) => (isNum(n) ? intFormat.format(n) : DASH);

/** Full under 10,000 (1,284); compact above (12.9K, 3.2M). */
export const fmtCompact = (n) => {
  if (!isNum(n)) return DASH;
  return Math.abs(n) < 10000 ? intFormat.format(n) : compactFormat.format(n);
};

/** ratio (0..1) -> "12.3%". Whole numbers lose the decimal ("40%"). */
export function fmtPct(ratio, digits = 1) {
  if (!isNum(ratio)) return DASH;
  const value = ratio * 100;
  const rounded = Number(value.toFixed(digits));
  return `${intFormat.format(rounded)}%`;
}

/** milliseconds -> "45s", "3m 05s", "1h 12m"; zero or unknown -> en dash. */
export function fmtDuration(ms) {
  if (!isNum(ms) || ms <= 0) return DASH;
  const total = Math.round(ms / 1000);
  if (total < 60) return `${Math.max(total, 1)}s`;
  const minutes = Math.floor(total / 60);
  if (minutes < 60) return `${minutes}m ${String(total % 60).padStart(2, "0")}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${String(minutes % 60).padStart(2, "0")}m`;
}

/** Elapsed offset inside a visit: "+0:42". */
export function fmtOffset(ms) {
  if (!isNum(ms) || ms < 0) return "";
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `+${m}:${String(s).padStart(2, "0")}`;
}

export function fmtBytes(n) {
  if (!isNum(n) || n < 0) return DASH;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10 * 1024 ? 1 : 0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export const plural = (n, one, many = `${one}s`) => `${fmtInt(n)} ${n === 1 ? one : many}`;

// ---- Dates ---------------------------------------------------------------------------------------

const toDate = (iso) => {
  if (iso instanceof Date) return iso;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

const clock = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
const dayMonth = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });
const dayMonthYear = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" });
const relativeDay = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * Compact local time for tables: "Today, 2:05 pm", "Yesterday, 9:30 am", "12 Nov, 2:05 pm", "12 Nov 2025, 2:05 pm".
 * Pair it with the full ISO string in a title attribute.
 */
export function fmtDateTime(iso, now = new Date()) {
  const d = toDate(iso);
  if (!d) return DASH;
  const diffDays = Math.round((startOfDay(d) - startOfDay(now)) / 86400000);
  if (diffDays === 0 || diffDays === -1) return `${capital(relativeDay.format(diffDays, "day"))}, ${clock.format(d)}`;
  const date = d.getFullYear() === now.getFullYear() ? dayMonth.format(d) : dayMonthYear.format(d);
  return `${date}, ${clock.format(d)}`;
}

/** Local time only, for timelines inside one visit. */
export const fmtClock = (iso) => {
  const d = toDate(iso);
  return d ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit" }).format(d) : DASH;
};

const ymdFormat = new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TZ, year: "numeric", month: "2-digit", day: "2-digit" });

/** Today's calendar date (YYYY-MM-DD) in the business time zone. */
export const todayYmd = (now = new Date()) => ymdFormat.format(now);

const YMD = /^\d{4}-\d{2}-\d{2}$/;
export const isYmd = (value) => typeof value === "string" && YMD.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

export function addDays(ymd, n) {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Inclusive number of calendar days from a to b (both YYYY-MM-DD). */
export const daysInclusive = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000) + 1;

const ymdLong = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const ymdShort = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", timeZone: "UTC" });

/** A calendar date with no time zone shifting: "4 Oct 2026". */
export const fmtYmd = (ymd) => (isYmd(ymd) ? ymdLong.format(new Date(`${ymd}T00:00:00Z`)) : DASH);
export const fmtYmdShort = (ymd) => (isYmd(ymd) ? ymdShort.format(new Date(`${ymd}T00:00:00Z`)) : DASH);

// ---- Comparisons (KPI deltas) --------------------------------------------------------------------

/**
 * Compare a value with the previous period.
 * Returns { dir: "up" | "down" | "flat" | "new" | "none", pct }:
 *  - "new"  : there was nothing before, so a percentage would be meaningless
 *  - "none" : nothing in either period
 */
export function compare(current, previous) {
  const cur = isNum(current) ? current : 0;
  const prev = isNum(previous) ? previous : 0;
  if (prev === 0 && cur === 0) return { dir: "none", pct: null };
  if (prev === 0) return { dir: "new", pct: null };
  const pct = (cur - prev) / prev;
  if (Math.abs(pct) < 0.0005) return { dir: "flat", pct: 0 };
  return { dir: pct > 0 ? "up" : "down", pct };
}

// ---- Text, slugs ---------------------------------------------------------------------------------

/** Lower-case, trimmed, runs of anything else become one hyphen: "LinkedIn Post!" -> "linkedin-post". */
export const slugify = (value) =>
  String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_.-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");

export const firstName = (name) => String(name ?? "").trim().split(/\s+/)[0] || "";

// ---- Links built from untrusted data -------------------------------------------------------------

/** Returns a normalised absolute http(s) URL, or null for anything else (javascript:, data:, ftp:, relative...). */
export function safeHttpUrl(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2000) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

/** "https://www.linkedin.com/in/x" -> "linkedin.com/in/x" (display only). */
export function shortUrl(href) {
  try {
    const url = new URL(href);
    const path = url.pathname === "/" ? "" : url.pathname;
    return `${url.host.replace(/^www\./, "")}${path}`.slice(0, 60);
  } catch {
    return String(href).slice(0, 60);
  }
}

/**
 * mailto: link with the address percent-encoded. An address typed into a public form may legally contain
 * "?" or "&" (RFC 5322 allows them), so a raw mailto:addr would let it smuggle extra headers such as bcc=.
 */
export function mailtoHref(address, { subject, body } = {}) {
  const to = encodeURIComponent(String(address ?? "").trim()).replace(/%40/g, "@");
  const parts = [];
  if (subject) parts.push(`subject=${encodeURIComponent(subject)}`);
  if (body) parts.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${to}${parts.length ? `?${parts.join("&")}` : ""}`;
}

/** tel: link from digits and a leading plus only; null when it does not look like a phone number. */
export function telHref(phone) {
  const cleaned = String(phone ?? "").replace(/[^\d+]/g, "");
  return /^\+?\d{6,15}$/.test(cleaned) ? `tel:${cleaned}` : null;
}

// ---- Clipboard -----------------------------------------------------------------------------------

/** Clipboard API where available (secure contexts), execCommand fallback elsewhere. Resolves true on success. */
export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  const previous = document.activeElement;
  const area = document.createElement("textarea");
  try {
    area.value = text;
    area.setAttribute("readonly", "");
    area.setAttribute("aria-hidden", "true");
    area.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(area);
    area.focus({ preventScroll: true });
    area.select();
    area.setSelectionRange(0, text.length);
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    area.remove();
    previous?.focus?.({ preventScroll: true });
  }
}

// ---- Locale names (country codes, language tags) --------------------------------------------------

const safeDisplayNames = (type) => {
  try {
    return new Intl.DisplayNames(undefined, { type, fallback: "none" });
  } catch {
    return null;
  }
};
const regionNames = safeDisplayNames("region");
const languageNames = safeDisplayNames("language");

/** "IN" -> "India"; anything that is not a 2-letter code (e.g. a time zone) is returned as is. */
export function placeName(label) {
  if (typeof label === "string" && /^[A-Za-z]{2}$/.test(label)) {
    try {
      return regionNames?.of(label.toUpperCase()) || label;
    } catch {
      return label;
    }
  }
  return label;
}

/** "en-IN" -> "English (India)". */
export function languageName(tag) {
  if (typeof tag !== "string" || !/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(tag)) return tag;
  try {
    return languageNames?.of(tag) || tag;
  } catch {
    return tag;
  }
}
