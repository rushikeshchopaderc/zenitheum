import { Link } from "react-router-dom";
import PageShell from "../layout/PageShell";
import PageHero from "../common/PageHero";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import CTABand from "../common/CTABand";
import Reveal from "../common/Reveal";
import SubscribeForm from "../forms/SubscribeForm";
import ProductDetail from "./ProductDetail";
import { AnalogDiagram, DigitalDiagram } from "./diagrams";
import usePageMeta from "../../hooks/usePageMeta";
import { CHIPS, CHIP_COMPARE } from "../../data/chips";
import { PARTNER_STEPS } from "../../data/customers";

function ProductsPage() {
  usePageMeta({
    title: "Products",
    description:
      "ZT-SEC1, a digital secure-authentication chip with a 3–4 month soft-IP phase, and ZT-AFE1, a 24-bit analog sensor front-end heading to silicon proof by December 2027. Specifications, architecture and development path.",
    path: "/products",
  });

  return (
    <PageShell>
      <PageHero
        eyebrow="Products"
        title="Two chips,"
        accent="designed with their customers."
        description="ZT-SEC1 is a digital chip that proves a device is genuine; its soft-IP phase takes 3–4 months. ZT-AFE1 is an analog front-end that reads a sensor with 24-bit precision; we are taking it to silicon proof in twelve. Both are in development now — this page shows exactly what we are building."
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/contactus?topic=design-partner" data-cta="products-design-partner" className="btn-primary">
            Become a design partner
          </Link>
          <Link to="/roadmap#milestones" className="btn-ghost">
            See the milestones
          </Link>
        </div>
      </PageHero>

      {/* Side by side */}
      <Section>
        <SectionHeading
          index="01"
          eyebrow="At a glance"
          title="One digital, one analog. Both for Indian industry."
          description="The two chips share a process, a design pipeline and several customers: a smart-meter maker needs ZT-SEC1 to prove each meter is genuine and ZT-AFE1 to measure what it senses."
        />
        <Reveal delay={100}>
          <div className="panel hud mt-12 overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[11rem_1fr_1fr]">
              <div className="hidden border-b border-white/10 bg-white/[0.02] p-5 sm:block" />
              <div className="border-b border-white/10 bg-cyan-400/[0.06] p-5">
                <p className="font-mono text-xs tracking-[0.2em] text-cyan-300">DIGITAL</p>
                <p className="mt-1 font-display text-lg font-semibold text-white">{CHIPS.digital.code} · secure chip</p>
              </div>
              <div className="border-b border-l border-white/10 bg-accent-500/[0.07] p-5">
                <p className="font-mono text-xs tracking-[0.2em] text-accent-300">ANALOG</p>
                <p className="mt-1 font-display text-lg font-semibold text-white">{CHIPS.analog.code} · sensor front-end</p>
              </div>
              {CHIP_COMPARE.map((row) => (
                <div key={row.label} className="contents">
                  <div className="col-span-2 border-b border-white/10 bg-white/[0.02] px-5 pb-1 pt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 last:border-b-0 sm:col-span-1 sm:p-5">
                    {row.label}
                  </div>
                  <div className="border-b border-white/10 px-5 pb-4 text-zinc-300 sm:p-5">{row.digital}</div>
                  <div className="border-b border-l border-white/10 px-5 pb-4 text-zinc-300 sm:p-5">{row.analog}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Section>

      <ProductDetail product={CHIPS.digital} index="02" diagram={<DigitalDiagram />} />
      <ProductDetail product={CHIPS.analog} index="03" diagram={<AnalogDiagram />} />

      {/* Working with us */}
      <Section>
        <SectionHeading
          index="04"
          eyebrow="Working with us"
          title="How a design partnership works."
          description="Nothing is signed or purchased to start. Tell us what you build and we will have a concrete conversation about what each chip would do in your product."
        />
        <ol className="mt-12 grid gap-4 md:grid-cols-5">
          {PARTNER_STEPS.map((item, i) => (
            <Reveal key={item.step} as="li" delay={i * 80} className="h-full">
              <div className="panel hud spotlight h-full p-6">
                <span className="font-mono text-xs tracking-[0.2em] text-accent-400">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">{item.step}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
        <p className="mt-8">
          <Link to="/customers" className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent-300 transition hover:gap-3 hover:text-accent-200">
            Who these chips are for <span aria-hidden="true">&rarr;</span>
          </Link>
        </p>
      </Section>

      {/* Early access */}
      <Section>
        <Reveal>
          <div className="panel hud mx-auto max-w-3xl p-8 text-center sm:p-12">
            <span className="mono-label">Early access</span>
            <h2 className="fluid-h2 mt-4 font-bold">Hear first when evaluation opens.</h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              Join the list for the ZT-SEC1 FPGA kit (March 2027) and the ZT-AFE1 tape-out announcement. Release news only — no noise.
            </p>
            <SubscribeForm source="products-page" className="mx-auto mt-8 max-w-lg text-left" />
          </div>
        </Reveal>
      </Section>

      <CTABand
        title={
          <>
            Shape <span className="whitespace-nowrap">ZT-SEC1</span> and <span className="whitespace-nowrap">ZT-AFE1</span>.
          </>
        }
        description="Specifications freeze in January 2027. Design partners who join before then help decide what the chips do."
        primaryLabel="Become a design partner"
        primaryTo="/contactus?topic=design-partner"
        secondaryLabel="Follow the roadmap"
        secondaryTo="/roadmap"
      />
    </PageShell>
  );
}

export default ProductsPage;
