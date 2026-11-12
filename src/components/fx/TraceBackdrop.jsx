import useAnimationGate from "../../hooks/useAnimationGate";

const LEFT = [
  { d: "M0 150 H120 L160 190 V290 L190 320 H330", end: [330, 320] },
  { d: "M0 224 H70 L100 254 V340 H240", end: [240, 340] },
  { d: "M0 84 H200 L236 48 H320", end: [320, 48] },
];
const RIGHT = [
  { d: "M1440 130 H1330 L1292 168 V262 L1262 292 H1140", end: [1140, 292] },
  { d: "M1440 214 H1380 L1350 244 V344 H1210", end: [1210, 344] },
  { d: "M1440 72 H1250 L1214 36 H1130", end: [1130, 36] },
];

/**
 * Decorative PCB traces down both edges of a page hero. Pure SVG + CSS: the
 * dashes travel along each path (see .trace-pulse in fx.css), no JS loop.
 */
function TraceBackdrop({ className = "" }) {
  const [gateRef, gate] = useAnimationGate();
  return (
    <svg
      ref={gateRef}
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1440 420"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full ${gate} ${className}`}
    >
      {[...LEFT, ...RIGHT].map(({ d, end }, i) => (
        <g key={d}>
          <path d={d} fill="none" stroke="rgba(59,130,246,.3)" strokeWidth="1.3" strokeLinejoin="round" />
          <path
            d={d}
            pathLength="100"
            fill="none"
            stroke="rgb(103,232,249)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="trace-pulse"
            style={{ animationDelay: `${i * 0.7}s`, animationDuration: `${4 + (i % 3)}s` }}
          />
          <circle cx={end[0]} cy={end[1]} r="4.5" fill="#09090b" stroke="rgba(147,197,253,.85)" strokeWidth="1.3" />
          <circle cx={end[0]} cy={end[1]} r="1.4" fill="rgba(147,197,253,.95)" />
        </g>
      ))}
    </svg>
  );
}

export default TraceBackdrop;
