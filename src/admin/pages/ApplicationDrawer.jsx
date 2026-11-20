import { useMemo } from "react";

import { StatusBadge } from "../components/Badge";
import { NotesEditor, StatusSelect } from "../components/Controls";
import DangerZone from "../components/DangerZone";
import { DetailList, Section } from "../components/Detail";
import Drawer from "../components/Drawer";
import { Notice } from "../components/Feedback";
import Icon from "../components/icons";
import PersonActions from "../components/PersonActions";
import { Time } from "../components/Time";
import { firstName, mailtoHref, safeHttpUrl, shortUrl, telHref } from "../format";
import useCloseGuard from "../hooks/useCloseGuard";
import useRecordActions from "../hooks/useRecordActions";
import { APPLICATION_STATUSES, trackLabel } from "../labels";

/** A link typed into a public form: a link only when it is a plain http(s) address, otherwise just text. */
function WebLink({ value }) {
  const href = safeHttpUrl(value);
  if (!href) {
    return (
      <span>
        <span className="adm-break">{value}</span> <span className="adm-muted">(not a web address, so it is not linked)</span>
      </span>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="adm-break">
      {shortUrl(href)} <Icon name="external" size={13} />
    </a>
  );
}

/** One job application in full: the résumé (a Google Drive link), the applicant, a pipeline stage and notes. */
export default function ApplicationDrawer({ row, onClose, onUpdated, onRemoved, returnFocus }) {
  const { requestClose, setDirty, warned } = useCloseGuard(onClose);
  const actions = useRecordActions({ collection: "applications", responseKey: "application", noun: "Application", row, onUpdated, onRemoved });
  const tel = telHref(row.phone);
  const resumeHref = safeHttpUrl(row.resumeUrl);

  const mailHref = useMemo(
    () => mailtoHref(row.email, { subject: `Your application: ${row.jobTitle} (${row.ref})`, body: `Hi ${firstName(row.name)},\n\nThank you for applying for the ${row.jobTitle} role at Zenitheum.\n\n` }),
    [row.email, row.jobTitle, row.ref, row.name],
  );

  return (
    <Drawer
      title={row.name}
      subtitle={
        <span style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: "2px 10px" }}>
          <StatusBadge kind="application" value={row.status} />
          <span className="adm-mono adm-muted">{row.ref}</span>
          <Time value={row.createdAt} className="adm-muted" />
        </span>
      }
      onClose={requestClose}
      returnFocus={returnFocus}
      closeLabel="Close application"
    >
      <div className="adm-headgrid">
        <StatusSelect label="Pipeline stage" value={row.status} options={APPLICATION_STATUSES} onSave={actions.saveStatus} hint="Saved as soon as you change it." />
        <PersonActions email={row.email} phone={row.phone} mailHref={mailHref} mailLabel="Email applicant" />
      </div>

      <Section title="Résumé" id="app-resume">
        {row.resumeUrl ? (
          <div className="adm-filelink">
            <Icon name="file" size={20} />
            <div className="adm-filelink__name">
              <div className="adm-break" style={{ color: "var(--adm-text)", fontWeight: 600 }}>
                {row.resumeName || "Résumé"}
              </div>
              <div className="adm-hint">Stored in Google Drive</div>
            </div>
            {resumeHref ? (
              <a className="adm-btn adm-btn--primary adm-btn--sm" href={resumeHref} target="_blank" rel="noopener noreferrer">
                <Icon name="external" size={14} /> Open résumé in Google Drive
              </a>
            ) : (
              <span className="adm-muted adm-break">{row.resumeUrl} (not a web address, so it is not linked)</span>
            )}
          </div>
        ) : (
          <p className="adm-hint">No résumé was attached to this application.</p>
        )}
      </Section>

      <Section title="Applicant" id="app-person">
        <DetailList
          items={[
            { label: "Email", value: <a href={mailHref}>{row.email}</a> },
            { label: "Phone", value: tel ? <a href={tel}>{row.phone}</a> : row.phone },
            { label: "Institute or employer", value: row.organisation },
            { label: "Profile", value: row.profileUrl ? <WebLink value={row.profileUrl} /> : null },
          ]}
        />
      </Section>

      <Section title="Role" id="app-role">
        <DetailList
          items={[
            { label: "Role", value: row.jobTitle },
            { label: "Role id", value: row.jobSlug, mono: true },
            { label: "Preferred track", value: row.track ? trackLabel(row.track) : null },
          ]}
        />
        {row.note ? <p className="adm-message">{row.note}</p> : <p className="adm-hint">The applicant did not add a note.</p>}
      </Section>

      <Section title="Internal notes" id="app-notes">
        {warned ? (
          <Notice tone="warn" icon="alert">
            You have unsaved notes. Save them, or close again to discard them.
          </Notice>
        ) : null}
        <NotesEditor key={row.id} value={row.notes} onSave={actions.saveNotes} saving={actions.busy === "notes"} onDirtyChange={setDirty} />
      </Section>

      <Section title="Danger zone" id="app-danger">
        <DangerZone
          busy={actions.busy}
          actions={[
            {
              id: "delete",
              label: "Delete application",
              title: "Delete this application?",
              text: `This permanently deletes the application from ${row.name} (${row.ref}). The résumé file stays in Google Drive until you remove it there. It can’t be undone.`,
              confirmLabel: "Delete application",
              onConfirm: actions.remove,
            },
          ]}
        />
      </Section>
    </Drawer>
  );
}
