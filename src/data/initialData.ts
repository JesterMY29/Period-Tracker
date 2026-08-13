import { CycleSettings, DayLog } from '../types';
import { addDays, formatDate } from '../lib/cycleUtils';

export function getDefaultSettings(): CycleSettings {
  const today = new Date();
  // Assume last period started ~12 days ago so current phase is Follicular/Ovulatory
  const lastPeriodStart = new Date(today);
  lastPeriodStart.setDate(today.getDate() - 12);

  return {
    avgCycleLength: 28,
    avgPeriodLength: 5,
    lastPeriodStartDate: formatDate(lastPeriodStart),
    notificationPeriodDaysBefore: 2,
    notificationOvulationDaysBefore: 1,
    enableDailyReminder: true,
    reminderTime: '20:00',
    userName: 'Aura User',
  };
}

export function generateSampleLogs(lastPeriodStartDate: string): DayLog[] {
  const logs: DayLog[] = [];
  
  // Cycle 1 (3 months ago): 28 days
  const cycle1Start = addDays(lastPeriodStartDate, -56);
  // Cycle 2 (1 month ago): 28 days
  const cycle2Start = addDays(lastPeriodStartDate, -28);
  // Cycle 3 (Current cycle): started lastPeriodStartDate

  // Populate Cycle 1
  logs.push(
    { date: addDays(cycle1Start, 0), flow: 'Heavy', symptoms: ['Cramps', 'Backache'], moods: ['Exhausted', 'Sensitive'], waterOz: 64, sleepHours: 7.5, sleepQuality: 3, notes: 'Day 1 cramps felt intense. Warm tea helped.' },
    { date: addDays(cycle1Start, 1), flow: 'Heavy', symptoms: ['Cramps', 'Bloating', 'Fatigue'], moods: ['Irritable', 'Sad'], waterOz: 72, sleepHours: 8, sleepQuality: 3 },
    { date: addDays(cycle1Start, 2), flow: 'Medium', symptoms: ['Headache', 'Cramps'], moods: ['Calm'], waterOz: 80, sleepHours: 8.5, sleepQuality: 4 },
    { date: addDays(cycle1Start, 3), flow: 'Light', symptoms: ['Bloating'], moods: ['Calm'], waterOz: 64, sleepHours: 8, sleepQuality: 4 },
    { date: addDays(cycle1Start, 4), flow: 'Spotting', symptoms: [], moods: ['Energetic'], waterOz: 72, sleepHours: 7.5, sleepQuality: 4 },
    { date: addDays(cycle1Start, 10), flow: 'None', symptoms: [], moods: ['Energetic', 'Happy'], cervicalMucus: 'Creamy', waterOz: 80, sleepHours: 8, sleepQuality: 5 },
    { date: addDays(cycle1Start, 13), flow: 'None', symptoms: [], moods: ['Loving', 'Energetic'], cervicalMucus: 'Egg White', bbt: 97.4, waterOz: 88, sleepHours: 8, sleepQuality: 5 },
    { date: addDays(cycle1Start, 21), flow: 'None', symptoms: ['Tender Breasts', 'Acne'], moods: ['Sensitive'], waterOz: 64, sleepHours: 7, sleepQuality: 3 },
    { date: addDays(cycle1Start, 26), flow: 'None', symptoms: ['Cravings', 'Bloating', 'Mood Swings'], moods: ['Anxious', 'Irritable'], waterOz: 56, sleepHours: 6.5, sleepQuality: 2 }
  );

  // Populate Cycle 2
  logs.push(
    { date: addDays(cycle2Start, 0), flow: 'Heavy', symptoms: ['Cramps', 'Backache'], moods: ['Exhausted'], waterOz: 60, sleepHours: 7, sleepQuality: 3 },
    { date: addDays(cycle2Start, 1), flow: 'Heavy', symptoms: ['Cramps', 'Bloating', 'Fatigue'], moods: ['Sensitive'], waterOz: 70, sleepHours: 7.5, sleepQuality: 3 },
    { date: addDays(cycle2Start, 2), flow: 'Medium', symptoms: ['Headache'], moods: ['Calm'], waterOz: 80, sleepHours: 8, sleepQuality: 4 },
    { date: addDays(cycle2Start, 3), flow: 'Light', symptoms: [], moods: ['Calm'], waterOz: 72, sleepHours: 8, sleepQuality: 4 },
    { date: addDays(cycle2Start, 4), flow: 'Spotting', symptoms: [], moods: ['Energetic'], waterOz: 80, sleepHours: 8, sleepQuality: 5 },
    { date: addDays(cycle2Start, 12), flow: 'None', symptoms: [], moods: ['Energetic', 'Focused'], cervicalMucus: 'Egg White', bbt: 97.5, waterOz: 88, sleepHours: 8.5, sleepQuality: 5 },
    { date: addDays(cycle2Start, 22), flow: 'None', symptoms: ['Tender Breasts', 'Bloating'], moods: ['Sensitive'], waterOz: 64, sleepHours: 7, sleepQuality: 3 },
    { date: addDays(cycle2Start, 25), flow: 'None', symptoms: ['Cravings', 'Insomnia'], moods: ['Anxious'], waterOz: 50, sleepHours: 6, sleepQuality: 2 }
  );

  // Populate Current Cycle (Cycle 3) up to today
  logs.push(
    { date: addDays(lastPeriodStartDate, 0), flow: 'Heavy', symptoms: ['Cramps', 'Backache'], moods: ['Exhausted', 'Sensitive'], waterOz: 64, sleepHours: 7, sleepQuality: 3, notes: 'Cycle started on schedule.' },
    { date: addDays(lastPeriodStartDate, 1), flow: 'Heavy', symptoms: ['Cramps', 'Fatigue'], moods: ['Calm'], waterOz: 72, sleepHours: 8, sleepQuality: 4 },
    { date: addDays(lastPeriodStartDate, 2), flow: 'Medium', symptoms: ['Bloating'], moods: ['Calm'], waterOz: 80, sleepHours: 8, sleepQuality: 4 },
    { date: addDays(lastPeriodStartDate, 3), flow: 'Light', symptoms: [], moods: ['Energetic'], waterOz: 80, sleepHours: 8.5, sleepQuality: 5 },
    { date: addDays(lastPeriodStartDate, 4), flow: 'Spotting', symptoms: [], moods: ['Happy', 'Focused'], waterOz: 75, sleepHours: 8, sleepQuality: 5 },
    { date: addDays(lastPeriodStartDate, 8), flow: 'None', symptoms: [], moods: ['Focused', 'Energetic'], waterOz: 88, sleepHours: 8, sleepQuality: 5 },
    { date: addDays(lastPeriodStartDate, 11), flow: 'None', symptoms: [], moods: ['Loving', 'Energetic'], cervicalMucus: 'Egg White', bbt: 97.6, waterOz: 90, sleepHours: 8.5, sleepQuality: 5, notes: 'Feeling great energy and mood today.' }
  );

  return logs;
}
