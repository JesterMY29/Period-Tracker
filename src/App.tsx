import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeTab } from './components/HomeTab';
import { CalendarView } from './components/CalendarView';
import { HistoryTab } from './components/HistoryTab';
import { SettingsTab } from './components/SettingsTab';
import { SymptomLoggerModal } from './components/SymptomLoggerModal';
import { DayLog, CycleSettings } from './types';
import { getDefaultSettings, getDefaultLogs } from './data/initialData';
import { formatDate } from './lib/cycleUtils';

const STORAGE_KEY_SETTINGS = 'auracycle_settings_v2';
const STORAGE_KEY_LOGS = 'auracycle_logs_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'history' | 'settings'>('home');

  // Load Settings
  const [settings, setSettings] = useState<CycleSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.startingCycleLength === 'number') {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return getDefaultSettings();
  });

  // Load Logs - Defaults to empty array (NO SAMPLE DATA)
  const [logs, setLogs] = useState<DayLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return getDefaultLogs();
  });

  // Modal State for Daily Symptom Logger
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [selectedLogDate, setSelectedLogDate] = useState<string>(formatDate(new Date()));

  // Persist to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  }, [logs]);

  const todayStr = formatDate(new Date());

  const handleOpenLogModalForDate = (dateStr: string) => {
    setSelectedLogDate(dateStr);
    setIsLoggerOpen(true);
  };

  const handleSaveLog = (newLog: DayLog) => {
    setLogs(prev => {
      const filtered = prev.filter(l => l.date !== newLog.date);
      return [...filtered, newLog].sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  const handleDeleteLog = (dateStr: string) => {
    setLogs(prev => prev.filter(l => l.date !== dateStr));
  };

  const handleImportLogs = (importedLogs: DayLog[], importedSettings?: CycleSettings) => {
    if (Array.isArray(importedLogs)) {
      setLogs(importedLogs.sort((a, b) => a.date.localeCompare(b.date)));
    }
    if (importedSettings && typeof importedSettings.startingCycleLength === 'number') {
      setSettings(importedSettings);
    }
  };

  const handleClearAllData = () => {
    setLogs([]);
  };

  const existingLog = logs.find(l => l.date === selectedLogDate);

  return (
    <div className="min-h-screen bg-[#fdfaf5] text-[#2d2d2a] font-sans antialiased flex flex-col selection:bg-[#fed9b7]">
      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogModal={() => handleOpenLogModalForDate(todayStr)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {activeTab === 'home' && (
          <HomeTab
            logs={logs}
            settings={settings}
            onOpenLogModal={handleOpenLogModalForDate}
            onNavigateToCalendar={() => setActiveTab('calendar')}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            logs={logs}
            settings={settings}
            onSelectDate={handleOpenLogModalForDate}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab logs={logs} />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            onUpdateSettings={setSettings}
            logs={logs}
            onImportLogs={handleImportLogs}
            onClearAllData={handleClearAllData}
          />
        )}
      </main>

      {/* Symptom Logger Modal */}
      <SymptomLoggerModal
        isOpen={isLoggerOpen}
        onClose={() => setIsLoggerOpen(false)}
        selectedDate={selectedLogDate}
        existingLog={existingLog}
        onSaveLog={handleSaveLog}
        onDeleteLog={handleDeleteLog}
      />

      {/* Neo-Geometric Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 pb-8 w-full font-mono text-xs text-[#1b2021]">
        <div className="neo-border-4 bg-white p-4 sm:p-6 neo-shadow flex flex-col sm:flex-row items-center justify-between gap-4 font-bold">
          <div className="flex flex-wrap items-center gap-3">
            <span>AuraCycle Private Tracker</span>
            <span>•</span>
            <span className="text-[#0081a7]">100% Offline &amp; Local</span>
          </div>
          <div>No AI • No Cloud • No Ads</div>
        </div>
        <p className="text-[11px] text-[#1b2021]/60 text-center mt-3">
          Estimates are mathematical predictions based on recorded log entries and do not replace professional medical advice.
        </p>
      </footer>
    </div>
  );
}
