import { describe, it, expect } from 'vitest';
import { worksOn, isFree, findFreeDates } from '../src/modules/schedule.js';

describe('worksOn — weekly mode', () => {
  const person = {
    mode: 'weekly',
    // Sun, Mon, Tue, Wed, Thu, Fri, Sat
    work: [false, true, true, true, true, true, false],
  };

  it('reports a working weekday', () => {
    expect(worksOn(person, new Date(2026, 5, 17))).toBe(true); // Wed
  });

  it('reports a non-working weekend day', () => {
    expect(worksOn(person, new Date(2026, 5, 20))).toBe(false); // Sat
  });
});

describe('worksOn — rotweek mode', () => {
  const person = {
    mode: 'rotweek',
    rotAnchor: '2026-06-15', // Monday
    weeks: [
      // Week 1: Sun Mon Tue Wed Thu Fri Sat
      [false, true, true, false, false, false, true],
      // Week 2
      [false, false, false, true, true, true, false],
    ],
  };

  it('uses week 1 in the anchor week', () => {
    expect(worksOn(person, new Date(2026, 5, 15))).toBe(true); // Mon wk1
    expect(worksOn(person, new Date(2026, 5, 17))).toBe(false); // Wed wk1
  });

  it('rolls into week 2 the following week', () => {
    expect(worksOn(person, new Date(2026, 5, 22))).toBe(false); // Mon wk2
    expect(worksOn(person, new Date(2026, 5, 24))).toBe(true); // Wed wk2
  });

  it('wraps back to week 1 after a full cycle', () => {
    expect(worksOn(person, new Date(2026, 5, 29))).toBe(true); // Mon wk1 again
  });
});

describe('worksOn — block mode', () => {
  const person = {
    mode: 'block',
    onDays: 4,
    offDays: 4,
    blockAnchor: '2026-06-15',
  };

  it('returns true within the first ON block', () => {
    for (let i = 0; i < 4; i++) {
      expect(worksOn(person, new Date(2026, 5, 15 + i))).toBe(true);
    }
  });

  it('returns false within the following OFF block', () => {
    for (let i = 4; i < 8; i++) {
      expect(worksOn(person, new Date(2026, 5, 15 + i))).toBe(false);
    }
  });

  it('cycles correctly after the period', () => {
    expect(worksOn(person, new Date(2026, 5, 23))).toBe(true); // next ON block
  });

  it('handles dates before the anchor', () => {
    // Day before anchor is end of an OFF block by reverse counting
    expect(worksOn(person, new Date(2026, 5, 14))).toBe(false);
  });
});

describe('isFree', () => {
  it('is false when nobody is in the list', () => {
    expect(isFree([], new Date(2026, 5, 17))).toBe(false);
  });

  it('is true when all people are off', () => {
    const a = { mode: 'weekly', work: [false, false, false, false, false, false, false] };
    expect(isFree([a], new Date(2026, 5, 17))).toBe(true);
  });

  it('is false when anyone is working', () => {
    const a = { mode: 'weekly', work: [false, false, false, false, false, false, false] };
    const b = { mode: 'weekly', work: [true, true, true, true, true, true, true] };
    expect(isFree([a, b], new Date(2026, 5, 17))).toBe(false);
  });
});

describe('findFreeDates', () => {
  it('returns every shared free day in the inclusive range', () => {
    const person = {
      mode: 'weekly',
      // Mon–Fri working only
      work: [false, true, true, true, true, true, false],
    };
    const start = new Date(2026, 5, 15); // Mon
    const end = new Date(2026, 5, 21); // Sun
    const frees = findFreeDates([person], start, end);
    expect(frees.map((d) => d.getDay())).toEqual([6, 0]); // Sat, Sun
  });

  it('returns an empty array when the start is after the end', () => {
    const p = { mode: 'weekly', work: [false, false, false, false, false, false, false] };
    expect(findFreeDates([p], new Date(2026, 5, 20), new Date(2026, 5, 10))).toEqual([]);
  });
});
