import React, { useState } from 'react';
import { Flame, Clock, HeartPulse, Zap, Info, TrendingUp, ChevronDown, ChevronUp, Activity, Sparkles } from 'lucide-react';
import { WorkoutSession } from '../types';

interface CalorieBurnSummaryCardProps {
  workoutSessions: WorkoutSession[];
}

export const CalorieBurnSummaryCard: React.FC<CalorieBurnSummaryCardProps> = ({ workoutSessions }) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [showSessionBreakdown, setShowSessionBreakdown] = useState(false);

  // Compute aggregate metrics
  const totalDurationSeconds = workoutSessions.reduce((acc, s) => acc + (s.durationSeconds || 2700), 0);
  const totalDurationMinutes = Math.round(totalDurationSeconds / 60);
  const durationHours = Math.floor(totalDurationMinutes / 60);
  const remainingMins = totalDurationMinutes % 60;

  const totalCalories = workoutSessions.reduce((acc, s) => acc + s.caloriesBurned, 0);

  const avgHeartRate = Math.round(
    workoutSessions.reduce((acc, s) => acc + s.avgHeartRate, 0) / (workoutSessions.length || 1)
  );

  const avgBurnRatePerHour = totalDurationMinutes > 0 ? Math.round((totalCalories / totalDurationMinutes) * 60) : 0;
  const avgBurnRatePerMin = totalDurationMinutes > 0 ? (totalCalories / totalDurationMinutes).toFixed(1) : '0';

  // Determine HR Zone based on overall average HR
  const getHrZoneLabel = (bpm: number) => {
    if (bpm < 115) return { name: 'Warm-up Zone', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' };
    if (bpm < 135) return { name: 'Fat Burn Zone', color: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/30' };
    if (bpm < 155) return { name: 'Cardio Zone', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    if (bpm < 175) return { name: 'Peak Aerobic', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    return { name: 'Extreme Anaerobic', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  };

  const currentZone = getHrZoneLabel(avgHeartRate);

  // Calculate percentage along HR range (90 BPM to 180 BPM)
  const hrRangePercent = Math.min(Math.max(((avgHeartRate - 90) / (180 - 90)) * 100, 5), 95);

  return (
    <div className="bento-card border-amber-500/30 space-y-4 shadow-xl relative overflow-hidden">
      {/* Background Subtle Gradient Flare */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Metabolic Energy Estimation
            </span>
            <h3 className="text-base font-extrabold text-slate-100 mt-0.5">
              Estimated Caloric Burn Summary
            </h3>
          </div>
        </div>

        <div className={`text-xs font-bold px-2.5 py-1 rounded-xl border flex items-center space-x-1.5 ${currentZone.bg} ${currentZone.color} ${currentZone.border}`}>
          <HeartPulse className="w-3.5 h-3.5 shrink-0" />
          <span>{currentZone.name}</span>
        </div>
      </div>

      {/* Main Key Metrics Banner Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Calories Burned */}
        <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-3.5 space-y-1 relative group">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Total Burned</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400 tracking-tight">
            {totalCalories.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-medium">kcal</span>
          </div>
          <div className="text-[10px] text-amber-400/90 font-semibold flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Across {workoutSessions.length} sessions</span>
          </div>
        </div>

        {/* Total Duration */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Active Time</span>
            <Clock className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-100 tracking-tight">
            {durationHours > 0 ? `${durationHours}h ${remainingMins}m` : `${remainingMins} mins`}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Recorded workout duration
          </div>
        </div>

        {/* Average Heart Rate */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Avg Heart Rate</span>
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-400 tracking-tight">
            {avgHeartRate} <span className="text-xs text-slate-400 font-sans font-medium">BPM</span>
          </div>
          <div className="text-[10px] text-rose-400/90 font-semibold">
            Intensity Baseline
          </div>
        </div>

        {/* Burn Rate per Hour */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Metabolic Rate</span>
            <Zap className="w-3.5 h-3.5 text-lime-400" />
          </div>
          <div className="text-2xl font-black font-mono text-lime-400 tracking-tight">
            ~{avgBurnRatePerHour} <span className="text-xs text-slate-400 font-sans font-medium">kcal/hr</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            ~{avgBurnRatePerMin} kcal/min avg
          </div>
        </div>
      </div>

      {/* Heart Rate Intensity Spectrum Gauge */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] uppercase tracking-wider font-extrabold">Heart Rate Intensity Spectrum</span>
          </div>
          <span className="text-xs font-mono font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            {avgHeartRate} BPM Avg
          </span>
        </div>

        {/* Gauge Bar */}
        <div className="relative pt-4 pb-1">
          {/* Active Pointer Marker */}
          <div 
            className="absolute top-0 transition-all duration-500 transform -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${hrRangePercent}%` }}
          >
            <span className="text-[9px] font-black font-mono text-amber-300 bg-slate-900 border border-amber-400/60 px-1.5 py-0.2 rounded-md shadow-md whitespace-nowrap">
              ▲ {avgHeartRate} BPM
            </span>
          </div>

          {/* Color Gradient Segmented Track */}
          <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden flex p-0.5 border border-slate-800 gap-0.5">
            <div className="h-full bg-sky-500/80 rounded-l-full" style={{ width: '25%' }} title="Warm-up (100-120 BPM)" />
            <div className="h-full bg-lime-500/80" style={{ width: '25%' }} title="Fat Burn (120-140 BPM)" />
            <div className="h-full bg-amber-500/80" style={{ width: '25%' }} title="Cardio (140-160 BPM)" />
            <div className="h-full bg-rose-500/80 rounded-r-full" style={{ width: '25%' }} title="Peak/Extreme (160+ BPM)" />
          </div>

          {/* Zone Axis Labels */}
          <div className="flex justify-between text-[9px] font-bold text-slate-500 mt-1 font-mono">
            <span>100 BPM (Warm)</span>
            <span>120 (Fat Burn)</span>
            <span>140 (Cardio)</span>
            <span>160 (Peak)</span>
            <span>180+ BPM</span>
          </div>
        </div>
      </div>

      {/* Interactive Toggle for Caloric Estimation Formula */}
      <div className="border-t border-slate-800/80 pt-2 space-y-2">
        <button
          onClick={() => setShowFormulaDetails(!showFormulaDetails)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-slate-100 bg-slate-950 p-2.5 rounded-xl border border-slate-800 transition"
        >
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-amber-400" />
            <span>How Caloric Burn is Estimated</span>
          </div>
          {showFormulaDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showFormulaDetails && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs text-slate-300 animate-fade-in leading-relaxed">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Biometric Expenditure Model
            </div>
            <p className="text-[11px] text-slate-300">
              Caloric expenditure is dynamically calculated using Keytel et al. biometric telemetry formulas incorporating continuous heart rate monitoring, exercise duration, and personal baseline metabolic constants:
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] text-lime-300 space-y-1">
              <div>Calories = Duration (mins) × [ (0.074 × HR) - (0.0574 × Weight) + (0.2017 × Age) - 55.096 ] / 4.184</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-slate-200 block mb-0.5">⏱ Duration Impact</span>
                Each additional minute at {avgHeartRate} BPM burns approximately <strong className="text-lime-400">~{avgBurnRatePerMin} kcal</strong>.
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-slate-200 block mb-0.5">❤️ HR Intensity Impact</span>
                Higher heart rate zones increase EPOC (excess post-exercise oxygen consumption) and burn rate.
              </div>
            </div>
          </div>
        )}

        {/* Toggle for Session Caloric List Breakdown */}
        <button
          onClick={() => setShowSessionBreakdown(!showSessionBreakdown)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-slate-100 bg-slate-950 p-2.5 rounded-xl border border-slate-800 transition"
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-lime-400" />
            <span>Session-by-Session Caloric Breakdown ({workoutSessions.length})</span>
          </div>
          {showSessionBreakdown ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showSessionBreakdown && (
          <div className="space-y-2 pt-1 animate-fade-in">
            {workoutSessions.map((s) => {
              const sessionMins = Math.round((s.durationSeconds || 2700) / 60);
              const sessionKcalPerMin = sessionMins > 0 ? (s.caloriesBurned / sessionMins).toFixed(1) : '0';
              const sessionZone = getHrZoneLabel(s.avgHeartRate);

              return (
                <div
                  key={s.id}
                  className="bg-slate-950 border border-slate-800/90 rounded-2xl p-3 flex items-center justify-between text-xs hover:border-slate-700 transition"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-200">{s.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                      <span>{s.date}</span>
                      <span>•</span>
                      <span>{sessionMins} mins</span>
                      <span>•</span>
                      <span className={`font-semibold ${sessionZone.color}`}>{s.avgHeartRate} BPM</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-black text-amber-400 text-sm">
                      {s.caloriesBurned} <span className="text-[10px] text-slate-400 font-sans font-normal">kcal</span>
                    </div>
                    <div className="text-[9px] font-mono font-bold text-slate-500">
                      ~{sessionKcalPerMin} kcal/min
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
