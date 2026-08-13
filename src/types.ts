export type CyclePhase = 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal';

export type FlowLevel = 'None' | 'Spotting' | 'Light' | 'Medium' | 'Heavy';

export type SymptomType =
  | 'Cramps'
  | 'Bloating'
  | 'Headache'
  | 'Acne'
  | 'Tender Breasts'
  | 'Backache'
  | 'Nausea'
  | 'Fatigue'
  | 'Cravings'
  | 'Mood Swings'
  | 'Insomnia'
  | 'Brain Fog'
  | 'Hot Flashes'
  | 'Joint Pain';

export type MoodType =
  | 'Calm'
  | 'Energetic'
  | 'Anxious'
  | 'Irritable'
  | 'Sad'
  | 'Happy'
  | 'Focused'
  | 'Sensitive'
  | 'Exhausted'
  | 'Loving';

export interface DayLog {
  date: string; // YYYY-MM-DD
  flow: FlowLevel;
  symptoms: SymptomType[];
  moods: MoodType[];
  waterOz?: number;
  sleepHours?: number;
  sleepQuality?: 1 | 2 | 3 | 4 | 5; // 1 to 5 scale
  bbt?: number; // Basal body temp in °F or °C
  cervicalMucus?: 'Dry' | 'Sticky' | 'Creamy' | 'Egg White' | 'Watery';
  notes?: string;
  sexualActivity?: boolean;
  protectedSex?: boolean;
}

export interface CycleSettings {
  avgCycleLength: number; // e.g., 28
  avgPeriodLength: number; // e.g., 5
  lastPeriodStartDate: string; // YYYY-MM-DD
  notificationPeriodDaysBefore: number; // e.g., 2
  notificationOvulationDaysBefore: number; // e.g., 1
  enableDailyReminder: boolean;
  reminderTime: string; // e.g., "20:00"
  userName?: string;
}

export interface PhaseInfo {
  phase: CyclePhase;
  dayInPhase: number;
  totalPhaseDays: number;
  description: string;
  energyLevel: 'Low' | 'Rising' | 'Peak' | 'Waning';
  hormoneSummary: string;
}

export interface AIInsights {
  phaseOverview: string;
  nutritionAdvice: string[];
  exerciseAdvice: string[];
  symptomAnalysis: string;
  mindsetTip: string;
  keyTakeaway: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface CycleHealthReport {
  summary: string;
  cycleRegularityAssessment: string;
  commonSymptomsObserved: string[];
  physicianNotes: string;
  lifestyleRecommendations: string[];
}
