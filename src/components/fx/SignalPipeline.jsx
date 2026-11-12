import { LANES } from "../../data/pipeline";
import useAnimationGate from "../../hooks/useAnimationGate";

function Lane({ lane, laneIndex }) {
  const [gateRef, gate] = useAnimationGate();
  return (
    <div
      ref={gateRef}
      className={`pipe panel spotlight hud p-6 sm:p-8 ${gate}`}
      style={{ "--n": lane.steps.length, "--t": "10s", "--c": lane.color, "--lane-delay": `${laneIndex * 1.6}s` }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: lane.color, boxShadow: `0 0 12px ${lane.color}` }} />
          <h3 className="font-display text-xl font-semibold text-white">{lane.title}</h3>
          <span className="font-mono text-xs tracking-[0.18em] text-zinc-500">{lane.code}</span>
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: lane.color }}>
          {lane.duration}
        </span>
      </div>

      <ol className="pipe-steps mt-7">
        <span className="pipe-rail" aria-hidden="true">
          <span className="pipe-pulse" />
        </span>
        {lane.steps.map((step, i) => (
          <li key={step.name} className="pipe-step" style={{ "--i": i }}>
            <span className="pipe-dot" aria-hidden="true" />
            <span className="pipe-index">{String(i + 1).padStart(2, "0")}</span>
            <h4 className="pipe-name">{step.name}</h4>
            <p className="pipe-note">{step.note}</p>
            {step.tool && <span className="pipe-tool">{step.tool}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Spec-to-silicon as lanes of stages. A pulse sweeps each lane and every
 * stage lights as it passes (all timing is CSS, driven by --i / --n / --t).
 * Vertical on phones, horizontal from md up. Paused while off-screen.
 */
function SignalPipeline({ lanes = LANES, className = "" }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {lanes.map((lane, laneIndex) => (
        <Lane key={lane.id} lane={lane} laneIndex={laneIndex} />
      ))}
    </div>
  );
}

export default SignalPipeline;
