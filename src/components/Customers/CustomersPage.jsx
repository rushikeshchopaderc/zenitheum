import { Link } from "react-router-dom";
import PageShell from "../layout/PageShell";
import PageHero from "../common/PageHero";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import CTABand from "../common/CTABand";
import Reveal from "../common/Reveal";
import SegmentCard from "../common/SegmentCard";
import usePageMeta from "../../hooks/usePageMeta";
import { CHIPS } from "../../data/chips";
import { FAQ, MARKET_FACTS, PARTNER_ASK, PARTNER_OFFER, PARTNER_STEPS, SEGMENT_PITCH } from "../../data/customers";

const CASES = [
  {
    chip: CHIPS.analog,
    need: "Every instrument that measures pressure, temperature, weight or vibration needs a precise front-end between its sensor and its microcontroller. Today that chip is almost always imported from a handful of global suppliers.",
    gap: "Few Indian companies design precision sensor front-ends, so Indian instrument makers get one source, long lead times and little engineering help close to home.",
    answer:
      "ZT-AFE1 puts the amplifier, the 24-bit converter, the reference and the sensor excitation on one chip, designed in India and developed with instrument makers — with evaluation boards, application notes and engineers who support your design-in.",
  },
  {
    chip: CHIPS.digital,
    need: "A smart meter, a sensor node or an accessory that cannot prove it is genuine can be cloned or tampered with. Utility tenders ask for security, and government and utility buyers ask who owns the design and where the chip was designed.",
    gap: "The established security chips come from a few global suppliers, and an indigenous design that a buyer can audit is hard to find.",
    answer:
      "ZT-SEC1 stores keys and answers authentication challenges with AES, SHA-256 / HMAC and a health-tested random-number generator. It is designed and owned in India, and its certification route is agreed with design partners.",
  },
];

const AFE_SEGMENTS = SEGMENT_PITCH.filter((s) => s.chips.length === 1 && s.chips[0] === "analog");
const SEC_SEGMENTS = SEGMENT_PITCH.filter((s) => s.chips.includes("digital"));

function CustomersPage() {
  usePageMeta({
    title: "Customers",
    description:
      "Who Zenitheum's two chips are for: transmitter, weighing, condition-monitoring and water, gas and electricity-meter makers (ZT-AFE1), and meter, defence, government and IoT buyers who need a made-in-India secure chip (ZT-SEC1).",
    path: "/customers",
  });

  return (
    <PageShell>
      <PageHero
        eyebrow="Customers"
        title="Who we are building for,"
        accent="and why it is worth a conversation."
        description="Zenitheum is a fabless chip company, so the case for it is a customer's case. Here is who the two chips are for, what is wrong with the parts they buy today, and what we offer to design partners — honestly, before a single chip has been fabricated."
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/contactus?topic=design-partner" data-cta="customers-design-partner" className="btn-primary">
            Become a design partner
          </Link>
          <Link to="/products" className="btn-ghost">
            See the chips
          </Link>
        </div>
      </PageHero>

      {/* The case */}
      <Section id="case">
        <SectionHeading
          index="01"
          eyebrow="The case"
          title="One problem for each chip."
          description="Each chip exists because a group of Indian manufacturers depends on parts they cannot easily source, customise or audit."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {CASES.map((c, i) => (
            <Reveal key={c.chip.id} delay={i * 100} className="h-full">
              <article className="panel hud h-full p-6 sm:p-8">
                <p className="font-mono text-xs font-semibold tracking-[0.22em]" style={{ color: c.chip.color }}>
                  {c.chip.code} · {c.chip.kind}
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-white">{c.chip.name}</h3>
                <dl className="mt-6 space-y-5">
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">The need</dt>
                    <dd className="mt-1.5 leading-relaxed text-zinc-300">{c.need}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">The gap</dt>
                    <dd className="mt-1.5 leading-relaxed text-zinc-400">{c.gap}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: c.chip.color }}>
                      Our answer
                    </dt>
                    <dd className="mt-1.5 leading-relaxed text-white">{c.answer}</dd>
                  </div>
                </dl>
              </article>
            </Reveal>
          ))}
        </div>

        <aside className="mt-6 grid gap-4 md:grid-cols-3" aria-label="Market context">
          {MARKET_FACTS.map((fact, i) => (
            <Reveal key={fact.value} delay={i * 80} className="h-full">
              <div className="panel h-full p-6">
                <p className="font-display text-3xl font-bold text-white">{fact.value}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{fact.text}</p>
                <p className="mt-3 text-xs text-zinc-500">
                  Source:{" "}
                  <a href={fact.href} target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 underline-offset-4 transition hover:text-accent-300">
                    {fact.source}
                  </a>
                </p>
              </div>
            </Reveal>
          ))}
        </aside>
      </Section>

      {/* Ideal customers */}
      <Section id="segments" grid>
        <SectionHeading
          index="02"
          eyebrow="Ideal customers"
          title="Seven kinds of customer, two chips."
          description="These are the manufacturers the chips are designed for. We are not claiming any of them as a customer today: every relationship starts with a conversation, and the conversation shapes the specification."
        />

        <div className="mt-14">
          <h3 className="flex items-center gap-3 font-display text-xl font-semibold text-white">
            <i aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: CHIPS.analog.color, boxShadow: `0 0 10px ${CHIPS.analog.color}` }} />
            For ZT-AFE1 · the analog sensor front-end
          </h3>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {AFE_SEGMENTS.map((segment, i) => (
              <SegmentCard key={segment.id} segment={segment} delay={i * 70} />
            ))}
          </ul>
        </div>

        <div className="mt-14">
          <h3 className="flex items-center gap-3 font-display text-xl font-semibold text-white">
            <i aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: CHIPS.digital.color, boxShadow: `0 0 10px ${CHIPS.digital.color}` }} />
            For ZT-SEC1 · the digital secure chip
          </h3>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {SEC_SEGMENTS.map((segment, i) => (
              <SegmentCard key={segment.id} segment={segment} delay={i * 70} />
            ))}
          </ul>
        </div>
      </Section>

      {/* Programme */}
      <Section id="programme">
        <SectionHeading
          index="03"
          eyebrow="Design-partner programme"
          title="What happens when you get in touch."
          description="Five steps from a first conversation to a qualified part. The first two cost you an hour or two of engineering time and commit you to nothing."
        />
        <ol className="mt-12 grid gap-4 md:grid-cols-5">
          {PARTNER_STEPS.map((item, i) => (
            <Reveal key={item.step} as="li" delay={i * 80} className="h-full">
              <div className="panel hud spotlight h-full p-6">
                <span className="font-mono text-xs tracking-[0.2em] text-accent-400">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">{item.step}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Reveal className="h-full">
            <div className="panel h-full p-6 sm:p-8">
              <h3 className="mono-label">What you get</h3>
              <ul className="mt-5 space-y-3">
                {PARTNER_OFFER.map((item) => (
                  <li key={item} className="flex gap-3 text-zinc-300">
                    <span aria-hidden="true" className="mt-0.5 font-mono text-sm text-emerald-300">✓</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={100} className="h-full">
            <div className="panel h-full p-6 sm:p-8">
              <h3 className="mono-label">What we ask of you</h3>
              <ul className="mt-5 space-y-3">
                {PARTNER_ASK.map((item) => (
                  <li key={item} className="flex gap-3 text-zinc-300">
                    <span aria-hidden="true" className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" glow>
        <SectionHeading index="04" eyebrow="Straight answers" title="Questions a careful buyer asks." />
        <div className="mt-12 max-w-3xl space-y-3">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 50}>
              <details className="panel group px-6 py-1 open:bg-white/[0.06]">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 py-3 font-display text-lg font-semibold text-white [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span aria-hidden="true" className="font-mono text-xl text-accent-300 transition group-open:rotate-45">+</span>
                </summary>
                <p className="pb-5 leading-relaxed text-zinc-400">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </Section>

      <CTABand
        title="Tell us what you build."
        description="One conversation about your requirements is enough to start. We will come back with a concrete next step — and with questions of our own."
        primaryLabel="Become a design partner"
        primaryTo="/contactus?topic=design-partner"
        secondaryLabel="See the milestones"
        secondaryTo="/roadmap#milestones"
      />
    </PageShell>
  );
}

export default CustomersPage;
