import { ANALOG_FORMATS, CHIPS, includesAnalog } from "@shared/market.js";
import useApiForm from "../../hooks/useApiForm";
import { postJson } from "../../lib/api";
import { Honeypot } from "./Field";

/**
 * Chip release news: an email plus the chip you care about and, for ZT-AFE1, how you would want it delivered
 * (ZT-SEC1 is soft IP only, so there is nothing to choose for it).
 */
export default function SubscribeForm({ source = "site", className = "" }) {
  const form = useApiForm({ email: "", chip: "both", analogFormat: "both", website: "" });
  const { values, setValue, bind, errors, status, message, run } = form;

  if (status === "sent") {
    return (
      <p role="status" className={`flex items-center gap-3 text-sm text-cyan-200 ${className}`}>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-xs">✓</span>
        You are on the list. We will write when a chip is released.
      </p>
    );
  }

  const select = "field !py-2.5 text-sm";
  return (
    <form
      noValidate
      className={`relative ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        run(() => postJson("/subscribe", { ...values, analogFormat: includesAnalog(values.chip) ? values.analogFormat : "", source }));
      }}
    >
      <label htmlFor={`sub-${source}`} className="sr-only">
        Email address
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
          {status === "sending" ? "Sending…" : "Notify me"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`sub-${source}-chip`} className="mb-1 block text-xs text-zinc-500">
            I am interested in
          </label>
          <select
            id={`sub-${source}-chip`}
            className={select}
            {...bind("chip")}
            onChange={(event) => {
              setValue("chip", event.target.value);
            }}
          >
            {CHIPS.map((chip) => (
              <option key={chip.id} value={chip.id}>
                {chip.label}
              </option>
            ))}
          </select>
        </div>
        {includesAnalog(values.chip) && (
          <div>
            <label htmlFor={`sub-${source}-format`} className="mb-1 block text-xs text-zinc-500">
              ZT-AFE1 delivered as
            </label>
            <select id={`sub-${source}-format`} className={select} {...bind("analogFormat")}>
              {ANALOG_FORMATS.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      {values.chip !== "analog" && <p className="mt-2 text-xs text-zinc-500">ZT-SEC1 is licensed as soft IP only.</p>}

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
