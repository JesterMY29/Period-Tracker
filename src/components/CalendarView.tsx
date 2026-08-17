import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, CircleCheck } from 'lucide-react';
import { DayLog, CycleSettings } from '../types';
import { formatDate, formatDisplayDate, getPrediction } from '../lib/cycleUtils';

interface CalendarViewProps {
  logs: DayLog[];
  settings: CycleSettings;
  onSelectDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ logs, settings, onSelectDate }) => {
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDate(new Date()));
  const todayStr = formatDate(new Date());
  const prediction = getPrediction(logs, settings);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthLabel = currentMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const logsByDate = useMemo(() => new Map(logs.map(log => [log.date, log])), [logs]);
  const selectedLog = logsByDate.get(selectedDate);
  const selectedIsPredicted = Boolean(
    prediction && selectedDate >= prediction.predictedWindowStart && selectedDate <= prediction.predictedWindowEnd,
  );
  const selectedIsPeriod = Boolean(selectedLog && selectedLog.flow !== 'None');
  const selectedHasDetails = Boolean(
    selectedLog && (selectedLog.flow !== 'None' || selectedLog.symptoms?.length || selectedLog.mood || selectedLog.notes),
  );

  const moveMonth = (offset: number) => {
    setCurrentMonthDate(new Date(year, month + offset, 1));
    setSelectedDate('');
  };

  const goToToday = () => {
    setCurrentMonthDate(new Date());
    setSelectedDate(todayStr);
  };

  const selectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    onSelectDate(dateStr);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const calendarDays: Array<{ dateStr: string; isCurrentMonth: boolean; dayNum: number }> = [];

  for (let i = firstDay - 1; i >= 0; i -= 1) {
    const date = new Date(year, month - 1, previousMonthDays - i);
    calendarDays.push({ dateStr: formatDate(date), isCurrentMonth: false, dayNum: date.getDate() });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    calendarDays.push({ dateStr: formatDate(date), isCurrentMonth: true, dayNum: day });
  }

  const totalCells = Math.ceil(calendarDays.length / 7) * 7;
  for (let day = 1; calendarDays.length < totalCells; day += 1) {
    const date = new Date(year, month + 1, day);
    calendarDays.push({ dateStr: formatDate(date), isCurrentMonth: false, dayNum: day });
  }

  return (
    <div className="space-y-5 sm:space-y-6 font-sans">
      <section className="card-refined p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-[#1a1a1a]/10 bg-[#f8f7f4]">
              <CalendarDays className="w-5 h-5 text-[#c47c7c]" aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c]">Calendar</p>
              <h1 className="font-serif text-2xl sm:text-3xl mt-1">{monthLabel}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month" className="p-2 border border-[#1a1a1a]/15 bg-white hover:border-[#1a1a1a] rounded-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c47c7c]">
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={goToToday} className="px-3 py-2 border border-[#1a1a1a]/15 bg-[#f8f7f4] font-mono text-[10px] uppercase tracking-wider hover:border-[#1a1a1a] rounded-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c47c7c]">
              Today
            </button>
            <button type="button" onClick={() => moveMonth(1)} aria-label="Next month" className="p-2 border border-[#1a1a1a]/15 bg-white hover:border-[#1a1a1a] rounded-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c47c7c]">
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section className="card-refined p-4 sm:p-5" aria-label="Calendar legend">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] text-[#1a1a1a]/70">
          <span className="uppercase tracking-widest text-[#c47c7c]">Key</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-[#c47c7c]" aria-hidden="true" /> Period</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-[#c47c7c]/10 border border-dashed border-[#c47c7c]" aria-hidden="true" /> Prediction window</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-[#1a1a1a]/5 border border-[#1a1a1a]/15" aria-hidden="true" /> Other log</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#1a1a1a]" aria-hidden="true" /> Today</span>
        </div>
      </section>

      <section className="card-refined overflow-hidden" aria-label={`${monthLabel} cycle calendar`}>
        <div className="grid grid-cols-7 bg-[#1a1a1a] text-[#f8f7f4] text-center py-2.5 font-mono text-[10px] tracking-widest" aria-hidden="true">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => <div key={day}>{day}</div>)}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map(({ dateStr, isCurrentMonth, dayNum }, index) => {
            const log = logsByDate.get(dateStr);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const isPeriodDay = Boolean(log && log.flow !== 'None');
            const isOtherLoggedDay = Boolean(log && log.flow === 'None' && ((log.symptoms?.length ?? 0) > 0 || log.mood || log.notes));
            const isPredicted = Boolean(prediction && dateStr >= prediction.predictedWindowStart && dateStr <= prediction.predictedWindowEnd);

            let background = 'bg-white hover:bg-[#f8f7f4] text-[#1a1a1a]';
            if (!isCurrentMonth) background = 'bg-[#f8f7f4]/50 text-[#1a1a1a]/25';
            else if (isPeriodDay) background = 'bg-[#c47c7c] text-[#f8f7f4]';
            else if (isPredicted) background = 'bg-[#c47c7c]/10 text-[#c47c7c]';
            else if (isOtherLoggedDay) background = 'bg-[#1a1a1a]/5 text-[#1a1a1a]';

            const state = [
              isPeriodDay ? `${log?.flow} flow` : '',
              isPredicted ? 'predicted period window' : '',
              isOtherLoggedDay ? 'other log' : '',
              isToday ? 'today' : '',
              isSelected ? 'selected' : '',
            ].filter(Boolean).join(', ');

            return (
              <button
                key={`${dateStr}-${index}`}
                type="button"
                onClick={() => selectDate(dateStr)}
                aria-label={`${dateStr}${state ? `, ${state}` : ''}`}
                aria-pressed={isSelected}
                className={`min-h-[76px] sm:min-h-[94px] p-2 border-b border-r border-[#1a1a1a]/10 flex flex-col justify-between text-left transition-colors cursor-pointer rounded-none focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1a1a1a] ${isSelected ? 'ring-2 ring-inset ring-[#1a1a1a]' : ''} ${background}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className={isToday ? 'w-5 h-5 rounded-full bg-[#1a1a1a] text-[#f8f7f4] flex items-center justify-center font-bold text-[10px]' : 'font-mono text-xs'}>
                    {dayNum}
                  </span>
                  {isToday && <span className="hidden sm:inline font-mono text-[8px] uppercase tracking-wider">Today</span>}
                </div>

                <div className="space-y-1 mt-2">
                  {isPeriodDay && <span className="block truncate px-1 py-0.5 bg-white/20 font-mono text-[8px] uppercase tracking-wider">{log?.flow}</span>}
                  {isOtherLoggedDay && <span className="block truncate px-1 py-0.5 bg-[#1a1a1a] text-[#f8f7f4] font-mono text-[8px] uppercase tracking-wider">Logged</span>}
                  {isPredicted && !isPeriodDay && <span className="block truncate px-1 py-0.5 bg-[#c47c7c] text-[#f8f7f4] font-mono text-[8px] uppercase tracking-wider">Predicted</span>}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card-refined p-5 sm:p-6" aria-label="Selected calendar day">
        {selectedDate ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <CircleCheck className="w-5 h-5 text-[#c47c7c] mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c]">Selected day</p>
                <h2 className="font-serif text-xl mt-1">{formatDisplayDate(selectedDate)}</h2>
                <p className="font-mono text-[11px] text-[#1a1a1a]/55 mt-1">
                  {selectedIsPeriod
                    ? `${selectedLog?.flow} flow recorded`
                    : selectedHasDetails
                      ? 'Daily entry recorded'
                      : selectedIsPredicted
                        ? 'Inside the estimated prediction window'
                        : 'No entry recorded'}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => onSelectDate(selectedDate)} className="btn-secondary w-full sm:w-auto cursor-pointer">
              {selectedHasDetails ? 'Edit day' : 'Add entry'}
            </button>
          </div>
        ) : (
          <p className="font-mono text-xs text-[#1a1a1a]/55">Select a day to review its record.</p>
        )}
      </section>

      {prediction && (
        <section className="card-faint p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c]">Prediction window</p>
            <p className="font-serif text-lg mt-1">{formatDisplayDate(prediction.predictedWindowStart)} – {formatDisplayDate(prediction.predictedWindowEnd)}</p>
          </div>
          <p className="font-mono text-[10px] text-[#1a1a1a]/55">{prediction.confidence} confidence · {prediction.cyclesUsed ? `${prediction.cyclesUsed} recent cycles` : 'Starting estimate'}</p>
        </section>
      )}
    </div>
  );
};
