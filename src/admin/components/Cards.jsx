import { useId } from "react";

import Icon from "./icons";

/** A titled card. Filters never live inside one: they sit in a single row above the screen's cards. */
export function Card({ title, subtitle, actions, children, className = "", bodyClassName = "" }) {
  const id = useId();
  return (
    <section className={`adm-card ${className}`.trim()} aria-labelledby={title ? id : undefined}>
      {title ? (
        <div className="adm-card__head">
          <div style={{ minWidth: 0 }}>
            <h2 className="adm-h2" id={id}>
              {title}
            </h2>
            {subtitle ? <p className="adm-card__sub">{subtitle}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      <div className={`adm-card__body ${bodyClassName}`.trim()}>{children}</div>
    </section>
  );
}

/** The "view as a table" switch every chart card offers (the accessible twin of the chart). */
export function TableToggle({ pressed, onToggle }) {
  return (
    <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" aria-pressed={pressed} onClick={onToggle}>
      <Icon name={pressed ? "chevronLeft" : "file"} size={14} />
      {pressed ? "Back to chart" : "Table view"}
    </button>
  );
}

/** Label, value and change vs the previous period. `change` is { tone, icon, text } from describeChange(). */
export function KpiTile({ label, value, change, title }) {
  return (
    <div className="adm-kpi" title={title}>
      <div className="adm-kpi__label">{label}</div>
      <div className="adm-kpi__value">{value}</div>
      {change ? (
        <div className={`adm-kpi__delta adm-kpi__delta--${change.tone}`}>
          <Icon name={change.icon} size={14} />
          <span>{change.text}</span>
        </div>
      ) : null}
    </div>
  );
}
