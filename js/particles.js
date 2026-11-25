// Marine snow: pale motes drifting up through the deep, with a few pulsing bioluminescent glows.
import { motionAllowed } from './depth.js';

/** Advance one mote by dt seconds (t = elapsed seconds); speeds are px per second. */
export function stepMote(m, dt, t, w, h) {
  m.y -= m.vy * dt;
  m.x += Math.sin(t * 0.4 + m.phase) * 7.2 * dt;
  if (m.y < -4) { m.y = h + 4; m.x = Math.random() * w; }
}

export function initParticles(canvas, opts = {}) {
  if (!motionAllowed()) return { start() {}, pause() {}, stop() {} };
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, raf = 0, running = false;

  function size() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();

  const count = opts.count ?? (w < 600 ? 40 : 80);
  const motes = Array.from({ length: count }, (_, i) => ({
    x: Math.random() * w, y: Math.random() * h,
    r: Math.random() < 0.7 ? 1 : 2,
    vy: 3.6 + Math.random() * 13.2,   // px per second
    phase: Math.random() * Math.PI * 2,
    a: 0.3 + Math.random() * 0.3,
    glow: i % 11 === 0,            // roughly one in eleven is a living light
  }));

  let last = 0;
  function draw(now) {
    ctx.clearRect(0, 0, w, h);
    const t = now / 1000;
    const dt = last ? Math.min(0.1, t - last) : 0;   // clamp after a stall
    last = t;
    for (const m of motes) {
      stepMote(m, dt, t, w, h);
      const px = Math.round(m.x), py = Math.round(m.y);
      if (m.glow) {
        const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.3 + m.phase));
        ctx.fillStyle = `rgba(95, 209, 176, ${0.12 * pulse})`;
        ctx.fillRect(px - 3, py - 3, 7, 7);
        ctx.fillStyle = `rgba(159, 240, 212, ${0.85 * pulse})`;
        ctx.fillRect(px - 1, py - 1, 2, 2);
      } else {
        ctx.fillStyle = `rgba(134, 147, 129, ${m.a})`;
        ctx.fillRect(px, py, m.r, m.r);
      }
    }
    raf = requestAnimationFrame(draw);
  }

  let wanted = opts.autostart !== false;
  function start() { if (!running && !document.hidden) { running = true; last = 0; raf = requestAnimationFrame(draw); } }
  function stop() { running = false; cancelAnimationFrame(raf); }
  const onVis = () => (document.hidden ? stop() : wanted && start());
  document.addEventListener('visibilitychange', onVis);
  addEventListener('resize', size);
  if (wanted) start();

  return {
    start() { wanted = true; start(); },
    pause() { wanted = false; stop(); ctx.clearRect(0, 0, w, h); },
    stop() {
      wanted = false;
      stop();
      document.removeEventListener('visibilitychange', onVis);
      removeEventListener('resize', size);
    },
  };
}
