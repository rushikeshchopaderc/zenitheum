import Reveal from "./Reveal";
import CountUp from "../fx/CountUp";

/**
 * Row of headline figures. Each item: { value, label, note?, prefix?, suffix? }.
 * Numeric values count up on first view; strings render as given.
 */
function StatStrip({ items, className = "" }) {
  return (
    <div
      className={`grid grid-cols-2 divide-white/10 border-y border-white/10 sm:grid-cols-4 sm:divide-x ${className}`}
    >
      {items.map((item, i) => (
        <Reveal key={item.label} delay={i * 90} className="px-4 py-8 text-center sm:px-6">
          <div className="font-display text-3xl font-bold text-white sm:text-4xl">
            {typeof item.value === "number" ? (
              <CountUp value={item.value} prefix={item.prefix} suffix={item.suffix} />
            ) : (
              item.value
            )}
          </div>
          <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400">{item.label}</div>
          {item.note && <div className="mt-1 text-xs text-zinc-500">{item.note}</div>}
        </Reveal>
      ))}
    </div>
  );
}

export default StatStrip;
