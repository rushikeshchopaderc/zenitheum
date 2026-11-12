/**
 * The two chips Zenitheum is building. Everything quantitative here is a design TARGET: the numbers
 * that describe accuracy, noise, drift and power are frozen at Gate G1 (January 2027) with design
 * partners, and measured results are published with the silicon proof. Nothing is "silicon-proven" yet,
 * and the site says so wherever the numbers appear.
 */
export const CHIPS = {
  digital: {
    id: "digital",
    code: "ZT-SEC1",
    name: "Secure Authentication Chip",
    kind: "Digital · security",
    phase: "Soft-IP phase: 3–4 months",
    window: "Dec 2026 → Mar 2027, then evaluation and the shared test chip",
    status: "In development · soft IP v1.0 frozen by 31 March 2027",
    color: "#22d3ee",
    tagline: "A small chip that proves a meter, sensor or accessory is genuine.",
    summary:
      "ZT-SEC1 stores secret keys and answers challenges from the host microcontroller: only a chip holding the right key can reply correctly, so a counterfeit or tampered device is caught. It is built from AES, SHA-256 / HMAC and a true-random-number generator with continuous health tests, behind a simple SPI / I²C interface — and it is designed and owned in India, which matters to buyers who ask who owns the design and where it was made.",
    blocks: [
      { name: "AES engine", text: "128 / 256-bit encryption to protect data and keys." },
      { name: "SHA-256 / HMAC engine", text: "Hashing and keyed authentication codes for challenge-response checks." },
      { name: "Random-number generator", text: "A true-random source with built-in health tests, so a failing noise source is caught rather than trusted." },
      { name: "Protected key storage", text: "Key slots behind a command interface for SPI and I²C hosts. Keys are designed never to leave the chip." },
    ],
    specs: [
      ["Type", "Secure-authentication chip: digital logic around a random-number source"],
      ["Authentication", "Symmetric challenge-response with SHA-256 / HMAC and AES in the first version. Public-key (ECC) authentication is planned for the next revision."],
      ["Functions", "AES-128 / 256 · SHA-256 / HMAC · true-random-number generator with health tests · protected key slots"],
      ["Host interface", "SPI and I²C"],
      ["Proof path", "Verified and proven on an FPGA first (March 2027); a block on the shared test chip follows (August 2027)"],
      ["Process", "180 nm CMOS, SCL via an MPW shuttle (subject to programme access and the shuttle calendar)"],
      ["Verification", "Published test vectors, constrained-random tests, formal checks on the control logic, an FPGA run of the whole design"],
      ["Certification", "The route is agreed with design partners. No certification is claimed today."],
    ],
    specNote:
      "Design targets, not claims. How keys are stored depends on what the target process offers; this is confirmed at Gate G1 (January 2027).",
    deliverables: [
      "FPGA evaluation kit with the verified soft IP (March 2027)",
      "Integration guide, register documentation and published test vectors",
      "Reference drivers for popular microcontrollers (planned)",
      "A named engineer who supports your evaluation and design-in",
    ],
    milestones: [
      { when: "Dec 2026", what: "Specification and register map, with design-partner input" },
      { when: "Jan 2027", what: "Micro-architecture and reference model" },
      { when: "Feb 2027", what: "RTL complete; tests against published vectors" },
      { when: "Mar 2027", what: "Verified, FPGA-proven and frozen: soft IP v1.0" },
      { when: "Apr – Jul 2027", what: "FPGA evaluation with design partners" },
      { when: "Aug – Dec 2027", what: "Test-chip tape-out, fabrication and bring-up" },
    ],
  },

  analog: {
    id: "analog",
    code: "ZT-AFE1",
    name: "24-bit Sensor Front-End",
    kind: "Analog · mixed-signal",
    phase: "Silicon proof: 12 months",
    window: "Dec 2026 → Dec 2027",
    status: "In development · test-chip tape-out targeted August 2027",
    color: "#3b82f6",
    tagline: "One chip between your sensor and your microcontroller.",
    summary:
      "ZT-AFE1 sits between a physical sensor — a pressure bridge, a load cell, an RTD or a thermocouple — and a microcontroller. It powers the sensor, amplifies a signal of only a few millivolts, filters out the noise and converts it into a precise 24-bit number. It is the step that turns a strain-gauge reading into a pressure value, and it is designed for low-power industrial instruments and meters.",
    blocks: [
      { name: "Programmable-gain amplifier", text: "Gain from 1× to 128× lifts millivolt bridge and thermocouple signals to the converter's range." },
      { name: "24-bit sigma-delta ADC", text: "Output rates from 10 samples per second for slow, precise measurements up to 4 kSPS for faster ones." },
      { name: "Reference & excitation", text: "A low-drift on-chip reference and programmable current sources to drive RTDs and strain bridges." },
      { name: "Interface & temperature sensing", text: "SPI and I²C to the host, plus an on-chip temperature sensor for compensation." },
    ],
    specs: [
      ["Type", "Mixed-signal IC with 4–8 sensor input channels"],
      ["Signal chain", "Programmable-gain amplifier (1× to 128×) into a 24-bit sigma-delta ADC"],
      ["Output data rate", "10 samples per second to 4 kSPS"],
      ["Sensors", "Strain and pressure bridges, RTDs and thermocouples (further sensor types are confirmed at specification freeze)"],
      ["Reference & excitation", "Low-drift voltage reference; programmable excitation currents for RTDs and bridges"],
      ["Host interface", "SPI and I²C"],
      ["Supply & package", "2.7 – 5.5 V · QFN-24 (target)"],
      ["Process", "180 nm CMOS, SCL via an MPW shuttle for the first silicon (subject to programme access and the shuttle calendar)"],
      ["Next revision", "On-chip vibration features (RMS and peak) for condition monitoring"],
    ],
    specNote:
      "Design targets, not measurements. The numbers that describe accuracy — noise, drift, linearity and power — are frozen at Gate G1 (January 2027) with design partners, and measured results are published with the silicon proof in December 2027.",
    deliverables: [
      "Draft datasheet and register map, shared as they firm up",
      "Evaluation board with software drivers and a simple GUI (planned for the silicon-proof phase)",
      "Application notes for bridge, RTD and thermocouple sensing",
      "Applications-engineering support through your design-in",
    ],
    milestones: [
      { when: "Dec 2026 – Jan 2027", what: "Specification and architecture, with design-partner input" },
      { when: "Feb – Mar 2027", what: "Circuit design and corner simulation" },
      { when: "Apr – Jun 2027", what: "Layout, extraction and post-layout closure" },
      { when: "Jul – Aug 2027", what: "Sign-off, design freeze and test-chip tape-out" },
      { when: "Sep – Dec 2027", what: "Fabrication, bring-up and the silicon proof" },
    ],
  },
};

/** Side-by-side summary used on the Products page. */
export const CHIP_COMPARE = [
  { label: "What it does", digital: "Stores keys and proves a device is genuine", analog: "Turns a sensor's millivolt signal into a precise 24-bit number" },
  { label: "Who it is for", digital: "Meter makers and utilities · government and defence suppliers · IoT and accessory makers", analog: "Transmitter, weighing, condition-monitoring and water / gas meter makers" },
  { label: "Talks to", digital: "SPI / I²C host microcontroller", analog: "Bridges, RTDs and thermocouples in; SPI / I²C out" },
  { label: "First proof", digital: "FPGA-proven soft IP, March 2027", analog: "Test-chip silicon, December 2027" },
  { label: "Process", digital: "180 nm CMOS (SCL via MPW)", analog: "180 nm CMOS (SCL via MPW)" },
];
