// The eye in the abyss: a 5-frame pixel-art sprite (open, left, right, half, closed).
import { motionAllowed } from './depth.js';

const FRAME_W = 192;
const OPEN = 0, LEFT = 1, RIGHT = 2, HALF = 3, SHUT = 4;

export function eyeFramePosition(frame, s) {
  return `${-frame * FRAME_W * s || 0}px 0px`;
}

export function initEye(el) {
  const scale = () => Number(getComputedStyle(el).getPropertyValue('--s')) || 1;
  let frame = OPEN;
  const show = (f) => { frame = f; el.style.backgroundPosition = eyeFramePosition(f, scale()); };
  show(OPEN);
  addEventListener('resize', () => show(frame));
  if (!motionAllowed()) return;

  let visible = false, timer = 0;
  const later = (ms, fn) => { timer = setTimeout(fn, ms); };
  const blink = (then) => {
    const seq = [HALF, SHUT, SHUT, HALF];
    seq.forEach((f, i) => setTimeout(() => show(f), i * 60));
    setTimeout(then, seq.length * 60);
  };
  function idle() {
    if (!visible) return;
    const r = Math.random();
    if (r < 0.45) later(3500 + Math.random() * 4000, () => blink(() => { show(OPEN); idle(); }));
    else later(2500 + Math.random() * 4000, () => {
      show(Math.random() < 0.5 ? LEFT : RIGHT);         // it watches you
      later(1200 + Math.random() * 1400, () => { show(OPEN); idle(); });
    });
  }
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    clearTimeout(timer);
    if (visible) idle(); else show(OPEN);
  }).observe(el);
}
