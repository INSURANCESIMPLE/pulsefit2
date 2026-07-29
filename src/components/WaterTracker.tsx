import React, { useState, useEffect } from 'react';
import { Droplets, Plus, Minus, Settings, RotateCcw, CheckCircle2, Sparkles, GlassWater } from 'lucide-react';

export const WaterTracker: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Daily target in glasses (1 glass = 250ml)
  const [targetGlasses, setTargetGlasses] = useState<number>(() => {
    const saved = localStorage.getItem('pulsefit_water_target');
    return saved ? parseInt(saved, 10) : 8; // Default 8 glasses (2,000 ml)
  });

  // Today's consumed glasses
  const [consumedGlasses, setConsumedGlasses] = useState<number>(() => {
    const saved = localStorage.getItem(`pulsefit_water_${todayStr}`);
    return saved ? parseInt(saved, 10) : 4; // Default initial sample 4 glasses
  });

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(targetGlasses);

  // Persistence
  useEffect(() => {
    localStorage.setItem(`pulsefit_water_${todayStr}`, consumedGlasses.toString());
  }, [consumedGlasses, todayStr]);

  const handleSaveGoal = () => {
    const valid = Math.max(1, Math.min(24, tempGoal));
    setTargetGlasses(valid);
    localStorage.setItem('pulsefit_water_target', valid.toString());
    setIsEditingGoal(false);
  };

  const handleAddGlasses = (count: number) => {
    setConsumedGlasses((prev) => Math.max(0, prev + count));
  };

  const handleReset = () => {
    if (window.confirm("Reset today's water intake tracker?")) {
      setConsumedGlasses(0);
    }
  };

  const glassVolumeMl = 250;
  const totalMlConsumed = consumedGlasses * glassVolumeMl;
  const targetMl = targetGlasses * glassVolumeMl;
  const percentAchieved = Math.min(Math.round((consumedGlasses / targetGlasses) * 100), 100);
  const isGoalReached = consumedGlasses >= targetGlasses;

  return (
    <div className="bento-card border-sky-500/30 space-y-4 shadow-xl relative overflow-hidden">
      {/* Background Subtle Gradient Flare */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-sky-500/10 via-cyan-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 text-sky-400 border border-sky-500/30 shadow-inner">
            <Droplets className="w-5 h-5 text-sky-400 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              Daily Hydration
            </span>
            <h3 className="text-base font-extrabold text-slate-100 mt-0.5">
              Water Intake Tracker
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              setTempGoal(targetGlasses);
              setIsEditingGoal(!isEditingGoal);
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-sky-300 border border-slate-800 transition text-xs font-bold flex items-center space-x-1"
            title="Set Hydration Goal"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Set Goal</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-rose-400 border border-slate-800 transition"
            title="Reset Today's Water"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Goal Editor Drawer */}
      {isEditingGoal && (
        <div className="bg-slate-950 border border-sky-500/30 rounded-2xl p-3.5 space-y-3 animate-fade-in">
          <div className="flex justify-between items-center text-xs font-bold text-slate-200">
            <span>Customize Daily Target Hydration Goal</span>
            <span className="font-mono text-sky-400">{tempGoal} Glasses ({(tempGoal * 250 / 1000).toFixed(1)} L)</span>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={tempGoal}
              onChange={(e) => setTempGoal(parseInt(e.target.value, 10))}
              className="flex-1 accent-sky-500"
            />
            <button
              onClick={handleSaveGoal}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl transition shadow"
            >
              Save Target
            </button>
          </div>
        </div>
      )}

      {/* Main Hydration Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        {/* Left Column: Big Stats */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5 text-center sm:text-left">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Consumed Today
          </div>
          <div className="text-3xl font-black font-mono text-sky-400 tracking-tight flex items-baseline justify-center sm:justify-start space-x-1">
            <span>{consumedGlasses}</span>
            <span className="text-sm font-sans font-medium text-slate-400">/ {targetGlasses} glasses</span>
          </div>
          <div className="text-xs font-mono font-bold text-slate-300">
            {(totalMlConsumed / 1000).toFixed(2)} L <span className="text-[10px] text-slate-500">({totalMlConsumed.toLocaleString()} ml)</span>
          </div>
        </div>

        {/* Center Column: Progress Gauge Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 col-span-1 sm:col-span-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 flex items-center space-x-1">
              <span>Hydration Progress</span>
              {isGoalReached && <CheckCircle2 className="w-4 h-4 text-emerald-400 inline ml-1" />}
            </span>
            <span className="font-mono font-black text-sky-400">{percentAchieved}%</span>
          </div>

          <div className="h-3.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isGoalReached
                  ? 'bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 shadow-lg'
                  : 'bg-gradient-to-r from-sky-500 to-cyan-400'
              }`}
              style={{ width: `${percentAchieved}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0 ml</span>
            <span>Target: {(targetMl / 1000).toFixed(1)} L</span>
          </div>
        </div>
      </div>

      {/* Visual Glass Grid Counter */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
        <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          <span>Glass Progress Grid (250ml per glass)</span>
          <span className="text-sky-400 font-mono">{consumedGlasses} / {targetGlasses}</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {Array.from({ length: targetGlasses }).map((_, index) => {
            const isFilled = index < consumedGlasses;
            return (
              <button
                key={index}
                onClick={() => setConsumedGlasses(index + 1)}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all duration-300 transform active:scale-90 ${
                  isFilled
                    ? 'bg-gradient-to-b from-sky-500/20 to-cyan-500/30 border-sky-400 text-sky-300 shadow-md scale-100'
                    : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700'
                }`}
                title={`Glass #${index + 1} (${(index + 1) * 250} ml)`}
              >
                <GlassWater className={`w-5 h-5 ${isFilled ? 'text-sky-400' : 'text-slate-700'}`} />
                <span className="text-[9px] font-mono font-bold mt-1">#{index + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Add Controls */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center space-x-2 flex-1">
          <button
            onClick={() => handleAddGlasses(1)}
            className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs py-2.5 rounded-xl transition shadow-lg flex items-center justify-center space-x-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+1 Glass (250ml)</span>
          </button>

          <button
            onClick={() => handleAddGlasses(2)}
            className="bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/30 font-extrabold text-xs px-3 py-2.5 rounded-xl transition flex items-center space-x-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>+500ml Bottle</span>
          </button>
        </div>

        <button
          onClick={() => handleAddGlasses(-1)}
          disabled={consumedGlasses <= 0}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition disabled:opacity-30 disabled:pointer-events-none"
          title="Deduct 1 glass"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
