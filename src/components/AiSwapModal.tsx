import React, { useState, useEffect } from 'react';
import { Sparkles, X, ArrowRight, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { EquipmentCategory } from '../types';

interface AiSwapModalProps {
  busyExerciseName: string;
  category: string;
  availableEquipment: EquipmentCategory[];
  onClose: () => void;
  onSelectSubstitute: (substituteName: string) => void;
}

export const AiSwapModal: React.FC<AiSwapModalProps> = ({
  busyExerciseName,
  category,
  availableEquipment,
  onClose,
  onSelectSubstitute
}) => {
  const [loading, setLoading] = useState(true);
  const [substitutes, setSubstitutes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSwaps() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ai-swap-exercise', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalExerciseName: busyExerciseName,
            category,
            busyEquipment: busyExerciseName,
            availableEquipment
          })
        });

        const data = await response.json();
        if (data.success && data.substitutes) {
          setSubstitutes(data.substitutes);
        } else {
          // Fallback static recommendations
          setSubstitutes([
            {
              name: `Incline Dumbbell ${category} Press`,
              equipmentRequired: 'Dumbbell',
              reasoning: 'Targets identical muscle angle using free weights without waiting for the machine.',
              suggestedSets: 3,
              suggestedReps: 10
            },
            {
              name: `Standing Cable ${category} Fly`,
              equipmentRequired: 'Cable',
              reasoning: 'Provides continuous tension through full range of motion.',
              suggestedSets: 3,
              suggestedReps: 12
            }
          ]);
        }
      } catch (err: any) {
        console.error('Error fetching AI swap:', err);
        setSubstitutes([
          {
            name: `Dumbbell Alternative for ${busyExerciseName}`,
            equipmentRequired: 'Dumbbell',
            reasoning: 'High-activation substitute exercise.',
            suggestedSets: 3,
            suggestedReps: 10
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchSwaps();
  }, [busyExerciseName, category]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bento-card border-lime-500/40 p-5 w-full max-w-lg space-y-4 shadow-2xl animate-fade-in">
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] uppercase font-black text-lime-400 bg-lime-500/10 px-2.5 py-0.5 rounded-full border border-lime-500/30">
              Machine Busy Relief
            </span>
            <h3 className="text-base font-extrabold text-slate-100 mt-1">
              Substitute for "{busyExerciseName}"
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-10 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="w-7 h-7 text-lime-400 animate-spin" />
            <span className="text-xs font-bold text-slate-300">Finding biomechanical alternatives...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Choose an AI-recommended alternative targeting <strong className="text-lime-400">{category}</strong>:
            </p>

            {substitutes.map((sub, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 hover:border-lime-500/40 rounded-2xl p-3.5 space-y-2 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-100">{sub.name}</h4>
                    <span className="text-[10px] text-lime-400 font-mono font-bold">Requires: {sub.equipmentRequired}</span>
                  </div>

                  <button
                    onClick={() => onSelectSubstitute(sub.name)}
                    className="flex items-center space-x-1 bg-lime-500 hover:bg-lime-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-md transition"
                  >
                    <span>Swap In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{sub.reasoning}</p>

                <div className="text-[11px] text-slate-300 font-mono font-bold pt-1">
                  Target: {sub.suggestedSets} Sets × {sub.suggestedReps} Reps
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
