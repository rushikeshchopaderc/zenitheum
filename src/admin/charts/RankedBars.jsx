import { Link } from "react-router-dom";

import { fmtInt, fmtPct } from "../format";

/**
 * Ranked horizontal bars for nominal categories (channels, pages, browsers...). One series, so one colour for
 * every bar (identity is the label, magnitude is the length: colour is not spent re-encoding the value).
 * Every figure is printed, so nothing depends on a tooltip. The bar is thin, square at its baseline and
 * rounded at the data end.
 *
 * items: [{ key, label, value, sub?, href?, mono?, color? }]   sub: text under the bar ("56 leads · 4.5% conversion");
 * color overrides the bar colour for ordinal categories (screen-width buckets) that read as an ordered ramp
 */
export default function RankedBars({ items, format = fmtInt, unit, share = false, label }) {
  const max = Math.max(...items.map((item) => item.value), 0) || 1;
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  return (
    <ul className="adm-bars" aria-label={label}>
      {items.map((item) => {
        const width = item.value > 0 ? Math.max((item.value / max) * 100, 1.5) : 0;
        return (
          <li className="adm-bars__row" key={item.key}>
            <div className="adm-bars__top">
              <span className={`adm-bars__label${item.mono ? " adm-mono" : ""}`}>
                {item.href ? <Link to={item.href}>{item.label}</Link> : item.label}
              </span>
              <span className="adm-bars__value adm-num">
                <strong>{format(item.value)}</strong>
                {unit ? <span className="adm-bars__unit"> {unit}</span> : null}
                {share ? <span className="adm-bars__share"> {fmtPct(item.value / total, 0)}</span> : null}
              </span>
            </div>
            <div className="adm-bars__track" aria-hidden="true">
              <span className="adm-bars__fill" style={{ width: `${width}%`, ...(item.color ? { background: item.color } : null) }} />
            </div>
            {item.sub ? <div className="adm-bars__sub">{item.sub}</div> : null}
          </li>
        );
      })}
    </ul>
  );
}
