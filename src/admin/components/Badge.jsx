import { APPLICATION_STATUSES, CONTACT_STATUSES, DEMO_STATUSES, ORDER_STATUSES, SUBSCRIBER_STATUSES, labelFor, milestoneStatusLabel } from "../labels";

/** A small pill. The label is always text; the dot and tone only reinforce it. */
export function Badge({ tone = "gray", plain = false, children, title }) {
  return (
    <span className={`adm-badge adm-badge--${tone}${plain ? " adm-badge--plain" : ""}`} title={title}>
      {children}
    </span>
  );
}

const KINDS = {
  contact: { list: CONTACT_STATUSES, tones: { new: "blue", contacted: "cyan", qualified: "violet", won: "green", lost: "rose", spam: "gray" } },
  demo: { list: DEMO_STATUSES, tones: { requested: "amber", scheduled: "blue", completed: "green", cancelled: "gray", no_show: "rose" } },
  order: { list: ORDER_STATUSES, tones: { new: "blue", confirmed: "cyan", in_progress: "violet", delivered: "green", cancelled: "gray" } },
  application: { list: APPLICATION_STATUSES, tones: { new: "blue", screening: "cyan", interview: "violet", offer: "amber", hired: "green", rejected: "rose" } },
  subscriber: { list: SUBSCRIBER_STATUSES, tones: { active: "green", unsubscribed: "gray" } },
  milestone: { tones: { completed: "green", in_progress: "blue", upcoming: "gray", delayed: "amber" } },
};

/** kind: "contact" | "demo" | "order" | "application" | "subscriber" | "milestone" */
export function StatusBadge({ kind, value }) {
  if (!value) return null;
  const { list, tones } = KINDS[kind];
  return <Badge tone={tones[value] ?? "gray"}>{list ? labelFor(list, value) : milestoneStatusLabel(value)}</Badge>;
}
