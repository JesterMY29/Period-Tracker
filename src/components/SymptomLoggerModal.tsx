import React, { useState, useEffect } from 'react';
import { X, Calendar, Trash2, Check, AlertCircle } from 'lucide-react';
import { DayLog, FlowLevel, MoodType, SymptomType } from '../types';

interface SymptomLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  existingLog?: DayLog;
  onSaveLog: (log: DayLog) => void;
  onDeleteLog: (date: string) => void;
}

const FLOW_OPTIONS: FlowLevel[] = ['None', 'Spotting', 'Light', 'Medium', 'Heavy'];
const MOOD_OPTIONS: MoodType[] = ['Great', 'Good', 'Neutral', 'Low', 'Difficult'];
const SYMPTOM_OPTIONS: SymptomType[] = [
  'Cramps',
  'Bloating',
  'Headache',
  'Fatigue',
  'Breast tenderness',
  'Back pain',
  'Nausea',
  'Acne',
  'Other',
];

export const SymptomLoggerModal: React.FC<SymptomLoggerModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  existingLog,
  onSaveLog,
  onDeleteLog,
}) => {
  const [logDate, setLogDate] = useState<string>(selectedDate);
  const [flow, setFlow] = useState<FlowLevel>('None');
  const [mood, setMood] = useState<MoodType | undefined>(undefined);
  const [symptoms, setSymptoms] = useState<SymptomType[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    setLogDate(selectedDate);
    if (existingLog) {
      setFlow(existingLog.flow || 'None');
      setMood(existingLog.mood);
      setSymptoms(existingLog.symptoms || []);
      setNotes(existingLog.notes || '');
    } else {
      setFlow('None');
      setMood(undefined);
      setSymptoms([]);
      setNotes('');
    }
    setShowConfirmDelete(false);
  }, [selectedDate, existingLog, isOpen]);

  if (!isOpen) return null;

  const toggleSymptom = (symptom: SymptomType) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter(s => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const handleSave = () => {
    const updatedLog: DayLog = {
      date: logDate,
      flow,
      mood,
      symptoms,
      notes: notes.trim() ? notes.trim() : undefined,
    };
    onSaveLog(updatedLog);
    onClose();
  };

  const handleDelete = () => {
    onDeleteLog(logDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#f8f7f4] border border-[#1a1a1a]/20 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#1a1a1a]/10 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[#c47c7c]" />
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c] block">
                [LOG ENTRY]
              </span>
              <h2 className="font-serif text-2xl text-[#1a1a1a]">
                Daily Health Record
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#1a1a1a]/5 border border-[#1a1a1a]/10 transition cursor-pointer text-[#1a1a1a]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 font-mono text-xs">
          {/* Date Selector */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-[#c47c7c]">
              ENTRY DATE
            </label>
            <input
              type="date"
              value={logDate}
              onChange={e => setLogDate(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#1a1a1a]/15 font-mono text-sm focus:outline-none focus:border-[#1a1a1a]"
            />
          </div>

          {/* Flow Selector */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-[#c47c7c]">
              MENSTRUAL FLOW
            </label>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {FLOW_OPTIONS.map(option => {
                const isSelected = flow === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFlow(option)}
                    className={`py-2 px-1 border font-mono text-[11px] text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#c47c7c] text-[#f8f7f4] border-[#c47c7c] font-medium'
                        : 'bg-white text-[#1a1a1a] border-[#1a1a1a]/15 hover:border-[#1a1a1a]'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mood Selector */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-[#c47c7c]">
              MOOD
            </label>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {MOOD_OPTIONS.map(option => {
                const isSelected = mood === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMood(isSelected ? undefined : option)}
                    className={`py-2 px-1 border font-mono text-[11px] text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1a1a1a] text-[#f8f7f4] border-[#1a1a1a] font-medium'
                        : 'bg-white text-[#1a1a1a] border-[#1a1a1a]/15 hover:border-[#1a1a1a]'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symptoms Checklist */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-[#c47c7c]">
              SYMPTOMS
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SYMPTOM_OPTIONS.map(symptom => {
                const isChecked = symptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`py-2 px-2.5 border text-left font-mono text-[11px] flex items-center justify-between transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-[#1a1a1a]/5 border-[#1a1a1a] text-[#1a1a1a] font-medium'
                        : 'bg-white text-[#1a1a1a]/80 border-[#1a1a1a]/15 hover:border-[#1a1a1a]'
                    }`}
                  >
                    <span>{symptom}</span>
                    {isChecked && <Check className="w-3.5 h-3.5 text-[#c47c7c]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-[#c47c7c]">
              OPTIONAL NOTES
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Record any additional personal observations..."
              className="w-full p-3 bg-white border border-[#1a1a1a]/15 font-sans text-xs focus:outline-none focus:border-[#1a1a1a]"
            />
          </div>

          {/* Delete Prompt */}
          {existingLog && (
            <div className="pt-2 border-t border-dashed border-[#1a1a1a]/20">
              {!showConfirmDelete ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="font-mono text-xs text-[#c47c7c] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete entry for this date
                </button>
              ) : (
                <div className="p-3 bg-white border border-[#c47c7c] space-y-2">
                  <div className="flex items-center gap-2 text-[#c47c7c] font-mono text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Confirm delete entry for {logDate}?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-1 bg-[#c47c7c] text-[#f8f7f4] font-mono text-xs cursor-pointer"
                    >
                      Yes, Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-3 py-1 bg-white border border-[#1a1a1a]/20 text-[#1a1a1a] font-mono text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-[#1a1a1a]/10 flex items-center justify-end gap-3 font-mono">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#1a1a1a]/15 text-[#1a1a1a] text-xs uppercase tracking-wider hover:border-[#1a1a1a] cursor-pointer"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-[#1a1a1a] text-[#f8f7f4] text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
          >
            SAVE ENTRY
          </button>
        </div>
      </div>
    </div>
  );
};
