import { useId } from "react";

import { fmtInt } from "../format";
import Icon from "./icons";

const SIZES = [25, 50, 100];

/** "Showing 26–50 of 132", previous / next, and a page-size choice. Pages are 1-based. */
export default function Pagination({ page, size, total, shown, onPage, onSize }) {
  const sizeId = useId();
  if (!total) return null;
  const pages = Math.max(1, Math.ceil(total / size));
  const from = (page - 1) * size + 1;
  const to = Math.min(total, (page - 1) * size + Math.max(shown, 1));
  return (
    <nav className="adm-pager" aria-label="Pagination">
      <div>
        Showing{" "}
        <strong className="adm-num" style={{ color: "var(--adm-text)" }}>
          {fmtInt(from)}–{fmtInt(to)}
        </strong>{" "}
        of <span className="adm-num">{fmtInt(total)}</span>
      </div>
      <div className="adm-pager__nav">
        <button type="button" className="adm-btn adm-btn--sm" onClick={() => onPage(page - 1)} disabled={page <= 1}>
          <Icon name="chevronLeft" size={15} /> Previous
        </button>
        <span className="adm-num">
          Page {page} of {pages}
        </span>
        <button type="button" className="adm-btn adm-btn--sm" onClick={() => onPage(page + 1)} disabled={page >= pages}>
          Next <Icon name="chevronRight" size={15} />
        </button>
      </div>
      <div className="adm-pager__size">
        <label htmlFor={sizeId}>Per page</label>
        <span className="adm-selectwrap">
          <select id={sizeId} className="adm-select" value={size} onChange={(event) => onSize(Number(event.target.value))}>
            {SIZES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <Icon name="chevronDown" size={16} />
        </span>
      </div>
    </nav>
  );
}
