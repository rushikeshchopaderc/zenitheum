/**
 * The ecosystem map: three concentric rings around Zenitheum.
 * Everything here is "what we build for / rely on" — none of it is a claim of partnership.
 */
export const ECOSYSTEM = [
  {
    id: "build",
    title: "What we build",
    blurb: "Two chips, designed in-house, and the pipeline that carries them to silicon.",
    radius: 23,
    duration: 70,
    reverse: false,
    items: [
      { label: "ZT-SEC1", hint: "Digital secure chip" },
      { label: "ZT-AFE1", hint: "Analog sensor front-end" },
      { label: "CI / CD", hint: "Design pipeline" },
    ],
  },
  {
    id: "path",
    title: "How the silicon gets made",
    blurb: "We are fabless: foundries fabricate and packaging houses assemble, through India's design-support programmes.",
    radius: 36,
    duration: 110,
    reverse: true,
    items: [
      { label: "SCL 180 nm", hint: "Target process" },
      { label: "ChipIN", hint: "MPW shuttle access" },
      { label: "OSAT", hint: "Packaging & test" },
      { label: "EDA", hint: "Commercial design tools" },
    ],
  },
  {
    id: "world",
    title: "Who the chips are for",
    blurb: "Design partners in the industries that build India's instruments, meters and secure devices.",
    radius: 47.5,
    duration: 160,
    reverse: false,
    items: [
      { label: "Instrument makers", hint: "Transmitters, process control" },
      { label: "Meter makers", hint: "Electricity, water, gas" },
      { label: "Weighing", hint: "Scales, load cells" },
      { label: "Condition monitoring", hint: "Vibration, temperature" },
      { label: "Defence & government", hint: "Strategic electronics" },
      { label: "IoT makers", hint: "Devices, accessories" },
    ],
  },
];

/** Customer segments shown in the home-page ticker. */
export const SEGMENT_TICKER = [
  "Pressure transmitters",
  "Temperature instruments",
  "Weighing scales",
  "Condition monitoring",
  "Water meters",
  "Gas meters",
  "Smart electricity meters",
  "Defence electronics",
  "IoT devices",
];
