import { useMemo } from "react";

import { NotesEditor, StatusSelect, CopyButton } from "../components/Controls";
import DangerZone from "../components/DangerZone";
import { AttributionBlock, DetailList, Section } from "../components/Detail";
import Drawer from "../components/Drawer";
import { Notice } from "../components/Feedback";
import Icon from "../components/icons";
import SessionJourney from "../components/SessionJourney";
import { Time } from "../components/Time";
import { StatusBadge } from "../components/Badge";
import { firstName, mailtoHref, telHref } from "../format";
import useCloseGuard from "../hooks/useCloseGuard";
import useRecordActions from "../hooks/useRecordActions";
import { CONTACT_STATUSES, chipLabel, segmentLabel, topicLabel, volumeLabel } from "../labels";

/** One enquiry in full: reply, triage, see how the person found us and what they read, keep notes. */
export default function LeadDrawer({ row, onClose, onUpdated, onRemoved, returnFocus }) {
  const { requestClose, setDirty, warned } = useCloseGuard(onClose);
  const actions = useRecordActions({ collection: "contacts", responseKey: "contact", noun: "Lead", row, onUpdated, onRemoved });

  const replyHref = useMemo(
    () =>
      mailtoHref(row.email, {
        subject: `Re: ${topicLabel(row.topic)} (${row.ref})`,
        body: `Hi ${firstName(row.name)},\n\nThank you for getting in touch with Zenitheum.\n\n`,
      }),
    [row.email, row.topic, row.ref, row.name],
  );
  const tel = telHref(row.phone);

  return (
    <Drawer
      title={row.name}
      subtitle={
        <span style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: "2px 10px" }}>
          <StatusBadge kind="contact" value={row.status} />
          <span className="adm-mono adm-muted">{row.ref}</span>
          <Time value={row.createdAt} className="adm-muted" />
        </span>
      }
      onClose={requestClose}
      returnFocus={returnFocus}
      closeLabel="Close lead"
    >
      <div className="adm-headgrid">
        <StatusSelect label="Status" value={row.status} options={CONTACT_STATUSES} onSave={actions.saveStatus} hint="Saved as soon as you change it." />
        <div className="adm-actions">
          <a className="adm-btn adm-btn--primary" href={replyHref}>
            <Icon name="send" size={16} /> Reply by email
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

      <Section title="Contact" id="lead-contact">
        <DetailList
          items={[
            { label: "Email", value: <a href={replyHref}>{row.email}</a> },
            { label: "Phone", value: tel ? <a href={tel}>{row.phone}</a> : row.phone },
            { label: "Organisation", value: row.organisation },
            { label: "Job title", value: row.jobTitle },
          ]}
        />
      </Section>

      <Section title="Enquiry" id="lead-enquiry">
        <DetailList
          items={[
            { label: "Topic", value: topicLabel(row.topic) },
            { label: "Segment", value: segmentLabel(row.segment) },
            { label: "Chip", value: chipLabel(row.chip) },
            { label: "Annual volume", value: volumeLabel(row.volume) },
          ]}
        />
        <p className="adm-message">{row.message}</p>
      </Section>

      <Section title="Where they came from" id="lead-source">
        <AttributionBlock row={row} />
      </Section>

      <Section title="Visit journey" id="lead-journey">
        <SessionJourney key={row.sessionId ?? "none"} sessionId={row.sessionId} />
      </Section>

      <Section title="Internal notes" id="lead-notes">
        {warned ? (
          <Notice tone="warn" icon="alert">
            You have unsaved notes. Save them, or close again to discard them.
          </Notice>
        ) : null}
        <NotesEditor key={row.id} value={row.notes} onSave={actions.saveNotes} saving={actions.busy === "notes"} onDirtyChange={setDirty} />
      </Section>

      <Section title="Danger zone" id="lead-danger">
        <DangerZone
          busy={actions.busy}
          erase={{ available: Boolean(row.visitorId), onConfirm: actions.erase }}
          remove={{ label: "Delete lead", noun: `the enquiry from ${row.name} (${row.ref})`, confirmLabel: "Delete lead", onConfirm: actions.remove }}
        />
      </Section>
    </Drawer>
  );
}
