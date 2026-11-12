import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import Reveal from "../common/Reveal";

/** The long-form section for one chip: diagram, spec table, blocks, what partners receive and the path. */
function ProductDetail({ product, index, diagram }) {
  return (
    <Section id={product.id} glow={product.id === "digital"} grid={product.id === "analog"}>
      <SectionHeading index={index} eyebrow={`${product.code} · ${product.kind}`} title={product.name} description={product.tagline} />

      <Reveal delay={120}>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="chip" style={{ borderColor: `${product.color}55` }}>
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: product.color }} />
            {product.phase}
          </span>
          <span className="chip">{product.window}</span>
          <span className="chip !text-cyan-200">{product.status}</span>
        </div>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-zinc-400">{product.summary}</p>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <Reveal className="h-full">
          <figure className="panel hud flex h-full flex-col p-6 sm:p-8">
            <figcaption className="mono-label mb-5 flex items-center justify-between gap-4">
              <span>Architecture · target</span>
              <span className="text-zinc-500">{product.code}</span>
            </figcaption>
            <div className="my-auto">{diagram}</div>
          </figure>
        </Reveal>

        <Reveal delay={100} className="h-full">
          <div className="panel h-full p-6 sm:p-8">
            <h3 className="mono-label">Specification · design targets</h3>
            <dl className="mt-5 divide-y divide-white/10">
              {product.specs.map(([label, value]) => (
                <div key={label} className="grid gap-1 py-3.5 sm:grid-cols-[8.5rem_1fr] sm:gap-5">
                  <dt className="text-sm font-medium text-zinc-300">{label}</dt>
                  <dd className="text-sm leading-relaxed text-zinc-400">{value}</dd>
                </div>
              ))}
            </dl>
            {product.specNote && <p className="mt-5 border-t border-white/10 pt-5 text-xs leading-relaxed text-zinc-500">{product.specNote}</p>}
          </div>
        </Reveal>
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {product.blocks.map((block, i) => (
          <Reveal key={block.name} as="li" delay={i * 80} className="h-full">
            <div className="panel spotlight h-full p-6">
              <span className="font-mono text-xs tracking-[0.2em]" style={{ color: product.color }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h4 className="mt-4 font-display text-lg font-semibold text-white">{block.name}</h4>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{block.text}</p>
            </div>
          </Reveal>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal className="h-full">
          <div className="panel h-full p-6 sm:p-8">
            <h3 className="mono-label">What design partners receive</h3>
            <ul className="mt-5 space-y-3">
              {product.deliverables.map((item) => (
                <li key={item} className="flex gap-3 text-zinc-300">
                  <span aria-hidden="true" className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: product.color }} />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={100} className="h-full">
          <div className="panel h-full p-6 sm:p-8">
            <h3 className="mono-label">Development path</h3>
            <ol className="relative mt-6 space-y-6 border-l border-white/15 pl-7">
              {product.milestones.map((m) => (
                <li key={m.when} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[2.1rem] top-1 h-3 w-3 rounded-full border bg-ink-900"
                    style={{ borderColor: product.color, boxShadow: `0 0 10px ${product.color}88` }}
                  />
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: product.color }}>
                    {m.when}
                  </p>
                  <p className="mt-1 text-zinc-300">{m.what}</p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

export default ProductDetail;
