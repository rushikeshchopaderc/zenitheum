import { classifyChannel, parseUserAgent, referrerHostOf } from "../lib/ua.js";
import { optionalUuid } from "../lib/validate.js";

/**
 * Turn a browser's analytics beacon into validated, bounded rows. Nothing here trusts the client:
 * every string is trimmed and length-capped, every number is bounded, timestamps that are not
 * plausible are replaced by "now", and anything unrecognised is dropped rather than stored.
 *
 * Wire format (short keys keep the beacon small):
 *   { v:1, vid, sid,
 *     ctx:{ start, landing, ref, utm:{source,medium,campaign,term,content}, lang, tz, sw, sh, vw, dpr, tp },
 *     ev:[ {t:"pv", ts, p, ti}                      // page view
 *        , {t:"lv", ts, p, d, s}                    // leave: active ms SINCE the last report for that page (added up), max scroll %
 *        , {t:"ev", ts, n, p, pr:{…}} ] }           // custom event
 */

const MAX_EVENTS = 25;
const DAY = 86_400_000;

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001F\u007F]/g;
const text = (value, max) => (typeof value === "string" ? value.replace(CONTROL, "").trim().slice(0, max) || null : null);
const num = (value, min, max) => (typeof value === "number" && Number.isFinite(value) ? Math.min(Math.max(Math.round(value), min), max) : null);

const pixelRatio = (value) => (typeof value === "number" && Number.isFinite(value) ? Math.round(Math.min(Math.max(value, 0), 10) * 100) / 100 : null);

const PATH = /^\/[A-Za-z0-9\-._~%!$&'()*+,;=:@/]*$/;
export function cleanPath(value) {
  if (typeof value !== "string") return null;
  const path = value.split(/[?#]/)[0].slice(0, 200);
  if (!PATH.test(path)) return null;
  if (path === "/admin" || path.startsWith("/admin/")) return null; // the console is never tracked
  return path.length > 1 ? path.replace(/\/+$/, "") || "/" : path;
}

const EVENT_NAME = /^[a-z][a-z0-9_]{1,39}$/;
const PROP_KEY = /^[a-z][a-z0-9_]{0,29}$/;

function cleanProps(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out = {};
  for (const [key, value] of Object.entries(raw).slice(0, 8)) {
    if (!PROP_KEY.test(key)) continue;
    if (typeof value === "string") out[key] = value.replace(CONTROL, "").slice(0, 100);
    else if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
    else if (typeof value === "boolean") out[key] = value;
  }
  return JSON.stringify(out).length <= 1000 ? out : {};
}

const TIMEZONE = /^[A-Za-z_]+(?:\/[A-Za-z0-9_+-]+){0,2}$/;
const LANGUAGE = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

export function countryFromHeaders(headers) {
  const raw = headers["cf-ipcountry"] || headers["x-vercel-ip-country"] || headers["x-country-code"];
  return typeof raw === "string" && /^[A-Za-z]{2}$/.test(raw) && !/^(xx|t1)$/i.test(raw) ? raw.toUpperCase() : null;
}

export function parseCollect(body, { userAgent, ownHost, headers = {}, now = Date.now() }) {
  if (!body || typeof body !== "object" || body.v !== 1) return null;
  const visitorId = optionalUuid(body.vid);
  const sessionId = optionalUuid(body.sid);
  if (!visitorId || !sessionId || !Array.isArray(body.ev) || body.ev.length === 0) return null;

  const stamp = (ts) => (typeof ts === "number" && ts > now - DAY && ts < now + 5 * 60_000 ? new Date(ts) : new Date(now));

  const ctx = body.ctx && typeof body.ctx === "object" ? body.ctx : {};
  const utm = ctx.utm && typeof ctx.utm === "object" ? ctx.utm : {};
  const utmClean = {
    source: text(utm.source, 100)?.toLowerCase() ?? null,
    medium: text(utm.medium, 100)?.toLowerCase() ?? null,
    campaign: text(utm.campaign, 100)?.toLowerCase() ?? null,
    term: text(utm.term, 100)?.toLowerCase() ?? null,
    content: text(utm.content, 100)?.toLowerCase() ?? null,
  };
  const referrerUrl = text(ctx.ref, 300);
  const referrerHost = referrerHostOf(referrerUrl, ownHost);
  const touchPoints = num(ctx.tp, 0, 20) ?? 0;

  const session = {
    startedAt: stamp(ctx.start),
    landingPath: cleanPath(ctx.landing) ?? "/",
    referrerUrl: referrerHost ? referrerUrl : null,
    referrerHost,
    utm: utmClean,
    channel: classifyChannel({ utmMedium: utmClean.medium, utmSource: utmClean.source, referrerHost }),
    device: parseUserAgent(userAgent, { touchPoints }),
    screen: { width: num(ctx.sw, 0, 10000), height: num(ctx.sh, 0, 10000), viewport: num(ctx.vw, 0, 10000), pixelRatio: pixelRatio(ctx.dpr) },
    language: typeof ctx.lang === "string" && LANGUAGE.test(ctx.lang) ? ctx.lang.slice(0, 20) : null,
    timezone: typeof ctx.tz === "string" && TIMEZONE.test(ctx.tz) ? ctx.tz.slice(0, 60) : null,
    country: countryFromHeaders(headers),
  };

  const pageviews = [];
  const leaves = [];
  const events = [];
  for (const item of body.ev.slice(0, MAX_EVENTS)) {
    if (!item || typeof item !== "object") continue;
    const path = cleanPath(item.p);
    if (item.t === "pv" && path) {
      pageviews.push({ path, title: text(item.ti, 160), at: stamp(item.ts) });
    } else if (item.t === "lv" && path) {
      leaves.push({ path, durationMs: num(item.d, 0, 4 * 3_600_000) ?? 0, scrollPct: num(item.s, 0, 100) ?? 0 });
    } else if (item.t === "ev" && typeof item.n === "string" && EVENT_NAME.test(item.n)) {
      events.push({ name: item.n, path, props: cleanProps(item.pr), at: stamp(item.ts) });
    }
  }
  if (!pageviews.length && !leaves.length && !events.length) return null;

  return { visitorId, sessionId, session, pageviews, leaves, events };
}
