/**
 * Demo slots: fixed-length slots on weekdays between two hours, in India time (a fixed UTC+05:30 offset, no daylight
 * saving). Everything is computed as exact instants so the server, the calendar and the browser agree.
 */
const MIN = 60_000;

/** The instant for a local (India) wall-clock time. */
const instant = (config, y, m, d, hour, minute) => Date.UTC(y, m, d, hour, minute) - config.utcOffsetMinutes * MIN;

/** All bookable slot starts from now (after the notice period) to the end of the horizon, as Dates. */
export function listSlots(config, now = new Date()) {
  const local = new Date(now.getTime() + config.utcOffsetMinutes * MIN);
  const earliest = now.getTime() + config.noticeHours * 60 * MIN;
  const slots = [];
  for (let day = 0; day <= config.horizonDays; day += 1) {
    const d = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + day));
    if (!config.weekdays.includes(d.getUTCDay())) continue;
    for (let minutes = config.startHour * 60; minutes + config.slotMinutes <= config.endHour * 60; minutes += config.slotMinutes) {
      const start = instant(config, d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), Math.floor(minutes / 60), minutes % 60);
      if (start >= earliest) slots.push(new Date(start));
    }
  }
  return slots;
}

/** Is `value` (an ISO string) exactly one of the bookable slots? Returns { start, end } or null. */
export function matchSlot(config, value, now = new Date()) {
  const time = typeof value === "string" ? Date.parse(value) : NaN;
  if (Number.isNaN(time)) return null;
  const found = listSlots(config, now).find((slot) => slot.getTime() === time);
  return found ? { start: found, end: new Date(found.getTime() + config.slotMinutes * MIN) } : null;
}

/** Today's date in India as YYYY-MM-DD. */
export const todayIn = (config, now = new Date()) => new Date(now.getTime() + config.utcOffsetMinutes * MIN).toISOString().slice(0, 10);
