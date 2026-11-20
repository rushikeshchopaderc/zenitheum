/**
 * The market vocabulary shared by the website and the API: the two chips, how they are delivered, and the customer
 * segments. The forms offer these as choices and the API validates against the same lists.
 *
 * Delivery: ZT-AFE1 (analog) comes as soft IP, hard IP, or both. ZT-SEC1 (digital) is licensed as soft IP only.
 */

export const CHIPS = [
  { id: "analog", label: "ZT-AFE1 · analog sensor front-end" },
  { id: "digital", label: "ZT-SEC1 · digital secure chip" },
  { id: "both", label: "Both chips" },
];

export const ANALOG_FORMATS = [
  { id: "soft", label: "Soft IP" },
  { id: "hard", label: "Hard IP" },
  { id: "both", label: "Both soft and hard IP" },
];

/** Ideal customers, in the order the website lists them (see src/data/customers.js). */
export const SEGMENTS = [
  { id: "energy-metering", label: "Smart electricity-meter makers & utilities" },
  { id: "instrumentation", label: "Pressure, temperature & process-instrument makers" },
  { id: "weighing", label: "Weighing-scale & load-cell system makers" },
  { id: "water-gas", label: "Water & gas meter makers" },
  { id: "condition-monitoring", label: "Condition-monitoring & vibration-sensing OEMs" },
  { id: "government-defence", label: "Government, defence & strategic electronics" },
  { id: "iot", label: "IoT device & accessory makers" },
  { id: "other", label: "Something else" },
];

export const ids = (list) => list.map((item) => item.id);
export const labelOf = (list, id) => list.find((item) => item.id === id)?.label ?? id;

/** Does this chip choice include the analog chip? (Only then is a soft / hard choice needed.) */
export const includesAnalog = (chip) => chip === "analog" || chip === "both";
