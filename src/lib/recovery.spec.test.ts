import { describe, expect, it } from 'vitest';
import { getDefaultSettings, normalizeLogs, normalizeSettings } from './cycleUtils';
import type { PeriodLog } from '../types';

const log = (date: string, period = true): PeriodLog => ({
  date,
  period,
  symptoms: [],
  flow: 'medium',
  notes: '',
});

describe('AuraCycle V2 persistence & recovery specification', () => {
  it('RECOVERY 01 — clear-state invariant is empty logs plus default settings', () => {
    expect(normalizeLogs([])).toEqual([]);
    expect(normalizeSettings({})).toEqual(getDefaultSettings());
  });

  it('RECOVERY 02 — malformed log payload recovers without throwing', () => {
    expect(() => normalizeLogs([null, undefined, 42, 'bad', {}] as never)).not.toThrow();
    expect(normalizeLogs([null, undefined, 42, 'bad', {}] as never)).toEqual([]);
  });

  it('RECOVERY 03 — malformed settings recover to the documented defaults', () => {
    expect(normalizeSettings(null as never)).toEqual(getDefaultSettings());
    expect(normalizeSettings('invalid' as never)).toEqual(getDefaultSettings());
  });

  it('RECOVERY 04 — duplicate dates resolve deterministically to one record', () => {
    const normalized = normalizeLogs([
      log('2026-01-01', true),
      log('2026-01-01', false),
    ]);
    expect(normalized).toHaveLength(1);
    expect(normalized[0]?.date).toBe('2026-01-01');
    expect(normalized[0]?.period).toBe(false);
  });

  it('RECOVERY 05 — valid history remains intact through normalization', () => {
    const history = [log('2026-01-01'), log('2026-01-29')];
    expect(normalizeLogs(history)).toEqual(history);
  });

  it('RECOVERY 06 — valid settings remain intact through normalization', () => {
    const settings = {
      startingCycleLength: 28,
      startingPeriodLength: 5,
    };
    expect(normalizeSettings(settings)).toEqual(settings);
  });
});
