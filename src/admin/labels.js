/*
 * Id -> label maps for everything the console shows. The lists come from the shared modules the website and
 * the API also use, so a new status or segment appears here without any change. Unknown ids (an old row,
 * a renamed segment) fall back to the raw id instead of disappearing.
 */
import { APPLICATION_STATUSES, CONTACT_STATUSES, DEMO_STATUSES, ORDER_STATUSES, SUBSCRIBER_STATUSES } from "@shared/crm.js";
import { jobs } from "@shared/jobs.js";
import { ANALOG_FORMATS, CHIPS, SEGMENTS, includesAnalog } from "@shared/market.js";
import { STATUS_LABELS as MILESTONE_STATUS_LABELS, TRACK_LABELS } from "@shared/milestones.js";

export { ANALOG_FORMATS, APPLICATION_STATUSES, CHIPS, CONTACT_STATUSES, DEMO_STATUSES, ORDER_STATUSES, SEGMENTS, SUBSCRIBER_STATUSES };

/** Label for an id in a [{id,label}] list; the raw id when unknown, "" when empty. */
export const labelFor = (list, id) => {
  if (id === null || id === undefined || id === "") return "";
  return list.find((item) => item.id === id)?.label ?? String(id);
};

/** [{id,label}] -> [{value,label}] for <select>. */
export const asOptions = (list) => list.map(({ id, label }) => ({ value: id, label }));

/** An order is for one chip at a time, so "both chips" is not a choice there. */
export const ORDER_CHIPS = CHIPS.filter((chip) => chip.id !== "both");

/** Roles open on the site, and the preferred tracks some of them offer (an application stores the track id). */
export const JOB_LIST = jobs.map((job) => ({ id: job.slug, label: job.title }));
export const TRACK_LIST = (() => {
  const seen = new Map();
  for (const job of jobs) for (const track of job.tracks ?? []) if (!seen.has(track.id)) seen.set(track.id, { id: track.id, label: track.name });
  return [...seen.values()];
})();

export const MILESTONE_STATUSES = Object.entries(MILESTONE_STATUS_LABELS).map(([id, label]) => ({ id, label }));
export const MILESTONE_TRACKS = Object.entries(TRACK_LABELS).map(([id, label]) => ({ id, label }));

export const chipLabel = (id) => labelFor(CHIPS, id);
export const segmentLabel = (id) => labelFor(SEGMENTS, id);
export const trackLabel = (id) => labelFor(TRACK_LIST, id);
export const milestoneStatusLabel = (id) => MILESTONE_STATUS_LABELS[id] ?? String(id ?? "");
export const milestoneTrackLabel = (id) => TRACK_LABELS[id] ?? String(id ?? "");

/** "ZT-AFE1" from "ZT-AFE1 · analog sensor front-end". */
const chipCode = (id) => chipLabel(id).split(" · ")[0];

/**
 * How a chip choice is delivered, one line per chip it includes:
 *  - ZT-AFE1 (analog) is delivered as soft IP, hard IP or both (the stored analogFormat);
 *  - ZT-SEC1 (digital) is licensed as soft IP only;
 *  - "both" chips show both lines.
 * @returns {{chip: string, code: string, text: string}[]}
 */
export function deliveryLines(chip, analogFormat) {
  const lines = [];
  if (includesAnalog(chip)) {
    lines.push({ chip: "analog", code: chipCode("analog"), text: analogFormat ? labelFor(ANALOG_FORMATS, analogFormat) : "Delivery not chosen" });
  }
  if (chip === "digital" || chip === "both") {
    lines.push({ chip: "digital", code: chipCode("digital"), text: `${labelFor(ANALOG_FORMATS, "soft")} only` });
  }
  return lines;
}
