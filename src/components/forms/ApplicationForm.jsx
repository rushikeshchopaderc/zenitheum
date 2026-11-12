import { useRef, useState } from "react";
import useApiForm from "../../hooks/useApiForm";
import { postForm } from "../../lib/api";
import Field, { ConsentField, FormStatus, Honeypot } from "./Field";
import { describe } from "../../lib/aria";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = /\.(pdf|docx?)$/i;

function ApplicationForm({ job }) {
  const initial = { name: "", email: "", phone: "", organisation: "", profile: "", track: "", note: "", consent: false, website: "" };
  const form = useApiForm(initial, { formName: "application" });
  const { values, setValue, bind, errors, setErrors, status, message, reference, run } = form;
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  const onFile = (event) => {
    const picked = event.target.files?.[0] ?? null;
    if (picked && !ALLOWED.test(picked.name)) {
      setErrors((e) => ({ ...e, resume: "Upload a PDF, DOC or DOCX file." }));
      event.target.value = "";
      setFile(null);
      return;
    }
    if (picked && picked.size > MAX_BYTES) {
      setErrors((e) => ({ ...e, resume: "That file is over 5 MB. Please upload a smaller one." }));
      event.target.value = "";
      setFile(null);
      return;
    }
    setErrors((e) => ({ ...e, resume: undefined }));
    setFile(picked);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const data = new FormData();
    data.set("job", job.slug);
    Object.entries(values).forEach(([key, value]) => {
      if (value !== "" && value !== false) data.set(key, String(value));
    });
    if (file) data.set("resume", file);
    run(() => postForm("/applications", data));
  };

  if (status === "sent") {
    return (
      <div className="panel hud p-8 text-center" role="status">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-2xl text-cyan-200">
          ✓
        </span>
        <h3 className="mt-6 font-display text-2xl font-semibold text-white">Application received</h3>
        <p className="mt-3 text-zinc-400">
          Thanks for applying for <span className="text-white">{job.title}</span>. We read every application and will be in touch if there is a fit.
        </p>
        {reference && (
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-accent-300">Reference {reference}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="panel hud relative space-y-5 p-6 sm:p-8">
      <div>
        <h2 className="font-display text-xl font-semibold text-white">Apply for this role</h2>
        <p className="mt-1.5 text-sm text-zinc-400">A resume or a profile link is enough to start.</p>
      </div>

      <Field id="af-name" label="Full name" required error={errors.name}>
        <input className="field" type="text" autoComplete="name" maxLength={100} {...bind("name")} {...describe("af-name", errors.name)} />
      </Field>
      <Field id="af-email" label="Email" required error={errors.email}>
        <input className="field" type="email" autoComplete="email" maxLength={254} {...bind("email")} {...describe("af-email", errors.email)} />
      </Field>
      <Field id="af-phone" label="Phone" required error={errors.phone}>
        <input className="field" type="tel" autoComplete="tel" maxLength={24} {...bind("phone")} {...describe("af-phone", errors.phone)} />
      </Field>

      {job.tracks && (
        <Field id="af-track" label="Preferred track" required error={errors.track}>
          <select className="field" {...bind("track")} {...describe("af-track", errors.track)}>
            <option value="">Choose a track…</option>
            {job.tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field id="af-org" label={job.type === "Internship" ? "Institute" : "Current institute or employer"} error={errors.organisation}>
        <input className="field" type="text" autoComplete="organization" maxLength={150} {...bind("organisation")} {...describe("af-org", errors.organisation)} />
      </Field>
      <Field id="af-profile" label="GitHub, LinkedIn or portfolio" error={errors.profile} hint="Optional if you attach a resume">
        <input className="field" type="text" inputMode="url" placeholder="github.com/you" maxLength={300} {...bind("profile")} {...describe("af-profile", errors.profile)} />
      </Field>
      <Field id="af-resume" label="Resume" error={errors.resume} hint="PDF, DOC or DOCX · up to 5 MB">
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf"
          onChange={onFile}
          className="field cursor-pointer file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent-700 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-wider file:text-white hover:file:bg-accent-600"
          {...describe("af-resume", errors.resume)}
        />
      </Field>
      <Field id="af-note" label="Anything you would like us to know" error={errors.note} hint="What have you built or simulated? Optional.">
        <textarea className="field min-h-[7rem] resize-y" rows={4} maxLength={3000} {...bind("note")} {...describe("af-note", errors.note)} />
      </Field>

      <Honeypot value={values.website} onChange={(e) => setValue("website", e.target.value)} />
      <ConsentField id="af-consent" checked={values.consent} onChange={(e) => setValue("consent", e.target.checked)} error={errors.consent} />
      <FormStatus status={status} message={message} />

      <button type="submit" disabled={status === "sending"} className="btn-primary w-full disabled:cursor-wait disabled:opacity-70">
        {status === "sending" ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}

export default ApplicationForm;
