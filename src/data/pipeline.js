/**
 * The two build lanes shown on the home page and the technology page. Each stage names the kind of
 * industry-standard commercial EDA tool involved, never a specific product.
 */
export const LANES = [
  {
    id: "digital",
    code: "ZT-SEC1",
    title: "Digital secure chip",
    duration: "Soft-IP phase · 3–4 months",
    color: "#22d3ee",
    steps: [
      { name: "Specify", note: "Interfaces, register map and security functions frozen first.", tool: "Reference model" },
      { name: "Design", note: "Synthesisable Verilog / SystemVerilog, linted on every commit.", tool: "RTL lint" },
      { name: "Verify", note: "Published test vectors, constrained-random tests and formal checks.", tool: "Simulator · formal" },
      { name: "Synthesise", note: "Area and timing numbers a customer can plan around.", tool: "Logic synthesis" },
      { name: "FPGA proof", note: "The same RTL, running on real hardware.", tool: "FPGA board" },
      { name: "Evaluate", note: "Design partners try it in their own products.", tool: "Evaluation kit" },
      { name: "Tape out", note: "A block on the shared test chip, after an independent review.", tool: "GDSII" },
    ],
  },
  {
    id: "analog",
    code: "ZT-AFE1",
    title: "Analog sensor front-end",
    duration: "Silicon proof · 12 months",
    color: "#3b82f6",
    steps: [
      { name: "Specify", note: "Targets across process, voltage and temperature.", tool: "Behavioural models" },
      { name: "Schematic", note: "Transistor-level design of each block.", tool: "Schematic capture" },
      { name: "Simulate", note: "Corners, Monte Carlo and mismatch before any layout.", tool: "SPICE-class" },
      { name: "Layout", note: "Matching, common-centroid, guard rings, shielding.", tool: "Custom layout" },
      { name: "Sign-off", note: "DRC, LVS and parasitic extraction, then post-layout simulation.", tool: "Physical verification" },
      { name: "Tape-out", note: "GDSII to the MPW shuttle after an independent review.", tool: "GDSII" },
      { name: "Silicon", note: "Bring-up, characterisation and a datasheet with measured results.", tool: "Bench automation" },
    ],
  },
];
