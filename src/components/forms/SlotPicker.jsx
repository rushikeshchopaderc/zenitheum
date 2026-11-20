import { useCallback, useEffect, useMemo, useState } from "react";
import { getJson } from "../../lib/api";
import { dayKey, dayLabel, describeSlot, timeLabel } from "../../lib/slots";

/**
 * The booking calendar: pick a day, then a 30-minute time. Times are in India time (IST); the visitor's own time is shown
 * once a slot is chosen. Slots already booked are shown as unavailable and are re-checked by the server on booking.
 */
export default function SlotPicker({ value, onChange, error }) {
  const [state, setState] = useState({ status: "loading", slots: [] });
  const [day, setDay] = useState(null);

  const load = useCallback(() => {
    setState({ status: "loading", slots: [] });
    getJson("/demos/slots")
      .then((data) => setState({ status: "ready", slots: data.slots }))
      .catch(() => setState({ status: "error", slots: [] }));
  }, []);
  useEffect(load, [load]);

  const days = useMemo(() => {
    const map = new Map();
    for (const slot of state.slots) {
      const key = dayKey(slot.start);
      if (!map.has(key)) map.set(key, { key, label: dayLabel(slot.start), slots: [] });
      map.get(key).slots.push(slot);
    }
    return [...map.values()].map((d) => ({ ...d, free: d.slots.filter((s) => s.available).length }));
  }, [state.slots]);

  const activeDay = days.find((d) => d.key === day) ?? days.find((d) => d.free > 0) ?? null;

  if (state.status === "loading") {
    return <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-zinc-400" role="status">Loading available times… (the first load can take up to a minute)</p>;
  }
  if (state.status === "error") {
    return (
      <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-4 text-sm text-red-200" role="alert">
        We could not load the calendar.{" "}
        <button type="button" onClick={load} className="font-semibold underline underline-offset-4">
          Try again
        </button>
      </div>
    );
  }
  if (!days.length) return <p className="text-sm text-zinc-400">No times are open right now. Please use “Ask a question” and we will arrange one.</p>;

  return (
    <div>
      <p className="field-label">Pick a day and time <span aria-hidden="true" className="text-accent-400">*</span></p>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2" role="group" aria-label="Day">
        {days.map((d) => (
          <button
            key={d.key}
            type="button"
            disabled={d.free === 0}
            aria-pressed={activeDay?.key === d.key}
            onClick={() => setDay(d.key)}
            className={`min-h-[44px] shrink-0 rounded-xl border px-3.5 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-35 ${
              activeDay?.key === d.key ? "border-accent-500/70 bg-accent-700/40 text-white" : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/25"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {activeDay && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4" role="group" aria-label={`Times on ${activeDay.label}, India time`}>
          {activeDay.slots.map((slot) => (
            <button
              key={slot.start}
              type="button"
              disabled={!slot.available}
              aria-pressed={value === slot.start}
              onClick={() => onChange(slot.start)}
              className={`min-h-[44px] rounded-xl border px-2 py-2 text-sm transition disabled:cursor-not-allowed disabled:line-through disabled:opacity-30 ${
                value === slot.start ? "border-accent-400 bg-accent-600 text-white" : "border-white/10 bg-white/[0.04] text-zinc-200 hover:border-white/30"
              }`}
            >
              {timeLabel(slot.start)}
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-zinc-500">Times are in India Standard Time (IST). Each demo is a 30-minute Google Meet call.</p>
      {value && <p className="mt-2 text-sm font-medium text-cyan-200" role="status">Selected: {describeSlot(value)}</p>}
      {error && <p role="alert" className="field-error">{error}</p>}
    </div>
  );
}
