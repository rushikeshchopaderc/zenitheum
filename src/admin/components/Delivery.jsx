import { deliveryLines } from "../labels";

/**
 * Which chip, and how it is delivered: one line per chip. ZT-AFE1 shows the stored soft / hard / both choice,
 * ZT-SEC1 always reads "Soft IP only", and "both chips" shows both lines.
 */
export default function Delivery({ chip, analogFormat }) {
  const lines = deliveryLines(chip, analogFormat);
  if (!lines.length) return <span className="adm-muted">{"–"}</span>;
  return (
    <span className="adm-delivery">
      {lines.map((line) => (
        <span key={line.chip} className="adm-delivery__line">
          <strong>{line.code}</strong> {line.text}
        </span>
      ))}
    </span>
  );
}
