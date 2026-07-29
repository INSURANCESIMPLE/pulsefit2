import React, { useState, useEffect, useRef } from 'react';
import { 
  X, HeartPulse, CheckCircle2, Circle, Clock, Flame, 
  Sparkles, RefreshCw, Trophy, Zap, Plus, AlertCircle, ArrowRight, MessageSquare, Lightbulb,
  Play, Pause, SkipForward, Dumbbell, Activity, Check, ShieldCheck, Volume2, VolumeX, Bluetooth
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Routine, WorkoutSession, ExerciseLog, HeartRatePoint, EquipmentCategory } from '../types';
import { getHeartRateZone, playBeepSound } from '../utils/heartRateUtils';
import { ExerciseTipsModal } from './ExerciseTipsModal';
import { ExerciseFormVisualizer } from './ExerciseFormVisualizer';

export interface WarmupStretch {
  name: string;
  durationSeconds: number;
  targetMuscle: string;
  instructions: string;
  purpose: string;
}

export interface WarmupRoutineData {
  warmupTitle: string;
  totalDurationMins: number;
  stretches: WarmupStretch[];
}

// Fallback dynamic warmup generator based on targeted muscles
function getFallbackWarmup(targetMuscles: string[], routineName: string): WarmupRoutineData {
  const musclesUpper = targetMuscles.map((m) => m.toUpperCase());
  const isLegs = musclesUpper.some((m) => m.includes('LEG') || m.includes('SQUAT') || m.includes('LOWER') || m.includes('QUAD') || m.includes('HAMSTRING') || m.includes('GLUTE'));
  const isChest = musclesUpper.some((m) => m.includes('CHEST') || m.includes('PUSH') || m.includes('BENCH'));
  const isBack = musclesUpper.some((m) => m.includes('BACK') || m.includes('PULL') || m.includes('LAT'));

  const stretches: WarmupStretch[] = [];

  stretches.push({
    name: 'Jumping Jacks & High Knees',
    durationSeconds: 60,
    targetMuscle: 'Full Body & Cardiorespiratory',
    instructions: 'Perform steady-paced jumping jacks for 30s, followed by light high knees for 30s.',
    purpose: 'Elevates core body temperature and primes systemic blood flow.'
  });

  if (isLegs) {
    stretches.push({
      name: 'Dynamic Leg Swings (Front & Lateral)',
      durationSeconds: 60,
      targetMuscle: 'Hamstrings, Hip Flexors & Adductors',
      instructions: 'Hold onto a stable upright. Swing one leg forward/back 15x, then side-to-side 15x. Switch legs.',
      purpose: 'Mobilizes hip capsule and dynamic hamstring elasticity for leg drives.'
    });
    stretches.push({
      name: 'Bodyweight Deep Squat with Thoracic Reach',
      durationSeconds: 60,
      targetMuscle: 'Quads, Glutes, Ankles & Thoracic Spine',
      instructions: 'Squat deep into heel drive, place left hand on floor and reach right arm up to ceiling. Switch sides dynamically.',
      purpose: 'Unlocks ankle dorsiflexion, hip flexors, and thoracic rotation.'
    });
  } else if (isChest) {
    stretches.push({
      name: 'Arm Circles & Cross-Chest Hugs',
      durationSeconds: 60,
      targetMuscle: 'Pectorals, Anterior Delts & Rotator Cuff',
      instructions: 'Swing arms wide horizontally across chest 30s, then perform forward and reverse medium circles 30s.',
      purpose: 'Increases shoulder synovial fluid and mobilizes pec fascia.'
    });
    stretches.push({
      name: 'Dynamic Doorway/Wall Pec Stretch',
      durationSeconds: 60,
      targetMuscle: 'Chest, Biceps & Shoulder Capsule',
      instructions: 'Place forearm against upright. Rotate torso away gently, pause 2s, release and repeat dynamically.',
      purpose: 'Opens anterior shoulder and primes bench press scapular retraction.'
    });
  } else if (isBack) {
    stretches.push({
      name: 'Cat-Cow Flow & Torso Twists',
      durationSeconds: 60,
      targetMuscle: 'Latissimus Dorsi & Spinal Erectors',
      instructions: 'On quadruped, arch spine up toward ceiling (cat), then dip belly down smoothly (cow).',
      purpose: 'Mobilizes entire spinal column and releases lumbar tightness.'
    });
    stretches.push({
      name: 'Prone Y-T-W Raises & Scapular Squeezes',
      durationSeconds: 60,
      targetMuscle: 'Rhomboids, Rear Delts & Trapezius',
      instructions: 'Form Y, T, and W shapes with arms, squeezing shoulder blades together for 2 seconds each rep.',
      purpose: 'Wakes up mid-back scapular retractors for heavy pulling.'
    });
  } else {
    stretches.push({
      name: 'Arm Circles & Torso Rotations',
      durationSeconds: 60,
      targetMuscle: 'Upper Body & Core Rotators',
      instructions: 'Perform fluid arm circles for 30s, followed by standing torso rotations with loose arms for 30s.',
      purpose: 'Mobilizes spinal column and shoulder joints.'
    });
    stretches.push({
      name: 'Bodyweight Deep Squat Pause',
      durationSeconds: 60,
      targetMuscle: 'Hips, Quads & Lower Back',
      instructions: 'Lower into a deep squat, hold bottom for 2s while driving knees outward with elbows, stand up and repeat.',
      purpose: 'Opens hip flexors and ankle mobility.'
    });
  }

  stretches.push({
    name: "World's Greatest Stretch (Lunge + Twist)",
    durationSeconds: 60,
    targetMuscle: 'Hip Flexors, Hamstrings, Thoracic Spine & Glutes',
    instructions: 'Step into a deep runner lunge, place inside elbow near ankle, then rotate open to ceiling. Alternate sides.',
    purpose: 'Premier compound mobility drill for full body athletic readiness.'
  });

  stretches.push({
    name: `Light Movement Pattern Prep (${targetMuscles[0] || 'Target Muscles'})`,
    durationSeconds: 60,
    targetMuscle: `${targetMuscles.join(', ') || 'Primary Muscles'}`,
    instructions: 'Perform 15-20 unweighted controlled reps of your primary movement pattern (e.g. push-ups, bodyweight squats, or hinges).',
    purpose: 'Grooves neurological motor pattern before loading working weights.'
  });

  return {
    warmupTitle: `5-Min Targeted Warm-up (${targetMuscles.join(' & ') || 'Full Body'})`,
    totalDurationMins: 5,
    stretches
  };
}

interface ActiveWorkoutModalProps {
  routine?: Routine;
  gymName?: string;
  availableEquipment: EquipmentCategory[];
  onClose: () => void;
  onFinishWorkout: (session: WorkoutSession) => void;
  onReqAiSwap: (exerciseName: string, category: string) => void;
  onOpenBluetoothModal?: () => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  routine,
  gymName,
  availableEquipment,
  onClose,
  onFinishWorkout,
  onReqAiSwap,
  onOpenBluetoothModal
}) => {
  // Pre-Workout Step State: 'warmup' or 'lifting'
  const [activeStep, setActiveStep] = useState<'warmup' | 'lifting'>('warmup');

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentHr, setCurrentHr] = useState(132);
  const [hrTelemetry, setHrTelemetry] = useState<HeartRatePoint[]>([]);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [tipsModalState, setTipsModalState] = useState<{
    isOpen: boolean;
    exerciseName: string;
    category?: string;
  }>({ isOpen: false, exerciseName: '' });
  
  // Exercises state for logging
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(() => {
    if (routine) {
      return routine.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        category: ex.category,
        sets: Array.from({ length: ex.targetSets }).map((_, i) => ({
          id: `set-${ex.exerciseId}-${i + 1}`,
          setNumber: i + 1,
          targetReps: ex.targetReps,
          actualReps: ex.targetReps,
          weightKg: ex.targetWeightKg,
          completed: false,
          rpe: 8,
          heartRateBpm: 130
        }))
      }));
    }
    // Default starter session if quick workout
    return [
      {
        exerciseId: 'ex-bench-press',
        exerciseName: 'Barbell Bench Press',
        category: 'Chest',
        sets: [
          { id: 's1', setNumber: 1, targetReps: 8, actualReps: 8, weightKg: 75, completed: false, rpe: 8, heartRateBpm: 128 },
          { id: 's2', setNumber: 2, targetReps: 8, actualReps: 8, weightKg: 75, completed: false, rpe: 8.5, heartRateBpm: 135 },
          { id: 's3', setNumber: 3, targetReps: 8, actualReps: 8, weightKg: 80, completed: false, rpe: 9, heartRateBpm: 142 }
        ]
      },
      {
        exerciseId: 'ex-lat-pulldown',
        exerciseName: 'Lat Pulldown Machine',
        category: 'Back',
        sets: [
          { id: 's4', setNumber: 1, targetReps: 10, actualReps: 10, weightKg: 60, completed: false, rpe: 7.5, heartRateBpm: 125 },
          { id: 's5', setNumber: 2, targetReps: 10, actualReps: 10, weightKg: 65, completed: false, rpe: 8, heartRateBpm: 132 }
        ]
      }
    ];
  });

  // Extract unique targeted muscle categories
  const targetMuscles: string[] = Array.from(new Set(exerciseLogs.map((e) => e.category)));

  // Warm-up Dynamic Routine State
  const [warmupData, setWarmupData] = useState<WarmupRoutineData>(() => 
    getFallbackWarmup(targetMuscles, routine?.name || 'Strength Session')
  );
  const [currentStretchIndex, setCurrentStretchIndex] = useState(0);
  const [stretchTimerSeconds, setStretchTimerSeconds] = useState(60);
  const [isStretchTimerRunning, setIsStretchTimerRunning] = useState(false);
  const [completedStretchIndices, setCompletedStretchIndices] = useState<number[]>([]);
  const [isGeneratingAiWarmup, setIsGeneratingAiWarmup] = useState(false);

  // Rest Timer state
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [isRestActive, setIsRestActive] = useState(false);
  const [isRestChimeEnabled, setIsRestChimeEnabled] = useState(true);

  // Fetch AI-tailored dynamic warm-up routine
  const handleGenerateAiWarmup = async () => {
    setIsGeneratingAiWarmup(true);
    try {
      const exerciseNames = exerciseLogs.map((e) => e.exerciseName);
      const res = await fetch('/api/generate-warmup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routineName: routine?.name || 'Targeted Strength Routine',
          targetMuscles,
          exerciseNames
        })
      });

      const data = await res.json();
      if (data.success && data.warmup?.stretches?.length) {
        setWarmupData(data.warmup);
        setCurrentStretchIndex(0);
        setStretchTimerSeconds(data.warmup.stretches[0].durationSeconds || 60);
        setCompletedStretchIndices([]);
      }
    } catch (err) {
      console.error('Failed to generate AI warm-up:', err);
    } finally {
      setIsGeneratingAiWarmup(false);
    }
  };

  // Active workout timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Stretch Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (isStretchTimerRunning && stretchTimerSeconds > 0) {
      timer = setInterval(() => {
        setStretchTimerSeconds((prev) => {
          if (prev <= 1) {
            playBeepSound('set_logged');
            // Mark current stretch completed
            setCompletedStretchIndices((prevIndices) => 
              prevIndices.includes(currentStretchIndex) ? prevIndices : [...prevIndices, currentStretchIndex]
            );
            setIsStretchTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStretchTimerRunning, stretchTimerSeconds, currentStretchIndex]);

  // Heart Rate telemetry sampler
  useEffect(() => {
    const hrInterval = setInterval(() => {
      setCurrentHr((prev) => {
        const delta = (Math.random() - 0.48) * 4;
        const newBpm = Math.min(195, Math.max(90, Math.round(prev + delta)));
        
        if (elapsedSeconds % 10 === 0) {
          const zone = getHeartRateZone(newBpm).name;
          setHrTelemetry((tele) => [
            ...tele,
            { timestamp: elapsedSeconds, bpm: newBpm, zone }
          ]);
        }
        return newBpm;
      });
    }, 1000);

    return () => clearInterval(hrInterval);
  }, [elapsedSeconds]);

  // Rest countdown handler
  useEffect(() => {
    if (isRestActive && restTimerSeconds !== null && restTimerSeconds > 0) {
      const restInterval = setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            setIsRestActive(false);
            if (isRestChimeEnabled) {
              playBeepSound('rest_complete');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(restInterval);
    }
  }, [isRestActive, restTimerSeconds, isRestChimeEnabled]);

  const toggleSetCompleted = (exIndex: number, setIndex: number) => {
    setExerciseLogs((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const targetSet = copy[exIndex].sets[setIndex];
      const newStatus = !targetSet.completed;
      targetSet.completed = newStatus;
      targetSet.heartRateBpm = currentHr;

      if (newStatus) {
        playBeepSound('set_logged');
        setRestTimerSeconds(60);
        setIsRestActive(true);
      }

      return copy;
    });
  };

  const updateSetField = (exIndex: number, setIndex: number, field: 'actualReps' | 'weightKg' | 'rpe', val: number) => {
    setExerciseLogs((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy[exIndex].sets[setIndex][field] = val;
      return copy;
    });
  };

  const addExtraSet = (exIndex: number) => {
    setExerciseLogs((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const ex = copy[exIndex];
      const lastSet = ex.sets[ex.sets.length - 1] || { targetReps: 10, weightKg: 20, rpe: 8 };
      ex.sets.push({
        id: `set-${ex.exerciseId}-${ex.sets.length + 1}`,
        setNumber: ex.sets.length + 1,
        targetReps: lastSet.targetReps,
        actualReps: lastSet.targetReps,
        weightKg: lastSet.weightKg,
        completed: false,
        rpe: lastSet.rpe,
        heartRateBpm: currentHr
      });
      return copy;
    });
  };

  const handleFinish = () => {
    let totalVol = 0;
    let completedSetsCount = 0;
    let sumRpe = 0;

    exerciseLogs.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed) {
          totalVol += (s.weightKg * s.actualReps);
          completedSetsCount++;
          sumRpe += s.rpe;
        }
      });
    });

    const avgRpe = completedSetsCount > 0 ? (sumRpe / completedSetsCount) : 8;
    const caloriesBurned = Math.round((elapsedSeconds / 60) * (currentHr / 15));
    const exertionScore = Math.min(100, Math.round((currentHr / 190) * 50 + (avgRpe / 10) * 50));
    const xpEarned = Math.round(200 + (totalVol / 50) + (exertionScore * 2));

    const finalSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      name: routine ? routine.name : 'Live Workout Session',
      routineId: routine?.id,
      date: new Date().toISOString().split('T')[0],
      durationSeconds: elapsedSeconds,
      totalVolumeKg: totalVol,
      avgHeartRate: Math.round(currentHr),
      maxHeartRate: Math.round(currentHr + 15),
      caloriesBurned,
      exertionScore,
      gymName: gymName || 'Equinox Fitness - Downtown Hub',
      exercises: exerciseLogs,
      heartRateTelemetry: hrTelemetry.length > 0 ? hrTelemetry : [
        { timestamp: 0, bpm: 100, zone: 'Warm-up' },
        { timestamp: elapsedSeconds, bpm: currentHr, zone: getHeartRateZone(currentHr).name }
      ],
      xpEarned,
      notes: workoutNotes.trim() || undefined
    };

    playBeepSound('workout_complete');
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    onFinishWorkout(finalSession);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentZone = getHeartRateZone(currentHr);
  const activeStretch = warmupData.stretches[currentStretchIndex] || warmupData.stretches[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col overflow-hidden text-slate-100 animate-fade-in">
      {/* Top iOS Workout Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-3.5 px-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Active Workout Session</span>
          </div>
          <h2 className="text-lg font-black tracking-tight text-slate-100 mt-0.5">
            {routine ? routine.name : 'Live Set & Exertion Tracker'}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Pre-Workout Step Indicator Bar: Warm-Up vs Main Workout */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveStep('warmup')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition border ${
            activeStep === 'warmup'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-[1.02]'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Step 1: 5-Min Warm-Up ({completedStretchIndices.length}/{warmupData.stretches.length})</span>
        </button>

        <button
          onClick={() => setActiveStep('lifting')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition border ${
            activeStep === 'lifting'
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md scale-[1.02]'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Step 2: Main Lifting Sets</span>
        </button>
      </div>

      {/* Real-time Telemetry Banner: Elapsed Time & Live HR Monitor */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 p-3 px-4 flex items-center justify-between">
        {/* Elapsed Timer */}
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Duration</div>
            <div className="font-mono font-bold text-base text-slate-100">{formatTimer(elapsedSeconds)}</div>
          </div>
        </div>

        {/* Live HR Badge & Interactive Exertion Control */}
        <div className="flex items-center space-x-3 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-2xl">
          <div className="relative">
            <HeartPulse className="w-6 h-6 text-rose-500 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-400 rounded-full animate-ping"></span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-mono font-black text-lg text-slate-100">{currentHr}</span>
              <span className="text-[10px] text-slate-400">BPM</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${currentZone.badgeBg} ${currentZone.textColor}`}>
                {currentZone.name}
              </span>
            </div>
            {/* Quick BPM Simulator Slider */}
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="text-[9px] text-slate-500">Intensity:</span>
              <input
                type="range"
                min="90"
                max="190"
                value={currentHr}
                onChange={(e) => setCurrentHr(Number(e.target.value))}
                className="w-16 accent-rose-500 cursor-pointer h-1 bg-slate-700 rounded-lg"
              />
            </div>
          </div>

          {onOpenBluetoothModal && (
            <button
              onClick={onOpenBluetoothModal}
              className="ml-1 p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-blue-400 hover:text-blue-300 rounded-xl transition shadow-sm"
              title="Pair Bluetooth HR Monitor (Polar, Garmin, Apple Watch)"
            >
              <Bluetooth className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Rest Timer Widget if active */}
        {restTimerSeconds !== null && restTimerSeconds > 0 ? (
          <div className="flex items-center space-x-2 bg-indigo-950/80 border border-indigo-500/50 px-3 py-1.5 rounded-2xl animate-pulse">
            <Clock className="w-4 h-4 text-indigo-400" />
            <div>
              <div className="text-[9px] text-indigo-300 font-bold uppercase">Rest Countdown</div>
              <div className="font-mono font-black text-sm text-indigo-200">{restTimerSeconds}s</div>
            </div>
            <button
              onClick={() => setRestTimerSeconds((prev) => (prev || 0) + 30)}
              className="text-[10px] bg-indigo-800 hover:bg-indigo-700 text-indigo-100 font-bold px-1.5 py-0.5 rounded"
            >
              +30s
            </button>

            {/* Audio Chime Notification Toggle Button */}
            <button
              onClick={() => {
                const newSetting = !isRestChimeEnabled;
                setIsRestChimeEnabled(newSetting);
                if (newSetting) {
                  playBeepSound('rest_complete');
                }
              }}
              className={`p-1.5 rounded-lg border transition ${
                isRestChimeEnabled
                  ? 'bg-lime-500/20 text-lime-400 border-lime-500/40 hover:bg-lime-500/30'
                  : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
              }`}
              title={isRestChimeEnabled ? 'Soft Rest Chime Enabled (Tap to mute or test sound)' : 'Soft Rest Chime Muted (Tap to enable)'}
            >
              {isRestChimeEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
            <button
              onClick={() => {
                const newSetting = !isRestChimeEnabled;
                setIsRestChimeEnabled(newSetting);
                if (newSetting) {
                  playBeepSound('rest_complete');
                }
              }}
              className={`flex items-center space-x-1 px-2 py-1 rounded-xl border text-[11px] font-bold transition ${
                isRestChimeEnabled 
                  ? 'bg-slate-800 text-lime-400 border-lime-500/30 hover:border-lime-400' 
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
              title="Rest Timer Sound Chime"
            >
              {isRestChimeEnabled ? <Volume2 className="w-3.5 h-3.5 text-lime-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{isRestChimeEnabled ? 'Rest Chime On' : 'Chime Off'}</span>
            </button>

            <div className="flex items-center space-x-1 text-slate-400">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">{Math.round((elapsedSeconds / 60) * (currentHr / 15))} kcal</span>
            </div>
          </div>
        )}
      </div>

      {/* VIEW STEP 1: PRE-WORKOUT TARGETED DYNAMIC WARM-UP */}
      {activeStep === 'warmup' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-28">
          {/* Targeted Muscle Banner & AI Regenerate Header */}
          <div className="bento-card border-amber-500/30 space-y-3 relative overflow-hidden shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Targeted Pre-Workout Prep
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-100 mt-0.5">
                  {warmupData.warmupTitle}
                </h3>
              </div>

              <button
                onClick={handleGenerateAiWarmup}
                disabled={isGeneratingAiWarmup}
                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAiWarmup ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAiWarmup ? 'Generating AI Stretch...' : 'Regenerate AI Warm-Up'}</span>
              </button>
            </div>

            {/* Targeted Muscles Badges */}
            <div className="flex items-center space-x-1.5 flex-wrap pt-1">
              <span className="text-[11px] font-bold text-slate-400">Muscles Primed:</span>
              {targetMuscles.map((m, idx) => (
                <span key={idx} className="text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Active Stretch Spotlight Card with Countdown Timer */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/40 rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  Current Stretch ({currentStretchIndex + 1} / {warmupData.stretches.length})
                </span>
                <h2 className="text-lg font-black text-slate-100 mt-2">
                  {activeStretch.name}
                </h2>
              </div>

              {/* Timer Display Circle / Badge */}
              <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-3 text-center min-w-[90px] shadow-inner">
                <span className="text-[9px] font-bold uppercase text-slate-400 block">Timer</span>
                <span className="font-mono font-black text-2xl text-amber-400">{stretchTimerSeconds}s</span>
              </div>
            </div>

            {/* Stretch Purpose & Instructions */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center space-x-1.5 text-amber-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Target & Purpose: {activeStretch.targetMuscle}</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">
                {activeStretch.instructions}
              </p>
              <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/20 mt-1">
                💡 <strong>Biomechanical Benefit:</strong> {activeStretch.purpose}
              </div>
            </div>

            {/* Stretch Timer Controls */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={() => setIsStretchTimerRunning(!isStretchTimerRunning)}
                className={`flex-1 py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center space-x-2 transition shadow-lg ${
                  isStretchTimerRunning
                    ? 'bg-rose-500 hover:bg-rose-400 text-slate-950'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {isStretchTimerRunning ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
                <span>{isStretchTimerRunning ? 'Pause Stretch Timer' : 'Start 60s Timer'}</span>
              </button>

              <button
                onClick={() => {
                  setStretchTimerSeconds(activeStretch.durationSeconds || 60);
                  setIsStretchTimerRunning(false);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl border border-slate-700 transition"
                title="Reset Timer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (currentStretchIndex < warmupData.stretches.length - 1) {
                    const nextIdx = currentStretchIndex + 1;
                    setCurrentStretchIndex(nextIdx);
                    setStretchTimerSeconds(warmupData.stretches[nextIdx].durationSeconds || 60);
                    setIsStretchTimerRunning(false);
                  }
                }}
                disabled={currentStretchIndex >= warmupData.stretches.length - 1}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 px-3 py-3 rounded-xl border border-slate-700 transition text-xs font-bold flex items-center space-x-1"
              >
                <span>Next</span>
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Full 5-Stretch Checklist Breakdown */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
              Complete 5-Minute Warm-Up Breakdown
            </h4>

            <div className="space-y-2">
              {warmupData.stretches.map((stretch, idx) => {
                const isSelected = idx === currentStretchIndex;
                const isDone = completedStretchIndices.includes(idx);

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentStretchIndex(idx);
                      setStretchTimerSeconds(stretch.durationSeconds || 60);
                      setIsStretchTimerRunning(false);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-950/20 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                        : isDone
                        ? 'bg-emerald-950/15 border-emerald-500/30 text-emerald-200'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCompletedStretchIndices((prev) =>
                            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                          );
                        }}
                        className={`p-1 rounded-lg transition ${
                          isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4 font-black" /> : <Circle className="w-4 h-4" />}
                      </button>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-xs text-slate-100">{stretch.name}</span>
                          <span className="text-[9px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                            {stretch.durationSeconds}s
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block font-sans mt-0.5">
                          Target: {stretch.targetMuscle}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                      Stretch #{idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Button: Transition to Step 2 Lifting */}
          <div className="pt-2">
            <button
              onClick={() => setActiveStep('lifting')}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm py-3.5 rounded-2xl shadow-xl flex items-center justify-center space-x-2 active:scale-95 transition"
            >
              <CheckCircle2 className="w-5 h-5 text-slate-950" />
              <span>Warm-Up Complete: Proceed to Main Lifting Sets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW STEP 2: MAIN EXERCISES & WORKING SET LOGGING */}
      {activeStep === 'lifting' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-28">
          {exerciseLogs.map((ex, exIndex) => (
            <div 
              key={ex.exerciseId + exIndex}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg shadow-slate-950"
            >
              {/* Exercise Header + AI Buttons */}
              <div className="flex items-start justify-between mb-3 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {ex.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 mt-1">{ex.exerciseName}</h3>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    onClick={() => setTipsModalState({ isOpen: true, exerciseName: ex.exerciseName, category: ex.category })}
                    className="flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-lime-400 border border-lime-500/30 px-2.5 py-1.5 rounded-xl transition shadow-sm"
                    title="View AI Quick Form & Execution Guidance"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-lime-400" />
                    <span className="hidden sm:inline font-bold">Quick Tips</span>
                    <span className="sm:hidden font-bold">Tips</span>
                  </button>

                  <button
                    onClick={() => onReqAiSwap(ex.exerciseName, ex.category)}
                    className="flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-xl transition shadow-sm"
                    title="Machine busy or crowded? Get instant AI substitute exercises"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline font-bold">AI Swap</span>
                  </button>
                </div>
              </div>

              {/* Form & Biomechanics Animation Loop */}
              <div className="mb-4">
                <ExerciseFormVisualizer exerciseName={ex.exerciseName} category={ex.category} />
              </div>

              {/* Set Table Headers */}
              <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
                <div className="col-span-2">Set</div>
                <div className="col-span-3 text-center">Weight (kg)</div>
                <div className="col-span-3 text-center">Reps</div>
                <div className="col-span-2 text-center">RPE (1-10)</div>
                <div className="col-span-2 text-right">Done</div>
              </div>

              {/* Sets Rows */}
              <div className="space-y-2">
                {ex.sets.map((set, setIndex) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl transition-all ${
                      set.completed 
                        ? 'bg-emerald-950/20 border border-emerald-500/30 text-emerald-100' 
                        : 'bg-slate-800/60 border border-slate-700/60 text-slate-200'
                    }`}
                  >
                    {/* Set Number */}
                    <div className="col-span-2 font-bold text-xs flex items-center space-x-1">
                      <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px]">
                        {set.setNumber}
                      </span>
                    </div>

                    {/* Weight Input */}
                    <div className="col-span-3">
                      <input
                        type="number"
                        step="2.5"
                        value={set.weightKg}
                        onChange={(e) => updateSetField(exIndex, setIndex, 'weightKg', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-center text-xs font-bold py-1.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    {/* Reps Input */}
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={set.actualReps}
                        onChange={(e) => updateSetField(exIndex, setIndex, 'actualReps', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-center text-xs font-bold py-1.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    {/* RPE Exertion Selector */}
                    <div className="col-span-2 text-center">
                      <select
                        value={set.rpe}
                        onChange={(e) => updateSetField(exIndex, setIndex, 'rpe', parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 text-amber-300 text-center text-xs font-bold py-1.5 rounded-lg outline-none"
                      >
                        <option value={6}>6 (Easy)</option>
                        <option value={7}>7 (Moderate)</option>
                        <option value={8}>8 (Hard)</option>
                        <option value={9}>9 (Very Hard)</option>
                        <option value={10}>10 (Max Limit)</option>
                      </select>
                    </div>

                    {/* Completion Toggle */}
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => toggleSetCompleted(exIndex, setIndex)}
                        className={`p-1.5 rounded-xl transition ${
                          set.completed
                            ? 'bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        }`}
                      >
                        {set.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-slate-950 fill-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Extra Set button */}
              <button
                onClick={() => addExtraSet(exIndex)}
                className="mt-3 flex items-center space-x-1 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Set</span>
              </button>
            </div>
          ))}

          {/* Session Notes & Recovery Feedback Input */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-lg shadow-slate-950">
            <div className="flex items-center space-x-2 text-lime-400">
              <MessageSquare className="w-4 h-4 text-lime-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Workout Notes & Recovery Feedback
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Record subjective observations, energy levels, joint comfort, or equipment settings for future reference.
            </p>
            <textarea
              rows={3}
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="e.g. Felt great on bench press today. Right shoulder felt smooth. Energy 8/10, slight tightness on last set of lat pulldowns."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-lime-500 outline-none transition resize-none"
            />
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar: Finish Workout */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 border-t border-slate-800 p-4 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="text-xs text-slate-400">
            <div>Current HR: <span className="text-rose-400 font-bold">{currentHr} BPM</span></div>
            <div className="text-[10px] text-slate-500">Exertion: {getHeartRateZone(currentHr).name}</div>
          </div>

          <button
            onClick={handleFinish}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm px-6 py-3 rounded-2xl shadow-lg shadow-emerald-950/80 active:scale-95 transition"
          >
            <Trophy className="w-4 h-4 fill-slate-950" />
            <span>Finish Workout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Quick Form Tips Modal */}
      <ExerciseTipsModal
        isOpen={tipsModalState.isOpen}
        onClose={() => setTipsModalState((prev) => ({ ...prev, isOpen: false }))}
        exerciseName={tipsModalState.exerciseName}
        category={tipsModalState.category}
      />
    </div>
  );
};
