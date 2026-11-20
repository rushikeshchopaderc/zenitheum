import { SEGMENTS } from "@shared/market.js";
import useApiForm from "../../hooks/useApiForm";
import { postJson } from "../../lib/api";
import { describe } from "../../lib/aria";
import ChipFields from "./ChipFields";
import Field, { ConsentField, FormStatus, Honeypot } from "./Field";

const initial = (defaults) => ({ name: "", email: "", phone: "", organisation: "", jobTitle: "", segment: defaults.segment ?? "", chip: defaults.chip ?? "", message: "", consent: false, website: "" });

/** A short question for the team. */
export default function QuestionForm({ defaults = {} }) {
  const form = useApiForm(initial(defaults));
  const { values, setValue, bind, errors, status, message, reference, run } = form;

  if (status === "sent") {
    return (
      <div className="panel hud p-8 text-center sm:p-10" role="status">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-2xl text-cyan-200">✓</span>
        <h3 className="mt-6 font-display text-2xl font-semibold text-white">Message received</h3>
        <p className="mx-auto mt-3 max-w-md text-zinc-400">Thank you. We will reply as soon as we can.</p>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-accent-300">Reference {reference}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        run(() => postJson("/contact", values));
      }}
      noValidate
      className="panel hud relative space-y-6 p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field id="qs-name" label="Your name" required error={errors.name}>
          <input className="field" type="text" autoComplete="name" maxLength={100} {...bind("name")} {...describe("qs-name", errors.name)} />
        </Field>
        <Field id="qs-email" label="Work email" required error={errors.email}>
          <input className="field" type="email" autoComplete="email" maxLength={254} {...bind("email")} {...describe("qs-email", errors.email)} />
        </Field>
        <Field id="qs-org" label="Company" error={errors.organisation}>
          <input className="field" type="text" autoComplete="organization" maxLength={150} {...bind("organisation")} {...describe("qs-org", errors.organisation)} />
        </Field>
        <Field id="qs-phone" label="Phone" error={errors.phone}>
          <input className="field" type="tel" inputMode="tel" autoComplete="tel" maxLength={24} {...bind("phone")} {...describe("qs-phone", errors.phone)} />
        </Field>
        <Field id="qs-segment" label="What do you build?" error={errors.segment}>
          <select className="field" {...bind("segment")} {...describe("qs-segment", errors.segment)}>
            <option value="">Choose the closest</option>
            {SEGMENTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <ChipFields form={form} id="qs" errors={errors} required={false} askFormat={false} placeholder="Not sure yet" />
      </div>
      <Field id="qs-message" label="Your question" required error={errors.message}>
        <textarea className="field min-h-[7rem] resize-y" rows={5} maxLength={4000} {...bind("message")} {...describe("qs-message", errors.message)} />
      </Field>
      <Honeypot value={values.website} onChange={(e) => setValue("website", e.target.value)} />
      <ConsentField id="qs-consent" checked={values.consent} onChange={(e) => setValue("consent", e.target.checked)} error={errors.consent} />
      <FormStatus status={status} message={message} />
      <button type="submit" disabled={status === "sending"} className="btn-primary w-full disabled:cursor-wait disabled:opacity-70 sm:w-auto">
        {status === "sending" ? "Sending…" : "Send question"}
      </button>
    </form>
  );
}
