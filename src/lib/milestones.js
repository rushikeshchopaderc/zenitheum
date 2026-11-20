/** Status colours and date helpers for the milestone section. */
export const STATUS_META = {
  completed: { color: "#34d399", label: "Completed" },
  in_progress: { color: "#fbbf24", label: "In progress" },
  upcoming: { color: "#a1a1aa", label: "Upcoming" },
  delayed: { color: "#f87171", label: "Delayed" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY = 86_400_000;

/** "2026-11-12" -> whole days since the epoch (calendar arithmetic, no time zones involved). */
const dayNumber = (iso) => {
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

/** Whole days from `fromIso` to `toIso` (negative when `toIso` is earlier). */
const daysBetween = (fromIso, toIso) => dayNumber(toIso) - dayNumber(fromIso);

/** Add the derived fields the chart needs: the date to show, overdue, days to go. */
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

export const daysLabel = (n) => (n === 0 ? "today" : n > 0 ? `in ${n} day${n === 1 ? "" : "s"}` : `${-n} day${n === -1 ? "" : "s"} ago`);
