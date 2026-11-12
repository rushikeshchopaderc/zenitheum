import useReveal from "../../hooks/useReveal";
import useCountUp from "../../hooks/useCountUp";

/** A number that eases up from zero the first time it scrolls into view. */
function CountUp({ value, prefix = "", suffix = "", decimals = 0, duration = 1400, className = "" }) {
  const [ref, visible] = useReveal({ threshold: 0.5 });
  const current = useCountUp(value, { start: visible, duration, decimals });
  return (
    <span ref={ref} className={className}>
      {prefix}
      {current}
      {suffix}
    </span>
  );
}

export default CountUp;
