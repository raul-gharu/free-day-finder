/**
 * Schedule domain logic.
 *
 * A Person has one of four rota `mode`s:
 *   - 'weekly'      — fixed Mon–Sun working-day mask
 *   - 'rotweek'     — multi-week rotation, anchored to a Monday
 *   - 'block'       — rolling N-on / M-off cycle, anchored to a first working day
 *   - 'constrained' — rolling block where off-start is pushed forward if it lands
 *                     on a forbidden weekday, lengthening that working run
 *
 * All functions in this module are pure: given the same inputs they
 * always return the same output and never mutate their arguments.
 */

import { parseISO, daysBetween } from './dates.js';

/** Default palette used when creating a new person. */
export const PALETTE = [
  '#01696f',
  '#a12c7b',
  '#964219',
  '#437a22',
  '#006494',
  '#7a39bb',
  '#da7101',
  '#a13544',
];

// ---------------------------------------------------------------------------
// Constrained block helpers
// ---------------------------------------------------------------------------

// Day-of-week in Mon-first order (Mon=0 … Sun=6)
function dowMon(d) {
  return (d.getDay() + 6) % 7;
}

function addDays(d, n) {
  return new Date(d.getTime() + n * 86_400_000);
}

/**
 * Build the set of ISO date strings that are OFF days for a constrained-block
 * person, covering [frm, to] (both Date objects).
 *
 * Rules:
 *  - Each off-block is exactly `cOffLen` consecutive days.
 *  - The minimum working run between off-blocks is `cMinWork` days.
 *  - If the next off-block would START on a weekday in `cForbidStart`, push
 *    the start forward by 1 day (repeat until the start day is allowed),
 *    which silently lengthens the preceding working run.
 *  - `cFirstOff` (ISO string) is the first day of the very first off-block
 *    (already assumed to be on a valid start day).
 */
function constrainedOffSet(person, frm, to) {
  const minWork = Math.max(0, person.cMinWork | 0);
  const offLen = Math.max(1, person.cOffLen | 0);
  const forbid = new Set(person.cForbidStart || []);

  // Step forward from one off-start to the next
  function nextOffStart(s) {
    let nxt = addDays(s, offLen + minWork);
    let guard = 0;
    while (forbid.has(dowMon(nxt)) && guard++ < 14) nxt = addDays(nxt, 1);
    return nxt;
  }

  // Find the predecessor off-start whose nextOffStart() equals `first`
  function prevOffStart(first) {
    for (let extra = 0; extra < 8; extra++) {
      const cand = addDays(first, -(offLen + minWork + extra));
      if (forbid.has(dowMon(cand))) continue;
      if (+nextOffStart(cand) === +first) return cand;
    }
    return null;
  }

  // Anchor: first off day, adjust if it falls on a forbidden start day
  let anchor = parseISO(person.cFirstOff);
  let g = 0;
  while (forbid.has(dowMon(anchor)) && g++ < 14) anchor = addDays(anchor, 1);

  // Collect off-starts forward from anchor until past `to`
  const starts = [anchor];
  let cur = anchor;
  let guard1 = 0;
  while (cur <= to && guard1++ < 20000) {
    cur = nextOffStart(cur);
    starts.push(cur);
  }

  // Reverse-chain backward from anchor until before `frm`
  let first = anchor;
  let guard2 = 0;
  while (first > frm && guard2++ < 20000) {
    const prev = prevOffStart(first);
    if (!prev) break;
    starts.unshift(prev);
    first = prev;
  }

  // Build the set of all off-day ISO strings
  const set = new Set();
  for (const s of starts) {
    for (let k = 0; k < offLen; k++) {
      const day = addDays(s, k);
      // ISO in local time to match parseISO
      const iso = `${day.getUTCFullYear()}-${String(day.getUTCMonth() + 1).padStart(2, '0')}-${String(day.getUTCDate()).padStart(2, '0')}`;
      set.add(iso);
    }
  }
  return set;
}

function isoDate(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Main worksOn
// ---------------------------------------------------------------------------

/**
 * Determine whether `person` is scheduled to work on `date`.
 * @param {object} person
 * @param {Date} date
 * @returns {boolean}
 */
export function worksOn(person, date) {
  const dow = date.getDay();

  if (person.mode === 'weekly') {
    return Boolean(person.work?.[dow]);
  }

  if (person.mode === 'rotweek') {
    const weeks = person.weeks ?? [];
    if (weeks.length === 0) return false;
    const anchor = parseISO(person.rotAnchor);
    const wk = Math.floor(daysBetween(anchor, date) / 7);
    const idx = ((wk % weeks.length) + weeks.length) % weeks.length;
    return Boolean(weeks[idx]?.[dow]);
  }

  if (person.mode === 'block') {
    const cyc = person.onDays + person.offDays;
    if (cyc <= 0) return false;
    const anchor = parseISO(person.blockAnchor);
    let pos = daysBetween(anchor, date) % cyc;
    if (pos < 0) pos += cyc;
    return pos < person.onDays;
  }

  if (person.mode === 'constrained') {
    // Build off-set with a 400-day window around the query date
    const pad = new Date(date.getTime() + 400 * 86_400_000);
    const frm = new Date(date.getTime() - 400 * 86_400_000);
    const offSet = constrainedOffSet(person, frm, pad);
    return !offSet.has(isoDate(date));
  }

  return false;
}

/**
 * Return true when `people` is non-empty and no one is working on `date`.
 */
export function isFree(people, date) {
  return people.length > 0 && people.every((p) => !worksOn(p, date));
}

/**
 * Find every shared free date in the inclusive range [start, end].
 * @returns {Date[]}
 */
export function findFreeDates(people, start, end) {
  if (!people.length || start > end) return [];
  const out = [];
  for (let cur = new Date(start); cur <= end; cur = new Date(cur.getTime() + 86_400_000)) {
    if (isFree(people, cur)) out.push(new Date(cur));
  }
  return out;
}

/** Short human-readable summary of a person's rota. */
export function summarise(p) {
  if (p.mode === 'weekly') return p.work.filter(Boolean).length + 'd/wk fixed';
  if (p.mode === 'rotweek') return p.weeks.length + '-week rota';
  if (p.mode === 'constrained') return p.cMinWork + '+ on / ' + p.cOffLen + ' off (constrained)';
  return p.onDays + ' on / ' + p.offDays + ' off';
}
