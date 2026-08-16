import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeLogs,
  normalizeSettings,
  serializeLogs,
  serializeSettings,
} from './dataValidation';

test('PERSISTENCE 01 — logs survive serialize/parse round-trip', () => {
  const logs = [
    { date: '2026-08-10', flow: 'Medium' as const, symptoms: ['Cramps' as const] },
    { date: '2026-08-12', flow: 'Light' as const, symptoms: [], notes: 'Updated entry' },
  ];

  const restored = normalizeLogs(JSON.parse(serializeLogs(logs)));
  assert.deepEqual(restored, logs);
});

test('PERSISTENCE 02 — settings survive serialize/parse round-trip', () => {
  const settings = { startingCycleLength: 28, startingPeriodLength: 5 };
  const restored = normalizeSettings(JSON.parse(serializeSettings(settings)), {
    startingCycleLength: 28,
    startingPeriodLength: 5,
  });
  assert.deepEqual(restored, settings);
});

test('PERSISTENCE 03 — duplicate log dates resolve deterministically', () => {
  const restored = normalizeLogs([
    { date: '2026-08-10', flow: 'Light', symptoms: [] },
    { date: '2026-08-10', flow: 'Heavy', symptoms: [], notes: 'latest entry' },
  ]);

  assert.deepEqual(restored, [
    { date: '2026-08-10', flow: 'Heavy', symptoms: [], notes: 'latest entry' },
  ]);
});

test('PERSISTENCE 04 — malformed log payload recovers to an empty record', () => {
  assert.deepEqual(normalizeLogs(null), []);
  assert.deepEqual(normalizeLogs('not-json'), []);
  assert.deepEqual(normalizeLogs([{ date: 'bad-date', flow: 'Heavy', symptoms: [] }]), []);
});

test('PERSISTENCE 05 — malformed settings recover to the supplied defaults', () => {
  const defaults = { startingCycleLength: 28, startingPeriodLength: 5 };

  assert.deepEqual(normalizeSettings(null, defaults), defaults);
  assert.deepEqual(normalizeSettings({ startingCycleLength: 91, startingPeriodLength: 5 }, defaults), defaults);
  assert.deepEqual(normalizeSettings({ startingCycleLength: 28, startingPeriodLength: 15 }, defaults), defaults);
});

test('PERSISTENCE 06 — clean state is empty logs plus default settings', () => {
  const defaults = { startingCycleLength: 28, startingPeriodLength: 5 };

  assert.deepEqual(normalizeLogs([]), []);
  assert.deepEqual(normalizeSettings(defaults, defaults), defaults);
});
