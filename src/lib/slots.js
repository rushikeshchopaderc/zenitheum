/** Formatting for demo slots: India time first, the visitor's own time beside it when it differs. */
export const IST = "Asia/Kolkata";
export const dayKey = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: IST }).format(new Date(iso)); // YYYY-MM-DD in India
export const dayLabel = (iso) => new Intl.DateTimeFormat("en-IN", { timeZone: IST, weekday: "short", day: "numeric", month: "short" }).format(new Date(iso));
export const timeLabel = (iso, timeZone = IST) => new Intl.DateTimeFormat("en-IN", { timeZone, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso)).toUpperCase();

/** "Thu, 26 Nov · 10:30 AM IST" (and the visitor's own time when their zone differs). */
export function describeSlot(iso) {
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const base = `${dayLabel(iso)} · ${timeLabel(iso)} IST`;
  return local && local !== IST && local !== "Asia/Calcutta" ? `${base} (${timeLabel(iso, local)} your time)` : base;
}
