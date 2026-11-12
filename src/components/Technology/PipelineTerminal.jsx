import useAnimationGate from "../../hooks/useAnimationGate";

const LINES = [
  { t: "$ git push origin main", tone: "cmd" },
  { t: "▸ lint ................ pass", tone: "ok" },
  { t: "▸ simulation .......... pass", tone: "ok" },
  { t: "▸ regression + coverage pass", tone: "ok" },
  { t: "▸ formal .............. pass", tone: "ok" },
  { t: "▸ synthesis + timing .. pass", tone: "ok" },
  { t: "▸ place & route ....... pass", tone: "ok" },
  { t: "▸ DRC / LVS ........... pass", tone: "ok" },
  { t: "▸ package + sign ...... done", tone: "ok" },
  { t: "✓ release candidate tagged", tone: "hot" },
];

/** An animated, looping CI run. Illustrative — it shows the shape of the pipeline, not real results. */
function PipelineTerminal({ className = "" }) {
  const [gateRef, gate] = useAnimationGate();
  return (
    <figure ref={gateRef} className={`panel hud overflow-hidden ${gate} ${className}`}>
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-5 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <figcaption className="ml-3 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">chip-pipeline · illustrative run</figcaption>
      </div>
      <div className="min-h-[19rem] space-y-1.5 p-6 font-mono text-[13px] leading-relaxed" aria-hidden="true">
        {LINES.map((line, i) => (
          <p
            key={line.t}
            className={`term-line m-0 ${line.tone === "cmd" ? "text-white" : line.tone === "hot" ? "font-semibold text-cyan-300" : "text-zinc-400"}`}
            style={{ "--i": i }}
          >
            {line.t}
          </p>
        ))}
        <span className="term-caret" />
      </div>
      <p className="sr-only">
        An illustrative pipeline run: lint, simulation, regression and coverage, formal, synthesis and timing, place and route, DRC and LVS,
        then packaging and signing, ending with a tagged release candidate.
      </p>
    </figure>
  );
}

export default PipelineTerminal;
