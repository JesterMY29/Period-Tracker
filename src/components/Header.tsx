import React from 'react';
import { Calendar, Sparkles, BarChart2, Settings, Plus, Compass } from 'lucide-react';
import { CyclePhase } from '../types';

interface HeaderProps {
  activeTab: 'today' | 'calendar' | 'ai' | 'analytics' | 'settings';
  setActiveTab: (tab: 'today' | 'calendar' | 'ai' | 'analytics' | 'settings') => void;
  onOpenLogModal: () => void;
  cycleDay: number;
  currentPhase: CyclePhase;
  daysUntilNextPeriod: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogModal,
  cycleDay,
  currentPhase,
  daysUntilNextPeriod,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#fffbf2]/95 backdrop-blur-md pt-4 pb-2 px-2 sm:px-6 max-w-7xl mx-auto">
      <nav className="neo-border-4 bg-white px-4 sm:px-6 py-3 neo-shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Status Indicators */}
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-start flex-wrap">
          <span className="font-hand font-bold text-3xl sm:text-4xl text-[#0081a7] leading-none">
            AuraCycle.io
          </span>

          <div className="h-6 w-0.5 bg-[#1b2021] hidden sm:block" />

          {/* Status Badge */}
          <div className="border-2 border-[#1b2021] bg-[#0081a7] text-white px-3 py-1 font-mono text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5 neo-shadow-sm">
            <span>DAY {cycleDay} • {currentPhase}</span>
          </div>

          <div className="h-6 w-0.5 bg-[#1b2021] hidden lg:block" />

          {/* Next Period Info */}
          <p className="text-xs font-mono font-bold text-[#1b2021] hidden lg:block uppercase tracking-tight">
            {daysUntilNextPeriod > 0
              ? `NEXT_PERIOD: IN_${daysUntilNextPeriod}_DAYS`
              : daysUntilNextPeriod === 0
              ? 'PERIOD: TODAY'
              : `PERIOD_DAY_${Math.abs(daysUntilNextPeriod)}`}
          </p>

          {/* Quick Log Action on Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button
              id="header-quick-log-mobile-btn"
              onClick={onOpenLogModal}
              className="neo-btn bg-[#f07167] text-white text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Log
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 font-mono text-xs font-bold overflow-x-auto no-scrollbar w-full md:w-auto justify-start md:justify-end pb-1 md:pb-0">
          <button
            id="nav-tab-today"
            onClick={() => setActiveTab('today')}
            className={`px-3 py-2 border-2 border-[#1b2021] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'today'
                ? 'bg-[#fed9b7] text-[#1b2021] neo-shadow-sm'
                : 'bg-white text-[#1b2021] hover:bg-[#fffbf2]'
            }`}
          >
            <Compass className="w-4 h-4 text-[#0081a7]" />
            Today
          </button>

          <button
            id="nav-tab-calendar"
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-2 border-2 border-[#1b2021] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-[#fed9b7] text-[#1b2021] neo-shadow-sm'
                : 'bg-white text-[#1b2021] hover:bg-[#fffbf2]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </button>

          <button
            id="nav-tab-ai"
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-2 border-2 border-[#1b2021] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'ai'
                ? 'bg-[#f07167] text-white neo-shadow-sm'
                : 'bg-white text-[#1b2021] hover:bg-[#fffbf2]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#f07167]" />
            AI Insights
          </button>

          <button
            id="nav-tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-2 border-2 border-[#1b2021] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-[#fed9b7] text-[#1b2021] neo-shadow-sm'
                : 'bg-white text-[#1b2021] hover:bg-[#fffbf2]'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Trends
          </button>

          <button
            id="nav-tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 border-2 border-[#1b2021] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-[#0081a7] text-white neo-shadow-sm'
                : 'bg-white text-[#1b2021] hover:bg-[#fffbf2]'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
            Config
          </button>

          <button
            id="header-quick-log-btn"
            onClick={onOpenLogModal}
            className="hidden md:flex neo-btn bg-[#f07167] text-white text-xs px-3.5 py-2 items-center gap-1.5 cursor-pointer ml-1"
          >
            <Plus className="w-4 h-4" /> LOG ENTRY
          </button>
        </div>
      </nav>
    </header>
  );
};

