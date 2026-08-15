import assert from 'node:assert/strict';
import test from 'node:test';
import { DayLog } from '../types';
import { detectPeriods, getCompletedCycles, getPrediction } from './cycleUtils';

const log = (date: string, flow: DayLog['flow'] = 'Medium'): DayLog => ({
  date,
  flow,
  symptoms: [],
});

test('empty and non-flow logs produce no periods', () => {
  assert.deepEqual(detectPeriods([]), []);
  assert.deepEqual(detectPeriods([
    log('2026-01-01', 'None'),
    log('2026-01-02', 'None'),
  ]), []);
});

test('duplicate dates do not create artificial cycle length', () => {
  const periods = detectPeriods([
    log('2026-01-01', 'Medium'),
    log('2026-01-01', 'Heavy'),
    log('2026-01-02', 'Light'),
    log('2026-01-29', 'Medium'),
  ]);

  assert.equal(periods.length, 2);
  assert.equal(periods[0].startDate, '2026-01-01');
  assert.equal(periods[0].endDate, '2026-01-02');
  assert.equal(getCompletedCycles([
    log('2026-01-01', 'Medium'),
    log('2026-01-01', 'Heavy'),
    log('2026-01-02', 'Light'),
    log('2026-01-29', 'Medium'),
  ])[0].length, 28);
});

test('one missed calendar day stays inside the same period episode', () => {
  const periods = detectPeriods([
    log('2026-01-01'),
    log('2026-01-03'),
  ]);

  assert.equal(periods.length, 1);
  assert.deepEqual(periods[0], {
    startDate: '2026-01-01',
    endDate: '2026-01-03',
    length: 3,
  });
});

test('two missed calendar days start a new period episode', () => {
  const periods = detectPeriods([
    log('2026-01-01'),
    log('2026-01-04'),
  ]);

  assert.equal(periods.length, 2);
  assert.deepEqual(periods[0], {
    startDate: '2026-01-01',
    endDate: '2026-01-01',
    length: 1,
  });
  assert.deepEqual(periods[1], {
    startDate: '2026-01-04',
    endDate: '2026-01-04',
    length: 1,
  });
});

test('separate episodes still produce separate completed cycles', () => {
  const logs = [
    log('2026-01-01'),
    log('2026-01-04'),
    log('2026-01-30'),
  ];

  const periods = detectPeriods(logs);
  const cycles = getCompletedCycles(logs);

  assert.equal(periods.length, 3);
  assert.deepEqual(periods.map(period => period.startDate), [
    '2026-01-01',
    '2026-01-04',
    '2026-01-30',
  ]);
  assert.deepEqual(cycles.map(cycle => cycle.length), [3, 26]);
});

test('long gaps are preserved rather than fabricated into extra cycles', () => {
  const cycles = getCompletedCycles([
    log('2026-01-01'),
    log('2026-01-03'),
    log('2026-04-01'),
  ]);

  assert.equal(cycles.length, 1);
  assert.equal(cycles[0].length, 90);
});

test('prediction recalculates from recent cycles and resists one large outlier', () => {
  const starts = [
    '2026-01-01',
    '2026-01-29',
    '2026-02-26',
    '2026-03-26',
    '2026-04-23',
    '2026-05-21',
    '2026-07-20',
  ];

  const prediction = getPrediction(
    starts.map(date => log(date)),
    { startingCycleLength: 28, startingPeriodLength: 5 },
  );

  assert.ok(prediction);
  assert.equal(prediction.cyclesUsed, 6);
  assert.equal(prediction.typicalCycleLength, 28);
  assert.equal(prediction.confidence, 'Low');
  assert.equal(prediction.cycleLengthRange?.max, 60);
});

test('six consistent completed cycles reach high confidence', () => {
  const starts = [
    '2026-01-01',
    '2026-01-29',
    '2026-02-26',
    '2026-03-26',
    '2026-04-23',
    '2026-05-21',
    '2026-06-18',
  ];

  const prediction = getPrediction(
    starts.map(date => log(date)),
    { startingCycleLength: 28, startingPeriodLength: 5 },
  );

  assert.ok(prediction);
  assert.equal(prediction.completedCycleCount, 6);
  assert.equal(prediction.cyclesUsed, 6);
  assert.equal(prediction.typicalCycleLength, 28);
  assert.equal(prediction.marginDays, 2);
  assert.equal(prediction.confidence, 'High');
});

test('editing the latest period start changes the prediction anchor', () => {
  const before = getPrediction([
    log('2026-06-01'),
    log('2026-06-29'),
  ], { startingCycleLength: 28, startingPeriodLength: 5 });

  const after = getPrediction([
    log('2026-06-05'),
    log('2026-07-03'),
  ], { startingCycleLength: 28, startingPeriodLength: 5 });

  assert.ok(before);
  assert.ok(after);
  assert.notEqual(before.expectedStartDate, after.expectedStartDate);
  assert.equal(after.expectedStartDate, '2026-07-31');
});

test('out-of-order input is normalized by the cycle engine', () => {
  const cycles = getCompletedCycles([
    log('2026-02-26'),
    log('2026-01-01'),
    log('2026-01-29'),
  ]);

  assert.deepEqual(cycles.map(cycle => cycle.length), [28, 28]);
});
