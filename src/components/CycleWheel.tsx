import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CyclePhase, PhaseInfo } from '../types';
import {
  Sparkles,
  Calendar,
  Zap,
  Droplets,
  HeartHandshake,
  RotateCcw,
  Flame,
  Feather,
  Sun,
  Activity,
} from 'lucide-react';

interface CycleWheelProps {
  cycleDay: number;
  avgCycleLength: number;
  phaseInfo: PhaseInfo;
  daysUntilNextPeriod: number;
  isFertileWindow: boolean;
  isOvulationDay: boolean;
  onOpenLogModal: () => void;
  onNavigateToAI: () => void;
}

interface PhaseDetail {
  phase: CyclePhase;
  energyLevel: 'Low' | 'Rising' | 'Peak' | 'Waning';
  energyPercent: number;
  energyTagline: string;
  energyDescription: string;
  hormoneSummary: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  accentHex: string;
  recommendedActivity: string;
}

const ALL_PHASES: PhaseDetail[] = [
  {
    phase: 'Menstrual',
    energyLevel: 'Low',
    energyPercent: 30,
    energyTagline: 'Restful & Reflective',
    energyDescription: 'Energy turns inward. Gentle movement, warmth, and deep rest recharge your core vitality.',
    hormoneSummary: 'Low Estrogen & Progesterone',
    description: 'Your uterus sheds its lining. Estrogen and progesterone levels are at their lowest point in your cycle.',
    color: 'text-[#d97d6e]',
    bgColor: 'bg-[#f7e8e5]',
    borderColor: 'border-[#e8d5cc]',
    accentHex: '#d97d6e',
    recommendedActivity: 'Gentle Yoga & Rest',
  },
  {
    phase: 'Follicular',
    energyLevel: 'Rising',
    energyPercent: 65,
    energyTagline: 'Building & Creative',
    energyDescription: 'Rising estrogen lifts mood and stamina. Prime time for strategic planning and fresh projects.',
    hormoneSummary: 'Rising Estrogen, Low Progesterone',
    description: 'FSH stimulates follicle growth while estrogen steadily ascends, boosting physical stamina and mental clarity.',
    color: 'text-[#7c8363]',
    bgColor: 'bg-[#f0f2eb]',
    borderColor: 'border-[#d4d8c8]',
    accentHex: '#7c8363',
    recommendedActivity: 'Cardio & Brainstorming',
  },
  {
    phase: 'Ovulatory',
    energyLevel: 'Peak',
    energyPercent: 100,
    energyTagline: 'High Vitality & Social Power',
    energyDescription: 'Peak confidence, charisma, and stamina powered by maximum estrogen and LH surge.',
    hormoneSummary: 'Peak Estrogen & LH Surge',
    description: 'A sharp surge in Luteinizing Hormone triggers egg release. Peak fertility, confidence, and social energy.',
    color: 'text-[#4e8061]',
    bgColor: 'bg-[#edf5f0]',
    borderColor: 'border-[#cce3d5]',
    accentHex: '#4e8061',
    recommendedActivity: 'HIIT & Social Events',
  },
  {
    phase: 'Luteal',
    energyLevel: 'Waning',
    energyPercent: 50,
    energyTagline: 'Grounded & Focused',
    energyDescription: 'Progesterone climbs, shifting focus inward. Ideal for detail work, organizing, and steady pacing.',
    hormoneSummary: 'High Progesterone, Gradual Decline',
    description: 'Progesterone climbs to prepare the body. Energy gradually tapers into a detail-oriented, grounded phase.',
    color: 'text-[#826177]',
    bgColor: 'bg-[#f5edf3]',
    borderColor: 'border-[#e3ccd8]',
    accentHex: '#826177',
    recommendedActivity: 'Pilates & Organization',
  },
];

export const CycleWheel: React.FC<CycleWheelProps> = ({
  cycleDay,
  avgCycleLength,
  phaseInfo,
  daysUntilNextPeriod,
  isFertileWindow,
  isOvulationDay,
  onOpenLogModal,
  onNavigateToAI,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<CyclePhase>(phaseInfo.phase);

  // Sync selected phase when cycle phase changes from props
  useEffect(() => {
    setSelectedPhase(phaseInfo.phase);
  }, [phaseInfo.phase]);

  const activeDetail = ALL_PHASES.find(p => p.phase === selectedPhase) || ALL_PHASES[0];
  const isPreviewingOtherPhase = selectedPhase !== phaseInfo.phase;

  const percentage = Math.min(100, Math.max(0, (cycleDay / avgCycleLength) * 100));
  const strokeDasharray = 2 * Math.PI * 120; // radius = 120
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

  const getEnergyIcon = (level: string) => {
    switch (level) {
      case 'Low':
        return <Feather className="w-4 h-4 text-[#d97d6e]" />;
      case 'Rising':
        return <Activity className="w-4 h-4 text-[#7c8363]" />;
      case 'Peak':
        return <Flame className="w-4 h-4 text-[#4e8061]" />;
      case 'Waning':
        return <Sun className="w-4 h-4 text-[#826177]" />;
      default:
        return <Zap className="w-4 h-4 text-[#d97d6e]" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Phase Explorer Header Tabs */}
      <div className="neo-border-4 bg-white p-4 sm:p-6 neo-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#0081a7] block">
            CYCLE PHASE EXPLORER
          </span>
          <h2 className="text-xl sm:text-2xl font-sans font-extrabold text-[#1b2021] tracking-tight">
            Select Phase to Preview Physiology
          </h2>
        </div>

        {/* Phase Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {ALL_PHASES.map(p => {
            const isSelected = selectedPhase === p.phase;
            const isCurrentToday = phaseInfo.phase === p.phase;

            return (
              <button
                key={p.phase}
                id={`phase-tab-${p.phase.toLowerCase()}`}
                onClick={() => setSelectedPhase(p.phase)}
                className={`font-mono text-xs font-bold uppercase px-3.5 py-2 border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-[#1b2021] bg-[#f07167] text-white neo-shadow-sm'
                    : 'border-[#1b2021] bg-[#fffbf2] text-[#1b2021] hover:bg-[#fed9b7]'
                }`}
              >
                <span>{p.phase}</span>
                {isCurrentToday && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-[#0081a7]'
                    }`}
                    title="Today's Active Phase"
                  />
                )}
              </button>
            );
          })}

          {isPreviewingOtherPhase && (
            <button
              id="reset-phase-today-btn"
              onClick={() => setSelectedPhase(phaseInfo.phase)}
              className="font-mono text-xs font-bold uppercase px-3 py-2 border-2 border-[#1b2021] bg-[#0081a7] text-white neo-shadow-sm hover:bg-[#006f90] transition-all flex items-center gap-1 cursor-pointer"
              title="Return to Today's Phase"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Today</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Neo-Geometric Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Hero Box */}
        <div className="lg:col-span-7 neo-border-4 bg-white p-6 sm:p-10 neo-shadow-accent flex flex-col justify-between space-y-6">
          <div>
            <span className="neo-badge transform -rotate-1 bg-[#0081a7] text-white mb-4">
              STATUS: {activeDetail.phase.toUpperCase()}_PHASE
            </span>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1b2021] leading-tight mb-4 tracking-tight">
              Shift <em className="neo-em font-serif italic">Energy</em> &amp; Physiology
            </h1>

            <p className="text-base sm:text-lg text-[#1b2021]/85 leading-relaxed font-sans mb-6">
              {activeDetail.description} {activeDetail.energyDescription}
            </p>

            {/* Energy Gauge Bar */}
            <div className="p-4 border-2 border-[#1b2021] bg-[#fffbf2] neo-shadow-sm mb-6 space-y-2">
              <div className="flex items-center justify-between font-mono text-xs font-bold uppercase">
                <span className="flex items-center gap-2 text-[#1b2021]">
                  {getEnergyIcon(activeDetail.energyLevel)}
                  Energy Level: {activeDetail.energyLevel} ({activeDetail.energyPercent}%)
                </span>
                <span className="text-[#0081a7]">{activeDetail.energyTagline}</span>
              </div>
              <div className="w-full h-3 bg-white border-2 border-[#1b2021] overflow-hidden p-0.5">
                <motion.div
                  className="h-full bg-[#f07167]"
                  initial={{ width: 0 }}
                  animate={{ width: `${activeDetail.energyPercent}%` }}
                  transition={{ type: 'spring', stiffness: 90, damping: 16 }}
                />
              </div>
            </div>

            {/* Stats Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-3.5 border-2 border-dashed border-[#1b2021] bg-[#fffbf2]">
                <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-[#0081a7] block mb-1">
                  Hormones
                </span>
                <div className="font-sans font-bold text-sm text-[#1b2021]">
                  {activeDetail.hormoneSummary}
                </div>
              </div>

              <div className="p-3.5 border-2 border-dashed border-[#1b2021] bg-[#fffbf2]">
                <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-[#0081a7] block mb-1">
                  Best Movement
                </span>
                <div className="font-sans font-bold text-sm text-[#1b2021]">
                  {activeDetail.recommendedActivity}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              id="cycle-wheel-log-today-btn"
              onClick={onOpenLogModal}
              className="neo-btn bg-[#f07167] text-white px-6 py-3.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" /> Log Daily Entry
            </button>
            <button
              id="cycle-wheel-ai-insight-btn"
              onClick={onNavigateToAI}
              className="neo-btn bg-white text-[#1b2021] px-6 py-3.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#f07167]" /> Ask AI Health Guide
            </button>
          </div>
        </div>

        {/* Right Column: Visual Column with Day Card & AI Speech Bubble */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Day Card */}
          <div className="neo-border-4 bg-[#fed9b7] p-8 neo-shadow-secondary flex-1 flex flex-col items-center justify-center relative min-h-[260px]">
            <span className="font-mono text-sm font-bold uppercase tracking-widest text-[#1b2021]">
              DAY
            </span>
            <div className="font-hand font-bold text-8xl sm:text-9xl text-[#1b2021] leading-none my-1">
              {cycleDay}
            </div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#0081a7] border-t-2 border-[#1b2021] pt-2">
              In the cycle ({avgCycleLength} days total)
            </span>

            {/* Sub-badge for Next Period */}
            <div className="mt-4 neo-badge bg-white text-[#1b2021] text-[10px]">
              {daysUntilNextPeriod > 0
                ? `Next period in ~${daysUntilNextPeriod} days`
                : daysUntilNextPeriod === 0
                ? 'Period expected today'
                : `Period day ${Math.abs(daysUntilNextPeriod)}`}
            </div>
          </div>

          {/* AI Speech Bubble */}
          <div className="ai-bubble">
            <p className="font-sans text-sm text-[#1b2021] leading-relaxed">
              &quot;{activeDetail.energyTagline} — {activeDetail.description}&quot;
            </p>
            <div className="mt-2 font-mono text-xs font-bold text-[#0081a7] not-italic flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#f07167]" /> Gemini AI Health Guide
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

