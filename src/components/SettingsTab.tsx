import React, { useState } from 'react';
import { Shield, ArrowRight, Upload, AlertCircle } from 'lucide-react';
import { CycleSettings, DayLog } from '../types';

interface SettingsTabProps {
  settings: CycleSettings;
  onUpdateSettings: (newSettings: CycleSettings) => void;
  logs: DayLog[];
  onImportLogs: (importedLogs: DayLog[], importedSettings?: CycleSettings) => void;
  onClearAllData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  logs,
  onImportLogs,
  onClearAllData,
}) => {
  const [startingCycleLength, setStartingCycleLength] = useState<number>(settings.startingCycleLength || 28);
  const [startingPeriodLength, setStartingPeriodLength] = useState<number>(settings.startingPeriodLength || 5);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      startingCycleLength: Math.max(20, Math.min(50, Number(startingCycleLength))),
      startingPeriodLength: Math.max(1, Math.min(15, Number(startingPeriodLength))),
    });
    setSaveMessage('Baseline estimates updated successfully.');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ settings, logs }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auracycle_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV Data
  const handleExportCSV = () => {
    const headers = ['Date', 'Flow', 'Mood', 'Symptoms', 'Notes'];
    const rows = logs.map(l => [
      l.date,
      l.flow || 'None',
      l.mood || '',
      (l.symptoms || []).join('; '),
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auracycle_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.logs)) {
          onImportLogs(parsed.logs, parsed.settings);
          setSaveMessage(`Successfully imported ${parsed.logs.length} entries.`);
          setTimeout(() => setSaveMessage(null), 4000);
        } else if (Array.isArray(parsed)) {
          onImportLogs(parsed);
          setSaveMessage(`Successfully imported ${parsed.length} entries.`);
          setTimeout(() => setSaveMessage(null), 4000);
        } else {
          alert('Invalid JSON file format.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
      {/* Left Column Stack */}
      <div className="space-y-10">
        {/* Section 01: Infrastructure */}
        <section className="space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c] block">
            [01] Infrastructure
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1a1a1a]">
            Privacy Guarantee
          </h2>
          <p className="font-sans text-sm text-[#1a1a1a]/70 leading-relaxed max-w-2xl">
            AuraCycle is 100% private and offline-first. All your health records are stored strictly in your browser's local storage (<code className="font-mono text-xs bg-[#1a1a1a]/5 px-1 py-0.5 border border-[#1a1a1a]/10">localStorage</code>). There are no user accounts, no cloud servers, no AI model processing, and no third-party tracking.
          </p>
        </section>

        {/* Section 02: Personalization */}
        <section className="space-y-6 pt-6 border-t border-[#1a1a1a]/10">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c] block">
              [02] Personalization
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1a1a1a]">
              Starting Baseline Estimates
            </h2>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#1a1a1a]">
                  Starting Cycle Length (Days)
                </label>
                <input
                  type="number"
                  min={20}
                  max={50}
                  value={startingCycleLength}
                  onChange={e => setStartingCycleLength(Number(e.target.value))}
                  className="w-full bg-transparent border-b border-[#1a1a1a] py-2 font-serif text-2xl text-[#1a1a1a] outline-none focus:border-[#c47c7c]"
                />
                <span className="font-sans text-xs text-[#1a1a1a]/60 block mt-1">
                  Default cycle estimate used before establishing your baseline.
                </span>
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#1a1a1a]">
                  Starting Period Length (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={startingPeriodLength}
                  onChange={e => setStartingPeriodLength(Number(e.target.value))}
                  className="w-full bg-transparent border-b border-[#1a1a1a] py-2 font-serif text-2xl text-[#1a1a1a] outline-none focus:border-[#c47c7c]"
                />
                <span className="font-sans text-xs text-[#1a1a1a]/60 block mt-1">
                  Default estimated duration of bleeding.
                </span>
              </div>
            </div>

            {saveMessage && (
              <div className="p-3 bg-[#f8f7f4] border border-[#1a1a1a]/10 text-xs font-mono text-[#c47c7c]">
                {saveMessage}
              </div>
            )}

            <button
              type="submit"
              className="bg-[#1a1a1a] text-[#f8f7f4] px-6 py-3 font-mono text-xs uppercase tracking-wider font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              SAVE BASELINE ESTIMATES
            </button>
          </form>
        </section>
      </div>

      {/* Right Column Sidebar */}
      <aside className="space-y-8 border-t lg:border-t-0 lg:border-l border-[#1a1a1a]/10 pt-8 lg:pt-0 lg:pl-8 flex flex-col justify-between">
        <div className="space-y-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c] block">
            Data Management
          </span>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleExportJSON}
              className="w-full flex items-center justify-between p-3.5 bg-white border border-[#1a1a1a]/10 hover:border-[#1a1a1a] transition-colors font-mono text-xs uppercase tracking-wider cursor-pointer text-left"
            >
              <span>EXPORT BACKUP (JSON)</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#1a1a1a]/60" />
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="w-full flex items-center justify-between p-3.5 bg-white border border-[#1a1a1a]/10 hover:border-[#1a1a1a] transition-colors font-mono text-xs uppercase tracking-wider cursor-pointer text-left"
            >
              <span>EXPORT LOGS (CSV)</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#1a1a1a]/60" />
            </button>

            <label className="w-full flex items-center justify-between p-3.5 bg-white border border-[#1a1a1a]/10 hover:border-[#1a1a1a] transition-colors font-mono text-xs uppercase tracking-wider cursor-pointer text-left">
              <span>RESTORE BACKUP (JSON)</span>
              <Upload className="w-3.5 h-3.5 text-[#1a1a1a]/60" />
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-8 border-t border-[#1a1a1a]/10 space-y-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c] block">
            Critical Actions
          </span>
          <h3 className="font-serif text-2xl text-[#1a1a1a]">
            Clear All Local Data
          </h3>
          <p className="font-sans text-xs text-[#1a1a1a]/70 leading-relaxed">
            Permanently delete all stored cycle logs and custom settings from this browser's local storage.
          </p>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full p-3.5 bg-transparent border border-[#c47c7c] text-[#c47c7c] hover:bg-[#c47c7c] hover:text-[#f8f7f4] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              DELETE ALL DATA
            </button>
          ) : (
            <div className="p-4 bg-white border border-[#c47c7c] space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-[#c47c7c]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Delete all {logs.length} logged records?</span>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearAllData();
                    setShowDeleteConfirm(false);
                    setSaveMessage('All local data cleared successfully.');
                  }}
                  className="w-full p-2.5 bg-[#c47c7c] text-[#f8f7f4] font-mono text-xs uppercase tracking-wider cursor-pointer"
                >
                  YES, DELETE EVERYTHING
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full p-2.5 bg-white border border-[#1a1a1a]/20 text-[#1a1a1a] font-mono text-xs uppercase tracking-wider cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
