export type FlowLevel = 'None' | 'Spotting' | 'Light' | 'Medium' | 'Heavy';

export type MoodType = 'Great' | 'Good' | 'Neutral' | 'Low' | 'Difficult';

export type SymptomType =
  | 'Cramps'
  | 'Bloating'
  | 'Headache'
  | 'Fatigue'
  | 'Breast tenderness'
  | 'Back pain'
  | 'Nausea'
  | 'Acne'
  | 'Other';

export interface DayLog {
  date: string; // YYYY-MM-DD
  flow: FlowLevel;
  mood?: MoodType;
  symptoms: SymptomType[];
  notes?: string;
}

export interface CycleSettings {
  startingCycleLength: number; // default 28
  startingPeriodLength: number; // default 5
}

export interface DetectedPeriod {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  length: number; // days in period
}

export interface CompletedCycle {
  startDate: string; // Period N start
  nextStartDate: string; // Period N+1 start
  length: number; // days from startDate up to nextStartDate
  periodLength: number; // days in Period N
}

export interface PredictionResult {
  predictedWindowStart: string; // YYYY-MM-DD
  predictedWindowEnd: string; // YYYY-MM-DD
  expectedStartDate: string; // YYYY-MM-DD
  marginDays: number; // ± margin (2 to 5)
  label: 'Building your baseline' | 'Early estimate' | 'Based on your recent cycle history';
  completedCycleCount: number;
}
