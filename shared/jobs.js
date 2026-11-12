/**
 * Single source of truth for open roles.
 *
 *  - The React app renders the listing cards and job pages from this file.
 *  - The Node API validates application slugs / tracks against it and serves it
 *    at GET /api/jobs.
 *
 * To change a role, edit it here — nothing else needs touching.
 */

export const jobs = [
  {
    slug: "chief-technology-officer",
    title: "Chief Technology Officer",
    short: "CTO · Analog chip design",
    team: "Leadership · Analog design",
    type: "Full-time",
    openings: 1,
    level: "Founding leadership",
    experience: "10–12+ years in analog chip design",
    location: "Khamgaon, Maharashtra · On-site / hybrid",
    start: "As soon as possible",
    reportsTo: "Founder & CEO",
    track: "analog",
    summary:
      "Own Zenitheum's technology. Architect and deliver our analog sensor front-end, ZT-AFE1, from specification to silicon proof, and build the engineering team and culture behind it.",
    overview: [
      "Zenitheum is a fabless semiconductor startup designing two chips for Indian industry: ZT-SEC1, a digital secure-authentication chip whose soft-IP phase takes 3–4 months, and ZT-AFE1, a 24-bit analog sensor front-end that we aim to take from specification to tape-out and silicon proof within twelve months, starting December 2026.",
      "We are looking for a hands-on technical leader who has already taken analog chips through silicon — and wants to do it again from day one, in a company built around that discipline. You will be the technical authority on ZT-AFE1, set the design and sign-off methodology, grow a team of early-career engineers, and represent Zenitheum technically to foundries, programme partners and customers.",
    ],
    responsibilities: [
      "Own the technology roadmap for both chips and the twelve-month plan from ZT-AFE1 specification to tape-out and silicon proof.",
      "Architect and personally review the ZT-AFE1 signal chain — low-drift references, programmable-gain amplifiers, sigma-delta converters, sensor-excitation current sources and temperature sensing.",
      "Define design, verification and sign-off methodology: PVT corners, Monte Carlo and mismatch, EM/IR, ESD and latch-up review, and post-layout closure.",
      "Lead tape-out end to end: MPW and foundry interface, PDK access, package and evaluation-board strategy, and formal tape-out reviews.",
      "Plan and supervise silicon validation — test plans, bench automation, characterisation reports and datasheets.",
      "Hire, mentor and grow the VLSI team; make written design notes and peer review the default way we work.",
      "Protect what we create: clean-room discipline, freedom-to-operate searches with counsel, and layout registration.",
      "Represent Zenitheum technically with customers, foundry and programme partners, and investors.",
    ],
    requirements: [
      "10–12+ years of hands-on analog or mixed-signal IC design, with designs that reached production silicon.",
      "At least two tape-outs where you were the technical owner or block owner — for example precision references, amplifiers, sigma-delta or SAR converters, power-management blocks, or sensor front ends.",
      "Deep command of CMOS analog fundamentals: noise, matching, PSRR, stability, offset and temperature behaviour. Mature-node (130–180 nm) experience preferred.",
      "Fluency with industry-standard flows — Cadence Virtuoso and Spectre (or equivalent) and Calibre-class DRC, LVS and extraction.",
      "Experience planning and running post-silicon validation and characterisation.",
      "A record of mentoring engineers and making architecture trade-offs under schedule pressure.",
      "Clear written and verbal communication; comfortable being the face of engineering with customers and partners.",
    ],
    niceToHave: [
      "Experience with SCL or other mature-node Indian foundry processes, or MPW shuttle programmes.",
      "Mixed-signal SoC integration experience.",
      "Exposure to customer-facing applications engineering or design-in support for instrumentation or metering products.",
      "Patents or publications; prior experience at a startup or IP vendor.",
    ],
    tools: [
      "Cadence Virtuoso / Spectre",
      "Calibre",
      "Verilog-A",
      "MATLAB / Python",
    ],
    roadmap: [
      {
        when: "Dec 2026 – Jan 2027",
        what: "Freeze the ZT-AFE1 specification and architecture (Gate G1); set the hiring plan for the analog team.",
      },
      {
        when: "Feb – Jul 2027",
        what: "Lead circuit design, layout, extraction and sign-off; chair weekly design reviews.",
      },
      {
        when: "Aug 2027",
        what: "Own the tape-out review and shuttle submission (Gate G4).",
      },
      {
        when: "Sep – Dec 2027",
        what: "Run the characterisation plan and silicon bring-up; deliver the ZT-AFE1 silicon proof (Gate G5).",
      },
    ],
    offers: [
      "Founding-team technical leadership with a direct line to the founders.",
      "Ownership of the architecture, the methodology and the hiring bar.",
      "A real tape-out in your first year — not a slide about one.",
      "Compensation and equity discussed directly with the founders.",
    ],
  },

  {
    slug: "devops-engineer",
    title: "DevOps Engineer",
    short: "DevOps · Chip-design infrastructure",
    team: "Platform · Design Infrastructure",
    type: "Full-time",
    openings: 1,
    level: "Mid-level",
    experience: "3–6 years",
    location: "Khamgaon, Maharashtra · Hybrid",
    start: "As soon as possible",
    reportsTo: "CTO",
    track: "infra",
    summary:
      "Own the infrastructure that builds, tests and ships our chip designs — CI/CD pipelines, regression compute, EDA tool environments, artifact management and security.",
    overview: [
      "In a fabless company the pipeline is the factory. Every commit to our RTL or schematics should trigger lint, simulation, synthesis, physical checks and packaging without anyone babysitting it — and any result must be reproducible from a tagged commit, years later.",
      "As our DevOps Engineer you will build and run that factory: the infrastructure for maintaining our digital soft IP (the heart of the ZT-SEC1 chip) and the pipelines around it, from versioned EDA environments to the compute, storage, access control and release process behind every design delivery. It is a greenfield role with real ownership from day one.",
    ],
    responsibilities: [
      "Design and operate CI/CD for chip design: lint, simulation and regression, coverage, synthesis, place-and-route, static timing, DRC/LVS, packaging and release — on every commit and nightly.",
      "Containerise and version the design environments so any engineer can reproduce any result, anywhere.",
      "Run the compute: cloud and on-prem build and regression runners, autoscaling, job queues and caching, with cost per regression kept visible.",
      "Manage EDA environments: licence servers and access for the commercial tools we use, project areas, VPN/SSO and secure remote access to design data.",
      "Own design-data management: Git with LFS for large layout files, branching and release conventions, semantically versioned design releases with checksums and signed artifacts, backup and disaster recovery.",
      "Build observability for pipeline health, regression trends and area/timing/power tracking, with dashboards and alerts.",
      "Secure the design data: secrets management, least-privilege access, audit logs, encryption in transit and at rest, and an NDA-gated delivery portal for design partners.",
      "Operate the company's web stack — React front end, Node API and PostgreSQL database: deployments, TLS, monitoring and backups.",
      "Write the runbooks and automate the toil with Infrastructure as Code.",
    ],
    requirements: [
      "3–6 years in DevOps, SRE or platform engineering.",
      "Strong Linux and Docker skills and hands-on experience with a CI system (GitHub Actions, GitLab CI or Jenkins), including self-hosted runners.",
      "Infrastructure as Code (Terraform, Ansible or equivalent) on at least one major cloud — AWS, GCP or Azure.",
      "Fluency in Python and Bash; comfortable debugging long-running, resource-hungry batch jobs.",
      "Experience with monitoring, observability and incident response.",
      "Security fundamentals: IAM, secrets, network segmentation, backups.",
      "Curiosity about hardware — you are willing to learn how a chip-design flow works.",
    ],
    niceToHave: [
      "Exposure to EDA flows or licence servers (FlexLM), or to FPGA / ASIC toolchains.",
      "HPC schedulers (Slurm), Kubernetes, or reproducible-build tools such as Nix or Bazel.",
      "Node.js experience; ISO 27001 or SOC 2 exposure.",
      "Managing large binary artifacts (Git LFS, artifact registries).",
    ],
    tools: [
      "Docker",
      "Kubernetes",
      "GitHub Actions / GitLab CI",
      "Terraform",
      "Ansible",
      "Prometheus & Grafana",
      "Python",
      "Bash",
      "Node.js",
    ],
    roadmap: [
      {
        when: "Dec 2026",
        what: "Baseline CI and containerised toolchain live; monorepo and artifact registry in place.",
      },
      {
        when: "Jan – Mar 2027",
        what: "Regression farm, coverage and QoR dashboards, and release automation for the ZT-SEC1 soft IP.",
      },
      {
        when: "Apr – Jul 2027",
        what: "Physical-verification pipelines (DRC, LVS, extraction) and EDA access for the ZT-AFE1 sign-off.",
      },
      {
        when: "Aug – Dec 2027",
        what: "Tape-out reproducibility freeze, characterisation data pipeline and the customer delivery portal.",
      },
    ],
    offers: [
      "A greenfield platform you design and own.",
      "Hands-on learning of the full chip-design flow, from RTL to GDS.",
      "Direct collaboration with the CTO and founders.",
      "Compensation discussed at interview.",
    ],
  },

  {
    slug: "vlsi-engineer",
    title: "VLSI Engineer",
    short: "VLSI Engineer · Fresher / Junior",
    team: "Silicon Engineering",
    type: "Full-time",
    openings: 3,
    level: "Fresher / Junior",
    experience: "0–2 years",
    location: "Khamgaon, Maharashtra · On-site / hybrid",
    start: "As soon as possible",
    reportsTo: "CTO",
    track: "design",
    summary:
      "Be one of our first three VLSI engineers: design, verify and implement real chip blocks — digital RTL, analog circuits or layout — and see them through to tape-out.",
    overview: [
      "We are hiring three VLSI engineers at fresher or junior level. You will work on ZT-SEC1 (our digital secure-authentication chip) and ZT-AFE1 (our analog sensor front-end) under the CTO's guidance, and own a real block from specification to sign-off.",
      "The three openings map to the three skills our roadmap needs most. Tell us which track fits you best when you apply — we will talk about the others at interview.",
    ],
    tracks: [
      {
        id: "digital",
        name: "Digital design & verification",
        blurb:
          "Verilog / SystemVerilog RTL, SystemVerilog verification and formal checks, synthesis and FPGA proof for ZT-SEC1.",
      },
      {
        id: "analog-design",
        name: "Analog circuit design",
        blurb:
          "Schematic design and simulation of reference, amplifier, sigma-delta and excitation blocks for ZT-AFE1, across corners and Monte Carlo.",
      },
      {
        id: "layout",
        name: "Layout & physical verification",
        blurb:
          "Analog layout (matching, guard rings, shielding), DRC / LVS / extraction and post-layout simulation.",
      },
    ],
    responsibilities: [
      "Design, implement and verify blocks for ZT-SEC1 and ZT-AFE1 under the guidance of the CTO and senior reviewers.",
      "Write self-checking testbenches or simulation decks, and track coverage and corner results.",
      "Run RTL-to-GDS or schematic-to-layout flows and interpret the reports — area, timing, DRC and LVS.",
      "Keep design notes, scripts and documentation reproducible and version-controlled.",
      "Take part in design reviews, and fix what reviewers find.",
      "Support tape-out and, later, post-silicon bring-up and characterisation.",
    ],
    requirements: [
      "B.E. / B.Tech / M.E. / M.Tech in Electronics, Electrical, VLSI or a related field; 0–2 years of experience.",
      "Solid fundamentals: digital logic and CMOS — and, for analog tracks, small-signal analysis, biasing, op-amps and noise.",
      "Project or lab experience in Verilog / SystemVerilog, SPICE-level design or layout — something you built and measured or simulated.",
      "Comfort with Linux, Git and scripting (Python, Tcl or Bash).",
      "Curiosity, persistence and the habit of writing down what you learned.",
    ],
    niceToHave: [
      "Hands-on time with an industry EDA flow (Cadence, Synopsys or Siemens EDA) through coursework, a lab or an internship.",
      "A shuttle or multi-project-wafer submission from your studies, or an FPGA project you can demo.",
      "MOSFET device-physics coursework; relevant VLSI certifications.",
      "A project portfolio you can walk us through.",
    ],
    tools: [
      "Verilog / SystemVerilog",
      "SystemVerilog assertions",
      "Logic synthesis",
      "Static timing analysis",
      "SPICE-class simulation",
      "Layout & DRC / LVS",
      "Python",
    ],
    roadmap: [
      {
        when: "Jan – Mar 2027",
        what: "Own a block through RTL or schematic design and verification; the ZT-SEC1 soft IP freezes in March.",
      },
      {
        when: "Apr – Jul 2027",
        what: "Layout, extraction, post-layout closure and sign-off on ZT-AFE1.",
      },
      {
        when: "Aug 2027",
        what: "Tape-out: your block goes to the foundry.",
      },
      {
        when: "Sep – Dec 2027",
        what: "Characterisation set-up and silicon bring-up.",
      },
    ],
    offers: [
      "Ownership of a real block that goes to silicon within your first year.",
      "Mentorship from a CTO with a track record in analog chips, and from reviewers who read your work closely.",
      "Exposure to the entire flow — design, verification, physical, tape-out and validation.",
      "A clear growth path to block owner.",
    ],
  },

  {
    slug: "vlsi-prototyping-intern",
    title: "VLSI Prototyping Intern",
    short: "Intern · Digital & analog prototyping",
    team: "Silicon Engineering · Prototyping",
    type: "Internship",
    openings: 2,
    level: "Student / recent graduate",
    experience: "Students & recent graduates",
    location: "Remote-friendly",
    start: "1 December 2026",
    duration: "2 months (1 Dec 2026 – 31 Jan 2027)",
    stipend: "₹10,000 per month",
    reportsTo: "CTO",
    track: "intern",
    summary:
      "Prototype building blocks of our two chips — digital RTL on an FPGA and analog circuits in simulation — and help prove the flows Zenitheum will use from specification to sign-off.",
    overview: [
      "Two interns join us on 1 December 2026 for a two-month, hands-on cohort that runs alongside the specification of ZT-SEC1 and ZT-AFE1. You will prototype digital and analog blocks of those chips in an industry-standard EDA environment, with a stipend of ₹10,000 per month.",
      "One seat leans digital (RTL, verification, FPGA) and one leans analog (schematics, simulation, layout), and you will cross-train on each other's flow. What you build becomes the reference the rest of the team starts from.",
    ],
    responsibilities: [
      "Digital: prototype crypto and interface building blocks for ZT-SEC1 in Verilog / SystemVerilog, write self-checking tests against published test vectors, and run the design on an FPGA board.",
      "Analog: capture a reference and amplifier block for ZT-AFE1 at schematic level, simulate it across process, voltage and temperature corners, and review the results with the CTO.",
      "Document every step so it becomes a reproducible reference in our pipeline, and contribute scripts to CI together with our DevOps engineer.",
      "Show a weekly demo, and present the final prototype review at the demo day on 29 January 2027.",
      "Stretch goal: take one block as far as a layout sketch, with guidance from the team.",
    ],
    requirements: [
      "Pursuing or recently completed B.E. / B.Tech / M.E. / M.Tech in Electronics, Electrical, VLSI or a related field.",
      "Strong digital-logic fundamentals and basic analog knowledge (MOSFET models, amplifier basics).",
      "Some Verilog or SPICE exposure, and comfort in a Linux terminal.",
      "Able to commit full-time from 1 December 2026 to 31 January 2027.",
      "Curiosity and the persistence to debug a flow that does not work the first time.",
    ],
    niceToHave: [
      "Hands-on use of a Verilog simulator, a SPICE-level simulator or a layout tool, in coursework or a lab.",
      "FPGA board projects, or VLSI design course work.",
      "Python scripting; projects you can show.",
    ],
    tools: [
      "Verilog / SystemVerilog",
      "RTL simulation",
      "FPGA board",
      "SPICE-class simulation",
      "Schematic capture",
      "Python",
    ],
    roadmap: [
      { when: "1 Dec 2026", what: "Cohort starts: environment set-up, first prototypes." },
      { when: "Dec 2026 – Jan 2027", what: "Digital RTL and verification on an FPGA; analog schematics and corner simulation." },
      { when: "29 – 31 Jan 2027", what: "Final prototype review and demo day. Cohort ends 31 January." },
    ],
    offers: [
      "A working chip-block prototype in your portfolio, built on a real industry flow.",
      "Mentorship from the CTO and the engineering team.",
      "Certificate of internship and experience letter on completion.",
      "Strong performers are considered for full-time VLSI Engineer roles.",
      "Stipend of ₹10,000 per month for the two months of the internship.",
    ],
  },
];

export const findJob = (slug) => jobs.find((job) => job.slug === slug);

export const totalOpenings = jobs.reduce((sum, job) => sum + job.openings, 0);

export default jobs;
