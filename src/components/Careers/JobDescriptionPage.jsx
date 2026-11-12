import { Link, useParams } from "react-router-dom";
import PageShell from "../layout/PageShell";
import PageHero from "../common/PageHero";
import Section from "../common/Section";
import CTABand from "../common/CTABand";
import Reveal from "../common/Reveal";
import ApplicationForm from "../forms/ApplicationForm";
import usePageMeta from "../../hooks/usePageMeta";
import { SITE } from "@shared/site.js";
import { findJob } from "@shared/jobs.js";

function DetailList({ title, items, chips = false }) {
  return (
    <Reveal>
      <section className="panel hud p-7 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
        {chips ? (
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {items.map((item) => (
              <li key={item} className="chip font-mono !text-[12px]">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <ul className="mt-5 space-y-3">
            {items.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                <span className="leading-relaxed text-zinc-300">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Reveal>
  );
}

function JobDescriptionPage() {
  const { slug } = useParams();
  const job = findJob(slug);

  usePageMeta({
    title: job ? `${job.title} — Careers` : "Role not found",
    description: job ? job.summary : "That opening is no longer listed.",
    path: `/careers/${slug ?? ""}`,
  });

  if (!job) {
    return (
      <PageShell>
        <PageHero eyebrow="Careers" title="Role not" accent="found" description="That opening is no longer listed. Have a look at the roles we are hiring for now.">
          <Link to="/careers" className="btn-primary">
            View open roles
          </Link>
        </PageHero>
      </PageShell>
    );
  }

  const facts = [
    ["Type", job.type],
    ["Openings", String(job.openings)],
    ["Experience", job.experience],
    ["Location", job.location],
    ["Start", job.start],
    job.duration ? ["Duration", job.duration] : null,
    job.stipend ? ["Stipend", job.stipend] : null,
    ["Reports to", job.reportsTo],
  ].filter(Boolean);

  return (
    <PageShell>
      <PageHero eyebrow={`${job.team} · ${job.type}`} title={job.title} description={job.summary}>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {[`${job.openings} ${job.openings === 1 ? "opening" : "openings"}`, job.type, job.location, job.type === "Internship" ? `Starts ${job.start}` : job.level, job.stipend ? `${job.stipend} · 2 months` : null].filter(Boolean).map((chip) => (
            <span key={chip} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
              {chip}
            </span>
          ))}
        </div>
        <div className="mt-8">
          <a href="#apply" className="btn-primary">
            Apply now
          </a>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-14">
          <div className="space-y-6">
            {/* Phones get a compact grid; the tall sticky card is for desktop (see the aside below). */}
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:hidden">
              {facts.map(([label, value], i) => (
                <div key={label} className={`bg-ink-900 p-4 ${facts.length % 2 === 1 && i === facts.length - 1 ? "col-span-2" : ""}`}>
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-zinc-500">{label}</dt>
                  <dd className="mt-1 text-sm text-zinc-200">{value}</dd>
                </div>
              ))}
            </dl>

            <Reveal>
              <section className="panel hud p-7 sm:p-8">
                <h2 className="font-display text-xl font-semibold text-white">Position overview</h2>
                <div className="mt-5 space-y-4">
                  {job.overview.map((paragraph) => (
                    <p key={paragraph} className="leading-relaxed text-zinc-300">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            </Reveal>

            {job.tracks && (
              <Reveal>
                <section className="panel hud p-7 sm:p-8">
                  <h2 className="font-display text-xl font-semibold text-white">Three openings, three tracks</h2>
                  <ul className="mt-5 grid gap-4 md:grid-cols-3">
                    {job.tracks.map((track, i) => (
                      <li key={track.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                        <span className="font-mono text-xs tracking-[0.2em] text-accent-400">{String(i + 1).padStart(2, "0")}</span>
                        <h3 className="mt-3 font-display text-base font-semibold leading-snug text-white">{track.name}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{track.blurb}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}

            <DetailList title="Key responsibilities" items={job.responsibilities} />
            <DetailList title="What you bring" items={job.requirements} />
            <DetailList title="Nice to have" items={job.niceToHave} />
            <DetailList title="Tools you will use" items={job.tools} chips />

            <Reveal>
              <section className="panel hud p-7 sm:p-8">
                <h2 className="font-display text-xl font-semibold text-white">Where you plug into the roadmap</h2>
                <ol className="relative mt-6 space-y-6 border-l border-white/15 pl-7">
                  {job.roadmap.map((item) => (
                    <li key={item.when} className="relative">
                      <span
                        aria-hidden="true"
                        className="absolute -left-[2.1rem] top-1 h-3 w-3 rounded-full border border-cyan-300 bg-ink-900"
                        style={{ boxShadow: "0 0 10px rgba(103,232,249,.5)" }}
                      />
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan-300">{item.when}</p>
                      <p className="mt-1 leading-relaxed text-zinc-300">{item.what}</p>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 text-sm text-zinc-500">
                  See the full programme on the{" "}
                  <Link to="/roadmap" className="text-accent-300 underline underline-offset-4 hover:text-accent-200">
                    roadmap
                  </Link>
                  .
                </p>
              </section>
            </Reveal>

            <DetailList title="What we offer" items={job.offers} />

            <div id="apply" className="scroll-mt-28 pt-4">
              <Reveal>
                <ApplicationForm job={job} />
              </Reveal>
              <Reveal delay={80}>
                <p className="mt-6 px-1 text-sm leading-relaxed text-zinc-500">
                  Prefer email? Send your resume and a short note to{" "}
                  <a href={`mailto:${SITE.emails.careers}`} className="text-accent-300 underline underline-offset-4 hover:text-accent-200">
                    {SITE.emails.careers}
                  </a>
                  . Applications are reviewed on a rolling basis
                  {job.type === "Internship" ? " — the cohort starts on 1 December 2026, so apply early." : "."} Even if you do not meet every requirement, get in touch: we believe in learning as we go.
                </p>
              </Reveal>
            </div>
          </div>

          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start" aria-label="Role at a glance">
            <Reveal>
              <div className="panel hud p-6">
                <h2 className="mono-label">At a glance</h2>
                <dl className="mt-5 divide-y divide-white/10">
                  {facts.map(([label, value]) => (
                    <div key={label} className="py-3">
                      <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-zinc-500">{label}</dt>
                      <dd className="mt-1 text-sm text-zinc-200">{value}</dd>
                    </div>
                  ))}
                </dl>
                <a href="#apply" className="btn-primary mt-4 w-full">
                  Apply now
                </a>
                <Link to="/careers" className="mt-2 flex min-h-[44px] items-center justify-center text-sm text-zinc-400 transition hover:text-white">
                  &larr; All open roles
                </Link>
              </div>
            </Reveal>
          </aside>
        </div>
      </Section>

      <CTABand
        title={`Apply for ${job.title}`}
        description="Tell us what you have built, what you are curious about, and why this role. That tells us far more than a list of keywords."
        primaryLabel="Apply now"
        primaryTo={`/careers/${job.slug}#apply`}
        secondaryLabel="All open roles"
        secondaryTo="/careers"
      />
    </PageShell>
  );
}

export default JobDescriptionPage;
