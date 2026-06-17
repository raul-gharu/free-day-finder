/**
 * Canonical shift-pattern presets.
 *
 * Each preset's `apply(person)` mutates the given person object in place to
 * configure that rota — callers are expected to re-render afterwards.
 */

import { isoToday, mondayOf } from './dates.js';

export const PRESETS = [
  {
    id: '9to5',
    cat: 'Fixed',
    t: '9–5 Mon–Fri',
    d: 'Standard office week',
    apply: (p) => {
      p.mode = 'weekly';
      p.work = [false, true, true, true, true, true, false];
    },
  },
  {
    id: 'mf-we',
    cat: 'Fixed',
    t: 'Weekends only',
    d: 'Sat & Sun working',
    apply: (p) => {
      p.mode = 'weekly';
      p.work = [true, false, false, false, false, false, true];
    },
  },
  {
    id: '5over7',
    cat: 'Fixed',
    t: '5 over 7',
    d: 'Any 5 of 7 days (Tue–Sat)',
    apply: (p) => {
      p.mode = 'weekly';
      p.work = [false, false, true, true, true, true, true];
    },
  },
  {
    id: '4on4off',
    cat: 'Blocks',
    t: '4 on / 4 off',
    d: 'Emergency services, 12h',
    apply: (p) => {
      p.mode = 'block';
      p.onDays = 4;
      p.offDays = 4;
      p.blockAnchor = isoToday();
    },
  },
  {
    id: '7on7off',
    cat: 'Blocks',
    t: '7 on / 7 off',
    d: 'A week on, a week off',
    apply: (p) => {
      p.mode = 'block';
      p.onDays = 7;
      p.offDays = 7;
      p.blockAnchor = isoToday();
    },
  },
  {
    id: '3on3off',
    cat: 'Blocks',
    t: '3 on / 3 off',
    d: 'Short rolling block',
    apply: (p) => {
      p.mode = 'block';
      p.onDays = 3;
      p.offDays = 3;
      p.blockAnchor = isoToday();
    },
  },
  {
    id: '2on2off',
    cat: 'Blocks',
    t: '2 on / 2 off',
    d: 'Continental-style',
    apply: (p) => {
      p.mode = 'block';
      p.onDays = 2;
      p.offDays = 2;
      p.blockAnchor = isoToday();
    },
  },
  {
    id: '5on2off',
    cat: 'Blocks',
    t: '5 on / 2 off',
    d: 'Rolling 5-2',
    apply: (p) => {
      p.mode = 'block';
      p.onDays = 5;
      p.offDays = 2;
      p.blockAnchor = isoToday();
    },
  },
  {
    id: 'panama',
    cat: 'Rotating 2wk',
    t: 'Panama (2-2-3)',
    d: '2 on, 2 off, 3 on / flips',
    apply: (p) => {
      p.mode = 'rotweek';
      p.rotAnchor = mondayOf(new Date());
      p.weeks = [
        [true, true, false, false, true, true, true],
        [false, false, true, true, false, false, false],
      ];
    },
  },
  {
    id: 'altwk',
    cat: 'Rotating 2wk',
    t: 'Alternating weeks',
    d: 'Weekends one wk, midweek next',
    apply: (p) => {
      p.mode = 'rotweek';
      p.rotAnchor = mondayOf(new Date());
      p.weeks = [
        [false, true, true, false, false, false, true],
        [false, false, false, true, true, true, false],
      ];
    },
  },
  {
    id: 'everyother',
    cat: 'Rotating 2wk',
    t: 'Every other weekend',
    d: 'Mon–Fri + alternate Sat/Sun',
    apply: (p) => {
      p.mode = 'rotweek';
      p.rotAnchor = mondayOf(new Date());
      p.weeks = [
        [true, true, true, true, true, true, true],
        [false, true, true, true, true, true, false],
      ];
    },
  },
  {
    id: 'dupont',
    cat: 'Rotating 4wk',
    t: 'DuPont (4-week)',
    d: '4 on/3 off rotating cycle',
    apply: (p) => {
      p.mode = 'rotweek';
      p.rotAnchor = mondayOf(new Date());
      p.weeks = [
        [true, true, true, true, false, false, false],
        [false, false, false, true, true, true, true],
        [true, true, true, false, true, true, true],
        [false, false, false, false, false, false, false],
      ];
    },
  },
];
