/**
 * The standard page band: full-bleed hairline border with a centred shell, plus
 * optional blueprint grid and corner glow behind the content.
 *
 * It clips with `overflow-clip`, not `overflow-hidden`: clip looks identical but does
 * not create a scroll container, so `position: sticky` children (the roadmap's month
 * ruler) keep working inside a Section. `overflow-hidden` is listed first as the fallback
 * for browsers without `overflow: clip` (Safari before 16): the later rule wins where supported.
 */
function Section({ children, id, className = "", innerClassName = "", bordered = true, grid = false, glow = false }) {
  return (
    <section
      id={id}
      className={`relative isolate overflow-hidden overflow-clip ${bordered ? "border-t border-white/10" : ""} ${className}`}
    >
      {grid && (
        <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 -z-10 opacity-40 mask-fade-b" />
      )}
      {glow && <div aria-hidden="true" className="glow pointer-events-none absolute inset-0 -z-10" />}
      <div className={`shell py-20 sm:py-24 lg:py-28 ${innerClassName}`}>{children}</div>
    </section>
  );
}

export default Section;
