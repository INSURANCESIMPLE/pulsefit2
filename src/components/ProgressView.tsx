import React, { useState } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';
import { WorkoutSession } from '../types';
import { BarChart3, TrendingUp, Flame, HeartPulse, Trophy } from 'lucide-react';
import { WorkoutCalendar } from './WorkoutCalendar';
import { CalorieBurnSummaryCard } from './CalorieBurnSummaryCard';

interface ProgressViewProps {
  workoutSessions: WorkoutSession[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({ workoutSessions }) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('30d');

  // Format Volume Progression Data
  const volumeData = workoutSessions.map((s) => ({
    date: s.date.slice(5), // MM-DD
    volume: s.totalVolumeKg,
    exertion: s.exertionScore,
    calories: s.caloriesBurned
  }));

  // Format Heart Rate Exertion Zones Distribution
  const zoneCounts: Record<string, number> = {
    'Warm-up': 0,
    'Fat Burn': 0,
    'Cardio': 0,
    'Peak': 0,
    'Extreme': 0
  };

  workoutSessions.forEach((s) => {
    s.heartRateTelemetry.forEach((pt) => {
      if (zoneCounts[pt.zone] !== undefined) {
        zoneCounts[pt.zone] += 1;
      }
    });
  });

  const zonePieData = [
    { name: 'Warm-up', value: zoneCounts['Warm-up'] || 1, color: '#38bdf8' },
    { name: 'Fat Burn', value: zoneCounts['Fat Burn'] || 3, color: '#84cc16' },
    { name: 'Cardio', value: zoneCounts['Cardio'] || 5, color: '#fbbf24' },
    { name: 'Peak', value: zoneCounts['Peak'] || 4, color: '#f97316' },
    { name: 'Extreme', value: zoneCounts['Extreme'] || 2, color: '#f43f5e' }
  ];

  // Key Exercise Weight Progression
  const benchProgress = [
    { session: 'S1', weight: 75 },
    { session: 'S2', weight: 77.5 },
    { session: 'S3', weight: 80 },
    { session: 'S4', weight: 82.5 }
  ];

  const totalVolumeSum = workoutSessions.reduce((acc, curr) => acc + curr.totalVolumeKg, 0);
  const totalCaloriesSum = workoutSessions.reduce((acc, curr) => acc + curr.caloriesBurned, 0);
  const avgExertionOverall = Math.round(
    workoutSessions.reduce((acc, curr) => acc + curr.exertionScore, 0) / (workoutSessions.length || 1)
  );

  return (
    <div className="space-y-5 pb-28">
      {/* Header & Timeframe selector */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-lime-500">Telemetry Analytics</span>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-lime-400" />
            <span>Workout & Volume Insights</span>
          </h2>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-semibold">
          {(['7d', '30d', 'all'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg uppercase transition ${
                timeframe === tf
                  ? 'bg-lime-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stat Cards Bento Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bento-card space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Volume</div>
          <div className="stat-value accent-lime font-mono text-xl sm:text-2xl">{(totalVolumeSum / 1000).toFixed(1)}k <span className="text-xs text-slate-400">kg</span></div>
          <div className="text-[10px] text-lime-400 font-bold flex items-center space-x-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+12.4% vs prev</span>
          </div>
        </div>

        <div className="bento-card space-y-1 border-amber-500/20">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Exertion Score</div>
          <div className="stat-value text-amber-400 font-mono text-xl sm:text-2xl">{avgExertionOverall}<span className="text-xs text-slate-400">/100</span></div>
          <div className="text-[10px] text-amber-400 font-bold">Optimal Strain</div>
        </div>

        <div className="bento-card space-y-1 border-rose-500/20">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Calories Burned</div>
          <div className="stat-value accent-rose font-mono text-xl sm:text-2xl">{totalCaloriesSum} <span className="text-xs text-slate-400">kcal</span></div>
          <div className="text-[10px] text-slate-400 font-medium">{workoutSessions.length} Sessions</div>
        </div>
      </div>

      {/* Visual Caloric Expenditure & Heart Rate Intensity Summary Card */}
      <CalorieBurnSummaryCard workoutSessions={workoutSessions} />

      {/* Interactive Workout Calendar View */}
      <WorkoutCalendar workoutSessions={workoutSessions} />

      {/* Chart 1: Total Volume Progression Bento Card */}
      <div className="bento-card space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-lime-500">Volume Progression</span>
            <h3 className="text-sm font-extrabold text-slate-100">Weekly Tonnage & Workload (kg)</h3>
          </div>
          <span className="text-xs font-mono text-lime-400 font-bold bg-lime-500/10 px-2 py-0.5 rounded border border-lime-500/20">
            Tonnage
          </span>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '1rem', color: '#f8fafc' }}
                formatter={(val: any) => [`${val} kg`, 'Volume']}
              />
              <Bar dataKey="volume" fill="url(#colorLimeVolume)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorLimeVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#84cc16" stopOpacity={1} />
                  <stop offset="100%" stopColor="#65a30d" stopOpacity={0.4} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Heart Rate Distribution & Strength Progression */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Heart Rate Zones Bento Card */}
        <div className="bento-card space-y-3 border-rose-500/20">
          <div>
            <div className="flex items-center space-x-1.5">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">HR Telemetry</span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 mt-0.5">Heart Rate Zone Distribution</h3>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={zonePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {zonePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '1rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Zone Legend */}
          <div className="flex flex-wrap gap-1.5 text-[10px] justify-center pt-1">
            {zonePieData.map((z) => (
              <div key={z.name} className="flex items-center space-x-1 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: z.color }}></span>
                <span className="text-slate-300 font-medium">{z.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bench Press Line Progression Bento Card */}
        <div className="bento-card space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-lime-500">Strength Curve</span>
            <h3 className="text-sm font-bold text-slate-100 mt-0.5">Barbell Bench Progression</h3>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={benchProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="session" stroke="#64748b" fontSize={11} />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '1rem', color: '#f8fafc' }}
                  formatter={(val: any) => [`${val} kg`, 'Max Weight']}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#84cc16" 
                  strokeWidth={3} 
                  dot={{ fill: '#84cc16', r: 5 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
