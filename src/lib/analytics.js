/**
 * First-party, consent-based website analytics.
 *
 *  - Nothing is stored or sent until the visitor accepts (ConsentBanner). Do-Not-Track and Global
 *    Privacy Control are honoured as a refusal. Declining removes every identifier again.
 *  - Data goes only to our own server (POST /api/collect); there are no third-party scripts or cookies.
 *    A random visitor id lives in localStorage; a session is 30 minutes of inactivity.
 *  - What we record: pages viewed, time on page, scroll depth, how the visitor arrived (referrer and
 *    UTM tags), screen size and language, and a handful of named actions (CTA clicks, form steps).
 *    No IP address, no form contents, no keystrokes.
 *  - The admin console (/admin) is never tracked.
 */

const KEY = { consent: "zt_consent", visitor: "zt_vid", session: "zt_session" };
const SESSION_MS = 30 * 60 * 1000;
const FLUSH_MS = 1200;
const MAX_BATCH = 20;
const ENDPOINT = "/api/collect";

const store = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* private mode / storage full: carry on in memory */
    }
  },
  del(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

const readJson = (key) => {
  try {
    return JSON.parse(store.get(key) || "null");
  } catch {
    return null;
  }
};

const uuid = () => {
  const c = window.crypto;
  if (c?.randomUUID) return c.randomUUID();
  const bytes = c?.getRandomValues ? c.getRandomValues(new Uint8Array(16)) : Uint8Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
};

const isAdminPath = (path) => path === "/admin" || path.startsWith("/admin/");

/** True when the browser itself says "do not track me": treated as a standing refusal. */
export const trackingBlockedByBrowser = () =>
  typeof navigator !== "undefined" && (navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl === true);

const state = {
  initialised: false,
  consent: "unknown", // unknown | granted | denied
  visitorId: null,
  memorySession: null,
  queue: [],
  timer: 0,
  page: null, // the page currently being viewed
  listeners: new Set(),
};

export function getConsent() {
  if (trackingBlockedByBrowser()) return "denied";
  const stored = store.get(KEY.consent);
  return stored === "granted" || stored === "denied" ? stored : "unknown";
}

const notify = () => state.listeners.forEach((fn) => fn(state.consent));

export function onConsentChange(fn) {
  state.listeners.add(fn);
  return () => state.listeners.delete(fn);
}

const active = () => state.consent === "granted" && !isAdminPath(window.location.pathname);

// ---- Session ------------------------------------------------------------------------------------

function readUtm() {
  const params = new URLSearchParams(window.location.search);
  const pick = (name) => (params.get(name) || "").slice(0, 100);
  const utm = { source: pick("utm_source"), medium: pick("utm_medium"), campaign: pick("utm_campaign"), term: pick("utm_term"), content: pick("utm_content") };
  return Object.values(utm).some(Boolean) ? utm : {};
}

function ensureSession() {
  const now = Date.now();
  let session = readJson(KEY.session) ?? state.memorySession;
  if (!session || now - session.last > SESSION_MS) {
    session = { id: uuid(), start: now, last: now, landing: window.location.pathname, ref: document.referrer || "", utm: readUtm() };
  }
  session.last = now;
  state.memorySession = session;
  store.set(KEY.session, JSON.stringify(session));
  return session;
}

function ensureVisitor() {
  if (state.visitorId) return state.visitorId;
  let id = store.get(KEY.visitor);
  if (!/^[0-9a-f-]{36}$/i.test(id || "")) {
    id = uuid();
    store.set(KEY.visitor, id);
  }
  state.visitorId = id;
  return id;
}

/** The ids a form sends with a lead, so the lead can be tied back to the visit. Empty without consent. */
export function getTrackingIds() {
  if (!active()) return {};
  return { visitorId: ensureVisitor(), sessionId: ensureSession().id };
}

// ---- Sending ------------------------------------------------------------------------------------

function context(session) {
  let tz = "";
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    /* ignore */
  }
  return {
    start: session.start,
    landing: session.landing,
    ref: session.ref,
    utm: session.utm,
    lang: navigator.language,
    tz,
    sw: window.screen?.width,
    sh: window.screen?.height,
    vw: window.innerWidth,
    dpr: window.devicePixelRatio,
    tp: navigator.maxTouchPoints || 0,
  };
}

function flush({ final = false } = {}) {
  window.clearTimeout(state.timer);
  state.timer = 0;
  if (!state.queue.length || state.consent !== "granted") {
    state.queue = [];
    return;
  }
  const session = ensureSession();
  const events = state.queue.splice(0, MAX_BATCH);
  const body = JSON.stringify({ v: 1, vid: ensureVisitor(), sid: session.id, ctx: context(session), ev: events });

  // sendBeacon survives the page closing; text/plain keeps it a "simple" request (no preflight).
  if (final && navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: "text/plain" }))) {
    if (state.queue.length) flush({ final });
    return;
  }
  fetch(ENDPOINT, { method: "POST", body, headers: { "Content-Type": "text/plain" }, keepalive: true, credentials: "omit" }).catch(() => {});
  if (state.queue.length) flush({ final });
}

function enqueue(event, { immediate = false } = {}) {
  state.queue.push(event);
  if (immediate || state.queue.length >= MAX_BATCH) flush();
  else if (!state.timer) state.timer = window.setTimeout(flush, FLUSH_MS);
}

// ---- Page lifecycle -----------------------------------------------------------------------------

const scrollPercent = () => {
  const doc = document.documentElement;
  const total = Math.max(doc.scrollHeight, 1);
  return Math.min(100, Math.round(((window.scrollY + window.innerHeight) / total) * 100));
};

/** Time the page has been visible since the last report, in ms. */
function takeActive(page, now) {
  if (page.visibleSince !== null) {
    page.activeMs += now - page.visibleSince;
    page.visibleSince = document.visibilityState === "visible" ? now : null;
  }
  const delta = page.activeMs;
  page.activeMs = 0;
  return delta;
}

function reportLeave(page) {
  const now = Date.now();
  const delta = takeActive(page, now);
  if (delta > 0 || page.maxScroll > 0) enqueue({ t: "lv", ts: now, p: page.path, d: delta, s: page.maxScroll });
}

export function trackPageview(path, title = document.title) {
  if (!active()) return;
  if (state.page) reportLeave(state.page);
  const now = Date.now();
  state.page = { path, activeMs: 0, visibleSince: document.visibilityState === "visible" ? now : null, maxScroll: scrollPercent() };
  enqueue({ t: "pv", ts: now, p: path, ti: String(title || "").slice(0, 160) });
}

/** usePageMeta sets the real title after the page chunk loads; patch it into a view that has not been sent yet. */
export function setPageTitle(title) {
  const last = [...state.queue].reverse().find((e) => e.t === "pv" && state.page && e.p === state.page.path);
  if (last) last.ti = String(title || "").slice(0, 160);
}

/** A named action, e.g. track("cta_click", { id: "hero-design-partner" }). Names are lower_snake_case. */
export function track(name, props = {}) {
  if (!active()) return;
  enqueue({ t: "ev", ts: Date.now(), n: name, p: window.location.pathname, pr: props });
}

function onHide() {
  if (!state.page) return;
  reportLeave(state.page);
  flush({ final: true });
}

function onVisibility() {
  if (document.visibilityState === "hidden") onHide();
  else if (state.page && state.page.visibleSince === null) state.page.visibleSince = Date.now();
}

let scrollFrame = 0;
function onScroll() {
  if (scrollFrame || !state.page) return;
  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = 0;
    if (state.page) state.page.maxScroll = Math.max(state.page.maxScroll, scrollPercent());
  });
}

function onClick(event) {
  const target = event.target instanceof Element ? event.target.closest("[data-cta]") : null;
  if (target) track("cta_click", { id: target.getAttribute("data-cta") });
}

// ---- Consent ------------------------------------------------------------------------------------

export function setConsent(granted) {
  if (trackingBlockedByBrowser()) granted = false;
  state.consent = granted ? "granted" : "denied";
  store.set(KEY.consent, state.consent);
  if (!granted) {
    state.queue = [];
    state.page = null;
    state.visitorId = null;
    state.memorySession = null;
    store.del(KEY.visitor);
    store.del(KEY.session);
  } else if (!isAdminPath(window.location.pathname)) {
    trackPageview(window.location.pathname, document.title);
  }
  notify();
}

/** Call once at start-up. Safe to call twice. */
export function initAnalytics() {
  if (state.initialised || typeof window === "undefined") return;
  state.initialised = true;
  state.consent = getConsent();
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", onHide);
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("click", onClick, { capture: true });
}
