/*
 * Id -> label maps for everything the console shows. The lists come from the shared modules the website and
 * the API also use, so a new status, topic or segment appears here without any change. Unknown ids (an old
 * row, a renamed segment) fall back to the raw id instead of disappearing.
 */
import { APPLICATION_STATUSES, CHANNELS, CONTACT_STATUSES, SUBSCRIBER_STATUSES } from "@shared/crm.js";
import { jobs } from "@shared/jobs.js";
import { CHIPS, CONTACT_TOPICS, SEGMENTS, VOLUMES } from "@shared/market.js";
import { STATUS_LABELS as MILESTONE_STATUS_LABELS, TRACK_LABELS } from "@shared/milestones.js";

export { APPLICATION_STATUSES, CHANNELS, CHIPS, CONTACT_STATUSES, CONTACT_TOPICS, SEGMENTS, SUBSCRIBER_STATUSES, VOLUMES };

/** Label for an id in a [{id,label}] list; the raw id when unknown, "" when empty. */
export const labelFor = (list, id) => {
  if (id === null || id === undefined || id === "") return "";
  return list.find((item) => item.id === id)?.label ?? String(id);
};

/** [{id,label}] -> [{value,label}] for <select>. */
export const asOptions = (list) => list.map(({ id, label }) => ({ value: id, label }));

export const DEVICES = [
  { id: "desktop", label: "Desktop" },
  { id: "mobile", label: "Mobile" },
  { id: "tablet", label: "Tablet" },
];

/** Roles open on the site, and the preferred tracks some of them offer (an application stores the track id). */
export const JOB_LIST = jobs.map((job) => ({ id: job.slug, label: job.title }));
export const TRACK_LIST = (() => {
  const seen = new Map();
  for (const job of jobs) for (const track of job.tracks ?? []) if (!seen.has(track.id)) seen.set(track.id, { id: track.id, label: track.name });
  return [...seen.values()];
})();

export const MILESTONE_STATUSES = Object.entries(MILESTONE_STATUS_LABELS).map(([id, label]) => ({ id, label }));
export const MILESTONE_TRACKS = Object.entries(TRACK_LABELS).map(([id, label]) => ({ id, label }));

export const contactStatusLabel = (id) => labelFor(CONTACT_STATUSES, id);
export const applicationStatusLabel = (id) => labelFor(APPLICATION_STATUSES, id);
export const subscriberStatusLabel = (id) => labelFor(SUBSCRIBER_STATUSES, id);
export const channelLabel = (id) => labelFor(CHANNELS, id);
export const chipLabel = (id) => labelFor(CHIPS, id);
export const segmentLabel = (id) => labelFor(SEGMENTS, id);
export const volumeLabel = (id) => labelFor(VOLUMES, id);
export const topicLabel = (id) => labelFor(CONTACT_TOPICS, id);
export const deviceLabel = (id) => labelFor(DEVICES, id);
export const trackLabel = (id) => labelFor(TRACK_LIST, id);
export const milestoneStatusLabel = (id) => MILESTONE_STATUS_LABELS[id] ?? String(id ?? "");
export const milestoneTrackLabel = (id) => TRACK_LABELS[id] ?? String(id ?? "");

/** Audit-log actions the API writes. Unknown actions are shown as written. */
const ACTIONS = {
  login: "Signed in",
  logout: "Signed out",
  login_failed: "Failed sign-in",
  login_refused: "Refused sign-in",
  contact_updated: "Updated a lead",
  contact_deleted: "Deleted a lead",
  application_updated: "Updated an application",
  application_deleted: "Deleted an application",
  resume_downloaded: "Downloaded a resume",
  subscriber_updated: "Changed a subscriber",
  subscriber_deleted: "Deleted a subscriber",
  visitor_erased: "Erased a visitor’s browsing data",
  milestone_updated: "Edited a roadmap milestone",
  export: "Exported a CSV",
};
export const actionLabel = (action) => ACTIONS[action] ?? String(action ?? "").replace(/_/g, " ");

/** Tone for each audit action: a delete or an erase deserves a second look. */
export const actionTone = (action) => (/(deleted|erased)$/.test(action ?? "") ? "danger" : /failed|refused/.test(action ?? "") ? "warn" : "neutral");
