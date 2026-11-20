import { useEffect } from "react";

const BASE = "https://www.zenitheum.com";
const DEFAULT_TITLE = "Zenitheum — Fabless Semiconductor Company";

/** Per-route <title>, description and canonical URL (the app has no SSR). */
export function usePageMeta({ title, description, path }) {
  useEffect(() => {
    document.title = title ? `${title} — Zenitheum` : DEFAULT_TITLE;

    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    }

    const canonicalPath = path ?? window.location.pathname;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${BASE}${canonicalPath === "/" ? "/" : canonicalPath}`);
  }, [title, description, path]);
}

export default usePageMeta;
