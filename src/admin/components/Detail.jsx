import { channelLabel } from "../labels";
import { fmtInt } from "../format";

/** A titled block inside a drawer. */
export function Section({ title, action, children, id }) {
  return (
    <section className="adm-section" aria-labelledby={id}>
      <div className="adm-section__head">
        <h3 className="adm-section__title" id={id}>
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * Label / value pairs. items: [{ label, value, mono?, empty? }]. A missing value shows an en dash,
 * so the shape of a record is always the same. Values are rendered as text, never as HTML.
 */
export function DetailList({ items }) {
  return (
    <dl className="adm-dl">
      {items.map((item) => {
        const missing = item.value === null || item.value === undefined || item.value === "";
        return (
          <div className="adm-dl__row" key={item.label}>
            <dt>{item.label}</dt>
            <dd className={`${item.mono ? "adm-mono " : ""}adm-break${missing ? " adm-muted" : ""}`}>{missing ? "–" : item.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}

/** Where a lead came from, as copied onto it when it was created. */
export function AttributionBlock({ row }) {
  return (
    <DetailList
      items={[
        { label: "Channel", value: row.channel ? channelLabel(row.channel) : null },
        { label: "Campaign", value: row.utmCampaign, mono: true },
        { label: "Source", value: row.utmSource, mono: true },
        { label: "Medium", value: row.utmMedium, mono: true },
        { label: "Referrer", value: row.referrerHost },
        { label: "Landing page", value: row.landingPath, mono: true },
      ]}
    />
  );
}

/** "42 characters" style counter for text areas. */
export const CharCount = ({ value, max }) => (
  <span className="adm-hint adm-num">
    {fmtInt(value.length)} / {fmtInt(max)}
  </span>
);
