import { Link } from "react-router-dom";
import PageShell from "../layout/PageShell";
import PageHero from "../common/PageHero";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import StatStrip from "../common/StatStrip";
import CTABand from "../common/CTABand";
import Reveal from "../common/Reveal";
import usePageMeta from "../../hooks/usePageMeta";
import { jobs, totalOpenings } from "@shared/jobs.js";
import { MONTHS, monthIndex } from "@shared/roadmap.js";

/** When each role is needed on the roadmap (inclusive month keys). */
const ROLE_WINDOWS = {
  "chief-technology-officer": { from: "2027-01", to: "2027-12", color: "#3b82f6" },
  "devops-engineer": { from: "2026-12", to: "2027-12", color: "#7dd3fc" },
  "vlsi-engineer": { from: "2027-01", to: "2027-12", color: "#22d3ee" },
  "vlsi-prototyping-intern": { from: "2026-12", to: "2027-01", color: "#818cf8" },
};

const process = [
  { step: "Apply", text: "A resume or a profile link is enough. Tell us what you have built, simulated or shipped." },
  { step: "Conversation", text: "A first call about your work and what you want to learn or lead — with someone who does the work." },
  { step: "Technical deep-dive", text: "Walk us through something you made, or work a small design problem with us. No trick questions." },
  { step: "Offer", text: "A clear offer and a clear first-90-days plan tied to the roadmap." },
];

const culture = [
  { title: "Own a block end to end", text: "From specification to sign-off, one name on the block. Reviewers read your work closely, and you read theirs." },
  { title: "Learn the whole flow", text: "Design, verification, physical, tape-out and validation all happen in one small team — so you see how they fit." },
  { title: "Write it down", text: "Design notes, specifications and decisions are written, dated and versioned. It is how we do clean-room work, and how newcomers get up to speed." },
];

function CareersPage() {
  usePageMeta({
    title: "Careers",
    description: `${totalOpenings} openings at Zenitheum: a Chief Technology Officer for analog chip design, a DevOps Engineer, three VLSI Engineers (freshers and juniors) and two VLSI prototyping interns starting 1 December 2026 (₹10,000 per month for two months).`,
    path: "/careers",
  });

  return (
    <PageShell>
      <PageHero
        eyebrow="Careers"
        title="Build silicon"
        accent="with us."
        description="We are staffing a thirteen-month programme that ends with two chips in development, a taped-out test chip and measured silicon. The team that starts it owns what it ships — and the people who have done it before will be in the room."
      >
        <a href="#roles" className="btn-primary">
          See open roles
        </a>
      </PageHero>

      <Section id="stats" bordered={false} className="!py-0" innerClassName="!py-0">
        <StatStrip
          items={[
            { value: totalOpenings, label: "Open positions" },
            { value: jobs.length, label: "Roles" },
            { value: "1 Dec", label: "Interns start", note: "2026" },
            { value: 13, label: "Month programme", note: "Dec 2026 → Dec 2027" },
          ]}
        />
      </Section>

      {/* Roles */}
      <Section id="roles">
        <SectionHeading
          index="01"
          eyebrow="Open roles"
          title="Four roles. Seven seats."
          description="Every role below is hands-on from week one. You will own something real, and it is on the roadmap with a date."
        />
        <ul className="mt-14 space-y-4">
          {jobs.map((job, index) => (
            <Reveal key={job.slug} as="li" delay={index * 80}>
              <article className="panel hud spotlight panel-hover group flex flex-col gap-6 p-7 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent-400">{job.team}</span>
                    <span className="rounded-full bg-accent-600/25 px-2.5 py-1 font-mono text-[11px] text-accent-200">
                      {job.openings} {job.openings === 1 ? "opening" : "openings"}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">{job.title}</h3>
                  <p className="mt-3 max-w-3xl leading-relaxed text-zinc-400">{job.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {[job.type, job.experience, job.location, job.type === "Internship" ? `Starts ${job.start}` : null, job.duration, job.stipend ? `Stipend ${job.stipend}` : null]
                      .filter(Boolean)
                      .map((chip) => (
                        <span key={chip} className="chip uppercase tracking-wider">
                          {chip}
                        </span>
                      ))}
                  </div>
                </div>
                <Link to={`/careers/${job.slug}`} className="btn-primary shrink-0 self-start lg:self-center">
                  Job description
                </Link>
              </article>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* Where each role plugs in */}
      <Section id="fit" grid>
        <SectionHeading
          index="02"
          eyebrow="On the roadmap"
          title="Where each role plugs in."
          description="Every seat is tied to a stretch of the programme. Here is when each role is needed."
        />
        <Reveal delay={100}>
          <div className="panel hud mt-12 overflow-x-auto p-6 sm:p-8">
            <div className="min-w-[46rem]" aria-hidden="true">
              <div className="grid grid-cols-[12rem_repeat(13,minmax(0,1fr))] items-center gap-y-3">
                <div />
                {MONTHS.map((m) => (
                  <div key={m.key} className="pb-2 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-400">
                    {m.short}
                  </div>
                ))}
                {jobs.map((job) => {
                  const window = ROLE_WINDOWS[job.slug];
                  const start = monthIndex(window.from);
                  const span = monthIndex(window.to) - start + 1;
                  return (
                    <div key={job.slug} className="contents">
                      <div className="pr-4 text-sm font-medium text-zinc-200">{job.short.split("·")[0].trim()}</div>
                      <div
                        className="h-8 rounded-lg border px-3 text-xs font-medium leading-8 text-white"
                        style={{
                          gridColumn: `${start + 2} / span ${span}`,
                          background: `linear-gradient(90deg, ${window.color}55, ${window.color}22)`,
                          borderColor: `${window.color}99`,
                        }}
                      >
                        {job.type === "Internship" ? "1 Dec → 31 Jan" : `Needed from ${MONTHS[start].short} ${MONTHS[start].year}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <ul className="sr-only">
              {jobs.map((job) => (
                <li key={job.slug}>
                  {job.title}: needed from {MONTHS[monthIndex(ROLE_WINDOWS[job.slug].from)].label} to {MONTHS[monthIndex(ROLE_WINDOWS[job.slug].to)].label}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Section>

      {/* Process + culture */}
      <Section>
        <SectionHeading index="03" eyebrow="How we hire" title="Four steps, no trick questions." />
        <ol className="mt-12 grid gap-4 md:grid-cols-4">
          {process.map((item, i) => (
            <Reveal key={item.step} as="li" delay={i * 80} className="h-full">
              <div className="panel h-full p-6">
                <span className="font-mono text-xs tracking-[0.2em] text-accent-400">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{item.step}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <div className="mt-24">
          <SectionHeading index="04" eyebrow="Working here" title="What it is like." />
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {culture.map((item, i) => (
              <Reveal key={item.title} as="li" delay={i * 80} className="h-full">
                <div className="panel hud spotlight h-full p-7">
                  <h3 className="font-display text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-zinc-400">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <CTABand
        title="Not seeing your role?"
        description="If you design chips, build the infrastructure that designs them, or want to learn by taping one out, write to us anyway. We would rather hear from someone genuinely interested than someone who ticks boxes."
        primaryLabel="Send us your CV"
        primaryTo="/contactus?topic=careers"
      />
    </PageShell>
  );
}

export default CareersPage;
