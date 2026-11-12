import useAnimationGate from "../../hooks/useAnimationGate";

/** Endless horizontal ticker. The list is doubled so the -50% keyframe loops seamlessly. */
function Marquee({ items, className = "", label = "Toolchain" }) {
  const loop = [...items, ...items];
  const [gateRef, gate] = useAnimationGate();
  return (
    <div ref={gateRef} className={`mask-fade-x relative overflow-hidden ${gate} ${className}`} role="group" aria-label={label}>
      <ul className="flex w-max animate-marquee items-center gap-10 py-4 hover:[animation-play-state:paused]">
        {loop.map((item, i) => (
          <li key={`${item}-${i}`} aria-hidden={i >= items.length} className="flex items-center gap-10">
            <span className="font-mono text-[13px] font-medium uppercase tracking-[0.2em] text-zinc-500 transition hover:text-accent-300">
              {item}
            </span>
            <span aria-hidden="true" className="text-[10px] text-accent-700">
              ◆
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Marquee;
