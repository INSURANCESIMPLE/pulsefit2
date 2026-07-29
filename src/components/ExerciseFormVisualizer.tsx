import React, { useState } from 'react';
import { Play, Pause, Activity, Eye, EyeOff, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface ExerciseFormVisualizerProps {
  exerciseName: string;
  category: string;
}

export const ExerciseFormVisualizer: React.FC<ExerciseFormVisualizerProps> = ({
  exerciseName,
  category
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showTechniqueOverlay, setShowTechniqueOverlay] = useState(true);

  const nameUpper = exerciseName.toUpperCase();
  const catUpper = category.toUpperCase();

  // Determine movement archetype
  const isSquatOrLegs = nameUpper.includes('SQUAT') || nameUpper.includes('LEG') || nameUpper.includes('LUNGE') || catUpper.includes('LEGS');
  const isDeadliftOrHinge = nameUpper.includes('DEADLIFT') || nameUpper.includes('HIP') || nameUpper.includes('ROMANIAN');
  const isBenchOrChest = nameUpper.includes('BENCH') || nameUpper.includes('CHEST') || nameUpper.includes('PUSH') || nameUpper.includes('DIP') || catUpper.includes('CHEST');
  const isPullOrBack = nameUpper.includes('PULL') || nameUpper.includes('ROW') || nameUpper.includes('LAT') || catUpper.includes('BACK');
  const isShoulder = nameUpper.includes('SHOULDER') || nameUpper.includes('PRESS') || nameUpper.includes('RAISE') || catUpper.includes('SHOULDERS');
  const isArm = nameUpper.includes('CURL') || nameUpper.includes('TRICEP') || nameUpper.includes('BICEP') || catUpper.includes('ARMS');

  // Form Cue Highlights
  const getFormCues = () => {
    if (isSquatOrLegs) {
      return {
        phase1: 'ECCENTRIC (3s): Inhale, break at hips and knees simultaneously.',
        phase2: 'CONCENTRIC (1s): Drive through mid-foot, contract quads & glutes.',
        keyCue: 'Keep knees tracking over toes. Maintain braced neutral spine.'
      };
    }
    if (isBenchOrChest) {
      return {
        phase1: 'ECCENTRIC (2-3s): Lower bar/dumbbells under control to mid-sternum.',
        phase2: 'CONCENTRIC (1s): Drive feet into floor, press up maintaining arch.',
        keyCue: 'Retract scapulae and keep elbows tucked at a ~45° angle.'
      };
    }
    if (isPullOrBack) {
      return {
        phase1: 'CONCENTRIC (1s): Drive elbows down and back towards hips.',
        phase2: 'ECCENTRIC (3s): Squeeze lats at bottom, stretch under control.',
        keyCue: 'Initiate movement with scapular depression, avoid excessive momentum.'
      };
    }
    if (isDeadliftOrHinge) {
      return {
        phase1: 'PULL PHASE: Engage lats, push floor away through heels.',
        phase2: 'LOCKOUT: Squeeze glutes firmly at top without hyperextending.',
        keyCue: 'Bar stays glued to shins. Hinge at hips with locked core.'
      };
    }
    return {
      phase1: 'ECCENTRIC: Controlled 2-second negative stretch.',
      phase2: 'CONCENTRIC: Explosive contraction with 1-second squeeze.',
      keyCue: 'Isolate targeted muscle group, minimize momentum.'
    };
  };

  const cues = getFormCues();

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 space-y-3 overflow-hidden relative shadow-inner">
      {/* Visualizer Top Bar Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20 text-[10px] font-black uppercase">
            <Activity className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>AI Form Loop Demo</span>
          </div>
          <span className="text-slate-300 font-bold text-[11px] truncate max-w-[150px] sm:max-w-none">
            {exerciseName}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowTechniqueOverlay(!showTechniqueOverlay)}
            className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition text-[10px] flex items-center space-x-1 px-1.5"
            title="Toggle Form Cue Overlay"
          >
            {showTechniqueOverlay ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3 text-slate-400" />}
            <span className="hidden sm:inline font-bold">{showTechniqueOverlay ? 'Hide Cues' : 'Cues'}</span>
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 transition"
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-amber-400" /> : <Play className="w-3.5 h-3.5 fill-amber-400" />}
          </button>
        </div>
      </div>

      {/* SVG ANIMATED DEMO CANVAS */}
      <div className="relative w-full h-36 bg-slate-900/90 border border-slate-800/80 rounded-xl overflow-hidden flex items-center justify-center p-2">
        {/* Dynamic Grid Background Overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #f59e0b 1px, transparent 1px)`,
            backgroundSize: '16px 16px'
          }}
        />

        {/* Dynamic Biomechanical SVG Skeleton Animation based on Exercise Type */}
        <svg viewBox="0 0 200 120" className="w-full h-full max-h-32">
          <defs>
            <linearGradient id="barGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* SQUAT / LEG PRESS ANIMATION */}
          {isSquatOrLegs && (
            <g className={isPlaying ? 'animate-bounce' : ''} style={{ animationDuration: '2.5s' }}>
              {/* Floor Base */}
              <line x1="40" y1="105" x2="160" y2="105" stroke="#334155" strokeWidth="3" strokeDasharray="4 2" />
              {/* Feet / Shin */}
              <path d="M 85 105 L 90 85 L 95 65" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
              <path d="M 115 105 L 110 85 L 105 65" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
              {/* Thighs (Quads Glowing) */}
              <path d="M 95 65 L 100 45" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" filter="url(#glow)" />
              <path d="M 105 65 L 100 45" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" filter="url(#glow)" />
              {/* Torso & Head */}
              <path d="M 100 45 L 100 20" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />
              <circle cx="100" cy="12" r="7" fill="#cbd5e1" />
              {/* Barbell & Plates */}
              <rect x="50" y="22" width="100" height="4" fill="url(#barGlow)" filter="url(#glow)" rx="2" />
              <rect x="45" y="14" width="8" height="20" fill="#ef4444" rx="2" />
              <rect x="147" y="14" width="8" height="20" fill="#ef4444" rx="2" />
              {/* Motion Vectors */}
              <path d="M 100 8 L 100 2" stroke="#10b981" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrow)" />
            </g>
          )}

          {/* BENCH / CHEST PRESS ANIMATION */}
          {isBenchOrChest && (
            <g>
              {/* Bench Structure */}
              <rect x="50" y="70" width="100" height="8" fill="#334155" rx="3" />
              <line x1="65" y1="78" x2="65" y2="105" stroke="#475569" strokeWidth="4" />
              <line x1="135" y1="78" x2="135" y2="105" stroke="#475569" strokeWidth="4" />
              {/* Athlete Torso lying down */}
              <line x1="60" y1="65" x2="130" y2="65" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
              <circle cx="138" cy="65" r="7" fill="#cbd5e1" />
              {/* Chest Muscle Highlight */}
              <ellipse cx="95" cy="63" rx="10" ry="4" fill="#f59e0b" filter="url(#glow)" />
              {/* Animated Barbell Pressing */}
              <g className={isPlaying ? 'animate-pulse' : ''} style={{ animationDuration: '2s' }}>
                <rect x="45" y="40" width="110" height="5" fill="url(#barGlow)" filter="url(#glow)" rx="2" />
                <rect x="40" y="32" width="7" height="21" fill="#f59e0b" rx="2" />
                <rect x="153" y="32" width="7" height="21" fill="#f59e0b" rx="2" />
                {/* Arms driving up */}
                <path d="M 80 65 L 80 43" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
                <path d="M 110 65 L 110 43" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
              </g>
            </g>
          )}

          {/* BACK / LAT PULLDOWN / ROW ANIMATION */}
          {isPullOrBack && (
            <g>
              {/* Pulldown Machine / Pulley Top */}
              <rect x="80" y="5" width="40" height="6" fill="#334155" rx="2" />
              <line x1="100" y1="11" x2="100" y2="25" stroke="#64748b" strokeWidth="2" strokeDasharray="3 2" />
              {/* Seated Athlete */}
              <path d="M 100 80 L 100 45" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
              <circle cx="100" cy="37" r="7" fill="#cbd5e1" />
              {/* Lat Muscles Highlight */}
              <path d="M 92 50 Q 100 55 108 50" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" filter="url(#glow)" />
              {/* Pulldown Lat Bar Loop */}
              <g className={isPlaying ? 'animate-pulse' : ''} style={{ animationDuration: '2.2s' }}>
                <rect x="55" y="25" width="90" height="4" fill="url(#barGlow)" filter="url(#glow)" rx="2" />
                <path d="M 70 27 L 95 45" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                <path d="M 130 27 L 105 45" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
              </g>
            </g>
          )}

          {/* OVERHEAD / SHOULDER PRESS ANIMATION */}
          {isShoulder && (
            <g>
              {/* Athlete Torso */}
              <line x1="100" y1="100" x2="100" y2="45" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
              <circle cx="100" cy="36" r="7" fill="#cbd5e1" />
              {/* Deltoid Highlights */}
              <circle cx="92" cy="46" r="5" fill="#f59e0b" filter="url(#glow)" />
              <circle cx="108" cy="46" r="5" fill="#f59e0b" filter="url(#glow)" />
              {/* Animated Dumbbells moving overhead */}
              <g className={isPlaying ? 'animate-bounce' : ''} style={{ animationDuration: '2.4s' }}>
                <rect x="50" y="15" width="100" height="4" fill="url(#barGlow)" filter="url(#glow)" rx="2" />
                <circle cx="48" cy="17" r="8" fill="#10b981" />
                <circle cx="152" cy="17" r="8" fill="#10b981" />
                {/* Arms Extended */}
                <path d="M 92 46 L 70 17" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
                <path d="M 108 46 L 130 17" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
              </g>
            </g>
          )}

          {/* DEFAULT / ARM / ISOLATION MOVEMENT ANIMATION */}
          {!isSquatOrLegs && !isBenchOrChest && !isPullOrBack && !isShoulder && (
            <g>
              {/* Standing Silhouette */}
              <line x1="100" y1="105" x2="100" y2="45" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
              <circle cx="100" cy="36" r="7" fill="#cbd5e1" />
              {/* Bicep / Muscle Contraction Ring */}
              <circle cx="112" cy="55" r="7" fill="#f59e0b" filter="url(#glow)" className={isPlaying ? 'animate-ping' : ''} />
              {/* Curling Weight */}
              <g className={isPlaying ? 'animate-pulse' : ''} style={{ animationDuration: '1.8s' }}>
                <path d="M 100 48 L 115 58 L 105 75" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                <circle cx="105" cy="75" r="8" fill="#ef4444" filter="url(#glow)" />
              </g>
            </g>
          )}
        </svg>

        {/* Phase Badge Floating Tag */}
        <div className="absolute bottom-2 left-2 bg-slate-950/90 border border-slate-800 px-2 py-1 rounded-lg text-[10px] font-mono text-amber-400 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Optimal Trajectory Path</span>
        </div>
      </div>

      {/* Technique & Execution Cues Bar */}
      {showTechniqueOverlay && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 space-y-1 text-[11px] font-sans">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Biomechanics & Form Execution Cues</span>
          </div>
          <p className="text-slate-300 leading-snug">
            {cues.keyCue}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px] text-slate-400">
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{cues.phase1}</span>
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{cues.phase2}</span>
          </div>
        </div>
      )}
    </div>
  );
};
