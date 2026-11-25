// The surface: layered pixel-art storm, kept on the art-pixel grid.
import { coverScale, cropOffset, motionAllowed, rainOffset } from './depth.js';

const W = 640, H = 360, FOCAL_X = 0.52, FOCAL_Y = 0.55;
// [delay ms, flash opacity, bolt visible]: two flashes in 420 ms (< 3 per second)
const STRIKE = [[0, .6, 1], [70, .08, 0], [140, .75, 1], [260, .25, 1], [420, 0, 0]];

export function initSurface(root) {
  const stage = root.querySelector('.stage');
  const art = stage.querySelector('.art');
  const q = (name) => art.querySelector(`[data-layer="${name}"]`);
  const rain = q('rain'), swell = q('swell'), boat = q('boat'), flash = q('flash'), bolt = q('lightning'), colossus = q('colossus');
  let s = 1;

  function fit() {
    const vw = stage.clientWidth, vh = stage.clientHeight;
    s = coverScale(vw, vh, W, H);
    art.style.width = `${W * s}px`;
    art.style.height = `${H * s}px`;
    art.style.left = `${cropOffset(vw, W, s, FOCAL_X)}px`;
    art.style.top = `${cropOffset(vh, H, s, FOCAL_Y)}px`;
    rain.style.backgroundSize = `${W * s}px ${H * s}px`;
  }
  new ResizeObserver(fit).observe(stage);
  fit();

  if (!motionAllowed()) {
    root.classList.add('still');   // CSS shows a single, quiet lightning-lit frame
    return;
  }

  let raf = 0, running = false, strikeTimer = 0;
  const t0 = performance.now();

  function tick(now) {
    const t = (now - t0) / 1000;
    const { rx, ry } = rainOffset(t, W, H);   // time-based: same speed at 60, 120 or 144 Hz
    rain.style.backgroundPosition = `${-rx * s}px ${ry * s}px`;
    swell.style.transform = `translateY(${Math.round(Math.sin(t * 0.9) * 2) * s}px)`;
    boat.style.transform = `translateY(${Math.round(Math.sin(t * 1.4 + 1)) * s}px)`;
    raf = requestAnimationFrame(tick);
  }

  function strike() {
    for (const [ms, f, b] of STRIKE) {
      setTimeout(() => {
        flash.style.opacity = f;
        bolt.style.opacity = b;
        colossus.style.filter = f > .2 ? 'brightness(.35)' : '';
      }, ms);
    }
  }
  function scheduleStrike(delay) {
    strikeTimer = setTimeout(() => { if (running) strike(); scheduleStrike(6000 + Math.random() * 6000); }, delay);
  }

  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(tick);
    scheduleStrike(1800);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    clearTimeout(strikeTimer);
  }

  let onScreen = true;
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; onScreen && !document.hidden ? start() : stop(); }).observe(root);
  document.addEventListener('visibilitychange', () => (onScreen && !document.hidden ? start() : stop()));
  start();
}
