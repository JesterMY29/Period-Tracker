import assert from 'node:assert/strict';
import test from 'node:test';
import { createBackup, normalizeLogs, normalizeSettings, parseBackup, serializeBackup } from './dataValidation';

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

test('createBackup produces a versioned deterministic backup envelope', () => {
  const settings = { startingCycleLength: 28, startingPeriodLength: 5 };
  const logs = [
    { date: '2026-08-03', flow: 'Light' as const, symptoms: ['Cramps' as const] },
    { date: '2026-08-01', flow: 'Medium' as const, symptoms: [] },
  ];

  assert.deepEqual(createBackup(settings, logs, '2026-08-17T00:00:00.000Z'), {
    format: 'auracycle-backup',
    version: 1,
    exportedAt: '2026-08-17T00:00:00.000Z',
    settings,
    logs: [
      { date: '2026-08-01', flow: 'Medium', symptoms: [] },
      { date: '2026-08-03', flow: 'Light', symptoms: ['Cramps'] },
    ],
  });
});

test('serializeBackup round-trips through strict validation', () => {
  const settings = { startingCycleLength: 30, startingPeriodLength: 6 };
  const logs = [{ date: '2026-08-10', flow: 'Heavy' as const, symptoms: [], notes: 'Recorded' }];
  const parsed = parseBackup(JSON.parse(serializeBackup(settings, logs, '2026-08-17T00:00:00.000Z')));

  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.legacy, false);
    assert.deepEqual(parsed.backup.settings, settings);
    assert.deepEqual(parsed.backup.logs, logs);
  }
});

test('parseBackup rejects unsupported backup versions before import', () => {
  const result = parseBackup({
    format: 'auracycle-backup',
    version: 999,
    exportedAt: '2026-08-17T00:00:00.000Z',
    settings: { startingCycleLength: 28, startingPeriodLength: 5 },
    logs: [],
  });

  assert.deepEqual(result, { ok: false, error: 'unsupported-version' });
});

test('parseBackup rejects invalid settings without normalization', () => {
  const result = parseBackup({
    format: 'auracycle-backup',
    version: 1,
    exportedAt: '2026-08-17T00:00:00.000Z',
    settings: { startingCycleLength: 91, startingPeriodLength: 5 },
    logs: [],
  });

  assert.deepEqual(result, { ok: false, error: 'invalid-settings' });
});

test('parseBackup rejects a single malformed log instead of partially restoring', () => {
  const result = parseBackup({
    format: 'auracycle-backup',
    version: 1,
    exportedAt: '2026-08-17T00:00:00.000Z',
    settings: { startingCycleLength: 28, startingPeriodLength: 5 },
    logs: [
      { date: '2026-08-01', flow: 'Light', symptoms: [] },
      { date: '2026-08-02', flow: 'NotAFlow', symptoms: [] },
    ],
  });

  assert.deepEqual(result, { ok: false, error: 'invalid-logs' });
});

test('parseBackup accepts the previous unversioned backup shape as a validated legacy backup', () => {
  const result = parseBackup({
    settings: { startingCycleLength: 28, startingPeriodLength: 5 },
    logs: [{ date: '2026-08-01', flow: 'Light', symptoms: [] }],
  });

  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.legacy, true);
});

test('parseBackup rejects an invalid exported timestamp', () => {
  const result = parseBackup({
    format: 'auracycle-backup',
    version: 1,
    exportedAt: 'not-a-timestamp',
    settings: { startingCycleLength: 28, startingPeriodLength: 5 },
    logs: [],
  });

  assert.deepEqual(result, { ok: false, error: 'invalid-exported-at' });
});
