import { useEffect, useRef } from "react";

/**
 * Two pointer effects in one listener:
 *  1. a faint blue glow that trails the cursor (fine pointers only);
 *  2. --mx / --my on any .spotlight card, so its highlight follows the pointer.
 */
function CursorGlow() {
  const ref = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let x = -600;
    let y = -600;
    let tx = x;
    let ty = y;

    const tick = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      if (ref.current) ref.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      frame = Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5 ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (event) => {
      tx = event.clientX;
      ty = event.clientY;
      const card = event.target instanceof Element ? event.target.closest(".spotlight") : null;
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }
      if (!frame && fine && !reduce) frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="cursor-glow" />;
}

export default CursorGlow;
