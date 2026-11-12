/**
 * Small, dependency-free helpers for the analytics pipeline: classify the browser / OS / device from a
 * User-Agent, spot crawlers, and work out which marketing channel a visit came from.
 */

const BOT =
  /bot|crawl|spider|slurp|facebookexternalhit|headless|phantom|lighthouse|pingdom|uptime|monitor|preview|python-requests|curl\/|wget|go-http-client|axios|node-fetch|okhttp|java\/|libwww|scrapy|httpclient/i;

export const isBot = (userAgent = "") => !userAgent || BOT.test(userAgent);

const BROWSERS = [
  ["Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
  ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
  ["Opera", /(?:OPR|Opera)\/([\d.]+)/],
  ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
  ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
  ["Safari", /Version\/([\d.]+).*Safari/],
];

const OSES = [
  ["iOS", /(?:iPhone|iPad|iPod).*OS ([\d_]+)/],
  ["Android", /Android ([\d.]+)/],
  ["Windows", /Windows NT ([\d.]+)/],
  ["macOS", /Mac OS X ([\d_]+)/],
  ["ChromeOS", /CrOS/],
  ["Linux", /Linux/],
];

const major = (version) => (version ? String(version).replace(/_/g, ".").split(".")[0] : null);

export function parseUserAgent(userAgent = "", { touchPoints = 0 } = {}) {
  const browser = BROWSERS.map(([name, re]) => [name, userAgent.match(re)]).find(([, m]) => m);
  const os = OSES.map(([name, re]) => [name, userAgent.match(re)]).find(([, m]) => m);

  // iPadOS Safari presents a Mac user-agent; a touch screen is what gives it away.
  const ipadOs = /Macintosh/.test(userAgent) && touchPoints > 1;

  let deviceType = "desktop";
  if (ipadOs || /iPad|Tablet|PlayBook|Silk/i.test(userAgent) || (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent))) deviceType = "tablet";
  else if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(userAgent)) deviceType = "mobile";

  return {
    browser: browser ? browser[0] : null,
    browserVersion: browser ? major(browser[1][1]) : null,
    os: ipadOs ? "iPadOS" : os ? os[0] : null,
    osVersion: os ? major(os[1]?.[1]) : null,
    deviceType,
  };
}

const SOCIAL = /(^|\.)(linkedin\.com|lnkd\.in|t\.co|twitter\.com|x\.com|facebook\.com|fb\.com|instagram\.com|youtube\.com|youtu\.be|reddit\.com|whatsapp\.com|wa\.me|telegram\.org|t\.me|quora\.com|medium\.com)$/i;
const SEARCH = /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|yahoo\.[a-z.]+|baidu\.com|yandex\.[a-z.]+|ecosia\.org|brave\.com|startpage\.com)$/i;

/** direct | search | social | referral | email | paid — UTM tags win over the referrer. */
export function classifyChannel({ utmMedium, utmSource, referrerHost }) {
  const medium = (utmMedium || "").toLowerCase();
  const source = (utmSource || "").toLowerCase();
  if (/^(cpc|ppc|paid|paidsearch|paid-search|paid_social|paidsocial|display|retargeting)$/.test(medium)) return "paid";
  if (medium === "email" || /newsletter|mailchimp|email/.test(source)) return "email";
  if (/^(social|social-media|sm)$/.test(medium) || SOCIAL.test(source)) return "social";
  if (medium === "organic" || medium === "search") return "search";
  if (!referrerHost) return "direct";
  if (SEARCH.test(referrerHost)) return "search";
  if (SOCIAL.test(referrerHost)) return "social";
  return "referral";
}

/** "https://www.google.com/search?q=…" -> "google.com" (and never our own host). */
export function referrerHostOf(referrer, ownHost) {
  if (!referrer || typeof referrer !== "string") return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
    if (!host || host === (ownHost || "").replace(/^www\./, "").split(":")[0].toLowerCase()) return null;
    return host.slice(0, 120);
  } catch {
    return null;
  }
}
