import React from 'react';
import { Activity, BarChart2, Info, Calendar } from 'lucide-react';
import { DayLog } from '../types';
import {
  detectPeriods,
  getCompletedCycles,
  calculateSymptomFrequencies,
  calculateMoodFrequencies,
  formatDisplayDate,
} from '../lib/cycleUtils';

interface HistoryTabProps {
  logs: DayLog[];
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ logs }) => {
  const periods = detectPeriods(logs);
  const completedCycles = getCompletedCycles(logs);

  const symptomFreq = calculateSymptomFrequencies(logs);
  const moodFreq = calculateMoodFrequencies(logs);

  // Stats calculation
  const totalCompletedCycles = completedCycles.length;

  let avgCycleLength = 0;
  let minCycleLength = 0;
  let maxCycleLength = 0;

  if (totalCompletedCycles > 0) {
    const totalDays = completedCycles.reduce((acc, c) => acc + c.length, 0);
    avgCycleLength = Math.round(totalDays / totalCompletedCycles);
    const lengths = completedCycles.map(c => c.length);
    minCycleLength = Math.min(...lengths);
    maxCycleLength = Math.max(...lengths);
  }

  let avgPeriodLength = 0;
  if (periods.length > 0) {
    const totalPeriodDays = periods.reduce((acc, p) => acc + p.length, 0);
    avgPeriodLength = Math.round(totalPeriodDays / periods.length);
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Disclaimer Callout */}
      <div className="border border-[#1a1a1a]/10 bg-white p-4 sm:p-5 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#c47c7c] shrink-0 mt-0.5" />
        <div className="font-mono text-xs text-[#1a1a1a]/80 leading-relaxed">
          <span className="font-bold text-[#1a1a1a]">[FACTUAL DATA SUMMARY]</span> The statistics below represent strictly factual summaries of your logged entries stored in your browser. They are not health assessments or medical diagnoses.
        </div>
      </div>

      {/* Factual Metrics Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Avg Cycle Length */}
        <div className="card-refined p-5 space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c] block">
            AVG CYCLE LENGTH
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-medium text-[#1a1a1a]">
            {totalCompletedCycles > 0 ? `${avgCycleLength} days` : 'N/A'}
          </div>
          <span className="font-mono text-[10px] text-[#1a1a1a]/60 block">
            {totalCompletedCycles} completed cycle{totalCompletedCycles === 1 ? '' : 's'}
          </span>
        </div>

        {/* Avg Period Length */}
        <div className="card-refined p-5 space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c] block">
            AVG PERIOD LENGTH
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-medium text-[#1a1a1a]">
            {periods.length > 0 ? `${avgPeriodLength} days` : 'N/A'}
          </div>
          <span className="font-mono text-[10px] text-[#1a1a1a]/60 block">
            {periods.length} logged period{periods.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Shortest / Longest Cycle */}
        <div className="card-refined p-5 space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#1a1a1a]/70 block">
            CYCLE RANGE
          </span>
          <div className="font-serif text-xl sm:text-2xl font-medium text-[#1a1a1a]">
            {totalCompletedCycles > 0 ? `${minCycleLength} – ${maxCycleLength} days` : 'N/A'}
          </div>
          <span className="font-mono text-[10px] text-[#1a1a1a]/60 block">
            Shortest vs Longest
          </span>
        </div>

        {/* Total Logs */}
        <div className="card-refined p-5 space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#1a1a1a]/70 block">
            TOTAL DAYS LOGGED
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-medium text-[#1a1a1a]">
            {logs.length}
          </div>
          <span className="font-mono text-[10px] text-[#1a1a1a]/60 block">
            Total recorded entries
          </span>
        </div>
      </div>

      {/* Recorded Cycles History */}
      <div className="card-refined p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-[#1a1a1a]/10 pb-3">
          <Calendar className="w-4 h-4 text-[#c47c7c]" />
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c] block">
              [02] Timeline
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-[#1a1a1a]">
              Recorded Cycle History
            </h3>
          </div>
        </div>

        {completedCycles.length > 0 ? (
          <div className="space-y-3">
            {[...completedCycles].reverse().map((cycle, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#f8f7f4] border border-[#1a1a1a]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs"
              >
                <div>
                  <div className="font-semibold text-[#1a1a1a]">
                    Cycle #{completedCycles.length - idx}: {formatDisplayDate(cycle.startDate)} – {formatDisplayDate(cycle.nextStartDate)}
                  </div>
                  <div className="text-[#1a1a1a]/60 text-[11px] mt-0.5">
                    Period duration: {cycle.periodLength} days
                  </div>
                </div>

                <div className="px-3 py-1 bg-[#1a1a1a] text-[#f8f7f4] font-medium text-center">
                  {cycle.length} DAYS
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-[#f8f7f4] border border-dashed border-[#1a1a1a]/20 text-center font-mono text-xs text-[#1a1a1a]/70">
            No completed cycles recorded yet. A cycle is measured from one period start date to the next period start date.
          </div>
        )}
      </div>

      {/* Symptom & Mood Frequencies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Symptom Frequency */}
        <div className="card-refined p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1a1a1a]/10 pb-3">
            <Activity className="w-4 h-4 text-[#c47c7c]" />
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c] block">
                [03] Symptoms
              </span>
              <h4 className="font-serif text-lg text-[#1a1a1a]">
                Logged Symptom Frequency
              </h4>
            </div>
          </div>

          {symptomFreq.length > 0 ? (
            <div className="space-y-2 font-mono text-xs">
              {symptomFreq.map(({ symptom, count }) => (
                <div
                  key={symptom}
                  className="flex items-center justify-between p-2.5 bg-[#f8f7f4] border border-[#1a1a1a]/10"
                >
                  <span className="text-[#1a1a1a] font-medium">{symptom}</span>
                  <span className="px-2 py-0.5 bg-[#c47c7c] text-[#f8f7f4] font-medium text-[11px]">
                    {count} {count === 1 ? 'time' : 'times'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-[#f8f7f4] border border-dashed border-[#1a1a1a]/20 text-center font-mono text-xs text-[#1a1a1a]/60">
              No symptoms logged yet.
            </div>
          )}
        </div>

        {/* Mood Frequency */}
        <div className="card-refined p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1a1a1a]/10 pb-3">
            <BarChart2 className="w-4 h-4 text-[#1a1a1a]" />
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c] block">
                [04] Moods
              </span>
              <h4 className="font-serif text-lg text-[#1a1a1a]">
                Logged Mood Frequency
              </h4>
            </div>
          </div>

          {moodFreq.length > 0 ? (
            <div className="space-y-2 font-mono text-xs">
              {moodFreq.map(({ mood, count }) => (
                <div
                  key={mood}
                  className="flex items-center justify-between p-2.5 bg-[#f8f7f4] border border-[#1a1a1a]/10"
                >
                  <span className="text-[#1a1a1a] font-medium">{mood}</span>
                  <span className="px-2 py-0.5 bg-[#1a1a1a] text-[#f8f7f4] font-medium text-[11px]">
                    {count} {count === 1 ? 'time' : 'times'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-[#f8f7f4] border border-dashed border-[#1a1a1a]/20 text-center font-mono text-xs text-[#1a1a1a]/60">
              No moods logged yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
