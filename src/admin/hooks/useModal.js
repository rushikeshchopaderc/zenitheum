import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/** Focusable, rendered descendants of `root`, in DOM order. */
export function focusableIn(root) {
  return [...root.querySelectorAll(FOCUSABLE)].filter(
    (element) => !element.closest("[hidden]") && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden",
  );
}

// ---- Scroll lock (reference counted, restores exactly what it changed) ------------------------------

let locks = 0;
let saved = null;

function lockScroll() {
  if (locks === 0) {
    const html = document.documentElement;
    const body = document.body;
    const scrollbar = window.innerWidth - html.clientWidth;
    saved = { overflow: html.style.overflow, paddingRight: body.style.paddingRight };
    html.style.overflow = "hidden";
    // Keep the page from jumping sideways when a classic scrollbar disappears.
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
  }
  locks += 1;
  return () => {
    locks -= 1;
    if (locks === 0 && saved) {
      document.documentElement.style.overflow = saved.overflow;
      document.body.style.paddingRight = saved.paddingRight;
      saved = null;
    }
  };
}

const layers = [];

/**
 * Everything a modal layer (drawer, dialog, slide-over menu) needs:
 *  - Escape calls `onClose`
 *  - Tab / Shift+Tab stay inside the panel
 *  - the page behind is locked from scrolling and made inert (marked with data-adm-inert)
 *  - focus moves in (to [data-autofocus] or the first control) and is restored on close
 *
 * @param {{active?: boolean, panelRef: {current: HTMLElement|null}, onClose?: () => void, returnFocus?: () => (HTMLElement|null)}} options
 */
export default function useModal({ active = true, panelRef, onClose, returnFocus }) {
  const closeRef = useRef(onClose);
  const returnRef = useRef(returnFocus);
  useEffect(() => {
    closeRef.current = onClose;
    returnRef.current = returnFocus;
  });

  useEffect(() => {
    const panel = panelRef.current;
    if (!active || !panel) return undefined;

    const token = Symbol("layer");
    layers.push(token);
    const opener = document.activeElement;
    const unlock = lockScroll();
    const inerted = [...document.querySelectorAll("[data-adm-inert]")].map((element) => {
      const before = { element, inert: element.inert, aria: element.getAttribute("aria-hidden") };
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
      return before;
    });

    (panel.querySelector("[data-autofocus]") || focusableIn(panel)[0] || panel).focus({ preventScroll: true });

    const onKeyDown = (event) => {
      if (layers[layers.length - 1] !== token) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusableIn(panel);
      if (items.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (!panel.contains(current)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && (current === first || current === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      const index = layers.indexOf(token);
      if (index >= 0) layers.splice(index, 1);
      for (const { element, inert, aria } of inerted) {
        element.inert = inert;
        if (aria === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", aria);
      }
      unlock();
      const target = (typeof returnRef.current === "function" ? returnRef.current() : null) || opener;
      if (target && document.contains(target) && typeof target.focus === "function") target.focus({ preventScroll: true });
    };
  }, [active, panelRef]);
}
