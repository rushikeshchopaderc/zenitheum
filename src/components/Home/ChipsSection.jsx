import { Link } from "react-router-dom";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import Reveal from "../common/Reveal";
import BitStream from "../fx/BitStream";
import WaveForm from "../fx/WaveForm";
import { CHIPS } from "../../data/chips";

function ChipCard({ chip, visual, delay }) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="panel hud spotlight panel-hover group flex h-full flex-col overflow-hidden">
        <div className="relative h-44 overflow-hidden border-b border-white/10 bg-ink-950/70">
          <div className="absolute inset-0 flex items-center">{visual}</div>
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-ink-900/30" />
          <div className="absolute inset-x-6 top-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold tracking-[0.22em]" style={{ color: chip.color }}>
                {chip.code}
              </span>
              <span className="chip">{chip.kind}</span>
            </div>
            <span className="rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: `${chip.color}66`, color: chip.color }}>
              {chip.phase}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-7 sm:p-8">
          <h3 className="fluid-h3 font-semibold">{chip.name}</h3>
          <p className="mt-2 font-medium text-zinc-200">{chip.tagline}</p>
          <p className="mt-4 leading-relaxed text-zinc-400">{chip.summary}</p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {chip.blocks.map((block) => (
              <li key={block.name} className="chip">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: chip.color }} />
                {block.name}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">{chip.window}</span>
            <Link
              to={`/products#${chip.id}`}
              className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent-300 transition group-hover:gap-3 group-hover:text-accent-200"
            >
              Explore {chip.code}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/** The two chips we are building. */
function ChipsSection() {
  return (
    <Section id="build" glow>
      <SectionHeading
        index="01"
        eyebrow="What we are building"
        title="Two chips. One disciplined pipeline."
        description="A digital security chip that proves a device is genuine, and an analog front-end that reads a sensor with 24-bit precision. They share one verification and design infrastructure, and meter makers need both."
      />
      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <ChipCard chip={CHIPS.digital} delay={0} visual={<BitStream rows={7} className="w-full" />} />
        <ChipCard chip={CHIPS.analog} delay={120} visual={<WaveForm className="h-full w-full" />} />
      </div>
    </Section>
  );
}

export default ChipsSection;
