import useApiForm from "../../hooks/useApiForm";
import { postJson } from "../../lib/api";
import { describe } from "../../lib/aria";
import ChipFields from "./ChipFields";
import Field, { ConsentField, FormStatus, Honeypot } from "./Field";

/** The earliest delivery date we accept: tomorrow, India time. */
const tomorrow = () => new Date(Date.now() + 330 * 60_000 + 86_400_000).toISOString().slice(0, 10);

const initial = (defaults) => ({
  contactName: "", email: "", phone: "", organisation: "", jobTitle: "", chip: defaults.chip && defaults.chip !== "both" ? defaults.chip : "", analogFormat: "",
  quantity: "", deliveryDate: "", deliveryLocation: "", customisation: "", notes: "", consent: false, website: "",
});

/** Place an order: chip and delivery format, quantity, delivery date and location, and a contact person. */
export default function OrderForm({ defaults = {} }) {
  const form = useApiForm(initial(defaults));
  const { values, setValue, bind, errors, status, message, reference, run } = form;

  const onSubmit = (event) => {
    event.preventDefault();
    run(() => postJson("/orders", { ...values, quantity: values.quantity === "" ? "" : Number(values.quantity) }));
  };

  if (status === "sent") {
    return (
      <div className="panel hud p-8 text-center sm:p-10" role="status">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-2xl text-cyan-200">✓</span>
        <h3 className="mt-6 font-display text-2xl font-semibold text-white">Order request received</h3>
        <p className="mx-auto mt-3 max-w-md text-zinc-400">We have emailed you a copy and will confirm quantity, price and delivery shortly.</p>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-accent-300">Reference {reference}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="panel hud relative space-y-6 p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <ChipFields form={form} id="or" errors={errors} allowBoth={false} />
        <Field id="or-qty" label="Quantity" required error={errors.quantity} hint="Licences or chips">
          <input className="field" type="number" inputMode="numeric" min="1" max="10000000" step="1" {...bind("quantity")} {...describe("or-qty", errors.quantity)} />
        </Field>
        <Field id="or-date" label="Delivery date" required error={errors.deliveryDate}>
          <input className="field" type="date" min={tomorrow()} {...bind("deliveryDate")} {...describe("or-date", errors.deliveryDate)} />
        </Field>
      </div>

      <Field id="or-location" label="Delivery location" required error={errors.deliveryLocation} hint="Address or city and state">
        <textarea className="field min-h-[5rem] resize-y" rows={3} maxLength={300} {...bind("deliveryLocation")} {...describe("or-location", errors.deliveryLocation)} />
      </Field>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field id="or-name" label="Contact person" required error={errors.contactName}>
          <input className="field" type="text" autoComplete="name" maxLength={100} {...bind("contactName")} {...describe("or-name", errors.contactName)} />
        </Field>
        <Field id="or-title" label="Role" error={errors.jobTitle}>
          <input className="field" type="text" autoComplete="organization-title" maxLength={100} {...bind("jobTitle")} {...describe("or-title", errors.jobTitle)} />
        </Field>
        <Field id="or-email" label="Email" required error={errors.email}>
          <input className="field" type="email" autoComplete="email" maxLength={254} {...bind("email")} {...describe("or-email", errors.email)} />
        </Field>
        <Field id="or-phone" label="Phone" required error={errors.phone}>
          <input className="field" type="tel" inputMode="tel" autoComplete="tel" maxLength={24} {...bind("phone")} {...describe("or-phone", errors.phone)} />
        </Field>
        <Field id="or-org" label="Company" required error={errors.organisation} className="sm:col-span-2">
          <input className="field" type="text" autoComplete="organization" maxLength={150} {...bind("organisation")} {...describe("or-org", errors.organisation)} />
        </Field>
      </div>

      <Field id="or-custom" label="Customisation needed?" error={errors.customisation} hint="Optional: channels, interfaces, package, security features…">
        <textarea className="field min-h-[5rem] resize-y" rows={3} maxLength={3000} {...bind("customisation")} {...describe("or-custom", errors.customisation)} />
      </Field>
      <Field id="or-notes" label="Notes" error={errors.notes} hint="Optional">
        <textarea className="field min-h-[4rem] resize-y" rows={2} maxLength={2000} {...bind("notes")} {...describe("or-notes", errors.notes)} />
      </Field>

      <Honeypot value={values.website} onChange={(e) => setValue("website", e.target.value)} />
      <ConsentField id="or-consent" checked={values.consent} onChange={(e) => setValue("consent", e.target.checked)} error={errors.consent} />
      <FormStatus status={status} message={message} />
      <button type="submit" disabled={status === "sending"} className="btn-primary w-full disabled:cursor-wait disabled:opacity-70 sm:w-auto">
        {status === "sending" ? "Sending…" : "Place order"}
      </button>
    </form>
  );
}
