import { Link } from "react-router-dom";
import { SITE } from "@shared/site.js";
import PageShell from "../layout/PageShell";
import PageHero from "../common/PageHero";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import CTABand from "../common/CTABand";
import Reveal from "../common/Reveal";
import usePageMeta from "../../hooks/usePageMeta";
import { jobs, totalOpenings } from "@shared/jobs.js";

const process = [
  { step: "Apply", text: "A resume or a profile link is enough." },
  { step: "Conversation", text: "A first call about your work, with someone who does the work." },
  { step: "Technical chat", text: "Walk us through something you made. No trick questions." },
  { step: "Offer", text: "A clear offer and a clear first 90 days." },
];

function CareersPage() {
  usePageMeta({
    title: "Careers",
    description: `${totalOpenings} openings at Zenitheum across analog design, secure digital design, verification, applications and infrastructure, plus two internships starting 1 February 2027 (₹10,000 per month for two months, extendable into a full-time role).`,
    path: "/careers",
  });

  return (
    <PageShell>
      <PageHero
        eyebrow="Careers"
        title="Build chips"
        accent="with us."
        description="Join the small team taking two chips from design to delivery. Internships start on 1 February 2027: 2 months at ₹10,000 per month, extendable into a full-time role."
      >
        <a href="#roles" className="btn-primary">
          See open roles
        </a>
      </PageHero>

      {/* Roles */}
      <Section id="roles">
        <SectionHeading
          eyebrow="Open roles"
          title={`${jobs.length} roles. ${totalOpenings} seats.`}
          description="Hands-on from week one: you will own something real."
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

      <Section>
        <SectionHeading eyebrow="How we hire" title="Four steps, no trick questions." />
        <ol className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
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
      </Section>

      <CTABand
        title="Not seeing your role?"
        description={`Write to us at ${SITE.emails.team}. We would rather hear from someone genuinely interested than someone who ticks boxes.`}
        primaryLabel="Email us"
        primaryTo={`mailto:${SITE.emails.team}`}
      />
    </PageShell>
  );
}

export default CareersPage;
