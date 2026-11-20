# Roadmap — December 2026 → December 2027

> Internal planning document (not shown on the website). The website shows only the broad milestones, which you edit in the admin console under **Roadmap**.
> Every date is a plan. Anything that depends on a foundry shuttle calendar is marked.

Two chips run in parallel:

- **ZT-SEC1** (digital secure chip): a 3–4 month soft-IP phase (Dec 2026 → Mar 2027), then evaluation with design partners and a block on the shared test chip. Licensed as **soft IP only**.
- **ZT-AFE1** (analog sensor front-end): a 12-month path to silicon proof (tape-out Aug 2027, measured results Dec 2027). Delivered as **soft IP and hard IP**.

**Internship:** two VLSI prototyping interns, **1 February – 31 March 2027** (₹10,000 per month, 2 months), with a path to a full-time role for strong performers.

## Lanes

| Lane | Focus |
| --- | --- |
| ZT-SEC1 · Digital | Soft-IP phase: 3–4 months |
| ZT-AFE1 · Analog | Silicon proof: 12 months |
| Pipeline & Infra | CI/CD, compute, EDA environments |
| Team & Company | Hiring, interns, IP hygiene |
| Customers & Partners | Discovery, design partners, evaluations |

## Month-by-month bars

| Lane | Bar | From | To | Kind |
| --- | --- | --- | --- | --- |
| ZT-SEC1 · Digital | Spec | 2026-12 | 2026-12 | solid |
| ZT-SEC1 · Digital | RTL & verification | 2027-01 | 2027-02 | solid |
| ZT-SEC1 · Digital | v1.0 | 2027-03 | 2027-03 | release |
| ZT-SEC1 · Digital | FPGA evaluation with partners | 2027-04 | 2027-07 | solid |
| ZT-SEC1 · Digital | Tape-out | 2027-08 | 2027-08 | release |
| ZT-SEC1 · Digital | Fabrication window | 2027-09 | 2027-11 | ghost |
| ZT-SEC1 · Digital | Bring-up | 2027-12 | 2027-12 | release |
| ZT-AFE1 · Analog | Spec & architecture | 2026-12 | 2027-01 | solid |
| ZT-AFE1 · Analog | Circuit design | 2027-02 | 2027-03 | solid |
| ZT-AFE1 · Analog | Layout | 2027-04 | 2027-05 | solid |
| ZT-AFE1 · Analog | Extract | 2027-06 | 2027-06 | solid |
| ZT-AFE1 · Analog | Sign-off | 2027-07 | 2027-07 | solid |
| ZT-AFE1 · Analog | Tape-out | 2027-08 | 2027-08 | release |
| ZT-AFE1 · Analog | Fabrication window | 2027-09 | 2027-11 | ghost |
| ZT-AFE1 · Analog | Silicon proof | 2027-12 | 2027-12 | release |
| Pipeline & Infra | CI setup | 2026-12 | 2026-12 | solid |
| Pipeline & Infra | Regression farm & dashboards | 2027-01 | 2027-03 | solid |
| Pipeline & Infra | Physical-verification pipelines | 2027-04 | 2027-07 | solid |
| Pipeline & Infra | Freeze | 2027-08 | 2027-08 | release |
| Pipeline & Infra | Characterisation data & delivery portal | 2027-09 | 2027-12 | solid |
| Team & Company | Interns · 1 Feb → 31 Mar | 2027-02 | 2027-03 | solid |
| Team & Company | Hiring: CTO · DevOps · 3× VLSI | 2026-12 | 2027-02 | solid |
| Team & Company | Team ramp, mentoring & IP hygiene | 2027-03 | 2027-12 | ghost |
| Customers & Partners | Customer discovery | 2026-12 | 2027-02 | solid |
| Customers & Partners | ZT-SEC1 partner evaluations | 2027-04 | 2027-07 | solid |
| Customers & Partners | ZT-AFE1 evaluation boards & reviews | 2027-09 | 2027-12 | solid |

## Decision gates

### G1 — Specification freeze (2027-01-29)

- **Pass criterion:** ZT-SEC1 and ZT-AFE1 specifications signed off after conversations with 20 prospective customers; architecture reviews passed; freedom-to-operate search started.
- **If it fails:** Re-scope blocks or targets before any RTL or transistor-level work is committed.

### G2 — ZT-SEC1 soft IP v1.0 frozen (2027-03-31)

- **Pass criterion:** Lint-clean RTL, regression and coverage targets met, proven on an FPGA, packaged with documentation and tagged as an internal release.
- **If it fails:** Use the buffer month and trim optional modes rather than slip the release.

### G3 — Design freeze & tape-out review (2027-07-30)

- **Pass criterion:** Clean DRC, LVS and antenna checks; post-layout simulation meets targets across PVT corners and Monte Carlo; independent review passed.
- **If it fails:** Fix and re-review; hold for the next shuttle date and budget an extra MPW.

### G4 — Tape-out (2027-08-31)

- **Pass criterion:** GDSII for the shared test chip (ZT-AFE1 signal chain and the ZT-SEC1 security block) accepted by the MPW programme; package selected; evaluation boards ordered. Date follows the shuttle calendar.
- **If it fails:** Move to the next shuttle date, or an overseas shuttle through programme partners.

### G5 — ZT-AFE1 silicon proof (2027-12-31)

- **Pass criterion:** Packaged samples brought up on the evaluation board; measured results documented against the specification targets.
- **If it fails:** Publish partial measured results while remaining characterisation completes; plan a revision.

## Ten steps

### Step 1 — Kick-off, specification & environment (December 2026)

*Day one is 1 December: specifications open and the pipeline skeleton goes live.*

**ZT-SEC1 · Digital**
- Scope ZT-SEC1: a secure-authentication chip built on AES, SHA-256 / HMAC and a true-random-number generator with health tests, behind an SPI / I²C interface.
- Draft the register map once, in a machine-readable source, so RTL, C headers and documentation can never disagree.

**ZT-AFE1 · Analog**
- Capture ZT-AFE1 requirements: a 24-bit sigma-delta signal chain with programmable gain, a low-drift reference and sensor excitation for bridges and RTDs, targeting SCL 180 nm.
- Define the test-chip scope: the core signal chain that has to reach silicon by December 2027.

**Pipeline & Infra**
- Stand up the monorepo, CI skeleton and versioned EDA environments.
- Baseline: every result reproducible from a commit.

**Team & Company**
- Hiring opens: CTO, DevOps Engineer, three VLSI Engineers. IP-assignment and clean-room declarations are signed from day one.

**Customers & Partners**
- Begin conversations with the first of 20 prospective customers: instrument, meter and secure-device makers.
- Start EDA, process-kit and shuttle access applications through India's design-support programmes.

- **Exit:** Specifications v0.9 reviewed; pipeline skeleton green; interns productive.
- **Tools:** Git, CI / CD, Commercial EDA environment

### Step 2 — Architecture & behavioural models (January 2027)

*Decide what to build — and prove the maths — before drawing a single transistor.*

**ZT-SEC1 · Digital**
- Micro-architecture for the AES, SHA / HMAC and random-number datapaths, with a bit-accurate Python reference model.
- Testbench architecture, with published NIST known-answer vectors wired into CI.

**ZT-AFE1 · Analog**
- Block-level architecture: reference, programmable-gain amplifier, sigma-delta modulator and digital filter, excitation sources.
- Behavioural models (Verilog-A and Verilog) to validate the signal chain before transistor design.
- Error budget: noise, offset, drift, linearity and supply current.

**Pipeline & Infra**
- CI runs lint and simulation on every commit; artifact registry ready for design releases.

**Team & Company**
- Technical leadership onboarding (target); mentoring plan for the first engineers and the February intern cohort.

**Customers & Partners**
- Feedback from customer conversations folded into both specifications.
- Freedom-to-operate search begins on the chosen architectures.

- **Exit:** Gate G1 — specifications frozen and architecture reviews passed.  
- **Gate:** G1
- **Tools:** Python / NumPy, Verilog-A, RTL simulator

### Step 3 — Build: RTL and analog schematics (February 2027)

*The first working blocks — digital in simulation, analog on the simulator's bench.*

**ZT-SEC1 · Digital**
- RTL complete for the AES and SHA / HMAC engines, the random-number generator, key store and host interface.
- Self-checking tests against NIST vectors; first coverage numbers; FPGA bring-up begins.

**ZT-AFE1 · Analog**
- Transistor-level reference, amplifier and modulator: DC, AC, transient and noise simulation.
- Excitation current sources and the on-chip temperature sensor follow.

**Pipeline & Infra**
- Regression farm with autoscaling runners; coverage and quality-of-result dashboards.

**Team & Company**
- Early-career engineers take block ownership; weekly design reviews begin.
- Two prototyping interns start on 1 February: ₹10,000 per month for two months, with a path to a full-time role.

**Customers & Partners**
- Design-partner discussions move on to the draft specifications.

- **Exit:** ZT-SEC1 RTL-complete; reference and amplifier meet first-pass targets in simulation.
- **Tools:** RTL simulator, Logic synthesis, SPICE-class simulator, Schematic capture

### Step 4 — ZT-SEC1 soft IP v1.0 & analog design II (March 2027)

*The 4-month digital phase closes: verified, FPGA-proven, packaged, frozen.*

**ZT-SEC1 · Digital**
- Close verification: coverage targets, formal checks on control logic, constrained-random tests.
- Synthesis for area and timing on the target process.
- Prove the full design on an FPGA board that design partners can use; package it with a datasheet, integration guide and register documentation.

**ZT-AFE1 · Analog**
- Sigma-delta modulator, filter and excitation schematics; PVT corners and Monte Carlo on the reference.
- Temperature-sensor architecture frozen.

**Pipeline & Infra**
- Release automation: tag, build, package, checksum and sign.

**Team & Company**
- Weekly reviews continue; the first blocks are signed off by the CTO.
- The intern cohort ends on 31 March with a prototype demo day; strong performers are offered full-time roles.

**Customers & Partners**
- FPGA evaluation kit and integration notes prepared for design partners.

- **Exit:** Gate G2 — ZT-SEC1 soft IP v1.0 frozen.  
- **Gate:** G2
- **Tools:** Formal verification, Logic synthesis, FPGA board

### Step 5 — Analog layout I & FPGA evaluations (April 2027)

*The digital chip meets its first users while the analog test chip takes physical shape.*

**ZT-SEC1 · Digital**
- Evaluation access opens: two or three design partners try ZT-SEC1 on the FPGA kit, with a tight support and feedback loop.

**ZT-AFE1 · Analog**
- Floorplan the test chip; lay out the reference and bias (matching, common-centroid, guard rings).
- Start DRC and LVS against the foundry rule decks.

**Pipeline & Infra**
- Physical-verification pipeline: DRC, LVS and antenna checks as CI jobs.

**Team & Company**
- Full-time engineers fully ramped; layout pairs closely with circuit design.

**Customers & Partners**
- ZT-SEC1 datasheet shared with design partners; feedback logged into the v1.1 backlog.

- **Exit:** Reference layout DRC/LVS-clean; first design-partner evaluations running.
- **Tools:** Layout editor, DRC / LVS, FPGA kit

### Step 6 — Layout completion, extraction & post-layout closure (May – June 2027)

*Where analog designs live or die: parasitics, corners and mismatch.*

**ZT-SEC1 · Digital**
- Prepare the security block for the shared test chip: synthesis, place-and-route feasibility and pad integration.

**ZT-AFE1 · Analog**
- Amplifier, modulator and excitation layouts complete; test-chip assembly.
- Parasitic extraction and post-layout simulation across PVT and Monte Carlo — iterate until every target closes.
- ESD, latch-up and EM/IR reviews.
- Test-chip architecture: SPI-controlled trim and measurement wrapper, pad ring and package choice (QFN-24 target).

**Pipeline & Infra**
- Compute scaled for extraction and Monte Carlo campaigns, with cost per run tracked.

**Team & Company**
- Mid-programme review of scope, schedule and hiring.

**Customers & Partners**
- Two design-partner letters of intent targeted by the end of May.
- Evaluation-board specification and characterisation plan drafted.

- **Exit:** Post-layout results meet targets in all corners.
- **Tools:** Parasitic extraction, SPICE-class simulator, Python

### Step 7 — Integration, sign-off & design freeze (July 2027)

*Nothing goes to the foundry that an independent reviewer has not tried to break.*

**ZT-SEC1 · Digital**
- Security block integrated into the shared test chip; gate-level simulation and timing sign-off.

**ZT-AFE1 · Analog**
- Chip-level integration; full DRC, LVS, antenna and density sign-off with the foundry's commercial decks.
- Independent tape-out review against a written sign-off checklist.

**Pipeline & Infra**
- Reproducibility audit: rebuild the tape-out database from a tagged commit on a clean machine.

**Team & Company**
- Evaluation board (PCB) design complete.

**Customers & Partners**
- Datasheet skeleton and characterisation plan agreed with design partners.

- **Exit:** Gate G3 — design frozen and tape-out review passed.  
- **Gate:** G3
- **Tools:** Sign-off DRC / LVS, Static timing analysis, Sign-off checklist

### Step 8 — Tape-out (August 2027)

*GDSII leaves the building — on the shuttle that the foundry calendar allows.*

**ZT-SEC1 · Digital**
- The ZT-SEC1 security block rides the same shuttle submission.

**ZT-AFE1 · Analog**
- Submit GDSII to the MPW shuttle (SCL 180 nm via the ChipIN programme is the target; an overseas shuttle is the fallback).
- Select the package; order evaluation boards.

**Pipeline & Infra**
- Archive the frozen database, scripts and environment digests.

**Team & Company**
- Post-tape-out retrospective.

**Customers & Partners**
- Tape-out announced; the early-access list for evaluation boards opens.

- **Exit:** Gate G4 — tape-out submitted. Date follows the shuttle calendar.  
- **Gate:** G4
- **Tools:** GDSII, MPW shuttle, OSAT packaging

### Step 9 — Fabrication window: bench, test programme & evaluation boards (September – November 2027)

*While wafers are in the fab, everything around the silicon gets built.*

**ZT-SEC1 · Digital**
- ZT-SEC1 v1.1 from pilot feedback; plan the public-key (ECC) authentication option for the next revision.

**ZT-AFE1 · Analog**
- Set up the bench: supplies, thermal control, precision source and meter, with Python automation.
- Write the characterisation test programme so it is ready before samples arrive.

**Pipeline & Infra**
- Characterisation data pipeline and an NDA-gated delivery portal for design partners.

**Team & Company**
- Plan year-two hiring from what this programme taught us.

**Customers & Partners**
- Application notes for bridge, RTD and thermocouple sensing; evaluation-board plans agreed with design partners.
- File layout registration and patents where eligible.

- **Exit:** Test programme and bench ready before samples arrive.
- **Tools:** Python automation, Bench instruments, Delivery portal

### Step 10 — Silicon bring-up & ZT-AFE1 silicon proof (December 2027)

*Measured results replace simulated ones. The analog signal chain is proven on silicon.*

**ZT-SEC1 · Digital**
- Bring up the security block on the test chip and report results to design partners.

**ZT-AFE1 · Analog**
- Bring up packaged samples on the evaluation board.
- Characterise across temperature, supply and process variation and compare with post-layout predictions.
- Publish measured results against the specification targets.

**Team & Company**
- Year-one retrospective.

**Customers & Partners**
- Share measured results with design partners; agree the next-revision scope; year-two roadmap.

- **Exit:** Gate G5 — ZT-AFE1 silicon proof delivered.  
- **Gate:** G5
- **Tools:** Evaluation board, Bench automation, Datasheet

## What twelve months should leave behind

- **2** Chips in development (ZT-AFE1 · ZT-SEC1)
- **1** Silicon test chip taped out (SCL 180 nm target)
- **7** Open positions (5 full-time · 2 interns)
- **5** Decision gates (G1 – G5)

## Risks and responses

| Risk | Response |
| --- | --- |
| The MPW shuttle date slips | Tape-out is scheduled at design freeze, not at the calendar's convenience. Keep an overseas shuttle as the fallback and reserve the slot early. |
| The senior analog hire takes longer than planned | Use an experienced advisor for architecture reviews in the interim; interns' prototypes and the junior engineers' blocks de-risk topologies; scope stays at the core signal chain. |
| EDA or process-kit access is delayed | Apply early through India's design-support programmes. Architecture and behavioural-model work needs no foundry kit and starts on day one; schedule slack is held ahead of layout. |
| First silicon needs a revision | Design with corner and Monte Carlo margin, budget an additional MPW run, and tell design partners the revision plan early. |
| Customers take longer to commit | Industrial design-in cycles are long. Talk to 20 prospective customers before specification freeze, and aim for two design-partner letters of intent by the end of May. |

## Editing the plan

This document is the internal plan; the website deliberately shows only the broad milestones. Those milestones live in the `milestones` table
(seeded from `shared/milestones.js`) and are edited in the admin console, under Roadmap. Change a status or date there and the website follows.
