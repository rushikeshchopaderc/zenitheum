import { useMemo, useState } from "react";

import { api, errorText } from "../api";
import { StatusBadge } from "../components/Badge";
import ConfirmDialog from "../components/ConfirmDialog";
import { NotesEditor, StatusSelect } from "../components/Controls";
import DangerZone from "../components/DangerZone";
import Delivery from "../components/Delivery";
import { DetailList, Section } from "../components/Detail";
import Drawer from "../components/Drawer";
import { Notice } from "../components/Feedback";
import Icon from "../components/icons";
import MeetActions from "../components/MeetActions";
import PersonActions from "../components/PersonActions";
import { Time } from "../components/Time";
import { useToast } from "../context/contexts";
import { BUSINESS_TZ_LABEL, describeSlot, firstName, mailtoHref, telHref } from "../format";
import useCloseGuard from "../hooks/useCloseGuard";
import useRecordActions from "../hooks/useRecordActions";
import { DEMO_STATUSES, segmentLabel } from "../labels";

const LIVE = ["requested", "scheduled"];

/** One demo booking in full: when (India time first), the Meet link, the person and what they asked for. */
export default function DemoDrawer({ row, onClose, onUpdated, onRemoved, returnFocus }) {
  const toast = useToast();
  const { requestClose, setDirty, warned } = useCloseGuard(onClose);
  const actions = useRecordActions({ collection: "demos", responseKey: "demo", noun: "Demo", row, onUpdated, onRemoved });
  const [creating, setCreating] = useState(false);
  const [meetError, setMeetError] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);

  const slot = useMemo(() => describeSlot(row), [row]);
  const live = LIVE.includes(row.status);
  const mailHref = useMemo(
    () => mailtoHref(row.email, { subject: `Your Zenitheum demo, ${slot.day} (${row.ref})`, body: `Hi ${firstName(row.name)},\n\nThank you for booking a demo with Zenitheum.\n\n` }),
    [row.email, row.ref, row.name, slot.day],
  );

  const createMeet = async () => {
    setCreating(true);
    setMeetError("");
    try {
      const response = await api.post(`/demos/${encodeURIComponent(row.id)}/meeting`);
      onUpdated(response.demo);
      toast.success("Meet link created");
    } catch (error) {
      const message = errorText(error);
      setMeetError(message);
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const cancelDemo = async () => {
    const result = await actions.saveStatus("cancelled");
    if (result.ok) setConfirmCancel(false);
  };

  const dangerActions = [
    ...(live ? [{ id: "cancel", label: "Cancel demo", onRequest: () => setConfirmCancel(true) }] : []),
    {
      id: "delete",
      label: "Delete demo",
      title: "Delete this demo?",
      text: `This permanently deletes the booking from ${row.name} (${row.ref}). It does not cancel a calendar event: cancel the demo first if one exists. It can’t be undone.`,
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
            <span>
              {slot.day}, {slot.time} {BUSINESS_TZ_LABEL}
            </span>
            <span className="adm-muted">{slot.relative}</span>
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

        <Section title="When" id="demo-when">
          <div className="adm-when">
            <div className="adm-when__main">
              <time dateTime={String(row.slotStart)} title={String(row.slotStart)}>
                <strong>{slot.day}</strong>, {slot.time} to {slot.endTime}
              </time>{" "}
              <span className="adm-when__zone">{BUSINESS_TZ_LABEL}</span>
            </div>
            <div className="adm-when__rel">
              {slot.relative.charAt(0).toUpperCase() + slot.relative.slice(1)} · {slot.minutes} minutes
            </div>
            {slot.visitor ? (
              <div className="adm-when__visitor">
                For the visitor: {slot.visitor.day}, {slot.visitor.time} <span className="adm-muted">({slot.visitor.zone})</span>
              </div>
            ) : null}
            {slot.unknownZone ? <div className="adm-hint adm-break">The visitor’s time zone ({slot.unknownZone}) is not one this browser recognises.</div> : null}
          </div>
        </Section>

        <Section title="Google Meet" id="demo-meet">
          {row.meetLink ? (
            <MeetActions meetLink={row.meetLink} size="md" />
          ) : live ? (
            <div className="adm-stack" style={{ gap: 10 }}>
              <Notice tone="warn" icon="video">
                There is no Google Meet link for this demo yet, so the attendee has nothing to join. Create it now: it also puts the demo on the team calendar.
              </Notice>
              <div>
                <button type="button" className="adm-btn adm-btn--primary" onClick={createMeet} disabled={creating}>
                  {creating ? <Icon name="spinner" size={16} className="adm-spin" /> : <Icon name="video" size={16} />}
                  Create Meet link
                </button>
              </div>
              {meetError ? (
                <p className="adm-fielderror" role="alert">
                  {meetError}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="adm-hint">No Meet link was created for this demo.</p>
          )}
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
              { label: "Booked", value: <Time value={row.createdAt} /> },
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
            The demo with <strong style={{ color: "var(--adm-text)" }}>{row.organisation}</strong> is marked cancelled and its time slot is freed for someone else.
            {row.calendarEventId ? " Its Google Calendar event is cancelled too, and everyone invited is notified." : ""}
          </p>
        </ConfirmDialog>
      ) : null}
    </>
  );
}
