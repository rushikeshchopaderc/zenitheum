/**
 * The two chips, written for a buyer: what it does, how it works, how it connects to the customer's device, and how it is
 * delivered. Deliberately short. Nothing here claims measured performance: both chips are in development, and the
 * website's milestones say when each becomes available.
 *
 * Delivery: ZT-AFE1 (analog) comes as soft IP, hard IP or both. ZT-SEC1 (digital) is licensed as soft IP only.
 */
export const CHIPS = {
  analog: {
    id: "analog",
    code: "ZT-AFE1",
    name: "Sensor front-end",
    color: "#3b82f6",
    headline: "Read any bridge, RTD or thermocouple with 24-bit precision.",
    does: "Turns a sensor's tiny electrical signal into a precise 24-bit number your microcontroller can use.",
    features: ["24-bit", "Gain 1× to 128×", "4–8 sensor inputs", "SPI / I²C", "2.7–5.5 V"],
    works: [
      { title: "Powers the sensor", text: "Drives pressure bridges, load cells and RTDs." },
      { title: "Amplifies the signal", text: "Lifts millivolt signals to a measurable level." },
      { title: "Delivers clean data", text: "Filters noise and converts to a 24-bit reading." },
    ],
    connects: {
      from: "Your sensor",
      via: "ZT-AFE1",
      to: "Your microcontroller",
      steps: [
        "Wire the sensor to the ZT-AFE1 inputs.",
        "Connect ZT-AFE1 to your microcontroller over SPI or I²C, on a single supply.",
        "Read measurements in firmware, with our reference driver.",
      ],
    },
    delivery: [
      { label: "Soft IP", text: "A portable design package you integrate into your own chip.", available: "from Mar 2027" },
      { label: "Hard IP", text: "A finished, silicon-proven layout block, ready to place in your chip.", available: "from Dec 2027" },
    ],
  },

  digital: {
    id: "digital",
    code: "ZT-SEC1",
    name: "Secure authentication",
    color: "#22d3ee",
    headline: "Give every device an identity that cannot be copied.",
    does: "Proves a meter, sensor or accessory is genuine, so counterfeit and tampered units are rejected.",
    features: ["AES", "SHA-256 / HMAC", "True random numbers", "Protected keys", "APB bus · SPI / I²C"],
    works: [
      { title: "Your system asks", text: "It sends the device a random challenge." },
      { title: "The chip answers", text: "It replies using a secret key that never leaves the chip." },
      { title: "You verify", text: "Genuine devices pass; clones fail." },
    ],
    connects: {
      from: "Your processor",
      via: "ZT-SEC1 core",
      to: "Your device",
      steps: [
        "Add the ZT-SEC1 core to your chip or FPGA design.",
        "Connect it to your processor over a standard on-chip bus (APB), or over SPI / I²C from an external microcontroller.",
        "Provision keys once, then authenticate in firmware with our reference driver.",
      ],
    },
    delivery: [{ label: "Soft IP licence", text: "Licensed as soft IP only: a design you integrate into your own chip or FPGA.", available: "from Mar 2027" }],
  },
};

export const CHIP_LIST = [CHIPS.digital, CHIPS.analog];
