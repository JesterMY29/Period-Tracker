import assert from 'node:assert/strict';
import test from 'node:test';
import { DayLog } from '../types';
import { detectPeriods, getCompletedCycles, getPrediction } from './cycleUtils';

const log = (date: string, flow: DayLog['flow'] = 'Medium'): DayLog => ({
  date,
  flow,
  symptoms: [],
});

const settings = { startingCycleLength: 28, startingPeriodLength: 5 };

test('SPEC 01 — no history produces no prediction', () => {
  assert.equal(getPrediction([], settings), null);
});

test('SPEC 02 — one period uses the configured starting baseline', () => {
  const prediction = getPrediction([log('2026-01-01')], settings);
  assert.ok(prediction);
  assert.equal(prediction.completedCycleCount, 0);
  assert.equal(prediction.cyclesUsed, 0);
  assert.equal(prediction.typicalCycleLength, 28);
  assert.equal(prediction.expectedStartDate, '2026-01-29');
  assert.equal(prediction.confidence, 'Low');
});

test('SPEC 03 — two period starts create exactly one completed cycle', () => {
  const logs = [log('2026-01-01'), log('2026-01-29')];
  const cycles = getCompletedCycles(logs);
  assert.deepEqual(cycles.map(cycle => cycle.length), [28]);
  const prediction = getPrediction(logs, settings);
  assert.ok(prediction);
  assert.equal(prediction.completedCycleCount, 1);
  assert.equal(prediction.typicalCycleLength, 28);
});

test('SPEC 04 — stable cycles produce a stable median baseline', () => {
  const starts = ['2026-01-01', '2026-01-29', '2026-02-26', '2026-03-26'];
  const prediction = getPrediction(starts.map(date => log(date)), settings);
  assert.ok(prediction);
  assert.equal(prediction.completedCycleCount, 3);
  assert.equal(prediction.cyclesUsed, 3);
  assert.equal(prediction.typicalCycleLength, 28);
  assert.equal(prediction.confidence, 'Moderate');
});

test('SPEC 05 — irregular cycles lower confidence without changing the median rule', () => {
  const starts = ['2026-01-01', '2026-01-24', '2026-02-29', '2026-03-25'];
  const prediction = getPrediction(starts.map(date => log(date)), settings);
  assert.ok(prediction);
  assert.equal(prediction.completedCycleCount, 3);
  assert.equal(prediction.typicalCycleLength, 32);
  assert.equal(prediction.confidence, 'Low');
});

test('SPEC 06 — one large outlier does not move the median baseline', () => {
  const starts = ['2026-01-01', '2026-01-29', '2026-02-26', '2026-03-26', '2026-04-23', '2026-05-21', '2026-07-20'];
  const prediction = getPrediction(starts.map(date => log(date)), settings);
  assert.ok(prediction);
  assert.equal(prediction.typicalCycleLength, 28);
  assert.equal(prediction.cycleLengthRange?.max, 60);
  assert.equal(prediction.confidence, 'Low');
});

test('SPEC 07 — one missing logging day does not split a period episode', () => {
  const periods = detectPeriods([log('2026-01-01'), log('2026-01-03')]);
  assert.deepEqual(periods, [{ startDate: '2026-01-01', endDate: '2026-01-03', length: 3 }]);
});

test('SPEC 08 — a long gap is preserved as elapsed cycle time, not fabricated away', () => {
  const cycles = getCompletedCycles([log('2026-01-01'), log('2026-01-03'), log('2026-04-01')]);
  assert.equal(cycles.length, 1);
  assert.equal(cycles[0].length, 90);
});

test('SPEC 09 — editing a historical period start changes the prediction anchor', () => {
  const before = getPrediction([log('2026-06-01'), log('2026-06-29')], settings);
  const after = getPrediction([log('2026-06-05'), log('2026-07-03')], settings);
  assert.ok(before);
  assert.ok(after);
  assert.notEqual(before.expectedStartDate, after.expectedStartDate);
  assert.equal(after.expectedStartDate, '2026-07-31');
});

test('SPEC 10 — deleting the historical period start removes the completed cycle it created', () => {
  const withHistory = [log('2026-01-01'), log('2026-01-29'), log('2026-02-26')];
  const afterDeletion = [log('2026-01-01'), log('2026-02-26')];
  assert.equal(getCompletedCycles(withHistory).length, 2);
  assert.equal(getCompletedCycles(afterDeletion).length, 1);
  assert.equal(getCompletedCycles(afterDeletion)[0].length, 56);
});

test('SPEC 11 — six consistent completed cycles reach high confidence', () => {
  const starts = ['2026-01-01', '2026-01-29', '2026-02-26', '2026-03-26', '2026-04-23', '2026-05-21', '2026-06-18'];
  const prediction = getPrediction(starts.map(date => log(date)), settings);
  assert.ok(prediction);
  assert.equal(prediction.completedCycleCount, 6);
  assert.equal(prediction.cyclesUsed, 6);
  assert.equal(prediction.confidence, 'High');
  assert.equal(prediction.marginDays, 2);
});

test('SPEC 12 — prediction honors the validated baseline boundaries', () => {
  const minimum = getPrediction([log('2026-01-01')], { startingCycleLength: 15, startingPeriodLength: 1 });
  const maximum = getPrediction([log('2026-01-01')], { startingCycleLength: 90, startingPeriodLength: 14 });
  assert.ok(minimum);
  assert.ok(maximum);
  assert.equal(minimum.expectedStartDate, '2026-01-16');
  assert.equal(maximum.expectedStartDate, '2026-04-01');
});
