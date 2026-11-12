import { Fragment, useEffect, useState } from "react";
import useReveal from "../../hooks/useReveal";
import { BARS, GATES, MONTHS, TRACKS, monthIndex } from "@shared/roadmap.js";

/** "#22d3ee" -> "34 211 238" so the stylesheet can write rgb(var(--c-rgb) / 0.4). */
const rgbOf = (hex) => {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

const COLS = MONTHS.length;

/** Fractional position (0–1) of an ISO date across the 13-month grid, or null if outside it. */
function positionOf(date) {
  const [y, m, d] = date.split("-").map(Number);
  const i = monthIndex(`${y}-${String(m).padStart(2, "0")}`);
  if (i < 0) return null;
  return (i + (d - 0.5) / MONTHS[i].days) / COLS;
}

const todayIso = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};

/**
 * The 13-month programme as lanes of bars, gate markers (G1–G5) and a "today"
 * line when today falls inside the window. Bars grow in on first view.
 */
function GanttChart({ compact = false, className = "" }) {
  const [ref, visible] = useReveal({ threshold: 0.12 });
  const [today, setToday] = useState(() => positionOf(todayIso()));

  useEffect(() => {
    const timer = setInterval(() => setToday(positionOf(todayIso())), 3_600_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div ref={ref} className={`gantt ${visible ? "is-visible" : ""} ${compact ? "gantt-compact" : ""} ${className}`} style={{ "--cols": COLS }}>
      {/* The chart is visual; this is the same information for assistive tech. */}
      <ul className="sr-only">
        {BARS.map((bar) => (
          <li key={bar.id}>
            {TRACKS.find((t) => t.id === bar.track)?.name}: {bar.label}, {MONTHS[monthIndex(bar.from)].label} to{" "}
            {MONTHS[monthIndex(bar.to)].label}
          </li>
        ))}
        {GATES.map((gate) => (
          <li key={gate.id}>
            Gate {gate.id}: {gate.title}, {gate.date}
          </li>
        ))}
      </ul>

      <p aria-hidden="true" className="pt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 xl:hidden">
        Swipe sideways for all 13 months &rarr;
      </p>
      <div className="gantt-scroll" aria-hidden="true">
        <div className="gantt-grid" style={{ "--lanes": TRACKS.length }}>
          <div className="gantt-corner" style={{ gridColumn: 1, gridRow: 1 }} />
          <div className="gantt-months" style={{ gridColumn: 2, gridRow: 1 }}>
            {MONTHS.map((m, i) => (
              <div key={m.key} className={`gantt-month ${m.short === "Jan" || i === 0 ? "gantt-month-year" : ""}`}>
                <span>{m.short}</span>
                {(m.short === "Jan" || i === 0) && <small>{m.year}</small>}
              </div>
            ))}
          </div>

          {TRACKS.map((track, trackIndex) => {
            const bars = BARS.filter((b) => b.track === track.id);
            const rows = Math.max(...bars.map((b) => b.row)) + 1;
            return (
              <Fragment key={track.id}>
                <div className="gantt-label" style={{ gridColumn: 1, gridRow: trackIndex + 2 }}>
                  <i style={{ background: track.color, boxShadow: `0 0 10px ${track.color}` }} />
                  <div>
                    <b>{track.name}</b>
                    {!compact && <small>{track.code}</small>}
                  </div>
                </div>
                <div
                  className="gantt-lane"
                  style={{ gridColumn: 2, gridRow: trackIndex + 2, gridTemplateRows: `repeat(${rows}, var(--bar-h))` }}
                >
                  {bars.map((bar) => {
                    const start = monthIndex(bar.from);
                    const span = monthIndex(bar.to) - start + 1;
                    return (
                      <div
                        key={bar.id}
                        className="gantt-bar"
                        data-tone={bar.tone}
                        title={`${bar.label} · ${MONTHS[start].label}${span > 1 ? ` – ${MONTHS[monthIndex(bar.to)].label}` : ""}`}
                        style={{
                          gridColumn: `${start + 1} / span ${span}`,
                          gridRow: bar.row + 1,
                          "--c": track.color,
                          "--c-rgb": rgbOf(track.color),
                          "--d": `${start * 60}ms`,
                        }}
                      >
                        <span>{bar.label}</span>
                      </div>
                    );
                  })}
                </div>
              </Fragment>
            );
          })}

          <div className="gantt-overlay">
            {GATES.map((gate) => {
              const pos = positionOf(gate.date);
              return (
                <div key={gate.id} className="gantt-gate" style={{ left: `${pos * 100}%` }}>
                  <span className="gantt-gate-id">{gate.id}</span>
                </div>
              );
            })}
            {today !== null && (
              <div className="gantt-today" style={{ left: `${today * 100}%` }}>
                <span>Today</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GanttChart;
