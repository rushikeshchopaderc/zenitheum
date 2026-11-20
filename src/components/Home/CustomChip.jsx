import { Link } from "react-router-dom";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import Reveal from "../common/Reveal";
import { CUSTOM_BENEFITS, CUSTOM_STEPS } from "../../data/customers";

/** The value proposition: a standard chip with room to customise, and why talking early pays. */
export default function CustomChip() {
  return (
    <Section id="custom" glow>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Custom chips"
            title="Start with a standard chip. Make it yours."
            description="Both chips are standard products with room to tailor them. Talk to us early and the chip is shaped around your product before the specifications freeze in January 2027."
          />
          <Reveal delay={120}>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/#demo" className="btn-primary">
                Discuss your chip
              </Link>
              <Link to="/#order" className="btn-ghost">
                Place an order
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="space-y-4">
          {CUSTOM_BENEFITS.map((benefit, i) => (
            <Reveal key={benefit.title} delay={i * 80}>
              <div className="panel hud p-6">
                <h3 className="font-display text-lg font-semibold text-white">{benefit.title}</h3>
                <p className="mt-2 leading-relaxed text-zinc-400">{benefit.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <ol className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="How a custom chip works">
        {CUSTOM_STEPS.map((step, i) => (
          <Reveal key={step.title} as="li" delay={i * 80} className="h-full">
            <div className="flex h-full gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <span className="font-display text-3xl font-bold text-accent-500/80" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <p className="font-display font-semibold text-white">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">{step.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
