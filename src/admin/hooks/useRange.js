import { useCallback, useMemo } from "react";

import { daysInclusive, isYmd } from "../format";
import { useQueryParams } from "./useQueryParams";

export const RANGE_PRESETS = [
  { key: "7d", label: "7 days", short: "7d", long: "Last 7 days" },
  { key: "30d", label: "30 days", short: "30d", long: "Last 30 days" },
  { key: "90d", label: "90 days", short: "90d", long: "Last 90 days" },
  { key: "365d", label: "1 year", short: "1y", long: "Last 365 days" },
];
export const MAX_CUSTOM_DAYS = 400; // the API ignores longer custom ranges

const STORE_KEY = "zt_admin_range";

// Per-viewer convenience only: remembers the last range between Overview / Campaigns / Audience.
const readStored = () => {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(STORE_KEY) || "null");
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
};
const writeStored = (value) => {
  try {
    window.sessionStorage.setItem(STORE_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable: the URL still carries the range */
  }
};

/** Validates a custom range the way the API does. Returns an error message, or "" when fine. */
export function customRangeProblem(from, to) {
  if (!isYmd(from) || !isYmd(to)) return "Choose both a start and an end date.";
  if (from > to) return "The start date must be on or before the end date.";
  if (daysInclusive(from, to) > MAX_CUSTOM_DAYS) return `Choose at most ${MAX_CUSTOM_DAYS} days.`;
  return "";
}

const isPreset = (key) => RANGE_PRESETS.some((preset) => preset.key === key);

/**
 * The report date range for Overview, Campaigns and Audience: URL first (?range=30d or ?from=&to=), then the
 * last range used in this tab, then 30 days. `apiParams` is exactly what GET /overview|campaigns|audience takes.
 */
export default function useRange() {
  const [params, update] = useQueryParams();
  const urlRange = params.get("range");
  const urlFrom = params.get("from");
  const urlTo = params.get("to");

  const range = useMemo(() => {
    if (!customRangeProblem(urlFrom, urlTo)) return { key: "custom", from: urlFrom, to: urlTo };
    if (isPreset(urlRange)) return { key: urlRange };
    const stored = readStored();
    if (stored?.key === "custom" && !customRangeProblem(stored.from, stored.to)) return stored;
    if (isPreset(stored?.key)) return { key: stored.key };
    return { key: "30d" };
  }, [urlRange, urlFrom, urlTo]);

  const apiParams = useMemo(() => (range.key === "custom" ? { from: range.from, to: range.to } : { range: range.key }), [range]);

  const setPreset = useCallback(
    (key) => {
      writeStored({ key });
      update({ range: key, from: null, to: null });
    },
    [update],
  );
  const setCustom = useCallback(
    (from, to) => {
      writeStored({ key: "custom", from, to });
      update({ range: null, from, to });
    },
    [update],
  );

  return { range, apiParams, setPreset, setCustom };
}
