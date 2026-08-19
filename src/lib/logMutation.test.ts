import assert from 'node:assert/strict';
import test from 'node:test';
import type { DayLog } from '../types';
import { replaceDayLog } from './logMutation';

const log = (date: string, flow: DayLog['flow'] = 'Medium'): DayLog => ({
  date,
  flow,
  symptoms: [],
});

test('P2L-01 — moving an edited record removes the stale original date', () => {
  const history = [log('2026-08-10', 'Light'), log('2026-08-20', 'Heavy')];
  const updated = replaceDayLog(history, log('2026-08-11', 'Medium'), '2026-08-10');

  assert.deepEqual(updated, [log('2026-08-11', 'Medium'), log('2026-08-20', 'Heavy')]);
});

test('P2L-02 — moving an edited record does not silently leave two copies', () => {
  const history = [log('2026-08-10', 'Light')];
  const updated = replaceDayLog(history, log('2026-08-11', 'Heavy'), '2026-08-10');

  assert.equal(updated.some(item => item.date === '2026-08-10'), false);
  assert.equal(updated.filter(item => item.date === '2026-08-11').length, 1);
});

test('P2L-03 — saving without a date move still replaces the existing date deterministically', () => {
  const history = [log('2026-08-10', 'Light'), log('2026-08-20', 'Heavy')];
  const updated = replaceDayLog(history, log('2026-08-10', 'Spotting'), '2026-08-10');

  assert.deepEqual(updated, [log('2026-08-10', 'Spotting'), log('2026-08-20', 'Heavy')]);
});
