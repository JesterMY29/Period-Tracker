import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeTab } from './components/HomeTab';
import { CalendarView } from './components/CalendarView';
import { HistoryTab } from './components/HistoryTab';
import { SettingsTab } from './components/SettingsTab';
import { SymptomLoggerModal } from './components/SymptomLoggerModal';
import { DayLog, CycleSettings, FlowLevel } from './types';
import { getDefaultSettings, getDefaultLogs } from './data/initialData';
import { formatDate } from './lib/cycleUtils';
import { normalizeLogs, normalizeSettings, serializeLogs, serializeSettings } from './lib/dataValidation';
import { createQuickFlowLog } from './lib/quickLog';
import { AppTab, DEFAULT_APP_TAB, resolveAppTab } from './lib/navigation';

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

function readInitialAppTab(): AppTab {
  if (typeof window === 'undefined') return DEFAULT_APP_TAB;
  return resolveAppTab(window.location.hash.slice(1));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(readInitialAppTab);
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

  const handleNavigate = (tab: AppTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const baseUrl = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, '', tab === DEFAULT_APP_TAB ? baseUrl : `${baseUrl}#${tab}`);
    }
  };

  const handleOpenLogModalForDate = (dateStr: string) => {
    setSelectedLogDate(dateStr);
    setIsLoggerOpen(true);
  };

  const handleSaveLog = (newLog: DayLog) => {
    setLogs(prev => normalizeLogs([...prev.filter(log => log.date !== newLog.date), newLog]));
  };

  const handleQuickFlowLog = (flow: FlowLevel) => {
    const existingLog = logs.find(log => log.date === todayStr);
    handleSaveLog(createQuickFlowLog(todayStr, flow, existingLog));
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
    const defaults = getDefaultSettings();
    setLogs([]);
    setSettings(defaults);
    localStorage.removeItem(STORAGE_KEY_LOGS);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
  };

  const existingLog = logs.find(log => log.date === selectedLogDate);

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#2d2d2a] font-sans antialiased flex flex-col selection:bg-[#fed9b7]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:px-4 focus:py-3 focus:bg-[#1a1a1a] focus:text-white focus:font-mono focus:text-xs focus:rounded-sm"
      >
        Skip to main content
      </a>
      <Header activeTab={activeTab} setActiveTab={handleNavigate} onOpenLogModal={() => handleOpenLogModalForDate(todayStr)} />
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 outline-none">
        {activeTab === 'home' && <HomeTab logs={logs} settings={settings} onOpenLogModal={handleOpenLogModalForDate} onQuickFlowLog={handleQuickFlowLog} onNavigateToCalendar={() => handleNavigate('calendar')} />}
        {activeTab === 'calendar' && <CalendarView logs={logs} settings={settings} onSelectDate={handleOpenLogModalForDate} />}
        {activeTab === 'history' && <HistoryTab logs={logs} settings={settings} />}
        {activeTab === 'settings' && <SettingsTab settings={settings} onUpdateSettings={setSettings} logs={logs} onImportLogs={handleImportLogs} onClearAllData={handleClearAllData} />}
      </main>
      <SymptomLoggerModal isOpen={isLoggerOpen} onClose={() => setIsLoggerOpen(false)} selectedDate={selectedLogDate} existingLog={existingLog} onSaveLog={handleSaveLog} onDeleteLog={handleDeleteLog} />
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 pb-8 w-full">
        <div className="card-faint p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c]">AuraCycle</p>
            <p className="font-mono text-[10px] text-[#1a1a1a]/55 mt-1">Your cycle records stay on this device. No account is required.</p>
          </div>
          <p className="font-mono text-[10px] text-[#1a1a1a]/45">Private by design</p>
        </div>
        <p className="text-[10px] text-[#1a1a1a]/45 text-center mt-3">Estimates are mathematical predictions based on recorded entries and do not replace professional medical advice.</p>
      </footer>
    </div>
  );
}
