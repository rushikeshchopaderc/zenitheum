import { useEffect, useState } from "react";
import { MONTHS, PROGRAMME } from "../../../shared/roadmap.js";

const DAY = 86_400_000;
const START = Date.parse(`${PROGRAMME.start}T00:00:00+05:30`);
const END = Date.parse(`${PROGRAMME.end}T23:59:59+05:30`);
const TOTAL_DAYS = Math.round((END - START) / DAY);

/** Where "now" sits against the programme: a countdown before kick-off, a day counter during it. */
function programmeStatus(now = Date.now()) {
  if (now < START) {
    const days = Math.ceil((START - now) / DAY);
    return { phase: "before", days, progress: 0 };
  }
  if (now > END) return { phase: "after", progress: 1 };
  const day = Math.floor((now - START) / DAY) + 1;
  const monthIndex = Math.min(MONTHS.length, Math.floor((day - 1) / 30.4) + 1);
  return { phase: "during", day, monthIndex, progress: (now - START) / (END - START) };
}

function ProgrammeClock({ className = "" }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const status = programmeStatus(now);

  return (
    <div className={`inline-flex flex-col gap-2.5 ${className}`}>
      <div className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.16em] text-zinc-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-cyan-300" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
        </span>
        {status.phase === "before" && (
          <span>
            <b className="font-semibold text-white">T−{status.days}</b> {status.days === 1 ? "day" : "days"} to kick-off ·
            1 Dec 2026
          </span>
        )}
        {status.phase === "during" && (
          <span>
            <b className="font-semibold text-white">Day {status.day}</b> of {TOTAL_DAYS} · Month {status.monthIndex} of{" "}
            {MONTHS.length}
          </span>
        )}
        {status.phase === "after" && <span>Programme window complete</span>}
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10" role="presentation">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-600 to-cyan-300"
          style={{ width: `${Math.max(status.progress * 100, 2)}%` }}
        />
      </div>
    </div>
  );
}

export default ProgrammeClock;
