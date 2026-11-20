import { useEffect, useState } from "react";

const TITLE_SUFFIX = "Zenitheum admin";

/** Sets document.title for the screen and puts the previous title back when the screen goes away. */
export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · ${TITLE_SUFFIX}` : TITLE_SUFFIX;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

/** Adds <meta name="robots" content="noindex,nofollow"> while the console is mounted. */
export function useRobotsMeta() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    meta.setAttribute("data-zt-admin", "");
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
}

/** Live result of a CSS media query. */
export function useMediaQuery(query) {
  const read = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(read);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    onChange();
    // Safari < 14 only has the deprecated addListener.
    if (list.addEventListener) list.addEventListener("change", onChange);
    else list.addListener(onChange);
    return () => {
      if (list.removeEventListener) list.removeEventListener("change", onChange);
      else list.removeListener(onChange);
    };
  }, [query]);
  return matches;
}
