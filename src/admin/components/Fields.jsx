import { useEffect, useId, useRef, useState } from "react";

import Icon from "./icons";

/** Label + control + hint/error, wired with aria-describedby. `children` is a render function receiving the control props. */
export function Field({ label, hint, error, className = "", children, labelHidden = false }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`adm-field ${className}`.trim()}>
      <label className={labelHidden ? "adm-sr" : "adm-label"} htmlFor={id}>
        {label}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? "true" : undefined })}
      {error ? (
        <div className="adm-fielderror" id={errorId}>
          {error}
        </div>
      ) : null}
      {hint ? (
        <div className="adm-hint" id={hintId}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}

/** options: [{ value, label }] (or plain strings). `allLabel` adds an empty first option. */
export function SelectField({ label, value, onChange, options, allLabel, hint, error, className, labelHidden, disabled }) {
  return (
    <Field label={label} hint={hint} error={error} className={className} labelHidden={labelHidden}>
      {(props) => (
        <span className="adm-selectwrap">
          <select className="adm-select" value={value ?? ""} onChange={(event) => onChange(event.target.value)} disabled={disabled} {...props}>
            {allLabel !== undefined ? <option value="">{allLabel}</option> : null}
            {options.map((option) => {
              const item = typeof option === "string" ? { value: option, label: option } : option;
              return (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              );
            })}
          </select>
          <Icon name="chevronDown" size={16} />
        </span>
      )}
    </Field>
  );
}

export function InputField({ label, value, onChange, type = "text", hint, error, className, placeholder, maxLength, autoComplete, inputMode, disabled, min, max, labelHidden, mono = false }) {
  return (
    <Field label={label} hint={hint} error={error} className={className} labelHidden={labelHidden}>
      {(props) => (
        <input
          className={`adm-input${type === "date" ? " adm-input--date" : ""}${mono ? " adm-mono" : ""}`}
          type={type}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          inputMode={inputMode}
          disabled={disabled}
          min={min}
          max={max}
          {...props}
        />
      )}
    </Field>
  );
}

export function TextareaField({ label, value, onChange, hint, error, className, maxLength, rows = 4, placeholder, disabled }) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {(props) => (
        <textarea
          className="adm-textarea"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          maxLength={maxLength}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />
      )}
    </Field>
  );
}

/**
 * A search box for filters. The text is local while typing and committed through `onCommit` after a pause
 * (or at once on Enter / clear). A change from outside (Back button, "Clear filters") flows back in without
 * being echoed to the URL again.
 */
export function SearchBox({ value, onCommit, placeholder = "Search", label = "Search", delay = 350 }) {
  const id = useId();
  const [text, setText] = useState(value);
  const committed = useRef(value);
  const timer = useRef(0);
  const inputRef = useRef(null);
  const commitRef = useRef(onCommit);

  useEffect(() => {
    commitRef.current = onCommit;
  });
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      clearTimeout(timer.current);
      setText(value);
    }
  }, [value]);

  const commit = (next) => {
    const trimmed = next.trim();
    if (trimmed !== committed.current) {
      committed.current = trimmed;
      commitRef.current(trimmed);
    }
  };
  const change = (next) => {
    setText(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(next), delay);
  };

  return (
    <div className="adm-search">
      <label className="adm-sr" htmlFor={id}>
        {label}
      </label>
      <Icon name="search" size={16} />
      <input
        ref={inputRef}
        id={id}
        className="adm-input"
        type="search"
        value={text}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        maxLength={80}
        onChange={(event) => change(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            clearTimeout(timer.current);
            commit(text);
          }
        }}
      />
      {text ? (
        <button
          type="button"
          className="adm-iconbtn adm-iconbtn--sm adm-search__clear"
          aria-label="Clear search"
          onClick={() => {
            clearTimeout(timer.current);
            setText("");
            commit("");
            inputRef.current?.focus();
          }}
        >
          <Icon name="x" size={15} />
        </button>
      ) : null}
    </div>
  );
}
