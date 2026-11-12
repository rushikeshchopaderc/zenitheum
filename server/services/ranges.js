const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 };
const YMD = /^\d{4}-\d{2}-\d{2}$/;
const MAX_CUSTOM_DAYS = 400;

const ymd = (date, timeZone) =>
  new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);

const addDays = (day, n) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const daysBetween = (a, b) => Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86_400_000) + 1;

/**
 * Turn ?range=30d (or ?from=YYYY-MM-DD&to=YYYY-MM-DD) into an inclusive pair of calendar dates in the
 * business time zone. The reports then convert them to exact instants in SQL.
 */
export function resolveRange({ range, from, to } = {}, timeZone, now = new Date()) {
  const today = ymd(now, timeZone);
  if (YMD.test(from || "") && YMD.test(to || "") && from <= to && daysBetween(from, to) <= MAX_CUSTOM_DAYS) {
    return { fromDate: from, toDate: to, days: daysBetween(from, to), key: "custom" };
  }
  const key = RANGE_DAYS[range] ? range : "30d";
  const days = RANGE_DAYS[key];
  return { fromDate: addDays(today, -(days - 1)), toDate: today, days, key };
}

/** The same-length window immediately before `range`, for "vs previous period" comparisons. */
export function previousRange({ fromDate, days }) {
  return { fromDate: addDays(fromDate, -days), toDate: addDays(fromDate, -1), days };
}
