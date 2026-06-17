import { describe, it, expect } from 'vitest';
import { iso, parseISO, mondayOf, daysBetween, stripTime } from '../src/modules/dates.js';

describe('iso / parseISO', () => {
  it('round-trips a date', () => {
    expect(iso(parseISO('2026-03-15'))).toBe('2026-03-15');
  });

  it('pads single-digit months and days', () => {
    expect(iso(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('mondayOf', () => {
  it('returns the Monday for a mid-week date', () => {
    // 2026-06-17 is a Wednesday
    expect(mondayOf(new Date(2026, 5, 17))).toBe('2026-06-15');
  });

  it('returns the same date for a Monday', () => {
    expect(mondayOf(new Date(2026, 5, 15))).toBe('2026-06-15');
  });

  it('rolls Sunday back to the previous Monday', () => {
    // 2026-06-21 is a Sunday
    expect(mondayOf(new Date(2026, 5, 21))).toBe('2026-06-15');
  });
});

describe('daysBetween', () => {
  it('handles same-day input', () => {
    const d = new Date(2026, 5, 17);
    expect(daysBetween(d, d)).toBe(0);
  });

  it('counts forward across a month boundary', () => {
    expect(daysBetween(new Date(2026, 5, 30), new Date(2026, 6, 5))).toBe(5);
  });

  it('returns a negative value when b is before a', () => {
    expect(daysBetween(new Date(2026, 5, 17), new Date(2026, 5, 10))).toBe(-7);
  });
});

describe('stripTime', () => {
  it('removes the time-of-day component', () => {
    const d = new Date(2026, 5, 17, 14, 32, 5);
    const s = stripTime(d);
    expect(s.getHours()).toBe(0);
    expect(s.getMinutes()).toBe(0);
    expect(s.getSeconds()).toBe(0);
  });
});
