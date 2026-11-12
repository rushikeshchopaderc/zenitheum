import { useId, useRef, useState } from "react";
import { FLOWS } from "../../data/flow";

/**
 * Tabbed explorer of the design flow. Left: ordered steps (a roving-tabindex
 * tablist, arrow keys work). Right: what happens at that step and the kind of
 * industry-standard commercial tool involved.
 */
function FlowExplorer() {
  const uid = useId().replace(/:/g, "");
  const [lane, setLane] = useState("digital");
  const [index, setIndex] = useState(0);
  const tabs = useRef([]);

  const flow = FLOWS[lane];
  const step = flow.steps[index];

  const switchLane = (next) => {
    setLane(next);
    setIndex(0);
  };

  const onKeyDown = (event) => {
    const last = flow.steps.length - 1;
    const move = { ArrowDown: Math.min(index + 1, last), ArrowUp: Math.max(index - 1, 0), Home: 0, End: last }[event.key];
    if (move === undefined) return;
    event.preventDefault();
    setIndex(move);
    tabs.current[move]?.focus();
  };

  return (
    <div>
      <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1" role="group" aria-label="Choose a flow">
        {Object.entries(FLOWS).map(([id, f]) => (
          <button
            key={id}
            type="button"
            aria-pressed={lane === id}
            onClick={() => switchLane(id)}
            className={`min-h-[44px] rounded-full px-5 py-2 text-sm font-semibold transition ${
              lane === id ? "bg-accent-700 text-white shadow-lg shadow-accent-950/50" : "text-zinc-400 hover:text-white"
            }`}
          >
            {f.label}
            <span className="ml-2 font-mono text-[11px] opacity-70">{f.code}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div role="tablist" aria-orientation="vertical" aria-label={`${flow.label} steps`} onKeyDown={onKeyDown} className="panel p-2">
          {flow.steps.map((s, i) => (
            <button
              key={s.name}
              ref={(el) => (tabs.current[i] = el)}
              id={`${uid}-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-controls={`${uid}-panel`}
              tabIndex={i === index ? 0 : -1}
              onClick={() => setIndex(i)}
              className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition ${
                i === index ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="font-mono text-[11px] tracking-[0.14em]" style={{ color: i === index ? flow.color : "#71717a" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.name}
            </button>
          ))}
        </div>

        <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${index}`} className="panel hud relative overflow-hidden p-7 sm:p-9">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl" style={{ background: `${flow.color}22` }} />
          <p className="font-mono text-xs tracking-[0.2em]" style={{ color: flow.color }}>
            STEP {String(index + 1).padStart(2, "0")} / {flow.steps.length}
          </p>
          <h3 key={step.name} className="mt-4 animate-fade-up font-display text-3xl font-semibold text-white">
            {step.name}
          </h3>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-300">{step.purpose}</p>

          <div className="mt-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Tooling · industry-standard commercial EDA</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {step.tooling.map((tool) => (
                <li key={tool} className="chip !border-cyan-300/30 !text-cyan-100">
                  {tool}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-9 flex gap-3">
            <button type="button" className="btn-ghost min-h-[44px] !px-5 !py-2.5 !text-xs disabled:opacity-40" disabled={index === 0} onClick={() => setIndex(index - 1)}>
              &larr; Previous
            </button>
            <button type="button" className="btn-ghost min-h-[44px] !px-5 !py-2.5 !text-xs disabled:opacity-40" disabled={index === flow.steps.length - 1} onClick={() => setIndex(index + 1)}>
              Next &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlowExplorer;
