import { useMemo, useState } from "react";

import { StatusBadge } from "../components/Badge";
import ConfirmDialog from "../components/ConfirmDialog";
import { NotesEditor, StatusSelect } from "../components/Controls";
import DangerZone from "../components/DangerZone";
import Delivery from "../components/Delivery";
import { DetailList, Section } from "../components/Detail";
import Drawer from "../components/Drawer";
import { Notice } from "../components/Feedback";
import PersonActions from "../components/PersonActions";
import { Time } from "../components/Time";
import { describePreference, firstName, mailtoHref, telHref } from "../format";
import useCloseGuard from "../hooks/useCloseGuard";
import useRecordActions from "../hooks/useRecordActions";
import { DEMO_STATUSES, demoTimeLabel, segmentLabel } from "../labels";

const LIVE = ["requested", "scheduled"];

/** One demo request in full: what day and time suit the customer, who they are and what they asked for. */
export default function DemoDrawer({ row, onClose, onUpdated, onRemoved, returnFocus }) {
  const { requestClose, setDirty, warned } = useCloseGuard(onClose);
  const actions = useRecordActions({ collection: "demos", responseKey: "demo", noun: "Demo", row, onUpdated, onRemoved });
  const [confirmCancel, setConfirmCancel] = useState(false);

  const wish = useMemo(() => describePreference(row, demoTimeLabel), [row]);
  const live = LIVE.includes(row.status);
  const mailHref = useMemo(
    () => mailtoHref(row.email, { subject: `Your Zenitheum demo (${row.ref})`, body: `Hi ${firstName(row.name)},\n\nThank you for asking for a demo of Zenitheum.\n\n` }),
    [row.email, row.ref, row.name],
  );

  const cancelDemo = async () => {
    const result = await actions.saveStatus("cancelled");
    if (result.ok) setConfirmCancel(false);
  };

  const dangerActions = [
    ...(live ? [{ id: "cancel", label: "Cancel demo", onRequest: () => setConfirmCancel(true) }] : []),
    {
      id: "delete",
      label: "Delete demo",
      title: "Delete this demo request?",
      text: `This permanently deletes the demo request from ${row.name} (${row.ref}). It can’t be undone.`,
      confirmLabel: "Delete demo",
      onConfirm: actions.remove,
    },
  ];

  return (
    <>
      <Drawer
        title={row.organisation}
        subtitle={
          <span style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: "2px 10px" }}>
            <StatusBadge kind="demo" value={row.status} />
            <span className="adm-muted">{row.ref}</span>
            <Time value={row.createdAt} className="adm-muted" />
          </span>
        }
        onClose={requestClose}
        returnFocus={returnFocus}
        closeLabel="Close demo"
      >
        <div className="adm-headgrid">
          <StatusSelect
            label="Status"
            value={row.status}
            options={DEMO_STATUSES}
            hint="Saved as soon as you change it. Choosing Cancelled asks first."
            onSave={(next) => {
              if (next === "cancelled") {
                setConfirmCancel(true);
                return Promise.resolve({ ok: false });
              }
              return actions.saveStatus(next);
            }}
          />
          <PersonActions email={row.email} phone={row.phone} mailHref={mailHref} mailLabel="Email attendee" />
        </div>

        <Section title="Preferred day and time" id="demo-when">
          <div className="adm-when">
            <div className="adm-when__main">
              <strong>{wish.text}</strong> {wish.text !== "No preference" ? <span className="adm-when__zone">India time</span> : null}
            </div>
            {wish.relative ? <div className="adm-when__rel">{wish.relative.charAt(0).toUpperCase() + wish.relative.slice(1)}</div> : null}
          </div>
          <p className="adm-hint">This is what the customer asked for. Email them a time, then set the status to Scheduled and note the time and meeting link in the internal notes.</p>
        </Section>

        <Section title="Contact" id="demo-contact">
          <DetailList
            items={[
              { label: "Name", value: row.name },
              { label: "Role", value: row.jobTitle },
              { label: "Company", value: row.organisation },
              { label: "Email", value: <a href={mailHref}>{row.email}</a> },
              { label: "Phone", value: telHref(row.phone) ? <a href={telHref(row.phone)}>{row.phone}</a> : row.phone },
            ]}
          />
        </Section>

        <Section title="What they asked about" id="demo-interest">
          <DetailList
            items={[
              { label: "Customer segment", value: segmentLabel(row.segment) },
              { label: "Chip and delivery", value: <Delivery chip={row.chip} analogFormat={row.analogFormat} /> },
              { label: "Requested", value: <Time value={row.createdAt} /> },
              { label: "Reference", value: row.ref, mono: true },
            ]}
          />
          {row.message ? <p className="adm-message">{row.message}</p> : <p className="adm-hint">They did not add a message.</p>}
        </Section>

        <Section title="Internal notes" id="demo-notes">
          {warned ? (
            <Notice tone="warn" icon="alert">
              You have unsaved notes. Save them, or close again to discard them.
            </Notice>
          ) : null}
          <NotesEditor key={row.id} value={row.notes} onSave={actions.saveNotes} saving={actions.busy === "notes"} onDirtyChange={setDirty} />
        </Section>

        <Section title="Danger zone" id="demo-danger">
          <DangerZone busy={actions.busy} actions={dangerActions} />
        </Section>
      </Drawer>

      {confirmCancel ? (
        <ConfirmDialog
          title="Cancel this demo?"
          confirmLabel="Cancel demo"
          cancelLabel="Keep demo"
          busy={actions.busy === "status"}
          onConfirm={cancelDemo}
          onCancel={() => setConfirmCancel(false)}
        >
          <p>
            The demo request from <strong style={{ color: "var(--adm-text)" }}>{row.organisation}</strong> is marked cancelled. Remember to tell the customer.
          </p>
        </ConfirmDialog>
      ) : null}
    </>
  );
}
