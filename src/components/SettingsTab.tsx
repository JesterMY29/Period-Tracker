import React, { useEffect, useState } from 'react';
import { AlertCircle, Download, Upload } from 'lucide-react';
import { CycleSettings, DayLog } from '../types';
import { parseBackup, serializeBackup } from '../lib/dataValidation';

interface SettingsTabProps {
  settings: CycleSettings;
  onUpdateSettings: (newSettings: CycleSettings) => void;
  logs: DayLog[];
  onImportLogs: (importedLogs: DayLog[], importedSettings?: CycleSettings) => void;
  onClearAllData: () => void;
}

const CYCLE_LENGTH_MIN = 15;
const CYCLE_LENGTH_MAX = 90;
const PERIOD_LENGTH_MIN = 1;
const PERIOD_LENGTH_MAX = 14;

export const SettingsTab: React.FC<SettingsTabProps> = ({ settings, onUpdateSettings, logs, onImportLogs, onClearAllData }) => {
  const [startingCycleLength, setStartingCycleLength] = useState<number>(settings.startingCycleLength || 28);
  const [startingPeriodLength, setStartingPeriodLength] = useState<number>(settings.startingPeriodLength || 5);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setStartingCycleLength(settings.startingCycleLength || 28);
    setStartingPeriodLength(settings.startingPeriodLength || 5);
  }, [settings]);

  const showTemporaryMessage = (message: string, duration = 4000) => {
    setSaveMessage(message);
    window.setTimeout(() => setSaveMessage(null), duration);
  };

  const handleSaveSettings = (event: React.FormEvent) => {
    event.preventDefault();
    onUpdateSettings({
      startingCycleLength: Math.max(CYCLE_LENGTH_MIN, Math.min(CYCLE_LENGTH_MAX, Number(startingCycleLength))),
      startingPeriodLength: Math.max(PERIOD_LENGTH_MIN, Math.min(PERIOD_LENGTH_MAX, Number(startingPeriodLength))),
    });
    showTemporaryMessage('Prediction baseline updated.', 3000);
  };

  const downloadText = (content: string, type: string, filename: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    downloadText(
      serializeBackup(settings, logs),
      'application/json',
      `auracycle_backup_${new Date().toISOString().split('T')[0]}.json`,
    );
    showTemporaryMessage('Versioned backup exported to this device.', 3000);
  };

  const handleExportCSV = () => {
    const escapeCSV = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const headers = ['Date', 'Flow', 'Mood', 'Symptoms', 'Notes'];
    const rows = logs.map(log => [log.date, log.flow || 'None', log.mood || '', (log.symptoms || []).join('; '), log.notes || ''].map(escapeCSV).join(','));
    downloadText([headers.map(escapeCSV).join(','), ...rows].join('\n'), 'text/csv;charset=utf-8;', `auracycle_logs_${new Date().toISOString().split('T')[0]}.csv`);
    showTemporaryMessage('Cycle log exported as CSV.', 3000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = loadEvent => {
      try {
        const raw = loadEvent.target?.result;
        if (typeof raw !== 'string') {
          showTemporaryMessage('Could not read that backup file.');
          return;
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          showTemporaryMessage('That file is not valid JSON. Nothing was changed.');
          return;
        }

        const result = parseBackup(parsed);
        if (result.ok === false) {
          const message = (() => {
            switch (result.error) {
              case 'invalid-json':
                return 'That file is not valid JSON. Nothing was changed.';
              case 'unsupported-format':
                return 'That file is not an AuraCycle backup. Nothing was changed.';
              case 'unsupported-version':
                return 'That AuraCycle backup version is not supported. Nothing was changed.';
              case 'invalid-exported-at':
                return 'That backup has an invalid export timestamp. Nothing was changed.';
              case 'invalid-settings':
                return 'That backup contains invalid prediction settings. Nothing was changed.';
              case 'invalid-logs':
                return 'That backup contains invalid cycle records. Nothing was changed.';
            }
          })();
          showTemporaryMessage(message);
          return;
        }

        onImportLogs(result.backup.logs, result.backup.settings);
        showTemporaryMessage(
          result.legacy
            ? `Legacy backup restored: ${result.backup.logs.length} logged ${result.backup.logs.length === 1 ? 'day' : 'days'}.`
            : `Backup restored: ${result.backup.logs.length} logged ${result.backup.logs.length === 1 ? 'day' : 'days'}.`,
          5000,
        );
      } catch {
        showTemporaryMessage('That backup could not be validated. Nothing was changed.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="max-w-5xl space-y-8">
      <section className="space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c] block">SETTINGS</span>
        <h2 className="font-serif text-4xl sm:text-5xl font-normal text-[#1a1a1a]">Your data. Your control.</h2>
        <p className="font-sans text-sm text-[#1a1a1a]/65 leading-relaxed max-w-2xl">AuraCycle keeps your records on this device. These settings control the starting assumptions used when there is not yet enough cycle history to establish a personal baseline.</p>
      </section>

      {saveMessage && <div role="status" aria-live="polite" className="p-3 bg-[#f8f7f4] border border-[#1a1a1a]/10 text-xs font-mono text-[#c47c7c]">{saveMessage}</div>}

      <section className="p-5 sm:p-7 bg-white border border-[#1a1a1a]/10 space-y-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c] block mb-2">PREDICTION BASELINE</span>
          <h3 className="font-serif text-2xl sm:text-3xl text-[#1a1a1a]">Starting assumptions</h3>
          <p className="mt-2 font-sans text-xs text-[#1a1a1a]/60 leading-relaxed max-w-2xl">Once AuraCycle has enough completed cycles, your recorded history becomes the primary basis for prediction. These values mainly help when your history is still limited.</p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <label className="space-y-2">
              <span className="block font-mono text-[11px] uppercase tracking-wider text-[#1a1a1a]">Typical cycle length</span>
              <div className="flex items-baseline gap-2">
                <input type="number" min={CYCLE_LENGTH_MIN} max={CYCLE_LENGTH_MAX} inputMode="numeric" value={startingCycleLength} onChange={event => setStartingCycleLength(Number(event.target.value))} className="w-24 bg-transparent border-b border-[#1a1a1a] py-2 font-serif text-3xl text-[#1a1a1a] outline-none focus:border-[#c47c7c]" />
                <span className="font-mono text-xs text-[#1a1a1a]/50">days</span>
              </div>
              <span className="block font-sans text-xs text-[#1a1a1a]/55">Allowed range: {CYCLE_LENGTH_MIN}–{CYCLE_LENGTH_MAX} days.</span>
            </label>

            <label className="space-y-2">
              <span className="block font-mono text-[11px] uppercase tracking-wider text-[#1a1a1a]">Typical period length</span>
              <div className="flex items-baseline gap-2">
                <input type="number" min={PERIOD_LENGTH_MIN} max={PERIOD_LENGTH_MAX} inputMode="numeric" value={startingPeriodLength} onChange={event => setStartingPeriodLength(Number(event.target.value))} className="w-24 bg-transparent border-b border-[#1a1a1a] py-2 font-serif text-3xl text-[#1a1a1a] outline-none focus:border-[#c47c7c]" />
                <span className="font-mono text-xs text-[#1a1a1a]/50">days</span>
              </div>
              <span className="block font-sans text-xs text-[#1a1a1a]/55">Allowed range: {PERIOD_LENGTH_MIN}–{PERIOD_LENGTH_MAX} days.</span>
            </label>
          </div>

          <button type="submit" className="bg-[#1a1a1a] text-[#f8f7f4] px-6 py-3 font-mono text-xs uppercase tracking-wider font-medium hover:opacity-90 transition-opacity cursor-pointer">SAVE BASELINE</button>
        </form>
      </section>

      <section className="p-5 sm:p-7 bg-white border border-[#1a1a1a]/10 space-y-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c] block mb-2">PRIVACY & DATA</span>
          <h3 className="font-serif text-2xl sm:text-3xl text-[#1a1a1a]">Keep, move, or remove your records</h3>
          <p className="mt-2 font-sans text-xs text-[#1a1a1a]/60 leading-relaxed max-w-2xl">Your cycle records stay in this browser's local storage. AuraCycle does not require an account or cloud sync for these features.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button type="button" onClick={handleExportJSON} className="flex items-center justify-between gap-3 p-4 border border-[#1a1a1a]/10 hover:border-[#1a1a1a] transition-colors font-mono text-[11px] uppercase tracking-wider text-left cursor-pointer"><span>Backup JSON</span><Download className="w-4 h-4 shrink-0" /></button>
          <button type="button" onClick={handleExportCSV} className="flex items-center justify-between gap-3 p-4 border border-[#1a1a1a]/10 hover:border-[#1a1a1a] transition-colors font-mono text-[11px] uppercase tracking-wider text-left cursor-pointer"><span>Export CSV</span><Download className="w-4 h-4 shrink-0" /></button>
          <label className="flex items-center justify-between gap-3 p-4 border border-[#1a1a1a]/10 hover:border-[#1a1a1a] transition-colors font-mono text-[11px] uppercase tracking-wider text-left cursor-pointer"><span>Restore JSON</span><Upload className="w-4 h-4 shrink-0" /><input type="file" accept=".json,application/json" onChange={handleFileUpload} className="sr-only" /></label>
        </div>
        <div className="flex items-center justify-between gap-4 pt-2 font-mono text-[11px] text-[#1a1a1a]/50"><span>{logs.length} logged {logs.length === 1 ? 'day' : 'days'} stored on this device.</span><span>No account required.</span></div>
      </section>

      <section className="p-5 sm:p-7 border border-[#c47c7c]/40 space-y-5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c] block mb-2">DANGER ZONE</span>
          <h3 className="font-serif text-2xl text-[#1a1a1a]">Clear all local data</h3>
          <p className="mt-2 font-sans text-xs text-[#1a1a1a]/65 leading-relaxed max-w-2xl">This permanently removes cycle logs and custom prediction settings from this browser. Export a backup first if you may want the records later.</p>
        </div>
        {!showDeleteConfirm ? (
          <button type="button" onClick={() => setShowDeleteConfirm(true)} className="w-full sm:w-auto p-3.5 bg-transparent border border-[#c47c7c] text-[#c47c7c] hover:bg-[#c47c7c] hover:text-[#f8f7f4] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer">DELETE ALL DATA</button>
        ) : (
          <div className="p-4 bg-white border border-[#c47c7c] space-y-4 max-w-xl" role="alert">
            <div className="flex items-start gap-3 font-mono text-xs text-[#c47c7c]"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>This will permanently remove all {logs.length} logged {logs.length === 1 ? 'day' : 'days'} and your saved settings.</span></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button type="button" onClick={() => { onClearAllData(); setShowDeleteConfirm(false); showTemporaryMessage('All local data cleared.'); }} className="p-3 bg-[#c47c7c] text-[#f8f7f4] font-mono text-xs uppercase tracking-wider cursor-pointer">YES, DELETE</button>
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className="p-3 bg-white border border-[#1a1a1a]/20 text-[#1a1a1a] font-mono text-xs uppercase tracking-wider cursor-pointer">CANCEL</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
