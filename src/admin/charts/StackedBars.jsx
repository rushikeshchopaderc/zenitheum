import { fmtInt } from "../format";
import TipLayer from "./TipLayer";
import useTip from "./useTip";

/**
 * Horizontal stacked bars: one row per category, one segment per series, all rows on one shared scale so
 * rows compare. Segments are separated by a 2px surface gap; each carries its own hover/focus tooltip
 * (category, series, value). The total is printed at the end of the row, and the table view repeats everything.
 *
 * rows: [{ key, label, total, parts: [{ id, label, value, color }] }]
 */
export default function StackedBars({ rows }) {
  const { tip, show, hide } = useTip();
  const widest = Math.max(...rows.map((row) => row.total), 0) || 1;
  return (
    <>
      <ul className="adm-bars adm-stacked">
        {rows.map((row) => (
          <li className="adm-bars__row" key={row.key}>
            <div className="adm-bars__top">
              <span className="adm-bars__label">{row.label}</span>
              <span className="adm-bars__value adm-num">
                <strong>{fmtInt(row.total)}</strong>
              </span>
            </div>
            <div className="adm-stacked__track" style={{ width: `${Math.max((row.total / widest) * 100, 3)}%` }}>
              {row.parts
                .filter((part) => part.value > 0)
                .map((part) => {
                  const content = { title: row.label, rows: [{ color: part.color, value: fmtInt(part.value), label: part.label }] };
                  return (
                    <span
                      key={part.id}
                      className="adm-stacked__part"
                      tabIndex={0}
                      role="img"
                      aria-label={`${row.label}, ${part.label}: ${fmtInt(part.value)}`}
                      style={{ flexGrow: part.value, background: part.color }}
                      onPointerEnter={(event) => show(event.currentTarget, content)}
                      onPointerLeave={hide}
                      onFocus={(event) => show(event.currentTarget, content)}
                      onBlur={hide}
                    />
                  );
                })}
            </div>
          </li>
        ))}
      </ul>
      <TipLayer tip={tip} />
    </>
  );
}
