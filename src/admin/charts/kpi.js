import { compare, fmtPct } from "../format";

const pctText = (pct) => fmtPct(Math.abs(pct), Math.abs(pct) < 0.1 ? 1 : 0);

/**
 * Describe a change against the previous period as { tone, icon, text }. Direction is shown three ways (an
 * arrow icon, the sign in words, and colour), so colour is never the only carrier.
 *
 *  goodWhen "up"   : more is better (visitors, leads...)
 *  goodWhen "down" : less is better (bounce rate)
 *  mode "points"   : current/previous are ratios (0..1); the change is in percentage points
 */
export function describeChange({ current, previous, goodWhen = "up", days, mode = "percent" }) {
  const period = days ? `previous ${days} days` : "previous period";
  if (mode === "points") {
    if (current === null || previous === null) return { tone: "flat", icon: "minus", text: `No comparison with the ${period}` };
    const points = (current - previous) * 100;
    if (Math.abs(points) < 0.05) return { tone: "flat", icon: "minus", text: `No change vs ${period}` };
    const up = points > 0;
    const good = goodWhen === "up" ? up : !up;
    return { tone: good ? "good" : "bad", icon: up ? "arrowUp" : "arrowDown", text: `${up ? "Up" : "Down"} ${Math.abs(points).toFixed(1)} pts vs ${period}` };
  }
  const change = compare(current, previous);
  if (change.dir === "none") return { tone: "flat", icon: "minus", text: `None in either period` };
  if (change.dir === "flat") return { tone: "flat", icon: "minus", text: `No change vs ${period}` };
  if (change.dir === "new") return { tone: goodWhen === "up" ? "good" : "bad", icon: "arrowUp", text: `New: none in the ${period}` };
  const up = change.dir === "up";
  const good = goodWhen === "up" ? up : !up;
  return { tone: good ? "good" : "bad", icon: up ? "arrowUp" : "arrowDown", text: `${up ? "Up" : "Down"} ${pctText(change.pct)} vs ${period}` };
}
