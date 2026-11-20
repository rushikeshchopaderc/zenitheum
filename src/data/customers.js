/**
 * Ideal customers, in the order we recommend talking to them (largest fit first). The same ids are used by the forms
 * (shared/market.js SEGMENTS), so a click on "Book a demo" for a customer type arrives pre-filled.
 */
export const CUSTOMERS = [
  {
    id: "energy-metering",
    chips: ["digital", "analog"],
    title: "Smart electricity-meter makers & utilities",
    pitch: "Prove every meter is genuine and measure what it senses.",
  },
  {
    id: "instrumentation",
    chips: ["analog"],
    title: "Pressure, temperature & process-instrument makers",
    pitch: "One front-end for transmitters and process instruments.",
  },
  {
    id: "weighing",
    chips: ["analog"],
    title: "Weighing-scale & load-cell system makers",
    pitch: "24-bit resolution for load cells, with bridge drive built in.",
  },
  {
    id: "water-gas",
    chips: ["analog"],
    title: "Water & gas meter makers",
    pitch: "Precise pressure and temperature sensing for meters.",
  },
  {
    id: "condition-monitoring",
    chips: ["analog"],
    title: "Condition-monitoring & vibration-sensing OEMs",
    pitch: "Multi-channel sensing for motors, pumps and compressors.",
  },
  {
    id: "government-defence",
    chips: ["digital"],
    title: "Government, defence & strategic electronics",
    pitch: "Security you can audit, with the design owned in India.",
  },
  {
    id: "iot",
    chips: ["digital"],
    title: "IoT device & accessory makers",
    pitch: "Stop cloned modules and counterfeit accessories.",
  },
];

/** Why talk to us early about a customised chip. */
export const CUSTOM_BENEFITS = [
  {
    title: "Faster than starting from scratch",
    text: "Changes start from a proven standard design, so a tailored chip reaches you sooner and with less risk than a clean-sheet one.",
  },
  {
    title: "Shaped around your product",
    text: "Channel count, interfaces, pin-out, security features: tell us what your product needs and we will build it in.",
  },
  {
    title: "First in line",
    text: "Customers who join early influence the standard chip itself and are first to receive it.",
  },
];

export const CUSTOM_STEPS = [
  { title: "Tell us your product", text: "A short call about what you build and what you need." },
  { title: "We tailor the chip", text: "We agree the changes and the delivery format with you." },
  { title: "You integrate it", text: "Soft or hard IP, with integration support." },
];
