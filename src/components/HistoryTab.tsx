import React from 'react';
import { Activity, BarChart3, CalendarDays, Info } from 'lucide-react';
import { DayLog, CycleSettings } from '../types';
import { detectPeriods, getCompletedCycles, getPrediction, calculateSymptomFrequencies, calculateMoodFrequencies, formatDisplayDate } from '../lib/cycleUtils';

interface HistoryTabProps {
  logs: DayLog[];
  settings: CycleSettings;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ logs, settings }) => {
  const periods = detectPeriods(logs);
  const cycles = getCompletedCycles(logs);
  const prediction = getPrediction(logs, settings);
  const symptoms = calculateSymptomFrequencies(logs);
  const moods = calculateMoodFrequencies(logs);

  const averagePeriod = periods.length ? Math.round(periods.reduce((sum, period) => sum + period.length, 0) / periods.length) : null;
  const recentCycles = cycles.slice(-6).reverse();
  const cycleRange = prediction?.cycleLengthRange
    ? `${prediction.cycleLengthRange.min}–${prediction.cycleLengthRange.max} days`
    : '—';
  const typicalCycle = prediction?.cyclesUsed ? `${prediction.typicalCycleLength} days` : '—';

  const summary = [
    ['Typical cycle', typicalCycle, prediction?.cyclesUsed ? `Based on ${prediction.cyclesUsed} recent cycles` : 'Not enough cycle history'],
    ['Observed range', cycleRange, prediction?.cycleLengthRange ? 'Shortest–longest recent cycle' : 'Build history to compare'],
    ['Average period', averagePeriod ? `${averagePeriod} days` : '—', `${periods.length} recorded period${periods.length === 1 ? '' : 's'}`],
    ['Logged days', `${logs.length}`, 'Recorded entries on this device'],
  ];

  return (
    <div className="space-y-5 sm:space-y-7 font-sans">
      <section>
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c]">History</p>
        <h1 className="font-serif text-3xl sm:text-4xl mt-1">Your cycle record</h1>
        <p className="font-mono text-[11px] text-[#1a1a1a]/55 mt-2">A factual timeline and summary of the entries recorded on this device.</p>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {summary.map(([label, value, detail]) => (
          <div key={label} className="card-refined p-4 sm:p-5">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#c47c7c]">{label}</p>
            <p className="font-serif text-xl sm:text-2xl mt-2">{value}</p>
            <p className="font-mono text-[10px] leading-relaxed text-[#1a1a1a]/50 mt-1">{detail}</p>
          </div>
        ))}
      </div>

      <section className="card-refined p-5 sm:p-7">
        <div className="flex items-start gap-3 pb-4 border-b border-[#1a1a1a]/10">
          <CalendarDays className="w-5 h-5 text-[#c47c7c] mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c]">Recent cycles</p>
            <h2 className="font-serif text-xl sm:text-2xl mt-1">Cycle timeline</h2>
          </div>
        </div>

        {recentCycles.length ? (
          <div className="divide-y divide-[#1a1a1a]/10">
            {recentCycles.map((cycle, index) => (
              <div key={`${cycle.startDate}-${cycle.nextStartDate}`} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                <div>
                  <p className="text-xs font-semibold">Cycle {cycles.length - index}</p>
                  <p className="text-[10px] text-[#1a1a1a]/55 mt-1">{formatDisplayDate(cycle.startDate)} → {formatDisplayDate(cycle.nextStartDate)}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="px-2.5 py-1 bg-[#1a1a1a] text-[#f8f7f4]">{cycle.length} days</span>
                  <span className="px-2.5 py-1 bg-[#f8f7f4] border border-[#1a1a1a]/10">Period {cycle.periodLength} days</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center font-mono text-xs text-[#1a1a1a]/55">Complete at least two period starts to build a cycle timeline.</div>
        )}
      </section>

      {prediction && (
        <section className="card-faint p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c]">Data basis</p>
            <p className="font-serif text-lg mt-1">{prediction.cyclesUsed ? `${prediction.cyclesUsed} recent cycles inform the estimate` : 'Starting estimate only'}</p>
          </div>
          <p className="font-mono text-[10px] text-[#1a1a1a]/55">{prediction.confidence} confidence</p>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <section className="card-refined p-5 sm:p-7">
          <div className="flex items-center gap-3 pb-4 border-b border-[#1a1a1a]/10">
            <Activity className="w-5 h-5 text-[#c47c7c]" aria-hidden="true" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c]">Symptoms</p>
              <h2 className="font-serif text-xl mt-1">Most logged</h2>
            </div>
          </div>
          <div className="pt-4 space-y-2">
            {symptoms.length ? symptoms.slice(0, 6).map(({ symptom, count }) => (
              <div key={symptom} className="flex items-center justify-between gap-3 px-3 py-2.5 bg-[#f8f7f4] border border-[#1a1a1a]/10 font-mono text-xs">
                <span>{symptom}</span><span className="px-2 py-0.5 bg-[#c47c7c] text-[#f8f7f4] text-[10px]">{count}</span>
              </div>
            )) : <p className="font-mono text-xs text-[#1a1a1a]/50 py-3">No symptoms logged yet.</p>}
          </div>
        </section>

        <section className="card-refined p-5 sm:p-7">
          <div className="flex items-center gap-3 pb-4 border-b border-[#1a1a1a]/10">
            <BarChart3 className="w-5 h-5 text-[#1a1a1a]" aria-hidden="true" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c]">Mood</p>
              <h2 className="font-serif text-xl mt-1">Most logged</h2>
            </div>
          </div>
          <div className="pt-4 space-y-2">
            {moods.length ? moods.slice(0, 6).map(({ mood, count }) => (
              <div key={mood} className="flex items-center justify-between gap-3 px-3 py-2.5 bg-[#f8f7f4] border border-[#1a1a1a]/10 font-mono text-xs">
                <span>{mood}</span><span className="px-2 py-0.5 bg-[#1a1a1a] text-[#f8f7f4] text-[10px]">{count}</span>
              </div>
            )) : <p className="font-mono text-xs text-[#1a1a1a]/50 py-3">No moods logged yet.</p>}
          </div>
        </section>
      </div>

      <div className="flex items-start gap-2 font-mono text-[10px] leading-relaxed text-[#1a1a1a]/45">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
        <p>These summaries describe recorded data. They are not health assessments or medical diagnoses.</p>
      </div>
    </div>
  );
};
