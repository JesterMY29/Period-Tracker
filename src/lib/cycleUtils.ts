import { DayLog, CycleSettings, DetectedPeriod, CompletedCycle, PredictionResult } from '../types';

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

// Detect period blocks from non-None flow entries
export function detectPeriods(logs: DayLog[]): DetectedPeriod[] {
  // Filter logs with non-None flow
  const flowLogs = logs
    .filter(l => l.flow && l.flow !== 'None')
    .sort((a, b) => a.date.localeCompare(b.date));

  if (flowLogs.length === 0) return [];

  const periods: DetectedPeriod[] = [];
  let currentStart = flowLogs[0].date;
  let currentEnd = flowLogs[0].date;

  for (let i = 1; i < flowLogs.length; i++) {
    const prevDate = flowLogs[i - 1].date;
    const currDate = flowLogs[i].date;
    const gap = getDaysDifference(prevDate, currDate);

    // If flow days are contiguous or separated by at most 1 missed day (gap <= 2)
    if (gap <= 2) {
      currentEnd = currDate;
    } else {
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

// Calculate completed cycles from period start dates
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
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

function calculateMargin(cycleLengths: number[]): number {
  if (cycleLengths.length <= 1) return 3;
  const min = Math.min(...cycleLengths);
  const max = Math.max(...cycleLengths);
  const range = max - min;
  const calculated = Math.round(range / 2);
  // Constrain margin width to ±2 through ±5
  return Math.min(5, Math.max(2, calculated || 3));
}

export function getPrediction(logs: DayLog[], settings: CycleSettings): PredictionResult | null {
  const periods = detectPeriods(logs);
  if (periods.length === 0) {
    return null; // No logged periods = no prediction
  }

  const completedCycles = getCompletedCycles(logs);
  const lastPeriodStart = periods[periods.length - 1].startDate;

  let expectedLength = settings.startingCycleLength || 28;
  let marginDays = 3;
  let label: 'Building your baseline' | 'Early estimate' | 'Based on your recent cycle history' = 'Building your baseline';

  if (completedCycles.length === 0) {
    // 0 completed cycles: use configured starting estimate, ±3 days
    expectedLength = settings.startingCycleLength || 28;
    marginDays = 3;
    label = 'Building your baseline';
  } else if (completedCycles.length <= 3) {
    // 1-3 completed cycles: median cycle length, label "Early estimate"
    const lengths = completedCycles.map(c => c.length);
    expectedLength = getMedian(lengths);
    marginDays = calculateMargin(lengths);
    label = 'Early estimate';
  } else {
    // 4+ completed cycles: median of up to 6 most recent completed cycles
    const recentCycles = completedCycles.slice(-6);
    const lengths = recentCycles.map(c => c.length);
    expectedLength = getMedian(lengths);
    marginDays = calculateMargin(lengths);
    label = 'Based on your recent cycle history';
  }

  const expectedStartDate = addDays(lastPeriodStart, expectedLength);
  const predictedWindowStart = addDays(expectedStartDate, -marginDays);
  const predictedWindowEnd = addDays(expectedStartDate, marginDays);

  return {
    predictedWindowStart,
    predictedWindowEnd,
    expectedStartDate,
    marginDays,
    label,
    completedCycleCount: completedCycles.length,
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
