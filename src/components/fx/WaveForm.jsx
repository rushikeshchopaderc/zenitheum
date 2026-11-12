import { useMemo } from "react";
import useAnimationGate from "../../hooks/useAnimationGate";

const wave = (amp, mid, period, phase = 0) => {
  let d = "";
  for (let x = 0; x <= 800; x += 4) {
    const y = mid + amp * Math.sin(((x + phase) / period) * Math.PI * 2);
    d += `${x ? "L" : "M"}${x} ${y.toFixed(1)} `;
  }
  return d;
};

/** Looping analog waveforms (a reference and a regulated rail) over a measurement grid. */
function WaveForm({ className = "" }) {
  const main = useMemo(() => wave(30, 72, 200), []);
  const second = useMemo(() => wave(14, 72, 100, 30), []);
  const [gateRef, gate] = useAnimationGate();

  return (
    <svg ref={gateRef} viewBox="0 0 400 144" className={`${gate} ${className}`} aria-hidden="true" focusable="false">
      {[24, 48, 72, 96, 120].map((y) => (
        <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="rgba(147,197,253,.10)" strokeWidth="1" />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} y1="0" y2="144" x1={i * 50} x2={i * 50} stroke="rgba(147,197,253,.08)" strokeWidth="1" />
      ))}
      <g className="wave-move" style={{ animationDuration: "7s" }}>
        <path d={main} fill="none" stroke="rgba(59,130,246,.95)" strokeWidth="2" strokeLinejoin="round" />
      </g>
      <g className="wave-move" style={{ animationDuration: "3.5s" }}>
        <path d={second} fill="none" stroke="rgba(34,211,238,.8)" strokeWidth="1.4" strokeLinejoin="round" />
      </g>
      <line x1="0" x2="400" y1="72" y2="72" stroke="rgba(255,255,255,.28)" strokeDasharray="3 5" />
      <text x="6" y="14" fill="rgba(147,197,253,.8)" fontFamily="JetBrains Mono Variable, monospace" fontSize="8" letterSpacing="1">
        VREF · 1.2 V
      </text>
      <text x="394" y="138" textAnchor="end" fill="rgba(103,232,249,.8)" fontFamily="JetBrains Mono Variable, monospace" fontSize="8" letterSpacing="1">
        −40 … 125 °C
      </text>
    </svg>
  );
}

export default WaveForm;
