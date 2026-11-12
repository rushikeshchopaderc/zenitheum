import { useMemo } from "react";

import { resumeHref } from "../api";
import { StatusBadge } from "../components/Badge";
import { CopyButton, NotesEditor, StatusSelect } from "../components/Controls";
import DangerZone from "../components/DangerZone";
import { AttributionBlock, DetailList, Section } from "../components/Detail";
import Drawer from "../components/Drawer";
import { Notice } from "../components/Feedback";
import Icon from "../components/icons";
import SessionJourney from "../components/SessionJourney";
import { Time } from "../components/Time";
import { firstName, fmtBytes, mailtoHref, safeHttpUrl, shortUrl, telHref } from "../format";
import useCloseGuard from "../hooks/useCloseGuard";
import useRecordActions from "../hooks/useRecordActions";
import { APPLICATION_STATUSES, trackLabel } from "../labels";

/** A profile link typed into a public form: a link only when it is a plain http(s) address, otherwise just text. */
function ProfileLink({ value }) {
  if (!value) return null;
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

/** One job application in full: the résumé, the applicant's details, a pipeline stage and internal notes. */
export default function ApplicationDrawer({ row, onClose, onUpdated, onRemoved, returnFocus }) {
  const { requestClose, setDirty, warned } = useCloseGuard(onClose);
  const actions = useRecordActions({ collection: "applications", responseKey: "application", noun: "Application", row, onUpdated, onRemoved });

  const emailHref = useMemo(
    () =>
      mailtoHref(row.email, {
        subject: `Your application: ${row.jobTitle} (${row.ref})`,
        body: `Hi ${firstName(row.name)},\n\nThank you for applying for the ${row.jobTitle} role at Zenitheum.\n\n`,
      }),
    [row.email, row.jobTitle, row.ref, row.name],
  );
  const tel = telHref(row.phone);

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
        <div className="adm-actions">
          <a className="adm-btn adm-btn--primary" href={emailHref}>
            <Icon name="send" size={16} /> Email applicant
          </a>
          {tel ? (
            <a className="adm-btn" href={tel}>
              <Icon name="phone" size={16} /> Call
            </a>
          ) : null}
          <CopyButton text={row.email} small>
            Copy email
          </CopyButton>
        </div>
      </div>

      <Section title="Résumé" id="app-resume">
        {row.hasResume ? (
          <div className="adm-filelink">
            <Icon name="file" size={20} />
            <div className="adm-filelink__name">
              <div className="adm-break" style={{ color: "var(--adm-text)", fontWeight: 600 }}>
                {row.resumeName || "Résumé"}
              </div>
              <div className="adm-hint">{fmtBytes(row.resumeSize)}</div>
            </div>
            <a className="adm-btn adm-btn--primary adm-btn--sm" href={resumeHref(row.id)} download>
              <Icon name="download" size={14} /> Download résumé
            </a>
          </div>
        ) : (
          <p className="adm-hint">No résumé was attached to this application.</p>
        )}
      </Section>

      <Section title="Applicant" id="app-person">
        <DetailList
          items={[
            { label: "Email", value: <a href={emailHref}>{row.email}</a> },
            { label: "Phone", value: tel ? <a href={tel}>{row.phone}</a> : row.phone },
            { label: "Institute or employer", value: row.organisation },
            { label: "Profile", value: row.profileUrl ? <ProfileLink value={row.profileUrl} /> : null },
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

      <Section title="Where they came from" id="app-source">
        <AttributionBlock row={row} />
      </Section>

      <Section title="Visit journey" id="app-journey">
        <SessionJourney key={row.sessionId ?? "none"} sessionId={row.sessionId} />
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
          erase={{ available: Boolean(row.visitorId), onConfirm: actions.erase }}
          remove={{ label: "Delete application", noun: `the application from ${row.name} (${row.ref}) together with the attached résumé`, confirmLabel: "Delete application", onConfirm: actions.remove }}
        />
      </Section>
    </Drawer>
  );
}
