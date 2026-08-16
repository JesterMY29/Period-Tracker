import { DayLog, FlowLevel } from '../types';

/**
 * Applies a one-tap flow selection without discarding optional details already
 * recorded for the same day. This keeps quick logging safe for existing edits.
 */
export function createQuickFlowLog(date: string, flow: FlowLevel, existingLog?: DayLog): DayLog {
  return {
    date,
    flow,
    mood: existingLog?.mood,
    symptoms: existingLog?.symptoms ? [...existingLog.symptoms] : [],
    notes: existingLog?.notes,
  };
}
