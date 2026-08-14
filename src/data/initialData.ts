import { CycleSettings, DayLog } from '../types';

export function getDefaultSettings(): CycleSettings {
  return {
    startingCycleLength: 28,
    startingPeriodLength: 5,
  };
}

export function getDefaultLogs(): DayLog[] {
  return [];
}
