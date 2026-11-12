import { fmtInt, fmtPct } from "../format";

/**
 * One whole split into a few parts, as a thin bar with no text on it (the list beside it carries the figures).
 * Parts are separated by a 2px gap of surface colour, never by a border. parts: [{ key, label, value, color }]
 */
export default function SegmentedBar({ parts, label }) {
  const visible = parts.filter((part) => part.value > 0);
  const total = visible.reduce((sum, part) => sum + part.value, 0);
  if (!total) return null;
  const summary = visible.map((part) => `${part.label} ${fmtInt(part.value)} (${fmtPct(part.value / total, 0)})`).join(", ");
  return (
    <div className="adm-segbar" role="img" aria-label={`${label}: ${summary}`}>
      {visible.map((part) => (
        <span key={part.key} className="adm-segbar__part" style={{ flexGrow: part.value, background: part.color }} title={`${part.label}: ${fmtInt(part.value)}`} />
      ))}
    </div>
  );
}
