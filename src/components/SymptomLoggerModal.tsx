import React, { useState, useEffect, useRef } from 'react';
import { X, CalendarDays, Trash2, Check, AlertCircle, Droplets } from 'lucide-react';
import { DayLog, FlowLevel, MoodType, SymptomType } from '../types';

interface SymptomLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
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

const FLOW_HINTS: Record<FlowLevel, string> = {
  None: 'No bleeding today',
  Spotting: 'Very light spotting',
  Light: 'Light bleeding',
  Medium: 'Typical flow',
  Heavy: 'Heavy bleeding',
};

type DraftSnapshot = {
  logDate: string;
  flow: FlowLevel;
  mood?: MoodType;
  symptoms: SymptomType[];
  notes: string;
};

const serializeDraft = (draft: DraftSnapshot): string => JSON.stringify(draft);

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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const initialDraftRef = useRef<string>('');

  useEffect(() => {
    const initialDraft: DraftSnapshot = existingLog
      ? {
          logDate: selectedDate,
          flow: existingLog.flow || 'None',
          mood: existingLog.mood,
          symptoms: existingLog.symptoms || [],
          notes: existingLog.notes || '',
        }
      : {
          logDate: selectedDate,
          flow: 'None',
          mood: undefined,
          symptoms: [],
          notes: '',
        };

    setLogDate(initialDraft.logDate);
    setFlow(initialDraft.flow);
    setMood(initialDraft.mood);
    setSymptoms(initialDraft.symptoms);
    setNotes(initialDraft.notes);
    initialDraftRef.current = serializeDraft(initialDraft);
    setShowConfirmDelete(false);
  }, [selectedDate, existingLog, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const hasUnsavedChanges = serializeDraft({ logDate, flow, mood, symptoms, notes }) !== initialDraftRef.current;

  const requestClose = () => {
    if (!hasUnsavedChanges) {
      onClose();
      return;
    }

    const canConfirm = typeof window !== 'undefined' && typeof window.confirm === 'function';
    if (!canConfirm || window.confirm('You have unsaved changes. Discard them?')) {
      onClose();
    }
  };

  const toggleSymptom = (symptom: SymptomType) => {
    setSymptoms(current => current.includes(symptom)
      ? current.filter(item => item !== symptom)
      : [...current, symptom]
    );
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-dialog-title"
        aria-describedby="log-dialog-description"
        className="bg-[#f8f7f4] border border-[#1a1a1a]/15 w-full sm:max-w-lg max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl rounded-t-2xl sm:rounded-none"
      >
        <div className="p-5 sm:p-6 border-b border-[#1a1a1a]/10 bg-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c47c7c] block mb-1">
                {existingLog ? 'EDIT RECORD' : 'DAILY CHECK-IN'}
              </span>
              <h2 id="log-dialog-title" className="font-serif text-2xl sm:text-3xl text-[#1a1a1a]">
                {existingLog ? 'Update your day' : 'How was today?'}
              </h2>
              <p id="log-dialog-description" className="text-xs text-[#1a1a1a]/55 mt-1">
                Log the essentials first. Everything else is optional.
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close log"
              onClick={requestClose}
              className="p-2 border border-[#1a1a1a]/10 hover:bg-[#1a1a1a]/5 transition cursor-pointer text-[#1a1a1a]"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#1a1a1a]/70">
            <CalendarDays className="w-4 h-4" aria-hidden="true" />
            <label htmlFor="log-date">Date</label>
            <input
              id="log-date"
              type="date"
              value={logDate}
              onChange={e => setLogDate(e.target.value)}
              className="ml-auto bg-[#f8f7f4] border border-[#1a1a1a]/15 px-2.5 py-2 font-mono text-xs focus:outline-none focus:border-[#1a1a1a]"
            />
          </div>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-7 flex-1">
          <section aria-labelledby="flow-heading" className="space-y-3">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-[#c47c7c]" aria-hidden="true" />
              <div>
                <h3 id="flow-heading" className="text-sm font-semibold text-[#1a1a1a]">What was your flow?</h3>
                <p className="text-[11px] text-[#1a1a1a]/50">This is the most important part of today's log.</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {FLOW_OPTIONS.map(option => {
                const isSelected = flow === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setFlow(option)}
                    className={`min-h-16 sm:min-h-20 px-1.5 border rounded-lg font-medium text-[11px] sm:text-xs text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#c47c7c] text-white border-[#c47c7c] shadow-sm'
                        : 'bg-white text-[#1a1a1a] border-[#1a1a1a]/12 hover:border-[#1a1a1a]/40'
                    }`}
                  >
                    <span className="block">{option}</span>
                    <span className={`block mt-1 text-[9px] leading-tight ${isSelected ? 'text-white/80' : 'text-[#1a1a1a]/40'}`}>
                      {FLOW_HINTS[option]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="mood-heading" className="space-y-3">
            <div>
              <h3 id="mood-heading" className="text-sm font-semibold text-[#1a1a1a]">How do you feel?</h3>
              <p className="text-[11px] text-[#1a1a1a]/50">Optional</p>
            </div>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {MOOD_OPTIONS.map(option => {
                const isSelected = mood === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setMood(isSelected ? undefined : option)}
                    className={`py-2.5 px-1 border rounded-lg text-[10px] sm:text-[11px] text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] font-medium'
                        : 'bg-white text-[#1a1a1a]/80 border-[#1a1a1a]/12 hover:border-[#1a1a1a]/40'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="symptoms-heading" className="space-y-3">
            <div>
              <h3 id="symptoms-heading" className="text-sm font-semibold text-[#1a1a1a]">Any symptoms?</h3>
              <p className="text-[11px] text-[#1a1a1a]/50">Select any that apply · Optional</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SYMPTOM_OPTIONS.map(symptom => {
                const isChecked = symptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    aria-pressed={isChecked}
                    onClick={() => toggleSymptom(symptom)}
                    className={`py-2.5 px-2.5 border rounded-lg text-left text-[11px] flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-[#1a1a1a]/5 border-[#1a1a1a] text-[#1a1a1a] font-medium'
                        : 'bg-white text-[#1a1a1a]/75 border-[#1a1a1a]/12 hover:border-[#1a1a1a]/40'
                    }`}
                  >
                    <span>{symptom}</span>
                    {isChecked && <Check className="w-3.5 h-3.5 text-[#c47c7c] shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="notes-heading" className="space-y-3">
            <div>
              <h3 id="notes-heading" className="text-sm font-semibold text-[#1a1a1a]">Anything else?</h3>
              <p className="text-[11px] text-[#1a1a1a]/50">Optional note for your future self</p>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="A quick observation, if useful..."
              className="w-full p-3 bg-white border border-[#1a1a1a]/12 rounded-lg text-sm focus:outline-none focus:border-[#1a1a1a] resize-none"
            />
          </section>

          {existingLog && (
            <div className="pt-2 border-t border-dashed border-[#1a1a1a]/15">
              {!showConfirmDelete ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="text-xs text-[#c47c7c] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Delete this day's record
                </button>
              ) : (
                <div className="p-3 bg-white border border-[#c47c7c] rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-[#c47c7c] text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Delete the record for {logDate}?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleDelete} className="px-3 py-2 bg-[#c47c7c] text-white text-xs rounded-md cursor-pointer">
                      Yes, delete
                    </button>
                    <button type="button" onClick={() => setShowConfirmDelete(false)} className="px-3 py-2 bg-white border border-[#1a1a1a]/15 text-[#1a1a1a] text-xs rounded-md cursor-pointer">
                      Keep record
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 bg-white border-t border-[#1a1a1a]/10 flex gap-2 sm:gap-3 font-mono">
          <button
            type="button"
            onClick={requestClose}
            className="flex-1 sm:flex-none px-4 py-3 border border-[#1a1a1a]/15 text-[#1a1a1a] text-xs uppercase tracking-wider rounded-lg hover:border-[#1a1a1a] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-none sm:min-w-36 px-5 py-3 bg-[#1a1a1a] text-white text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            Save check-in
          </button>
        </div>
      </div>
    </div>
  );
};