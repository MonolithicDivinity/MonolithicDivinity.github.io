// Mid-water life: kelp swaying from the seabed and a school of fish wheeling about,
// drawn on a 640x360 canvas that sits on top of the still mid-water art.
import { motionAllowed } from './depth.js';

const W = 640, H = 360, FISH = 26, FPS = 20;

/** Sideways shift (whole art px) for a kelp pixel at (x, y) after t seconds. Zero at the seabed. */
export function kelpOffset(x, y, t) {
  const lift = ((H - 1 - y) / (H - 1)) ** 1.3;
  return Math.round(Math.sin(t * 0.9 + x * 0.035 + y * 0.045) * 4 * lift) || 0;
}

/** Where every fish is after t seconds: whole art px, facing the way the school is heading. */
export function fishPositions(t) {
  const cx = 530 + Math.sin(t * 0.12) * 55;
  const cy = 105 + Math.sin(t * 0.19 + 1) * 30;
  const dir = Math.cos(t * 0.12) >= 0 ? 1 : -1;
  const fish = [];
  for (let i = 0; i < FISH; i++) {
    const a = i * 2.399 + t * 0.05;                  // golden-angle spread, slowly turning
    const r = Math.sqrt((i + 0.5) / FISH);
    const x = cx + Math.cos(a) * r * 30 + Math.sin(t * 1.3 + i) * 1.5;
    const y = cy + Math.sin(a) * r * 12 + Math.cos(t * 1.1 + i * 0.7) * 1.2;
    fish.push({ x: Math.round(x), y: Math.round(y), dir });
  }
  return fish;
}

// one fish, facing right; dx is mirrored when the school turns
const FISH_PX = [[-2, -1, '#233e40'], [-2, 1, '#233e40'], [-1, 0, '#2f4f4f'], [0, 0, '#44685f'], [1, 0, '#2f4f4f'], [0, 1, '#1a3135']];

export function initMidwater(el) {
  const canvas = el.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  let kelp = [];   // [x, y, r, g, b, a] for every kelp pixel

  const ready = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const off = document.createElement('canvas'); off.width = W; off.height = H;
      const octx = off.getContext('2d');
      octx.drawImage(img, 0, 0);
      const d = octx.getImageData(0, 0, W, H).data;
      for (let i = 0; i < d.length; i += 4) if (d[i + 3]) kelp.push([(i / 4) % W, Math.floor(i / 4 / W), d[i], d[i + 1], d[i + 2], d[i + 3]]);
      resolve();
    };
    img.onerror = resolve;    // no kelp is better than no page
    img.src = el.dataset.kelp;
  });

  function draw(t) {
    const out = ctx.createImageData(W, H), px = out.data;
    for (const [x, y, r, g, b, a] of kelp) {
      const nx = x + kelpOffset(x, y, t);
      if (nx < 0 || nx >= W) continue;
      const j = (y * W + nx) * 4;
      px[j] = r; px[j + 1] = g; px[j + 2] = b; px[j + 3] = a;
    }
    ctx.putImageData(out, 0, 0);
    for (const f of fishPositions(t)) {
      for (const [dx, dy, c] of FISH_PX) { ctx.fillStyle = c; ctx.fillRect(f.x + dx * f.dir, f.y + dy, 1, 1); }
    }
  }

  ready.then(() => {
    draw(0);
    if (!motionAllowed()) return;      // one still frame, nothing moves
    let raf = 0, running = false, last = 0, onScreen = false;
    const t0 = performance.now();
    const tick = (now) => {
      if (now - last >= 1000 / FPS) { last = now; draw((now - t0) / 1000); }
      raf = requestAnimationFrame(tick);
    };
    const update = () => {
      const want = onScreen && !document.hidden;
      if (want && !running) { running = true; raf = requestAnimationFrame(tick); }
      else if (!want && running) { running = false; cancelAnimationFrame(raf); }
    };
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; update(); }).observe(el);
    document.addEventListener('visibilitychange', update);
  });

  return { ready };
}
