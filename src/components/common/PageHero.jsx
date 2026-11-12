import Reveal from "./Reveal";
import TraceBackdrop from "../fx/TraceBackdrop";

/**
 * Hero for every interior page: eyebrow, oversized title, lead copy, optional
 * children (buttons, stat strips) below, over a blueprint grid and live traces.
 */
function PageHero({ eyebrow, title, accent, description, children }) {
  return (
    <header className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="glow pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 -z-10 opacity-50 mask-fade-b" />
      <TraceBackdrop className="-z-10 opacity-80" />
      <div className="shell pb-16 pt-20 text-center sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-32">
        {eyebrow && (
          <Reveal>
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
              {eyebrow}
            </span>
          </Reveal>
        )}
        <Reveal delay={80}>
          <h1 className="fluid-h1 mx-auto mt-7 max-w-5xl font-bold">
            <span className="text-gradient">{title}</span>
            {accent && (
              <>
                {" "}
                <span className="text-gradient-blue">{accent}</span>
              </>
            )}
          </h1>
        </Reveal>
        {description && (
          <Reveal delay={160}>
            <p className="fluid-lead mx-auto mt-7 max-w-3xl text-zinc-400">{description}</p>
          </Reveal>
        )}
        {children && (
          <Reveal delay={240}>
            <div className="mt-10">{children}</div>
          </Reveal>
        )}
      </div>
    </header>
  );
}

export default PageHero;
