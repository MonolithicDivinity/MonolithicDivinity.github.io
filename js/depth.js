// Pure math for the pixel-art stage and the depth gauge.

/** Smallest whole-number scale at which artW×artH covers the viewport. */
export function coverScale(viewW, viewH, artW = 640, artH = 360) {
  return Math.max(1, Math.ceil(Math.max(viewW / artW, viewH / artH)));
}

/**
 * Offset (CSS px) of the art's leading edge so that `focal` (0–1 across the art)
 * sits at the centre of the view, clamped so the art always covers it,
 * and snapped to the art-pixel grid (a multiple of s).
 */
export function cropOffset(view, art, s, focal) {
  const size = art * s;
  const min = view - size;
  if (min >= 0) return 0;
  let off = view / 2 - focal * size;
  off = Math.min(0, Math.max(min, off));
  off = Math.round(off / s) * s;
  if (off < min) off += s;  // rounding must not uncover the far edge
  return off === 0 ? 0 : off; // no -0
}

/** Fathoms at scroll position y, interpolated between zone tops; Infinity past the last. */
export function fathomsAt(y, tops, depths) {
  if (y <= tops[0]) return depths[0];
  for (let i = 0; i < tops.length - 1; i++) {
    if (y < tops[i + 1]) {
      const t = (y - tops[i]) / (tops[i + 1] - tops[i]);
      return depths[i] + t * (depths[i + 1] - depths[i]);
    }
  }
  return y > tops[tops.length - 1] ? Infinity : depths[depths.length - 1];
}

export function depthLabel(f) {
  return Number.isFinite(f) ? `${Math.round(f)} FTM` : '∞';
}

/** Rain offset in art px after t seconds: falls 360 px/s, drifts 120 px/s left; wraps with the tile. */
export function rainOffset(t, artW = 640, artH = 360) {
  return { rx: Math.floor(t * 120) % artW, ry: Math.floor(t * 360) % artH };
}

export function motionAllowed(mql = matchMedia('(prefers-reduced-motion: reduce)')) {
  return !mql.matches;
}
