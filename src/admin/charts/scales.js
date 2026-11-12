import { fmtCompact, fmtInt, fmtYmd, fmtYmdShort } from "../format";

/**
 * A "nice" axis for 0..max: round tick values, `count` intervals or fewer.
 * With `integer`, the step is never below 1 (daily counts of leads are whole numbers).
 */
export function niceTicks(maxValue, count = 4, { integer = false } = {}) {
  const max = Number.isFinite(maxValue) && maxValue > 0 ? maxValue : 0;
  if (max === 0) return { max: integer ? Math.max(count, 1) : 1, ticks: integer ? Array.from({ length: Math.max(count, 1) + 1 }, (_, i) => i) : [0, 1] };
  const raw = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const residual = raw / magnitude;
  let step = (residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10) * magnitude;
  if (integer && step < 1) step = 1;
  const top = Math.ceil(max / step) * step;
  const ticks = [];
  for (let value = 0; value <= top + step / 1000; value += step) ticks.push(Number(value.toFixed(10)));
  return { max: top, ticks };
}

/** Axis labels: in full under 10,000 (0 / 1,000 / 2,000), compact once the axis reaches it (0 / 10K / 20K). */
export const axisFormatter = (ticks) => (ticks[ticks.length - 1] >= 10000 ? fmtCompact : fmtInt);

/** Evenly spread, de-duplicated indices for x-axis labels. */
export function labelIndices(count, wanted) {
  if (count <= 0) return [];
  const target = Math.max(1, Math.min(count, wanted));
  if (target === 1) return [0];
  const picks = new Set();
  for (let i = 0; i < target; i += 1) picks.add(Math.round((i * (count - 1)) / (target - 1)));
  return [...picks];
}

/** A bar whose top corners are rounded and whose base is square (the baseline end is never rounded). */
export function roundedTopBar(x, y, width, height, radius = 4) {
  const r = Math.max(0, Math.min(radius, width / 2, height));
  if (r === 0) return `M${x},${y + height}V${y}H${x + width}V${y + height}Z`;
  return `M${x},${y + height}V${y + r}Q${x},${y} ${x + r},${y}H${x + width - r}Q${x + width},${y} ${x + width},${y + r}V${y + height}Z`;
}

/** Past this many days a column would be only a few pixels wide, so the series is summed by week. */
export const WEEKLY_AFTER_DAYS = 92;

/**
 * Daily points as they are, or weekly sums (7-day blocks from the first day) for long ranges.
 * series: [{ day, sessions, pageViews, leads, applications }]
 */
export function bucketize(series) {
  if (series.length <= WEEKLY_AFTER_DAYS) {
    return {
      unit: "day",
      buckets: series.map((point) => ({ ...point, key: point.day, from: point.day, to: point.day, days: 1, label: fmtYmdShort(point.day), long: fmtYmd(point.day) })),
    };
  }
  const buckets = [];
  for (let i = 0; i < series.length; i += 7) {
    const chunk = series.slice(i, i + 7);
    const sum = (field) => chunk.reduce((total, point) => total + (point[field] || 0), 0);
    const from = chunk[0].day;
    const to = chunk[chunk.length - 1].day;
    buckets.push({
      key: from,
      from,
      to,
      days: chunk.length,
      label: fmtYmdShort(from),
      long: `${fmtYmdShort(from)} \u2013 ${fmtYmd(to)}${chunk.length < 7 ? " (partial week)" : ""}`,
      sessions: sum("sessions"),
      pageViews: sum("pageViews"),
      leads: sum("leads"),
      applications: sum("applications"),
    });
  }
  return { unit: "week", buckets };
}
