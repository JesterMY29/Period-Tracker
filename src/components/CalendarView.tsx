import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { DayLog, CycleSettings } from '../types';
import {
  formatDate,
  getPrediction,
} from '../lib/cycleUtils';

interface CalendarViewProps {
  logs: DayLog[];
  settings: CycleSettings;
  onSelectDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  logs,
  settings,
  onSelectDate,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleTodayMonth = () => {
    setCurrentMonthDate(new Date());
  };

  const todayStr = formatDate(new Date());
  const prediction = getPrediction(logs, settings);

  // Generate calendar grid matrix
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: Array<{ dateStr: string; isCurrentMonth: boolean; dayNum: number }> = [];

  // Previous month padding
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const pDate = new Date(year, month - 1, prevMonthLastDate - i);
    calendarDays.push({
      dateStr: formatDate(pDate),
      isCurrentMonth: false,
      dayNum: pDate.getDate(),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const cDate = new Date(year, month, d);
    calendarDays.push({
      dateStr: formatDate(cDate),
      isCurrentMonth: true,
      dayNum: d,
    });
  }

  // Next month padding to fill grid to multiple of 7
  const totalGridCells = Math.ceil(calendarDays.length / 7) * 7;
  const nextDaysNeeded = totalGridCells - calendarDays.length;
  for (let n = 1; n <= nextDaysNeeded; n++) {
    const nDate = new Date(year, month + 1, n);
    calendarDays.push({
      dateStr: formatDate(nDate),
      isCurrentMonth: false,
      dayNum: n,
    });
  }

  const monthLabel = currentMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 font-mono">
      {/* Calendar Header Control */}
      <div className="card-refined p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 border border-[#1a1a1a]/10 bg-[#f8f7f4] text-[#1a1a1a]">
            <CalendarIcon className="w-5 h-5 text-[#c47c7c]" />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47c7c] block">
              [02] Monthly View
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1a1a1a]">
              {monthLabel}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 border border-[#1a1a1a]/15 bg-white text-xs hover:border-[#1a1a1a] transition-colors cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4 text-[#1a1a1a]" />
          </button>
          <button
            onClick={handleTodayMonth}
            className="px-3 py-1.5 border border-[#1a1a1a]/15 bg-[#f8f7f4] font-mono text-xs uppercase tracking-wider hover:border-[#1a1a1a] cursor-pointer"
          >
            TODAY
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 border border-[#1a1a1a]/15 bg-white text-xs hover:border-[#1a1a1a] transition-colors cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4 text-[#1a1a1a]" />
          </button>
        </div>
      </div>

      {/* Visual Legend */}
      <div className="card-refined p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <span className="text-[#c47c7c] uppercase text-[10px] tracking-widest">[LEGEND]</span>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#1a1a1a]/80">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#c47c7c]" />
            <span>LOGGED PERIOD DAY</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#c47c7c]/15 border border-dashed border-[#c47c7c]" />
            <span>PREDICTED WINDOW</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#1a1a1a]/10 border border-[#1a1a1a]/20" />
            <span>OTHER LOGGED DAY</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#1a1a1a] rounded-full" />
            <span>CURRENT DAY</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card-refined overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-[#1a1a1a] text-[#f8f7f4] text-center py-2.5 text-xs font-mono tracking-widest border-b border-[#1a1a1a]/10">
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>

        {/* Date Cells */}
        <div className="grid grid-cols-7 border-t border-[#1a1a1a]/10">
          {calendarDays.map(({ dateStr, isCurrentMonth, dayNum }, idx) => {
            const isToday = dateStr === todayStr;
            const log = logs.find(l => l.date === dateStr);
            const isPeriodDay = log && log.flow && log.flow !== 'None';
            const isOtherLoggedDay = log && (!log.flow || log.flow === 'None') && ((log.symptoms && log.symptoms.length > 0) || log.mood || log.notes);

            const isPredictedWindow =
              prediction &&
              dateStr >= prediction.predictedWindowStart &&
              dateStr <= prediction.predictedWindowEnd;

            // Determine cell background & styling
            let cellStyle = 'bg-white text-[#1a1a1a] hover:bg-[#f8f7f4]';

            if (!isCurrentMonth) {
              cellStyle = 'bg-[#f8f7f4]/40 text-[#1a1a1a]/30';
            } else if (isPeriodDay) {
              cellStyle = 'bg-[#c47c7c] text-[#f8f7f4] font-medium';
            } else if (isPredictedWindow) {
              cellStyle = 'bg-[#c47c7c]/15 text-[#c47c7c] border border-dashed border-[#c47c7c] font-medium';
            } else if (isOtherLoggedDay) {
              cellStyle = 'bg-[#1a1a1a]/5 text-[#1a1a1a] font-medium';
            }

            return (
              <button
                key={`${dateStr}-${idx}`}
                onClick={() => onSelectDate(dateStr)}
                className={`min-h-[75px] sm:min-h-[88px] p-2 border-b border-r border-[#1a1a1a]/10 flex flex-col justify-between transition-all cursor-pointer relative text-left ${cellStyle}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs sm:text-sm font-mono ${
                      isToday ? 'w-5 h-5 rounded-full bg-[#1a1a1a] text-[#f8f7f4] flex items-center justify-center font-bold text-[11px]' : ''
                    }`}
                  >
                    {dayNum}
                  </span>

                  {isToday && (
                    <span className="hidden sm:inline-block text-[8px] uppercase tracking-widest px-1 bg-[#1a1a1a] text-[#f8f7f4]">
                      TODAY
                    </span>
                  )}
                </div>

                {/* Status Badges */}
                <div className="space-y-1 mt-1">
                  {isPeriodDay && (
                    <div className="text-[9px] uppercase tracking-wider font-mono font-medium px-1 bg-white/20 text-[#f8f7f4] truncate">
                      {log.flow}
                    </div>
                  )}

                  {isOtherLoggedDay && (
                    <div className="text-[9px] uppercase tracking-wider font-mono font-medium px-1 bg-[#1a1a1a] text-[#f8f7f4] truncate">
                      Log
                    </div>
                  )}

                  {isPredictedWindow && !isPeriodDay && (
                    <div className="text-[8px] uppercase tracking-wider font-mono font-medium px-1 bg-[#c47c7c] text-[#f8f7f4] truncate">
                      Predicted
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
