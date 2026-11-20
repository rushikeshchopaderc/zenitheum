import { Link } from "react-router-dom";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import Reveal from "../common/Reveal";
import { CHIP_LIST } from "../../data/chips";

const to = (chip, hash) => ({ pathname: "/", search: `?chip=${chip}`, hash });

function Diagram({ chip }) {
  const { from, via, to: end } = chip.connects;
  const box = "flex min-h-[3.25rem] min-w-0 flex-1 break-words items-center justify-center rounded-xl border px-3 py-2 text-center text-sm font-medium";
  return (
    <div className="flex items-stretch gap-2 sm:gap-3" role="img" aria-label={`${from} connects to ${via}, which connects to ${end}`}>
      <span className={`${box} border-white/15 bg-white/[0.03] text-zinc-300`}>{from}</span>
      <span aria-hidden="true" className="self-center font-mono text-accent-300">→</span>
      <span className={`${box} text-white`} style={{ borderColor: `${chip.color}99`, background: `${chip.color}1a` }}>{via}</span>
      <span aria-hidden="true" className="self-center font-mono text-accent-300">→</span>
      <span className={`${box} border-white/15 bg-white/[0.03] text-zinc-300`}>{end}</span>
    </div>
  );
}

function ChipCard({ chip, delay }) {
  return (
    <Reveal delay={delay} className="h-full">
      <article id={`chip-${chip.id}`} className="panel hud flex h-full flex-col p-6 sm:p-8">
        <p className="font-mono text-xs font-semibold tracking-[0.22em]" style={{ color: chip.color }}>
          {chip.code}
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">{chip.name}</h3>
        <p className="mt-3 text-lg font-medium leading-snug text-zinc-100">{chip.headline}</p>
        <p className="mt-3 leading-relaxed text-zinc-400">{chip.does}</p>

        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Key features">
          {chip.features.map((feature) => (
            <li key={feature} className="chip">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: chip.color }} />
              {feature}
            </li>
          ))}
        </ul>

        <h4 className="mono-label mt-8">How it works</h4>
        <ol className="mt-4 space-y-3">
          {chip.works.map((step, i) => (
            <li key={step.title} className="flex gap-3.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold" style={{ borderColor: `${chip.color}88`, color: chip.color }}>
                {i + 1}
              </span>
              <p className="text-zinc-300">
                <b className="font-semibold text-white">{step.title}.</b> {step.text}
              </p>
            </li>
          ))}
        </ol>

        <h4 className="mono-label mt-8">How it connects to your device</h4>
        <div className="mt-4">
          <Diagram chip={chip} />
        </div>
        <ul className="mt-4 space-y-2">
          {chip.connects.steps.map((step) => (
            <li key={step} className="flex gap-3 text-sm leading-relaxed text-zinc-400">
              <span aria-hidden="true" className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: chip.color }} />
              {step}
            </li>
          ))}
        </ul>

        <h4 className="mono-label mt-8">Delivered as</h4>
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {chip.delivery.map((format) => (
            <li key={format.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-display font-semibold text-white">{format.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">{format.text}</p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: chip.color }}>
                {format.available}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap gap-3 pt-8">
          <Link to={to(chip.id, "#demo")} className="btn-primary">
            Book a demo
          </Link>
          <Link to={to(chip.id, "#order")} className="btn-ghost">
            Order {chip.code}
          </Link>
        </div>
        <p className="mt-5 text-sm text-zinc-400">
          Need it different?{" "}
          <Link to={to(chip.id, "#customise")} className="inline-flex min-h-[44px] items-center font-semibold text-accent-300 underline underline-offset-4">
            Customise {chip.code}
          </Link>
        </p>
      </article>
    </Reveal>
  );
}

/** The two chips: what each does, how it works, how it connects to the customer's device, and how it is delivered. */
export default function Products() {
  return (
    <Section id="products" glow>
      <SectionHeading eyebrow="Products" title="Two chips. Pick one, or both." />
      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {CHIP_LIST.map((chip, i) => (
          <ChipCard key={chip.id} chip={chip} delay={i * 100} />
        ))}
      </div>
    </Section>
  );
}
