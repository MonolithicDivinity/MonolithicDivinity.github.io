// Builds the page's content sections from js/content.js data.

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  node.append(...children.flat().filter((c) => c !== null && c !== undefined && c !== false));
  return node;
}

const external = (href, ...children) => el('a', { href, target: '_blank', rel: 'noopener noreferrer' }, ...children);
const isPlaceholder = (v) => !v || /^TODO:/i.test(v.trim());
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function renderBio(profile) {
  const frag = document.createDocumentFragment();
  for (const para of profile.bio) frag.append(el('p', {}, para));
  return frag;
}

export function renderShowcase(items) {
  const frag = document.createDocumentFragment();
  items.forEach((item, i) => {
    frag.append(el('article', { class: 'exhibit', id: `exhibit-${item.id}` },
      el('div', { class: 'exhibit-media' },
        el('video', { controls: true, playsinline: true, preload: 'none', poster: item.poster, src: item.video,
          'aria-label': `${item.title}, ${item.duration} video` })),
      el('div', { class: 'exhibit-card' },
        el('div', { class: 'meta' },
          el('span', {}, `Exhibit ${LETTERS[i] || i + 1} · Recovered footage`), el('span', {}, item.duration)),
        el('h3', { class: 'ink' }, item.title),
        el('h4', {}, "What you're seeing"),
        el('p', {}, item.seeing),
        item.built?.length && el('h4', {}, 'What I built'),
        item.built?.length && el('ul', {}, item.built.map((b) => el('li', {}, b))),
        item.credit && el('p', { class: 'credit' }, 'Not mine: ', external(item.credit.url, item.credit.text)))));
  });
  return frag;
}

export function renderHistory(items) {
  return el('ol', { class: 'log' }, items.map((h) =>
    el('li', {},
      el('div', { class: 'log-date' }, `${h.start} – ${h.end}`),
      el('div', { class: 'log-main' },
        el('h3', {}, h.org),
        el('div', { class: 'log-role' }, h.role),
        el('p', {}, h.description)),
      el('div', { class: 'log-link' },
        h.link?.url && external(h.link.url, h.link.label || 'Link', ' ↗'),
        h.warning && el('span', { class: 'warning' }, h.warning)))));
}

export function renderSkills(list) {
  return el('ul', { class: 'skills' }, list.map((s) => el('li', {}, s)));
}

export function renderContact(contact) {
  const items = [];
  if (!isPlaceholder(contact.email)) {
    items.push(el('li', {}, el('span', { class: 'k' }, 'Email'), el('a', { href: `mailto:${contact.email}` }, contact.email)));
  }
  if (!isPlaceholder(contact.discord)) {
    items.push(el('li', {}, el('span', { class: 'k' }, 'Discord'), el('span', { class: 'v' }, contact.discord)));
  }
  if (!items.length) items.push(el('li', { class: 'pending' }, 'Reach me through any of the channels below.'));
  return el('ul', { class: 'contact' }, items);
}

export function renderLinks(links) {
  return el('ul', { class: 'links' }, links.map((l) => el('li', {}, external(l.url, l.label))));
}
