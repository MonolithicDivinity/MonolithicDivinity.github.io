// Pixel-art backdrops behind the deeper zones: whole-number scale, placed at their anchor section.
import { cropOffset } from './depth.js';

const ART_W = 640, ART_H = 360;

export function initBackdrops(container, items) {
  function fit() {
    const w = container.clientWidth;
    const s = Math.max(1, Math.ceil(w / ART_W));
    const top0 = container.getBoundingClientRect().top;
    for (const { el, anchor, focal = 0.5 } of items) {
      el.style.width = `${ART_W * s}px`;
      el.style.height = `${ART_H * s}px`;
      el.style.left = `${cropOffset(w, ART_W, s, focal)}px`;
      el.style.top = `${Math.round(anchor.getBoundingClientRect().top - top0)}px`;
    }
  }
  fit();
  new ResizeObserver(fit).observe(container);
}
