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

test('normalizeSettings clamps invalid imported values to safe defaults', () => {
  const defaults = { startingCycleLength: 28, startingPeriodLength: 5 };

  assert.deepEqual(normalizeSettings({ startingCycleLength: 200, startingPeriodLength: 0 }, defaults), defaults);
  assert.deepEqual(normalizeSettings({ startingCycleLength: 31.6, startingPeriodLength: 6.4 }, defaults), {
    startingCycleLength: 32,
    startingPeriodLength: 6,
  });
});
