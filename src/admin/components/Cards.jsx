import { useId } from "react";

/** A titled card. Filters never live inside one: they sit in a single row above the screen's content. */
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
