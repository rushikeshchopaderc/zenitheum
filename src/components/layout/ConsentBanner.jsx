import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getConsent, onConsentChange, setConsent, trackingBlockedByBrowser } from "../../lib/analytics";

export const OPEN_EVENT = "zt:open-consent";

/**
 * Asks once whether first-party analytics may run. It never blocks the page, never uses a third party,
 * and is not shown at all when the browser sends Do-Not-Track / Global Privacy Control (that is a refusal).
 * The footer's "Analytics settings" button opens it again.
 */
function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(() => getConsent());
  const acceptRef = useRef(null);
  const blocked = trackingBlockedByBrowser();

  useEffect(() => {
    if (current !== "unknown") return undefined;
    const timer = window.setTimeout(() => setOpen(true), 1500); // let the page land first
    return () => window.clearTimeout(timer);
  }, [current]);

  useEffect(() => {
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    const stop = onConsentChange((value) => setCurrent(value));
    return () => {
      window.removeEventListener(OPEN_EVENT, reopen);
      stop();
    };
  }, []);

  useEffect(() => {
    if (open) acceptRef.current?.focus({ preventScroll: true });
  }, [open]);

  if (!open) return null;

  const choose = (granted) => {
    setConsent(granted);
    setOpen(false);
  };

  return (
    <section
      role="region"
      aria-label="Analytics preferences"
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:max-w-sm sm:px-0 sm:pb-0"
      onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
    >
      <div className="panel hud border-white/15 bg-ink-800/95 p-4 shadow-2xl shadow-black/60 backdrop-blur-md sm:p-5">
        <p className="font-display text-base font-semibold text-white">Allow privacy-friendly analytics?</p>
        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-zinc-400 sm:text-sm">
          Our own analytics show which pages help. No ads, no third-party trackers, no IP address stored — and nothing is recorded unless you say yes.{" "}
          <Link to="/privacy#analytics" className="text-accent-300 underline underline-offset-4">
            Details
          </Link>
          .
        </p>
        {blocked ? (
          <p className="mt-3 text-sm text-zinc-300">Your browser is sending Do Not Track, so analytics stay off.</p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-3 sm:mt-4">
          <button ref={acceptRef} type="button" onClick={() => choose(true)} disabled={blocked} className="btn-primary min-h-[44px] !px-5 !py-2.5 !text-xs disabled:opacity-40">
            Allow analytics
          </button>
          <button type="button" onClick={() => choose(false)} className="btn-ghost min-h-[44px] !px-5 !py-2.5 !text-xs">
            No thanks
          </button>
        </div>
      </div>
    </section>
  );
}

export default ConsentBanner;
