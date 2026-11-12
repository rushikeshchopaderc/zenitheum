import { Link } from "react-router-dom";
import PageShell from "../layout/PageShell";
import PageHero from "../common/PageHero";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import CTABand from "../common/CTABand";
import Reveal from "../common/Reveal";
import PortraitPlaceholder from "../fx/PortraitPlaceholder";
import WaferMap from "../fx/WaferMap";
import usePageMeta from "../../hooks/usePageMeta";
import { SITE } from "@shared/site.js";
import { directorPhoto } from "../../lib/leaderPhotos";

import logo from "../../assets/img/Zenitheum_removebg.webp";
import founderPortrait from "../../assets/img/founder-portrait.webp";

const beliefs = [
  {
    title: "India builds the instruments and meters, but imports the chips inside them.",
    text: "Around nine-tenths of the country's semiconductor requirement is imported. For precision sensing and device security, an Indian design — owned here, supported here — gives manufacturers a second source and a supplier they can visit.",
  },
  {
    title: "Fabless lets a small team build real silicon.",
    text: "Foundries fabricate and packaging houses assemble. A focused team that does the design, verification and customer work well can take a chip from specification to silicon proof without owning a fab.",
  },
  {
    title: "Pipelines beat heroics.",
    text: "A chip company is only as credible as its last reproducible result. We automate every check so that quality is a property of the process, not of who was awake.",
  },
];

const values = [
  {
    title: "Silicon before slides",
    text: "We report measured results, not intentions. Where something is a target, we say it is a target — on this website and in every datasheet.",
  },
  {
    title: "Industry-standard tools, rigorous sign-off",
    text: "We design in the commercial EDA flows that foundries and customers recognise, and we do not call anything done until an independent reviewer has tried to break it.",
  },
  {
    title: "Original by design",
    text: "Every block is designed from public specifications and documented as it is made. Clean-room discipline is not a legal afterthought; it is how we work.",
  },
  {
    title: "Pipelines over heroics",
    text: "Anything that depends on one person remembering to run it is a bug in the process. We would rather build the factory than rely on a hero.",
  },
];

function PortraitCard({ person, src, delay = 0 }) {
  return (
    <Reveal delay={delay} className="h-full">
      <figure className="group h-full">
        <div className="panel hud p-3">
          {src ? (
            <div className="relative overflow-hidden rounded-[1.25rem]">
              <img
                src={src}
                alt={`${person.name}, ${person.title} of Zenitheum`}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />
              {/* A blue wash and a bottom scrim keep photographs inside the black-and-blue palette. */}
              <div aria-hidden="true" className="absolute inset-0 bg-accent-700/25 mix-blend-soft-light" />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent" />
              <div aria-hidden="true" className="portrait-scan" />
            </div>
          ) : (
            <PortraitPlaceholder className="rounded-[1.25rem]" label="Photo coming soon" />
          )}
        </div>
        <figcaption className="px-2 pb-1 pt-6">
          <h3 className="font-display text-2xl font-semibold text-white">{person.name}</h3>
          <p className="mt-1.5 font-mono text-xs uppercase tracking-[0.2em] text-accent-300">{person.title}</p>
        </figcaption>
      </figure>
    </Reveal>
  );
}

function AboutUsPage() {
  usePageMeta({
    title: "About",
    description:
      "Zenitheum is a fabless semiconductor startup from Khamgaon, Maharashtra. Meet the founder and director, and the principles behind how we build ZT-SEC1, a digital secure chip, and ZT-AFE1, an analog sensor front-end.",
    path: "/about-us",
  });

  const { founder, director } = SITE.leaders;

  return (
    <PageShell>
      <PageHero
        eyebrow="About Zenitheum"
        title="A fabless startup"
        accent="from Khamgaon."
        description="We design two chips with the customers who will use them: a digital secure-authentication chip and an analog sensor front-end that goes all the way to silicon proof. Small team, narrow scope, reproducible results."
      />

      {/* Why we exist */}
      <Section>
        <div className="grid items-start gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <SectionHeading
            index="01"
            eyebrow="Why we exist"
            title="The chips underneath everything are where the leverage is."
            description="Zenitheum started in applied AI. We are now building a fabless semiconductor company — because silicon is the layer every other layer depends on, and because India's instruments, meters and secure devices deserve chips designed close to home."
          />
          <ul className="space-y-5">
            {beliefs.map((belief, i) => (
              <Reveal key={belief.title} as="li" delay={i * 90}>
                <div className="panel hud spotlight p-6 sm:p-7">
                  <span className="font-mono text-xs tracking-[0.2em] text-accent-400">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-white">{belief.title}</h3>
                  <p className="mt-2.5 leading-relaxed text-zinc-400">{belief.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      {/* Name and mark */}
      <Section grid>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal className="order-2 lg:order-1">
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <WaferMap className="absolute inset-0 opacity-40" />
              <div aria-hidden="true" className="absolute inset-[22%] rounded-full bg-ink-900/85 blur-xl" />
              <img src={logo} alt="The Zenitheum mark: a road of blocks climbing a mountain" width="220" height="220" className="absolute inset-[24%] h-[52%] w-[52%] object-contain drop-shadow-[0_0_30px_rgba(37,99,235,0.55)]" />
            </div>
          </Reveal>
          <div className="order-1 lg:order-2">
            <SectionHeading
              index="02"
              eyebrow="Name & mark"
              title="Zenith: the highest point."
              description="Our mark is a road of blocks climbing a mountain toward its summit. Read it as a roadmap: milestones, laid one at a time, each one carrying the next a little higher."
            />
            <Reveal delay={160}>
              <p className="mt-6 max-w-xl leading-relaxed text-zinc-400">
                It is also a reminder of how we plan. The route to the top is visible from the start — and so are the gates where we stop and check whether to keep climbing.
              </p>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Leadership */}
      <Section id="leadership" glow>
        <SectionHeading
          index="03"
          eyebrow="Leadership"
          title="Two people accountable for everything."
          description="We keep the leadership small on purpose. Technical leadership for the analog chip is the first senior hire we are making."
        />
        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div className="grid gap-6 sm:grid-cols-2">
            <PortraitCard person={founder} src={founderPortrait} />
            <PortraitCard person={director} src={directorPhoto} delay={120} />
          </div>

          <Reveal delay={100}>
            <blockquote className="panel hud p-7 sm:p-9">
            <p className="mono-label">A note from the founder</p>
            <div className="mt-5 space-y-5 text-[1.05rem] leading-relaxed text-zinc-300">
              <p>
                Zenitheum started in applied AI. Now we are turning it into a fabless semiconductor company — because the chips underneath every system are where the next decade&apos;s leverage is, and because India&apos;s instrument, meter and secure-device makers should not have to depend on a single imported part.
              </p>
              <p>
                The plan is deliberately narrow: two chips — one digital, one analog — a 3–4 month soft-IP phase for the first, twelve months to silicon proof for the second, and a pipeline that makes both repeatable. We would rather ship one block that works than announce ten that might. If you build instruments or meters, design chips, or want to learn by taping one out — I would like to hear from you.
              </p>
            </div>
            <footer className="mt-8 flex flex-wrap items-center justify-between gap-5">
              <p className="text-white">
                {founder.name}
                <br />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent-300">{founder.title}</span>
              </p>
              <a href={founder.linkedin} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                Follow on LinkedIn
              </a>
            </footer>
            </blockquote>
          </Reveal>
        </div>
      </Section>

      {/* Values */}
      <Section>
        <SectionHeading
          index="04"
          eyebrow="Principles"
          title="What we are willing to lose a deal over."
          align="center"
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {values.map((value, i) => (
            <Reveal key={value.title} delay={i * 90} className="h-full">
              <article className="panel hud spotlight panel-hover flex h-full flex-col p-8">
                <span className="font-mono text-xs tracking-[0.2em] text-accent-400">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-5 font-display text-xl font-semibold text-white">{value.title}</h3>
                <p className="mt-3 leading-relaxed text-zinc-400">{value.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120}>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link to="/careers" className="btn-primary">
              Join the team
            </Link>
            <Link to="/roadmap#milestones" className="btn-ghost">
              See our milestones
            </Link>
          </div>
        </Reveal>
      </Section>

      <CTABand
        title="Let's build something that tapes out."
        description="Whether you want to become a design partner, work with us on a programme, or join the team, a short conversation is usually enough to find out if there is a fit."
        primaryLabel="Get in touch"
        primaryTo="/contactus"
      />
    </PageShell>
  );
}

export default AboutUsPage;
