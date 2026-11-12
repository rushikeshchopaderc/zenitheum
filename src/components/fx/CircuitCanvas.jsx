import { useEffect, useRef } from "react";
import { createNetwork, pointAt, sliceAlong } from "./circuitNetwork";

const TRACE = "rgba(59,130,246,0.46)";
const TRACE_GLOW = "rgba(59,130,246,0.085)";
const NODE = "rgba(147,197,253,0.9)";
const LABEL = "rgba(147,197,253,0.78)";

/** A soft round sprite, drawn once and stamped for every glowing head. */
function makeGlow(size, rgb) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(0.25, `rgba(${rgb},0.55)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

/**
 * Decorative canvas: a circuit-trace network that grows out of `anchorRef`
 * (the chip), then carries data pulses. Two stacked canvases keep it cheap —
 * the base layer is only ever drawn onto; the live layer is cleared per frame.
 *
 * Honours prefers-reduced-motion (renders the finished network statically) and
 * pauses when off-screen or when the tab is hidden.
 */
function CircuitCanvas({ anchorRef, className = "" }) {
  const wrapRef = useRef(null);
  const baseRef = useRef(null);
  const liveRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const base = baseRef.current;
    const live = liveRef.current;
    if (!wrap || !base || !live) return undefined;

    const bctx = base.getContext("2d");
    const lctx = live.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const headGlow = makeGlow(48, "186,230,253");
    const pulseGlow = makeGlow(40, "103,232,249");

    let net = null;
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let onScreen = true;
    let resizeTimer = 0;

    const drawSegment = ({ x1, y1, x2, y2 }) => {
      bctx.lineCap = "round";
      bctx.strokeStyle = TRACE_GLOW;
      bctx.lineWidth = 4.5;
      bctx.beginPath();
      bctx.moveTo(x1, y1);
      bctx.lineTo(x2, y2);
      bctx.stroke();
      bctx.strokeStyle = TRACE;
      bctx.lineWidth = 1.15;
      bctx.beginPath();
      bctx.moveTo(x1, y1);
      bctx.lineTo(x2, y2);
      bctx.stroke();
    };

    const drawNode = (node) => {
      bctx.strokeStyle = NODE;
      bctx.fillStyle = "rgba(9,9,11,1)";
      bctx.lineWidth = 1.2;
      if (node.kind === "pad") {
        bctx.fillRect(node.x - 3.5, node.y - 3.5, 7, 7);
        bctx.strokeRect(node.x - 3.5, node.y - 3.5, 7, 7);
      } else if (node.kind === "via") {
        bctx.beginPath();
        bctx.arc(node.x, node.y, 3.6, 0, Math.PI * 2);
        bctx.fill();
        bctx.stroke();
        bctx.fillStyle = NODE;
        bctx.beginPath();
        bctx.arc(node.x, node.y, 1.1, 0, Math.PI * 2);
        bctx.fill();
      } else {
        bctx.fillStyle = NODE;
        bctx.beginPath();
        bctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        bctx.fill();
      }
    };

    const drawLabel = (label) => {
      const lead = 16 * label.side;
      bctx.strokeStyle = "rgba(96,165,250,0.55)";
      bctx.lineWidth = 1;
      bctx.beginPath();
      bctx.moveTo(label.x, label.y);
      bctx.lineTo(label.x + lead, label.y - 12);
      bctx.lineTo(label.x + lead + 8 * label.side, label.y - 12);
      bctx.stroke();
      bctx.font = '500 10px "JetBrains Mono Variable", ui-monospace, monospace';
      bctx.fillStyle = LABEL;
      bctx.textAlign = label.side > 0 ? "left" : "right";
      bctx.textBaseline = "middle";
      bctx.fillText(label.text, label.x + lead + 12 * label.side, label.y - 12);
    };

    const setup = () => {
      const rect = wrap.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(3.2e6 / (width * height)));
      for (const canvas of [base, live]) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.clearRect(0, 0, width, height);

      const narrow = width < 820;
      let origin = { x: narrow ? width * 0.5 : width * 0.72, y: height * (narrow ? 0.72 : 0.5) };
      let startRadius = narrow ? 92 : 148;
      const anchor = anchorRef?.current;
      if (anchor) {
        const a = anchor.getBoundingClientRect();
        origin = { x: a.left - rect.left + a.width / 2, y: a.top - rect.top + a.height / 2 };
        startRadius = Math.max(a.width, a.height) * (narrow ? 0.4 : 0.38);
      }

      net = createNetwork({
        width,
        height,
        origin,
        startRadius,
        narrow,
        allowLabel: narrow ? () => false : (x) => x > width * 0.46,
      });

      if (reduce) {
        net.growAll(drawSegment);
        net.nodes.forEach(drawNode);
        net.labels.forEach(drawLabel);
      }
    };

    let drawnNodes = 0;
    let drawnLabels = 0;

    const render = (now) => {
      frame = requestAnimationFrame(render);
      if (!onScreen || document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;

      net.grow(dt, drawSegment);
      // Stamp nodes and labels onto the base layer as growth reaches them.
      while (drawnNodes < net.nodes.length) drawNode(net.nodes[drawnNodes++]);
      while (drawnLabels < net.labels.length) drawLabel(net.labels[drawnLabels++]);
      net.tick(dt);

      lctx.clearRect(0, 0, width, height);
      lctx.globalCompositeOperation = "lighter";

      // Growth heads
      for (const w of net.walkers) {
        if (!w.alive) continue;
        lctx.drawImage(headGlow, w.cx * net.CELL - 14, w.cy * net.CELL - 14, 28, 28);
      }

      // Data pulses
      for (const pulse of net.pulses) {
        const headD = Math.max(0, Math.min(pulse.total, pulse.d));
        const tailD = pulse.dir === 1 ? Math.max(0, headD - pulse.tail) : Math.min(pulse.total, headD + pulse.tail);
        const [d0, d1] = tailD < headD ? [tailD, headD] : [headD, tailD];
        if (d1 - d0 < 1) continue;
        const line = sliceAlong(pulse.pts, pulse.cum, d0, d1);
        const [hx, hy] = pointAt(pulse.pts, pulse.cum, headD);
        const [tx, ty] = pointAt(pulse.pts, pulse.cum, tailD);
        const grad = lctx.createLinearGradient(tx, ty, hx, hy);
        grad.addColorStop(0, "rgba(34,211,238,0)");
        grad.addColorStop(1, "rgba(165,243,252,0.95)");
        lctx.strokeStyle = grad;
        lctx.lineWidth = 1.8;
        lctx.lineCap = "round";
        lctx.lineJoin = "round";
        lctx.beginPath();
        line.forEach(([x, y], i) => (i === 0 ? lctx.moveTo(x, y) : lctx.lineTo(x, y)));
        // The slice runs low → high distance; the gradient already points tail → head.
        lctx.stroke();
        lctx.drawImage(pulseGlow, hx - 9, hy - 9, 18, 18);
      }

      // Node flashes when a pulse arrives
      for (const node of net.nodes) {
        if (node.flash <= 0.02) continue;
        lctx.strokeStyle = `rgba(165,243,252,${node.flash * 0.9})`;
        lctx.lineWidth = 1.2;
        lctx.beginPath();
        lctx.arc(node.x, node.y, 4 + (1 - node.flash) * 14, 0, Math.PI * 2);
        lctx.stroke();
      }
      lctx.globalCompositeOperation = "source-over";
    };

    const start = () => {
      cancelAnimationFrame(frame);
      drawnNodes = 0;
      drawnLabels = 0;
      setup();
      if (reduce) return;
      last = performance.now();
      frame = requestAnimationFrame(render);
    };

    start();

    // Rebuild on width changes only (mobile URL-bar height changes must not restart growth).
    let lastWidth = width;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const w = Math.round(wrap.getBoundingClientRect().width);
        if (w !== lastWidth) {
          lastWidth = w;
          start();
        }
      }, 220);
    };
    window.addEventListener("resize", onResize);

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    io.observe(wrap);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      io.disconnect();
    };
  }, [anchorRef]);

  return (
    <div ref={wrapRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      <canvas ref={baseRef} className="absolute inset-0 h-full w-full" />
      <canvas ref={liveRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

export default CircuitCanvas;
