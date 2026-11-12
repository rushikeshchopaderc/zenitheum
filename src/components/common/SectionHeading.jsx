import Reveal from "./Reveal";

/**
 * Section opener: a mono index + rule + eyebrow, the headline, and a lead.
 * `index` is the "01" style marker that gives pages a datasheet rhythm.
 */
function SectionHeading({ index, eyebrow, title, description, align = "left", className = "" }) {
  const centered = align === "center";

  return (
    <div className={`${centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className}`}>
      {eyebrow && (
        <Reveal>
          <span className={`mono-label flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
            {index && <span className="text-zinc-500">{index}</span>}
            <span aria-hidden="true" className="h-px w-8 bg-accent-600" />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={80}>
        <h2 className="fluid-h2 mt-5 font-bold">{title}</h2>
      </Reveal>
      {description && (
        <Reveal delay={140}>
          <p className="fluid-lead mt-5 text-zinc-400">{description}</p>
        </Reveal>
      )}
    </div>
  );
}

export default SectionHeading;
