import { useMemo } from "react";
import { mulberry32 } from "./circuitNetwork";
import useAnimationGate from "../../hooks/useAnimationGate";

/** Rows of hex bytes scrolling past, a few highlighted — "data moving through a datapath". */
function BitStream({ rows = 6, className = "" }) {
  const data = useMemo(() => {
    const rand = mulberry32(404);
    return Array.from({ length: rows }, () =>
      Array.from({ length: 36 }, () => ({
        t: Math.floor(rand() * 256)
          .toString(16)
          .toUpperCase()
          .padStart(2, "0"),
        hot: rand() < 0.09,
      }))
    );
  }, [rows]);

  const [gateRef, gate] = useAnimationGate();

  return (
    <div ref={gateRef} className={`bits ${gate} ${className}`} aria-hidden="true">
      {data.map((row, i) => (
        <div
          key={i}
          className="bits-row"
          style={{ "--dur": `${26 + i * 6}s`, animationDirection: i % 2 ? "reverse" : "normal" }}
        >
          {[...row, ...row].map((cell, j) => (
            <span key={j} className={cell.hot ? "bits-hot" : undefined}>
              {cell.t}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default BitStream;
