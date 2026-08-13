import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, CheckCircle2, Lightbulb, ArrowRight, ShieldCheck } from 'lucide-react';
import { DayLog } from '../types';

interface TipOfTheDayCardProps {
  currentPhase: string;
  cycleDay: number;
  todayLog?: DayLog;
}

interface TipData {
  category: string;
  title: string;
  tip: string;
  action: string;
}

export const TipOfTheDayCard: React.FC<TipOfTheDayCardProps> = ({
  currentPhase,
  cycleDay,
  todayLog,
}) => {
  const [tip, setTip] = useState<TipData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [completed, setCompleted] = useState<boolean>(false);

  const fetchTip = useCallback(async () => {
    setLoading(true);
    setCompleted(false);
    try {
      const res = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: currentPhase,
          cycleDay,
          symptoms: todayLog?.symptoms || [],
          moods: todayLog?.moods || [],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTip(data);
      } else {
        throw new Error('Failed to load tip');
      }
    } catch (err) {
      console.error('Error fetching tip:', err);
      // Fallback local tip
      setTip({
        category: 'REST & RECOVERY',
        title: 'Listen to Phase Rhythm',
        tip: `During your ${currentPhase} phase (Day ${cycleDay}), your body experiences distinct hormonal fluctuations influencing energy and metabolism.`,
        action: 'Hydrate well with warm water and take 10 minutes for mindful stretching today.',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPhase, cycleDay, todayLog?.symptoms, todayLog?.moods]);

  useEffect(() => {
    fetchTip();
  }, [fetchTip]);

  return (
    <div className="neo-border-4 bg-white neo-shadow overflow-hidden">
      {/* Header Banner */}
      <div className="bg-[#fed9b7] border-b-2 border-[#1b2021] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border-2 border-[#1b2021] bg-[#f07167] text-white flex items-center justify-center neo-shadow-sm flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="neo-badge text-[10px] bg-[#1b2021] text-white py-0.5 px-2">
                DAILY WELLNESS TIP
              </span>
              <span className="font-mono text-[10px] font-bold text-[#0081a7] uppercase">
                {currentPhase} PHASE • DAY {cycleDay}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#1b2021] tracking-tight mt-0.5">
              Actionable AI Wellness Guidance
            </h3>
          </div>
        </div>

        <button
          id="refresh-tip-btn"
          onClick={fetchTip}
          disabled={loading}
          className="neo-btn bg-white text-[#1b2021] px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          title="Generate fresh AI tip"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#f07167] ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">New Tip</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="p-5 sm:p-6 space-y-4">
        {loading ? (
          <div className="py-8 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-[#f07167] animate-spin mx-auto" />
            <p className="font-mono text-xs font-bold text-[#1b2021]">
              Consulting Gemini AI for your phase tip...
            </p>
          </div>
        ) : tip ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-[#0081a7] text-white border border-[#1b2021]">
                {tip.category}
              </span>
              <span className="font-mono text-[10px] text-[#1b2021]/70 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#f07167]" /> Powered by Gemini
              </span>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base sm:text-lg font-bold text-[#1b2021] flex items-center gap-2">
                {tip.title}
              </h4>
              <p className="text-xs sm:text-sm font-sans text-[#1b2021] leading-relaxed">
                {tip.tip}
              </p>
            </div>

            {/* Action Box */}
            <div className={`p-4 border-2 border-[#1b2021] transition-all ${
              completed ? 'bg-[#edf5f0] border-emerald-800' : 'bg-[#fffbf2] neo-shadow-sm'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] font-bold text-[#f07167] uppercase tracking-wider block">
                    TODAY'S ACTION STEP
                  </span>
                  <p className={`text-xs sm:text-sm font-sans font-bold text-[#1b2021] flex items-start gap-2 ${
                    completed ? 'line-through opacity-75' : ''
                  }`}>
                    <ArrowRight className="w-4 h-4 text-[#0081a7] flex-shrink-0 mt-0.5" />
                    <span>{tip.action}</span>
                  </p>
                </div>

                <button
                  id="mark-tip-done-btn"
                  onClick={() => setCompleted(!completed)}
                  className={`neo-btn text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-end sm:self-auto ${
                    completed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#f07167] text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{completed ? 'Completed!' : 'Mark Done'}</span>
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
