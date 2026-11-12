import useInView from "./useInView";

/**
 * Pauses an element's CSS animations while it is off-screen (the `.anim-paused`
 * rule in fx.css). Attach the returned ref to the element and add the returned
 * class name to it — ambient motion then costs nothing when nobody can see it.
 */
export function useAnimationGate() {
  const [ref, inView] = useInView({ rootMargin: "160px 0px" });
  return [ref, inView ? "" : "anim-paused"];
}

export default useAnimationGate;
