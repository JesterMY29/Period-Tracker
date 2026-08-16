import React from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, Plus, ShieldCheck } from 'lucide-react';
import { DayLog, CycleSettings } from '../types';
import {
  formatDate,
  formatDisplayDate,
  formatShortDate,
  getPrediction,
  detectPeriods,
  getDaysDifference,
} from '../lib/cycleUtils';

interface HomeTabProps {
  logs: DayLog[];
  settings: CycleSettings;
  onOpenLogModal: (dateStr: string) => void;
  onNavigateToCalendar: () => void;
}

const confidenceCopy = {
  High: 'Your recent cycles are consistent.',
  Moderate: 'Your recent history gives us a useful estimate.',
  Low: 'Keep logging to improve your personal baseline.',
};

export const HomeTab: React.FC<HomeTabProps> = ({
  logs,
  settings,
  onOpenLogModal,
  onNavigateToCalendar,
}) => {
  const todayStr = formatDate(new Date());
  const todayLog = logs.find(log => log.date === todayStr);
  const periods = detectPeriods(logs);
  const prediction = getPrediction(logs, settings);
  const latestPeriod = periods[periods.length - 1];

  const cycleDay = latestPeriod
    ? getDaysDifference(latestPeriod.startDate, todayStr) + 1
    : null;

  const cycleStatus = cycleDay && cycleDay > 0
    ? `Cycle day ${cycleDay}`
    : 'Start tracking your cycle';

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* Primary status */}
      <section className="card-refined overflow-hidden">
        <div className="p-5 sm:p-7 bg-[#1a1a1a] text-[#f8f7f4]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c47c7c]">Today · {formatDisplayDate(todayStr)}</p>
              <h1 className="font-serif text-3xl sm:text-4xl mt-2 tracking-tight">{cycleStatus}</h1>
              <p className="text-sm text-[#f8f7f4]/70 mt-2">
                {latestPeriod
                  ? `Last period started ${formatDisplayDate(latestPeriod.startDate)}.`
                  : 'Log your first period day to start building your personal cycle baseline.'}
              </p>
            </div>
            <div className="shrink-0 p-2.5 border border-[#f8f7f4]/15 bg-[#f8f7f4]/5">
              <CalendarDays className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c]">Next period</p>
              {prediction ? (
                <>
                  <p className="font-serif text-2xl sm:text-3xl mt-1 text-[#1a1a1a]">
                    {formatShortDate(prediction.predictedWindowStart)} – {formatShortDate(prediction.predictedWindowEnd)}
                  </p>
                  <p className="font-mono text-[11px] text-[#1a1a1a]/60 mt-1">
                    {prediction.confidence} confidence · typical cycle {prediction.typicalCycleLength} days
                  </p>
                </>
              ) : (
                <p className="font-serif text-xl mt-1 text-[#1a1a1a]">Not enough history yet</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenLogModal(todayStr)}
              className="bg-[#c47c7c] text-[#f8f7f4] px-5 py-3 font-mono text-xs uppercase tracking-wider font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              {todayLog ? 'Update today' : 'Log today'}
            </button>
          </div>
        </div>
      </section>

      {/* Prediction detail */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="card-refined p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b border-[#1a1a1a]/10 pb-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c]">Prediction</p>
              <h2 className="font-serif text-xl sm:text-2xl mt-1">Your personal estimate</h2>
            </div>
            {prediction && (
              <span className="font-mono text-[10px] uppercase tracking-wider bg-[#1a1a1a] text-[#f8f7f4] px-2 py-1">
                {prediction.confidence}
              </span>
            )}
          </div>

          {prediction ? (
            <div className="pt-5 space-y-4">
              <div className="p-4 bg-[#f8f7f4] border border-[#1a1a1a]/10">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#1a1a1a]/55">Expected start</p>
                <p className="font-serif text-2xl mt-1">{formatDisplayDate(prediction.expectedStartDate)}</p>
                <p className="font-mono text-[11px] text-[#c47c7c] mt-1">Estimated window ±{prediction.marginDays} days</p>
              </div>
              <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="border border-[#1a1a1a]/10 p-3 bg-white">
                  <span className="text-[#1a1a1a]/55 block">Recent cycles</span>
                  <strong className="text-sm">{prediction.cyclesUsed || 'Starting estimate'}</strong>
                </div>
                <div className="border border-[#1a1a1a]/10 p-3 bg-white">
                  <span className="text-[#1a1a1a]/55 block">Typical length</span>
                  <strong className="text-sm">{prediction.typicalCycleLength} days</strong>
                </div>
              </div>
              <p className="font-mono text-[11px] leading-relaxed text-[#1a1a1a]/65">
                {confidenceCopy[prediction.confidence]} This is a mathematical estimate from recorded period starts, not medical advice.
              </p>
            </div>
          ) : (
            <div className="pt-5">
              <div className="p-5 border border-dashed border-[#1a1a1a]/20 bg-[#f8f7f4]">
                <p className="font-mono text-xs">Log period starts to build a personal prediction baseline.</p>
              </div>
            </div>
          )}
        </div>

        <div className="card-refined p-5 sm:p-6 flex flex-col justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c]">Today</p>
            <h2 className="font-serif text-xl mt-1">Daily record</h2>
            <div className="mt-5 flex items-center gap-3">
              {todayLog ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#c47c7c]" aria-hidden="true" />
                  <div>
                    <p className="font-mono text-xs font-semibold">Entry recorded</p>
                    <p className="font-mono text-[10px] text-[#1a1a1a]/55">Flow: {todayLog.flow}</p>
                  </div>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-[#c47c7c]" aria-hidden="true" />
                  <div>
                    <p className="font-mono text-xs font-semibold">Nothing logged today</p>
                    <p className="font-mono text-[10px] text-[#1a1a1a]/55">A quick check-in keeps your history current.</p>
                  </div>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenLogModal(todayStr)}
            className="btn-secondary w-full cursor-pointer"
          >
            {todayLog ? 'Edit today’s entry' : 'Add today’s entry'}
          </button>
        </div>
      </section>

      {/* Secondary navigation */}
      <section className="card-refined p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c]">Explore your record</p>
            <h2 className="font-serif text-xl mt-1">Calendar & cycle history</h2>
            <p className="font-mono text-[11px] text-[#1a1a1a]/60 mt-1">Review logged days, predictions, and past cycles.</p>
          </div>
          <button
            type="button"
            onClick={onNavigateToCalendar}
            className="btn-secondary flex items-center justify-center gap-2 cursor-pointer"
          >
            View calendar
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 font-mono text-[10px] text-[#1a1a1a]/45">
        <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
        Private by design · Your records stay on this device
      </div>
    </div>
  );
};
