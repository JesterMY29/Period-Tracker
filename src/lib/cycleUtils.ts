import { CyclePhase, DayLog, PhaseInfo } from '../types';

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

export function getCycleDetails(
  targetDateStr: string,
  lastPeriodStartDateStr: string,
  avgCycleLength: number = 28
) {
  const daysDiff = getDaysDifference(lastPeriodStartDateStr, targetDateStr);
  
  // Calculate cycle offset
  let cycleIndex = Math.floor(daysDiff / avgCycleLength);
  if (daysDiff < 0) {
    cycleIndex = Math.floor(daysDiff / avgCycleLength);
  }

  const currentCycleStart = addDays(lastPeriodStartDateStr, cycleIndex * avgCycleLength);
  const nextPeriodStart = addDays(currentCycleStart, avgCycleLength);
  
  const cycleDay = getDaysDifference(currentCycleStart, targetDateStr) + 1;
  const ovulationDayNum = avgCycleLength - 14;
  const ovulationDate = addDays(currentCycleStart, ovulationDayNum - 1);
  const fertileStart = addDays(ovulationDate, -4);
  const fertileEnd = addDays(ovulationDate, 1);

  return {
    cycleDay,
    currentCycleStart,
    nextPeriodStart,
    daysUntilNextPeriod: getDaysDifference(targetDateStr, nextPeriodStart),
    ovulationDate,
    fertileStart,
    fertileEnd,
    isFertileWindow: targetDateStr >= fertileStart && targetDateStr <= fertileEnd,
    isOvulationDay: targetDateStr === ovulationDate,
  };
}

export function getPhaseInfo(
  cycleDay: number,
  avgCycleLength: number = 28,
  avgPeriodLength: number = 5
): PhaseInfo {
  const ovulationDayNum = Math.max(12, avgCycleLength - 14);
  
  if (cycleDay <= avgPeriodLength) {
    return {
      phase: 'Menstrual',
      dayInPhase: cycleDay,
      totalPhaseDays: avgPeriodLength,
      description: 'Your uterus sheds its lining. Estrogen and progesterone levels are at their lowest.',
      energyLevel: 'Low',
      hormoneSummary: 'Low Estrogen & Progesterone',
    };
  } else if (cycleDay < ovulationDayNum - 1) {
    const totalFollicular = (ovulationDayNum - 1) - avgPeriodLength;
    const dayInFollicular = cycleDay - avgPeriodLength;
    return {
      phase: 'Follicular',
      dayInPhase: dayInFollicular,
      totalPhaseDays: Math.max(1, totalFollicular),
      description: 'Follicle Stimulating Hormone (FSH) prompts egg development. Estrogen rises, boosting mood and mental stamina.',
      energyLevel: 'Rising',
      hormoneSummary: 'Rising Estrogen, Low Progesterone',
    };
  } else if (cycleDay <= ovulationDayNum + 1) {
    const dayInOvulation = cycleDay - (ovulationDayNum - 2);
    return {
      phase: 'Ovulatory',
      dayInPhase: Math.min(3, Math.max(1, dayInOvulation)),
      totalPhaseDays: 3,
      description: 'A Luteinizing Hormone (LH) surge triggers the release of a mature egg. Peak fertility and social energy window.',
      energyLevel: 'Peak',
      hormoneSummary: 'Peak Estrogen & LH Surge',
    };
  } else {
    const dayInLuteal = cycleDay - (ovulationDayNum + 1);
    const totalLuteal = avgCycleLength - (ovulationDayNum + 1);
    return {
      phase: 'Luteal',
      dayInPhase: Math.max(1, dayInLuteal),
      totalPhaseDays: Math.max(1, totalLuteal),
      description: 'Progesterone climbs to prepare the body for potential pregnancy. Energy shifts inward and pre-menstrual symptoms may manifest.',
      energyLevel: 'Waning',
      hormoneSummary: 'High Progesterone, Gradual Decline',
    };
  }
}

// Derive historical cycle lengths from logged period days
export function analyzePastCycles(logs: DayLog[]) {
  // Sort logs by date
  const periodLogs = logs
    .filter(l => l.flow === 'Heavy' || l.flow === 'Medium' || l.flow === 'Light')
    .map(l => l.date)
    .sort();

  if (periodLogs.length === 0) return [];

  // Group continuous period days into distinct period starts
  const periodStartDates: string[] = [];
  let prevDate: string | null = null;

  for (const dateStr of periodLogs) {
    if (!prevDate || getDaysDifference(prevDate, dateStr) > 2) {
      periodStartDates.push(dateStr);
    }
    prevDate = dateStr;
  }

  const cycleStats = [];
  for (let i = 0; i < periodStartDates.length - 1; i++) {
    const start = periodStartDates[i];
    const nextStart = periodStartDates[i + 1];
    const length = getDaysDifference(start, nextStart);
    cycleStats.push({
      startDate: start,
      endDate: nextStart,
      length,
    });
  }

  return cycleStats;
}

export function calculateSymptomFrequencies(logs: DayLog[]) {
  const map: Record<string, number> = {};
  logs.forEach(log => {
    log.symptoms.forEach(symptom => {
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
    log.moods.forEach(mood => {
      map[mood] = (map[mood] || 0) + 1;
    });
  });

  return Object.entries(map)
    .map(([mood, count]) => ({ mood, count }))
    .sort((a, b) => b.count - a.count);
}
