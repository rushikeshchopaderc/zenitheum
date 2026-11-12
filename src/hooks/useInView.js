import { useEffect, useRef, useState } from "react";

/**
 * Continuous visibility (unlike useReveal, which is one-shot). Lets heavy
 * animations pause while off-screen.
 */
export function useInView({ rootMargin = "100px 0px", threshold = 0 } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin,
      threshold,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return [ref, inView];
}

export default useInView;
