import { DayLog, CycleSettings, DetectedPeriod, CompletedCycle, PredictionResult, PredictionConfidence } from '../types';

export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function getDaysDifference(d1Str: string, d2Str: string): number {
  const d1 = parseDate(d1Str);
  const d2 = parseDate(d2Str);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 3600 * 24));
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const PERIOD_GAP_DAYS = 2;

// Treat contiguous flow entries, plus a single missed logging day, as one period block.
// This keeps ordinary logging gaps from fragmenting a period while still requiring
// a meaningful gap before starting a new period.
export function detectPeriods(logs: DayLog[]): DetectedPeriod[] {
  const flowLogs = logs
    .filter(l => l.flow && l.flow !== 'None')
    .sort((a, b) => a.date.localeCompare(b.date));

  if (flowLogs.length === 0) return [];

  const periods: DetectedPeriod[] = [];
  let currentStart = flowLogs[0].date;
  let currentEnd = flowLogs[0].date;

  for (let i = 1; i < flowLogs.length; i++) {
    const currDate = flowLogs[i].date;
    const gap = getDaysDifference(currentEnd, currDate);

    if (gap > 0 && gap <= PERIOD_GAP_DAYS) {
      currentEnd = currDate;
      continue;
    }

    if (gap > PERIOD_GAP_DAYS) {
      periods.push({
        startDate: currentStart,
        endDate: currentEnd,
        length: getDaysDifference(currentStart, currentEnd) + 1,
      });
      currentStart = currDate;
      currentEnd = currDate;
    }
  }

  periods.push({
    startDate: currentStart,
    endDate: currentEnd,
    length: getDaysDifference(currentStart, currentEnd) + 1,
  });

  return periods;
}

export function getCompletedCycles(logs: DayLog[]): CompletedCycle[] {
  const periods = detectPeriods(logs);
  if (periods.length < 2) return [];

  const cycles: CompletedCycle[] = [];
  for (let i = 0; i < periods.length - 1; i++) {
    const start = periods[i].startDate;
    const nextStart = periods[i + 1].startDate;
    const cycleLength = getDaysDifference(start, nextStart);

    if (cycleLength > 0) {
      cycles.push({
        startDate: start,
        nextStartDate: nextStart,
        length: cycleLength,
        periodLength: periods[i].length,
      });
    }
  }

  return cycles;
}

function getMedian(numbers: number[]): number {
  if (numbers.length === 0) return 28;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

function getMedianAbsoluteDeviation(numbers: number[], median: number): number {
  if (numbers.length === 0) return 0;
  return getMedian(numbers.map(value => Math.abs(value - median)));
}

function getPredictionConfidence(cycleCount: number, variation: number): PredictionConfidence {
  if (cycleCount >= 6 && variation <= 4) return 'High';
  if (cycleCount >= 3 && variation <= 6) return 'Moderate';
  return 'Low';
}

function calculatePredictionMargin(cycleLengths: number[]): number {
  if (cycleLengths.length <= 1) return 3;

  const median = getMedian(cycleLengths);
  const mad = getMedianAbsoluteDeviation(cycleLengths, median);
  const range = Math.max(...cycleLengths) - Math.min(...cycleLengths);

  // Median/MAD is more resistant to a single unusual cycle than an average.
  // The range still contributes a small amount when the history is genuinely variable.
  const robustSpread = Math.ceil(mad * 1.5);
  const rangeContribution = Math.ceil(range / 4);
  return Math.min(7, Math.max(2, robustSpread, rangeContribution));
}

export function getPrediction(logs: DayLog[], settings: CycleSettings): PredictionResult | null {
  const periods = detectPeriods(logs);
  if (periods.length === 0) return null;

  const completedCycles = getCompletedCycles(logs);
  const lastPeriodStart = periods[periods.length - 1].startDate;

  let expectedLength = settings.startingCycleLength || 28;
  let marginDays = 3;
  let label: PredictionResult['label'] = 'Building your baseline';
  let cyclesUsed = 0;

  if (completedCycles.length === 0) {
    expectedLength = settings.startingCycleLength || 28;
  } else {
    const recentCycles = completedCycles.slice(-6);
    const lengths = recentCycles.map(c => c.length);
    cyclesUsed = lengths.length;
    expectedLength = getMedian(lengths);
    marginDays = calculatePredictionMargin(lengths);
    label = completedCycles.length <= 3
      ? 'Early estimate'
      : 'Based on your recent cycle history';
  }

  const recentLengths = completedCycles.slice(-6).map(c => c.length);
  const variation = recentLengths.length > 1
    ? Math.max(...recentLengths) - Math.min(...recentLengths)
    : 0;
  const confidence = getPredictionConfidence(completedCycles.length, variation);
  const cycleLengthRange = recentLengths.length > 0
    ? { min: Math.min(...recentLengths), max: Math.max(...recentLengths) }
    : null;

  const expectedStartDate = addDays(lastPeriodStart, expectedLength);
  const predictedWindowStart = addDays(expectedStartDate, -marginDays);
  const predictedWindowEnd = addDays(expectedStartDate, marginDays);

  return {
    predictedWindowStart,
    predictedWindowEnd,
    expectedStartDate,
    marginDays,
    label,
    confidence,
    completedCycleCount: completedCycles.length,
    cyclesUsed,
    typicalCycleLength: expectedLength,
    cycleLengthRange,
  };
}

export function calculateSymptomFrequencies(logs: DayLog[]) {
  const map: Record<string, number> = {};
  logs.forEach(log => {
    (log.symptoms || []).forEach(symptom => {
      map[symptom] = (map[symptom] || 0) + 1;
    });
  });

  return Object.entries(map)
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count);
}

export function calculateMoodFrequencies(logs: DayLog[]) {
  const map: Record<string, number> = {};
  logs.forEach(log => {
    if (log.mood) {
      map[log.mood] = (map[log.mood] || 0) + 1;
    }
  });

  return Object.entries(map)
    .map(([mood, count]) => ({ mood, count }))
    .sort((a, b) => b.count - a.count);
}
