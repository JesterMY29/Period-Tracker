import React from 'react';
import { Calendar as CalendarIcon, Plus, Info, ShieldCheck, Heart, AlertCircle, ArrowRight } from 'lucide-react';
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

export const HomeTab: React.FC<HomeTabProps> = ({
  logs,
  settings,
  onOpenLogModal,
  onNavigateToCalendar,
}) => {
  const todayStr = formatDate(new Date());
  const todayLog = logs.find(l => l.date === todayStr);

  const periods = detectPeriods(logs);
  const prediction = getPrediction(logs, settings);

  let currentCycleDayText = 'No period logged yet';
  if (periods.length > 0) {
    const lastPeriodStart = periods[periods.length - 1].startDate;
    const daysSinceLastPeriod = getDaysDifference(lastPeriodStart, todayStr);
    if (daysSinceLastPeriod >= 0) {
      currentCycleDayText = `Day ${daysSinceLastPeriod + 1} of current cycle`;
    } else {
      currentCycleDayText = `Logged period starts ${formatDisplayDate(lastPeriodStart)}`;
    }
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="border border-[#1a1a1a]/10 bg-[#1a1a1a] text-[#f8f7f4] p-5 sm:p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#f8f7f4]/10 text-[#f8f7f4] border border-[#f8f7f4]/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c] block mb-0.5">
              [01] Infrastructure &amp; Privacy
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-normal tracking-tight">
              100% Private &amp; Local Storage
            </h2>
            <p className="font-sans text-xs text-[#f8f7f4]/80 mt-0.5">
              All health records stay strictly in your browser's local storage. No AI models, cloud servers, or third-party tracking.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card-refined p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a1a1a]/10 pb-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#c47c7c]">[02] Status Overview</span>
              <span className="font-mono text-xs text-[#1a1a1a]/70">{formatDisplayDate(todayStr)}</span>
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-3xl sm:text-4xl text-[#1a1a1a] font-medium tracking-tight">{currentCycleDayText}</h3>
              {periods.length > 0 && (
                <p className="font-mono text-xs text-[#1a1a1a]/60">Last period start: {formatDisplayDate(periods[periods.length - 1].startDate)}</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1a1a1a]/10">
            <button type="button" onClick={() => onOpenLogModal(todayStr)} className="bg-[#c47c7c] text-[#f8f7f4] w-full py-3 font-mono text-xs uppercase tracking-wider font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer">
              <Plus className="w-4 h-4" />
              {todayLog ? "UPDATE TODAY'S LOG" : "LOG TODAY'S ENTRY"}
            </button>
          </div>
        </div>

        <div className="card-refined p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a1a1a]/10 pb-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#c47c7c] flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5" /> PREDICTED NEXT PERIOD
              </span>
              {prediction && (
                <span className="font-mono text-[10px] uppercase tracking-wider bg-[#1a1a1a] text-[#f8f7f4] px-2 py-0.5">
                  {prediction.confidence} CONFIDENCE
                </span>
              )}
            </div>

            {prediction ? (
              <div className="space-y-3">
                <div className="p-4 bg-[#f8f7f4] border border-[#1a1a1a]/10 space-y-2">
                  <div className="font-serif text-2xl sm:text-3xl text-[#1a1a1a] font-normal">
                    {formatShortDate(prediction.predictedWindowStart)} – {formatShortDate(prediction.predictedWindowEnd)}
                  </div>
                  <p className="font-mono text-xs text-[#c47c7c]">
                    Estimated window (±{prediction.marginDays} days)
                  </p>
                  <div className="font-mono text-[10px] text-[#1a1a1a]/60 pt-2 border-t border-[#1a1a1a]/10 space-y-1">
                    <p>{prediction.cyclesUsed > 0 ? `${prediction.cyclesUsed} recent cycles used` : 'Using your starting estimate'}</p>
                    {prediction.cycleLengthRange && (
                      <p>Recent cycle range: {prediction.cycleLengthRange.min}–{prediction.cycleLengthRange.max} days</p>
                    )}
                  </div>
                </div>

                <p className="font-mono text-[11px] text-[#1a1a1a]/70 leading-relaxed p-3 bg-white border border-[#1a1a1a]/10">
                  <Info className="w-3.5 h-3.5 text-[#c47c7c] inline mr-1" />
                  {prediction.label}. This is a mathematical estimate based on recorded period starts, not a medical prediction.
                </p>
              </div>
            ) : (
              <div className="p-5 bg-[#f8f7f4] border border-dashed border-[#1a1a1a]/20 text-center space-y-2">
                <AlertCircle className="w-5 h-5 text-[#c47c7c] mx-auto" />
                <p className="font-mono text-xs font-semibold text-[#1a1a1a]">No period predictions available yet</p>
                <p className="font-mono text-[11px] text-[#1a1a1a]/60">Log your flow for at least one period date to begin calculating predicted period windows.</p>
              </div>
            )}
          </div>

          <button type="button" onClick={onNavigateToCalendar} className="btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer">
            <span>VIEW FULL CALENDAR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="card-refined p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#1a1a1a]/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-[#1a1a1a]/10 bg-[#f8f7f4] text-[#1a1a1a]"><Heart className="w-4 h-4 text-[#c47c7c]" /></div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c] block">[03] Today's Log ({todayStr})</span>
              <h3 className="font-serif text-xl sm:text-2xl text-[#1a1a1a]">{todayLog ? 'Recorded Daily Log' : 'No Entry Recorded Today'}</h3>
            </div>
          </div>
          <button type="button" onClick={() => onOpenLogModal(todayStr)} className="btn-secondary cursor-pointer">{todayLog ? 'EDIT ENTRY' : 'ADD ENTRY'}</button>
        </div>

        {todayLog ? (
          <div className="p-5 bg-[#f8f7f4] border border-[#1a1a1a]/10 font-mono text-xs space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-[#1a1a1a]">FLOW:</span>
              <span className="px-3 py-1 bg-[#c47c7c] text-[#f8f7f4] font-medium uppercase tracking-wider">{todayLog.flow}</span>
              {todayLog.mood && <><span className="font-semibold text-[#1a1a1a] ml-2">MOOD:</span><span className="px-3 py-1 bg-[#1a1a1a] text-[#f8f7f4] font-medium uppercase tracking-wider">{todayLog.mood}</span></>}
            </div>
            {todayLog.symptoms && todayLog.symptoms.length > 0 && (
              <div className="space-y-1.5"><span className="font-semibold text-[#1a1a1a] block">SYMPTOMS:</span><div className="flex flex-wrap gap-1.5">{todayLog.symptoms.map((sym, idx) => <span key={idx} className="px-2.5 py-1 bg-white border border-[#1a1a1a]/15 text-[#1a1a1a]">{sym}</span>)}</div></div>
            )}
            {todayLog.notes && <div className="space-y-1 pt-2 border-t border-dashed border-[#1a1a1a]/15"><span className="font-semibold text-[#1a1a1a] block">NOTES:</span><p className="p-3 bg-white border border-[#1a1a1a]/10 font-sans italic text-[#1a1a1a]/80 text-sm">"{todayLog.notes}"</p></div>}
          </div>
        ) : (
          <div className="p-6 bg-[#f8f7f4] border border-dashed border-[#1a1a1a]/20 text-center font-mono space-y-3">
            <p className="text-xs text-[#1a1a1a]/70">Track your daily flow, mood, and symptoms to build an accurate personal cycle record.</p>
            <button type="button" onClick={() => onOpenLogModal(todayStr)} className="text-xs font-semibold text-[#c47c7c] hover:underline cursor-pointer uppercase tracking-wider">+ Add entry for today</button>
          </div>
        )}
      </div>
    </div>
  );
};
