import { useEffect, useLayoutEffect, useState } from "react";

/** `value`, but only after it has stopped changing for `delay` ms (debounced search boxes). */
export function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

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

/** Current width of an element in px (ResizeObserver), for charts that draw to their container. */
export function useElementWidth(ref, fallback = 640) {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const measure = () => setWidth(Math.round(element.getBoundingClientRect().width));
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width || fallback;
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
