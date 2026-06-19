/**
 * Person factory and small helpers.
 *
 * State management is kept simple — a module-scoped counter assigns
 * monotonic IDs. Callers own the people array.
 */

import { isoToday, mondayOf } from './dates.js';
import { PALETTE } from './schedule.js';

let nextId = 1;

/** Reset the internal id counter — useful for tests. */
export function resetIds() {
  nextId = 1;
}

/**
 * Build a new person with sensible defaults: weekly Mon–Fri.
 * @param {string} name
 * @param {number} colourIndex used to pick a colour from the palette
 */
export function defaultPerson(name, colourIndex = 0) {
  return {
    id: nextId++,
    name,
    color: PALETTE[colourIndex % PALETTE.length],
    mode: 'weekly',
    work: [false, true, true, true, true, true, false],
    weeks: [
      [false, true, true, false, false, false, true],
      [false, false, false, true, true, true, false],
    ],
    rotAnchor: mondayOf(new Date()),
    onDays: 4,
    offDays: 4,
    blockAnchor: isoToday(),
    // Constrained block fields
    cMinWork: 7,
    cOffLen: 2,
    cFirstOff: isoToday(),
    cForbidStart: [],
  };
}

/** Escape HTML-sensitive characters for safe insertion into innerHTML. */
export function esc(s) {
  return String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );
}
