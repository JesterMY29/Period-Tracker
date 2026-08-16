import { CycleSettings, DayLog, FlowLevel, MoodType, SymptomType } from '../types';

const FLOW_LEVELS: FlowLevel[] = ['None', 'Spotting', 'Light', 'Medium', 'Heavy'];
const MOODS: MoodType[] = ['Great', 'Good', 'Neutral', 'Low', 'Difficult'];
const SYMPTOMS: SymptomType[] = [
  'Cramps',
  'Bloating',
  'Headache',
  'Fatigue',
  'Breast tenderness',
  'Back pain',
  'Nausea',
  'Acne',
  'Other',
];

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isOneOf<T extends string>(value: unknown, values: readonly T[]): value is T {
  return typeof value === 'string' && values.includes(value as T);
}

function normalizeDayLog(value: unknown): DayLog | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<DayLog>;

  if (!isValidDateString(candidate.date) || !isOneOf(candidate.flow, FLOW_LEVELS)) return null;
  if (candidate.mood !== undefined && !isOneOf(candidate.mood, MOODS)) return null;
  if (!Array.isArray(candidate.symptoms)) return null;
  if (!candidate.symptoms.every(symptom => isOneOf(symptom, SYMPTOMS))) return null;

  const notes = candidate.notes === undefined ? undefined : candidate.notes;
  if (notes !== undefined && typeof notes !== 'string') return null;

  return {
    date: candidate.date,
    flow: candidate.flow,
    ...(candidate.mood ? { mood: candidate.mood } : {}),
    symptoms: [...new Set(candidate.symptoms)],
    ...(notes ? { notes } : {}),
  };
}

export function normalizeLogs(value: unknown): DayLog[] {
  if (!Array.isArray(value)) return [];

  const byDate = new Map<string, DayLog>();
  for (const item of value) {
    const log = normalizeDayLog(item);
    if (log) byDate.set(log.date, log);
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function normalizeSettings(value: unknown, fallback: CycleSettings): CycleSettings {
  if (!value || typeof value !== 'object') return fallback;
  const candidate = value as Partial<CycleSettings>;
  const cycle = Number(candidate.startingCycleLength);
  const period = Number(candidate.startingPeriodLength);

  return {
    startingCycleLength: Number.isFinite(cycle) && cycle >= 15 && cycle <= 90 ? Math.round(cycle) : fallback.startingCycleLength,
    startingPeriodLength: Number.isFinite(period) && period >= 1 && period <= 14 ? Math.round(period) : fallback.startingPeriodLength,
  };
}

export function serializeLogs(logs: DayLog[]): string {
  return JSON.stringify(normalizeLogs(logs));
}

export function serializeSettings(settings: CycleSettings): string {
  return JSON.stringify(normalizeSettings(settings, settings));
}
