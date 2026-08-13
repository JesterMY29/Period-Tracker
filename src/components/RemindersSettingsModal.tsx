import React, { useState } from 'react';
import { CycleSettings, DayLog } from '../types';
import { Settings, Bell, Calendar, Download, RefreshCw, Trash2, Check, User } from 'lucide-react';

interface RemindersSettingsModalProps {
  settings: CycleSettings;
  onUpdateSettings: (newSettings: CycleSettings) => void;
  logs: DayLog[];
  onResetSampleData: () => void;
  onClearAllData: () => void;
}

export const RemindersSettingsModal: React.FC<RemindersSettingsModalProps> = ({
  settings,
  onUpdateSettings,
  logs,
  onResetSampleData,
  onClearAllData,
}) => {
  const [avgCycleLength, setAvgCycleLength] = useState(settings.avgCycleLength);
  const [avgPeriodLength, setAvgPeriodLength] = useState(settings.avgPeriodLength);
  const [lastPeriodStartDate, setLastPeriodStartDate] = useState(settings.lastPeriodStartDate);
  const [userName, setUserName] = useState(settings.userName || '');
  const [periodDaysBefore, setPeriodDaysBefore] = useState(settings.notificationPeriodDaysBefore);
  const [ovulationDaysBefore, setOvulationDaysBefore] = useState(settings.notificationOvulationDaysBefore);
  const [enableDailyReminder, setEnableDailyReminder] = useState(settings.enableDailyReminder);
  const [reminderTime, setReminderTime] = useState(settings.reminderTime);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onUpdateSettings({
      avgCycleLength,
      avgPeriodLength,
      lastPeriodStartDate,
      userName: userName.trim() || 'Aura User',
      notificationPeriodDaysBefore: periodDaysBefore,
      notificationOvulationDaysBefore: ovulationDaysBefore,
      enableDailyReminder,
      reminderTime,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ settings, logs }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `auracycle_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    let csv = 'Date,Flow,Symptoms,Moods,Water_Oz,Sleep_Hrs,Sleep_Quality,BBT,Notes\n';
    logs.forEach(log => {
      const syms = `"${log.symptoms.join(';')}"`;
      const mds = `"${log.moods.join(';')}"`;
      const nts = `"${(log.notes || '').replace(/"/g, '""')}"`;
      csv += `${log.date},${log.flow},${syms},${mds},${log.waterOz || ''},${log.sleepHours || ''},${log.sleepQuality || ''},${log.bbt || ''},${nts}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `auracycle_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="neo-border-4 bg-white p-6 sm:p-10 neo-shadow space-y-8 max-w-4xl mx-auto">
      <div className="border-b-2 border-[#1b2021] pb-4">
        <span className="neo-badge transform -rotate-1 bg-[#f07167] text-white mb-2">
          APP CONFIGURATION
        </span>
        <h2 className="text-3xl font-extrabold text-[#1b2021] flex items-center gap-3">
          <Settings className="w-6 h-6 text-[#0081a7]" />
          Settings &amp; Cycle Parameters
        </h2>
        <p className="font-mono text-xs text-[#0081a7] mt-1">
          Tailor your average cycle duration, last period start date, and notifications.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-[#fed9b7] border-2 border-[#1b2021] neo-shadow-sm font-mono text-xs font-bold text-[#1b2021] flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-[#0081a7]" />
          Cycle settings successfully saved!
        </div>
      )}

      {/* Cycle Parameters Form */}
      <div className="space-y-6">
        <h3 className="font-mono text-xs font-bold text-[#0081a7] uppercase tracking-widest">
          CYCLE PARAMETERS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-[#fffbf2] border-2 border-[#1b2021]">
            <label className="flex items-center gap-2 font-mono text-xs font-bold text-[#1b2021] mb-2">
              <User className="w-4 h-4 text-[#f07167]" />
              YOUR NAME / PROFILE
            </label>
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="e.g. Maya"
              className="w-full px-4 py-2 text-sm font-mono bg-white border-2 border-[#1b2021] focus:outline-none"
            />
          </div>

          <div className="p-5 bg-[#fffbf2] border-2 border-[#1b2021]">
            <label className="flex items-center gap-2 font-mono text-xs font-bold text-[#1b2021] mb-2">
              <Calendar className="w-4 h-4 text-[#f07167]" />
              LAST PERIOD START DATE
            </label>
            <input
              type="date"
              value={lastPeriodStartDate}
              onChange={e => setLastPeriodStartDate(e.target.value)}
              className="w-full px-4 py-2 text-sm font-mono bg-white border-2 border-[#1b2021] focus:outline-none cursor-pointer"
            />
          </div>

          <div className="p-5 bg-[#fffbf2] border-2 border-[#1b2021]">
            <div className="flex items-center justify-between mb-2 font-mono">
              <label className="text-xs font-bold text-[#1b2021]">
                AVG CYCLE LENGTH
              </label>
              <span className="text-xs font-bold text-[#f07167]">{avgCycleLength} Days</span>
            </div>
            <input
              type="range"
              min="21"
              max="40"
              value={avgCycleLength}
              onChange={e => setAvgCycleLength(parseInt(e.target.value))}
              className="w-full accent-[#f07167] cursor-pointer"
            />
            <p className="font-mono text-[11px] text-[#1b2021]/70 mt-1">Typical range: 21 to 35 days.</p>
          </div>

          <div className="p-5 bg-[#fffbf2] border-2 border-[#1b2021]">
            <div className="flex items-center justify-between mb-2 font-mono">
              <label className="text-xs font-bold text-[#1b2021]">
                AVG PERIOD DURATION
              </label>
              <span className="text-xs font-bold text-[#f07167]">{avgPeriodLength} Days</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              value={avgPeriodLength}
              onChange={e => setAvgPeriodLength(parseInt(e.target.value))}
              className="w-full accent-[#f07167] cursor-pointer"
            />
            <p className="font-mono text-[11px] text-[#1b2021]/70 mt-1">Typical bleeding duration: 3 to 7 days.</p>
          </div>
        </div>

        {/* Notifications & Reminders */}
        <h3 className="font-mono text-xs font-bold text-[#0081a7] uppercase tracking-widest pt-4">
          REMINDERS &amp; ALERTS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-[#fffbf2] border-2 border-[#1b2021]">
            <label className="flex items-center gap-2 font-mono text-xs font-bold text-[#1b2021] mb-2">
              <Bell className="w-4 h-4 text-[#f07167]" />
              PERIOD PREDICTION ALERT
            </label>
            <select
              value={periodDaysBefore}
              onChange={e => setPeriodDaysBefore(parseInt(e.target.value))}
              className="w-full px-4 py-2 text-sm font-mono bg-white border-2 border-[#1b2021] focus:outline-none cursor-pointer"
            >
              <option value={1}>1 Day Before</option>
              <option value={2}>2 Days Before</option>
              <option value={3}>3 Days Before</option>
            </select>
          </div>

          <div className="p-5 bg-[#fffbf2] border-2 border-[#1b2021]">
            <label className="flex items-center gap-2 font-mono text-xs font-bold text-[#1b2021] mb-2">
              <Bell className="w-4 h-4 text-[#0081a7]" />
              OVULATION / FERTILE ALERT
            </label>
            <select
              value={ovulationDaysBefore}
              onChange={e => setOvulationDaysBefore(parseInt(e.target.value))}
              className="w-full px-4 py-2 text-sm font-mono bg-white border-2 border-[#1b2021] focus:outline-none cursor-pointer"
            >
              <option value={1}>1 Day Before</option>
              <option value={2}>2 Days Before</option>
            </select>
          </div>
        </div>

        <button
          id="save-settings-btn"
          onClick={handleSave}
          className="neo-btn bg-[#0081a7] text-white px-6 py-3 text-xs cursor-pointer"
        >
          Save Configuration
        </button>

        {/* Export Data & Reset */}
        <h3 className="font-mono text-xs font-bold text-[#0081a7] uppercase tracking-widest pt-6">
          DATA MANAGEMENT &amp; BACKUP
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="neo-btn bg-white text-[#1b2021] px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>

          <button
            id="export-json-btn"
            onClick={handleExportJSON}
            className="neo-btn bg-white text-[#1b2021] px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>

          <button
            id="reset-sample-data-btn"
            onClick={onResetSampleData}
            className="neo-btn bg-[#fed9b7] text-[#1b2021] px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Reset 3-Month Data
          </button>

          <button
            id="clear-data-btn"
            onClick={onClearAllData}
            className="neo-btn bg-[#f07167] text-white px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Clear All Logs
          </button>
        </div>
      </div>
    </div>
  );
};
