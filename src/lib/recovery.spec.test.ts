import assert from 'node:assert/strict';
import test from 'node:test';
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

test('RECOVERY 01 — clear-state invariant is empty logs plus default settings', () => {
  assert.deepEqual(normalizeLogs([]), []);
  assert.deepEqual(normalizeSettings({}, getDefaultSettings()), getDefaultSettings());
});

test('RECOVERY 02 — malformed log payload recovers without throwing', () => {
  const malformed = [null, undefined, 42, 'bad', {}];
  assert.doesNotThrow(() => normalizeLogs(malformed));
  assert.deepEqual(normalizeLogs(malformed), []);
});

test('RECOVERY 03 — malformed settings recover to the documented defaults', () => {
  const fallback = getDefaultSettings();
  assert.deepEqual(normalizeSettings(null, fallback), fallback);
  assert.deepEqual(normalizeSettings('invalid', fallback), fallback);
});

test('RECOVERY 04 — duplicate dates resolve deterministically to the last valid record', () => {
  const normalized = normalizeLogs([
    log('2026-01-01', 'Light'),
    log('2026-01-01', 'Heavy'),
  ]);
  assert.equal(normalized.length, 1);
  assert.deepEqual(normalized[0], log('2026-01-01', 'Heavy'));
});

test('RECOVERY 05 — valid history survives serialize → parse → normalize', () => {
  const history = [log('2026-01-01'), log('2026-01-29', 'Light')];
  const restored = normalizeLogs(JSON.parse(serializeLogs(history)));
  assert.deepEqual(restored, history);
});

test('RECOVERY 06 — valid settings survive serialize → parse → normalize', () => {
  const settings: CycleSettings = {
    startingCycleLength: 31,
    startingPeriodLength: 6,
  };
  const restored = normalizeSettings(JSON.parse(serializeSettings(settings)), getDefaultSettings());
  assert.deepEqual(restored, settings);
});
