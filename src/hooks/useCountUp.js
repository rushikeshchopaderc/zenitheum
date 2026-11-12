import { useEffect, useState } from "react";
import useReducedMotion from "./useReducedMotion";

/** Eases a number from 0 to `target` once `start` is true. */
export function useCountUp(target, { start = true, duration = 1400, decimals = 0 } = {}) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return undefined;
    if (reduce) {
      setValue(target);
      return undefined;
    }
    let frame;
    const t0 = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - t0) / duration);
      setValue(target * (1 - (1 - progress) ** 3));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, start, duration, reduce]);

  return decimals ? value.toFixed(decimals) : Math.round(value);
}

export default useCountUp;
