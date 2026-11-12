/**
 * A reserved frame for a portrait that has not been supplied yet: a head-and-
 * shoulders silhouette drawn as circuit traces, with a scan line. Swapped for
 * the real photo automatically once the image file exists (see AboutUsPage).
 */
function PortraitPlaceholder({ label = "Photo coming soon", className = "" }) {
  return (
    <div className={`portrait-ph relative overflow-hidden ${className}`} role="img" aria-label={label}>
      <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="ph-fade" cx="50%" cy="38%" r="70%">
            <stop offset="0" stopColor="rgba(37,99,235,.28)" />
            <stop offset="1" stopColor="rgba(37,99,235,0)" />
          </radialGradient>
        </defs>
        <rect width="400" height="500" fill="url(#ph-fade)" />
        {/* shoulders */}
        <path
          d="M40 500 V430 Q40 372 110 352 L160 338 Q200 358 240 338 L290 352 Q360 372 360 430 V500"
          fill="rgba(59,130,246,.07)"
          stroke="rgba(96,165,250,.55)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* head */}
        <circle cx="200" cy="205" r="82" fill="rgba(59,130,246,.07)" stroke="rgba(96,165,250,.6)" strokeWidth="1.5" />
        {/* neck */}
        <path d="M170 283 V338 M230 283 V338" stroke="rgba(96,165,250,.45)" strokeWidth="1.5" />
        {/* trace "hair" and accents */}
        <path d="M130 160 H168 L186 142 H236 L254 160 H272" fill="none" stroke="rgba(34,211,238,.55)" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M150 196 H190 M210 196 H250" stroke="rgba(147,197,253,.4)" strokeWidth="1.3" />
        <path d="M168 240 Q200 258 232 240" fill="none" stroke="rgba(147,197,253,.4)" strokeWidth="1.3" />
        {[
          [130, 160],
          [272, 160],
          [60, 430],
          [340, 430],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="5" fill="#09090b" stroke="rgba(147,197,253,.8)" strokeWidth="1.3" />
            <circle cx={x} cy={y} r="1.5" fill="rgba(147,197,253,.95)" />
          </g>
        ))}
        {/* registration marks */}
        {[
          [18, 18, 1, 1],
          [382, 18, -1, 1],
          [18, 482, 1, -1],
          [382, 482, -1, -1],
        ].map(([x, y, sx, sy]) => (
          <path key={`${x}-${y}`} d={`M${x} ${y + 18 * sy}V${y}H${x + 18 * sx}`} fill="none" stroke="rgba(147,197,253,.7)" strokeWidth="1.3" />
        ))}
      </svg>
      <div className="portrait-scan" />
      <span className="absolute inset-x-0 bottom-5 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-accent-300/80">
        {label}
      </span>
    </div>
  );
}

export default PortraitPlaceholder;
