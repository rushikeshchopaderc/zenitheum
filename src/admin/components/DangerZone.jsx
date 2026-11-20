import { useEffect, useRef, useState } from "react";

import Icon from "./icons";

/**
 * Destructive actions at the foot of a drawer, each behind an inline confirmation (no nested modal).
 * actions: [{ id, label, title, text, confirmLabel, onConfirm }]; onConfirm resolves { ok }.
 * An action with `onRequest` skips the inline confirmation and lets the caller ask in its own way (a dialog).
 * A failed action keeps the confirmation open (a toast says why); success unmounts or updates the drawer.
 */
export default function DangerZone({ actions, busy }) {
  const [openId, setOpenId] = useState(null);
  const cancelRef = useRef(null);
  const active = actions.find((action) => action.id === openId);

  useEffect(() => {
    if (openId) cancelRef.current?.focus();
  }, [openId]);

  const run = async () => {
    const result = await active.onConfirm();
    if (result?.ok) setOpenId(null);
  };

  return (
    <div className="adm-danger">
      {!active ? (
        <div className="adm-danger__buttons">
          {actions.map((action) => (
            <button key={action.id} type="button" className="adm-btn adm-btn--danger" onClick={() => (action.onRequest ? action.onRequest() : setOpenId(action.id))}>
              <Icon name="trash" size={16} /> {action.label}…
            </button>
          ))}
        </div>
      ) : (
        <div className="adm-danger__confirm" role="alertdialog" aria-labelledby="adm-danger-title" aria-describedby="adm-danger-text">
          <strong id="adm-danger-title">{active.title}</strong>
          <p id="adm-danger-text">{active.text}</p>
          <div className="adm-danger__buttons">
            <button type="button" className="adm-btn" ref={cancelRef} onClick={() => setOpenId(null)} disabled={busy !== null}>
              Cancel
            </button>
            <button type="button" className="adm-btn adm-btn--danger-solid" onClick={run} disabled={busy !== null}>
              {busy === active.id ? <Icon name="spinner" size={15} className="adm-spin" /> : null}
              {active.confirmLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
