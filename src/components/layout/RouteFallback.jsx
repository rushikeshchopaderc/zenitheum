/** Shown for a beat while a page chunk loads: a pulsing die, no layout shift. */
function RouteFallback() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center" role="status" aria-label="Loading">
      <span className="relative flex h-10 w-10">
        <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-md border border-accent-400" />
        <span className="relative m-2 inline-flex h-6 w-6 rounded-sm border border-accent-400/70 bg-accent-600/20" />
      </span>
    </div>
  );
}

export default RouteFallback;
