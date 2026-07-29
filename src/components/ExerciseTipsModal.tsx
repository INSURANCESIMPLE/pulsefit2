import React, { useState, useEffect } from 'react';
import { X, Lightbulb, CheckCircle2, AlertTriangle, Wind, Loader2, Sparkles, Shield, Compass } from 'lucide-react';

interface ExerciseTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  category?: string;
}

interface TipsData {
  title: string;
  primaryCue: string;
  setupTips: string[];
  executionSteps: string[];
  commonMistakes: string[];
  breathingPattern: string;
}

export const ExerciseTipsModal: React.FC<ExerciseTipsModalProps> = ({
  isOpen,
  onClose,
  exerciseName,
  category
}) => {
  const [loading, setLoading] = useState(true);
  const [tips, setTips] = useState<TipsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !exerciseName) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchTips = async () => {
      try {
        const res = await fetch('/api/exercise-tips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exerciseName, category })
        });

        if (!res.ok) throw new Error('Failed to load AI tips');
        const data = await res.json();

        if (isMounted && data.success && data.tips) {
          setTips(data.tips);
        } else {
          throw new Error('Invalid tips payload');
        }
      } catch (err: any) {
        console.warn('Using intelligent fallback form tips:', err);
        if (isMounted) {
          // Smart fallback tips based on exercise name & category
          setTips(generateFallbackTips(exerciseName, category));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTips();

    return () => {
      isMounted = false;
    };
  }, [isOpen, exerciseName, category]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bento-card border-lime-500/40 p-5 w-full max-w-lg space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-lime-500/10 text-lime-400 border border-lime-500/30">
              <Lightbulb className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded border border-lime-500/20">
                AI Quick Form Guide
              </span>
              <h3 className="text-base font-extrabold text-slate-100 mt-0.5 leading-tight">
                {exerciseName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Loading or Tips content */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="w-7 h-7 text-lime-400 animate-spin" />
              <span className="text-xs font-bold text-slate-300">
                Gemini AI is analyzing biomechanics for {exerciseName}...
              </span>
            </div>
          ) : tips ? (
            <>
              {/* Primary Key Cue Banner */}
              <div className="bg-gradient-to-r from-lime-500/15 via-emerald-500/10 to-transparent border border-lime-500/30 rounded-2xl p-3.5 flex items-start space-x-3">
                <Sparkles className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-black text-lime-400 uppercase tracking-wider">
                    Master Mind-Muscle Cue
                  </div>
                  <div className="text-xs font-extrabold text-slate-100 mt-0.5">
                    "{tips.primaryCue}"
                  </div>
                </div>
              </div>

              {/* Setup & Stance */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center space-x-1.5 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <Compass className="w-3.5 h-3.5 text-lime-400" />
                  <span>1. Initial Setup & Position</span>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {tips.setupTips.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-lime-400 mt-1.5 shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Execution Steps */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center space-x-1.5 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                  <span>2. Movement Execution</span>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {tips.executionSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Mistakes */}
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center space-x-1.5 text-rose-400 font-bold uppercase tracking-wider text-[10px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Common Pitfalls To Avoid</span>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {tips.commonMistakes.map((mistake, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-rose-200">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Breathing & Cadence */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-3 flex items-center space-x-3 text-slate-300">
                <Wind className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Breathing Cadence</div>
                  <div className="text-xs font-semibold text-slate-200">{tips.breathingPattern}</div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Button */}
        <div className="pt-2 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs py-2.5 rounded-xl border border-slate-800 transition"
          >
            Got It, Back To Set
          </button>
        </div>
      </div>
    </div>
  );
};

// Fallback generator if API or network is unavailable
function generateFallbackTips(name: string, cat?: string): TipsData {
  const lower = name.toLowerCase();

  if (lower.includes('press') || lower.includes('bench')) {
    return {
      title: `Form Blueprint: ${name}`,
      primaryCue: "Retract and depress scapula; drive feet into the floor.",
      setupTips: [
        "Set feet flat on floor with elbows angled at roughly 45 degrees to body.",
        "Maintain neutral wrist alignment over forearm joints.",
        "Grip bar or dumbbells firmly without bending wrists backward."
      ],
      executionSteps: [
        "Lower weight under control to mid-chest level.",
        "Press upward dynamically without flaring elbows out perpendicular.",
        "Squeeze target muscles at peak contraction without unlocking shoulder position."
      ],
      commonMistakes: [
        "Flaring elbows straight out to 90 degrees (strains AC joint).",
        "Bouncing weight off chest or lifting hips off the bench."
      ],
      breathingPattern: "Inhale deeply during lowering (eccentric), exhale forcefully on the press."
    };
  }

  if (lower.includes('squat') || lower.includes('press') && cat === 'Legs') {
    return {
      title: `Form Blueprint: ${name}`,
      primaryCue: "Root big toe, pinky toe, and heel. Spread knees outward over toes.",
      setupTips: [
        "Position feet shoulder-width apart with toes angled slightly outward.",
        "Brace core tight as if preparing to take a punch.",
        "Keep chest elevated and eyes looking forward-downward."
      ],
      executionSteps: [
        "Hinge hips backward while bending knees simultaneously.",
        "Descend until thighs break parallel with knees tracking over toes.",
        "Drive through mid-foot to stand up dynamically."
      ],
      commonMistakes: [
        "Allowing knees to cave inward (valgus collapse).",
        "Rounding lower back (butt wink) at the bottom of movement."
      ],
      breathingPattern: "Inhale & brace core at top; hold brace down; exhale driving up past sticking point."
    };
  }

  return {
    title: `Form Blueprint: ${name}`,
    primaryCue: "Maintain strict tension through full range of motion; avoid momentum.",
    setupTips: [
      "Establish a stable stance with feet hip-width apart and core engaged.",
      "Align joint axis directly with weight path.",
      "Keep shoulders relaxed away from ears."
    ],
    executionSteps: [
      "Initiate movement with primary muscle group rather than swinging.",
      "Control 2-second negative (eccentric) phase on every rep.",
      "Pause briefly at peak contraction for maximum muscle unit recruitment."
    ],
    commonMistakes: [
      "Using body momentum or hip rocking to complete reps.",
      "Shortening range of motion at top or bottom."
    ],
    breathingPattern: "Exhale during exertion phase; inhale smoothly during weight return."
  };
}
