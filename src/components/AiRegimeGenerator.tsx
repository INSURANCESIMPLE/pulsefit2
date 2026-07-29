import React, { useState } from 'react';
import { Sparkles, Dumbbell, Calendar, Target, CheckCircle, ArrowRight, Loader2, Zap, ShieldCheck, Scale, Ruler, User, Heart, Flame, Activity } from 'lucide-react';
import { EquipmentCategory, Routine, UserProfile } from '../types';

interface AiRegimeGeneratorProps {
  userProfile?: UserProfile;
  onUpdateUserProfile?: (updated: Partial<UserProfile>) => void;
  availableGymEquipment: EquipmentCategory[];
  gymName?: string;
  onSaveRoutine: (routine: Routine) => void;
  onStartRoutineNow: (routine: Routine) => void;
}

export const AiRegimeGenerator: React.FC<AiRegimeGeneratorProps> = ({
  userProfile,
  onUpdateUserProfile,
  availableGymEquipment,
  gymName,
  onSaveRoutine,
  onStartRoutineNow
}) => {
  // Metric / Imperial unit system choice
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  // Body Metrics State
  const [weightKg, setWeightKg] = useState<number>(userProfile?.weightKg || 78.5);
  const [heightCm, setHeightCm] = useState<number>(userProfile?.heightCm || 180);
  const [age, setAge] = useState<number>(userProfile?.age || 28);
  const [gender, setGender] = useState<string>(userProfile?.gender || 'Male');
  const [bodyFatPercent, setBodyFatPercent] = useState<number>(userProfile?.bodyFatPercent || 15);

  // Goal & Training Preferences State
  const [primaryGoal, setPrimaryGoal] = useState<string>(userProfile?.primaryGoal || 'Hypertrophy & Mass');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>(
    userProfile?.focusAreas || ['Chest & Upper Push', 'Back & Lat Width', 'Legs & Glutes']
  );
  const [trainingStyle, setTrainingStyle] = useState<string>(
    userProfile?.trainingStyle || 'Pyramid Overload'
  );
  const [fitnessLevel, setFitnessLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [sessionDurationMins, setSessionDurationMins] = useState(50);
  const [goalPrompt, setGoalPrompt] = useState('Gain 3kg lean mass, improve chest density, and maintain under 15% body fat');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentCategory[]>([
    'Barbell', 'Dumbbell', 'Cable', 'Machine'
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedRegime, setGeneratedRegime] = useState<any | null>(null);

  // Focus Area Toggler
  const toggleFocusArea = (area: string) => {
    setSelectedFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  // Equipment Toggler
  const toggleEquipment = (eq: EquipmentCategory) => {
    setSelectedEquipment((prev) => 
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq]
    );
  };

  // Unit Converters & Display Helpers
  const displayWeight = unitSystem === 'metric' ? weightKg : Math.round(weightKg * 2.20462);
  const displayHeight = unitSystem === 'metric' ? heightCm : Math.round(heightCm * 0.393701); // in inches

  const handleWeightChange = (val: number) => {
    const kg = unitSystem === 'metric' ? val : Math.round(val / 2.20462 * 10) / 10;
    setWeightKg(Math.max(30, Math.min(250, kg)));
  };

  const handleHeightChange = (val: number) => {
    const cm = unitSystem === 'metric' ? val : Math.round(val / 0.393701);
    setHeightCm(Math.max(120, Math.min(230, cm)));
  };

  // Calculated Health Metrics
  const bmi = weightKg > 0 && heightCm > 0 ? (weightKg / ((heightCm / 100) ** 2)).toFixed(1) : '24.2';
  const getBmiCategory = (num: number) => {
    if (num < 18.5) return { label: 'Underweight', color: 'text-amber-400' };
    if (num < 25) return { label: 'Normal Weight', color: 'text-lime-400' };
    if (num < 30) return { label: 'Overweight', color: 'text-amber-400' };
    return { label: 'Obese Range', color: 'text-rose-400' };
  };

  const bmr = Math.round(
    (10 * weightKg) + (6.25 * heightCm) - (5 * age) + (gender === 'Female' ? -161 : 5)
  );
  const estimatedTdee = Math.round(bmr * 1.55); // Moderate activity multiplier

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    // Save updated body profile to user profile if callback provided
    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        weightKg,
        heightCm,
        age,
        gender,
        bodyFatPercent,
        primaryGoal,
        focusAreas: selectedFocusAreas,
        trainingStyle
      });
    }

    try {
      const response = await fetch('/api/generate-regime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalPrompt,
          fitnessLevel,
          daysPerWeek,
          sessionDurationMins,
          availableEquipment: selectedEquipment,
          gymName: gymName || 'Local Gym',
          heightCm,
          weightKg,
          age,
          gender,
          bodyFatPercent,
          primaryGoal,
          focusAreas: selectedFocusAreas,
          trainingStyle
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate regime');
      }

      setGeneratedRegime(data.regime);
    } catch (err: any) {
      console.error('Error generating AI regime:', err);
      setErrorMsg(err.message || 'AI service temporarily unavailable. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedRegime) return;

    const newRoutine: Routine = {
      id: `rt-ai-${Date.now()}`,
      name: generatedRegime.routineName,
      description: generatedRegime.description,
      targetGoal: generatedRegime.targetGoal,
      daysPerWeek: generatedRegime.daysPerWeek,
      difficulty: generatedRegime.difficulty as any,
      isAiGenerated: true,
      createdAt: new Date().toISOString().split('T')[0],
      exercises: generatedRegime.exercises.map((ex: any, idx: number) => ({
        exerciseId: `ex-gen-${idx}`,
        exerciseName: ex.exerciseName,
        category: ex.category || 'Full Body',
        targetSets: ex.targetSets || 3,
        targetReps: ex.targetReps || 10,
        targetWeightKg: ex.targetWeightKg || 20,
        restSeconds: ex.restSeconds || 60
      }))
    };

    onSaveRoutine(newRoutine);
  };

  const handleStartNow = () => {
    if (!generatedRegime) return;

    const newRoutine: Routine = {
      id: `rt-ai-${Date.now()}`,
      name: generatedRegime.routineName,
      description: generatedRegime.description,
      targetGoal: generatedRegime.targetGoal,
      daysPerWeek: generatedRegime.daysPerWeek,
      difficulty: generatedRegime.difficulty as any,
      isAiGenerated: true,
      createdAt: new Date().toISOString().split('T')[0],
      exercises: generatedRegime.exercises.map((ex: any, idx: number) => ({
        exerciseId: `ex-gen-${idx}`,
        exerciseName: ex.exerciseName,
        category: ex.category || 'Full Body',
        targetSets: ex.targetSets || 3,
        targetReps: ex.targetReps || 10,
        targetWeightKg: ex.targetWeightKg || 20,
        restSeconds: ex.restSeconds || 60
      }))
    };

    onStartRoutineNow(newRoutine);
  };

  const primaryGoalOptions = [
    { label: 'Hypertrophy & Mass', icon: '🏋️‍♂️', desc: 'Maximize muscular size & symmetry' },
    { label: 'Maximum Strength', icon: '⚡', desc: 'Heavy weight & neural power output' },
    { label: 'Shred & Fat Loss', icon: '🔥', desc: 'Caloric deficit & high metabolic burn' },
    { label: 'Endurance & VO2 Max', icon: '🫀', desc: 'Cardiovascular capacity & stamina' },
    { label: 'Body Recomposition', icon: '⚖️', desc: 'Gain lean muscle while losing fat' },
    { label: 'Athletic Mobility', icon: '🤸', desc: 'Joint longevity, core & balance' }
  ];

  const focusAreaOptions = [
    'Chest & Upper Push',
    'Back & Lat Width',
    'Legs & Glutes',
    'Shoulders & Traps',
    'Arms (Biceps & Triceps)',
    'Core & Abs',
    'Cardiovascular System'
  ];

  const trainingStyleOptions = [
    'Pyramid Overload',
    'Supersets & Circuit',
    'Heavy Powerlifting (Low Reps)',
    'Time-Under-Tension (High Volume)'
  ];

  const bmiMeta = getBmiCategory(parseFloat(bmi));

  return (
    <div className="space-y-5 pb-28">
      {/* AI Regime Banner Bento Card */}
      <div className="bento-card bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-slate-800 space-y-3 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center space-x-2 bg-lime-500/10 border border-lime-500/30 px-3 py-1 rounded-full text-lime-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              <span>AI Neural Architect</span>
            </div>

            {/* Unit Switcher */}
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-[10px] font-bold">
              <button
                onClick={() => setUnitSystem('metric')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  unitSystem === 'metric'
                    ? 'bg-lime-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                METRIC (kg/cm)
              </button>
              <button
                onClick={() => setUnitSystem('imperial')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  unitSystem === 'imperial'
                    ? 'bg-lime-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                IMPERIAL (lbs/in)
              </button>
            </div>
          </div>

          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">
            Body Stats & Custom Goal Regime
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            Input your exact body dimensions, biological metrics, and target fitness goals. Gemini uses these metrics to generate a biomechanically calibrated workout regime tailored specifically to your body.
          </p>
        </div>
      </div>

      {/* SECTION 1: Body Metrics & Biometrics Card */}
      <div className="bento-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-lime-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
              1. Physical Body Metrics
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Biomechanical Calibration</span>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Height Input */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span className="flex items-center space-x-1">
                <Ruler className="w-3 h-3 text-lime-400" />
                <span>Height</span>
              </span>
              <span className="text-slate-500 font-mono">{unitSystem === 'metric' ? 'cm' : 'inches'}</span>
            </div>
            <input
              type="number"
              value={displayHeight}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="w-full bg-transparent text-base font-black text-slate-100 outline-none font-mono"
            />
          </div>

          {/* Weight Input */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span className="flex items-center space-x-1">
                <Scale className="w-3 h-3 text-lime-400" />
                <span>Weight</span>
              </span>
              <span className="text-slate-500 font-mono">{unitSystem === 'metric' ? 'kg' : 'lbs'}</span>
            </div>
            <input
              type="number"
              step="0.5"
              value={displayWeight}
              onChange={(e) => handleWeightChange(Number(e.target.value))}
              className="w-full bg-transparent text-base font-black text-slate-100 outline-none font-mono"
            />
          </div>

          {/* Age Input */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-lime-400" />
                <span>Age</span>
              </span>
              <span className="text-slate-500 font-mono">yrs</span>
            </div>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Math.max(14, Math.min(90, Number(e.target.value))))}
              className="w-full bg-transparent text-base font-black text-slate-100 outline-none font-mono"
            />
          </div>

          {/* Body Fat % Input */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span className="flex items-center space-x-1">
                <Activity className="w-3 h-3 text-lime-400" />
                <span>Body Fat</span>
              </span>
              <span className="text-slate-500 font-mono">% est.</span>
            </div>
            <input
              type="number"
              value={bodyFatPercent}
              onChange={(e) => setBodyFatPercent(Math.max(5, Math.min(50, Number(e.target.value))))}
              className="w-full bg-transparent text-base font-black text-slate-100 outline-none font-mono"
            />
          </div>
        </div>

        {/* Gender / Frame Selector */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            Gender / Biological Frame
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Male', 'Female', 'Neutral'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  gender === g
                    ? 'bg-lime-500 border-lime-400 text-slate-950 font-black shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Live Derived Health Statistics Banner */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-3.5 grid grid-cols-3 gap-2 divide-x divide-slate-800">
          <div className="text-center px-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Body Mass Index</div>
            <div className="text-sm font-black text-slate-100 font-mono mt-0.5">{bmi}</div>
            <div className={`text-[10px] font-bold ${bmiMeta.color}`}>{bmiMeta.label}</div>
          </div>

          <div className="text-center px-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Basal Metabolic</div>
            <div className="text-sm font-black text-lime-400 font-mono mt-0.5">{bmr} <span className="text-[10px] font-normal text-slate-400">kcal</span></div>
            <div className="text-[10px] text-slate-400">Resting BMR</div>
          </div>

          <div className="text-center px-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Maintenance TDEE</div>
            <div className="text-sm font-black text-amber-400 font-mono mt-0.5">{estimatedTdee} <span className="text-[10px] font-normal text-slate-400">kcal</span></div>
            <div className="text-[10px] text-slate-400">Active Daily Target</div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Fitness Goals & Target Focus Areas Card */}
      <div className="bento-card space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2.5">
          <Target className="w-4 h-4 text-lime-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
            2. Primary Goals & Muscle Focus Areas
          </h3>
        </div>

        {/* Primary Goal Cards */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Select Your Main Goal
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {primaryGoalOptions.map((opt) => {
              const isSelected = primaryGoal === opt.label;
              return (
                <button
                  key={opt.label}
                  onClick={() => setPrimaryGoal(opt.label)}
                  className={`p-2.5 rounded-2xl border text-left transition space-y-1 ${
                    isSelected
                      ? 'bg-lime-500/10 border-lime-500 text-slate-100 shadow-md ring-1 ring-lime-500/30'
                      : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <span className="text-base">{opt.icon}</span>
                    <span className="text-xs font-bold leading-tight text-slate-100">{opt.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Focus Muscle Groups */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Target Focus Muscle Groups (Multi-Select)
          </label>
          <div className="flex flex-wrap gap-2">
            {focusAreaOptions.map((area) => {
              const isSelected = selectedFocusAreas.includes(area);
              return (
                <button
                  key={area}
                  onClick={() => toggleFocusArea(area)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    isSelected
                      ? 'bg-lime-500/10 border-lime-500 text-lime-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {area}
                </button>
              );
            })}
          </div>
        </div>

        {/* Training Style Preference */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Preferred Training Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {trainingStyleOptions.map((style) => (
              <button
                key={style}
                onClick={() => setTrainingStyle(style)}
                className={`p-2 text-xs font-bold rounded-xl border text-center transition ${
                  trainingStyle === style
                    ? 'bg-lime-500 border-lime-400 text-slate-950 font-black shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: Schedule, Experience & Equipment Card */}
      <div className="bento-card space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2.5">
          <Dumbbell className="w-4 h-4 text-lime-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
            3. Schedule & Equipment Availability
          </h3>
        </div>

        {/* Level & Days Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Experience Level
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFitnessLevel(lvl)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    fitnessLevel === lvl
                      ? 'bg-lime-500 border-lime-400 text-slate-950 font-black shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Days Per Week
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setDaysPerWeek(num)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    daysPerWeek === num
                      ? 'bg-lime-500 border-lime-400 text-slate-950 font-black shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {num} Days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Equipment Selector Chips */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Available Gym Gear ({selectedEquipment.length} Selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {(['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Treadmill', 'Bicycle', 'Resistance Band'] as EquipmentCategory[]).map((eq) => {
              const isSelected = selectedEquipment.includes(eq);
              return (
                <button
                  key={eq}
                  onClick={() => toggleEquipment(eq)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    isSelected
                      ? 'bg-lime-500/10 border-lime-500 text-lime-400 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {eq}
                </button>
              );
            })}
          </div>
        </div>

        {/* Goal Description Notes */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            Custom Notes / Specific Requests for AI
          </label>
          <textarea
            rows={2}
            value={goalPrompt}
            onChange={(e) => setGoalPrompt(e.target.value)}
            placeholder="e.g. Focus on upper chest gap, avoid heavy shoulder press due to right AC joint sensitivity"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-lime-500 outline-none transition"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-black text-xs py-3.5 rounded-2xl shadow-xl shadow-lime-950/40 flex items-center justify-center space-x-2 transition active:scale-98 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Architecting Workout Program for {weightKg}kg Body Metric...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Generate Biomechanically Tailored AI Regime</span>
            </>
          )}
        </button>

        {errorMsg && (
          <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-bold">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Generated Result Display Bento Card */}
      {generatedRegime && (
        <div className="bento-card border-lime-500/40 space-y-5 shadow-2xl animate-fade-in">
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-black text-lime-400 bg-lime-500/10 border border-lime-500/30 px-2.5 py-0.5 rounded-full tracking-wider">
                AI Biomechanical Blueprint
              </span>
              <h3 className="text-lg font-black text-slate-100 mt-2">{generatedRegime.routineName}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{generatedRegime.description}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-lime-400">{generatedRegime.daysPerWeek} Days / Wk</span>
              <div className="text-[10px] text-slate-500">{generatedRegime.difficulty}</div>
            </div>
          </div>

          {/* Coaching Tip */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wide">Coach Metric Insight</div>
              <div className="text-xs text-slate-400 mt-0.5">{generatedRegime.coachingTip}</div>
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Exercise Breakdown</span>
            {generatedRegime.exercises.map((ex: any, idx: number) => (
              <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-100">{ex.exerciseName}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {ex.category} • {ex.equipmentRequired}
                  </div>
                  {ex.instructions && (
                    <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">{ex.instructions}</div>
                  )}
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="text-xs font-black text-lime-400">{ex.targetSets} × {ex.targetReps}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{ex.targetWeightKg} kg</div>
                  <div className="text-[9px] text-slate-500 font-mono">{ex.restSeconds}s rest</div>
                </div>
              </div>
            ))}
          </div>

          {/* Save / Start Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleSave}
              className="bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs py-2.5 rounded-xl border border-slate-800 transition"
            >
              Save Routine
            </button>
            <button
              onClick={handleStartNow}
              className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-lg transition active:scale-95"
            >
              Start Workout Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

