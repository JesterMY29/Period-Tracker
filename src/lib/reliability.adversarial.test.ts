import assert from 'node:assert/strict';
import test from 'node:test';
import { DayLog } from '../types';
import { getPrediction } from './cycleUtils';
import { normalizeLogs, normalizeSettings, parseBackup } from './dataValidation';

const log = (date: string, flow: DayLog['flow'] = 'Medium'): DayLog => ({
  date,
  flow,
  symptoms: [],
});

const settings = { startingCycleLength: 28, startingPeriodLength: 5 };

function dateOffset(start: string, offset: number): string {
  const date = new Date(`${start}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

test('ADVERSARIAL 01 — normalization handles a large valid history without dropping unique dates', () => {
  const input = Array.from({ length: 5000 }, (_, index) => log(dateOffset('2020-01-01', index)));
  const normalized = normalizeLogs(input);

  assert.equal(normalized.length, 5000);
  assert.equal(normalized[0].date, '2020-01-01');
  assert.equal(normalized.at(-1)?.date, dateOffset('2020-01-01', 4999));
});

test('ADVERSARIAL 02 — duplicate dates collapse during normalization but are rejected by strict backup import', () => {
  const duplicateLogs = [
    log('2026-08-01', 'Light'),
    log('2026-08-01', 'Heavy'),
  ];

  const normalized = normalizeLogs(duplicateLogs);
  assert.equal(normalized.length, 1);
  assert.equal(normalized[0].flow, 'Heavy');

  const result = parseBackup({
    format: 'auracycle-backup',
    version: 1,
    exportedAt: '2026-08-17T00:00:00.000Z',
    settings,
    logs: duplicateLogs,
  });

  assert.deepEqual(result, { ok: false, error: 'invalid-logs' });
});

test('ADVERSARIAL 03 — hostile numeric settings never produce non-finite or out-of-range state', () => {
  assert.deepEqual(normalizeSettings({ startingCycleLength: Number.POSITIVE_INFINITY, startingPeriodLength: 5 }, settings), settings);
  assert.deepEqual(normalizeSettings({ startingCycleLength: Number.NaN, startingPeriodLength: 5 }, settings), settings);
  assert.deepEqual(normalizeSettings({ startingCycleLength: 28, startingPeriodLength: Number.NEGATIVE_INFINITY }, settings), settings);
});

test('ADVERSARIAL 04 — malformed log containers are rejected instead of throwing', () => {
  const result = parseBackup({
    format: 'auracycle-backup',
    version: 1,
    exportedAt: '2026-08-17T00:00:00.000Z',
    settings,
    logs: [null, 42, 'not-a-log', { date: '2026-08-01', flow: 'Light', symptoms: 'not-an-array' }],
  });

  assert.deepEqual(result, { ok: false, error: 'invalid-logs' });
});

test('ADVERSARIAL 05 — normalization does not mutate the caller-owned history', () => {
  const input = [log('2026-08-02', 'Medium')];
  const snapshot = JSON.stringify(input);

  normalizeLogs(input);

  assert.equal(JSON.stringify(input), snapshot);
});

test('ADVERSARIAL 06 — prediction remains deterministic across a long but valid history', () => {
  const starts = [
    '2025-01-01',
    '2025-01-29',
    '2025-02-26',
    '2025-03-26',
    '2025-04-23',
    '2025-05-21',
    '2025-06-18',
    '2025-07-16',
    '2025-08-13',
    '2025-09-10',
  ];

  const first = getPrediction(starts.map(date => log(date)), settings);
  const second = getPrediction(starts.map(date => log(date)), settings);

  assert.ok(first);
  assert.deepEqual(second, first);
  assert.equal(first?.typicalCycleLength, 28);
});
