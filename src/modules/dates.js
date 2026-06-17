/**
 * Pure date utility functions.
 *
 * Kept side-effect free so they can be tested in isolation and reused
 * across the schedule, calendar and list views.
 */

export const MS_PER_DAY = 86_400_000;

export const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** UI ordering: Monday-first week. */
export const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** Format a Date as a local-time `YYYY-MM-DD` string. */
export function iso(d) {
  const x = new Date(d);
  return (
    x.getFullYear() +
    '-' +
    String(x.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(x.getDate()).padStart(2, '0')
  );
}

/** Parse an ISO `YYYY-MM-DD` into a local-time Date at 00:00. */
export function parseISO(s) {
  const [a, b, c] = s.split('-').map(Number);
  return new Date(a, b - 1, c);
}

/** Today's date as an ISO `YYYY-MM-DD` string. */
export function isoToday() {
  return iso(new Date());
}

/** Locale-formatted date for display (en-GB). */
export function fmt(d) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Return a new Date with the time-of-day stripped. */
export function stripTime(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** ISO Monday of the week containing `d`. */
export function mondayOf(d) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = (day + 6) % 7; // Sun=0 → 6, Mon=1 → 0
  x.setDate(x.getDate() - diff);
  return iso(x);
}

/** Whole days between two dates (b - a), ignoring DST hour drift. */
export function daysBetween(a, b) {
  return Math.floor((stripTime(b) - stripTime(a)) / MS_PER_DAY);
}
