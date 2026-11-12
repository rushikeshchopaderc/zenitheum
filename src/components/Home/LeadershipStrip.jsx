import { Link } from "react-router-dom";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import Reveal from "../common/Reveal";
import { SITE } from "@shared/site.js";
import founderPortrait from "../../assets/img/founder-portrait.webp";
import { directorPhoto } from "../../lib/leaderPhotos";

function Avatar({ src, name }) {
  return src ? (
    <img src={src} alt={name} loading="lazy" decoding="async" className="h-20 w-20 rounded-2xl border border-white/10 object-cover" />
  ) : (
    <span
      aria-hidden="true"
      className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-accent-500/50 bg-accent-600/10 font-display text-2xl font-bold text-accent-300"
    >
      {name
        .split(" ")
        .map((part) => part[0])
        .join("")}
    </span>
  );
}

function LeadershipStrip() {
  const { founder, director } = SITE.leaders;
  return (
    <Section id="leadership">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <SectionHeading index="07" eyebrow="Leadership" title="Small, deliberate, accountable." />
        <Reveal delay={120}>
          <Link to="/about-us" className="btn-ghost">
            About Zenitheum
          </Link>
        </Reveal>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {[
          { person: founder, src: founderPortrait },
          { person: director, src: directorPhoto },
        ].map(({ person, src }, i) => (
          <Reveal key={person.name} delay={i * 100}>
            <div className="panel hud flex items-center gap-6 p-6 sm:p-7">
              <Avatar src={src} name={person.name} />
              <div>
                <h3 className="font-display text-xl font-semibold text-white">{person.name}</h3>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-accent-300">{person.title}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export default LeadershipStrip;
