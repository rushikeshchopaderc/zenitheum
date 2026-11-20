import { Link } from "react-router-dom";
import { SITE } from "@shared/site.js";
import { totalOpenings } from "@shared/jobs.js";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import Reveal from "../common/Reveal";
import PortraitPlaceholder from "../fx/PortraitPlaceholder";
import founderPortrait from "../../assets/img/founder-portrait.webp";
import { directorPhoto } from "../../lib/leaderPhotos";

const DELIVERY = [
  "Standard chips as soft or hard IP",
  "Customisation to your request",
  "Integration support from specification to delivery",
];

function Person({ person, src, role, delay }) {
  return (
    <Reveal delay={delay} className="h-full">
      <figure className="panel hud flex h-full flex-col gap-5 p-5 sm:flex-row sm:p-6">
        <div className="w-full shrink-0 sm:w-40">
          {src ? (
            <img src={src} alt={`${person.name}, ${person.title}`} loading="lazy" decoding="async" className="aspect-[4/5] w-full rounded-2xl border border-white/10 object-cover" />
          ) : (
            <PortraitPlaceholder className="rounded-2xl" label="Photo coming soon" />
          )}
        </div>
        <figcaption>
          <h3 className="font-display text-xl font-semibold text-white">{person.name}</h3>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-accent-300">{person.title}</p>
          <p className="mt-3 leading-relaxed text-zinc-400">{role}</p>
          {person.linkedin && (
            <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-[44px] items-center text-sm font-semibold text-accent-300 underline underline-offset-4">
              LinkedIn
            </a>
          )}
        </figcaption>
      </figure>
    </Reveal>
  );
}

/** Who delivers: what we do, the two leaders, and a link to the open roles. */
export default function About() {
  const { founder, director } = SITE.leaders;
  return (
    <Section id="about" glow>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="About us"
            title="End-to-end chip delivery, tailored to you."
            description="Zenitheum is a fabless chip company. We take a chip from specification to delivery, as soft or hard IP, and build in the customisation you ask for."
          />
          <Reveal delay={120}>
            <ul className="mt-6 space-y-3">
              {DELIVERY.map((item) => (
                <li key={item} className="flex gap-3 text-zinc-300">
                  <span aria-hidden="true" className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="grid gap-5">
          <Person person={founder} src={founderPortrait} role="Graduate of IIT Kharagpur. Leads Zenitheum's product and customers." delay={0} />
          <Person
            person={director}
            src={directorPhoto}
            role="Deep expertise in cloud infrastructure and security. Expert in the system integrations that make chip design and licensing technically feasible and secure."
            delay={100}
          />
        </div>
      </div>

      <Reveal delay={80}>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
          <div>
            <p className="font-display text-xl font-semibold text-white">We are hiring: {totalOpenings} positions</p>
            <p className="mt-1 text-zinc-400">Internship from 1 February 2027: ₹10,000 per month for 2 months, with a path to a full-time role.</p>
          </div>
          <Link to="/careers" className="btn-ghost">
            View openings
          </Link>
        </div>
      </Reveal>
    </Section>
  );
}
