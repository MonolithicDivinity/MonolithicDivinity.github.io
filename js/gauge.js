// The depth gauge: a brass rail of zone marks with a live fathom readout.
import { fathomsAt, depthLabel } from './depth.js';

const zoneDepth = (s) => (s.dataset.fathoms === 'inf' ? Infinity : Number(s.dataset.fathoms));

export function initGauge(nav, sections) {
  const n = sections.length;
  nav.classList.add('gauge');
  nav.innerHTML = `
    <button class="gauge-toggle" type="button" aria-expanded="false" aria-controls="${nav.id || 'gauge'}-marks">
      <span class="gauge-readout">0 FTM</span><span class="gauge-toggle-hint" aria-hidden="true">▾</span>
    </button>
    <div class="gauge-rail" aria-hidden="true"><div class="gauge-pointer"><span class="gauge-readout">0 FTM</span></div></div>
    <ol class="gauge-marks" id="${nav.id || 'gauge'}-marks"></ol>`;
  const list = nav.querySelector('.gauge-marks');
  const readouts = nav.querySelectorAll('.gauge-readout');
  const pointer = nav.querySelector('.gauge-pointer');
  const toggle = nav.querySelector('.gauge-toggle');

  const links = sections.map((s, i) => {
    const li = document.createElement('li');
    li.style.setProperty('--at', n > 1 ? i / (n - 1) : 0);
    const a = document.createElement('a');
    a.href = `#${s.id}`;
    a.innerHTML = `<span class="gauge-depth">${depthLabel(zoneDepth(s))}</span> <span class="gauge-name"></span>`;
    a.querySelector('.gauge-name').textContent = s.dataset.gaugeLabel || s.id;
    a.addEventListener('click', () => setOpen(false));
    li.append(a);
    list.append(li);
    return a;
  });

  function setOpen(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));

  let tops = [], depths = [];
  function measure() {
    tops = sections.map((s) => s.getBoundingClientRect().top + scrollY);
    // the abyss is "∞": interpolate toward it as if it were 100 fathoms deeper, then jump to ∞ inside it
    depths = sections.map((s, i) => (Number.isFinite(zoneDepth(s)) ? zoneDepth(s) : (i ? zoneDepth(sections[i - 1]) + 100 : 0)));
  }

  let current = -1;
  function update() {
    const y = scrollY + innerHeight * 0.4;
    let i = 0;
    while (i < n - 1 && y >= tops[i + 1]) i++;
    const isLast = i === n - 1 && !Number.isFinite(zoneDepth(sections[i]));
    const f = isLast ? Infinity : fathomsAt(y, tops, depths);
    const label = depthLabel(f);
    readouts.forEach((r) => { r.textContent = label; });
    const span = i < n - 1 ? tops[i + 1] - tops[i] : 1;
    const frac = i < n - 1 ? Math.min(1, Math.max(0, (y - tops[i]) / span)) : 0;
    pointer.style.setProperty('--at', n > 1 ? (i + frac) / (n - 1) : 0);
    if (i !== current) {
      links.forEach((a, k) => (k === i ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
      current = i;
    }
  }

  let queued = false;
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; update(); }); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { measure(); update(); });
  addEventListener('load', () => { measure(); update(); });
  measure();
  update();
}
