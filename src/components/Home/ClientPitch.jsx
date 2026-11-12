import { Link } from "react-router-dom";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import Reveal from "../common/Reveal";
import SegmentCard from "../common/SegmentCard";
import { MARKET_FACTS, PILLARS, SEGMENT_PITCH } from "../../data/customers";

/**
 * The pitch to the ideal customers of the two chips: who we are building for, why a domestic second source
 * is worth a conversation, and one clear next step — becoming a design partner.
 */
function ClientPitch() {
  return (
    <Section id="customers" grid>
      <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <SectionHeading
            index="02"
            eyebrow="For design partners"
            title="Built for the people who build India's instruments, meters and secure devices."
            description="If you make transmitters, weighing systems, condition-monitoring sensors, water, gas or electricity meters, or devices that must prove they are genuine, we would like to design these chips with you — before the specification freezes."
          />

          <ol className="mt-10 space-y-5">
            {PILLARS.map((pillar, i) => (
              <Reveal key={pillar.title} as="li" delay={i * 80}>
                <div className="flex gap-5 border-l border-accent-600/40 pl-6">
                  <span className="mt-0.5 font-mono text-xs tracking-[0.2em] text-accent-400">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">{pillar.title}</h3>
                    <p className="mt-1.5 leading-relaxed text-zinc-400">{pillar.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={120}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/contactus?topic=design-partner" data-cta="pitch-design-partner" className="btn-primary">
                Become a design partner
              </Link>
              <Link to="/customers" data-cta="pitch-customers" className="btn-ghost">
                The case for each customer
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <aside className="panel hud p-6 sm:p-8" aria-labelledby="why-now">
            <h3 id="why-now" className="mono-label">
              Why now
            </h3>
            <dl className="mt-6 divide-y divide-white/10">
              {MARKET_FACTS.map((fact) => (
                <div key={fact.value} className="py-5 first:pt-0 last:pb-0">
                  <dt className="font-display text-4xl font-bold text-white">{fact.value}</dt>
                  <dd className="mt-2 leading-relaxed text-zinc-300">{fact.text}</dd>
                  <dd className="mt-1.5 text-xs text-zinc-500">
                    Source:{" "}
                    <a href={fact.href} target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 underline-offset-4 transition hover:text-accent-300">
                      {fact.source}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </Reveal>
      </div>

      <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {SEGMENT_PITCH.map((segment, i) => (
          <SegmentCard key={segment.id} segment={segment} delay={(i % 4) * 70} />
        ))}
        <Reveal as="li" delay={210} className="h-full">
          <div className="flex h-full flex-col justify-between rounded-2xl border border-dashed border-accent-500/40 bg-accent-600/[0.06] p-6">
            <div>
              <h3 className="font-display text-lg font-semibold leading-snug text-white">Do you build something else that senses or must be trusted?</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Tell us what you make and which part you buy today. If a 24-bit front-end or a secure chip could help, we would like to hear about it.
              </p>
            </div>
            <Link
              to="/contactus?topic=design-partner"
              data-cta="segment-other"
              className="inline-flex min-h-[44px] items-center gap-2 pt-5 text-sm font-semibold uppercase tracking-wider text-accent-300 transition hover:gap-3 hover:text-accent-200"
            >
              Start a conversation <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </Reveal>
      </ul>
    </Section>
  );
}

export default ClientPitch;
