import { Link } from "react-router-dom";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import Reveal from "../common/Reveal";
import { jobs, totalOpenings } from "@shared/jobs.js";

function HiringStrip() {
  return (
    <Section id="join" glow>
      <div className="flex flex-wrap items-end justify-between gap-8">
        <SectionHeading
          index="06"
          eyebrow="Join the build"
          title={`${totalOpenings} seats. ${jobs.length} roles. Day one is 1 December.`}
          description="The team that starts the programme owns what it ships. Early engineers here get real blocks, real tape-outs and the people who have done it before."
        />
        <Reveal delay={160}>
          <Link to="/careers" className="btn-ghost">
            All open roles
          </Link>
        </Reveal>
      </div>

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {jobs.map((job, i) => (
          <Reveal key={job.slug} as="li" delay={i * 90} className="h-full">
            <Link to={`/careers/${job.slug}`} className="panel hud spotlight panel-hover group flex h-full flex-col p-6">
              <div className="flex items-center justify-between gap-2">
                <span className="chip">{job.type}</span>
                <span className="rounded-full bg-accent-600/25 px-2.5 py-1 font-mono text-[11px] text-accent-200">
                  {job.openings} {job.openings === 1 ? "opening" : "openings"}
                </span>
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold leading-snug text-white">{job.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{job.experience}</p>
              {job.start && job.type === "Internship" && (
                <p className="mt-3 font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-cyan-300">
                  Starts {job.start}
                  {job.stipend && <span className="block text-zinc-400">{job.stipend} · {job.duration?.split(" (")[0]}</span>}
                </p>
              )}
              <span className="mt-auto pt-6 text-sm font-semibold uppercase tracking-wider text-accent-300 transition group-hover:text-accent-200">
                View role <span aria-hidden="true">&rarr;</span>
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

export default HiringStrip;
