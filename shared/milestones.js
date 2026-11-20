/**
 * Broad milestones shown on the website. The database is the live source of truth: statuses and dates are edited in the
 * admin console (Roadmap) and the site reads them from GET /api/milestones. This file seeds a fresh database and is the
 * front end's offline fallback; a milestone nobody has edited in the console follows this file.
 * The detailed plan is in docs/ROADMAP.md (not on the website).
 *
 *  track:  company | digital | analog      status: completed | in_progress | upcoming | delayed
 */

export const TRACK_LABELS = {
  company: "Company",
  digital: "ZT-SEC1 · digital secure chip",
  analog: "ZT-AFE1 · analog sensor front-end",
};

export const STATUS_LABELS = {
  completed: "Completed",
  in_progress: "In progress",
  upcoming: "Upcoming",
  delayed: "Delayed",
};

export const milestones = [
  {
    id: "M-01",
    track: "company",
    title: "Two chips defined",
    detail: "ZT-AFE1 and ZT-SEC1, and the customers they are built for.",
    targetDate: "2026-11-12",
    status: "completed",
    completedOn: "2026-11-12",
  },
  {
    id: "M-02",
    track: "company",
    title: "Demo booking and ordering open",
    detail: "Book a demo or place an order on this site.",
    targetDate: "2026-11-30",
    status: "in_progress",
  },
  {
    id: "M-08",
    track: "company",
    title: "Design programme starts",
    detail: "Interns and the first engineers begin work on both chips.",
    targetDate: "2027-02-01",
    status: "upcoming",
  },
  {
    id: "M-03",
    track: "company",
    kind: "gate",
    title: "Specifications frozen with design partners",
    detail: "Customers who join before this date shape what the chips do.",
    targetDate: "2027-03-31",
    status: "upcoming",
  },
  {
    id: "M-04",
    track: "digital",
    title: "ZT-SEC1 soft IP v1.0 ready to license",
    detail: "Verified and documented, ready to license.",
    targetDate: "2027-05-31",
    status: "upcoming",
  },
  {
    id: "M-05",
    track: "analog",
    title: "ZT-AFE1 soft IP ready",
    detail: "Design complete and verified, ready to integrate.",
    targetDate: "2027-05-31",
    status: "upcoming",
  },
  {
    id: "M-06",
    track: "analog",
    title: "ZT-AFE1 test chip sent for fabrication",
    detail: "First silicon on its way to hard-IP customers. The date may move.",
    targetDate: "2027-10-31",
    status: "upcoming",
  },
  {
    id: "M-07",
    track: "analog",
    kind: "gate",
    title: "ZT-AFE1 proven on silicon: hard IP delivery",
    detail: "Measured results documented; hard IP available to order.",
    targetDate: "2028-02-29",
    status: "upcoming",
  },
];

export default milestones;
