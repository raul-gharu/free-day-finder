import { describe, it, expect } from 'vitest';
import { PRESETS } from '../src/modules/presets.js';

describe('PRESETS', () => {
  it('exposes a unique id for every preset', () => {
    const ids = PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('configures the 9–5 preset to weekly Mon–Fri', () => {
    const p = {};
    PRESETS.find((x) => x.id === '9to5').apply(p);
    expect(p.mode).toBe('weekly');
    expect(p.work).toEqual([false, true, true, true, true, true, false]);
  });

  it('configures the 4-on/4-off preset as a block', () => {
    const p = {};
    PRESETS.find((x) => x.id === '4on4off').apply(p);
    expect(p.mode).toBe('block');
    expect(p.onDays).toBe(4);
    expect(p.offDays).toBe(4);
  });

  it('configures the DuPont preset as a 4-week rotation', () => {
    const p = {};
    PRESETS.find((x) => x.id === 'dupont').apply(p);
    expect(p.mode).toBe('rotweek');
    expect(p.weeks).toHaveLength(4);
  });
});
