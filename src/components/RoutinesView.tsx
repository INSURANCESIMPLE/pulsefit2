import React, { useState } from 'react';
import { Dumbbell, Plus, Play, Sparkles, Clock, Target, Trash2, Edit3, ChevronRight, Layers, Calendar } from 'lucide-react';
import { Routine, RoutineExercise, MuscleGroup } from '../types';
import { WeeklyScheduler } from './WeeklyScheduler';

interface RoutinesViewProps {
  routines: Routine[];
  onStartRoutine: (routine: Routine) => void;
  onOpenAiRegime: () => void;
  onCreateCustomRoutine: (routine: Routine) => void;
  onDeleteRoutine: (routineId: string) => void;
}

export const RoutinesView: React.FC<RoutinesViewProps> = ({
  routines,
  onStartRoutine,
  onOpenAiRegime,
  onCreateCustomRoutine,
  onDeleteRoutine
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'library'>('schedule');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newGoal, setNewGoal] = useState('Build Strength & Hypertrophy');
  const [newDays, setNewDays] = useState(4);
  const [customExercises, setCustomExercises] = useState<RoutineExercise[]>([
    {
      exerciseId: 'ex-bench-press',
      exerciseName: 'Barbell Bench Press',
      category: 'Chest',
      targetSets: 4,
      targetReps: 8,
      targetWeightKg: 75,
      restSeconds: 90
    },
    {
      exerciseId: 'ex-lat-pulldown',
      exerciseName: 'Lat Pulldown Machine',
      category: 'Back',
      targetSets: 3,
      targetReps: 10,
      targetWeightKg: 60,
      restSeconds: 60
    }
  ]);

  const handleSaveCustom = () => {
    if (!newRoutineName.trim()) return;

    const newRt: Routine = {
      id: `rt-custom-${Date.now()}`,
      name: newRoutineName,
      description: 'Custom user defined workout routine',
      targetGoal: newGoal,
      daysPerWeek: newDays,
      difficulty: 'Intermediate',
      isAiGenerated: false,
      createdAt: new Date().toISOString().split('T')[0],
      exercises: customExercises
    };

    onCreateCustomRoutine(newRt);
    setShowCreateModal(false);
    setNewRoutineName('');
  };

  return (
    <div className="space-y-5 pb-28">
      {/* Top Bento Header Banner */}
      <div className="bento-card bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-between border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-lime-500">Training Regimes</span>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Workout Routines</h2>
          <p className="text-xs text-slate-400 mt-0.5">Select a workout plan or generate a custom AI program</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenAiRegime}
            className="flex items-center space-x-1.5 bg-lime-500 hover:bg-lime-400 text-slate-950 text-xs font-black px-3 py-2 rounded-xl shadow-md transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            <span>AI Regime</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-800 transition"
          >
            <Plus className="w-4 h-4 text-lime-400" />
            <span>Custom</span>
          </button>
        </div>
      </div>

      {/* View Selector Tabs */}
      <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800/80">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition ${
            activeTab === 'schedule'
              ? 'bg-lime-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Weekly Schedule & Upcoming</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition ${
            activeTab === 'library'
              ? 'bg-lime-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Saved Routines ({routines.length})</span>
        </button>
      </div>

      {/* Tab Content: Weekly Schedule Calendar vs Routine Library */}
      {activeTab === 'schedule' ? (
        <WeeklyScheduler routines={routines} onStartRoutine={onStartRoutine} />
      ) : (
        /* Routine Cards Grid */
        <div className="space-y-4">
          {routines.map((rt) => (
          <div
            key={rt.id}
            className="bento-card space-y-4 hover:border-lime-500/30 shadow-lg transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  {rt.isAiGenerated && (
                    <span className="text-[10px] bg-lime-500/10 text-lime-400 border border-lime-500/30 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-lime-400 fill-lime-400" />
                      <span>AI Neural Blueprint</span>
                    </span>
                  )}
                  <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded-full font-mono border border-slate-800">
                    {rt.daysPerWeek} Days / Wk
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-100 mt-2">{rt.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{rt.description}</p>
              </div>

              <button
                onClick={() => onStartRoutine(rt)}
                className="flex items-center space-x-1.5 bg-lime-500 hover:bg-lime-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md shadow-lime-950/40 transition active:scale-95 shrink-0 ml-3"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>Start</span>
              </button>
            </div>

            {/* Exercise Preview Grid */}
            <div className="bg-slate-950 rounded-2xl p-3 space-y-2 border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Exercise Structure</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rt.exercises.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                    <span className="font-semibold text-slate-200 truncate">{ex.exerciseName}</span>
                    <span className="font-mono text-[11px] text-lime-400 font-bold shrink-0 ml-2">
                      {ex.targetSets} × {ex.targetReps} ({ex.targetWeightKg}kg)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delete button for user created ones */}
            {rt.id.startsWith('rt-custom') && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => onDeleteRoutine(rt.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Routine</span>
                </button>
              </div>
            )}
          </div>
        ))}
        </div>
      )}

      {/* Modal: Create Custom Routine */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bento-card w-full max-w-md space-y-4 shadow-2xl">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-lime-500">Custom Builder</span>
              <h3 className="text-lg font-black text-slate-100">Create Workout Routine</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Routine Name</label>
                <input
                  type="text"
                  placeholder="e.g. Hypertrophy Push Day"
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:ring-2 focus:ring-lime-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Target Goal</label>
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:ring-2 focus:ring-lime-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustom}
                disabled={!newRoutineName.trim()}
                className="px-4 py-2 bg-lime-500 hover:bg-lime-400 text-slate-950 font-black text-xs rounded-xl shadow-md disabled:opacity-50"
              >
                Save Routine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
