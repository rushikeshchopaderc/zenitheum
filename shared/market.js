/**
 * The market vocabulary shared by the website and the API: the two chips we make, the customer
 * segments we build them for, and the ways a visitor can get in touch. The contact form offers these
 * as choices and the API validates against the same lists, so every lead can be filtered by them.
 */

export const CHIPS = [
  { id: "analog", label: "ZT-AFE1 · analog sensor front-end" },
  { id: "digital", label: "ZT-SEC1 · digital secure chip" },
  { id: "both", label: "Both chips" },
];

/** Ideal customers for the two chips (see src/data/customers.js for the pitch to each). */
export const SEGMENTS = [
  { id: "instrumentation", label: "Pressure, temperature & process-instrument makers" },
  { id: "condition-monitoring", label: "Condition-monitoring & vibration-sensing OEMs" },
  { id: "water-gas", label: "Water & gas meter makers" },
  { id: "weighing", label: "Weighing-scale & load-cell system makers" },
  { id: "energy-metering", label: "Smart electricity-meter makers & utilities" },
  { id: "government-defence", label: "Government, defence & strategic electronics" },
  { id: "iot", label: "IoT device & accessory makers" },
  { id: "other", label: "Something else" },
];

/** Expected annual volume of the customer's product (a sizing hint for the sales conversation). */
export const VOLUMES = [
  { id: "prototype", label: "Prototype / evaluation only" },
  { id: "lt-10k", label: "Under 10,000 a year" },
  { id: "10k-100k", label: "10,000 – 100,000 a year" },
  { id: "100k-1m", label: "100,000 – 1 million a year" },
  { id: "gt-1m", label: "Over 1 million a year" },
  { id: "unsure", label: "Not sure yet" },
];

export const CONTACT_TOPICS = [
  { id: "design-partner", label: "Become a design partner" },
  { id: "evaluation", label: "Early evaluation access (FPGA kit, evaluation board, samples)" },
  { id: "partnership", label: "Foundry, packaging, programme or investor enquiry" },
  { id: "careers", label: "Careers" },
  { id: "other", label: "Something else" },
];

export const ids = (list) => list.map((item) => item.id);
export const labelOf = (list, id) => list.find((item) => item.id === id)?.label ?? id;
