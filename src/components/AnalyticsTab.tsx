import React from 'react';
import { DayLog, CycleSettings } from '../types';
import {
  analyzePastCycles,
  calculateSymptomFrequencies,
  calculateMoodFrequencies,
} from '../lib/cycleUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Activity, Smile, Calendar, Droplets, Moon } from 'lucide-react';

interface AnalyticsTabProps {
  logs: DayLog[];
  settings: CycleSettings;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ logs, settings }) => {
  const cycleHistory = analyzePastCycles(logs);
  const symptomData = calculateSymptomFrequencies(logs).slice(0, 8);
  const moodData = calculateMoodFrequencies(logs).slice(0, 8);

  // Format data for sleep & water chart (last 14 logs)
  const healthTrends = logs
    .slice(-14)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(log => ({
      date: log.date.slice(5), // MM-DD
      waterOz: log.waterOz || 0,
      sleepHours: log.sleepHours || 0,
    }));

  const COLORS = ['#d97d6e', '#7c8363', '#e8d5cc', '#c26a5c', '#989e80', '#b5a195', '#8c3e32'];

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="neo-border-4 bg-white p-6 sm:p-8 neo-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="neo-badge transform -rotate-1 bg-[#0081a7] text-white mb-2">
            HEALTH METRICS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1b2021] tracking-tight">
            Cycle Analytics &amp; Health Patterns
          </h2>
          <p className="font-mono text-xs text-[#1b2021]/80 mt-1">
            Visualize your cycle duration history, symptom occurrences, and daily health habits.
          </p>
        </div>
        <div className="font-mono text-xs font-bold px-4 py-2 border-2 border-[#1b2021] bg-[#fed9b7] neo-shadow-sm">
          AVG_CYCLE: {settings.avgCycleLength}_DAYS
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cycle Length Regularity Chart */}
        <div className="neo-border-4 bg-white p-6 sm:p-8 neo-shadow space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#1b2021] pb-3">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-[#f07167]" />
              <h3 className="text-lg font-extrabold text-[#1b2021]">Cycle Duration History</h3>
            </div>
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-[#0081a7] text-white border border-[#1b2021]">
              History
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            {cycleHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cycleHistory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1b2021" />
                  <XAxis dataKey="startDate" tick={{ fontSize: 11, fontFamily: 'Space Mono', fill: '#1b2021' }} />
                  <YAxis domain={[20, 35]} tick={{ fontSize: 11, fontFamily: 'Space Mono', fill: '#1b2021' }} />
                  <Tooltip
                    formatter={(value: any) => [`${value} Days`, 'Cycle Length']}
                    contentStyle={{ borderRadius: '0px', fontSize: '12px', border: '2px solid #1b2021', backgroundColor: '#fffbf2', fontFamily: 'Space Mono' }}
                  />
                  <Bar dataKey="length" fill="#f07167" stroke="#1b2021" strokeWidth={2} radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center font-mono text-xs text-[#1b2021]">
                More cycle logs needed to calculate regularity graphs.
              </div>
            )}
          </div>
        </div>

        {/* Symptom Frequency Bar Chart */}
        <div className="neo-border-4 bg-white p-6 sm:p-8 neo-shadow space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#1b2021] pb-3">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-[#0081a7]" />
              <h3 className="text-lg font-extrabold text-[#1b2021]">Top Logged Symptoms</h3>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            {symptomData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={symptomData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1b2021" />
                  <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'Space Mono', fill: '#1b2021' }} />
                  <YAxis dataKey="symptom" type="category" width={100} tick={{ fontSize: 11, fontFamily: 'Space Mono', fill: '#1b2021' }} />
                  <Tooltip
                    formatter={(value: any) => [`${value} times`, 'Logged']}
                    contentStyle={{ borderRadius: '0px', fontSize: '12px', border: '2px solid #1b2021', backgroundColor: '#fffbf2', fontFamily: 'Space Mono' }}
                  />
                  <Bar dataKey="count" stroke="#1b2021" strokeWidth={2}>
                    {symptomData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f07167' : '#0081a7'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center font-mono text-xs text-[#1b2021]">
                No symptoms logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Mood Breakdown */}
        <div className="neo-border-4 bg-white p-6 sm:p-8 neo-shadow space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#1b2021] pb-3">
            <div className="flex items-center gap-2.5">
              <Smile className="w-5 h-5 text-[#f07167]" />
              <h3 className="text-lg font-extrabold text-[#1b2021]">Mood Frequency</h3>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            {moodData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1b2021" />
                  <XAxis dataKey="mood" tick={{ fontSize: 10, fontFamily: 'Space Mono', fill: '#1b2021' }} />
                  <YAxis tick={{ fontSize: 11, fontFamily: 'Space Mono', fill: '#1b2021' }} />
                  <Tooltip
                    formatter={(value: any) => [`${value} times`, 'Logged']}
                    contentStyle={{ borderRadius: '0px', fontSize: '12px', border: '2px solid #1b2021', backgroundColor: '#fffbf2', fontFamily: 'Space Mono' }}
                  />
                  <Bar dataKey="count" fill="#fed9b7" stroke="#1b2021" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center font-mono text-xs text-[#1b2021]">
                No moods logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Water & Sleep Trend */}
        <div className="neo-border-4 bg-white p-6 sm:p-8 neo-shadow space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#1b2021] pb-3">
            <div className="flex items-center gap-2.5">
              <Droplets className="w-5 h-5 text-[#0081a7]" />
              <h3 className="text-lg font-extrabold text-[#1b2021]">Hydration &amp; Sleep Trends</h3>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            {healthTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1b2021" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'Space Mono', fill: '#1b2021' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fontFamily: 'Space Mono', fill: '#1b2021' }} domain={[0, 120]} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fontFamily: 'Space Mono', fill: '#1b2021' }} domain={[0, 12]} />
                  <Tooltip contentStyle={{ borderRadius: '0px', fontSize: '12px', border: '2px solid #1b2021', backgroundColor: '#fffbf2', fontFamily: 'Space Mono' }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="waterOz"
                    name="Water (oz)"
                    stroke="#0081a7"
                    strokeWidth={3}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="sleepHours"
                    name="Sleep (hrs)"
                    stroke="#f07167"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center font-mono text-xs text-[#1b2021]">
                No hydration/sleep trends available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
