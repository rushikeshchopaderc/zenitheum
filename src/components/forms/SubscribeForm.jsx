import useApiForm from "../../hooks/useApiForm";
import { postJson } from "../../lib/api";
import { Honeypot } from "./Field";

/** Early-access sign-up: one field, one button. `source` records where it was used. */
function SubscribeForm({ source = "site", label = "Email address", button = "Notify me", className = "" }) {
  const form = useApiForm({ email: "", website: "" }, { formName: `subscribe-${source}` });
  const { values, setValue, bind, errors, status, message, run } = form;

  if (status === "sent") {
    return (
      <p role="status" className={`flex items-center gap-3 text-sm text-cyan-200 ${className}`}>
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-xs">✓</span>
        You are on the list. We will write when something ships.
      </p>
    );
  }

  return (
    <form
      noValidate
      className={`relative ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        run(() => postJson("/subscribe", { email: values.email, source, website: values.website }));
      }}
    >
      <label htmlFor={`sub-${source}`} className="sr-only">
        {label}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={`sub-${source}`}
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          maxLength={254}
          aria-invalid={errors.email ? "true" : undefined}
          aria-describedby={errors.email || message ? `sub-${source}-msg` : undefined}
          className="field flex-1"
          {...bind("email")}
        />
        <button type="submit" disabled={status === "sending"} className="btn-primary shrink-0 !py-3 disabled:cursor-wait disabled:opacity-70">
          {status === "sending" ? "Sending…" : button}
        </button>
      </div>
      <Honeypot value={values.website} onChange={(e) => setValue("website", e.target.value)} />
      <p className="mt-2.5 text-xs text-zinc-500">
        By subscribing you agree to the{" "}
        <a href="/privacy" className="underline underline-offset-4 hover:text-zinc-300">
          privacy notice
        </a>
        .
      </p>
      {(errors.email || (status === "error" && message)) && (
        <p id={`sub-${source}-msg`} role="alert" className="field-error">
          {errors.email || message}
        </p>
      )}
    </form>
  );
}

export default SubscribeForm;
