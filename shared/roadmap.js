/**
 * The 13-month programme: December 2026 → December 2027.
 *
 * Zenitheum is a fabless chip company. Two chips are developed in parallel:
 *   ZT-SEC1  Digital secure-authentication chip — soft-IP phase of 3–4 months (Dec 2026 → Mar 2027),
 *            then FPGA evaluation with design partners and a block on the shared test chip.
 *   ZT-AFE1  24-bit analog sensor front-end — a 12-month path to silicon proof: tape-out in Aug 2027,
 *            measured results in Dec 2027.
 *
 * Everything here is a plan. Dates that depend on a foundry / MPW shuttle calendar are flagged so the
 * site never promises more than we control. Live progress (which milestones are done) is in
 * shared/milestones.js and, once running, in the database.
 */

export const PROGRAMME = {
  start: "2026-12-01",
  end: "2027-12-31",
  title: "Dec 2026 → Dec 2027",
};

const NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Thirteen calendar months, Dec 2026 … Dec 2027. key = "YYYY-MM". */
export const MONTHS = Array.from({ length: 13 }, (_, i) => {
  const year = 2026 + Math.floor((11 + i) / 12);
  const month = (11 + i) % 12;
  return {
    key: `${year}-${String(month + 1).padStart(2, "0")}`,
    short: NAMES[month],
    year,
    label: `${NAMES[month]} ${year}`,
    days: new Date(year, month + 1, 0).getDate(),
  };
});

export const monthIndex = (key) => MONTHS.findIndex((m) => m.key === key);

/** The five lanes of work. `color` is used by the Gantt, step cards and legend. */
export const TRACKS = [
  {
    id: "digital",
    name: "ZT-SEC1 · Digital",
    code: "ZT-SEC1",
    blurb: "Soft-IP phase: 3–4 months",
    color: "#22d3ee",
  },
  {
    id: "analog",
    name: "ZT-AFE1 · Analog",
    code: "ZT-AFE1",
    blurb: "Silicon proof: 12 months",
    color: "#3b82f6",
  },
  {
    id: "infra",
    name: "Pipeline & Infra",
    code: "DevOps",
    blurb: "CI/CD, compute, EDA environments",
    color: "#7dd3fc",
  },
  {
    id: "team",
    name: "Team & Company",
    code: "People",
    blurb: "Hiring, interns, IP hygiene",
    color: "#818cf8",
  },
  {
    id: "market",
    name: "Customers & Partners",
    code: "GTM",
    blurb: "Discovery, design partners, evaluations",
    color: "#d4d4d8",
  },
];

/**
 * Gantt bars. `from` / `to` are inclusive month keys. `row` stacks bars inside a
 * lane. `tone`: solid (active work) · release (a milestone reached) · ghost
 * (continuing / dependent on external calendars).
 */
export const BARS = [
  // ZT-SEC1 — soft-IP phase, then evaluation and the shared test chip
  { id: "d1", track: "digital", row: 0, from: "2026-12", to: "2026-12", label: "Spec", tone: "solid" },
  { id: "d2", track: "digital", row: 0, from: "2027-01", to: "2027-02", label: "RTL & verification", tone: "solid" },
  { id: "d3", track: "digital", row: 0, from: "2027-03", to: "2027-03", label: "v1.0", tone: "release" },
  { id: "d4", track: "digital", row: 0, from: "2027-04", to: "2027-07", label: "FPGA evaluation with partners", tone: "solid" },
  { id: "d5", track: "digital", row: 0, from: "2027-08", to: "2027-08", label: "Tape-out", tone: "release" },
  { id: "d6", track: "digital", row: 0, from: "2027-09", to: "2027-11", label: "Fabrication window", tone: "ghost" },
  { id: "d7", track: "digital", row: 0, from: "2027-12", to: "2027-12", label: "Bring-up", tone: "release" },

  // ZT-AFE1 — the 12-month path to silicon proof
  { id: "a1", track: "analog", row: 0, from: "2026-12", to: "2027-01", label: "Spec & architecture", tone: "solid" },
  { id: "a2", track: "analog", row: 0, from: "2027-02", to: "2027-03", label: "Circuit design", tone: "solid" },
  { id: "a3", track: "analog", row: 0, from: "2027-04", to: "2027-05", label: "Layout", tone: "solid" },
  { id: "a4", track: "analog", row: 0, from: "2027-06", to: "2027-06", label: "Extract", tone: "solid" },
  { id: "a5", track: "analog", row: 0, from: "2027-07", to: "2027-07", label: "Sign-off", tone: "solid" },
  { id: "a6", track: "analog", row: 0, from: "2027-08", to: "2027-08", label: "Tape-out", tone: "release" },
  { id: "a7", track: "analog", row: 0, from: "2027-09", to: "2027-11", label: "Fabrication window", tone: "ghost" },
  { id: "a8", track: "analog", row: 0, from: "2027-12", to: "2027-12", label: "Silicon proof", tone: "release" },

  // Pipeline & infrastructure
  { id: "i1", track: "infra", row: 0, from: "2026-12", to: "2026-12", label: "CI setup", tone: "solid" },
  { id: "i2", track: "infra", row: 0, from: "2027-01", to: "2027-03", label: "Regression farm & dashboards", tone: "solid" },
  { id: "i3", track: "infra", row: 0, from: "2027-04", to: "2027-07", label: "Physical-verification pipelines", tone: "solid" },
  { id: "i4", track: "infra", row: 0, from: "2027-08", to: "2027-08", label: "Freeze", tone: "release" },
  { id: "i5", track: "infra", row: 0, from: "2027-09", to: "2027-12", label: "Characterisation data & delivery portal", tone: "solid" },

  // Team & company
  { id: "t1", track: "team", row: 0, from: "2026-12", to: "2027-01", label: "Interns · 1 Dec → 31 Jan", tone: "solid" },
  { id: "t2", track: "team", row: 1, from: "2026-12", to: "2027-02", label: "Hiring: CTO · DevOps · 3× VLSI", tone: "solid" },
  { id: "t3", track: "team", row: 1, from: "2027-03", to: "2027-12", label: "Team ramp, mentoring & IP hygiene", tone: "ghost" },

  // Customers & design partners
  { id: "m1", track: "market", row: 0, from: "2026-12", to: "2027-02", label: "Customer discovery", tone: "solid" },
  { id: "m2", track: "market", row: 0, from: "2027-04", to: "2027-07", label: "ZT-SEC1 partner evaluations", tone: "solid" },
  { id: "m3", track: "market", row: 0, from: "2027-09", to: "2027-12", label: "ZT-AFE1 evaluation boards & reviews", tone: "solid" },
];

/** Decision gates: a pre-agreed checkpoint to continue, change or stop. */
export const GATES = [
  {
    id: "G1",
    date: "2027-01-29",
    title: "Specification freeze",
    criteria:
      "ZT-SEC1 and ZT-AFE1 specifications signed off after conversations with 20 prospective customers; architecture reviews passed; freedom-to-operate search started.",
    fallback: "Re-scope blocks or targets before any RTL or transistor-level work is committed.",
  },
  {
    id: "G2",
    date: "2027-03-31",
    title: "ZT-SEC1 soft IP v1.0 frozen",
    criteria:
      "Lint-clean RTL, regression and coverage targets met, proven on an FPGA, packaged with documentation and tagged as an internal release.",
    fallback: "Use the buffer month and trim optional modes rather than slip the release.",
  },
  {
    id: "G3",
    date: "2027-07-30",
    title: "Design freeze & tape-out review",
    criteria:
      "Clean DRC, LVS and antenna checks; post-layout simulation meets targets across PVT corners and Monte Carlo; independent review passed.",
    fallback: "Fix and re-review; hold for the next shuttle date and budget an extra MPW.",
  },
  {
    id: "G4",
    date: "2027-08-31",
    title: "Tape-out",
    criteria:
      "GDSII for the shared test chip (ZT-AFE1 signal chain and the ZT-SEC1 security block) accepted by the MPW programme; package selected; evaluation boards ordered. Date follows the shuttle calendar.",
    fallback: "Move to the next shuttle date, or an overseas shuttle through programme partners.",
  },
  {
    id: "G5",
    date: "2027-12-31",
    title: "ZT-AFE1 silicon proof",
    criteria:
      "Packaged samples brought up on the evaluation board; measured results documented against the specification targets.",
    fallback:
      "Publish partial measured results while remaining characterisation completes; plan a revision.",
  },
];

/**
 * The ten steps. Each step lists what happens per track (`work`), the exit
 * criterion, and the kinds of tools involved. `gate` links to GATES.
 */
export const STEPS = [
  {
    id: "step-1",
    n: 1,
    from: "2026-12",
    to: "2026-12",
    window: "December 2026",
    title: "Kick-off, specification & environment",
    tagline: "Day one is 1 December: interns start, specifications open, the pipeline skeleton goes live.",
    work: {
      digital: [
        "Scope ZT-SEC1: a secure-authentication chip built on AES, SHA-256 / HMAC and a true-random-number generator with health tests, behind an SPI / I²C interface.",
        "Draft the register map once, in a machine-readable source, so RTL, C headers and documentation can never disagree.",
      ],
      analog: [
        "Capture ZT-AFE1 requirements: a 24-bit sigma-delta signal chain with programmable gain, a low-drift reference and sensor excitation for bridges and RTDs, targeting SCL 180 nm.",
        "Define the test-chip scope: the core signal chain that has to reach silicon by December 2027.",
      ],
      infra: [
        "Stand up the monorepo, CI skeleton and versioned EDA environments.",
        "Baseline: every result reproducible from a commit.",
      ],
      team: [
        "Two prototyping interns start on 1 December: ₹10,000 per month, two months.",
        "Hiring opens: CTO, DevOps Engineer, three VLSI Engineers. IP-assignment and clean-room declarations are signed from day one.",
      ],
      market: [
        "Begin conversations with the first of 20 prospective customers: instrument, meter and secure-device makers.",
        "Start EDA, process-kit and shuttle access applications through India's design-support programmes.",
      ],
    },
    exit: "Specifications v0.9 reviewed; pipeline skeleton green; interns productive.",
    gate: null,
    tools: ["Git", "CI / CD", "Commercial EDA environment"],
  },
  {
    id: "step-2",
    n: 2,
    from: "2027-01",
    to: "2027-01",
    window: "January 2027",
    title: "Architecture & behavioural models",
    tagline: "Decide what to build — and prove the maths — before drawing a single transistor.",
    work: {
      digital: [
        "Micro-architecture for the AES, SHA / HMAC and random-number datapaths, with a bit-accurate Python reference model.",
        "Testbench architecture, with published NIST known-answer vectors wired into CI.",
      ],
      analog: [
        "Block-level architecture: reference, programmable-gain amplifier, sigma-delta modulator and digital filter, excitation sources.",
        "Behavioural models (Verilog-A and Verilog) to validate the signal chain before transistor design.",
        "Error budget: noise, offset, drift, linearity and supply current.",
      ],
      infra: ["CI runs lint and simulation on every commit; artifact registry ready for design releases."],
      team: [
        "Technical leadership onboarding (target); mentoring plan for the first engineers.",
        "The intern cohort presents its prototypes at a demo day on 29 January and ends on 31 January.",
      ],
      market: [
        "Feedback from customer conversations folded into both specifications.",
        "Freedom-to-operate search begins on the chosen architectures.",
      ],
    },
    exit: "Gate G1 — specifications frozen and architecture reviews passed.",
    gate: "G1",
    tools: ["Python / NumPy", "Verilog-A", "RTL simulator"],
  },
  {
    id: "step-3",
    n: 3,
    from: "2027-02",
    to: "2027-02",
    window: "February 2027",
    title: "Build: RTL and analog schematics",
    tagline: "The first working blocks — digital in simulation, analog on the simulator's bench.",
    work: {
      digital: [
        "RTL complete for the AES and SHA / HMAC engines, the random-number generator, key store and host interface.",
        "Self-checking tests against NIST vectors; first coverage numbers; FPGA bring-up begins.",
      ],
      analog: [
        "Transistor-level reference, amplifier and modulator: DC, AC, transient and noise simulation.",
        "Excitation current sources and the on-chip temperature sensor follow.",
      ],
      infra: ["Regression farm with autoscaling runners; coverage and quality-of-result dashboards."],
      team: ["Early-career engineers take block ownership; weekly design reviews begin."],
      market: ["Design-partner discussions move on to the draft specifications."],
    },
    exit: "ZT-SEC1 RTL-complete; reference and amplifier meet first-pass targets in simulation.",
    gate: null,
    tools: ["RTL simulator", "Logic synthesis", "SPICE-class simulator", "Schematic capture"],
  },
  {
    id: "step-4",
    n: 4,
    from: "2027-03",
    to: "2027-03",
    window: "March 2027",
    title: "ZT-SEC1 soft IP v1.0 & analog design II",
    tagline: "The 4-month digital phase closes: verified, FPGA-proven, packaged, frozen.",
    work: {
      digital: [
        "Close verification: coverage targets, formal checks on control logic, constrained-random tests.",
        "Synthesis for area and timing on the target process.",
        "Prove the full design on an FPGA board that design partners can use; package it with a datasheet, integration guide and register documentation.",
      ],
      analog: [
        "Sigma-delta modulator, filter and excitation schematics; PVT corners and Monte Carlo on the reference.",
        "Temperature-sensor architecture frozen.",
      ],
      infra: ["Release automation: tag, build, package, checksum and sign."],
      team: ["Weekly reviews continue; the first blocks are signed off by the CTO."],
      market: ["FPGA evaluation kit and integration notes prepared for design partners."],
    },
    exit: "Gate G2 — ZT-SEC1 soft IP v1.0 frozen.",
    gate: "G2",
    tools: ["Formal verification", "Logic synthesis", "FPGA board"],
  },
  {
    id: "step-5",
    n: 5,
    from: "2027-04",
    to: "2027-04",
    window: "April 2027",
    title: "Analog layout I & FPGA evaluations",
    tagline: "The digital chip meets its first users while the analog test chip takes physical shape.",
    work: {
      digital: ["Evaluation access opens: two or three design partners try ZT-SEC1 on the FPGA kit, with a tight support and feedback loop."],
      analog: [
        "Floorplan the test chip; lay out the reference and bias (matching, common-centroid, guard rings).",
        "Start DRC and LVS against the foundry rule decks.",
      ],
      infra: ["Physical-verification pipeline: DRC, LVS and antenna checks as CI jobs."],
      team: ["Full-time engineers fully ramped; layout pairs closely with circuit design."],
      market: ["ZT-SEC1 datasheet shared with design partners; feedback logged into the v1.1 backlog."],
    },
    exit: "Reference layout DRC/LVS-clean; first design-partner evaluations running.",
    gate: null,
    tools: ["Layout editor", "DRC / LVS", "FPGA kit"],
  },
  {
    id: "step-6",
    n: 6,
    from: "2027-05",
    to: "2027-06",
    window: "May – June 2027",
    title: "Layout completion, extraction & post-layout closure",
    tagline: "Where analog designs live or die: parasitics, corners and mismatch.",
    work: {
      digital: ["Prepare the security block for the shared test chip: synthesis, place-and-route feasibility and pad integration."],
      analog: [
        "Amplifier, modulator and excitation layouts complete; test-chip assembly.",
        "Parasitic extraction and post-layout simulation across PVT and Monte Carlo — iterate until every target closes.",
        "ESD, latch-up and EM/IR reviews.",
        "Test-chip architecture: SPI-controlled trim and measurement wrapper, pad ring and package choice (QFN-24 target).",
      ],
      infra: ["Compute scaled for extraction and Monte Carlo campaigns, with cost per run tracked."],
      team: ["Mid-programme review of scope, schedule and hiring."],
      market: [
        "Two design-partner letters of intent targeted by the end of May.",
        "Evaluation-board specification and characterisation plan drafted.",
      ],
    },
    exit: "Post-layout results meet targets in all corners.",
    gate: null,
    tools: ["Parasitic extraction", "SPICE-class simulator", "Python"],
  },
  {
    id: "step-7",
    n: 7,
    from: "2027-07",
    to: "2027-07",
    window: "July 2027",
    title: "Integration, sign-off & design freeze",
    tagline: "Nothing goes to the foundry that an independent reviewer has not tried to break.",
    work: {
      digital: ["Security block integrated into the shared test chip; gate-level simulation and timing sign-off."],
      analog: [
        "Chip-level integration; full DRC, LVS, antenna and density sign-off with the foundry's commercial decks.",
        "Independent tape-out review against a written sign-off checklist.",
      ],
      infra: ["Reproducibility audit: rebuild the tape-out database from a tagged commit on a clean machine."],
      team: ["Evaluation board (PCB) design complete."],
      market: ["Datasheet skeleton and characterisation plan agreed with design partners."],
    },
    exit: "Gate G3 — design frozen and tape-out review passed.",
    gate: "G3",
    tools: ["Sign-off DRC / LVS", "Static timing analysis", "Sign-off checklist"],
  },
  {
    id: "step-8",
    n: 8,
    from: "2027-08",
    to: "2027-08",
    window: "August 2027",
    title: "Tape-out",
    tagline: "GDSII leaves the building — on the shuttle that the foundry calendar allows.",
    work: {
      digital: ["The ZT-SEC1 security block rides the same shuttle submission."],
      analog: [
        "Submit GDSII to the MPW shuttle (SCL 180 nm via the ChipIN programme is the target; an overseas shuttle is the fallback).",
        "Select the package; order evaluation boards.",
      ],
      infra: ["Archive the frozen database, scripts and environment digests."],
      team: ["Post-tape-out retrospective."],
      market: ["Tape-out announced; the early-access list for evaluation boards opens."],
    },
    exit: "Gate G4 — tape-out submitted. Date follows the shuttle calendar.",
    gate: "G4",
    tools: ["GDSII", "MPW shuttle", "OSAT packaging"],
  },
  {
    id: "step-9",
    n: 9,
    from: "2027-09",
    to: "2027-11",
    window: "September – November 2027",
    title: "Fabrication window: bench, test programme & evaluation boards",
    tagline: "While wafers are in the fab, everything around the silicon gets built.",
    work: {
      digital: ["ZT-SEC1 v1.1 from pilot feedback; plan the public-key (ECC) authentication option for the next revision."],
      analog: [
        "Set up the bench: supplies, thermal control, precision source and meter, with Python automation.",
        "Write the characterisation test programme so it is ready before samples arrive.",
      ],
      infra: ["Characterisation data pipeline and an NDA-gated delivery portal for design partners."],
      team: ["Plan year-two hiring from what this programme taught us."],
      market: [
        "Application notes for bridge, RTD and thermocouple sensing; evaluation-board plans agreed with design partners.",
        "File layout registration and patents where eligible.",
      ],
    },
    exit: "Test programme and bench ready before samples arrive.",
    gate: null,
    tools: ["Python automation", "Bench instruments", "Delivery portal"],
  },
  {
    id: "step-10",
    n: 10,
    from: "2027-12",
    to: "2027-12",
    window: "December 2027",
    title: "Silicon bring-up & ZT-AFE1 silicon proof",
    tagline: "Measured results replace simulated ones. The analog signal chain is proven on silicon.",
    work: {
      digital: ["Bring up the security block on the test chip and report results to design partners."],
      analog: [
        "Bring up packaged samples on the evaluation board.",
        "Characterise across temperature, supply and process variation and compare with post-layout predictions.",
        "Publish measured results against the specification targets.",
      ],
      team: ["Year-one retrospective."],
      market: ["Share measured results with design partners; agree the next-revision scope; year-two roadmap."],
    },
    exit: "Gate G5 — ZT-AFE1 silicon proof delivered.",
    gate: "G5",
    tools: ["Evaluation board", "Bench automation", "Datasheet"],
  },
];

/** What twelve months should leave behind. */
export const OUTCOMES = [
  { value: 2, label: "Chips in development", note: "ZT-AFE1 · ZT-SEC1" },
  { value: 1, label: "Silicon test chip taped out", note: "SCL 180 nm target" },
  { value: 7, label: "Open positions", note: "5 full-time · 2 interns" },
  { value: 5, label: "Decision gates", note: "G1 – G5" },
];

export const RISKS = [
  {
    risk: "The MPW shuttle date slips",
    response:
      "Tape-out is scheduled at design freeze, not at the calendar's convenience. Keep an overseas shuttle as the fallback and reserve the slot early.",
  },
  {
    risk: "The senior analog hire takes longer than planned",
    response:
      "Use an experienced advisor for architecture reviews in the interim; interns' prototypes and the junior engineers' blocks de-risk topologies; scope stays at the core signal chain.",
  },
  {
    risk: "EDA or process-kit access is delayed",
    response:
      "Apply early through India's design-support programmes. Architecture and behavioural-model work needs no foundry kit and starts on day one; schedule slack is held ahead of layout.",
  },
  {
    risk: "First silicon needs a revision",
    response:
      "Design with corner and Monte Carlo margin, budget an additional MPW run, and tell design partners the revision plan early.",
  },
  {
    risk: "Customers take longer to commit",
    response:
      "Industrial design-in cycles are long. Talk to 20 prospective customers before specification freeze, and aim for two design-partner letters of intent by the end of May.",
  },
];

export default { PROGRAMME, MONTHS, TRACKS, BARS, GATES, STEPS, OUTCOMES, RISKS };
