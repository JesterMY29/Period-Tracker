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
const CYCLE_LENGTH_MIN = 15;
const CYCLE_LENGTH_MAX = 90;
const PERIOD_LENGTH_MIN = 1;
const PERIOD_LENGTH_MAX = 14;

export const AURACYCLE_BACKUP_FORMAT = 'auracycle-backup';
export const AURACYCLE_BACKUP_VERSION = 1;

export interface AuraCycleBackup {
  format: typeof AURACYCLE_BACKUP_FORMAT;
  version: typeof AURACYCLE_BACKUP_VERSION;
  exportedAt: string;
  settings: CycleSettings;
  logs: DayLog[];
}

export type BackupParseResult =
  | { ok: true; backup: AuraCycleBackup; legacy: boolean }
  | { ok: false; error: 'invalid-json' | 'unsupported-format' | 'unsupported-version' | 'invalid-exported-at' | 'invalid-settings' | 'invalid-logs' };

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
    startingCycleLength: Number.isFinite(cycle) && cycle >= CYCLE_LENGTH_MIN && cycle <= CYCLE_LENGTH_MAX ? Math.round(cycle) : fallback.startingCycleLength,
    startingPeriodLength: Number.isFinite(period) && period >= PERIOD_LENGTH_MIN && period <= PERIOD_LENGTH_MAX ? Math.round(period) : fallback.startingPeriodLength,
  };
}

function isStrictSettings(value: unknown): value is CycleSettings {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CycleSettings>;
  return (
    typeof candidate.startingCycleLength === 'number' &&
    Number.isInteger(candidate.startingCycleLength) &&
    candidate.startingCycleLength >= CYCLE_LENGTH_MIN &&
    candidate.startingCycleLength <= CYCLE_LENGTH_MAX &&
    typeof candidate.startingPeriodLength === 'number' &&
    Number.isInteger(candidate.startingPeriodLength) &&
    candidate.startingPeriodLength >= PERIOD_LENGTH_MIN &&
    candidate.startingPeriodLength <= PERIOD_LENGTH_MAX
  );
}

function isStrictLogs(value: unknown): value is DayLog[] {
  if (!Array.isArray(value)) return false;
  const normalized = normalizeLogs(value);
  if (normalized.length !== value.length) return false;
  return value.every((item, index) => {
    const normalizedItem = normalizeDayLog(item);
    return normalizedItem !== null && JSON.stringify(normalizedItem) === JSON.stringify(normalized[index]);
  });
}

export function createBackup(settings: CycleSettings, logs: DayLog[], exportedAt = new Date().toISOString()): AuraCycleBackup {
  return {
    format: AURACYCLE_BACKUP_FORMAT,
    version: AURACYCLE_BACKUP_VERSION,
    exportedAt,
    settings: normalizeSettings(settings, settings),
    logs: normalizeLogs(logs),
  };
}

export function serializeBackup(settings: CycleSettings, logs: DayLog[], exportedAt?: string): string {
  return JSON.stringify(createBackup(settings, logs, exportedAt), null, 2);
}

export function parseBackup(value: unknown): BackupParseResult {
  if (!value || typeof value !== 'object') return { ok: false, error: 'unsupported-format' };
  const candidate = value as Record<string, unknown>;

  const isLegacy = candidate.format === undefined && candidate.version === undefined;
  if (!isLegacy && candidate.format !== AURACYCLE_BACKUP_FORMAT) return { ok: false, error: 'unsupported-format' };
  if (!isLegacy && candidate.version !== AURACYCLE_BACKUP_VERSION) return { ok: false, error: 'unsupported-version' };

  if (!isLegacy) {
    if (typeof candidate.exportedAt !== 'string' || Number.isNaN(Date.parse(candidate.exportedAt))) {
      return { ok: false, error: 'invalid-exported-at' };
    }
  }

  if (!isStrictSettings(candidate.settings)) return { ok: false, error: 'invalid-settings' };
  if (!isStrictLogs(candidate.logs)) return { ok: false, error: 'invalid-logs' };

  return {
    ok: true,
    legacy: isLegacy,
    backup: {
      format: AURACYCLE_BACKUP_FORMAT,
      version: AURACYCLE_BACKUP_VERSION,
      exportedAt: isLegacy ? new Date().toISOString() : candidate.exportedAt as string,
      settings: candidate.settings,
      logs: candidate.logs,
    },
  };
}

export function serializeLogs(logs: DayLog[]): string {
  return JSON.stringify(normalizeLogs(logs));
}

export function serializeSettings(settings: CycleSettings): string {
  return JSON.stringify(normalizeSettings(settings, settings));
}
