import { useEffect, useRef, useState } from "react";
import { MONTHS, STEPS, TRACKS, monthIndex } from "@shared/roadmap.js";
import StepCard from "./StepCard";
import "./roadmap.css";

const ALL = new Set(TRACKS.map((t) => t.id));

/**
 * The step-by-step timeline. Scrolling drives three things without re-rendering
 * every frame: the spine fill + glowing head, which nodes are lit, and (via a
 * single state change per step) the highlighted months on the sticky ruler.
 */
function RoadmapTimeline() {
  const [visibleTracks, setVisibleTracks] = useState(ALL);
  const [current, setCurrent] = useState(-1);
  const listRef = useRef(null);
  const fillRef = useRef(null);
  const headRef = useRef(null);
  const nodes = useRef([]);
  const rows = useRef([]);
  const rulerRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const list = listRef.current;
      if (!list || !fillRef.current || !headRef.current) return;
      const marker = window.innerHeight * 0.55;
      const rect = list.getBoundingClientRect();
      const fill = Math.max(0, Math.min(rect.height, marker - rect.top));
      fillRef.current.style.height = `${fill}px`;
      headRef.current.style.top = `${fill}px`;
      headRef.current.style.opacity = fill > 0 && fill < rect.height ? "1" : "0";

      let latest = -1;
      nodes.current.forEach((node, i) => {
        if (!node) return;
        const box = node.getBoundingClientRect();
        const on = box.top + box.height / 2 <= marker;
        node.dataset.on = String(on);
        if (rows.current[i]) rows.current[i].dataset.on = String(on);
        if (on) latest = i;
      });
      setCurrent((prev) => (prev === latest ? prev : latest));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [visibleTracks]);

  const toggle = (id) =>
    setVisibleTracks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id); // always keep one track visible
      } else {
        next.add(id);
      }
      return next;
    });

  useEffect(() => {
    const ruler = rulerRef.current;
    const active = ruler?.querySelector('[data-on="true"]');
    if (!ruler || !active) return;
    const left = active.offsetLeft - ruler.clientWidth / 2 + active.clientWidth / 2;
    ruler.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [current]);

  const step = STEPS[current];
  const activeFrom = step ? monthIndex(step.from) : -1;
  const activeTo = step ? monthIndex(step.to) : -1;

  const jumpToMonth = (index) => {
    const target = STEPS.find((s) => monthIndex(s.from) <= index && index <= monthIndex(s.to));
    document.getElementById(target?.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div>
      {/* Track filter */}
      <div className="flex flex-wrap items-center gap-2.5" role="group" aria-label="Show tracks">
        <span className="mono-label mr-2">Show</span>
        {TRACKS.map((track) => {
          const on = visibleTracks.has(track.id);
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => toggle(track.id)}
              aria-pressed={on}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition ${
                on ? "border-white/25 bg-white/10 text-white" : "border-white/10 bg-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <i
                aria-hidden="true"
                className="h-2 w-2 rounded-full transition"
                style={{ background: on ? track.color : "#52525b", boxShadow: on ? `0 0 8px ${track.color}` : "none" }}
              />
              {track.name}
            </button>
          );
        })}
        {visibleTracks.size < TRACKS.length && (
          <button type="button" onClick={() => setVisibleTracks(ALL)} className="ml-1 text-sm text-accent-300 underline underline-offset-4 hover:text-accent-200">
            Show all
          </button>
        )}
      </div>

      {/* Sticky month ruler */}
      <div className="sticky top-[68px] z-30 -mx-5 mt-8 border-y border-white/10 bg-ink-900/85 px-5 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        <div ref={rulerRef} className="flex gap-1 overflow-x-auto py-2.5" role="group" aria-label="Jump to month">
          {MONTHS.map((m, i) => (
            <button
              key={m.key}
              type="button"
              className="rm-month"
              data-on={i >= activeFrom && i <= activeTo && activeFrom >= 0}
              onClick={() => jumpToMonth(i)}
              aria-label={`Jump to ${m.label}`}
            >
              {m.short}
              <small>{m.year}</small>
            </button>
          ))}
        </div>
      </div>

      <ol ref={listRef} className="rm-timeline mt-12">
        <span className="rm-spine" aria-hidden="true">
          <span ref={fillRef} className="rm-fill" />
          <span ref={headRef} className="rm-head" />
        </span>
        {STEPS.map((s, i) => (
          <li key={s.id} id={s.id} ref={(el) => (rows.current[i] = el)} data-on="false" className={`rm-row ${i % 2 ? "rm-right" : "rm-left"}`}>
            <StepCard step={s} visibleTracks={visibleTracks} />
            <span ref={(el) => (nodes.current[i] = el)} className="rm-node" data-on="false" aria-hidden="true">
              {s.n}
            </span>
            <div className="rm-date" aria-hidden="true">
              <p className="font-display text-3xl font-bold text-white">{s.window}</p>
              <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-400">
                Step {s.n} of {STEPS.length}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default RoadmapTimeline;
