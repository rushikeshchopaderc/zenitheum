import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scroll handling for a one-page site: a link to /#products scrolls to that section (even on the same page), any other
 * navigation opens at the top. Waits briefly for lazily loaded content when the target is not on screen yet.
 */
function ScrollToTop() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return undefined;
    }
    let tries = 0;
    let timer = 0;
    const go = () => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      else if (tries++ < 30) timer = window.setTimeout(go, 100);
    };
    go();
    return () => window.clearTimeout(timer);
  }, [pathname, hash, key]);

  return null;
}

export default ScrollToTop;
