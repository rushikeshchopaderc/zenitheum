import { useMemo, useState } from "react";
import { TRACK_LABELS } from "@shared/milestones.js";
import useMilestones from "../../hooks/useMilestones";
import Reveal from "../common/Reveal";
import Marker from "./Marker";
import { STATUS_META, TRACK_META, buildAxis, daysLabel, enrich, formatDate, groupByTrack, summarise, todayIso } from "../../lib/milestones";

const COLUMNS = "md:grid-cols-[minmax(15rem,22rem)_minmax(0,1fr)]";

const FILTERS = [
  { id: "all", label: "All lanes" },
  { id: "company", label: "Company" },
  { id: "digital", label: "ZT-SEC1" },
  { id: "analog", label: "ZT-AFE1" },
];

/** Vertical month lines for the plot area: one background layer per tick, all in a single declaration. */
const gridBackground = (ticks) =>
  ticks
    .map((t) => {
      const c = t.month === 1 ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.055)";
      return `linear-gradient(${c}, ${c}) ${t.pct}% 0 / 1px 100% no-repeat`;
    })
    .join(", ");

function Stat({ status, value }) {
  const meta = STATUS_META[status];
  return (
    <div className="panel px-5 py-4">
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400">
        <Marker status={status} size={11} />
        {meta.label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function Row({ m, axis, grid, todayPct, laneColor }) {
  const meta = STATUS_META[m.status] ?? STATUS_META.upcoming;
  const pct = axis.pct(m.plotDate);
  const done = m.status === "completed";
  const dateText = done && m.completedOn ? formatDate(m.completedOn) : `Target ${formatDate(m.targetDate)}`;
  const line = done
    ? `linear-gradient(to right, transparent, ${meta.color}99)`
    : `repeating-linear-gradient(to right, ${laneColor}66 0 5px, transparent 5px 10px)`;

  return (
    <li className={`grid border-b border-white/[0.06] last:border-b-0 ${COLUMNS}`}>
      <div className="flex gap-3.5 py-4 pl-5 pr-4 md:pl-6">
        <span className="mt-[3px] md:hidden">
          <Marker status={m.status} kind={m.kind} />
        </span>
        <div className="min-w-0">
          <p className="text-[0.95rem] font-medium leading-snug text-white">{m.title}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">
            <span style={{ color: meta.color }}>{meta.label}</span>
            <span aria-hidden="true"> · </span>
            <span className="sr-only">, </span>
            {dateText}
            {m.overdue && <span className="text-red-300"> · overdue</span>}
          </p>
          {m.detail && <p className="mt-1.5 text-[0.8rem] leading-relaxed text-zinc-500">{m.detail}</p>}
        </div>
      </div>

      <div aria-hidden="true" className="relative hidden md:block" style={{ background: grid }}>
        <span className="absolute left-0 top-1/2 h-px" style={{ width: `${pct}%`, background: line }} />
        {todayPct !== null && <i className="absolute inset-y-0 w-px bg-accent-400/70" style={{ left: `${todayPct}%` }} />}
        <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${pct}%` }}>
          <Marker status={m.status} kind={m.kind} size={m.kind === "gate" ? 13 : 15} />
        </span>
      </div>
    </li>
  );
}

/**
 * The full milestone timeline: every milestone of the company and of both chips on one shared date
 * axis, what is already completed, and the target date of everything still to come.
 * Data comes from the company database (edited in the admin console), with the bundled plan as fallback.
 */
function MilestoneChart() {
  const { milestones } = useMilestones();
  const [filter, setFilter] = useState("all");
  const today = todayIso();

  const list = useMemo(() => enrich(milestones, today), [milestones, today]);
  const axis = useMemo(() => buildAxis(list), [list]);
  const grid = useMemo(() => gridBackground(axis.ticks), [axis]);
  const todayPct = today >= axis.startIso && today < axis.endIso ? axis.pct(today) : null;
  const overall = summarise(list);
  const lanes = groupByTrack(list).filter((lane) => filter === "all" || lane.id === filter);

  return (
    <div>
      {/* Summary */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]">
        <div className="panel hud col-span-2 p-5 sm:p-6 lg:col-span-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400">Next milestone</p>
          {overall.next ? (
            <>
              <p className="mt-2 font-display text-lg font-semibold leading-snug text-white">{overall.next.title}</p>
              <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.12em] text-accent-300">
                {formatDate(overall.next.targetDate)} · {daysLabel(overall.next.daysToGo ?? 0)}
              </p>
            </>
          ) : (
            <p className="mt-2 font-display text-lg font-semibold text-white">Every milestone is complete.</p>
          )}
        </div>
        <Stat status="completed" value={overall.counts.completed} />
        <Stat status="in_progress" value={overall.counts.in_progress} />
        <Stat status="upcoming" value={overall.counts.upcoming} />
        <Stat status="delayed" value={overall.counts.delayed} />
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Milestones completed" aria-valuemin={0} aria-valuemax={overall.total} aria-valuenow={overall.done}>
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300" style={{ width: `${Math.max(overall.pct, 1.5)}%` }} />
        </div>
        <p className="shrink-0 font-mono text-[12px] uppercase tracking-[0.14em] text-zinc-400">
          <b className="font-semibold text-white">{overall.done}</b> of {overall.total} complete
        </p>
      </div>

      {/* Filter + legend */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Show lane">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition ${
                filter === f.id ? "border-accent-500/60 bg-accent-700/40 text-white" : "border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/25 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400" aria-label="Legend">
          {Object.entries(STATUS_META).map(([id, meta]) => (
            <li key={id} className="flex items-center gap-2">
              <Marker status={id} size={11} />
              {meta.label}
            </li>
          ))}
          <li className="flex items-center gap-2">
            <Marker status="upcoming" kind="gate" size={10} />
            Decision gate
          </li>
          <li className="hidden items-center gap-2 md:flex">
            <i aria-hidden="true" className="h-3.5 w-px bg-accent-400" />
            Today
          </li>
        </ul>
      </div>

      {/* Ruler */}
      <div className="mt-6">
        <div className={`sticky top-[68px] z-20 hidden border-b border-white/10 bg-ink-900 md:grid ${COLUMNS}`} aria-hidden="true">
          <div className="py-3 pl-6 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Milestone</div>
          <div className="relative h-11">
            {axis.ticks.map((t, i) => (
              <span
                key={t.iso}
                className="absolute inset-y-0 flex flex-col justify-center border-l border-white/10 pl-1.5 font-mono text-[10px] uppercase leading-tight tracking-[0.1em] text-zinc-500"
                style={{ left: `${t.pct}%` }}
              >
                {t.short}
                {(t.month === 1 || i === 0) && <b className="font-medium text-zinc-300">{t.year}</b>}
              </span>
            ))}
            {todayPct !== null && (
              <span className="absolute bottom-0 -translate-x-1/2 rounded-t bg-accent-600 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-white" style={{ left: `${todayPct}%` }}>
                Today
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-6">
          {lanes.map((lane, i) => {
            const meta = TRACK_META[lane.id];
            const s = summarise(lane.items);
            return (
              <Reveal key={lane.id} delay={i * 60}>
                <section className="panel hud overflow-hidden overflow-clip" aria-labelledby={`lane-${lane.id}`}>
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.025] px-5 py-4 md:px-6">
                    <div className="flex items-center gap-3">
                      <i aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color, boxShadow: `0 0 10px ${meta.color}` }} />
                      <h3 id={`lane-${lane.id}`} className="font-display text-lg font-semibold text-white">
                        {TRACK_LABELS[lane.id]}
                      </h3>
                    </div>
                    <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">
                      <span>
                        {s.done} of {s.total} complete
                      </span>
                      <span aria-hidden="true" className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                        <span className="block h-full rounded-full" style={{ width: `${Math.max(s.pct, 3)}%`, background: meta.color }} />
                      </span>
                    </p>
                  </header>
                  <ol>
                    {lane.items.map((m) => (
                      <Row key={m.id} m={m} axis={axis} grid={grid} todayPct={todayPct} laneColor={meta.color} />
                    ))}
                  </ol>
                </section>
              </Reveal>
            );
          })}
        </div>
      </div>

      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-zinc-500">
        Dates are targets. Milestones that depend on a foundry shuttle calendar say so in their description. The team updates each status as the work is finished, so
        what you see here is where the company really stands today.
      </p>
    </div>
  );
}

export default MilestoneChart;
