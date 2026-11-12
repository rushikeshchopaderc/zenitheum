/**
 * A growing PCB-style trace network — the hero's "ecosystem growth" animation.
 *
 * Pure simulation, no DOM: walkers start at a seed (the chip) and extend a
 * trace one grid cell at a time, turning in 45° steps, branching, keeping one
 * empty cell between traces (like a design rule) and ending at vias / pads.
 * The canvas component draws what this produces.
 */

// Eight compass headings on a square grid; index 0 = east, clockwise.
const DIRS = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];
const ORTH = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export const LABELS = [
  "RTL",
  "GDSII",
  "PDK",
  "MPW",
  "OSAT",
  "EDA",
  "SoC",
  "IoT",
  "DRC",
  "LVS",
  "SPICE",
  "PLL",
  "ADC",
  "LDO",
  "FPGA",
  "TAPE-OUT",
];

export function mulberry32(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cumulative length table for a polyline. */
export function cumulative(pts) {
  const cum = [0];
  for (let i = 1; i < pts.length; i += 1) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  return cum;
}

/** Point at distance d along a polyline. */
export function pointAt(pts, cum, d) {
  const total = cum[cum.length - 1];
  if (d <= 0) return pts[0];
  if (d >= total) return pts[pts.length - 1];
  let i = 1;
  while (cum[i] < d) i += 1;
  const t = (d - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
  return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
}

/** The part of a polyline between distances d0 <= d1, as a list of points. */
export function sliceAlong(pts, cum, d0, d1) {
  const out = [pointAt(pts, cum, d0)];
  for (let i = 1; i < pts.length - 1; i += 1) {
    if (cum[i] > d0 && cum[i] < d1) out.push(pts[i]);
  }
  out.push(pointAt(pts, cum, d1));
  return out;
}

export function createNetwork({
  width,
  height,
  origin,
  startRadius = 140,
  narrow = false,
  allowLabel = () => true,
  seed = Date.now(),
}) {
  const CELL = narrow ? 18 : 14;
  const cols = Math.ceil(width / CELL) + 2;
  const rows = Math.ceil(height / CELL) + 2;
  const occ = new Int16Array(cols * rows);
  const rand = mulberry32(seed);

  const cell = (cx, cy) => cy * cols + cx;
  const inBounds = (cx, cy) => cx >= 1 && cy >= 1 && cx < cols - 1 && cy < rows - 1;
  const px = (cx, cy) => [cx * CELL, cy * CELL];

  const MAX_CELLS = Math.floor(cols * rows * (narrow ? 0.14 : 0.17));
  const MAX_WALKERS = narrow ? 80 : 160;
  const MAX_LABELS = narrow ? 0 : 11;
  const MAX_PULSES = narrow ? 12 : 26;

  const walkers = [];
  const nodes = [];
  const labels = [];
  const pulses = [];
  let nextId = 1;
  let usedCells = 0;
  let pulseTimer = 0;
  let labelPool = [...LABELS];

  function spawn(cx, cy, dir, parent, maxSteps) {
    if (!inBounds(cx, cy) || occ[cell(cx, cy)] !== 0) return null;
    const walker = {
      id: nextId,
      parent: parent ? parent.id : 0,
      cx,
      cy,
      dir,
      since: 0,
      steps: 0,
      max: maxSteps ?? 36 + Math.floor(rand() * 120),
      alive: true,
      pts: [px(cx, cy)],
      acc: 0,
      speed: 13 + rand() * 11,
      node: null,
    };
    nextId += 1;
    occ[cell(cx, cy)] = walker.id;
    usedCells += 1;
    walkers.push(walker);
    return walker;
  }

  // Seeds: a bus of three parallel traces on each orthogonal side, one on each diagonal.
  const ocx = Math.round(origin.x / CELL);
  const ocy = Math.round(origin.y / CELL);
  const r0 = Math.max(4, Math.round(startRadius / CELL));
  DIRS.forEach(([dx, dy], dir) => {
    if (dx === 0 || dy === 0) {
      const [nx, ny] = [-dy, dx];
      [-3, 0, 3].forEach((off) => spawn(ocx + dx * r0 + nx * off, ocy + dy * r0 + ny * off, dir, null));
    } else {
      spawn(ocx + dx * (r0 - 1), ocy + dy * (r0 - 1), dir, null);
    }
  });

  function isFree(walker, tx, ty, dx, dy) {
    if (!inBounds(tx, ty) || occ[cell(tx, ty)] !== 0) return false;
    // Keep an empty cell between this trace and any other.
    for (const [ax, ay] of ORTH) {
      const nx = tx + ax;
      const ny = ty + ay;
      if (nx === walker.cx && ny === walker.cy) continue;
      const owner = occ[cell(nx, ny)];
      if (owner !== 0 && owner !== walker.id && owner !== walker.parent) return false;
    }
    // Do not slice through another trace's diagonal.
    if (dx !== 0 && dy !== 0 && occ[cell(walker.cx + dx, walker.cy)] !== 0 && occ[cell(walker.cx, walker.cy + dy)] !== 0) {
      return false;
    }
    return true;
  }

  function finish(walker) {
    walker.alive = false;
    walker.pts.push(px(walker.cx, walker.cy));
    const [x, y] = px(walker.cx, walker.cy);
    const node = { x, y, kind: rand() < 0.55 ? "via" : "pad", flash: 0, label: null };
    nodes.push(node);
    walker.node = node;

    if (labels.length < MAX_LABELS && walker.steps > 24 && rand() < 0.3 && allowLabel(x, y)) {
      const clear = labels.every((l) => Math.hypot(l.x - x, l.y - y) > 120);
      if (clear && labelPool.length) {
        const i = Math.floor(rand() * labelPool.length);
        const text = labelPool.splice(i, 1)[0];
        const label = { x, y, text, side: x > width * 0.8 ? -1 : 1 };
        labels.push(label);
        node.label = label;
      }
    }
    return node;
  }

  /** Advance one cell. Returns a segment to draw, or null if the walker ended. */
  function stepWalker(walker, emit) {
    const roll = rand();
    let heading = walker.dir;
    if (walker.since >= 3 && roll < 0.17) heading = (walker.dir + (rand() < 0.5 ? 1 : 7)) & 7;

    const options = [heading, (heading + 1) & 7, (heading + 7) & 7, walker.dir, (walker.dir + 1) & 7, (walker.dir + 7) & 7];
    for (const d of options) {
      const [dx, dy] = DIRS[d];
      const tx = walker.cx + dx;
      const ty = walker.cy + dy;
      if (!isFree(walker, tx, ty, dx, dy)) continue;

      if (d !== walker.dir) {
        walker.pts.push(px(walker.cx, walker.cy));
        walker.since = 0;
        walker.dir = d;
      } else {
        walker.since += 1;
      }
      const from = px(walker.cx, walker.cy);
      walker.cx = tx;
      walker.cy = ty;
      occ[cell(tx, ty)] = walker.id;
      usedCells += 1;
      walker.steps += 1;
      emit({ x1: from[0], y1: from[1], x2: tx * CELL, y2: ty * CELL });

      if (
        walker.steps > 5 &&
        usedCells < MAX_CELLS &&
        walkers.length < MAX_WALKERS &&
        rand() < 0.042
      ) {
        const turn = rand() < 0.5 ? 1 : 7;
        const child = spawn(tx, ty, (walker.dir + turn) & 7, walker, 18 + Math.floor(rand() * 70));
        if (child) nodes.push({ x: tx * CELL, y: ty * CELL, kind: "junction", flash: 0, label: null });
      }
      if (walker.steps >= walker.max || usedCells >= MAX_CELLS) finish(walker);
      return true;
    }
    finish(walker);
    return false;
  }

  function spawnPulse() {
    const pool = walkers.filter((w) => w.steps > 6);
    if (!pool.length) return;
    const walker = pool[Math.floor(rand() * pool.length)];
    const pts = [...walker.pts, px(walker.cx, walker.cy)];
    const cum = cumulative(pts);
    const total = cum[cum.length - 1];
    if (total < 70) return;
    const reverse = rand() < 0.28;
    pulses.push({
      pts,
      cum,
      total,
      d: reverse ? total : 0,
      dir: reverse ? -1 : 1,
      speed: 150 + rand() * 170,
      tail: 46 + rand() * 70,
      walker,
    });
  }

  return {
    CELL,
    walkers,
    nodes,
    labels,
    pulses,

    /** Grow every live walker. `emit` is called with each new segment. */
    grow(dt, emit) {
      let alive = 0;
      for (const walker of walkers.slice()) {
        if (!walker.alive) continue;
        walker.acc += walker.speed * dt;
        let guard = 0;
        while (walker.acc >= 1 && walker.alive && guard < 4) {
          walker.acc -= 1;
          guard += 1;
          stepWalker(walker, emit);
        }
        if (walker.alive) alive += 1;
      }
      return alive;
    },

    /** Run growth to completion at once (reduced-motion / static render). */
    growAll(emit) {
      let guard = 0;
      while (walkers.some((w) => w.alive) && guard < 6000) {
        guard += 1;
        for (const walker of walkers.slice()) if (walker.alive) stepWalker(walker, emit);
      }
    },

    isGrown: () => walkers.length > 0 && walkers.every((w) => !w.alive),

    /** Move pulses; spawn new ones. Returns the list of pulses that reached a node this frame. */
    tick(dt) {
      pulseTimer -= dt;
      if (pulseTimer <= 0 && pulses.length < MAX_PULSES) {
        spawnPulse();
        pulseTimer = 0.1 + rand() * 0.22;
      }
      const arrived = [];
      for (let i = pulses.length - 1; i >= 0; i -= 1) {
        const pulse = pulses[i];
        pulse.d += pulse.dir * pulse.speed * dt;
        const done = pulse.dir === 1 ? pulse.d - pulse.tail > pulse.total : pulse.d + pulse.tail < 0;
        if (done) {
          if (pulse.dir === 1 && pulse.walker.node) arrived.push(pulse.walker.node);
          pulses.splice(i, 1);
        }
      }
      for (const node of nodes) node.flash = Math.max(0, node.flash - dt * 1.6);
      for (const node of arrived) node.flash = 1;
      return arrived;
    },
  };
}
