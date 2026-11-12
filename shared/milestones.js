/**
 * Milestone seed for the public milestone chart (/roadmap and the home page).
 *
 * The database is the live source of truth: statuses are edited from the admin console and the site
 * reads them from GET /api/milestones. This file seeds a fresh database and is the front end's offline
 * fallback. A milestone nobody has edited in the console follows this file; an edited one is left alone.
 *
 *  track:  company | digital | analog
 *  kind:   milestone | gate
 *  status: completed | in_progress | upcoming | delayed
 *
 * Dates are TARGETS. Anything that depends on a foundry shuttle calendar is flagged in its detail text.
 */

export const TRACK_LABELS = {
  company: "Company",
  digital: "ZT-SEC1 · digital secure chip · soft-IP phase",
  analog: "ZT-AFE1 · analog sensor front-end · silicon proof",
};

export const STATUS_LABELS = {
  completed: "Completed",
  in_progress: "In progress",
  upcoming: "Upcoming",
  delayed: "Delayed",
};

export const milestones = [
  // ---- Company -----------------------------------------------------------------------------
  {
    id: "C-01",
    track: "company",
    title: "Market & technology research complete",
    detail: "Chip options, fabs, packaging, costs, competitors and customer segments evaluated in a written case study.",
    targetDate: "2026-10-04",
    status: "completed",
    completedOn: "2026-10-04",
  },
  {
    id: "C-02",
    track: "company",
    title: "Two target chips and ideal customers chosen",
    detail: "ZT-AFE1 (analog sensor front-end) and ZT-SEC1 (digital secure-authentication chip), with the customer segments for each.",
    targetDate: "2026-11-12",
    status: "completed",
    completedOn: "2026-11-12",
  },
  {
    id: "C-03",
    track: "company",
    title: "Roadmap, decision gates and hiring plan defined",
    detail: "Ten steps from December 2026 to December 2027, five decision gates, seven open positions.",
    targetDate: "2026-11-12",
    status: "completed",
    completedOn: "2026-11-12",
  },
  {
    id: "C-04",
    track: "company",
    title: "Website, careers and enquiry platform live",
    detail: "Applications, customer enquiries and the early-access list are captured in the company database.",
    targetDate: "2026-11-20",
    status: "in_progress",
  },
  {
    id: "C-05",
    track: "company",
    title: "Intern cohort starts",
    detail: "Two VLSI prototyping interns begin on 1 December: ₹10,000 per month for two months.",
    targetDate: "2026-12-01",
    status: "upcoming",
  },
  {
    id: "C-06",
    track: "company",
    title: "Customer discovery: 20 prospective customers interviewed",
    detail: "Conversations with instrument, meter and secure-device makers feed the specification freeze at Gate G1.",
    targetDate: "2027-01-29",
    status: "upcoming",
  },
  {
    id: "C-07",
    track: "company",
    title: "Core team in place: CTO, DevOps, 3× VLSI engineers",
    detail: "Hiring is open now for all five full-time positions.",
    targetDate: "2027-02-26",
    status: "in_progress",
  },
  {
    id: "C-08",
    track: "company",
    title: "Two design partners signed on (letters of intent)",
    detail: "Customers who will shape the specifications and evaluate the first prototypes.",
    targetDate: "2027-05-28",
    status: "upcoming",
  },
  {
    id: "C-09",
    track: "company",
    title: "Year-one review and 2028 roadmap",
    detail: "Measured silicon results, customer feedback and the plan for the next revision of each chip.",
    targetDate: "2027-12-31",
    status: "upcoming",
  },

  // ---- ZT-SEC1: digital secure chip, soft-IP phase (3–4 months, Dec 2026 – Mar 2027) ---------
  {
    id: "D-01",
    track: "digital",
    title: "Requirements drafted from design-partner input",
    detail: "Interfaces, security functions and performance targets written down before any RTL.",
    targetDate: "2026-12-23",
    status: "upcoming",
  },
  {
    id: "D-02",
    track: "digital",
    kind: "gate",
    title: "Gate G1 · Specification frozen",
    detail: "Specification signed off after conversations with prospective customers.",
    targetDate: "2027-01-29",
    status: "upcoming",
  },
  {
    id: "D-03",
    track: "digital",
    title: "Crypto engines RTL complete",
    detail: "AES, SHA-256 and HMAC engines written, linted and checked against standard test vectors.",
    targetDate: "2027-02-12",
    status: "upcoming",
  },
  {
    id: "D-04",
    track: "digital",
    title: "Random-number generator and key store RTL complete",
    detail: "TRNG with built-in health tests, protected key storage and the SPI / I²C host interface.",
    targetDate: "2027-02-26",
    status: "upcoming",
  },
  {
    id: "D-05",
    track: "digital",
    title: "Verification closed",
    detail: "Coverage targets met; formal checks on the control logic pass.",
    targetDate: "2027-03-19",
    status: "upcoming",
  },
  {
    id: "D-06",
    track: "digital",
    title: "FPGA prototype running",
    detail: "The full design runs on real hardware that design partners can try.",
    targetDate: "2027-03-26",
    status: "upcoming",
  },
  {
    id: "D-07",
    track: "digital",
    kind: "gate",
    title: "Gate G2 · Soft IP v1.0 frozen",
    detail: "The 3–4 month soft-IP phase ends with a verified, FPGA-proven, documented design.",
    targetDate: "2027-03-31",
    status: "upcoming",
  },
  {
    id: "D-08",
    track: "digital",
    title: "Design-partner pilots on the FPGA prototype",
    detail: "Two or three customers evaluate authentication in their own products.",
    targetDate: "2027-07-30",
    status: "upcoming",
  },
  {
    id: "D-09",
    track: "digital",
    title: "Security block taped out on the shared test chip",
    detail: "Rides the same MPW shuttle as the analog test chip to share the cost. The date follows the shuttle calendar.",
    targetDate: "2027-08-31",
    status: "upcoming",
  },
  {
    id: "D-10",
    track: "digital",
    title: "Digital silicon brought up",
    detail: "First silicon running; results reported to design partners.",
    targetDate: "2027-12-17",
    status: "upcoming",
  },

  // ---- ZT-AFE1: analog sensor front-end, silicon proof (12 months, Dec 2026 – Dec 2027) ------
  {
    id: "A-01",
    track: "analog",
    title: "Requirements drafted from design-partner input",
    detail: "Accuracy, noise, drift and interface targets written down before any circuit work.",
    targetDate: "2026-12-23",
    status: "upcoming",
  },
  {
    id: "A-02",
    track: "analog",
    kind: "gate",
    title: "Gate G1 · Specification frozen",
    detail: "Architecture review passed; test-chip scope and targets signed off.",
    targetDate: "2027-01-29",
    status: "upcoming",
  },
  {
    id: "A-03",
    track: "analog",
    title: "Circuit design complete",
    detail: "Reference, programmable-gain amplifier, 24-bit sigma-delta converter and excitation sources simulated across corners.",
    targetDate: "2027-03-31",
    status: "upcoming",
  },
  {
    id: "A-04",
    track: "analog",
    title: "Layout complete",
    detail: "Matched, shielded layout of every block assembled into the test chip.",
    targetDate: "2027-05-28",
    status: "upcoming",
  },
  {
    id: "A-05",
    track: "analog",
    title: "Post-layout closure",
    detail: "Extracted simulation meets targets in all corners and Monte Carlo.",
    targetDate: "2027-06-30",
    status: "upcoming",
  },
  {
    id: "A-06",
    track: "analog",
    kind: "gate",
    title: "Gate G3 · Design freeze & tape-out review",
    detail: "Independent review passed; clean DRC, LVS and antenna checks.",
    targetDate: "2027-07-30",
    status: "upcoming",
  },
  {
    id: "A-07",
    track: "analog",
    kind: "gate",
    title: "Gate G4 · Tape-out",
    detail: "GDSII submitted to the MPW shuttle. The date follows the shuttle calendar.",
    targetDate: "2027-08-31",
    status: "upcoming",
  },
  {
    id: "A-08",
    track: "analog",
    title: "Packaged samples received",
    detail: "Fabricated and packaged parts arrive; evaluation boards ready.",
    targetDate: "2027-11-30",
    status: "upcoming",
  },
  {
    id: "A-09",
    track: "analog",
    title: "Silicon bring-up & characterisation",
    detail: "Measured results across temperature, supply and process variation.",
    targetDate: "2027-12-17",
    status: "upcoming",
  },
  {
    id: "A-10",
    track: "analog",
    kind: "gate",
    title: "Gate G5 · Silicon proof delivered",
    detail: "Measured results documented against targets: the ZT-AFE1 signal chain is proven on silicon.",
    targetDate: "2027-12-31",
    status: "upcoming",
  },
];

export default milestones;
