import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeLogs, normalizeSettings } from './dataValidation';

test('normalizeLogs removes malformed entries and sorts valid logs', () => {
  const logs = normalizeLogs([
    { date: '2026-08-03', flow: 'Light', symptoms: ['Cramps'] },
    { date: 'not-a-date', flow: 'Heavy', symptoms: [] },
    { date: '2026-08-01', flow: 'Medium', symptoms: ['Cramps', 'Cramps'] },
    { date: '2026-08-02', flow: 'Invalid', symptoms: [] },
    { date: '2026-08-03', flow: 'Heavy', symptoms: [], notes: 'Updated entry' },
  ]);

  assert.deepEqual(logs, [
    { date: '2026-08-01', flow: 'Medium', symptoms: ['Cramps'] },
    { date: '2026-08-03', flow: 'Heavy', symptoms: [], notes: 'Updated entry' },
  ]);
});

test('normalizeLogs validates calendar dates without timezone dependence', () => {
  const logs = normalizeLogs([
    { date: '2024-02-29', flow: 'Light', symptoms: [] },
    { date: '2026-02-29', flow: 'Light', symptoms: [] },
    { date: '2026-04-31', flow: 'Light', symptoms: [] },
    { date: '2026-13-01', flow: 'Light', symptoms: [] },
    { date: '2026-00-10', flow: 'Light', symptoms: [] },
  ]);

  assert.deepEqual(logs, [
    { date: '2024-02-29', flow: 'Light', symptoms: [] },
  ]);
});

test('normalizeSettings accepts the exact UI contract boundaries', () => {
  const defaults = { startingCycleLength: 28, startingPeriodLength: 5 };

  assert.deepEqual(normalizeSettings({ startingCycleLength: 15, startingPeriodLength: 1 }, defaults), {
    startingCycleLength: 15,
    startingPeriodLength: 1,
  });
  assert.deepEqual(normalizeSettings({ startingCycleLength: 90, startingPeriodLength: 14 }, defaults), {
    startingCycleLength: 90,
    startingPeriodLength: 14,
  });
});

test('normalizeSettings rejects values outside the UI contract', () => {
  const defaults = { startingCycleLength: 28, startingPeriodLength: 5 };

  assert.deepEqual(normalizeSettings({ startingCycleLength: 14, startingPeriodLength: 5 }, defaults), defaults);
  assert.deepEqual(normalizeSettings({ startingCycleLength: 91, startingPeriodLength: 5 }, defaults), defaults);
  assert.deepEqual(normalizeSettings({ startingCycleLength: 28, startingPeriodLength: 0 }, defaults), defaults);
  assert.deepEqual(normalizeSettings({ startingCycleLength: 28, startingPeriodLength: 15 }, defaults), defaults);
});

test('normalizeSettings rounds valid fractional values consistently', () => {
  const defaults = { startingCycleLength: 28, startingPeriodLength: 5 };

  assert.deepEqual(normalizeSettings({ startingCycleLength: 31.6, startingPeriodLength: 6.4 }, defaults), {
    startingCycleLength: 32,
    startingPeriodLength: 6,
  });
});
