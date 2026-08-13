import React, { useState } from 'react';
import { DayLog, CycleSettings } from '../types';
import { getCycleDetails, formatDate, addDays, getDaysDifference } from '../lib/cycleUtils';
import { ChevronLeft, ChevronRight, Plus, Droplets, Sparkles, AlertCircle } from 'lucide-react';

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
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentMonthDate(new Date());
  };

  const logsByDate = new Map<string, DayLog>();
  logs.forEach(l => logsByDate.set(l.date, l));

  const todayStr = formatDate(new Date());

  // Build grid days
  const gridCells = [];
  
  // Empty padding for preceding month days
  for (let i = 0; i < startingDayOfWeek; i++) {
    gridCells.push(null);
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dateStr = formatDate(d);
    
    // Cycle predictions for this date
    const cycleInfo = getCycleDetails(dateStr, settings.lastPeriodStartDate, settings.avgCycleLength);
    const log = logsByDate.get(dateStr);

    // Is logged period day?
    const hasFlow = log && log.flow !== 'None';
    
    // Is predicted period day?
    // Period starts at cycleInfo.currentCycleStart and lasts avgPeriodLength
    const daysFromStart = getDaysDifference(cycleInfo.currentCycleStart, dateStr);
    const isPredictedPeriod = daysFromStart >= 0 && daysFromStart < settings.avgPeriodLength && !hasFlow;

    gridCells.push({
      dayNumber: day,
      dateStr,
      log,
      hasFlow,
      isPredictedPeriod,
      isFertileWindow: cycleInfo.isFertileWindow,
      isOvulationDay: cycleInfo.isOvulationDay,
      isToday: dateStr === todayStr,
      cycleDay: cycleInfo.cycleDay,
    });
  }

  return (
    <div className="neo-border-4 bg-white p-6 sm:p-10 neo-shadow space-y-6">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-[#1b2021]">
        <div>
          <span className="font-mono text-xs font-bold text-[#0081a7] uppercase tracking-widest block">
            MONTHLY SCHEDULE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1b2021] tracking-tight">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="calendar-today-btn"
            onClick={handleToday}
            className="neo-btn bg-[#0081a7] text-white px-4 py-2 text-xs cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center gap-1 border-2 border-[#1b2021] bg-[#fffbf2] p-1">
            <button
              id="calendar-prev-month-btn"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-[#fed9b7] text-[#1b2021] transition-all cursor-pointer font-bold"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="calendar-next-month-btn"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-[#fed9b7] text-[#1b2021] transition-all cursor-pointer font-bold"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center gap-6 font-mono text-xs font-bold text-[#1b2021] p-4 bg-[#fffbf2] border-2 border-[#1b2021] neo-shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-[#f07167] border-2 border-[#1b2021] inline-block" />
          Logged Period
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-[#fed9b7] border-2 border-dashed border-[#1b2021] inline-block" />
          Predicted Period
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-[#0081a7] border-2 border-[#1b2021] inline-block" />
          Fertile Window
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-emerald-400 border-2 border-[#1b2021] inline-block" />
          Ovulation Day
        </div>
      </div>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 gap-2 text-center font-mono text-xs font-extrabold text-[#1b2021] uppercase tracking-widest pb-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Grid of Days */}
      <div className="grid grid-cols-7 gap-2">
        {gridCells.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="h-20 sm:h-24 bg-transparent" />;
          }

          const {
            dayNumber,
            dateStr,
            log,
            hasFlow,
            isPredictedPeriod,
            isFertileWindow,
            isOvulationDay,
            isToday,
          } = cell;

          let bgStyle = 'bg-[#fffbf2] border-[#1b2021] hover:bg-[#fed9b7]';
          if (hasFlow) {
            bgStyle = 'bg-[#f07167] text-white border-[#1b2021]';
          } else if (isOvulationDay) {
            bgStyle = 'bg-emerald-300 text-[#1b2021] border-[#1b2021]';
          } else if (isFertileWindow) {
            bgStyle = 'bg-[#0081a7]/20 border-[#1b2021]';
          } else if (isPredictedPeriod) {
            bgStyle = 'bg-[#fed9b7]/60 border-dashed border-[#1b2021]';
          }

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`relative h-20 sm:h-24 p-2 border-2 transition-all cursor-pointer flex flex-col justify-between group ${bgStyle} ${
                isToday ? 'ring-4 ring-[#1b2021] font-bold neo-shadow-sm' : ''
              }`}
            >
              {/* Top Row: Date & Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-xs font-bold ${
                    isToday
                      ? 'bg-[#1b2021] text-white px-1.5 py-0.5 border border-[#1b2021]'
                      : 'text-[#1b2021]'
                  }`}
                >
                  {dayNumber}
                </span>

                {hasFlow && (
                  <span className="flex items-center text-[9px] font-mono font-bold px-1.5 py-0.5 bg-[#1b2021] text-white border border-[#1b2021]">
                    <Droplets className="w-2.5 h-2.5 mr-0.5 text-[#f07167]" />
                    {log?.flow}
                  </span>
                )}

                {isOvulationDay && !hasFlow && (
                  <span className="text-[9px] font-mono font-bold px-1 py-0.5 bg-[#1b2021] text-emerald-300">
                    OVU
                  </span>
                )}
              </div>

              {/* Middle / Bottom Badges for Symptoms and Moods */}
              <div className="space-y-1">
                {log && (
                  <div className="flex flex-wrap gap-1 max-h-8 overflow-hidden">
                    {log.symptoms.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[8px] font-mono font-bold px-1 py-0.5 bg-white text-[#1b2021] border border-[#1b2021] truncate max-w-[50px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {isPredictedPeriod && !hasFlow && (
                  <p className="text-[9px] font-mono text-[#1b2021] font-bold uppercase">
                    Pred
                  </p>
                )}
              </div>

              {/* Hover Plus Icon */}
              <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-5 h-5 bg-[#1b2021] text-white flex items-center justify-center font-bold">
                  <Plus className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
