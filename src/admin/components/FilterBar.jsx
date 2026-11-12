import { useId, useState } from "react";

import Icon from "./icons";

/**
 * One filter row above the list it scopes: a search box, the filter fields (children), a result summary and
 * the actions (clear, export). On phones the fields fold behind a "Filters" button; the search stays visible.
 */
export default function FilterBar({ search, panelActive = 0, anyActive = false, onClear, summary, actions, children }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="adm-filters" role="search">
      <div className={`adm-filters__top${search ? "" : " adm-filters__top--solo"}`}>
        {search}
        {children ? (
          <button type="button" className="adm-btn adm-filters__toggle" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)}>
            <Icon name="filter" size={16} />
            Filters
            {panelActive > 0 ? <span className="adm-filterbadge">{panelActive}</span> : null}
          </button>
        ) : null}
      </div>
      {children ? (
        <div className="adm-filters__panel" id={panelId} data-open={open}>
          {children}
        </div>
      ) : null}
      <div className="adm-filters__foot">
        <span className="adm-filters__count" aria-live="polite">
          {summary}
        </span>
        <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 8 }}>
          {anyActive ? (
            <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={onClear}>
              <Icon name="reset" size={14} /> Clear filters
            </button>
          ) : null}
          {actions}
        </span>
      </div>
    </div>
  );
}
