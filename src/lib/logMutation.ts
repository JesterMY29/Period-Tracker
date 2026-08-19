import type { DayLog } from '../types';
import { normalizeLogs } from './dataValidation';

/**
 * Replaces the record being edited instead of leaving a stale record behind
 * when the user corrects its date.
 */
export function replaceDayLog(logs: DayLog[], nextLog: DayLog, previousDate?: string): DayLog[] {
  return normalizeLogs(
    logs.filter(log => log.date !== nextLog.date && log.date !== previousDate).concat(nextLog),
  );
}
