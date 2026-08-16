import { describe, expect, it } from 'vitest';
import type { CycleSettings, DayLog } from '../types';
import { getDefaultSettings } from '../data/initialData';
import {
  normalizeLogs,
  normalizeSettings,
  serializeLogs,
  serializeSettings,
} from './dataValidation';

const log = (date: string, flow: DayLog['flow'] = 'Medium'): DayLog => ({
  date,
  flow,
  symptoms: [],
});

describe('AuraCycle V2 persistence & recovery specification', () => {
  it('RECOVERY 01 — clear-state invariant is empty logs plus default settings', () => {
    expect(normalizeLogs([])).toEqual([]);
    expect(normalizeSettings({}, getDefaultSettings())).toEqual(getDefaultSettings());
  });

  it('RECOVERY 02 — malformed log payload recovers without throwing', () => {
    const malformed = [null, undefined, 42, 'bad', {}];
    expect(() => normalizeLogs(malformed)).not.toThrow();
    expect(normalizeLogs(malformed)).toEqual([]);
  });

  it('RECOVERY 03 — malformed settings recover to the documented defaults', () => {
    const fallback = getDefaultSettings();
    expect(normalizeSettings(null, fallback)).toEqual(fallback);
    expect(normalizeSettings('invalid', fallback)).toEqual(fallback);
  });

  it('RECOVERY 04 — duplicate dates resolve deterministically to the last valid record', () => {
    const normalized = normalizeLogs([
      log('2026-01-01', 'Light'),
      log('2026-01-01', 'Heavy'),
    ]);
    expect(normalized).toHaveLength(1);
    expect(normalized[0]).toEqual(log('2026-01-01', 'Heavy'));
  });

  it('RECOVERY 05 — valid history survives serialize → parse → normalize', () => {
    const history = [log('2026-01-01'), log('2026-01-29', 'Light')];
    const restored = normalizeLogs(JSON.parse(serializeLogs(history)));
    expect(restored).toEqual(history);
  });

  it('RECOVERY 06 — valid settings survive serialize → parse → normalize', () => {
    const settings: CycleSettings = {
      startingCycleLength: 31,
      startingPeriodLength: 6,
    };
    const restored = normalizeSettings(JSON.parse(serializeSettings(settings)), getDefaultSettings());
    expect(restored).toEqual(settings);
  });
});
