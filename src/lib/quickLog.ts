import { DayLog, FlowLevel } from '../types';

/**
 * Applies a one-tap flow selection without discarding optional details already
 * recorded for the same day. This keeps quick logging safe for existing edits.
 */
export function createQuickFlowLog(date: string, flow: FlowLevel, existingLog?: DayLog): DayLog {
  const log: DayLog = {
    date,
    flow,
    symptoms: existingLog?.symptoms ? [...existingLog.symptoms] : [],
  };

  if (existingLog?.mood !== undefined) log.mood = existingLog.mood;
  if (existingLog?.notes !== undefined) log.notes = existingLog.notes;

  return log;
}
