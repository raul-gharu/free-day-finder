/**
 * View renderers — turn the in-memory state into HTML strings and inject
 * them into known mount points in `index.html`.
 *
 * Render functions are intentionally pure with respect to the DOM they
 * own: each render call regenerates the markup for a single section.
 */

import { DOW, DOW_ORDER, stripTime, MS_PER_DAY, parseISO, fmt } from './dates.js';
import { worksOn, isFree, summarise, findFreeDates } from './schedule.js';
import { PRESETS } from './presets.js';
import { esc } from './people.js';

function chips(arr, attr) {
  return DOW_ORDER.map(
    (i) =>
      `<button class="day-chip ${arr[i] ? 'on' : ''}" data-${attr}="${i}">${DOW[i]}<span class="chip-state">${arr[i] ? 'Work' : 'Off'}</span></button>`,
  ).join('');
}

function rotChips(arr, wi) {
  return DOW_ORDER.map(
    (i) =>
      `<button class="day-chip ${arr[i] ? 'on' : ''}" data-rwk="${wi}-${i}">${DOW[i]}<span class="chip-state">${arr[i] ? 'Work' : 'Off'}</span></button>`,
  ).join('');
}

function renderPresets() {
  return (
    '<div class="weekblock"><div class="wlabel">Quick-apply a standard shift pattern</div><p class="preset-hint">Pick a common rota, then fine-tune the days or anchor date below.</p><div class="preset-grid">' +
    PRESETS.map(
      (x) =>
        `<button class="preset-card" data-preset="${x.id}"><span class="pcat">${x.cat}</span><span class="pt">${x.t}</span><span class="pd">${x.d}</span></button>`,
    ).join('') +
    '</div></div>'
  );
}

export function renderPeople(state) {
  const el = document.getElementById('peopleList');
  if (!state.people.length) {
    el.innerHTML =
      '<div class="empty"><p>No people yet. Add someone, or load the Mum & Dad example.</p></div>';
    return;
  }
  el.innerHTML = state.people
    .map(
      (p) =>
        `<div class="person ${p.id === state.selId ? 'sel' : ''}" data-sel="${p.id}"><span class="dot" style="background:${p.color}"></span><span class="nm">${esc(p.name)}</span><span class="cnt">${summarise(p)}</span><button class="del" data-del="${p.id}" aria-label="Remove ${esc(p.name)}">✕</button></div>`,
    )
    .join('');
}

export function renderSchedule(state) {
  const host = document.getElementById('tab-schedule');
  if (!state.people.length || !state.selId) {
    host.innerHTML =
      '<div class="empty"><p>Add a person on the left, then choose how their rota works.</p></div>';
    return;
  }
  const p = state.people.find((x) => x.id === state.selId);
  let body = '';

  if (p.mode === 'weekly') {
    body = `<div class="weekblock"><div class="wlabel">Working days (same every week)<span class="quick"><button data-wd>Mon–Fri</button><button data-all>All</button><button data-none>None</button></span></div><div class="daysrow">${chips(p.work, 'w')}</div></div>`;
  } else if (p.mode === 'rotweek') {
    body = p.weeks
      .map(
        (wk, wi) =>
          `<div class="weekblock"><div class="wlabel">Week ${wi + 1}<span class="quick"><button data-rwd="${wi}">Mon–Fri</button><button data-rnone="${wi}">Clear</button>${p.weeks.length > 2 ? `<button data-rdel="${wi}">Remove</button>` : ''}</span></div><div class="daysrow">${rotChips(wk, wi)}</div></div>`,
      )
      .join('');
    body += `<div class="field"><div class="row"><button class="btn btn-ghost" data-addweek>+ Add another week</button><div><span class="minilabel">Rota started week of</span><input type="date" data-rotanchor value="${p.rotAnchor}"></div></div><small>The pattern repeats every ${p.weeks.length} weeks from this date.</small></div>`;
  } else {
    body = `<div class="field"><label>Rolling block pattern</label><div class="row"><div><span class="minilabel">Days ON (working)</span><input type="number" min="1" max="30" data-on value="${p.onDays}"></div><div><span class="minilabel">Days OFF</span><input type="number" min="1" max="30" data-off value="${p.offDays}"></div><div><span class="minilabel">First working day</span><input type="date" data-blockanchor value="${p.blockAnchor}"></div></div><small>Repeats every ${p.onDays + p.offDays} days, ignoring weekdays.</small></div>`;
  }

  let strip = '';
  const t = stripTime(new Date());
  for (let i = 0; i < 14; i++) {
    const d = new Date(t.getTime() + i * MS_PER_DAY);
    strip += `<i class="${worksOn(p, d) ? 'w' : ''}">${d.getDate()}</i>`;
  }

  host.innerHTML = `
    <div class="edithead">
      <span class="dot" style="background:${p.color}"></span>
      <span class="nm">${esc(p.name)}</span>
    </div>
    <div class="mode-select">
      <button class="mode-btn ${p.mode === 'weekly' ? 'on' : ''}" data-mode="weekly"><span class="t">Same every week</span><span class="d">Fixed Mon–Sun pattern</span></button>
      <button class="mode-btn ${p.mode === 'rotweek' ? 'on' : ''}" data-mode="rotweek"><span class="t">Rotating weeks</span><span class="d">2, 3 or 4-week cycle</span></button>
      <button class="mode-btn ${p.mode === 'block' ? 'on' : ''}" data-mode="block"><span class="t">Rolling blocks</span><span class="d">N on / M off</span></button>
    </div>
    ${renderPresets()}
    <div class="daykey">
      <span class="kt">Legend</span>
      <span><i class="ks ks-work"></i> Working</span>
      <span><i class="ks ks-off"></i> Off</span>
    </div>
    ${body}
    <div class="preview">Next 14 days:<div class="previewstrip">${strip}</div></div>
  `;
}

export function renderCal(state) {
  document.getElementById('monthLabel').textContent = state.calMonth.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
  const grid = document.getElementById('calGrid');
  let html = DOW_ORDER.map((i) => `<div class="dow">${DOW[i]}</div>`).join('');
  const startPad = (state.calMonth.getDay() + 6) % 7;
  const dim = new Date(state.calMonth.getFullYear(), state.calMonth.getMonth() + 1, 0).getDate();
  for (let i = 0; i < startPad; i++) html += '<div class="cell pad"></div>';
  for (let d = 1; d <= dim; d++) {
    const date = new Date(state.calMonth.getFullYear(), state.calMonth.getMonth(), d);
    const free = isFree(state.people, date);
    const mini =
      !free && state.people.length
        ? '<div class="mini">' +
          state.people
            .filter((p) => worksOn(p, date))
            .map((p) => `<i style="background:${p.color}"></i>`)
            .join('') +
          '</div>'
        : '';
    html += `<div class="cell ${free ? 'free' : ''}"><span class="d">${d}</span>${free ? '<span class="free-tag">Free</span>' : mini}</div>`;
  }
  grid.innerHTML = html;
}

export function renderList(state) {
  const s = document.getElementById('rangeStart').value;
  const e = document.getElementById('rangeEnd').value;
  const out = document.getElementById('resultList');
  const sumEl = document.getElementById('listSummary');

  if (!s || !e || !state.people.length) {
    out.innerHTML =
      '<div class="empty"><p>Add people and pick a date range to see every day all of them are free.</p></div>';
    sumEl.textContent = '';
    state.lastFrees = [];
    return;
  }

  const start = parseISO(s);
  const end = parseISO(e);
  const total = Math.floor((end - start) / MS_PER_DAY) + 1;
  const frees = findFreeDates(state.people, start, end);

  sumEl.innerHTML = `<b>${frees.length}</b> shared free day${frees.length !== 1 ? 's' : ''} out of ${total} across ${state.people.length} ${state.people.length === 1 ? 'person' : 'people'}.`;

  out.innerHTML = frees.length
    ? frees
        .map(
          (d) =>
            `<div class="rfree"><span class="rdate">${fmt(d)}</span><span class="rdow">${d.toLocaleDateString('en-GB', { weekday: 'long' })}</span></div>`,
        )
        .join('')
    : '<div class="empty"><p>No days where everyone is off in this range.</p></div>';

  state.lastFrees = frees;
}
