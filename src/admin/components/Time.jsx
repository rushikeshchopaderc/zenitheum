import { fmtDateTime, fmtYmd } from "../format";

/** A timestamp in the viewer's local time, compact, with the full ISO string as the tooltip. */
export function Time({ value, className }) {
  if (!value) return <span className={className}>{"–"}</span>;
  return (
    <time dateTime={String(value)} title={String(value)} className={className}>
      {fmtDateTime(value)}
    </time>
  );
}

/** A calendar date (YYYY-MM-DD) with no time zone shifting. */
export function DateOnly({ value, className }) {
  if (!value) return <span className={className}>{"–"}</span>;
  return (
    <time dateTime={value} title={value} className={className}>
      {fmtYmd(value)}
    </time>
  );
}
