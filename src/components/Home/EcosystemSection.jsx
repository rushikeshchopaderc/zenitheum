import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import Reveal from "../common/Reveal";
import EcosystemOrbit from "../fx/EcosystemOrbit";
import { ECOSYSTEM } from "../../data/ecosystem";

function EcosystemSection() {
  return (
    <Section id="ecosystem" grid>
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div>
          <SectionHeading
            index="05"
            eyebrow="Ecosystem"
            title="Where a fabless chip company fits."
            description="A chip only matters when it connects: to the foundries and packaging houses that make it real, to the design programmes that make it affordable to build, and to the customers who put it in a product."
          />
          <dl className="mt-12 space-y-8">
            {ECOSYSTEM.map((ring, i) => (
              <Reveal key={ring.id} delay={i * 100}>
                <div className="border-l border-accent-600/40 pl-6">
                  <dt className="font-display text-lg font-semibold text-white">{ring.title}</dt>
                  <dd className="mt-1.5 text-zinc-400">{ring.blurb}</dd>
                  <dd className="mt-3 flex flex-wrap gap-2">
                    {ring.items.map((item) => (
                      <span key={item.label} className="chip">
                        {item.label}
                      </span>
                    ))}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>

        <Reveal delay={150}>
          <EcosystemOrbit />
        </Reveal>
      </div>
    </Section>
  );
}

export default EcosystemSection;
