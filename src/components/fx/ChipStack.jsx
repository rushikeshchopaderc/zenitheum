import { useId, useMemo } from "react";
import { mulberry32 } from "./circuitNetwork";
import useAnimationGate from "../../hooks/useAnimationGate";

/** Standard-cell rows for the digital block: deterministic, so it never reshuffles on re-render. */
function buildCells() {
  const rand = mulberry32(2027);
  const cells = [];
  for (let row = 0; row < 12; row += 1) {
    let x = 32;
    const y = 34 + row * 11.4;
    while (x < 166) {
      const w = 6 + Math.floor(rand() * 4) * 4;
      if (x + w > 168) break;
      cells.push({ x, y, w, o: rand() < 0.45 ? 0.34 : 0.16 });
      x += w + 1.6;
    }
  }
  return cells;
}

const PADS = Array.from({ length: 20 }, (_, i) => 20 + i * 14.4);

function Substrate({ uid }) {
  return (
    <svg viewBox="0 0 320 320" className="h-full w-full" focusable="false">
      <defs>
        <pattern id={`${uid}-grid`} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0V16" fill="none" stroke="rgba(96,165,250,.11)" strokeWidth=".6" />
        </pattern>
      </defs>
      <rect x="2" y="2" width="316" height="316" rx="12" fill="rgba(8,12,28,.93)" stroke="rgba(96,165,250,.6)" strokeWidth="1.2" />
      <rect x="2" y="2" width="316" height="316" rx="12" fill={`url(#${uid}-grid)`} />
      <rect x="15" y="15" width="290" height="290" rx="6" fill="none" stroke="rgba(96,165,250,.38)" strokeDasharray="2 5" />
      {[
        [24, 24],
        [296, 24],
        [24, 296],
        [296, 296],
      ].map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x - 5} ${y}H${x + 5}M${x} ${y - 5}V${y + 5}`} stroke="rgba(147,197,253,.7)" strokeWidth=".9" />
      ))}
    </svg>
  );
}

function Devices({ cells }) {
  return (
    <svg viewBox="0 0 320 320" className="h-full w-full" focusable="false">
      {/* Digital: standard-cell rows */}
      <rect x="28" y="30" width="144" height="144" rx="3" fill="rgba(34,211,238,.05)" stroke="rgba(34,211,238,.45)" strokeWidth=".8" />
      {cells.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={c.w} height="8.6" rx=".8" fill="rgb(34,211,238)" opacity={c.o} />
      ))}
      <text x="31" y="24" fill="rgba(103,232,249,.95)" fontFamily="JetBrains Mono Variable, monospace" fontSize="7.5" letterSpacing=".8">
        ZT-SEC1 · DIGITAL SECURE CHIP
      </text>

      {/* SRAM-like array */}
      <rect x="28" y="190" width="104" height="100" rx="3" fill="rgba(147,197,253,.04)" stroke="rgba(147,197,253,.4)" strokeWidth=".8" />
      {Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: 8 }, (_, c) => (
          <rect key={`${r}-${c}`} x={34 + c * 11.6} y={196 + r * 10.2} width="8.4" height="7" rx=".6" fill="rgb(147,197,253)" opacity=".2" />
        ))
      )}

      {/* Analog: matched pairs, capacitor array, resistor serpentine */}
      <rect x="148" y="190" width="142" height="100" rx="3" fill="rgba(59,130,246,.07)" stroke="rgba(59,130,246,.7)" strokeWidth=".8" />
      {[
        [156, 198],
        [222, 198],
      ].map(([x, y]) => (
        <g key={x}>
          <rect x={x} y={y} width="58" height="30" rx="2" fill="rgba(59,130,246,.18)" stroke="rgba(96,165,250,.8)" strokeWidth=".8" />
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <line key={k} x1={x + 6 + k * 9} y1={y + 3} x2={x + 6 + k * 9} y2={y + 27} stroke="rgba(147,197,253,.65)" strokeWidth="2" />
          ))}
        </g>
      ))}
      {Array.from({ length: 3 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => (
          <rect key={`${r}-${c}`} x={156 + c * 13} y={238 + r * 9.6} width="9.6" height="7" rx=".8" fill="rgb(96,165,250)" opacity=".34" />
        ))
      )}
      <path
        d="M156 275 H280 M280 275 V281 H156 V287 H280"
        fill="none"
        stroke="rgba(147,197,253,.7)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <text x="150" y="186" fill="rgba(147,197,253,.95)" fontFamily="JetBrains Mono Variable, monospace" fontSize="7.5" letterSpacing=".8">
        ZT-AFE1 · ANALOG FRONT-END
      </text>
    </svg>
  );
}

const BUS = [
  "M172 70H206V190",
  "M172 90H224V190",
  "M172 110H242V190",
  "M172 130H260V190",
  "M172 150H278V190",
];
const LINKS = [
  "M60 174V190",
  "M80 174V190",
  "M100 174V190",
  "M132 220H148",
  "M132 240H148",
  "M132 262H148",
];

function Metal() {
  return (
    <svg viewBox="0 0 320 320" className="h-full w-full" focusable="false">
      {/* power rails */}
      <rect x="22" y="22" width="276" height="276" rx="8" fill="none" stroke="rgba(34,211,238,.3)" strokeWidth="1.6" />
      <rect x="26" y="26" width="268" height="268" rx="6" fill="none" stroke="rgba(59,130,246,.35)" strokeWidth="1" />
      {/* routing */}
      {[...BUS, ...LINKS].map((d) => (
        <path key={d} d={d} fill="none" stroke="rgba(96,165,250,.55)" strokeWidth="1.1" strokeLinejoin="round" />
      ))}
      {/* pad feeders */}
      {[40, 70, 100, 130, 160].map((x) => (
        <path key={x} d={`M${x} 30V12`} stroke="rgba(96,165,250,.4)" strokeWidth="1" />
      ))}
      {[200, 230, 260].map((y) => (
        <path key={y} d={`M290 ${y}H308`} stroke="rgba(96,165,250,.4)" strokeWidth="1" />
      ))}
      {/* travelling data */}
      {BUS.map((d, i) => (
        <path
          key={`p-${d}`}
          d={d}
          pathLength="100"
          fill="none"
          stroke="rgb(165,243,252)"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="trace-pulse"
          style={{ animationDelay: `${i * 0.45}s` }}
        />
      ))}
      {LINKS.map((d, i) => (
        <path
          key={`l-${d}`}
          d={d}
          pathLength="100"
          fill="none"
          stroke="rgb(147,197,253)"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="trace-pulse"
          style={{ animationDelay: `${0.3 + i * 0.6}s`, animationDuration: "3.4s" }}
        />
      ))}
    </svg>
  );
}

function Pads() {
  const pad = (x, y, i) => (
    <rect
      key={`${x}-${y}`}
      x={x}
      y={y}
      width="7"
      height="7"
      rx="1"
      fill="rgba(8,12,28,.95)"
      stroke="rgba(147,197,253,.85)"
      strokeWidth=".9"
      className={i % 5 === 0 ? "pad-blink" : undefined}
      style={i % 5 === 0 ? { animationDelay: `${(i % 7) * 0.35}s` } : undefined}
    />
  );
  return (
    <svg viewBox="0 0 320 320" className="h-full w-full" focusable="false">
      <rect x="2" y="2" width="316" height="316" rx="12" fill="rgba(37,99,235,.05)" stroke="rgba(147,197,253,.55)" strokeWidth="1" />
      {PADS.map((p, i) => pad(p, 5, i))}
      {PADS.map((p, i) => pad(p, 308, i + 2))}
      {PADS.map((p, i) => pad(5, p, i + 1))}
      {PADS.map((p, i) => pad(308, p, i + 3))}
    </svg>
  );
}

/**
 * Four SVG layers (substrate · devices · metal · pads) stacked in CSS 3D. The
 * stack floats, tilts with --tx / --ty (set by the hero from the pointer) and
 * "explodes" on hover so the layers separate.
 */
function ChipStack({ className = "" }) {
  const uid = useId().replace(/:/g, "");
  const cells = useMemo(buildCells, []);
  const [gateRef, gate] = useAnimationGate();

  return (
    <div ref={gateRef} className={`chip-stage ${gate} ${className}`} aria-hidden="true">
      <div className="chip-halo" />
      <div className="chip-stack">
        <div className="chip-layer" style={{ "--i": 0 }}>
          <Substrate uid={uid} />
        </div>
        <div className="chip-layer" style={{ "--i": 1 }}>
          <Devices cells={cells} />
        </div>
        <div className="chip-layer" style={{ "--i": 2 }}>
          <Metal />
        </div>
        <div className="chip-layer" style={{ "--i": 3 }}>
          <Pads />
        </div>
      </div>
      <div className="chip-shadow" />
    </div>
  );
}

export default ChipStack;
