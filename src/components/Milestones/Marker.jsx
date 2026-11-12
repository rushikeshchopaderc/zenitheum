import { STATUS_META } from "../../lib/milestones";

/**
 * One milestone marker. Shape + fill carry the meaning, not just colour:
 * a circle is a milestone, a diamond is a decision gate; filled with a tick = completed,
 * ring with a pulsing dot = in progress, empty ring = upcoming, solid red = delayed.
 */
function Marker({ status, kind = "milestone", size = 14, className = "" }) {
  const meta = STATUS_META[status] ?? STATUS_META.upcoming;
  const gate = kind === "gate";
  const filled = status === "completed" || status === "delayed";

  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 items-center justify-center border-2 ${gate ? "rotate-45 rounded-[3px]" : "rounded-full"} ${className}`}
      style={{
        width: size,
        height: size,
        borderColor: meta.color,
        background: filled ? meta.color : "#09090b",
        boxShadow: status === "completed" ? `0 0 10px ${meta.color}66` : status === "in_progress" ? `0 0 0 3px ${meta.color}2b` : "none",
      }}
    >
      {status === "in_progress" && (
        <>
          <span className="absolute inset-[-5px] animate-pulse-ring rounded-[inherit] border" style={{ borderColor: meta.color }} />
          <span className={`h-[5px] w-[5px] ${gate ? "rounded-[1px]" : "rounded-full"}`} style={{ background: meta.color }} />
        </>
      )}
      {status === "completed" && (
        <svg viewBox="0 0 10 10" className={`h-[7px] w-[7px] ${gate ? "-rotate-45" : ""}`} fill="none" stroke="#052e1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.8 5.4 4 7.6l4.2-5" />
        </svg>
      )}
    </span>
  );
}

export default Marker;
