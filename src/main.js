/**
 * Free Day Finder — application entry point.
 *
 * Wires the DOM event handlers to the rendering modules and seeds the
 * initial application state.
 */

import { iso, mondayOf, isoToday } from './modules/dates.js';
import { PRESETS } from './modules/presets.js';
import { defaultPerson, resetIds } from './modules/people.js';
import { PALETTE } from './modules/schedule.js';
import { renderPeople, renderSchedule, renderCal, renderList } from './modules/views.js';

const state = {
  people: [],
  selId: null,
  calMonth: (() => {
    const d = new Date();
    d.setDate(1);
    return d;
  })(),
  lastFrees: [],
};

function render() {
  renderPeople(state);
  renderSchedule(state);
  renderCal(state);
  renderList(state);
}

function addPerson(name) {
  const trimmed = (name || '').trim() || 'Person ' + String.fromCharCode(65 + state.people.length);
  const p = defaultPerson(trimmed, state.people.length);
  state.people.push(p);
  state.selId = p.id;
  render();
}

function removePerson(id) {
  state.people = state.people.filter((p) => p.id !== id);
  if (state.selId === id) state.selId = state.people[0]?.id ?? null;
  render();
}

function loadSampleData() {
  state.people = [];
  resetIds();

  const mum = defaultPerson('Mum', 0);
  mum.mode = 'rotweek';
  mum.weeks = [
    [false, true, true, false, false, false, true],
    [false, false, false, true, true, true, false],
  ];
  mum.rotAnchor = mondayOf(new Date());

  const dad = defaultPerson('Dad', 1);
  dad.color = PALETTE[1];
  dad.mode = 'block';
  dad.onDays = 4;
  dad.offDays = 4;
  dad.blockAnchor = isoToday();

  const brother = defaultPerson('Brother', 2);
  brother.color = PALETTE[2];
  brother.mode = 'constrained';
  brother.cMinWork = 7;
  brother.cOffLen = 2;
  brother.cFirstOff = isoToday();
  // Wed=2, Thu=3 in Mon-first order (Mon=0)
  brother.cForbidStart = [2, 3];

  state.people = [mum, dad, brother];
  state.selId = mum.id;
  render();
}

// --- Event wiring -----------------------------------------------------------

document.getElementById('addBtn').onclick = () => {
  const input = document.getElementById('nameInput');
  addPerson(input.value);
  input.value = '';
  input.focus();
};

document.getElementById('nameInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('addBtn').click();
});

document.getElementById('sampleBtn').onclick = loadSampleData;

document.getElementById('peopleList').addEventListener('click', (e) => {
  const del = e.target.closest('[data-del]');
  if (del) {
    removePerson(+del.dataset.del);
    return;
  }
  const sel = e.target.closest('[data-sel]');
  if (sel) {
    state.selId = +sel.dataset.sel;
    render();
  }
});

document.getElementById('tab-schedule').addEventListener('click', (e) => {
  const p = state.people.find((x) => x.id === state.selId);
  if (!p) return;

  const pr = e.target.closest('[data-preset]');
  if (pr) {
    const def = PRESETS.find((x) => x.id === pr.dataset.preset);
    if (def) {
      def.apply(p);
      render();
    }
    return;
  }

  const m = e.target.closest('[data-mode]');
  if (m) {
    p.mode = m.dataset.mode;
    render();
    return;
  }

  const wc = e.target.closest('[data-w]');
  if (wc) {
    p.work[+wc.dataset.w] = !p.work[+wc.dataset.w];
    render();
    return;
  }

  if (e.target.closest('[data-wd]')) {
    p.work = [false, true, true, true, true, true, false];
    render();
    return;
  }
  if (e.target.closest('[data-all]')) {
    p.work = [true, true, true, true, true, true, true];
    render();
    return;
  }
  if (e.target.closest('[data-none]')) {
    p.work = [false, false, false, false, false, false, false];
    render();
    return;
  }

  const rwd = e.target.closest('[data-rwd]');
  if (rwd) {
    p.weeks[+rwd.dataset.rwd] = [false, true, true, true, true, true, false];
    render();
    return;
  }

  const rn = e.target.closest('[data-rnone]');
  if (rn) {
    p.weeks[+rn.dataset.rnone] = [false, false, false, false, false, false, false];
    render();
    return;
  }

  const rwk = e.target.closest('[data-rwk]');
  if (rwk) {
    const [W, I] = rwk.dataset.rwk.split('-').map(Number);
    p.weeks[W][I] = !p.weeks[W][I];
    render();
    return;
  }

  const rd = e.target.closest('[data-rdel]');
  if (rd) {
    p.weeks.splice(+rd.dataset.rdel, 1);
    render();
    return;
  }

  if (e.target.closest('[data-addweek]')) {
    p.weeks.push([false, true, true, true, true, true, false]);
    render();
  }

  // Constrained mode: toggle forbidden start day
  const cfd = e.target.closest('[data-cfd]');
  if (cfd) {
    const day = +cfd.dataset.cfd;
    const idx = p.cForbidStart.indexOf(day);
    if (idx === -1) p.cForbidStart.push(day);
    else p.cForbidStart.splice(idx, 1);
    render();
    return;
  }
});

document.getElementById('tab-schedule').addEventListener('change', (e) => {
  const p = state.people.find((x) => x.id === state.selId);
  if (!p) return;
  if (e.target.matches('[data-rotanchor]')) {
    p.rotAnchor = e.target.value;
    render();
  }
  if (e.target.matches('[data-on]')) {
    p.onDays = Math.max(1, +e.target.value || 1);
    render();
  }
  if (e.target.matches('[data-off]')) {
    p.offDays = Math.max(1, +e.target.value || 1);
    render();
  }
  if (e.target.matches('[data-blockanchor]')) {
    p.blockAnchor = e.target.value;
    render();
  }
  // Constrained mode fields
  if (e.target.matches('[data-cminwork]')) {
    p.cMinWork = Math.max(1, +e.target.value || 1);
    render();
  }
  if (e.target.matches('[data-cofflen]')) {
    p.cOffLen = Math.max(1, +e.target.value || 1);
    render();
  }
  if (e.target.matches('[data-cfirstoff]')) {
    p.cFirstOff = e.target.value;
    render();
  }
});

document.querySelectorAll('.tab').forEach((t) => {
  t.onclick = () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
    ['schedule', 'calendar', 'list'].forEach((n) => {
      document.getElementById('tab-' + n).hidden = n !== t.dataset.tab;
    });
  };
});

document.getElementById('prevM').onclick = () => {
  state.calMonth.setMonth(state.calMonth.getMonth() - 1);
  renderCal(state);
};
document.getElementById('nextM').onclick = () => {
  state.calMonth.setMonth(state.calMonth.getMonth() + 1);
  renderCal(state);
};

document.getElementById('rangeStart').onchange = () => renderList(state);
document.getElementById('rangeEnd').onchange = () => renderList(state);

document.getElementById('exportBtn').onclick = () => {
  if (!state.lastFrees.length) return;
  const rows = [['Date', 'Day']].concat(
    state.lastFrees.map((d) => [iso(d), d.toLocaleDateString('en-GB', { weekday: 'long' })]),
  );
  const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'free-dates.csv';
  a.click();
};

// --- Theme toggle -----------------------------------------------------------

(function initTheme() {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const icons = {
    dark: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    light:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
  };

  root.setAttribute('data-theme', theme);
  toggle.innerHTML = icons[theme];
  toggle.onclick = () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    toggle.innerHTML = icons[theme];
  };
})();

// --- Initial seed -----------------------------------------------------------

const today = new Date();
const in60 = new Date();
in60.setDate(today.getDate() + 60);
document.getElementById('rangeStart').value = iso(today);
document.getElementById('rangeEnd').value = iso(in60);

render();
