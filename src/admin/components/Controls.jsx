import { useEffect, useId, useRef, useState } from "react";

import { useToast } from "../context/contexts";
import { copyText } from "../format";
import { CharCount } from "./Detail";
import { Field } from "./Fields";
import Icon from "./icons";

/** A select that saves as soon as it changes. Shows the new value at once and reverts if the save fails. */
export function StatusSelect({ label = "Status", value, options, onSave, hint, labelHidden = false }) {
  const [pending, setPending] = useState(null);
  const shown = pending ?? value;

  const change = async (next) => {
    if (pending !== null || next === value) return;
    setPending(next);
    try {
      await onSave(next);
    } finally {
      setPending(null);
    }
  };

  return (
    <Field label={label} labelHidden={labelHidden} hint={pending !== null ? "Saving…" : hint}>
      {(props) => (
        <span className="adm-selectwrap">
          <select className="adm-select" value={shown} onChange={(event) => change(event.target.value)} aria-busy={pending !== null} {...props}>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
            {!options.some((option) => option.id === shown) ? <option value={shown}>{shown}</option> : null}
          </select>
          <Icon name={pending !== null ? "spinner" : "chevronDown"} size={16} className={pending !== null ? "adm-spin" : ""} />
        </span>
      )}
    </Field>
  );
}

/**
 * Internal notes with an explicit Save (Ctrl/Cmd+Enter works too). `onDirtyChange` lets the drawer
 * warn before it closes on unsaved text. Remount it (key) for a different record.
 */
export function NotesEditor({ value, onSave, saving, maxLength = 5000, onDirtyChange }) {
  const [text, setText] = useState(value ?? "");
  const [error, setError] = useState("");
  const saved = value ?? "";
  const dirty = text !== saved;
  const id = useId();

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  const save = async () => {
    if (!dirty || saving) return;
    setError("");
    const result = await onSave(text);
    if (!result.ok) setError(result.error?.errors?.notes || "");
    // The server trims and normalises line endings: show exactly what was stored.
    else if (typeof result.row?.notes === "string") setText(result.row.notes);
  };

  return (
    <div className="adm-notes">
      <Field label="Internal notes" error={error} hint="Only staff can see these. They are never shown on the website.">
        {(props) => (
          <textarea
            className="adm-textarea"
            value={text}
            maxLength={maxLength}
            rows={5}
            placeholder="Add context for the team: what was agreed, who follows up, next step…"
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                save();
              }
            }}
            data-notes-field
            {...props}
          />
        )}
      </Field>
      <div className="adm-notes__bar">
        <CharCount value={text} max={maxLength} />
        <span id={`${id}-state`} className="adm-notes__state" role="status">
          {dirty ? <span className="adm-notes__dirty">Unsaved changes</span> : saved ? "Saved" : ""}
        </span>
        <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" onClick={save} disabled={!dirty || saving} data-notes-save>
          {saving ? <Icon name="spinner" size={14} className="adm-spin" /> : <Icon name="save" size={14} />}
          Save notes
        </button>
      </div>
    </div>
  );
}

/** Copy `text` to the clipboard and say so. */
export function CopyButton({ text, label = "Copy", small = false, children }) {
  const toast = useToast();
  const [done, setDone] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    const ok = await copyText(text);
    if (ok) {
      toast.success("Copied to the clipboard");
      setDone(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setDone(false), 1800);
    } else {
      toast.error("Couldn’t copy automatically. Select the text and copy it by hand.");
    }
  };

  if (children) {
    return (
      <button type="button" className={`adm-btn${small ? " adm-btn--sm" : ""}`} onClick={copy}>
        <Icon name={done ? "check" : "copy"} size={15} />
        {done ? "Copied" : children}
      </button>
    );
  }
  return (
    <button type="button" className="adm-iconbtn adm-iconbtn--sm" onClick={copy} aria-label={label} title={label}>
      <Icon name={done ? "check" : "copy"} size={15} />
    </button>
  );
}
