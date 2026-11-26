import content from './content.js';
import { renderBio, renderShowcase, renderHistory, renderSkills, renderContact, renderLinks } from './render.js';
import { initSurface } from './surface.js';
import { initGauge } from './gauge.js';
import { initParticles } from './particles.js';
import { initEye } from './eye.js';
import { initBackdrops } from './backdrops.js';
import { initMidwater } from './midwater.js';

const $ = (sel) => document.querySelector(sel);

// Motion first, so a mistake in content.js can never freeze the storm.
initSurface($('#surface'));

// Each section renders on its own: one bad entry empties only its own section.
function fill(sel, build) {
  const target = $(sel);
  if (!target) return;
  try { target.replaceChildren(build()); }
  catch (err) { console.error(`Could not render ${sel}; check js/content.js`, err); }
}

// Profile text: the HTML carries the same text as a no-JS fallback; content.js wins.
for (const node of document.querySelectorAll('[data-field]')) {
  const value = node.dataset.field.split('.').reduce((o, k) => o?.[k], content);
  if (typeof value === 'string') node.textContent = value;
}

fill('#bio', () => renderBio(content.profile));
fill('#showcase-list', () => renderShowcase(content.showcase));
fill('#history-list', () => renderHistory(content.history));
fill('#skills-list', () => renderSkills(content.skills));
fill('#contact', () => renderContact(content.contact));
fill('#links', () => renderLinks(content.links));

// Backdrops and the gauge measure the sections, so they start once the sections have content.
const depths = $('.depths');
initBackdrops(depths, [...depths.querySelectorAll('.backdrop')].map((el) => ({
  el, anchor: document.getElementById(el.dataset.anchor), focal: Number(el.dataset.focal) || 0.5 })));
const mid = $('.backdrop.midwater');
if (mid) initMidwater(mid);
const eye = $('.eye-px');
if (eye) initEye(eye);
initGauge($('#gauge'), [...document.querySelectorAll('main section[data-fathoms]')]);

// Marine snow fades in as the surface falls away, and only runs while it can be seen.
const snow = $('#snow');
const particles = initParticles(snow, { autostart: false });
const surface = $('#surface');
let snowOn = false, queued = false;
function fadeSnow() {
  queued = false;
  const hgt = surface.offsetHeight || innerHeight;
  const o = Math.min(1, Math.max(0, (scrollY - hgt * 0.5) / (hgt * 0.6)));
  snow.style.opacity = o.toFixed(3);
  if (o > 0 && !snowOn) { snowOn = true; particles.start(); }
  else if (o === 0 && snowOn) { snowOn = false; particles.pause(); }
}
addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(fadeSnow); } }, { passive: true });
fadeSnow();
