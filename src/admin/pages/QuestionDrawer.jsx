import { useMemo } from "react";

import { StatusBadge } from "../components/Badge";
import { NotesEditor, StatusSelect } from "../components/Controls";
import DangerZone from "../components/DangerZone";
import { DetailList, Section } from "../components/Detail";
import Drawer from "../components/Drawer";
import { Notice } from "../components/Feedback";
import Delivery from "../components/Delivery";
import PersonActions from "../components/PersonActions";
import { Time } from "../components/Time";
import { firstName, mailtoHref, telHref } from "../format";
import useCloseGuard from "../hooks/useCloseGuard";
import useRecordActions from "../hooks/useRecordActions";
import { CONTACT_STATUSES, chipLabel, segmentLabel } from "../labels";

/** One question from the "ask a question" form: reply, triage, keep notes. */
export default function QuestionDrawer({ row, onClose, onUpdated, onRemoved, returnFocus }) {
  const { requestClose, setDirty, warned } = useCloseGuard(onClose);
  const actions = useRecordActions({ collection: "contacts", responseKey: "contact", noun: "Question", row, onUpdated, onRemoved });
  const tel = telHref(row.phone);

  const mailHref = useMemo(
    () => mailtoHref(row.email, { subject: `Re: your question to Zenitheum (${row.ref})`, body: `Hi ${firstName(row.name)},\n\nThank you for getting in touch with Zenitheum.\n\n` }),
    [row.email, row.ref, row.name],
  );

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
      closeLabel="Close question"
    >
      <div className="adm-headgrid">
        <StatusSelect label="Status" value={row.status} options={CONTACT_STATUSES} onSave={actions.saveStatus} hint="Saved as soon as you change it." />
        <PersonActions email={row.email} phone={row.phone} mailHref={mailHref} />
      </div>

      <Section title={row.topic === "customisation" ? "Customisation request" : "Question"} id="question-text">
        <p className="adm-message">{row.message}</p>
        <DetailList
          items={[
            { label: "Type", value: row.topic === "customisation" ? "Customisation request" : "Question" },
            { label: "Customer segment", value: segmentLabel(row.segment) },
            row.topic === "customisation" ? { label: "Chip and delivery", value: <Delivery chip={row.chip} analogFormat={row.analogFormat} /> } : { label: "Chip", value: chipLabel(row.chip) },
          ]}
        />
      </Section>

      <Section title="Contact" id="question-contact">
        <DetailList
          items={[
            { label: "Name", value: row.name },
            { label: "Role", value: row.jobTitle },
            { label: "Company", value: row.organisation },
            { label: "Email", value: <a href={mailHref}>{row.email}</a> },
            { label: "Phone", value: tel ? <a href={tel}>{row.phone}</a> : row.phone },
          ]}
        />
      </Section>

      <Section title="Internal notes" id="question-notes">
        {warned ? (
          <Notice tone="warn" icon="alert">
            You have unsaved notes. Save them, or close again to discard them.
          </Notice>
        ) : null}
        <NotesEditor key={row.id} value={row.notes} onSave={actions.saveNotes} saving={actions.busy === "notes"} onDirtyChange={setDirty} />
      </Section>

      <Section title="Danger zone" id="question-danger">
        <DangerZone
          busy={actions.busy}
          actions={[
            {
              id: "delete",
              label: "Delete question",
              title: "Delete this question?",
              text: `This permanently deletes the question from ${row.name} (${row.ref}). It can’t be undone.`,
              confirmLabel: "Delete question",
              onConfirm: actions.remove,
            },
          ]}
        />
      </Section>
    </Drawer>
  );
}
