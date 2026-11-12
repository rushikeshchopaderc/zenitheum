/**
 * Block diagrams for the two chips. Hand-drawn SVG; the dashed lines animate in the direction of
 * signal flow. Shared helpers keep each diagram short.
 */
const MONO = "JetBrains Mono Variable, ui-monospace, monospace";

function Box({ x, y, w, h, title, sub, accent = "#60a5fa", size = 13 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" fill="rgba(9,9,11,.9)" stroke={accent} strokeOpacity=".7" strokeWidth="1.2" />
      <rect x={x} y={y} width={w} height={h} rx="8" fill={accent} opacity=".07" />
      <text x={x + w / 2} y={y + h / 2 - (sub ? 4 : -4)} textAnchor="middle" fill="#fff" fontFamily="Sora Variable, sans-serif" fontWeight="600" fontSize={size}>
        {title}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle" fill="rgb(161 161 170)" fontFamily={MONO} fontSize="9.5" letterSpacing=".4">
          {sub}
        </text>
      )}
    </g>
  );
}

function Flow({ d, color = "rgb(103,232,249)", delay = 0 }) {
  return (
    <g>
      <path d={d} fill="none" stroke="rgba(96,165,250,.28)" strokeWidth="1.2" strokeLinejoin="round" />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flow-line"
        style={{ animationDelay: `${delay}s` }}
        markerEnd="url(#arrow)"
      />
    </g>
  );
}

function Label({ x, y, children, anchor = "start", color = "rgb(147,197,253)" }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontFamily={MONO} fontSize="10" letterSpacing=".8">
      {children}
    </text>
  );
}

const Defs = () => (
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10z" fill="rgb(147,197,253)" />
    </marker>
  </defs>
);

export function DigitalDiagram() {
  return (
    <svg
      viewBox="0 0 720 300"
      className="h-auto w-full"
      role="img"
      aria-label="ZT-SEC1 block diagram: a host microcontroller sends a challenge over SPI or I2C to the command interface, which drives AES, SHA-256 and HMAC engines and a random-number generator, all using protected key storage, and returns a response"
      focusable="false"
    >
      <Defs />
      <Box x={10} y={108} w={84} h={84} title="Host MCU" sub="your product" accent="#71717a" size={12} />

      <Flow d="M94 136 H170" />
      <Flow d="M170 166 H94" color="rgb(147,197,253)" delay={0.5} />
      <Label x={132} y={126} anchor="middle">CHALLENGE</Label>
      <Label x={132} y={186} anchor="middle">RESPONSE</Label>

      <Box x={170} y={108} w={138} h={84} title="Command interface" sub="SPI · I²C" accent="#22d3ee" size={12} />

      <Flow d="M308 128 H336 V60 H364" delay={0.2} />
      <Flow d="M308 150 H364" delay={0.5} />
      <Flow d="M308 172 H336 V240 H364" delay={0.8} />

      <Box x={364} y={30} w={186} h={60} title="AES-128 / 256" sub="data and key protection" />
      <Box x={364} y={120} w={186} h={60} title="SHA-256 / HMAC" sub="keyed authentication" />
      <Box x={364} y={210} w={186} h={60} title="Random-number generator" sub="with continuous health tests" size={12} />

      <Flow d="M550 60 H581 V128 H612" delay={0.3} />
      <Flow d="M550 150 H612" delay={0.6} />
      <Flow d="M550 240 H581 V172 H612" delay={0.9} />

      <Box x={612} y={108} w={98} h={84} title="Key store" sub="protected slots" accent="#a78bfa" />
    </svg>
  );
}

export function AnalogDiagram() {
  return (
    <svg
      viewBox="0 0 720 300"
      className="h-auto w-full"
      role="img"
      aria-label="ZT-AFE1 block diagram: a sensor feeds an input multiplexer, a programmable-gain amplifier, a 24-bit sigma-delta converter and a digital filter, then an SPI or I2C interface to the host. An excitation source drives the sensor, a reference feeds the converter and a temperature sensor feeds the filter."
      focusable="false"
    >
      <Defs />
      <Label x={10} y={26}>AVDD 2.7 – 5.5 V</Label>

      <Box x={10} y={108} w={108} h={84} title="Sensor" sub="bridge · RTD · TC" accent="#71717a" />
      <Box x={146} y={108} w={84} h={84} title="Input mux" sub="4–8 channels" size={12} />
      <Box x={258} y={108} w={96} h={84} title="PGA" sub="1× – 128×" />
      <Box x={382} y={108} w={104} h={84} title="Σ-Δ ADC" sub="24-bit" accent="#22d3ee" />
      <Box x={514} y={108} w={84} h={84} title="Filter" sub="10 – 4k SPS" size={12} />
      <Box x={626} y={108} w={84} h={84} title="SPI" sub="I²C · host" size={12} />

      <Flow d="M118 150 H146" />
      <Flow d="M230 150 H258" delay={0.15} />
      <Flow d="M354 150 H382" delay={0.3} />
      <Flow d="M486 150 H514" delay={0.45} />
      <Flow d="M598 150 H626" delay={0.6} />

      <Box x={146} y={216} w={140} h={56} title="Excitation" sub="RTD · bridge currents" accent="#3b82f6" size={12} />
      <Flow d="M146 244 H64 V192" color="rgb(147,197,253)" delay={0.2} />

      <Box x={330} y={216} w={130} h={56} title="Reference" sub="low-drift VREF" accent="#3b82f6" size={12} />
      <Flow d="M434 216 V192" color="rgb(147,197,253)" delay={0.4} />

      <Box x={510} y={216} w={110} h={56} title="Temp sensor" sub="on-chip" accent="#3b82f6" size={12} />
      <Flow d="M556 216 V192" color="rgb(147,197,253)" delay={0.6} />
    </svg>
  );
}
