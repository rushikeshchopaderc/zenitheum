import { useMemo } from "react";
import { mulberry32 } from "./circuitNetwork";
import useAnimationGate from "../../hooks/useAnimationGate";

/**
 * A wafer map whose dies "grow" outward from the centre, with a radar sweep.
 * Reads as yield / ecosystem growth. Deterministic and decorative.
 */
function WaferMap({ className = "", pitch = 26 }) {
  const dies = useMemo(() => {
    const rand = mulberry32(1126);
    const R = 276;
    const out = [];
    for (let gy = -12; gy <= 12; gy += 1) {
      for (let gx = -12; gx <= 12; gx += 1) {
        const x = gx * pitch - pitch / 2;
        const y = gy * pitch - pitch / 2;
        const corners = [
          [x, y],
          [x + pitch, y],
          [x, y + pitch],
          [x + pitch, y + pitch],
        ];
        if (!corners.every(([cx, cy]) => Math.hypot(cx, cy) < R)) continue;
        const dist = Math.hypot(x + pitch / 2, y + pitch / 2);
        const edge = dist > R - pitch * 1.6;
        const r = rand();
        const tone = edge ? "edge" : r < 0.05 ? "bad" : r < 0.3 ? "mid" : "good";
        out.push({ x, y, delay: Math.round(dist * 5.5), tone });
      }
    }
    return out;
  }, [pitch]);
  const [gateRef, gate] = useAnimationGate();

  return (
    <div ref={gateRef} className={`wafer ${gate} ${className}`} aria-hidden="true">
      <svg viewBox="-300 -300 600 600" className="h-full w-full" focusable="false">
        <circle r="290" fill="rgba(8,12,28,.7)" stroke="rgba(96,165,250,.55)" strokeWidth="1.4" />
        <circle r="280" fill="none" stroke="rgba(96,165,250,.25)" strokeDasharray="2 6" />
        {/* notch */}
        <path d="M-22 288 A24 24 0 0 1 22 288" fill="rgba(9,9,11,1)" stroke="rgba(96,165,250,.5)" />
        {dies.map((d) => (
          <rect
            key={`${d.x}-${d.y}`}
            x={d.x + 1.5}
            y={d.y + 1.5}
            width={pitch - 3}
            height={pitch - 3}
            rx="2"
            className={`die die-${d.tone}`}
            style={{ animationDelay: `${d.delay}ms` }}
          />
        ))}
      </svg>
      <div className="wafer-sweep" />
    </div>
  );
}

export default WaferMap;
