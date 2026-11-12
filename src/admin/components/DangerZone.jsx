import { useEffect, useRef, useState } from "react";

import Icon from "./icons";

/**
 * Destructive actions at the foot of a drawer, each behind an inline confirmation (no nested modal).
 *
 * erase:  { available, onConfirm } erases the visitor's browsing data (right to erasure)
 * remove: { label, noun, onConfirm } deletes the record
 */
export default function DangerZone({ erase, remove, busy }) {
  const [mode, setMode] = useState(null); // "erase" | "remove" | null
  const cancelRef = useRef(null);

  useEffect(() => {
    if (mode) cancelRef.current?.focus({ preventScroll: false });
  }, [mode]);

  const run = async (action) => {
    const result = await action();
    // A failed action keeps the confirmation open (the toast says why); success unmounts or updates the drawer.
    if (result?.ok) setMode(null);
  };

  return (
    <div className="adm-danger">
      {mode === null ? (
        <div className="adm-danger__buttons">
          {erase?.available ? (
            <button type="button" className="adm-btn adm-btn--danger" onClick={() => setMode("erase")}>
              <Icon name="eraser" size={16} /> Erase browsing data…
            </button>
          ) : null}
          {remove ? (
            <button type="button" className="adm-btn adm-btn--danger" onClick={() => setMode("remove")}>
              <Icon name="trash" size={16} /> {remove.label}…
            </button>
          ) : null}
        </div>
      ) : (
        <div className="adm-danger__confirm" role="alertdialog" aria-labelledby="adm-danger-title" aria-describedby="adm-danger-text">
          <strong id="adm-danger-title">{mode === "erase" ? "Erase this visitor’s browsing data?" : `${remove.label}?`}</strong>
          <p id="adm-danger-text">
            {mode === "erase"
              ? "This permanently deletes every visit, page view and event recorded for this visitor’s browser, across all of their sessions. What the person typed into the form, and the campaign copied onto it, stay. It can’t be undone."
              : remove.noun
                ? `This permanently deletes ${remove.noun}. It can’t be undone.`
                : "This can’t be undone."}
          </p>
          <div className="adm-danger__buttons">
            <button type="button" className="adm-btn" ref={cancelRef} onClick={() => setMode(null)} disabled={busy !== null}>
              Cancel
            </button>
            <button type="button" className="adm-btn adm-btn--danger-solid" onClick={() => run(mode === "erase" ? erase.onConfirm : remove.onConfirm)} disabled={busy !== null}>
              {busy === "erase" || busy === "delete" ? <Icon name="spinner" size={15} className="adm-spin" /> : null}
              {mode === "erase" ? "Erase browsing data" : remove.confirmLabel ?? "Delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
