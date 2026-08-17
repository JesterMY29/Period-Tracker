import React from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, Plus, ShieldCheck } from 'lucide-react';
import { DayLog, CycleSettings, FlowLevel } from '../types';
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
  onQuickFlowLog: (flow: FlowLevel) => void;
  onNavigateToCalendar: () => void;
}

const confidenceCopy = {
  High: 'Your recent cycles are consistent.',
  Moderate: 'Your recent history gives us a useful estimate.',
  Low: 'Keep logging to improve your personal baseline.',
};

const QUICK_FLOW_OPTIONS: FlowLevel[] = ['None', 'Spotting', 'Light', 'Medium', 'Heavy'];

const quickFlowLabels: Record<FlowLevel, string> = {
  None: 'None',
  Spotting: 'Spotting',
  Light: 'Light',
  Medium: 'Medium',
  Heavy: 'Heavy',
};

export const HomeTab: React.FC<HomeTabProps> = ({
  logs,
  settings,
  onOpenLogModal,
  onQuickFlowLog,
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
      {/* Primary home outcome: cycle status + next-period estimate */}
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

        <div className="p-5 sm:p-7 bg-white">
          <div className="flex flex-col gap-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c]">Estimated next period</p>
              {prediction ? (
                <>
                  <p className="font-serif text-3xl sm:text-4xl mt-1 text-[#1a1a1a]">
                    {formatDisplayDate(prediction.expectedStartDate)}
                  </p>
                  <p className="font-mono text-[11px] text-[#1a1a1a]/60 mt-1">
                    Prediction window: {formatShortDate(prediction.predictedWindowStart)} – {formatShortDate(prediction.predictedWindowEnd)}
                  </p>
                </>
              ) : (
                <p className="font-serif text-xl mt-1 text-[#1a1a1a]">Not enough history yet</p>
              )}
            </div>

            {prediction ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-[#1a1a1a]/10 p-3 bg-[#f8f7f4]">
                  <span className="font-mono text-[10px] text-[#1a1a1a]/55 block">Confidence</span>
                  <strong className="font-mono text-sm mt-1 block">{prediction.confidence}</strong>
                </div>
                <div className="border border-[#1a1a1a]/10 p-3 bg-[#f8f7f4]">
                  <span className="font-mono text-[10px] text-[#1a1a1a]/55 block">Data basis</span>
                  <strong className="font-mono text-sm mt-1 block">
                    {prediction.cyclesUsed ? `${prediction.cyclesUsed} recent cycles` : 'Starting estimate'}
                  </strong>
                </div>
              </div>
            ) : null}

            <p className="font-mono text-[11px] leading-relaxed text-[#1a1a1a]/65">
              {prediction
                ? `${confidenceCopy[prediction.confidence]} This is a mathematical estimate from recorded period starts, not medical advice.`
                : 'Log period starts to build a personal prediction baseline.'}
            </p>
          </div>
        </div>
      </section>

      {/* Phase 2B: fast flow logging */}
      <section className="card-refined p-5 sm:p-6" aria-labelledby="quick-log-heading">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c]">Quick log</p>
            <h2 id="quick-log-heading" className="font-serif text-xl sm:text-2xl mt-1">Record today in one tap</h2>
            <p className="font-mono text-[11px] text-[#1a1a1a]/60 mt-1">Flow is saved immediately. Add mood, symptoms, or notes only if you want to.</p>
          </div>
          {todayLog && (
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#1a1a1a]/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#c47c7c]" aria-hidden="true" />
              Saved: {todayLog.flow}
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {QUICK_FLOW_OPTIONS.map(flow => {
            const isSelected = todayLog?.flow === flow;
            return (
              <button
                key={flow}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onQuickFlowLog(flow)}
                className={`min-h-14 sm:min-h-16 px-1.5 border rounded-lg font-medium text-[10px] sm:text-xs text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#c47c7c] text-white border-[#c47c7c] shadow-sm'
                    : 'bg-white text-[#1a1a1a] border-[#1a1a1a]/12 hover:border-[#1a1a1a]/40'
                }`}
              >
                {quickFlowLabels[flow]}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onOpenLogModal(todayStr)}
          className="mt-3 text-xs font-mono text-[#1a1a1a]/65 hover:text-[#1a1a1a] underline underline-offset-2 cursor-pointer"
        >
          Add optional details
        </button>
      </section>

      {/* Compact daily record */}
      <section className="card-refined p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c]">Today</p>
            <h2 className="font-serif text-xl sm:text-2xl mt-1">Daily record</h2>
            <div className="mt-4 flex items-center gap-3">
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
            className="btn-secondary w-full sm:w-auto cursor-pointer"
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
