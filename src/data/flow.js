/**
 * Tool flow for each chip: what we do at each step and the kind of industry-standard commercial EDA tool
 * involved. We name tool categories rather than products: what matters is the step and its evidence.
 */
export const FLOWS = {
  digital: {
    label: "Digital secure chip",
    code: "ZT-SEC1",
    color: "#22d3ee",
    steps: [
      { name: "Specification & model", purpose: "Prove the maths first: a bit-accurate reference model that every later stage is checked against.", tooling: ["Reference model", "Numerical computing"] },
      { name: "Register map", purpose: "One machine-readable source generates the RTL register block, C headers and documentation — so they can never disagree.", tooling: ["Register-map generator"] },
      { name: "RTL & lint", purpose: "Synthesisable Verilog / SystemVerilog, linted on every commit so bad style never reaches review.", tooling: ["RTL editor", "Lint"] },
      { name: "Simulation", purpose: "Compile, run and dump waveforms — fast enough to run on every push.", tooling: ["Commercial RTL simulator"] },
      { name: "Testbench & regression", purpose: "Self-checking tests: published known-answer vectors, constrained-random stimulus, scoreboards.", tooling: ["UVM-capable simulator", "Functional coverage"] },
      { name: "Formal verification", purpose: "Mathematical proof that a property always holds — used on control logic where tests can miss corner cases.", tooling: ["Formal property checker"] },
      { name: "Synthesis", purpose: "RTL to gates, with area and cell-count reports a customer can plan around.", tooling: ["Logic synthesis"] },
      { name: "Place & route", purpose: "Floorplan, placement, clock tree and routing for the block that goes on the test chip.", tooling: ["Place-and-route"] },
      { name: "Static timing", purpose: "Does the design meet its clock? Setup and hold slack across corners.", tooling: ["Static timing sign-off"] },
      { name: "DRC & LVS", purpose: "Physical-rule and layout-versus-schematic checks on the hardened block.", tooling: ["Physical verification"] },
      { name: "FPGA proof", purpose: "The same RTL running on real hardware, so design partners see it work before they integrate it.", tooling: ["FPGA toolchain", "FPGA board"] },
      { name: "Release", purpose: "Make the design reusable and auditable: documentation, test vectors and a signed, versioned release.", tooling: ["Release automation"] },
    ],
  },
  analog: {
    label: "Analog sensor front-end",
    code: "ZT-AFE1",
    color: "#3b82f6",
    steps: [
      { name: "Schematic capture", purpose: "Draw each circuit with the process kit's real devices.", tooling: ["Schematic capture"] },
      { name: "Circuit simulation", purpose: "DC, AC, transient and noise: operating points, gain, bandwidth, stability.", tooling: ["SPICE-class simulator"] },
      { name: "Corners & Monte Carlo", purpose: "Robustness across process, voltage and temperature, and statistical mismatch.", tooling: ["Corner and Monte Carlo analysis"] },
      { name: "Custom layout", purpose: "Matching, common-centroid placement, guard rings and shielding — where analog performance is won or lost.", tooling: ["Custom layout editor"] },
      { name: "DRC & LVS", purpose: "A clean pass on the real process deck — the gate before anything leaves the building.", tooling: ["Physical verification"] },
      { name: "Parasitic extraction", purpose: "Why performance drops after layout, quantified.", tooling: ["Parasitic extraction"] },
      { name: "Post-layout simulation", purpose: "Re-run every check on the extracted netlist and compare with pre-layout.", tooling: ["SPICE-class simulator"] },
      { name: "Mixed-signal check", purpose: "Analog blocks with their digital control and interface, simulated together.", tooling: ["Mixed-signal simulator"] },
      { name: "Silicon validation", purpose: "Scripted bench measurements against the datasheet — the evidence behind every number.", tooling: ["Bench automation", "Precision instruments"] },
    ],
  },
};

export const PRINCIPLES = [
  { title: "Reproducible by commit", text: "Design environments are containerised and versioned. Any result can be rebuilt from a tagged commit on a clean machine — years later." },
  { title: "Everything is a job", text: "Lint, simulation, synthesis, timing, DRC and packaging are pipeline stages, not rituals someone remembers to run." },
  { title: "Regressions on every push", text: "Tests run on every commit and nightly, with coverage and area/timing trends tracked so drift shows up the day it starts." },
  { title: "Signed, versioned releases", text: "Designs ship as semantically versioned, checksummed, signed artifacts with a changelog — and reach design partners through an NDA-gated portal." },
];

export const FAB_PATH = [
  { name: "Design", note: "Schematic, RTL and layout in our pipeline" },
  { name: "GDSII", note: "Signed-off layout database" },
  { name: "MPW shuttle", note: "A shared wafer run through a programme such as ChipIN" },
  { name: "Foundry", note: "SCL 180 nm CMOS is our target process" },
  { name: "Packaging", note: "OSAT assembly of the shuttle dies" },
  { name: "Evaluation board", note: "Our own PCB for bring-up" },
  { name: "Characterisation", note: "Measured results in the datasheet" },
];

export const TARGET_PATH = [
  { name: "SCL 180 nm CMOS", note: "The target process for first silicon, through a multi-project-wafer shuttle." },
  { name: "ChipIN programme", note: "India's design-infrastructure and shuttle access for chip startups." },
  { name: "Indian OSAT", note: "Packaging and test of the shuttle dies; QFN-24 is the target package for ZT-AFE1." },
];

export const INTEGRITY = [
  { title: "Original by design", text: "Every block is designed from public specifications, standards and textbooks — never from anyone's layout, netlist or confidential material." },
  { title: "Independent-creation record", text: "Dated design notes, simulations and version-controlled schematics document how each design was made." },
  { title: "Freedom-to-operate", text: "A patent search on each architecture before tape-out. Published circuits can still be patented, so we look first." },
  { title: "Ownership locked down", text: "Employment and contractor agreements assign everything created to Zenitheum from day one, and everyone signs a clean-room declaration." },
  { title: "Registered where eligible", text: "Layout designs are registered under India's Semiconductor Integrated Circuits Layout-Design Act, and patents are filed where they apply." },
  { title: "Third-party blocks stay separate", text: "Anything we obtain from others is tracked apart from our own designs, so what we deliver is always clearly ours." },
];

export const VERIFICATION = {
  digital: [
    "Known-answer vectors from public standards",
    "Constrained-random tests with functional coverage",
    "Formal proofs on control logic and handshakes",
    "Lint-clean on every commit",
    "FPGA run of the full design",
  ],
  analog: [
    "Process / voltage / temperature corner sweeps",
    "Monte Carlo and mismatch analysis",
    "Post-layout, parasitic-extracted re-simulation",
    "ESD, latch-up and EM / IR review",
    "Independent tape-out review against a written checklist",
  ],
};
