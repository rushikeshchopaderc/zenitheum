import { describe } from "../../lib/aria";

/** Label + control + hint/error. Controls get id / aria wiring via `describe(id, error)` from lib/aria. */
function Field({ id, label, error, hint, required, children, className = "" }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {required && (
          <span aria-hidden="true" className="text-accent-400">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

/** Honeypot: invisible to people, irresistible to form-filling bots. */
export function Honeypot({ value, onChange }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={onChange} />
      </label>
    </div>
  );
}

export function ConsentField({ id, checked, onChange, error }) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-zinc-400">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          {...describe(id, error)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-ink-800 accent-accent-600"
        />
        <span>
          I agree that Zenitheum may store and use these details to respond to me, as described in the{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-accent-300 underline underline-offset-4">
            privacy notice
          </a>
          .
        </span>
      </label>
      {error && (
        <p id={`${id}-error`} role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormStatus({ status, message }) {
  if (status !== "error" || !message) return null;
  return (
    <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      {message}
    </p>
  );
}

export default Field;
