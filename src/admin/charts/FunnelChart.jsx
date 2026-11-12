import { fmtInt, fmtPct } from "../format";

const STAGES = [
  { key: "visits", label: "Visited the site" },
  { key: "viewedProducts", label: "Viewed a product page" },
  { key: "clickedCta", label: "Clicked a call to action" },
  { key: "startedForm", label: "Started a form" },
  { key: "submittedForm", label: "Submitted a form" },
];

/**
 * The visit-to-form funnel. Stages are ordered, so they take a one-hue ramp (validated as an ordinal ramp):
 * the order reads in the colour as well as in the position, and the small last bars are the brightest.
 * Counts are visits (sessions), not people. A session can reach a later stage without passing an earlier one
 * (a direct link to the contact page), so "of previous step" can exceed 100% in rare cases and is shown as is.
 */
export default function FunnelChart({ funnel }) {
  const values = STAGES.map((stage) => funnel?.[stage.key] ?? 0);
  const widest = Math.max(...values, 0) || 1;
  const visits = values[0];
  return (
    <ol className="adm-funnel" aria-label="Conversion funnel">
      {STAGES.map((stage, index) => {
        const value = values[index];
        const previous = index > 0 ? values[index - 1] : null;
        return (
          <li key={stage.key} className="adm-funnel__row">
            <div className="adm-funnel__top">
              <span className="adm-funnel__label">{stage.label}</span>
              <span className="adm-num">
                <strong className="adm-funnel__value">{fmtInt(value)}</strong>
                {index > 0 && visits > 0 ? <span className="adm-bars__share"> {fmtPct(value / visits, 1)} of visits</span> : null}
              </span>
            </div>
            <div className="adm-bars__track adm-funnel__track" aria-hidden="true">
              <span className="adm-funnel__fill" style={{ width: `${value > 0 ? Math.max((value / widest) * 100, 1.5) : 0}%`, background: `var(--adm-ord-${index + 1})` }} />
            </div>
            {previous !== null ? (
              <div className="adm-bars__sub">{previous > 0 ? `${fmtPct(value / previous, 0)} of the previous step` : "No visits reached the previous step"}</div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
