import { PROGRAMME } from "@shared/roadmap.js";

/** Lane colours: the same cyan / blue as the roadmap tracks, indigo for company-wide work. */
export const TRACK_META = {
  company: { color: "#818cf8", short: "Company" },
  digital: { color: "#22d3ee", short: "ZT-SEC1 · Digital" },
  analog: { color: "#3b82f6", short: "ZT-AFE1 · Analog" },
};

/** Status colours are kept apart from the lane colours so "done" never looks like "analog". */
export const STATUS_META = {
  completed: { color: "#34d399", label: "Completed" },
  in_progress: { color: "#fbbf24", label: "In progress" },
  upcoming: { color: "#a1a1aa", label: "Upcoming" },
  delayed: { color: "#f87171", label: "Delayed" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY = 86_400_000;

/** "2026-11-12" -> whole days since the epoch (calendar arithmetic, no time zones involved). */
export const dayNumber = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY);
};

/** Today's calendar date in the business time zone (India), as YYYY-MM-DD. */
export const todayIso = (now = new Date()) => {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
};

export const formatDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

export const formatMonth = (iso) => {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
};

/** Whole days from `fromIso` to `toIso` (negative when `toIso` is earlier). */
export const daysBetween = (fromIso, toIso) => dayNumber(toIso) - dayNumber(fromIso);

const monthStart = (y, m) => `${y}-${String(m).padStart(2, "0")}-01`;

/**
 * The shared date axis for every lane: from the first day of the earliest month to the last day of the
 * latest, always covering the Dec 2026 → Dec 2027 programme. `pct(iso)` places any date on it (0–100).
 */
export function buildAxis(milestones) {
  const dates = milestones.flatMap((m) => [m.targetDate, m.completedOn]).filter(Boolean).concat(PROGRAMME.start, PROGRAMME.end);
  const first = dates.reduce((a, b) => (a < b ? a : b));
  const last = dates.reduce((a, b) => (a > b ? a : b));
  let [y, m] = first.split("-").map(Number);
  const [ly, lm] = last.split("-").map(Number);
  const startIso = monthStart(y, m);

  const ticks = [];
  while (y < ly || (y === ly && m <= lm)) {
    ticks.push({ iso: monthStart(y, m), short: MONTHS[m - 1], year: y, month: m });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  const endIso = monthStart(y, m); // after the loop, (y, m) is the first month AFTER the last tick
  const start = dayNumber(startIso);
  const span = dayNumber(endIso) - start;
  const pct = (iso) => Math.min(100, Math.max(0, ((dayNumber(iso) - start) / span) * 100));
  return { startIso, endIso, ticks: ticks.map((t) => ({ ...t, pct: pct(t.iso) })), pct };
}

/** Add the derived fields the chart needs: the date to plot, overdue, days to go. */
export function enrich(milestones, today = todayIso()) {
  return milestones.map((m) => {
    const done = m.status === "completed";
    const plotDate = done && m.completedOn ? m.completedOn : m.targetDate;
    return {
      ...m,
      kind: m.kind ?? "milestone",
      plotDate,
      overdue: !done && m.targetDate < today,
      daysToGo: daysBetween(today, m.targetDate),
    };
  });
}

export function summarise(list) {
  const counts = { completed: 0, in_progress: 0, upcoming: 0, delayed: 0 };
  for (const m of list) counts[m.status] = (counts[m.status] ?? 0) + 1;
  const open = list.filter((m) => m.status !== "completed").sort((a, b) => a.targetDate.localeCompare(b.targetDate));
  return { counts, total: list.length, done: counts.completed, next: open[0] ?? null, pct: list.length ? Math.round((counts.completed / list.length) * 100) : 0 };
}

export const groupByTrack = (list) =>
  ["company", "digital", "analog"].map((id) => ({ id, items: list.filter((m) => m.track === id) })).filter((lane) => lane.items.length);

export const daysLabel = (n) => (n === 0 ? "today" : n > 0 ? `in ${n} day${n === 1 ? "" : "s"}` : `${-n} day${n === -1 ? "" : "s"} ago`);
