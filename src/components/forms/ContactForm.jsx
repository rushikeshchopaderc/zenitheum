import { useSearchParams } from "react-router-dom";
import { CHIPS, CONTACT_TOPICS, SEGMENTS, VOLUMES } from "@shared/market.js";
import useApiForm from "../../hooks/useApiForm";
import { postJson } from "../../lib/api";
import Field, { ConsentField, FormStatus, Honeypot } from "./Field";
import { describe } from "../../lib/aria";

const INITIAL = {
  name: "",
  email: "",
  phone: "",
  organisation: "",
  jobTitle: "",
  topic: "design-partner",
  segment: "",
  chip: "",
  volume: "",
  message: "",
  consent: false,
  website: "",
};

const known = (list, id) => (list.some((item) => item.id === id) ? id : "");

/** Topics that are about a product, where the segment / chip / volume questions make sense. */
const PRODUCT_TOPICS = new Set(["design-partner", "evaluation"]);

function Select({ id, label, error, hint, options, form, name, placeholder }) {
  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <select className="field" {...form.bind(name)} {...describe(id, error)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/**
 * The enquiry form. Links on the site pre-fill the topic, customer segment and chip
 * (/contactus?topic=design-partner&segment=weighing&chip=analog), so every lead arrives pre-qualified.
 */
function ContactForm() {
  const [params] = useSearchParams();
  const form = useApiForm(
    {
      ...INITIAL,
      topic: known(CONTACT_TOPICS, params.get("topic")) || INITIAL.topic,
      segment: known(SEGMENTS, params.get("segment")),
      chip: known(CHIPS, params.get("chip")),
    },
    { formName: "contact" }
  );
  const { values, setValue, bind, errors, status, message, reference, run } = form;
  const aboutProduct = PRODUCT_TOPICS.has(values.topic);

  const onSubmit = (event) => {
    event.preventDefault();
    const payload = { ...values };
    if (!aboutProduct) Object.assign(payload, { segment: "", chip: "", volume: "" });
    run(() => postJson("/contact", payload));
  };

  if (status === "sent") {
    return (
      <div className="panel hud p-8 text-center sm:p-12" role="status">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-2xl text-cyan-200">
          ✓
        </span>
        <h3 className="mt-6 font-display text-2xl font-semibold text-white">Message received</h3>
        <p className="mx-auto mt-3 max-w-md text-zinc-400">Thank you — we will get back to you as soon as we can.</p>
        {reference && <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-accent-300">Reference {reference}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="panel hud relative space-y-6 p-6 sm:p-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="cf-name" label="Your name" required error={errors.name}>
          <input className="field" type="text" autoComplete="name" maxLength={100} {...bind("name")} {...describe("cf-name", errors.name)} />
        </Field>
        <Field id="cf-email" label="Work email" required error={errors.email}>
          <input className="field" type="email" autoComplete="email" maxLength={254} {...bind("email")} {...describe("cf-email", errors.email)} />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="cf-org" label="Company" error={errors.organisation} hint="Optional">
          <input className="field" type="text" autoComplete="organization" maxLength={150} {...bind("organisation")} {...describe("cf-org", errors.organisation)} />
        </Field>
        <Field id="cf-title" label="Your role" error={errors.jobTitle} hint="Optional">
          <input className="field" type="text" autoComplete="organization-title" maxLength={100} {...bind("jobTitle")} {...describe("cf-title", errors.jobTitle)} />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="cf-phone" label="Phone" error={errors.phone} hint="Optional — if a call is easier">
          <input className="field" type="tel" autoComplete="tel" inputMode="tel" maxLength={24} {...bind("phone")} {...describe("cf-phone", errors.phone)} />
        </Field>
        <Field id="cf-topic" label="What is this about?" required error={errors.topic}>
          <select className="field" {...bind("topic")} {...describe("cf-topic", errors.topic)}>
            {CONTACT_TOPICS.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {aboutProduct && (
        <fieldset className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
          <legend className="mono-label px-2">About your product</legend>
          <div className="grid gap-6 sm:grid-cols-2">
            <Select id="cf-segment" label="What do you build?" form={{ bind }} name="segment" options={SEGMENTS} error={errors.segment} placeholder="Choose the closest…" />
            <Select id="cf-chip" label="Which chip interests you?" form={{ bind }} name="chip" options={CHIPS} error={errors.chip} placeholder="Not sure yet" />
          </div>
          <Select
            id="cf-volume"
            label="Expected annual volume"
            form={{ bind }}
            name="volume"
            options={VOLUMES}
            error={errors.volume}
            hint="A rough guess is plenty; it tells us how to prioritise."
            placeholder="Choose a range…"
          />
        </fieldset>
      )}

      <Field
        id="cf-message"
        label="Message"
        required
        error={errors.message}
        hint={aboutProduct ? "What do you build, which part would this replace, and what hurts most today — price, lead time, a single source, support?" : "How can we help?"}
      >
        <textarea className="field min-h-[9rem] resize-y" rows={6} maxLength={4000} {...bind("message")} {...describe("cf-message", errors.message)} />
      </Field>

      <Honeypot value={values.website} onChange={(e) => setValue("website", e.target.value)} />
      <ConsentField id="cf-consent" checked={values.consent} onChange={(e) => setValue("consent", e.target.checked)} error={errors.consent} />
      <FormStatus status={status} message={message} />

      <button type="submit" disabled={status === "sending"} className="btn-primary w-full disabled:cursor-wait disabled:opacity-70 sm:w-auto">
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

export default ContactForm;
