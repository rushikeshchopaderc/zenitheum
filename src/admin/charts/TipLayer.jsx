/**
 * Renders the tooltip for useTip(). content: { title, rows: [{ color, label, value }] }.
 * Values lead (strong), labels follow (secondary); each row is keyed by a short colour stroke, not a box.
 * Everything arrives as React text, never as HTML.
 */
export default function TipLayer({ tip }) {
  if (!tip) return null;
  const vw = typeof window === "undefined" ? 1200 : window.innerWidth;
  const left = Math.min(Math.max(tip.x, 130), vw - 130);
  const above = tip.top > 120;
  return (
    <div
      className="adm-tip adm-tip--fixed"
      role="presentation"
      style={{ left, top: above ? tip.top - 8 : tip.bottom + 8, transform: above ? "translate(-50%, -100%)" : "translate(-50%, 0)" }}
    >
      {tip.content.title ? <div className="adm-tip__title">{tip.content.title}</div> : null}
      {tip.content.rows.map((row, index) => (
        <div className="adm-tip__row" key={index}>
          {row.color ? <span className="adm-tip__key" style={{ background: row.color }} aria-hidden="true" /> : null}
          <span className="adm-tip__val adm-num">{row.value}</span>
          <span className="adm-tip__name">{row.label}</span>
        </div>
      ))}
    </div>
  );
}
