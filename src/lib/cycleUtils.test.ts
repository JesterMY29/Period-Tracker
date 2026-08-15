import assert from 'node:assert/strict';
import test from 'node:test';
import { DayLog } from '../types';
import { detectPeriods, getCompletedCycles, getPrediction } from './cycleUtils';

const log = (date: string, flow: DayLog['flow']): DayLog => ({
  date,
  flow,
  symptoms: [],
});

test('detectPeriods groups a single missed logging day into one period', () => {
  const logs = [
    log('2026-01-01', 'Medium'),
    log('2026-01-02', 'Heavy'),
    log('2026-01-04', 'Light'),
    log('2026-01-30', 'Medium'),
  ];

  assert.deepEqual(detectPeriods(logs), [
    { startDate: '2026-01-01', endDate: '2026-01-04', length: 4 },
    { startDate: '2026-01-30', endDate: '2026-01-30', length: 1 },
  ]);
});

test('getCompletedCycles measures cycle length from period start to next start', () => {
  const logs = [
    log('2026-01-01', 'Medium'),
    log('2026-01-29', 'Medium'),
    log('2026-02-26', 'Medium'),
  ];

  assert.deepEqual(getCompletedCycles(logs).map(cycle => cycle.length), [28, 28]);
});

test('prediction uses the median of recent cycles instead of an outlier-sensitive average', () => {
  const starts = ['2026-01-01', '2026-01-29', '2026-02-26', '2026-03-26', '2026-04-25'];
  const logs = starts.map(date => log(date, 'Medium'));
  const prediction = getPrediction(logs, { startingCycleLength: 28, startingPeriodLength: 5 });

  assert.ok(prediction);
  assert.equal(prediction.typicalCycleLength, 28);
  assert.equal(prediction.completedCycleCount, 4);
  assert.equal(prediction.cyclesUsed, 4);
  assert.equal(prediction.confidence, 'Moderate');
});

test('prediction starts with a transparent low-confidence baseline when history is insufficient', () => {
  const prediction = getPrediction(
    [log('2026-08-01', 'Medium')],
    { startingCycleLength: 28, startingPeriodLength: 5 },
  );

  assert.ok(prediction);
  assert.equal(prediction.typicalCycleLength, 28);
  assert.equal(prediction.confidence, 'Low');
  assert.equal(prediction.cyclesUsed, 0);
  assert.equal(prediction.label, 'Building your baseline');
});
