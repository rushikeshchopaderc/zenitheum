import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TRACK_LABELS } from "@shared/milestones.js";
import useMilestones from "../../hooks/useMilestones";
import Marker from "./Marker";
import { STATUS_META, TRACK_META, buildAxis, daysLabel, enrich, formatDate, groupByTrack, summarise, todayIso } from "../../lib/milestones";

/** Home-page version: every milestone as a dot on three lanes, with the selected one explained below. */
function MilestoneStrip() {
  const { milestones } = useMilestones();
  const [pickedId, setPickedId] = useState(null);
  const today = todayIso();

  const list = useMemo(() => enrich(milestones, today), [milestones, today]);
  const axis = useMemo(() => buildAxis(list), [list]);
  const overall = summarise(list);
  const lanes = groupByTrack(list);
  const todayPct = today >= axis.startIso && today < axis.endIso ? axis.pct(today) : null;
  const picked = list.find((m) => m.id === pickedId) ?? overall.next ?? list[0];
  const upcoming = list.filter((m) => m.status !== "completed").sort((a, b) => a.targetDate.localeCompare(b.targetDate)).slice(0, 4);

  return (
    <div>
      <div className="panel hud p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <p className="font-display text-4xl font-bold text-white sm:text-5xl">
            {overall.done}
            <span className="text-2xl font-semibold text-zinc-500 sm:text-3xl"> of {overall.total}</span>
            <span className="ml-3 font-mono text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">milestones complete</span>
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400" aria-label="Legend">
            {Object.entries(STATUS_META).map(([id, meta]) => (
              <li key={id} className="flex items-center gap-2">
                <Marker status={id} size={11} />
                {meta.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Dot lanes: for a mouse on a wide screen. Dots are too dense to tap, so touch devices get the list below. */}
        <div className="mt-8 hidden sm:[@media(hover:hover)_and_(pointer:fine)]:block">
          <div className="relative ml-36 h-6" aria-hidden="true">
            {axis.ticks
              .filter((t) => t.month % 3 === 0 || t.month === 1)
              .map((t) => (
                <span key={t.iso} className="absolute font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500" style={{ left: `${t.pct}%` }}>
                  {t.short}
                  {t.month === 1 ? ` ’${String(t.year).slice(2)}` : ""}
                </span>
              ))}
          </div>

          <div className="space-y-2">
            {lanes.map((lane) => {
              const meta = TRACK_META[lane.id];
              return (
                <div key={lane.id} className="flex items-center gap-4">
                  <p className="w-32 shrink-0 text-right font-mono text-[11px] uppercase leading-tight tracking-[0.12em] text-zinc-400">{meta.short}</p>
                  <div className="relative h-14 flex-1">
                    <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
                    <span aria-hidden="true" className="absolute left-0 top-1/2 h-px" style={{ width: `${todayPct ?? 0}%`, background: meta.color, boxShadow: `0 0 8px ${meta.color}` }} />
                    {todayPct !== null && <i aria-hidden="true" className="absolute inset-y-0 w-px bg-accent-400/70" style={{ left: `${todayPct}%` }} />}
                    {lane.items.map((m, i) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPickedId(m.id)}
                        onFocus={() => setPickedId(m.id)}
                        onMouseEnter={() => setPickedId(m.id)}
                        aria-pressed={picked?.id === m.id}
                        aria-label={`${m.title}. ${STATUS_META[m.status]?.label}. Target ${formatDate(m.targetDate)}.`}
                        className="absolute flex h-7 w-7 items-center justify-center rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-accent-400"
                        style={{ left: `${axis.pct(m.plotDate)}%`, top: "50%", transform: `translate(-50%, calc(-50% + ${i % 2 === 0 ? -11 : 11}px))` }}
                      >
                        <span className={picked?.id === m.id ? "scale-125 transition" : "transition"}>
                          <Marker status={m.status} kind={m.kind} size={m.kind === "gate" ? 11 : 13} />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected milestone (dot view only) */}
        {picked && (
          <div className="mt-7 hidden gap-4 border-t border-white/10 pt-6 sm:[@media(hover:hover)_and_(pointer:fine)]:flex" aria-live="polite">
            <span className="mt-1">
              <Marker status={picked.status} kind={picked.kind} />
            </span>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: TRACK_META[picked.track]?.color }}>
                {TRACK_LABELS[picked.track]}
              </p>
              <p className="mt-1.5 font-display text-lg font-semibold text-white">{picked.title}</p>
              <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.12em] text-zinc-400">
                <span style={{ color: STATUS_META[picked.status]?.color }}>{STATUS_META[picked.status]?.label}</span>
                {" · "}
                {picked.status === "completed" && picked.completedOn ? formatDate(picked.completedOn) : `Target ${formatDate(picked.targetDate)} (${daysLabel(picked.daysToGo)})`}
              </p>
              {picked.detail && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{picked.detail}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Touch devices and small screens: the next few milestones as a plain list */}
      <ol className="mt-4 space-y-3 sm:[@media(hover:hover)_and_(pointer:fine)]:hidden" aria-label="Next milestones">
        {upcoming.map((m) => (
          <li key={m.id} className="panel flex gap-3.5 p-4">
            <span className="mt-1">
              <Marker status={m.status} kind={m.kind} />
            </span>
            <div>
              <p className="text-[0.95rem] font-medium leading-snug text-white">{m.title}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                <span style={{ color: STATUS_META[m.status]?.color }}>{STATUS_META[m.status]?.label}</span> · {formatDate(m.targetDate)}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <Link to="/roadmap#milestones" className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent-300 transition hover:gap-3 hover:text-accent-200">
          See every milestone <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}

export default MilestoneStrip;
