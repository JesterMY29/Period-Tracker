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
import { normalizeLogs, normalizeSettings, serializeLogs, serializeSettings } from './lib/dataValidation';

const STORAGE_KEY_SETTINGS = 'auracycle_settings_v2';
const STORAGE_KEY_LOGS = 'auracycle_logs_v2';

function readStoredSettings(): CycleSettings {
  const fallback = getDefaultSettings();
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return saved ? normalizeSettings(JSON.parse(saved), fallback) : fallback;
  } catch (error) {
    console.warn('AuraCycle: invalid stored settings, using defaults.', error);
    return fallback;
  }
}

function readStoredLogs(): DayLog[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    return saved ? normalizeLogs(JSON.parse(saved)) : getDefaultLogs();
  } catch (error) {
    console.warn('AuraCycle: invalid stored logs, using an empty record.', error);
    return getDefaultLogs();
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'history' | 'settings'>('home');
  const [settings, setSettings] = useState<CycleSettings>(readStoredSettings);
  const [logs, setLogs] = useState<DayLog[]>(readStoredLogs);
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [selectedLogDate, setSelectedLogDate] = useState<string>(formatDate(new Date()));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, serializeSettings(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, serializeLogs(logs));
  }, [logs]);

  const todayStr = formatDate(new Date());

  const handleOpenLogModalForDate = (dateStr: string) => {
    setSelectedLogDate(dateStr);
    setIsLoggerOpen(true);
  };

  const handleSaveLog = (newLog: DayLog) => {
    setLogs(prev => normalizeLogs([...prev.filter(log => log.date !== newLog.date), newLog]));
  };

  const handleDeleteLog = (dateStr: string) => {
    setLogs(prev => prev.filter(log => log.date !== dateStr));
  };

  const handleImportLogs = (importedLogs: DayLog[], importedSettings?: CycleSettings) => {
    setLogs(normalizeLogs(importedLogs));
    if (importedSettings) {
      setSettings(normalizeSettings(importedSettings, getDefaultSettings()));
    }
  };

  const handleClearAllData = () => {
    setLogs([]);
  };

  const existingLog = logs.find(log => log.date === selectedLogDate);

  return (
    <div className="min-h-screen bg-[#fdfaf5] text-[#2d2d2a] font-sans antialiased flex flex-col selection:bg-[#fed9b7]">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onOpenLogModal={() => handleOpenLogModalForDate(todayStr)} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {activeTab === 'home' && <HomeTab logs={logs} settings={settings} onOpenLogModal={handleOpenLogModalForDate} onNavigateToCalendar={() => setActiveTab('calendar')} />}
        {activeTab === 'calendar' && <CalendarView logs={logs} settings={settings} onSelectDate={handleOpenLogModalForDate} />}
        {activeTab === 'history' && <HistoryTab logs={logs} />}
        {activeTab === 'settings' && <SettingsTab settings={settings} onUpdateSettings={setSettings} logs={logs} onImportLogs={handleImportLogs} onClearAllData={handleClearAllData} />}
      </main>
      <SymptomLoggerModal isOpen={isLoggerOpen} onClose={() => setIsLoggerOpen(false)} selectedDate={selectedLogDate} existingLog={existingLog} onSaveLog={handleSaveLog} onDeleteLog={handleDeleteLog} />
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 pb-8 w-full font-mono text-xs text-[#1b2021]">
        <div className="neo-border-4 bg-white p-4 sm:p-6 neo-shadow flex flex-col sm:flex-row items-center justify-between gap-4 font-bold">
          <div className="flex flex-wrap items-center gap-3"><span>AuraCycle Private Tracker</span><span>•</span><span className="text-[#0081a7]">100% Offline &amp; Local</span></div>
          <div>No AI • No Cloud • No Ads</div>
        </div>
        <p className="text-[11px] text-[#1b2021]/60 text-center mt-3">Estimates are mathematical predictions based on recorded log entries and do not replace professional medical advice.</p>
      </footer>
    </div>
  );
}
