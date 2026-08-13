import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { CycleWheel } from './components/CycleWheel';
import { CalendarView } from './components/CalendarView';
import { SymptomLoggerModal } from './components/SymptomLoggerModal';
import { AIInsightsTab } from './components/AIInsightsTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { RemindersSettingsModal } from './components/RemindersSettingsModal';
import { TipOfTheDayCard } from './components/TipOfTheDayCard';
import { DayLog, CycleSettings } from './types';
import {
  getDefaultSettings,
  generateSampleLogs,
} from './data/initialData';
import {
  getCycleDetails,
  getPhaseInfo,
  formatDate,
} from './lib/cycleUtils';
import {
  Calendar as CalendarIcon,
  Sparkles,
  Droplets,
  Plus,
  CheckCircle2,
  Heart,
  BookOpen,
} from 'lucide-react';

const STORAGE_KEY_SETTINGS = 'auracycle_settings_v1';
const STORAGE_KEY_LOGS = 'auracycle_logs_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'today' | 'calendar' | 'ai' | 'analytics' | 'settings'
  >('today');

  // Load or Initialize Settings
  const [settings, setSettings] = useState<CycleSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return getDefaultSettings();
  });

  // Load or Initialize Logs
  const [logs, setLogs] = useState<DayLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return generateSampleLogs(settings.lastPeriodStartDate);
  });

  // Modal State for Symptom Logger
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [selectedLogDate, setSelectedLogDate] = useState<string>(
    formatDate(new Date())
  );

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  }, [logs]);

  // Derived current cycle status
  const todayStr = formatDate(new Date());
  const cycleDetails = getCycleDetails(
    todayStr,
    settings.lastPeriodStartDate,
    settings.avgCycleLength
  );
  const phaseInfo = getPhaseInfo(
    cycleDetails.cycleDay,
    settings.avgCycleLength,
    settings.avgPeriodLength
  );

  // Today's specific log
  const todayLog = logs.find(l => l.date === todayStr);

  const handleSaveLog = (newLog: DayLog) => {
    setLogs(prev => {
      const filtered = prev.filter(l => l.date !== newLog.date);
      return [...filtered, newLog].sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  const handleOpenLogModalForDate = (dateStr: string) => {
    setSelectedLogDate(dateStr);
    setIsLoggerOpen(true);
  };

  const handleResetSampleData = () => {
    const defaultSet = getDefaultSettings();
    const newSample = generateSampleLogs(defaultSet.lastPeriodStartDate);
    setSettings(defaultSet);
    setLogs(newSample);
  };

  const handleClearAllData = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-[#fdfaf5] text-[#2d2d2a] font-sans antialiased flex flex-col selection:bg-[#e8d5cc]">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogModal={() => handleOpenLogModalForDate(todayStr)}
        cycleDay={cycleDetails.cycleDay}
        currentPhase={phaseInfo.phase}
        daysUntilNextPeriod={cycleDetails.daysUntilNextPeriod}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        <AnimatePresence mode="wait">
          {activeTab === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Central Interactive Cycle Wheel */}
              <CycleWheel
                cycleDay={cycleDetails.cycleDay}
                avgCycleLength={settings.avgCycleLength}
                phaseInfo={phaseInfo}
                daysUntilNextPeriod={cycleDetails.daysUntilNextPeriod}
                isFertileWindow={cycleDetails.isFertileWindow}
                isOvulationDay={cycleDetails.isOvulationDay}
                onOpenLogModal={() => handleOpenLogModalForDate(todayStr)}
                onNavigateToAI={() => setActiveTab('ai')}
              />

              {/* AI Tip of the Day Card */}
              <TipOfTheDayCard
                currentPhase={phaseInfo.phase}
                cycleDay={cycleDetails.cycleDay}
                todayLog={todayLog}
              />

              {/* Today's Log Card & Quick Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Today Log Status Card */}
                <div className="neo-border-4 bg-white p-6 sm:p-8 neo-shadow space-y-4 md:col-span-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 border-2 border-[#1b2021] bg-[#f07167] text-white neo-shadow-sm">
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-[#1b2021]">
                          TODAY'S SYMPTOM LOG ({todayStr})
                        </h3>
                        <p className="font-mono text-xs text-[#0081a7]">
                          {todayLog ? 'Log entry recorded for today' : 'No symptoms logged yet today'}
                        </p>
                      </div>
                    </div>

                    <button
                      id="today-log-edit-btn"
                      onClick={() => handleOpenLogModalForDate(todayStr)}
                      className="neo-btn bg-[#0081a7] text-white px-4 py-2.5 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {todayLog ? 'UPDATE ENTRY' : 'ADD ENTRY'}
                    </button>
                  </div>

                  {todayLog ? (
                    <div className="p-5 bg-[#fffbf2] border-2 border-[#1b2021] space-y-3 font-mono">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold text-[#1b2021] uppercase">FLOW:</span>
                        <span className="px-3 py-1 bg-[#fed9b7] text-[#1b2021] text-xs font-bold border border-[#1b2021]">
                          {todayLog.flow}
                        </span>

                        {todayLog.waterOz && (
                          <span className="px-3 py-1 bg-white text-[#1b2021] text-xs font-bold border border-[#1b2021]">
                            💧 {todayLog.waterOz} oz water
                          </span>
                        )}

                        {todayLog.sleepHours && (
                          <span className="px-3 py-1 bg-white text-[#1b2021] text-xs font-bold border border-[#1b2021]">
                            🌙 {todayLog.sleepHours} hrs sleep
                          </span>
                        )}
                      </div>

                      {todayLog.symptoms.length > 0 && (
                        <div>
                          <span className="text-xs font-bold text-[#0081a7] uppercase block mb-1.5">
                            LOGGED SYMPTOMS:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {todayLog.symptoms.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-white text-[#f07167] border-2 border-[#1b2021] text-xs font-bold"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {todayLog.notes && (
                        <div className="text-xs text-[#1b2021] italic bg-white p-3.5 border-2 border-[#1b2021]">
                          "{todayLog.notes}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 bg-[#fffbf2] border-2 border-dashed border-[#1b2021] text-center space-y-2">
                      <p className="font-mono text-xs text-[#1b2021]">
                        Logging daily symptoms helps Gemini AI build precise personalized recommendations for your health.
                      </p>
                      <button
                        id="today-quick-log-btn"
                        onClick={() => handleOpenLogModalForDate(todayStr)}
                        className="font-mono text-xs font-bold uppercase text-[#f07167] hover:underline cursor-pointer"
                      >
                        Click here to record flow, mood, and symptoms
                      </button>
                    </div>
                  )}
                </div>

                {/* AI Feature Nudge Card */}
                <div className="neo-border-4 bg-[#0081a7] text-white p-6 sm:p-8 neo-shadow flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="w-10 h-10 border-2 border-[#1b2021] bg-white flex items-center justify-center text-[#1b2021] neo-shadow-sm">
                      <Sparkles className="w-5 h-5 text-[#f07167]" />
                    </div>
                    <h4 className="text-2xl font-extrabold text-white">
                      Today's Phase AI Insights
                    </h4>
                    <p className="font-mono text-xs text-white/90 leading-relaxed">
                      Your estrogen &amp; progesterone levels guide optimal nutrition, movement, and mood strategies for today.
                    </p>
                  </div>

                  <button
                    id="today-view-ai-insights-btn"
                    onClick={() => setActiveTab('ai')}
                    className="neo-btn bg-white text-[#1b2021] w-full py-3 text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#f07167]" />
                    READ FULL REPORT
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CalendarView
                logs={logs}
                settings={settings}
                onSelectDate={handleOpenLogModalForDate}
              />
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AIInsightsTab
                currentPhase={phaseInfo.phase}
                cycleDay={cycleDetails.cycleDay}
                avgCycleLength={settings.avgCycleLength}
                todayLog={todayLog}
                recentLogs={logs}
                settings={settings}
              />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AnalyticsTab logs={logs} settings={settings} />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <RemindersSettingsModal
                settings={settings}
                onUpdateSettings={setSettings}
                logs={logs}
                onResetSampleData={handleResetSampleData}
                onClearAllData={handleClearAllData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Symptom Logger Modal */}
      <SymptomLoggerModal
        isOpen={isLoggerOpen}
        onClose={() => setIsLoggerOpen(false)}
        selectedDate={selectedLogDate}
        existingLog={logs.find(l => l.date === selectedLogDate)}
        onSaveLog={handleSaveLog}
      />

      {/* Neo-Geometric Footer */}
      <footer className="max-w-7xl mx-auto px-2 sm:px-6 mt-12 pb-8">
        <div className="neo-border-4 bg-white p-4 sm:p-6 neo-shadow-tertiary flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs font-bold text-[#1b2021]">
          <div className="flex flex-wrap items-center gap-4">
            <span>DATE: {new Date().toISOString().split('T')[0]}</span>
            <span>•</span>
            <span className="text-[#0081a7]">
              {cycleDetails.daysUntilNextPeriod > 0
                ? `NEXT_PERIOD: IN_${cycleDetails.daysUntilNextPeriod}_DAYS`
                : cycleDetails.daysUntilNextPeriod === 0
                ? 'PERIOD: TODAY'
                : `PERIOD_DAY_${Math.abs(cycleDetails.daysUntilNextPeriod)}`}
            </span>
          </div>
          <div>AuraCycle Intelligent Companion V_0.1</div>
        </div>
        <p className="text-[11px] font-mono text-[#1b2021]/60 text-center mt-3">
          Educational wellness companion &amp; AI assistant. Does not substitute medical diagnosis or clinical advice.
        </p>
      </footer>
    </div>
  );
}
