/**
 * Who the two chips are for, and the pitch to each. Drawn from the founder's market research: these are
 * the customer segments the research names. No company is claimed as a customer or partner — every
 * conversation starts from zero, which is exactly what the design-partner programme is for.
 */

export const SEGMENT_PITCH = [
  {
    id: "instrumentation",
    chips: ["analog"],
    title: "Pressure, temperature & process-instrument makers",
    builds: "Transmitters and process-control instruments",
    pain: "Imported front-end chips: one source, long lead times and little engineering help on this side of the border.",
    offer: "Replace a discrete amplifier, converter and reference with one 24-bit front-end — from a supplier whose engineers answer your design-in questions.",
  },
  {
    id: "condition-monitoring",
    chips: ["analog"],
    title: "Condition-monitoring & vibration-sensing OEMs",
    builds: "Sensing nodes on motors, pumps and compressors",
    pain: "Battery-powered, multi-channel nodes need precision and low power, and a supplier who will customise.",
    offer: "A low-power, multi-channel front-end, with on-chip vibration features (RMS and peak) planned for the next revision.",
  },
  {
    id: "water-gas",
    chips: ["analog"],
    title: "Water & gas meter makers",
    builds: "Smart water and gas meters",
    pain: "Meters must sense precisely for years on a small battery, and certification takes time.",
    offer: "A front-end designed for low power and precise pressure and temperature sensing, with engineering support through certification.",
  },
  {
    id: "weighing",
    chips: ["analog"],
    title: "Weighing-scale & load-cell system makers",
    builds: "Weighing scales and industrial load-cell systems",
    pain: "Small weight changes hide in millivolt signals; resolution and stability decide the product.",
    offer: "24-bit resolution, gain up to 128× and on-chip bridge excitation for load cells.",
  },
  {
    id: "energy-metering",
    chips: ["digital", "analog"],
    title: "Smart electricity-meter makers & utilities",
    builds: "Smart meters and the infrastructure that reads them",
    pain: "Government and utility buyers ask who owns the design and where the chip was designed, and tenders ask for security.",
    offer: "ZT-SEC1 gives each meter a tamper-proof identity and authenticated communication, designed and owned in India. A metering front-end built on ZT-AFE1's blocks is the second wave.",
  },
  {
    id: "government-defence",
    chips: ["digital"],
    title: "Government, defence & strategic electronics",
    builds: "Qualified electronics with long service lives",
    pain: "Security you cannot audit, and a supply chain you cannot see into.",
    offer: "Indigenous security with the design owned in India, and a certification route we agree with you from the start.",
  },
  {
    id: "iot",
    chips: ["digital"],
    title: "IoT device & accessory makers",
    builds: "Connected devices, modules and accessories",
    pain: "Counterfeit accessories and cloned modules damage the brand and the customer.",
    offer: "A small, low-cost chip that proves a device or accessory is genuine, with reference drivers for popular microcontrollers.",
  },
];

/** The three reasons to talk to us. */
export const PILLARS = [
  {
    title: "A domestic second source",
    text: "A chip designed in India gives you a second source and a supplier you can actually visit, instead of a single imported part and a distributor's lead time.",
  },
  {
    title: "Designed with you",
    text: "Design partners help set the specification and evaluate the first prototypes, so the chip fits your product rather than a generic datasheet.",
  },
  {
    title: "Support that answers",
    text: "Evaluation boards, drivers, application notes and engineers who stay with you through design-in — in your time zone and in your language.",
  },
];

/** Third-party context for the case. Each figure is attributed; none is a Zenitheum claim. */
export const MARKET_FACTS = [
  {
    value: "~90%",
    text: "of India's semiconductor requirement is imported.",
    source: "NITI Aayog, as reported by Tele.net",
    href: "https://tele.net.in/?p=205919",
  },
  {
    value: "20.33 crore",
    text: "smart meters sanctioned under the RDSS scheme, with 7.24 crore smart meters already installed across the country (30 June 2026).",
    source: "T&D India, citing Parliament",
    href: "https://www.tndindia.com/indias-smart-meter-population-at-7-24-crore-parliament/amp/",
  },
  {
    value: "70–75%",
    text: "of domestic chip applications: the Government's goal for India to design and make by 2029.",
    source: "Press Information Bureau, February 2026",
    href: "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/feb/doc202627782201.pdf",
  },
];

/** The design-partner programme: what happens, in order. */
export const PARTNER_STEPS = [
  { step: "Tell us", text: "Which part you buy today, what it costs you, and what hurts: price, lead time, a single source, or support." },
  { step: "Shape it", text: "We write the specification with you and freeze it at Gate G1 (January 2027), so the chip fits your product." },
  { step: "Evaluate", text: "Try ZT-SEC1 on an FPGA kit from spring 2027, and the ZT-AFE1 evaluation board when silicon returns." },
  { step: "Design in", text: "Our applications engineers work through your design-in with you: schematics, drivers, application notes." },
  { step: "Qualify & supply", text: "You qualify the part; we agree volumes, pricing and long-term supply commitments, then list through distributors." },
];

export const PARTNER_OFFER = [
  "A say in the specification before it freezes",
  "Early evaluation access: the FPGA kit first, then the evaluation board",
  "Priority engineering support through design-in",
  "A conversation about supply commitments, before you design us in",
];

export const PARTNER_ASK = [
  "One or two engineering conversations about your requirements",
  "Your part numbers, volumes and pain points, shared in confidence",
  "Honest feedback on the specification and the prototypes",
];

export const FAQ = [
  {
    q: "Are the chips available now?",
    a: "No. Both are in development. The ZT-SEC1 soft IP is due on an FPGA kit in March 2027, and the first ZT-AFE1 test-chip silicon is targeted for December 2027. The roadmap shows every milestone, and which are done.",
  },
  {
    q: "Do you sell IP cores?",
    a: "No. Zenitheum is a fabless chip company: we design the chips and our foundry and packaging partners make them. The soft-IP phase of ZT-SEC1 is the first stage of designing that chip, not a product line of its own.",
  },
  {
    q: "Where will the chips be made?",
    a: "We are targeting SCL's 180 nm CMOS process through India's ChipIN shuttle programme for the first silicon, with packaging at an Indian OSAT. Access depends on programme eligibility and the shuttle calendar; the production foundry is decided with design partners later.",
  },
  {
    q: "Is there a price?",
    a: "Not yet, and we would rather agree it with design partners than invent a number. Tell us your volume and the part you use today, and we will have a concrete conversation.",
  },
  {
    q: "Does a design-partner conversation commit me to anything?",
    a: "No. It is a conversation about your requirements. Nothing is signed or purchased, and what you tell us stays confidential.",
  },
];
