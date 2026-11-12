import { TRACKS } from "@shared/roadmap.js";

/** One step of the roadmap: what happens on each selected track, the exit criterion and the tools. */
function StepCard({ step, visibleTracks }) {
  const tracks = TRACKS.filter((track) => visibleTracks.has(track.id) && step.work[track.id]);

  return (
    <article className="rm-card panel hud spotlight p-6 sm:p-7">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <p className="mono-label">
          Step {String(step.n).padStart(2, "0")} <span className="text-zinc-500 lg:hidden">· {step.window}</span>
        </p>
        {step.gate && <span className="rm-gate">Gate {step.gate}</span>}
      </header>

      <h3 className="mt-4 font-display text-2xl font-semibold leading-snug text-white">{step.title}</h3>
      <p className="mt-2 leading-relaxed text-zinc-400">{step.tagline}</p>

      <div className="mt-6 space-y-5">
        {tracks.map((track) => (
          <section key={track.id}>
            <h4 className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em]" style={{ color: track.color }}>
              <i aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: track.color, boxShadow: `0 0 8px ${track.color}` }} />
              {track.name}
            </h4>
            <ul className="mt-2.5 space-y-2">
              {step.work[track.id].map((line) => (
                <li key={line} className="flex gap-3 text-[0.93rem] leading-relaxed text-zinc-300">
                  <span aria-hidden="true" className="mt-[0.6rem] h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {tracks.length === 0 && <p className="text-sm text-zinc-500">Nothing planned on the selected tracks in this step.</p>}
      </div>

      <footer className="mt-6 border-t border-white/10 pt-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Exit criterion</p>
        <p className="mt-1.5 font-medium text-white">{step.exit}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {step.tools.map((tool) => (
            <li key={tool} className="chip font-mono !text-[11px]">
              {tool}
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
}

export default StepCard;
