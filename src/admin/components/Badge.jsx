import { applicationStatusLabel, channelLabel, contactStatusLabel, milestoneStatusLabel, subscriberStatusLabel } from "../labels";

/** A small pill. The label is always text; the dot and tone only reinforce it. */
export function Badge({ tone = "gray", plain = false, children, title }) {
  return (
    <span className={`adm-badge adm-badge--${tone}${plain ? " adm-badge--plain" : ""}`} title={title}>
      {children}
    </span>
  );
}

const TONES = {
  contact: { new: "blue", contacted: "cyan", qualified: "violet", won: "green", lost: "rose", spam: "gray" },
  application: { new: "blue", screening: "cyan", interview: "violet", offer: "amber", hired: "green", rejected: "rose" },
  subscriber: { active: "green", unsubscribed: "gray" },
  milestone: { completed: "green", in_progress: "blue", upcoming: "gray", delayed: "amber" },
};
const LABELS = {
  contact: contactStatusLabel,
  application: applicationStatusLabel,
  subscriber: subscriberStatusLabel,
  milestone: milestoneStatusLabel,
};

/** kind: "contact" | "application" | "subscriber" | "milestone" */
export function StatusBadge({ kind, value }) {
  if (!value) return null;
  return <Badge tone={TONES[kind]?.[value] ?? "gray"}>{LABELS[kind](value)}</Badge>;
}

/** Marketing channel (direct, search, social...). Unknown or empty channels read as "Unattributed". */
export function ChannelTag({ channel }) {
  return <span className="adm-tag">{channel ? channelLabel(channel) : "Unattributed"}</span>;
}
