import { useCallback, useState } from "react";

/**
 * Tooltip state for charts made of separate marks (bars, segments). `show(element, content)` anchors the tip
 * to the element's box; the tip is drawn by <TipLayer> (position: fixed), so it can never be clipped by a card.
 * Hover and keyboard focus use the same path.
 */
export default function useTip() {
  const [tip, setTip] = useState(null);
  const show = useCallback((element, content) => {
    if (!element) return;
    const box = element.getBoundingClientRect();
    setTip({ x: box.left + box.width / 2, top: box.top, bottom: box.bottom, content });
  }, []);
  const hide = useCallback(() => setTip(null), []);
  return { tip, show, hide };
}
