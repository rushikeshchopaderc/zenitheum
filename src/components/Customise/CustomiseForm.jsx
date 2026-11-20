import useApiForm from "../../hooks/useApiForm";
import { postJson } from "../../lib/api";
import { describe } from "../../lib/aria";
import ChipFields from "../forms/ChipFields";
import Field, { ConsentField, FormStatus, Honeypot } from "../forms/Field";

const initial = (defaults) => ({ name: "", email: "", phone: "", organisation: "", chip: defaults.chip ?? "", analogFormat: "", message: "", consent: false, website: "" });

/** A customisation request: which chip, how it should be delivered (ZT-AFE1), and what has to change. Stored with the questions. */
export default function CustomiseForm({ defaults = {}, onDone }) {
  const form = useApiForm(initial(defaults));
  const { values, setValue, bind, errors, status, message, reference, run } = form;

  if (status === "sent") {
    return (
      <div className="py-6 text-center" role="status">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-2xl text-cyan-200">✓</span>
        <h3 className="mt-6 font-display text-2xl font-semibold text-white">Request received</h3>
        <p className="mx-auto mt-3 max-w-md text-zinc-400">Thank you. Our team will read what you need and reply by email.</p>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-accent-300">Reference {reference}</p>
        <button type="button" onClick={onDone} className="btn-ghost mt-8">
          Close
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        run(() => postJson("/contact", { ...values, topic: "customisation" }));
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="cz-name" label="Your name" required error={errors.name}>
          <input className="field" type="text" autoComplete="name" maxLength={100} {...bind("name")} {...describe("cz-name", errors.name)} />
        </Field>
        <Field id="cz-email" label="Work email" required error={errors.email}>
          <input className="field" type="email" autoComplete="email" maxLength={254} {...bind("email")} {...describe("cz-email", errors.email)} />
        </Field>
        <Field id="cz-org" label="Company" error={errors.organisation}>
          <input className="field" type="text" autoComplete="organization" maxLength={150} {...bind("organisation")} {...describe("cz-org", errors.organisation)} />
        </Field>
        <Field id="cz-phone" label="Phone" error={errors.phone}>
          <input className="field" type="tel" inputMode="tel" autoComplete="tel" maxLength={24} {...bind("phone")} {...describe("cz-phone", errors.phone)} />
        </Field>
        <ChipFields form={form} id="cz" errors={errors} />
      </div>
      <Field id="cz-message" label="What should we customise?" required error={errors.message} hint="Channels, interfaces, pin-out, security features, package, timing: whatever your product needs.">
        <textarea className="field min-h-[7rem] resize-y" rows={5} maxLength={4000} {...bind("message")} {...describe("cz-message", errors.message)} />
      </Field>
      <Honeypot value={values.website} onChange={(e) => setValue("website", e.target.value)} />
      <ConsentField id="cz-consent" checked={values.consent} onChange={(e) => setValue("consent", e.target.checked)} error={errors.consent} />
      <FormStatus status={status} message={message} />
      <button type="submit" disabled={status === "sending"} className="btn-primary w-full disabled:cursor-wait disabled:opacity-70 sm:w-auto">
        {status === "sending" ? "Sending…" : "Send customisation request"}
      </button>
    </form>
  );
}
