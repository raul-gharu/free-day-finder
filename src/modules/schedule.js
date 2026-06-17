/**
 * Schedule domain logic.
 *
 * A Person has one of three rota `mode`s:
 *   - 'weekly'  — fixed Mon–Sun working-day mask
 *   - 'rotweek' — multi-week rotation, anchored to a Monday
 *   - 'block'   — rolling N-on / M-off cycle, anchored to a first working day
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
  return p.onDays + ' on / ' + p.offDays + ' off';
}
