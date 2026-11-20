/**
 * Single source of truth for open roles.
 *
 *  - The React app renders the listing cards and job pages from this file.
 *  - The Node API validates application slugs against it (and a preferred track, for a role that lists `tracks`)
 *    and serves it at GET /api/jobs.
 *
 * The roles follow the two chips. ZT-AFE1 (analog sensor front-end, soft and hard IP) needs analog design and layout;
 * ZT-SEC1 (digital secure-authentication core, soft IP only) needs secure digital design and verification; both need
 * applications and integration (customisation requests, integration kits, demos) and a design-infrastructure engineer.
 * The programme starts on 1 February 2027, the day the interns join.
 *
 * To change a role, edit it here — nothing else needs touching.
 */

const LOCATION = "Khamgaon, Maharashtra · On-site / hybrid";

export const jobs = [
  {
    slug: "chief-technology-officer",
    title: "Chief Technology Officer",
    short: "CTO · Both chips, analog lead",
    team: "Leadership · Both chips",
    type: "Full-time",
    openings: 1,
    level: "Founding leadership",
    experience: "10–12+ years in analog chip design",
    location: LOCATION,
    start: "As soon as possible",
    reportsTo: "Founder & CEO",
    track: "leadership",
    summary:
      "Own the technology behind both chips. Lead ZT-AFE1, our analog sensor front-end, from specification to silicon proof, set the engineering bar for ZT-SEC1, and build the team around them.",
    overview: [
      "Zenitheum delivers two chips end to end: ZT-AFE1, a 24-bit analog sensor front-end offered as soft and hard IP, and ZT-SEC1, a digital secure-authentication core licensed as soft IP. Both can be customised to a customer's product, which makes the technical lead the person customers and the team trust to say what is possible.",
      "We are looking for a hands-on leader who has taken analog chips through silicon and wants to do it again from day one. You will be the technical authority on ZT-AFE1, review ZT-SEC1 at every milestone, decide which customisation requests we accept, and grow the engineering team that starts on 1 February 2027.",
    ],
    responsibilities: [
      "Own the technology roadmap for both chips, from specification freeze to soft-IP releases and the ZT-AFE1 silicon proof.",
      "Architect and personally review the ZT-AFE1 signal chain: low-drift reference, programmable-gain amplifier, sigma-delta converter and sensor excitation.",
      "Set the review and sign-off standard for both chips: corners, Monte Carlo and mismatch for analog; coverage and security review for digital.",
      "Decide, with the applications team, which customisation requests fit the standard chips and what they cost in schedule.",
      "Hire, mentor and grow the team; make written design notes and peer review the default way we work.",
      "Plan and supervise silicon validation: test plans, bench automation, characterisation reports and datasheets.",
      "Represent Zenitheum technically to customers, foundry and programme partners.",
    ],
    requirements: [
      "10–12+ years of hands-on analog or mixed-signal IC design, with designs that reached production silicon.",
      "At least two tape-outs where you were the technical owner or block owner, for example precision references, amplifiers, sigma-delta or SAR converters, or sensor front ends.",
      "Deep command of CMOS analog fundamentals: noise, matching, PSRR, stability, offset and temperature behaviour. Mature-node (130–180 nm) experience preferred.",
      "Fluency with industry-standard flows: Cadence Virtuoso and Spectre (or equivalent) and Calibre-class DRC, LVS and extraction.",
      "A record of mentoring engineers and making architecture trade-offs under schedule pressure.",
      "Clear written and verbal communication; comfortable being the face of engineering with customers and partners.",
    ],
    niceToHave: [
      "Experience with mature-node Indian foundry processes or multi-project-wafer programmes.",
      "Mixed-signal SoC integration experience.",
      "Exposure to design-in support for instrumentation or metering products.",
      "Patents or publications; prior experience at a startup or an IP vendor.",
    ],
    tools: ["Cadence Virtuoso / Spectre", "Calibre", "Verilog-A", "MATLAB / Python"],
    roadmap: [
      { when: "Feb – Mar 2027", what: "Freeze both specifications with design partners and lock the hiring plan." },
      { when: "Apr – May 2027", what: "Lead the ZT-AFE1 design and release review for the ZT-SEC1 and ZT-AFE1 soft IP." },
      { when: "Jun – Oct 2027", what: "Own layout, sign-off and the test-chip submission." },
      { when: "Nov 2027 – Feb 2028", what: "Run characterisation and deliver the ZT-AFE1 silicon proof and hard IP." },
    ],
    offers: [
      "Founding-team technical leadership with a direct line to the founders.",
      "Ownership of the architecture, the methodology and the hiring bar.",
      "Two chips with real customers waiting, not a slide about them.",
      "Compensation and equity discussed directly with the founders.",
    ],
  },

  {
    slug: "analog-ic-design-engineer",
    title: "Analog IC Design Engineer",
    short: "Analog design · ZT-AFE1",
    team: "ZT-AFE1 · Analog design",
    type: "Full-time",
    openings: 2,
    level: "Engineer",
    experience: "2–5 years in analog or mixed-signal design",
    location: LOCATION,
    start: "From 1 February 2027",
    reportsTo: "CTO",
    track: "analog",
    summary:
      "Design the blocks that make ZT-AFE1 accurate: the sigma-delta converter, programmable-gain amplifier, low-drift reference and sensor excitation.",
    overview: [
      "ZT-AFE1 reads bridges, RTDs and thermocouples with 24-bit precision for industrial instruments, meters and scales. Its accuracy is decided by a small number of analog blocks, and you will own some of them from schematic to a verified, documented design.",
      "Two seats: one leans toward the signal chain (converter, gain stage, filtering), the other toward references, excitation and power. Both work closely with the layout engineer so a design that simulates well also lays out well.",
    ],
    responsibilities: [
      "Design and simulate ZT-AFE1 blocks: sigma-delta modulator, programmable-gain amplifier, bandgap reference, excitation current sources and temperature sensing.",
      "Verify across process, voltage and temperature corners, Monte Carlo and mismatch, and write the results up so the CTO can review them.",
      "Build behavioural models of your blocks for the system-level simulation and for customers who integrate the soft IP.",
      "Handle customisation requests for your blocks: assess the change, size the effort and implement the agreed change.",
      "Support layout, extraction and post-layout closure, and later bench characterisation of silicon.",
      "Keep design notes, testbenches and scripts versioned and reproducible.",
    ],
    requirements: [
      "B.E. / B.Tech / M.E. / M.Tech in Electronics, Electrical or VLSI; 2–5 years of analog or mixed-signal design.",
      "Hands-on design of at least one of: sigma-delta or SAR converters, amplifiers, references, or low-noise front ends, ideally to silicon.",
      "Strong CMOS fundamentals: noise, matching, offset, stability, PSRR and temperature behaviour.",
      "Fluency with Cadence Virtuoso and Spectre (or equivalent), and scripting in Python, Tcl or SKILL.",
      "The habit of writing down assumptions and results.",
    ],
    niceToHave: [
      "Precision sensor-interface experience (bridges, RTDs, thermocouples) or metering products.",
      "Verilog-A or system-level modelling in MATLAB / Python.",
      "Exposure to mature-node processes (130–180 nm) or a multi-project-wafer submission.",
    ],
    tools: ["Cadence Virtuoso / Spectre", "Verilog-A", "MATLAB / Python", "Calibre"],
    roadmap: [
      { when: "Feb – Mar 2027", what: "Architecture and error budget for your blocks; behavioural models; specification freeze." },
      { when: "Apr – May 2027", what: "Schematic design and corner verification; the ZT-AFE1 soft IP is released in May." },
      { when: "Jun – Oct 2027", what: "Support layout, extraction and sign-off; the test chip is submitted in October." },
      { when: "Nov 2027 – Feb 2028", what: "Bring up and characterise silicon; hard IP follows the measured results." },
    ],
    offers: [
      "Ownership of blocks that decide the accuracy of a real chip.",
      "Mentorship from a CTO with analog tape-outs behind them.",
      "Exposure to the whole path: design, layout, sign-off and silicon.",
      "Compensation discussed at interview.",
    ],
  },

  {
    slug: "analog-layout-engineer",
    title: "Analog Layout & Characterisation Engineer",
    short: "Analog layout · ZT-AFE1 hard IP",
    team: "ZT-AFE1 · Hard IP",
    type: "Full-time",
    openings: 1,
    level: "Engineer",
    experience: "2–5 years in analog layout",
    location: LOCATION,
    start: "From 1 April 2027",
    reportsTo: "CTO",
    track: "layout",
    summary:
      "Turn ZT-AFE1 into hard IP: lay out the analog signal chain, close physical verification, and then characterise the silicon on the bench.",
    overview: [
      "Hard IP is a finished layout block that a customer places in their own chip, so the quality of the layout is the product. You will draw it, verify it, and later measure the real chip against the specification.",
      "The role starts as the first analog blocks reach schematic maturity and grows into the bench work once the test chip returns.",
    ],
    responsibilities: [
      "Lay out ZT-AFE1 analog blocks with attention to matching, symmetry, guard rings, shielding, routing resistance and electromigration.",
      "Run DRC, LVS, antenna and ESD / latch-up checks, extract parasitics and support post-layout simulation with the design engineers.",
      "Prepare the hard-IP deliverables: layout database, abstract and timing views, and integration notes for customers.",
      "Set up the bench: evaluation board, instruments, automated test scripts and a characterisation report template.",
      "Characterise returned silicon across temperature and supply, and compare it with simulation.",
    ],
    requirements: [
      "B.E. / B.Tech / M.E. / M.Tech in Electronics, Electrical or VLSI; 2–5 years of analog layout experience.",
      "Layout of precision analog blocks (references, amplifiers, converters), with a clear grasp of matching and parasitics.",
      "Fluency with Cadence Virtuoso layout and Calibre-class DRC, LVS and extraction.",
      "Comfort in the lab, or the willingness to learn it quickly, and scripting in Python.",
    ],
    niceToHave: [
      "Mature-node (130–180 nm) layout, or a tape-out you can describe block by block.",
      "Bench automation with Python and standard lab instruments.",
      "Packaging and evaluation-board design exposure.",
    ],
    tools: ["Cadence Virtuoso layout", "Calibre", "Parasitic extraction", "Python", "Bench instruments"],
    roadmap: [
      { when: "Apr – May 2027", what: "Floorplan and early layout as the first blocks stabilise." },
      { when: "Jun – Sep 2027", what: "Complete layout, extraction and physical verification." },
      { when: "Oct 2027", what: "Finish the hard-IP views and support the test-chip submission." },
      { when: "Nov 2027 – Feb 2028", what: "Build the bench and characterise returned silicon." },
    ],
    offers: [
      "Your layout becomes the hard IP customers integrate.",
      "From pencil to bench: you see the silicon you drew.",
      "Close collaboration with the analog designers and the CTO.",
      "Compensation discussed at interview.",
    ],
  },

  {
    slug: "secure-digital-design-engineer",
    title: "Secure Digital Design Engineer",
    short: "Digital design · ZT-SEC1",
    team: "ZT-SEC1 · Secure digital design",
    type: "Full-time",
    openings: 1,
    level: "Engineer",
    experience: "2–5 years in RTL design",
    location: LOCATION,
    start: "From 1 February 2027",
    reportsTo: "CTO",
    track: "digital",
    summary:
      "Design the ZT-SEC1 core: AES, SHA-256 / HMAC, a true-random-number generator with health tests and a protected key store, behind a simple bus and SPI / I²C interface.",
    overview: [
      "ZT-SEC1 gives every device an identity that cannot be copied. It is licensed as soft IP, so the RTL, its documentation and its integration kit are the product that customers receive.",
      "You will write the RTL, define the register map and the security behaviour (what happens on a failed health test or a tamper attempt), and make the core easy to integrate into a customer's chip or FPGA.",
    ],
    responsibilities: [
      "Write synthesisable Verilog / SystemVerilog for the cryptographic engines, random-number generator, key store and bus / serial interfaces of ZT-SEC1.",
      "Define the register map once, in a machine-readable source, so RTL, C headers and documentation cannot disagree.",
      "Specify and implement security behaviour: key handling, lock-down, health-test failure and safe defaults.",
      "Close lint, clock-domain and synthesis checks, and meet the area and timing targets for the soft-IP release.",
      "Prove the design on an FPGA board with the verification engineer, and write the integration guide and example code.",
      "Assess and implement customisation requests: interfaces, algorithms enabled, key-store size, register layout.",
    ],
    requirements: [
      "B.E. / B.Tech / M.E. / M.Tech in Electronics, Electrical, Computer or VLSI; 2–5 years of RTL design.",
      "Strong Verilog / SystemVerilog, synthesis and timing fundamentals, and clock-domain-crossing discipline.",
      "Working knowledge of AES, SHA-2 and HMAC, or a demonstrated ability to implement a published standard against its test vectors.",
      "Experience with a standard bus (APB, AHB or AXI-Lite) and SPI or I²C.",
      "Comfort with Linux, Git and scripting (Python, Tcl or Bash).",
    ],
    niceToHave: [
      "Hardware security experience: random-number generation, side-channel awareness, secure boot or key management.",
      "FPGA prototyping on a development board.",
      "Experience delivering soft IP to external customers.",
    ],
    tools: ["Verilog / SystemVerilog", "Logic synthesis", "Static timing analysis", "FPGA toolchain", "Python"],
    roadmap: [
      { when: "Feb – Mar 2027", what: "Specification, register map and micro-architecture; specification freeze with design partners." },
      { when: "Mar – Apr 2027", what: "RTL for the cryptographic engines, random-number generator and key store." },
      { when: "May 2027", what: "Release ZT-SEC1 soft IP v1.0: verified, proven on an FPGA and documented." },
      { when: "Jun 2027 onward", what: "Partner evaluations, customisations and integration support." },
    ],
    offers: [
      "Own a complete, licensable security core from specification to release.",
      "A short path to market: soft IP v1.0 is due three months after you start.",
      "Direct contact with the customers who will integrate your design.",
      "Compensation discussed at interview.",
    ],
  },

  {
    slug: "design-verification-engineer",
    title: "Design Verification Engineer",
    short: "Verification · ZT-SEC1 and digital control",
    team: "ZT-SEC1 · Verification",
    type: "Full-time",
    openings: 1,
    level: "Engineer",
    experience: "2–5 years in functional verification",
    location: LOCATION,
    start: "From 1 February 2027",
    reportsTo: "CTO",
    track: "verification",
    summary:
      "Prove that ZT-SEC1 does exactly what its specification says, and that it fails safely when it should: build the testbench, the coverage and the release evidence.",
    overview: [
      "A security core that is almost right is worse than none. You will own the verification of ZT-SEC1 and the digital control logic around ZT-AFE1, and the evidence that goes into every soft-IP release.",
      "You work next to the design engineer from the first register, so the specification is testable before a line of RTL exists.",
    ],
    responsibilities: [
      "Plan verification from the specification: features, corner cases, error and tamper paths, with measurable coverage goals.",
      "Build self-checking SystemVerilog / UVM testbenches, with reference models and published test vectors (AES, SHA-2, HMAC).",
      "Run constrained-random and directed regressions, close functional and code coverage, and triage failures with the designers.",
      "Add assertions and formal checks for the properties that matter most: key never exposed, safe state on failure, bus protocol.",
      "Co-validate on an FPGA and produce the verification report that ships with each soft-IP release.",
    ],
    requirements: [
      "B.E. / B.Tech / M.E. / M.Tech in Electronics, Electrical, Computer or VLSI; 2–5 years of functional verification.",
      "SystemVerilog verification, ideally UVM, and SystemVerilog assertions.",
      "Experience taking a block from verification plan to coverage closure.",
      "Good debugging habits, Linux and scripting (Python or Bash).",
    ],
    niceToHave: [
      "Formal verification tools or methodology.",
      "Security or cryptographic-hardware verification.",
      "FPGA-in-the-loop or emulation experience.",
    ],
    tools: ["SystemVerilog / UVM", "SystemVerilog assertions", "Coverage tools", "Formal tools", "Python"],
    roadmap: [
      { when: "Feb – Mar 2027", what: "Verification plan and testbench architecture alongside the specification." },
      { when: "Apr 2027", what: "Run regressions as RTL arrives; drive coverage." },
      { when: "May 2027", what: "Close coverage and sign the evidence for ZT-SEC1 soft IP v1.0." },
      { when: "Jun 2027 onward", what: "Regress every customisation and integrate the checks into the release pipeline." },
    ],
    offers: [
      "Verification that decides whether a real product ships.",
      "A greenfield testbench you design properly from the start.",
      "Close work with the designer and the CTO.",
      "Compensation discussed at interview.",
    ],
  },

  {
    slug: "applications-integration-engineer",
    title: "Applications & Integration Engineer",
    short: "Customers · Both chips",
    team: "Customers · Both chips",
    type: "Full-time",
    openings: 1,
    level: "Engineer",
    experience: "2–5 years in applications or field engineering",
    location: `${LOCATION} · Customer visits`,
    start: "From 1 March 2027",
    reportsTo: "CTO",
    track: "applications",
    tracks: [
      { id: "sensing", name: "ZT-AFE1 · Sensing applications", blurb: "Start with customers who measure: instruments, meters, scales and process equipment." },
      { id: "security", name: "ZT-SEC1 · Security applications", blurb: "Start with customers who need to prove a device is genuine: meters, IoT devices and secure accessories." },
    ],
    summary:
      "Be the engineer customers talk to: run demos, turn customisation requests into clear specifications, and help customers connect ZT-AFE1 and ZT-SEC1 to their own devices.",
    overview: [
      "Customers do not buy a chip, they buy a working product. You will show them how ZT-AFE1 reads their sensor and how ZT-SEC1 proves a device is genuine, listen to what they need changed, and make sure the chip fits their design.",
      "The role sits between customers and the design team: you bring back precise requirements, and you take out reference designs, integration kits and answers.",
    ],
    responsibilities: [
      "Run customer demos booked through the website and prepare the demo material for both chips.",
      "Turn customisation requests into short, testable specifications and agree scope with the CTO before anything is promised.",
      "Write integration guides, example firmware and reference schematics for sensor front-ends and secure-authentication flows.",
      "Support customers through integration, soft or hard IP delivery and first bring-up; feed what you learn back to the design team.",
      "Keep the demo, order and customisation records in the staff console accurate and up to date.",
    ],
    requirements: [
      "B.E. / B.Tech in Electronics, Electrical or Instrumentation; 2–5 years in applications, field or embedded engineering.",
      "Hands-on with sensor interfacing (bridges, RTDs, thermocouples) or with secure-element, cryptographic or authentication devices.",
      "Embedded C and comfort with SPI / I²C, evaluation boards and bench instruments.",
      "Clear written and spoken communication; patient with customers who are learning.",
    ],
    niceToHave: [
      "Experience with smart meters, weighing systems, process instruments or IoT devices.",
      "Prior customer-facing technical role at a semiconductor or IP company.",
      "Experience writing documentation and reference designs.",
    ],
    tools: ["Embedded C", "Evaluation boards", "Oscilloscope / multimeter / source-meter", "Python", "Schematic capture"],
    roadmap: [
      { when: "Mar – May 2027", what: "Customer discussions and demos; specification freeze with design partners." },
      { when: "May 2027", what: "Soft-IP integration kits and reference designs for both chips." },
      { when: "Jun – Oct 2027", what: "Partner evaluations and customisation requests." },
      { when: "Nov 2027 – Feb 2028", what: "Evaluation boards and hard-IP integration support." },
    ],
    offers: [
      "The customer-facing seat for two new chips.",
      "Direct influence on what the standard chips become.",
      "Close work with the CTO and the design engineers.",
      "Compensation discussed at interview.",
    ],
  },

  {
    slug: "devops-engineer",
    title: "DevOps Engineer",
    short: "DevOps · Design infrastructure",
    team: "Platform · Design infrastructure",
    type: "Full-time",
    openings: 1,
    level: "Mid-level",
    experience: "3–6 years",
    location: "Khamgaon, Maharashtra · Hybrid",
    start: "From 1 February 2027",
    reportsTo: "CTO",
    track: "infra",
    summary:
      "Build and run the infrastructure behind both chips: regression and simulation compute, versioned EDA environments, release packaging for soft and hard IP, and the company's web stack.",
    overview: [
      "Every release we make, a soft-IP package for ZT-SEC1 and ZT-AFE1 or a hard-IP package for ZT-AFE1, must be reproducible from a tagged commit, years later. The pipeline is how that happens without anyone babysitting it.",
      "You will build the build, test and release automation for digital RTL regressions and analog simulation, the access control around design data, and the delivery path to customers. You will also operate the company's website, API and database. It is a greenfield role with real ownership from day one.",
    ],
    responsibilities: [
      "Design and operate CI/CD for chip design: lint, simulation and regression, coverage, synthesis, physical checks and packaging, on every commit and nightly.",
      "Containerise and version the design environments so any engineer can reproduce any result.",
      "Run the compute: build and regression runners, job queues and caching, with cost per regression visible.",
      "Manage EDA environments: licence servers, project areas, VPN / SSO and secure remote access to design data.",
      "Automate release packaging for soft IP and hard IP with checksums and signed artifacts, and an NDA-gated delivery path for customers.",
      "Secure the design data: secrets, least-privilege access, audit logs, encryption in transit and at rest, backups and recovery.",
      "Operate the web stack (React front end, Node API, PostgreSQL, Google integrations): deployments, monitoring and backups.",
      "Write the runbooks and automate the toil with Infrastructure as Code.",
    ],
    requirements: [
      "3–6 years in DevOps, SRE or platform engineering.",
      "Strong Linux and Docker skills and hands-on experience with a CI system (GitHub Actions, GitLab CI or Jenkins), including self-hosted runners.",
      "Infrastructure as Code (Terraform, Ansible or equivalent) on at least one major cloud: AWS, GCP or Azure.",
      "Fluency in Python and Bash; comfortable debugging long-running, resource-hungry batch jobs.",
      "Security fundamentals: IAM, secrets, network segmentation, backups.",
      "Curiosity about hardware: you are willing to learn how a chip-design flow works.",
    ],
    niceToHave: [
      "Exposure to EDA flows, licence servers or FPGA toolchains.",
      "HPC schedulers (Slurm), Kubernetes, or reproducible-build tools.",
      "Node.js and PostgreSQL operations; ISO 27001 or SOC 2 exposure.",
    ],
    tools: ["Docker", "GitHub Actions / GitLab CI", "Terraform", "Ansible", "Prometheus & Grafana", "Python", "Bash", "Node.js"],
    roadmap: [
      { when: "Feb 2027", what: "CI skeleton and containerised toolchain live; design repository and artifact registry in place." },
      { when: "Mar – May 2027", what: "Regression farm and coverage dashboards; release automation for the soft-IP packages." },
      { when: "Jun – Oct 2027", what: "Physical-verification and simulation pipelines for ZT-AFE1; freeze before the test-chip submission." },
      { when: "Nov 2027 – Feb 2028", what: "Characterisation data pipeline and the customer delivery portal for hard IP." },
    ],
    offers: [
      "A greenfield platform you design and own.",
      "Hands-on learning of the full chip-design flow, from RTL to layout.",
      "Direct collaboration with the CTO and founders.",
      "Compensation discussed at interview.",
    ],
  },

  {
    slug: "digital-design-intern",
    title: "Digital Design Intern",
    short: "Intern · ZT-SEC1",
    team: "ZT-SEC1 · Internship",
    type: "Internship",
    openings: 1,
    level: "Student / recent graduate",
    experience: "Students & recent graduates",
    location: "Remote-friendly",
    start: "1 February 2027",
    duration: "2 months (1 Feb – 31 Mar 2027), extendable into a full-time role",
    stipend: "₹10,000 per month",
    reportsTo: "Secure Digital Design Engineer",
    track: "intern",
    summary:
      "Prototype building blocks of the ZT-SEC1 secure core in RTL, check them against published test vectors and run them on an FPGA board.",
    overview: [
      "You join on 1 February 2027, the day our design programme starts, for a two-month, hands-on internship with a stipend of ₹10,000 per month. You will build and verify real blocks of ZT-SEC1 and present them at the demo day on 26 March 2027. Strong performers are offered a full-time role at the end.",
      "What you build becomes the reference the rest of the team starts from.",
    ],
    responsibilities: [
      "Implement crypto and interface building blocks (for example an SHA-256 or AES round, an SPI / I²C slave) in Verilog / SystemVerilog.",
      "Write self-checking tests against published test vectors and track what is covered.",
      "Run the design on an FPGA board and document the result.",
      "Contribute scripts to the team's regression pipeline together with the DevOps engineer.",
      "Show a weekly demo and present the final prototype at the demo day on 26 March 2027.",
    ],
    requirements: [
      "Pursuing or recently completed B.E. / B.Tech / M.E. / M.Tech in Electronics, Electrical, Computer or VLSI.",
      "Strong digital-logic fundamentals and some Verilog or VHDL.",
      "Comfort in a Linux terminal.",
      "Able to commit full-time from 1 February to 31 March 2027.",
      "Curiosity and the persistence to debug a flow that does not work the first time.",
    ],
    niceToHave: [
      "An FPGA board project, or VLSI design coursework.",
      "Python scripting; projects you can show.",
      "Interest in cryptography or embedded security.",
    ],
    tools: ["Verilog / SystemVerilog", "RTL simulation", "FPGA board", "Python"],
    roadmap: [
      { when: "1 Feb 2027", what: "Start: environment set-up and first block." },
      { when: "Feb – Mar 2027", what: "RTL, self-checking tests and FPGA runs." },
      { when: "26 – 31 Mar 2027", what: "Demo day and wrap-up. Full-time offers follow for strong performers." },
    ],
    offers: [
      "A working secure-core block in your portfolio, built on a real flow.",
      "Mentorship from the digital design engineer and the CTO.",
      "Certificate of internship and experience letter on completion.",
      "The internship can be extended into a full-time role for strong performers.",
      "Stipend of ₹10,000 per month for the two months of the internship.",
    ],
  },

  {
    slug: "analog-design-intern",
    title: "Analog Design Intern",
    short: "Intern · ZT-AFE1",
    team: "ZT-AFE1 · Internship",
    type: "Internship",
    openings: 1,
    level: "Student / recent graduate",
    experience: "Students & recent graduates",
    location: "Remote-friendly",
    start: "1 February 2027",
    duration: "2 months (1 Feb – 31 Mar 2027), extendable into a full-time role",
    stipend: "₹10,000 per month",
    reportsTo: "CTO",
    track: "intern",
    summary:
      "Design and simulate a reference or amplifier block for the ZT-AFE1 sensor front-end across process, voltage and temperature corners.",
    overview: [
      "You join on 1 February 2027, the day our design programme starts, for a two-month, hands-on internship with a stipend of ₹10,000 per month. You will take an analog block from schematic to a corner-verified result and present it at the demo day on 26 March 2027. Strong performers are offered a full-time role at the end.",
      "What you build becomes the reference the analog team starts from.",
    ],
    responsibilities: [
      "Capture a reference or amplifier block for ZT-AFE1 at schematic level in an industry-standard EDA environment.",
      "Simulate it across process, voltage and temperature corners, and review the results with the CTO.",
      "Write up the design and its results so another engineer can reproduce them.",
      "Show a weekly demo and present the final block at the demo day on 26 March 2027.",
      "Stretch goal: take the block as far as a layout sketch, with guidance from the team.",
    ],
    requirements: [
      "Pursuing or recently completed B.E. / B.Tech / M.E. / M.Tech in Electronics, Electrical or VLSI.",
      "Strong analog fundamentals: MOSFET models, amplifier basics, biasing and noise.",
      "Some SPICE-level simulation experience, and comfort in a Linux terminal.",
      "Able to commit full-time from 1 February to 31 March 2027.",
      "Curiosity and the persistence to debug a design that does not work the first time.",
    ],
    niceToHave: [
      "Hands-on use of a SPICE-class simulator or schematic and layout tool, in coursework or a lab.",
      "Python or MATLAB scripting; projects you can show.",
      "Interest in precision measurement or sensor interfaces.",
    ],
    tools: ["SPICE-class simulation", "Schematic capture", "Python / MATLAB"],
    roadmap: [
      { when: "1 Feb 2027", what: "Start: environment set-up and first schematic." },
      { when: "Feb – Mar 2027", what: "Design and corner simulation of your block." },
      { when: "26 – 31 Mar 2027", what: "Demo day and wrap-up. Full-time offers follow for strong performers." },
    ],
    offers: [
      "A corner-verified analog block in your portfolio, built on a real flow.",
      "Mentorship from the CTO and the analog design engineers.",
      "Certificate of internship and experience letter on completion.",
      "The internship can be extended into a full-time role for strong performers.",
      "Stipend of ₹10,000 per month for the two months of the internship.",
    ],
  },
];

export const findJob = (slug) => jobs.find((job) => job.slug === slug);

export const totalOpenings = jobs.reduce((sum, job) => sum + job.openings, 0);

export default jobs;
