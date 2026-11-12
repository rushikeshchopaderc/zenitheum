import { Link } from "react-router-dom";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import Reveal from "../common/Reveal";
import SignalPipeline from "../fx/SignalPipeline";

function HowWeBuild() {
  return (
    <Section id="flow" grid>
      <SectionHeading
        index="04"
        eyebrow="How we build"
        title="From specification to silicon, on rails."
        description="Every block follows the same written path, and every step is a pipeline job — so any result can be reproduced from a tagged commit. We design the chips; foundry and packaging partners make them."
      />
      <SignalPipeline className="mt-14" />
      <Reveal delay={120}>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-zinc-400">
          <span>Industry-standard commercial EDA, an independent review before every tape-out, and measured silicon before any claim.</span>
          <Link to="/technology" className="inline-flex min-h-[44px] items-center gap-2 font-semibold uppercase tracking-wider text-accent-300 transition hover:gap-3">
            Explore the technology <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </Reveal>
    </Section>
  );
}

export default HowWeBuild;
