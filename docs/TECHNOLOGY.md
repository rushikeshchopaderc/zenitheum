# How Zenitheum designs its chips — technology notes

> Internal reference (not shown on the website). The website presents the chips, not the method.

## Design principles

- **Reproducible by commit.** Design environments are containerised and versioned. Any result can be rebuilt from a tagged commit on a clean machine — years later.
- **Everything is a job.** Lint, simulation, synthesis, timing, DRC and packaging are pipeline stages, not rituals someone remembers to run.
- **Regressions on every push.** Tests run on every commit and nightly, with coverage and area/timing trends tracked so drift shows up the day it starts.
- **Signed, versioned releases.** Designs ship as semantically versioned, checksummed, signed artifacts with a changelog — and reach design partners through an NDA-gated portal.

## Design flow, step by step

### Digital secure chip (ZT-SEC1)

1. **Specification & model** — Prove the maths first: a bit-accurate reference model that every later stage is checked against. *(Reference model, Numerical computing)*
2. **Register map** — One machine-readable source generates the RTL register block, C headers and documentation — so they can never disagree. *(Register-map generator)*
3. **RTL & lint** — Synthesisable Verilog / SystemVerilog, linted on every commit so bad style never reaches review. *(RTL editor, Lint)*
4. **Simulation** — Compile, run and dump waveforms — fast enough to run on every push. *(Commercial RTL simulator)*
5. **Testbench & regression** — Self-checking tests: published known-answer vectors, constrained-random stimulus, scoreboards. *(UVM-capable simulator, Functional coverage)*
6. **Formal verification** — Mathematical proof that a property always holds — used on control logic where tests can miss corner cases. *(Formal property checker)*
7. **Synthesis** — RTL to gates, with area and cell-count reports a customer can plan around. *(Logic synthesis)*
8. **Place & route** — Floorplan, placement, clock tree and routing for the block that goes on the test chip. *(Place-and-route)*
9. **Static timing** — Does the design meet its clock? Setup and hold slack across corners. *(Static timing sign-off)*
10. **DRC & LVS** — Physical-rule and layout-versus-schematic checks on the hardened block. *(Physical verification)*
11. **FPGA proof** — The same RTL running on real hardware, so design partners see it work before they integrate it. *(FPGA toolchain, FPGA board)*
12. **Release** — Make the design reusable and auditable: documentation, test vectors and a signed, versioned release. *(Release automation)*

### Analog sensor front-end (ZT-AFE1)

1. **Schematic capture** — Draw each circuit with the process kit's real devices. *(Schematic capture)*
2. **Circuit simulation** — DC, AC, transient and noise: operating points, gain, bandwidth, stability. *(SPICE-class simulator)*
3. **Corners & Monte Carlo** — Robustness across process, voltage and temperature, and statistical mismatch. *(Corner and Monte Carlo analysis)*
4. **Custom layout** — Matching, common-centroid placement, guard rings and shielding — where analog performance is won or lost. *(Custom layout editor)*
5. **DRC & LVS** — A clean pass on the real process deck — the gate before anything leaves the building. *(Physical verification)*
6. **Parasitic extraction** — Why performance drops after layout, quantified. *(Parasitic extraction)*
7. **Post-layout simulation** — Re-run every check on the extracted netlist and compare with pre-layout. *(SPICE-class simulator)*
8. **Mixed-signal check** — Analog blocks with their digital control and interface, simulated together. *(Mixed-signal simulator)*
9. **Silicon validation** — Scripted bench measurements against the datasheet — the evidence behind every number. *(Bench automation, Precision instruments)*

## Build lanes at a glance

**Digital secure chip (ZT-SEC1) — Soft-IP phase · 3–4 months:** Specify → Design → Verify → Synthesise → FPGA proof → Evaluate → Tape out

**Analog sensor front-end (ZT-AFE1) — Silicon proof · 12 months:** Specify → Schematic → Simulate → Layout → Sign-off → Tape-out → Silicon

## Verification

**Digital (ZT-SEC1)**
- Known-answer vectors from public standards
- Constrained-random tests with functional coverage
- Formal proofs on control logic and handshakes
- Lint-clean on every commit
- FPGA run of the full design

**Analog (ZT-AFE1)**
- Process / voltage / temperature corner sweeps
- Monte Carlo and mismatch analysis
- Post-layout, parasitic-extracted re-simulation
- ESD, latch-up and EM / IR review
- Independent tape-out review against a written checklist

## Path to silicon (fabless)

1. **Design** — Schematic, RTL and layout in our pipeline
2. **GDSII** — Signed-off layout database
3. **MPW shuttle** — A shared wafer run through a programme such as ChipIN
4. **Foundry** — SCL 180 nm CMOS is our target process
5. **Packaging** — OSAT assembly of the shuttle dies
6. **Evaluation board** — Our own PCB for bring-up
7. **Characterisation** — Measured results in the datasheet

Target path: SCL 180 nm CMOS (The target process for first silicon, through a multi-project-wafer shuttle.); ChipIN programme (India's design-infrastructure and shuttle access for chip startups.); Indian OSAT (Packaging and test of the shuttle dies; QFN-24 is the target package for ZT-AFE1.)

## Clean-room and IP integrity

- **Original by design.** Every block is designed from public specifications, standards and textbooks — never from anyone's layout, netlist or confidential material.
- **Independent-creation record.** Dated design notes, simulations and version-controlled schematics document how each design was made.
- **Freedom-to-operate.** A patent search on each architecture before tape-out. Published circuits can still be patented, so we look first.
- **Ownership locked down.** Employment and contractor agreements assign everything created to Zenitheum from day one, and everyone signs a clean-room declaration.
- **Registered where eligible.** Layout designs are registered under India's Semiconductor Integrated Circuits Layout-Design Act, and patents are filed where they apply.
- **Third-party blocks stay separate.** Anything we obtain from others is tracked apart from our own designs, so what we deliver is always clearly ours.
