import { useRef } from "react";

/**
 * Tabs with the WAI-ARIA keyboard model (Left/Right/Home/End move and select; only the selected tab is in the
 * tab order). `tabs`: [{ id, label }]. The panel must carry id `${idPrefix}-panel` and aria-labelledby `${idPrefix}-${selected}`.
 */
export default function Tabs({ tabs, selected, onSelect, label, idPrefix }) {
  const refs = useRef({});
  const onKeyDown = (event) => {
    const index = tabs.findIndex((tab) => tab.id === selected);
    let next = null;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    if (next === null) return;
    event.preventDefault();
    onSelect(tabs[next].id);
    refs.current[tabs[next].id]?.focus();
  };
  return (
    <div className="adm-tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`${idPrefix}-${tab.id}`}
          aria-selected={selected === tab.id}
          aria-controls={`${idPrefix}-panel`}
          tabIndex={selected === tab.id ? 0 : -1}
          ref={(element) => {
            refs.current[tab.id] = element;
          }}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
