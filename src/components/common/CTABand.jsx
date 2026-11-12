import { Link } from "react-router-dom";
import Reveal from "./Reveal";
import WaferMap from "../fx/WaferMap";

/**
 * Closing call-to-action at the foot of every page, over a slowly "growing" wafer map.
 */
function CTABand({
  title = "Building instruments or meters? Let's talk.",
  description = "Become a design partner for ZT-AFE1 or ZT-SEC1, follow our milestones, or help us build the chips. Tell us what you are working on and we will come back with a concrete next step.",
  primaryLabel = "Become a design partner",
  primaryTo = "/contactus?topic=design-partner",
  secondaryLabel,
  secondaryTo,
}) {
  return (
    <section className="relative isolate overflow-hidden border-t border-white/10">
      <div aria-hidden="true" className="glow pointer-events-none absolute inset-0 -z-10 rotate-180" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/2 -z-10 hidden w-[34rem] -translate-y-1/2 opacity-60 lg:block xl:right-0">
        <Reveal>
          <WaferMap />
        </Reveal>
      </div>
      <div className="shell py-24 sm:py-28 lg:py-32">
        <div className="max-w-3xl">
          <Reveal>
            <span className="mono-label flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-accent-600" />
              Next step
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="fluid-h1 mt-6 font-bold">
              <span className="text-gradient">{title}</span>
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="fluid-lead mt-7 max-w-2xl text-zinc-400">{description}</p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to={primaryTo} className="btn-primary">
                {primaryLabel}
              </Link>
              {secondaryLabel && secondaryTo && (
                <Link to={secondaryTo} className="btn-ghost">
                  {secondaryLabel}
                </Link>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default CTABand;
