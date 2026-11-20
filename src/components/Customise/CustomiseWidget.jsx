import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaMicrochip, FaTimes } from "react-icons/fa";
import { CUSTOM_BENEFITS } from "../../data/customers";
import CustomiseForm from "./CustomiseForm";

export const CUSTOMISE_HASH = "#customise";
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled])';

/**
 * Customisation is never tied to a place on the page: a button floats at the corner of every public page, and a customer
 * can open it at any moment. Links such as /?chip=analog#customise open it too (the chip is pre-selected).
 */
export default function CustomiseWidget() {
  const { pathname, search, hash, key } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [defaults, setDefaults] = useState({});
  const [formKey, setFormKey] = useState(0);
  const dialogRef = useRef(null);
  const fabRef = useRef(null);
  const returnTo = useRef(null);

  const show = useCallback((chip) => {
    returnTo.current = document.activeElement;
    setDefaults(chip ? { chip } : {});
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setFormKey((k) => k + 1); // the next visit starts with a fresh form
    if (window.location.hash === CUSTOMISE_HASH) navigate({ pathname, search }, { replace: true });
    // The floating button is not on screen while the panel is open, so fall back to the new one.
    window.setTimeout(() => (returnTo.current?.isConnected ? returnTo.current : fabRef.current)?.focus?.(), 0);
  }, [navigate, pathname, search]);

  // A link to #customise opens the panel.
  useEffect(() => {
    if (hash !== CUSTOMISE_HASH) return;
    const chip = new URLSearchParams(search).get("chip");
    show(["analog", "digital", "both"].includes(chip) ? chip : "");
  }, [hash, search, key, show]);

  // While open: lock page scroll, move focus in, Esc closes, Tab stays inside.
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => dialogRef.current?.querySelector("input")?.focus(), 50);
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "Tab" && dialogRef.current) {
        const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <>
      {!open && (
        <button
          ref={fabRef}
          type="button"
          onClick={() => show("")}
          aria-haspopup="dialog"
          className="fixed bottom-4 right-4 z-30 inline-flex min-h-[48px] items-center gap-2.5 rounded-full border border-accent-400/40 bg-accent-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-950/60 transition duration-200 hover:-translate-y-0.5 hover:bg-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-300 sm:bottom-6 sm:right-6 print:hidden"
        >
          <FaMicrochip aria-hidden="true" size={16} />
          <span>
            Customise <span className="hidden sm:inline">a chip</span>
          </span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && close()}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="customise-title"
            className="panel relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-b-none rounded-t-3xl p-6 sm:max-h-[90dvh] sm:rounded-3xl sm:p-8"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              <FaTimes aria-hidden="true" size={15} />
            </button>

            <p className="mono-label">Custom chips</p>
            <h2 id="customise-title" className="mt-3 pr-12 font-display text-2xl font-bold text-white sm:text-3xl">
              Start with a standard chip. Make it yours.
            </h2>
            <p className="mt-3 text-zinc-400">
              Both chips are standard products with room to tailor them. The earlier you tell us what your product needs, the more of it we can build in.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-zinc-300">
              {CUSTOM_BENEFITS.map((benefit) => (
                <li key={benefit.title} className="flex gap-3">
                  <span aria-hidden="true" className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                  <span>
                    <b className="font-semibold text-white">{benefit.title}.</b> {benefit.text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-white/10 pt-6">
              <CustomiseForm key={formKey} defaults={defaults} onDone={close} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
