import PageShell from "../layout/PageShell";
import PageHero from "../common/PageHero";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import StatStrip from "../common/StatStrip";
import CTABand from "../common/CTABand";
import Reveal from "../common/Reveal";
import GanttChart from "../fx/GanttChart";
import ProgrammeClock from "../fx/ProgrammeClock";
import RoadmapTimeline from "./RoadmapTimeline";
import MilestoneChart from "../Milestones/MilestoneChart";
import usePageMeta from "../../hooks/usePageMeta";
import { GATES, MONTHS, OUTCOMES, RISKS, TRACKS } from "@shared/roadmap.js";

const longDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS.find((x) => x.key === `${y}-${String(m).padStart(2, "0")}`)?.short} ${y}`;
};

function RoadmapPage() {
  usePageMeta({
    title: "Roadmap Dec 2026 – Dec 2027",
    description:
      "Zenitheum's roadmap from December 2026 to December 2027 for two chips: the ZT-SEC1 soft IP frozen in March 2027 and the ZT-AFE1 analog test chip taped out in August and measured in December 2027 — every milestone, which are complete, and when the rest land.",
    path: "/roadmap",
  });

  return (
    <PageShell>
      <PageHero
        eyebrow="Roadmap · Dec 2026 → Dec 2027"
        title="Thirteen months,"
        accent="step by step."
        description="From the day the interns start on 1 December 2026 to the ZT-AFE1 silicon proof in December 2027: every milestone, which ones are complete, when each of the rest lands — and what we do if one slips."
      >
        <div className="flex justify-center">
          <ProgrammeClock className="w-full max-w-sm text-left" />
        </div>
      </PageHero>

      {/* Milestones: done, and dated */}
      <Section id="milestones" glow>
        <SectionHeading
          index="01"
          eyebrow="Milestones"
          title="Every milestone, done or dated."
          description="The company's milestones and those of both chips on one timeline. Completed ones are ticked with the day they were finished; each one still to come has a target date. Switch lanes to focus on one chip."
        />
        <Reveal delay={100} className="mt-12">
          <MilestoneChart />
        </Reveal>
      </Section>

      {/* Overview */}
      <Section id="overview" grid>
        <SectionHeading
          index="02"
          eyebrow="At a glance"
          title="Five lanes. Five gates."
          description="Two chips run in parallel with the infrastructure, hiring and customer work that make them shippable. Solid bars are work in progress, dashed bars are what follows or depends on someone else's calendar, and the diamonds are decision gates."
        />
        <Reveal delay={100}>
          <div className="panel hud mt-12 px-4 sm:px-8">
            <GanttChart />
          </div>
        </Reveal>

        <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3" aria-label="Lane legend">
          {TRACKS.map((track) => (
            <li key={track.id} className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-zinc-400">
              <i aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: track.color, boxShadow: `0 0 8px ${track.color}` }} />
              <span className="text-zinc-300">{track.name}</span>
              <span className="w-full pl-[1.15rem] font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500 sm:w-auto sm:pl-0">{track.blurb}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Step by step */}
      <Section id="steps" grid>
        <SectionHeading
          index="03"
          eyebrow="Step by step"
          title="Ten steps from kick-off to silicon."
          description="Scroll to follow the programme. Filter by lane to see just ZT-AFE1, just ZT-SEC1, or the work around them."
        />
        <div className="mt-12">
          <RoadmapTimeline />
        </div>
      </Section>

      {/* Gates */}
      <Section id="gates">
        <SectionHeading
          index="04"
          eyebrow="Decision gates"
          title="Pre-agreed checkpoints to continue, change or stop."
          description="A gate is decided on written criteria, not on mood. Each one comes with its fallback, so a miss is a plan, not a surprise."
        />
        <div className="mt-12 space-y-4">
          {GATES.map((gate, i) => (
            <Reveal key={gate.id} delay={i * 60}>
              <div className="panel hud grid gap-5 p-6 md:grid-cols-[11rem_1fr_1fr] md:gap-8 md:p-7">
                <div>
                  <span className="inline-block rounded border border-white/40 px-2.5 py-1 font-mono text-xs tracking-[0.12em] text-white">
                    {gate.id}
                  </span>
                  <p className="mt-3 font-display text-lg font-semibold leading-snug text-white">{gate.title}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-400">{longDate(gate.date)}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Pass criterion</p>
                  <p className="mt-2 leading-relaxed text-zinc-300">{gate.criteria}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">If it fails</p>
                  <p className="mt-2 leading-relaxed text-zinc-400">{gate.fallback}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Outcomes + risks */}
      <Section id="outcomes" glow>
        <SectionHeading
          index="05"
          eyebrow="Year one, in numbers"
          title="What thirteen months should leave behind."
          align="center"
        />
        <StatStrip items={OUTCOMES} className="mt-14" />

        <div className="mt-24">
          <SectionHeading
            index="06"
            eyebrow="Risks"
            title="What could go wrong, and what we do about it."
            description="A roadmap that names no risks is a wish list."
          />
          <ul className="mt-12 grid gap-4 md:grid-cols-2">
            {RISKS.map((item, i) => (
              <Reveal key={item.risk} as="li" delay={i * 70} className="h-full">
                <div className="panel h-full p-6">
                  <p className="flex items-start gap-3 font-display text-lg font-semibold leading-snug text-white">
                    <span aria-hidden="true" className="mt-1 font-mono text-sm text-accent-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.risk}
                  </p>
                  <p className="mt-3 pl-8 leading-relaxed text-zinc-400">{item.response}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <CTABand
        title="Help us hit these dates."
        description="Seven seats open across four roles, starting 1 December 2026 — or become a design partner while the specifications take shape."
        primaryLabel="See open roles"
        primaryTo="/careers"
        secondaryLabel="Become a design partner"
        secondaryTo="/contactus?topic=design-partner"
      />
    </PageShell>
  );
}

export default RoadmapPage;
