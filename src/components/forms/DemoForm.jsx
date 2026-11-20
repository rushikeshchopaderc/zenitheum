import { SEGMENTS } from "@shared/market.js";
import useApiForm from "../../hooks/useApiForm";
import { postJson } from "../../lib/api";
import { describe } from "../../lib/aria";
import ChipFields from "./ChipFields";
import Field, { ConsentField, FormStatus, Honeypot } from "./Field";
import SlotPicker from "./SlotPicker";
import { describeSlot } from "../../lib/slots";

const initial = (defaults) => ({
  name: "", email: "", phone: "", organisation: "", jobTitle: "", segment: defaults.segment ?? "", chip: defaults.chip ?? "", analogFormat: "",
  message: "", slot: "", consent: false, website: "",
});

/** Book a 30-minute Google Meet demo. The booking, the calendar invite and the Meet link are handled by the API. */
export default function DemoForm({ defaults = {} }) {
  const form = useApiForm(initial(defaults));
  const { values, setValue, bind, errors, status, message, result, run } = form;

  const onSubmit = (event) => {
    event.preventDefault();
    run(() => postJson("/demos", { ...values, visitorTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone }));
  };

  if (status === "sent") {
    return (
      <div className="panel hud p-8 text-center sm:p-10" role="status">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-2xl text-cyan-200">✓</span>
        <h3 className="mt-6 font-display text-2xl font-semibold text-white">{result?.scheduled ? "Your demo is booked" : "Demo request received"}</h3>
        <p className="mt-3 font-medium text-cyan-200">{describeSlot(result?.slot || values.slot)}</p>
        {result?.scheduled ? (
          <>
            <p className="mx-auto mt-4 max-w-md text-zinc-400">A calendar invitation with the Google Meet link is on its way to your email, and to our team.</p>
            {result.meetLink && (
              <a href={result.meetLink} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6">
                Google Meet link
              </a>
            )}
          </>
        ) : (
          <p className="mx-auto mt-4 max-w-md text-zinc-400">We have your slot and will email you the Google Meet link shortly.</p>
        )}
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-accent-300">Reference {result?.id}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="panel hud relative space-y-6 p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field id="dm-name" label="Your name" required error={errors.name}>
          <input className="field" type="text" autoComplete="name" maxLength={100} {...bind("name")} {...describe("dm-name", errors.name)} />
        </Field>
        <Field id="dm-email" label="Work email" required error={errors.email}>
          <input className="field" type="email" autoComplete="email" maxLength={254} {...bind("email")} {...describe("dm-email", errors.email)} />
        </Field>
        <Field id="dm-phone" label="Phone" required error={errors.phone}>
          <input className="field" type="tel" inputMode="tel" autoComplete="tel" maxLength={24} {...bind("phone")} {...describe("dm-phone", errors.phone)} />
        </Field>
        <Field id="dm-org" label="Company" required error={errors.organisation}>
          <input className="field" type="text" autoComplete="organization" maxLength={150} {...bind("organisation")} {...describe("dm-org", errors.organisation)} />
        </Field>
        <Field id="dm-title" label="Your role" error={errors.jobTitle}>
          <input className="field" type="text" autoComplete="organization-title" maxLength={100} {...bind("jobTitle")} {...describe("dm-title", errors.jobTitle)} />
        </Field>
        <Field id="dm-segment" label="What do you build?" error={errors.segment}>
          <select className="field" {...bind("segment")} {...describe("dm-segment", errors.segment)}>
            <option value="">Choose the closest</option>
            {SEGMENTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <ChipFields form={form} id="dm" errors={errors} />
      </div>

      <Field id="dm-message" label="Anything we should know?" error={errors.message} hint="Your product, the sensor or security need, any customisation you have in mind. Optional.">
        <textarea className="field min-h-[6rem] resize-y" rows={4} maxLength={2000} {...bind("message")} {...describe("dm-message", errors.message)} />
      </Field>

      <SlotPicker value={values.slot} onChange={(slot) => setValue("slot", slot)} error={errors.slot} />

      <Honeypot value={values.website} onChange={(e) => setValue("website", e.target.value)} />
      <ConsentField id="dm-consent" checked={values.consent} onChange={(e) => setValue("consent", e.target.checked)} error={errors.consent} />
      <FormStatus status={status} message={message} />
      <button type="submit" disabled={status === "sending"} className="btn-primary w-full disabled:cursor-wait disabled:opacity-70 sm:w-auto">
        {status === "sending" ? "Booking…" : "Book my demo"}
      </button>
    </form>
  );
}
