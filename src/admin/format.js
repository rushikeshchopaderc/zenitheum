/*
 * Pure formatting and safety helpers for the admin console (no React in here).
 * Everything shown in the console originates from public form input, so anything that becomes a link
 * (http, mailto, tel) is built here, in one place, with strict validation and encoding.
 */

/** Demo times, delivery dates and report days are India time (the API's demo time zone). */
const BUSINESS_TZ = "Asia/Kolkata";
export const BUSINESS_TZ_LABEL = "IST";

const DASH = "–"; // en dash: "no value"

const intFormat = new Intl.NumberFormat();
const isNum = (n) => typeof n === "number" && Number.isFinite(n);

/** 1,284 */
export const fmtInt = (n) => (isNum(n) ? intFormat.format(n) : DASH);

// ---- Dates ---------------------------------------------------------------------------------------

const toDate = (value) => {
  if (value instanceof Date) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const clock = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
const dayMonth = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });
const dayMonthYear = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" });
const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
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
  if (diffDays === 0 || diffDays === -1) return `${capital(relative.format(diffDays, "day"))}, ${clock.format(d)}`;
  const date = d.getFullYear() === now.getFullYear() ? dayMonth.format(d) : dayMonthYear.format(d);
  return `${date}, ${clock.format(d)}`;
}

const ymdFormat = new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TZ, year: "numeric", month: "2-digit", day: "2-digit" });

/** Today's calendar date (YYYY-MM-DD) in India. */
export const todayYmd = (now = new Date()) => ymdFormat.format(now);

const YMD = /^\d{4}-\d{2}-\d{2}$/;
const isYmd = (value) => typeof value === "string" && YMD.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

/** Inclusive number of calendar days from a to b (both YYYY-MM-DD). */
export const daysInclusive = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000) + 1;

const ymdLong = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** A calendar date with no time zone shifting: "Thu, 4 Oct 2026". */
export const fmtYmd = (ymd) => (isYmd(ymd) ? ymdLong.format(new Date(`${ymd}T00:00:00Z`)) : DASH);

/** "in 12 days", "tomorrow", "3 days ago" for a calendar date, counted in India days. */
export function fmtRelativeDay(ymd, now = new Date()) {
  if (!isYmd(ymd)) return "";
  const days = Math.round((Date.parse(`${ymd}T00:00:00Z`) - Date.parse(`${todayYmd(now)}T00:00:00Z`)) / 86400000);
  return relative.format(days, "day");
}

/** What a demo request asks for, in words: "Thu, 4 Mar 2027 · in 5 days · Afternoon"; "No preference" when it asks for nothing. */
export function describePreference({ preferredDate, preferredTime }, timeLabel, now = new Date()) {
  const parts = [];
  if (preferredDate) parts.push(fmtYmd(preferredDate));
  const rel = preferredDate ? fmtRelativeDay(preferredDate, now) : "";
  const time = preferredTime ? timeLabel(preferredTime) : "";
  return { date: preferredDate ? fmtYmd(preferredDate) : "", relative: rel, time, text: [...parts, time].filter(Boolean).join(" · ") || "No preference" };
}

// ---- Text ----------------------------------------------------------------------------------------

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
