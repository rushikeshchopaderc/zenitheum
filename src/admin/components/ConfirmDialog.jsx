import { useId, useRef } from "react";
import { createPortal } from "react-dom";

import { useOverlayRoot } from "../context/contexts";
import useModal from "../hooks/useModal";
import Icon from "./icons";

/** A small centred confirmation for destructive actions. Focus starts on Cancel, the safe choice. */
export default function ConfirmDialog({ title, children, confirmLabel = "Delete", danger = true, busy = false, onConfirm, onCancel, returnFocus }) {
  const root = useOverlayRoot();
  const panelRef = useRef(null);
  const titleId = useId();
  const bodyId = useId();
  useModal({ active: Boolean(root), panelRef, onClose: busy ? undefined : onCancel, returnFocus });
  if (!root) return null;

  return createPortal(
    <div className="adm-layer adm-dialog-layer">
      <div className="adm-scrim" onClick={busy ? undefined : onCancel} aria-hidden="true" />
      <section ref={panelRef} className="adm-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={bodyId} tabIndex={-1}>
        <h2 id={titleId} className="adm-h2" style={{ fontSize: 17 }}>
          {title}
        </h2>
        <div id={bodyId} style={{ color: "var(--adm-text-2)", fontSize: 13.5 }}>
          {children}
        </div>
        <div className="adm-dialog__actions">
          <button type="button" className="adm-btn" onClick={onCancel} disabled={busy} data-autofocus>
            Cancel
          </button>
          <button type="button" className={`adm-btn ${danger ? "adm-btn--danger-solid" : "adm-btn--primary"}`} onClick={onConfirm} disabled={busy}>
            {busy ? <Icon name="spinner" size={15} className="adm-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    root,
  );
}
