import React, { useState, useEffect } from 'react';
import { DayLog, FlowLevel, SymptomType, MoodType } from '../types';
import {
  X,
  Droplets,
  Smile,
  Activity,
  Moon,
  GlassWater,
  Thermometer,
  FileText,
  Check,
  Calendar as CalendarIcon,
} from 'lucide-react';

interface SymptomLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  existingLog?: DayLog;
  onSaveLog: (log: DayLog) => void;
}

const FLOW_OPTIONS: FlowLevel[] = ['None', 'Spotting', 'Light', 'Medium', 'Heavy'];

const SYMPTOM_OPTIONS: SymptomType[] = [
  'Cramps',
  'Bloating',
  'Headache',
  'Acne',
  'Tender Breasts',
  'Backache',
  'Nausea',
  'Fatigue',
  'Cravings',
  'Mood Swings',
  'Insomnia',
  'Brain Fog',
];

const MOOD_OPTIONS: MoodType[] = [
  'Calm',
  'Energetic',
  'Anxious',
  'Irritable',
  'Sad',
  'Happy',
  'Focused',
  'Sensitive',
  'Exhausted',
  'Loving',
];

export const SymptomLoggerModal: React.FC<SymptomLoggerModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  existingLog,
  onSaveLog,
}) => {
  const [flow, setFlow] = useState<FlowLevel>('None');
  const [symptoms, setSymptoms] = useState<SymptomType[]>([]);
  const [moods, setMoods] = useState<MoodType[]>([]);
  const [waterOz, setWaterOz] = useState<number>(64);
  const [sleepHours, setSleepHours] = useState<number>(8);
  const [sleepQuality, setSleepQuality] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [bbt, setBbt] = useState<string>('');
  const [cervicalMucus, setCervicalMucus] = useState<
    'Dry' | 'Sticky' | 'Creamy' | 'Egg White' | 'Watery' | undefined
  >(undefined);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (existingLog) {
      setFlow(existingLog.flow || 'None');
      setSymptoms(existingLog.symptoms || []);
      setMoods(existingLog.moods || []);
      setWaterOz(existingLog.waterOz ?? 64);
      setSleepHours(existingLog.sleepHours ?? 8);
      setSleepQuality(existingLog.sleepQuality ?? 4);
      setBbt(existingLog.bbt ? String(existingLog.bbt) : '');
      setCervicalMucus(existingLog.cervicalMucus);
      setNotes(existingLog.notes || '');
    } else {
      setFlow('None');
      setSymptoms([]);
      setMoods([]);
      setWaterOz(64);
      setSleepHours(8);
      setSleepQuality(4);
      setBbt('');
      setCervicalMucus(undefined);
      setNotes('');
    }
  }, [existingLog, selectedDate, isOpen]);

  if (!isOpen) return null;

  const toggleSymptom = (s: SymptomType) => {
    setSymptoms(prev =>
      prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
    );
  };

  const toggleMood = (m: MoodType) => {
    setMoods(prev =>
      prev.includes(m) ? prev.filter(item => item !== m) : [...prev, m]
    );
  };

  const handleSave = () => {
    const updatedLog: DayLog = {
      date: selectedDate,
      flow,
      symptoms,
      moods,
      waterOz,
      sleepHours,
      sleepQuality,
      bbt: bbt ? parseFloat(bbt) : undefined,
      cervicalMucus,
      notes: notes.trim() || undefined,
    };
    onSaveLog(updatedLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1b2021]/60 backdrop-blur-xs animate-fadeIn">
      <div className="neo-border-4 bg-white w-full max-w-2xl max-h-[90vh] neo-shadow flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b-2 border-[#1b2021] flex items-center justify-between bg-[#fffbf2]">
          <div className="flex items-center gap-3">
            <div className="p-2 border-2 border-[#1b2021] bg-[#f07167] text-white neo-shadow-sm">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#1b2021]">
                Log Entry for {selectedDate}
              </h3>
              <p className="font-mono text-xs text-[#0081a7]">Record how your body feels today.</p>
            </div>
          </div>
          <button
            id="logger-modal-close-btn"
            onClick={onClose}
            className="p-2 font-bold text-[#1b2021] hover:bg-[#fed9b7] border-2 border-[#1b2021] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Flow Level Selection */}
          <div>
            <label className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[#1b2021] mb-2.5">
              <Droplets className="w-4 h-4 text-[#f07167]" />
              PERIOD FLOW
            </label>
            <div className="grid grid-cols-5 gap-2">
              {FLOW_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFlow(opt)}
                  className={`py-3 px-2 font-mono text-xs font-bold border-2 border-[#1b2021] transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    flow === opt
                      ? 'bg-[#f07167] text-white neo-shadow-sm'
                      : 'bg-[#fffbf2] text-[#1b2021] hover:bg-[#fed9b7]'
                  }`}
                >
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Physical Symptoms */}
          <div>
            <label className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[#1b2021] mb-2.5">
              <Activity className="w-4 h-4 text-[#0081a7]" />
              PHYSICAL SYMPTOMS
            </label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map(symptom => {
                const isSelected = symptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-3 py-1.5 font-mono text-xs font-bold border-2 border-[#1b2021] transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#f07167] text-white neo-shadow-sm'
                        : 'bg-[#fffbf2] text-[#1b2021] hover:bg-[#fed9b7]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                    {symptom}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mood Tracking */}
          <div>
            <label className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[#1b2021] mb-2.5">
              <Smile className="w-4 h-4 text-[#0081a7]" />
              MOOD &amp; ENERGY
            </label>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map(mood => {
                const isSelected = moods.includes(mood);
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => toggleMood(mood)}
                    className={`px-3 py-1.5 font-mono text-xs font-bold border-2 border-[#1b2021] transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#0081a7] text-white neo-shadow-sm'
                        : 'bg-[#fffbf2] text-[#1b2021] hover:bg-[#fed9b7]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                    {mood}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sleep & Water Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sleep Duration */}
            <div className="p-5 bg-[#fffbf2] border-2 border-[#1b2021]">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-mono text-xs font-bold text-[#1b2021]">
                  <Moon className="w-4 h-4 text-[#0081a7]" />
                  SLEEP DURATION
                </label>
                <span className="font-mono text-xs font-bold text-[#f07167]">
                  {sleepHours} hrs
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={e => setSleepHours(parseFloat(e.target.value))}
                className="w-full accent-[#f07167] cursor-pointer"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="font-mono text-[11px] text-[#1b2021]">QUALITY:</span>
                <div className="flex gap-1">
                  {([1, 2, 3, 4, 5] as const).map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSleepQuality(star)}
                      className={`text-sm px-1.5 py-0.5 border border-[#1b2021] font-bold ${
                        sleepQuality >= star ? 'bg-[#f07167] text-white' : 'bg-white text-[#1b2021]'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Water Intake */}
            <div className="p-5 bg-[#fffbf2] border-2 border-[#1b2021]">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-mono text-xs font-bold text-[#1b2021]">
                  <GlassWater className="w-4 h-4 text-[#0081a7]" />
                  WATER INTAKE
                </label>
                <span className="font-mono text-xs font-bold text-[#0081a7]">
                  {waterOz} oz ({Math.round(waterOz / 8)} glasses)
                </span>
              </div>
              <input
                type="range"
                min="16"
                max="160"
                step="8"
                value={waterOz}
                onChange={e => setWaterOz(parseInt(e.target.value))}
                className="w-full accent-[#0081a7] cursor-pointer"
              />
            </div>
          </div>

          {/* Basal Body Temperature & Cervical Mucus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-[#fffbf2] border-2 border-[#1b2021]">
              <label className="flex items-center gap-2 font-mono text-xs font-bold text-[#1b2021] mb-2">
                <Thermometer className="w-4 h-4 text-[#f07167]" />
                BASAL BODY TEMP (°F)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 97.6"
                value={bbt}
                onChange={e => setBbt(e.target.value)}
                className="w-full px-4 py-2 text-sm font-mono bg-white border-2 border-[#1b2021] focus:outline-none"
              />
            </div>

            <div className="p-5 bg-[#fffbf2] border-2 border-[#1b2021]">
              <label className="flex items-center gap-2 font-mono text-xs font-bold text-[#1b2021] mb-2">
                CERVICAL MUCUS FLUID
              </label>
              <select
                value={cervicalMucus || ''}
                onChange={e =>
                  setCervicalMucus(
                    (e.target.value as any) || undefined
                  )
                }
                className="w-full px-4 py-2 text-sm font-mono bg-white border-2 border-[#1b2021] focus:outline-none cursor-pointer"
              >
                <option value="">None / Not Tracked</option>
                <option value="Dry">Dry</option>
                <option value="Sticky">Sticky</option>
                <option value="Creamy">Creamy</option>
                <option value="Egg White">Egg White (Fertile)</option>
                <option value="Watery">Watery</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[#1b2021] mb-2.5">
              <FileText className="w-4 h-4 text-[#1b2021]" />
              JOURNAL &amp; PERSONAL NOTES
            </label>
            <textarea
              rows={3}
              placeholder="How are you feeling overall today? Write down any thoughts..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-4 text-sm font-sans bg-[#fffbf2] border-2 border-[#1b2021] focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t-2 border-[#1b2021] flex items-center justify-end gap-3 bg-[#fffbf2]">
          <button
            id="logger-modal-cancel-btn"
            type="button"
            onClick={onClose}
            className="neo-btn bg-white text-[#1b2021] px-5 py-2.5 text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="logger-modal-save-btn"
            type="button"
            onClick={handleSave}
            className="neo-btn bg-[#f07167] text-white px-6 py-2.5 text-xs cursor-pointer"
          >
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
};
