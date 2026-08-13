import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { CycleWheel } from './components/CycleWheel';
import { CalendarView } from './components/CalendarView';
import { SymptomLoggerModal } from './components/SymptomLoggerModal';
import { AIInsightsTab } from './components/AIInsightsTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { RemindersSettingsModal } from './components/RemindersSettingsModal';
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

              {/* Today's Log Card & Quick Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Today Log Status Card */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-[#f0ede8] shadow-xs space-y-4 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-full bg-[#f7e8e5] text-[#d97d6e]">
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-serif font-bold text-[#2d2d2a]">
                          Today's Symptom Log ({todayStr})
                        </h3>
                        <p className="text-xs text-[#a19c91] font-sans">
                          {todayLog ? 'Log entry recorded for today' : 'No symptoms logged yet today'}
                        </p>
                      </div>
                    </div>

                    <button
                      id="today-log-edit-btn"
                      onClick={() => handleOpenLogModalForDate(todayStr)}
                      className="px-4 py-2.5 rounded-full bg-[#d97d6e] hover:bg-[#c26a5c] text-white text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {todayLog ? 'Update Entry' : 'Add Entry'}
                    </button>
                  </div>

                  {todayLog ? (
                    <div className="p-5 rounded-[24px] bg-[#fdfaf5] border border-[#e5e0d8] space-y-3">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold text-[#7c8363] uppercase tracking-wider font-sans">Flow:</span>
                        <span className="px-3 py-1 rounded-full bg-[#f7e8e5] text-[#8c3e32] text-xs font-sans font-semibold border border-[#e8d5cc]">
                          {todayLog.flow}
                        </span>

                        {todayLog.waterOz && (
                          <span className="px-3 py-1 rounded-full bg-[#edf5f0] text-[#2e593e] text-xs font-sans font-semibold border border-[#cce3d5]">
                            💧 {todayLog.waterOz} oz water
                          </span>
                        )}

                        {todayLog.sleepHours && (
                          <span className="px-3 py-1 rounded-full bg-[#f0f2eb] text-[#464c33] text-xs font-sans font-semibold border border-[#d4d8c8]">
                            🌙 {todayLog.sleepHours} hrs sleep
                          </span>
                        )}
                      </div>

                      {todayLog.symptoms.length > 0 && (
                        <div>
                          <span className="text-xs font-bold text-[#a19c91] uppercase tracking-wider font-sans block mb-1.5">
                            Logged Symptoms:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {todayLog.symptoms.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-full bg-white text-[#d97d6e] border border-[#d97d6e] text-xs font-sans font-medium"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {todayLog.notes && (
                        <div className="text-xs text-[#4a4a40] italic bg-white p-3.5 rounded-2xl border border-[#e5e0d8]">
                          "{todayLog.notes}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 rounded-[24px] bg-[#fdfaf5] border border-dashed border-[#e5e0d8] text-center space-y-2">
                      <p className="text-xs text-[#a19c91] font-sans">
                        Logging daily symptoms helps Gemini AI build precise personalized recommendations for your health.
                      </p>
                      <button
                        id="today-quick-log-btn"
                        onClick={() => handleOpenLogModalForDate(todayStr)}
                        className="text-xs font-bold font-sans uppercase tracking-wider text-[#d97d6e] hover:underline cursor-pointer"
                      >
                        Click here to record flow, mood, and symptoms
                      </button>
                    </div>
                  )}
                </div>

                {/* AI Feature Nudge Card */}
                <div className="bg-[#7c8363] text-white p-6 sm:p-8 rounded-[32px] shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <Sparkles className="w-5 h-5 text-amber-200" />
                    </div>
                    <h4 className="text-2xl font-serif text-[#fdfaf5]">
                      Today's Phase AI Insights
                    </h4>
                    <p className="text-xs text-[#fdfaf5]/90 font-sans leading-relaxed">
                      Your estrogen & progesterone levels guide optimal nutrition, movement, and mood strategies for today.
                    </p>
                  </div>

                  <button
                    id="today-view-ai-insights-btn"
                    onClick={() => setActiveTab('ai')}
                    className="w-full py-3 rounded-full bg-white text-[#7c8363] hover:bg-[#fdfaf5] text-xs font-sans font-bold uppercase tracking-widest shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#d97d6e]" />
                    Read Full Report
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
