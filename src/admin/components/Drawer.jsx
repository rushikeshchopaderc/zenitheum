import { useId, useRef } from "react";
import { createPortal } from "react-dom";

import { useOverlayRoot } from "../context/contexts";
import useModal from "../hooks/useModal";
import Icon from "./icons";

/**
 * A modal layer: a right-hand drawer on wide screens, a full-screen sheet on phones (see admin.css), or a
 * left slide-over menu (side="left"). Escape closes, focus is trapped and restored, the page behind is locked
 * and inert, and the scrim closes it. It renders into the console's overlay root, not into the page flow.
 */
export default function Drawer({ title, subtitle, onClose, children, side = "right", wide = false, returnFocus, closeLabel = "Close", headExtras }) {
  const root = useOverlayRoot();
  const panelRef = useRef(null);
  const titleId = useId();
  useModal({ active: Boolean(root), panelRef, onClose, returnFocus });
  if (!root) return null;

  return createPortal(
    <div className="adm-layer">
      <div className="adm-scrim" onClick={onClose} aria-hidden="true" />
      <section
        ref={panelRef}
        className={`adm-drawer${side === "left" ? " adm-drawer--left" : ""}${wide ? " adm-drawer--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="adm-drawer__head">
          <div className="adm-drawer__titles">
            <h2 id={titleId} className="adm-drawer__title">
              {title}
            </h2>
            {subtitle ? <div className="adm-drawer__sub">{subtitle}</div> : null}
          </div>
          {headExtras}
          <button type="button" className="adm-iconbtn adm-iconbtn--bordered" onClick={onClose} aria-label={closeLabel}>
            <Icon name="x" size={18} />
          </button>
        </header>
        <div className="adm-drawer__body">{children}</div>
      </section>
    </div>,
    root,
  );
}
