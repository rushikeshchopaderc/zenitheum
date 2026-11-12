import PageShell from "../layout/PageShell";
import PageHero from "../common/PageHero";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import CTABand from "../common/CTABand";
import Reveal from "../common/Reveal";
import SignalPipeline from "../fx/SignalPipeline";
import FlowExplorer from "./FlowExplorer";
import PipelineTerminal from "./PipelineTerminal";
import usePageMeta from "../../hooks/usePageMeta";
import { FAB_PATH, INTEGRITY, PRINCIPLES, TARGET_PATH, VERIFICATION } from "../../data/flow";

const FAB_LANE = {
  id: "fab",
  code: "FABLESS",
  title: "From GDSII to datasheet",
  duration: "We design · partners fabricate",
  color: "#7dd3fc",
  steps: FAB_PATH.map((s) => ({ name: s.name, note: s.note })),
};

function TechnologyPage() {
  usePageMeta({
    title: "Technology",
    description:
      "How Zenitheum designs ZT-SEC1 and ZT-AFE1: an industry-standard commercial EDA flow, written verification lists, CI/CD pipelines, the fabless fabrication path and clean-room design practices.",
    path: "/technology",
  });

  return (
    <PageShell>
      <PageHero
        eyebrow="Technology"
        title="Industry-standard flow,"
        accent="reproducible by commit."
        description="We design in the commercial EDA flows that foundries and customers recognise, and sign off against the foundry's own decks. Every step is a pipeline job, and every result can be rebuilt from a tagged commit."
      />

      <Section id="flow">
        <SectionHeading
          index="01"
          eyebrow="Design flow"
          title="Every step, and the tools behind it."
          description="Pick a chip and walk its flow. For each step: what we do, and the kind of industry-standard tool involved."
        />
        <div className="mt-12">
          <FlowExplorer />
        </div>
      </Section>

      <Section id="pipeline" grid>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <SectionHeading
              index="02"
              eyebrow="Pipeline-first"
              title="In a chip company, the pipeline is the factory."
              description="Every commit to RTL or schematics triggers the same checks, in the same containers, with no one babysitting. It is the reason a small team can ship credibly — and the first thing our DevOps engineer builds."
            />
          </div>
          <Reveal delay={120}>
            <PipelineTerminal />
          </Reveal>
        </div>
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((item, i) => (
            <Reveal key={item.title} as="li" delay={i * 80} className="h-full">
              <div className="panel hud spotlight h-full p-6">
                <span className="font-mono text-xs tracking-[0.2em] text-accent-400">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section id="verification">
        <SectionHeading
          index="03"
          eyebrow="Verification"
          title="How we know it works."
          description="Nothing is released on the strength of a demo. Each chip has its own written list of what must pass first."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {[
            { id: "digital", title: "Digital secure chip", code: "ZT-SEC1", color: "#22d3ee", items: VERIFICATION.digital },
            { id: "analog", title: "Analog sensor front-end", code: "ZT-AFE1", color: "#3b82f6", items: VERIFICATION.analog },
          ].map((col, i) => (
            <Reveal key={col.id} delay={i * 100} className="h-full">
              <div className="panel hud h-full p-7 sm:p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-xl font-semibold text-white">{col.title}</h3>
                  <span className="font-mono text-xs tracking-[0.2em]" style={{ color: col.color }}>
                    {col.code}
                  </span>
                </div>
                <ul className="mt-6 space-y-3.5">
                  {col.items.map((item) => (
                    <li key={item} className="flex gap-3 text-zinc-300">
                      <span aria-hidden="true" className="mt-0.5 font-mono text-sm" style={{ color: col.color }}>
                        ✓
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="fabless" glow>
        <SectionHeading
          index="04"
          eyebrow="Fabless"
          title="We design. Partners fabricate."
          description="No fab, no packaging line — and no pretending otherwise. Our job is everything up to a signed-off GDSII, and everything after the wafers come back."
        />
        <SignalPipeline lanes={[FAB_LANE]} className="mt-12" />
        <div className="mt-10">
          <p className="mono-label">Our target path to silicon</p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-3">
            {TARGET_PATH.map((item, i) => (
              <Reveal key={item.name} as="li" delay={i * 80} className="h-full">
                <div className="panel h-full p-5">
                  <p className="font-mono text-sm font-semibold tracking-[0.1em] text-accent-300">{item.name}</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.note}</p>
                </div>
              </Reveal>
            ))}
          </ul>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-zinc-500">
            Access to SCL 180 nm through an MPW programme depends on programme eligibility and the shuttle calendar. The roadmap says so wherever a date relies on it.
          </p>
        </div>
      </Section>

      <Section id="integrity">
        <SectionHeading
          index="05"
          eyebrow="IP integrity"
          title="Clean-room by default."
          description="Re-creating a function that others already sell is legitimate — copying their design is not. These are the habits that keep every Zenitheum block unmistakably ours."
        />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INTEGRITY.map((item, i) => (
            <Reveal key={item.title} as="li" delay={(i % 3) * 80} className="h-full">
              <div className="panel hud spotlight h-full p-6">
                <span className="font-mono text-xs tracking-[0.2em] text-accent-400">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Section>

      <CTABand
        title="Want to see the pipeline up close?"
        description="Talk to us about what you need from a chip — or about building the pipeline with us."
        primaryLabel="Talk to us"
        primaryTo="/contactus?topic=design-partner"
        secondaryLabel="DevOps Engineer role"
        secondaryTo="/careers/devops-engineer"
      />
    </PageShell>
  );
}

export default TechnologyPage;
