import { useMemo } from "react";

import { Badge, StatusBadge } from "../components/Badge";
import { NotesEditor, StatusSelect } from "../components/Controls";
import DangerZone from "../components/DangerZone";
import Delivery from "../components/Delivery";
import { DetailList, Section } from "../components/Detail";
import Drawer from "../components/Drawer";
import { Notice } from "../components/Feedback";
import Icon from "../components/icons";
import PersonActions from "../components/PersonActions";
import { Time } from "../components/Time";
import { firstName, fmtInt, fmtRelativeDay, fmtYmd, mailtoHref, telHref, todayYmd } from "../format";
import useCloseGuard from "../hooks/useCloseGuard";
import useRecordActions from "../hooks/useRecordActions";
import { ORDER_STATUSES } from "../labels";

const OPEN = ["new", "confirmed", "in_progress"];

/** One order in full: what, how many, where and by when, who to talk to, and the team's own notes. */
export default function OrderDrawer({ row, onClose, onUpdated, onRemoved, returnFocus }) {
  const { requestClose, setDirty, warned } = useCloseGuard(onClose);
  const actions = useRecordActions({ collection: "orders", responseKey: "order", noun: "Order", row, notesField: "internalNotes", onUpdated, onRemoved });
  const tel = telHref(row.phone);
  const late = OPEN.includes(row.status) && row.deliveryDate < todayYmd();

  const mailHref = useMemo(
    () => mailtoHref(row.email, { subject: `Your Zenitheum order (${row.ref})`, body: `Hi ${firstName(row.contactName)},\n\nThank you for your order.\n\n` }),
    [row.email, row.ref, row.contactName],
  );

  return (
    <Drawer
      title={row.organisation}
      subtitle={
        <span style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: "2px 10px" }}>
          <StatusBadge kind="order" value={row.status} />
          <span className="adm-mono adm-muted">{row.ref}</span>
          <Time value={row.createdAt} className="adm-muted" />
        </span>
      }
      onClose={requestClose}
      returnFocus={returnFocus}
      closeLabel="Close order"
    >
      <div className="adm-headgrid">
        <StatusSelect label="Status" value={row.status} options={ORDER_STATUSES} onSave={actions.saveStatus} hint="Saved as soon as you change it." />
        <PersonActions email={row.email} phone={row.phone} mailHref={mailHref} mailLabel="Email customer" />
      </div>

      <Section title="Order" id="order-details">
        <DetailList
          items={[
            { label: "Chip and delivery", value: <Delivery chip={row.chip} analogFormat={row.analogFormat} /> },
            { label: "Quantity", value: fmtInt(row.quantity) },
            {
              label: "Delivery date",
              value: (
                <span style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: "2px 10px" }}>
                  <time dateTime={row.deliveryDate}>{fmtYmd(row.deliveryDate)}</time>
                  <span className="adm-muted">{fmtRelativeDay(row.deliveryDate)}</span>
                  {late ? (
                    <Badge tone="amber" plain>
                      <Icon name="alert" size={12} /> Date has passed
                    </Badge>
                  ) : null}
                </span>
              ),
            },
            { label: "Delivery location", value: row.deliveryLocation },
          ]}
        />
      </Section>

      <Section title="Customisation" id="order-custom">
        {row.customisation ? <p className="adm-message">{row.customisation}</p> : <p className="adm-hint">No customisation was requested.</p>}
      </Section>

      <Section title="Customer notes" id="order-notes-customer">
        {row.notes ? <p className="adm-message">{row.notes}</p> : <p className="adm-hint">The customer did not add notes.</p>}
      </Section>

      <Section title="Contact" id="order-contact">
        <DetailList
          items={[
            { label: "Contact person", value: row.contactName },
            { label: "Role", value: row.jobTitle },
            { label: "Company", value: row.organisation },
            { label: "Email", value: <a href={mailHref}>{row.email}</a> },
            { label: "Phone", value: tel ? <a href={tel}>{row.phone}</a> : row.phone },
          ]}
        />
      </Section>

      <Section title="Internal notes" id="order-internal">
        {warned ? (
          <Notice tone="warn" icon="alert">
            You have unsaved notes. Save them, or close again to discard them.
          </Notice>
        ) : null}
        <NotesEditor key={row.id} value={row.internalNotes} onSave={actions.saveNotes} saving={actions.busy === "notes"} onDirtyChange={setDirty} />
      </Section>

      <Section title="Danger zone" id="order-danger">
        <DangerZone
          busy={actions.busy}
          actions={[
            {
              id: "delete",
              label: "Delete order",
              title: "Delete this order?",
              text: `This permanently deletes the order from ${row.organisation} (${row.ref}). It can’t be undone. To keep the record, set the status to Cancelled instead.`,
              confirmLabel: "Delete order",
              onConfirm: actions.remove,
            },
          ]}
        />
      </Section>
    </Drawer>
  );
}
