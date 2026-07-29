import React, { useState } from 'react';
import { 
  X, User, Target, Scale, Ruler, HeartPulse, Bell, 
  Volume2, ShieldCheck, Check, RotateCcw, Building2, Sparkles,
  MapPin, Smartphone, AlertTriangle, RefreshCw, Trash2
} from 'lucide-react';
import { UserProfile, GymFacility } from '../types';
import { cmToFeetInches, feetInchesToCm, convertWeight, weightToKg } from '../utils/unitUtils';

interface UserSettingsModalProps {
  userProfile: UserProfile;
  gyms: GymFacility[];
  onSaveProfile: (updatedProfile: UserProfile) => void;
  onResetAllData?: (mode?: 'fresh_subscriber' | 'clean_zero') => void;
  onClose: () => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  userProfile,
  gyms,
  onSaveProfile,
  onResetAllData,
  onClose
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>(userProfile.weightUnit || 'lbs');
  const [heightUnit, setHeightUnit] = useState<'ft-in' | 'cm'>(userProfile.heightUnit || 'ft-in');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Height feet & inches calculation
  const initialFeetInches = cmToFeetInches(formData.heightCm || 178);
  const [feetInput, setFeetInput] = useState<number>(initialFeetInches.feet);
  const [inchesInput, setInchesInput] = useState<number>(initialFeetInches.inches);

  // Weight conversion
  const displayWeight = weightUnit === 'lbs'
    ? Math.round((formData.weightKg || 78) * 2.20462)
    : Math.round(formData.weightKg || 78);

  const handleWeightChange = (val: number) => {
    const weightInKg = weightUnit === 'lbs' ? Math.round(val / 2.20462) : val;
    setFormData((prev) => ({ ...prev, weightKg: Math.max(1, weightInKg), weightUnit }));
  };

  const handleFeetInchesChange = (feet: number, inches: number) => {
    setFeetInput(feet);
    setInchesInput(inches);
    const cm = feetInchesToCm(feet, inches);
    setFormData((prev) => ({ ...prev, heightCm: cm, heightUnit }));
  };

  const handleFocusAreaToggle = (area: string) => {
    const current = formData.focusAreas || [];
    const updated = current.includes(area)
      ? current.filter((a) => a !== area)
      : [...current, area];
    setFormData((prev) => ({ ...prev, focusAreas: updated }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...formData,
      weightUnit,
      heightUnit,
      distanceUnit: formData.distanceUnit || 'mi'
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const FOCUS_AREAS_OPTIONS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];
  const GOAL_OPTIONS = [
    'Build Strength & Hypertrophy',
    'Fat Loss & Conditioning',
    'Athletic Endurance',
    'General Fitness & Longevity',
    'Powerlifting Focus'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-2xl text-slate-100 my-8 space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-lime-500/10 text-lime-400 rounded-2xl border border-lime-500/30">
              <User className="w-6 h-6 text-lime-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100">Profile & Trial Settings</h2>
              <p className="text-xs text-slate-400">Configure units (US / Metric), zipcode, and app trial state</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-950 hover:bg-slate-800 rounded-2xl border border-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Basic Profile Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-lime-400 font-mono flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Personal Profile & Home Zip Code</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-lime-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Home Zip Code</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.zipcode || '90210'}
                    onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-lime-500 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-100 font-mono outline-none transition"
                    placeholder="90210"
                  />
                  <MapPin className="w-3.5 h-3.5 text-lime-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Primary Goal</label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-lime-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition"
                >
                  {GOAL_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Metrics Grid with US & Metric Unit Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {/* Weight Unit & Value */}
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">Body Weight</span>
                  <div className="flex bg-slate-900 rounded p-0.5 text-[9px] font-mono font-bold">
                    <button
                      type="button"
                      onClick={() => setWeightUnit('lbs')}
                      className={`px-1.5 py-0.5 rounded transition ${weightUnit === 'lbs' ? 'bg-lime-500 text-slate-950 font-black' : 'text-slate-400'}`}
                    >
                      lbs
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeightUnit('kg')}
                      className={`px-1.5 py-0.5 rounded transition ${weightUnit === 'kg' ? 'bg-lime-500 text-slate-950 font-black' : 'text-slate-400'}`}
                    >
                      kg
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  value={displayWeight}
                  onChange={(e) => handleWeightChange(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-100 outline-none"
                  min={20}
                  max={500}
                />
              </div>

              {/* Height Unit & Input */}
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">Height</span>
                  <div className="flex bg-slate-900 rounded p-0.5 text-[9px] font-mono font-bold">
                    <button
                      type="button"
                      onClick={() => setHeightUnit('ft-in')}
                      className={`px-1.5 py-0.5 rounded transition ${heightUnit === 'ft-in' ? 'bg-lime-500 text-slate-950 font-black' : 'text-slate-400'}`}
                    >
                      ft/in
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeightUnit('cm')}
                      className={`px-1.5 py-0.5 rounded transition ${heightUnit === 'cm' ? 'bg-lime-500 text-slate-950 font-black' : 'text-slate-400'}`}
                    >
                      cm
                    </button>
                  </div>
                </div>

                {heightUnit === 'ft-in' ? (
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-0.5 text-xs">
                      <input
                        type="number"
                        value={feetInput}
                        onChange={(e) => handleFeetInchesChange(Number(e.target.value), inchesInput)}
                        className="w-full bg-transparent text-center font-mono font-bold text-slate-100 outline-none"
                        min={3}
                        max={8}
                      />
                      <span className="text-[9px] text-slate-500 font-mono">ft</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-0.5 text-xs">
                      <input
                        type="number"
                        value={inchesInput}
                        onChange={(e) => handleFeetInchesChange(feetInput, Number(e.target.value))}
                        className="w-full bg-transparent text-center font-mono font-bold text-slate-100 outline-none"
                        min={0}
                        max={11}
                      />
                      <span className="text-[9px] text-slate-500 font-mono">in</span>
                    </div>
                  </div>
                ) : (
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-100 outline-none"
                    min={100}
                    max={250}
                  />
                )}
              </div>

              {/* Distance Unit */}
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">Distance Unit</span>
                <div className="flex bg-slate-900 rounded p-1 text-[10px] font-mono font-bold justify-between">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, distanceUnit: 'mi' })}
                    className={`flex-1 py-0.5 rounded text-center transition ${
                      (formData.distanceUnit || 'mi') === 'mi' ? 'bg-lime-500 text-slate-950 font-black' : 'text-slate-400'
                    }`}
                  >
                    Miles
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, distanceUnit: 'km' })}
                    className={`flex-1 py-0.5 rounded text-center transition ${
                      formData.distanceUnit === 'km' ? 'bg-lime-500 text-slate-950 font-black' : 'text-slate-400'
                    }`}
                  >
                    KM
                  </button>
                </div>
              </div>

              {/* Age */}
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">Age</span>
                <input
                  type="number"
                  value={formData.age || 28}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-100 outline-none"
                  min={12}
                  max={100}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Target Focus Muscle Groups */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-lime-400 font-mono flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5" />
              <span>Target Muscle Priorities</span>
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {FOCUS_AREAS_OPTIONS.map((area) => {
                const isSelected = (formData.focusAreas || []).includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => handleFocusAreaToggle(area)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-lime-500/20 text-lime-400 border-lime-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{area}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: App Audio / Haptics */}
          <div className="space-y-3 pt-1 border-t border-slate-800/80">
            <h3 className="text-xs font-black uppercase tracking-wider text-lime-400 font-mono flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>App Preferences</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer text-xs">
                <span className="flex items-center space-x-2 text-slate-200">
                  <Volume2 className="w-4 h-4 text-lime-400" />
                  <span>Rest Timer Sound</span>
                </span>
                <input
                  type="checkbox"
                  checked={formData.restTimerSound}
                  onChange={(e) => setFormData({ ...formData, restTimerSound: e.target.checked })}
                  className="accent-lime-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer text-xs">
                <span className="flex items-center space-x-2 text-slate-200">
                  <HeartPulse className="w-4 h-4 text-rose-400" />
                  <span>Completion Haptics</span>
                </span>
                <input
                  type="checkbox"
                  checked={formData.hapticFeedback}
                  onChange={(e) => setFormData({ ...formData, hapticFeedback: e.target.checked })}
                  className="accent-lime-500 w-4 h-4 rounded"
                />
              </label>
            </div>
          </div>

          {/* Section 4: Trial Reset Zone */}
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 text-rose-400 font-black text-xs uppercase tracking-wider">
                <RotateCcw className="w-4 h-4" />
                <span>Trial Mode & App Data Reset</span>
              </div>
              <span className="text-[9px] bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded font-mono border border-rose-500/30 font-bold">
                Home Screen Trial
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Experience PulseFit as a brand-new monthly subscriber. Wipe all workout logs, personal records, XP streaks, and custom meals back to zero.
            </p>

            {showResetConfirm ? (
              <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/50 space-y-2 animate-fade-in">
                <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Confirm: Clear all stats & start fresh?</span>
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onResetAllData) onResetAllData('clean_zero');
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-lg transition"
                  >
                    Reset Everything to 0
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 bg-slate-900 text-slate-300 hover:text-white text-xs font-bold rounded-lg border border-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2 bg-slate-950 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-rose-500/30 hover:border-rose-500/60 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset All Stats & Start Fresh Trial</span>
              </button>
            )}
          </div>

          {/* Save Action Bar */}
          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-lime-500 hover:bg-lime-400 text-slate-950 shadow-lg shadow-lime-950/50 flex items-center space-x-1.5 transition active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Settings Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Profile Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

