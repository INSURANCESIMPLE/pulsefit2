export type HeartRateZone = 'Rest' | 'Warm-up' | 'Fat Burn' | 'Cardio' | 'Peak' | 'Extreme';

export interface ZoneDetails {
  name: HeartRateZone;
  minBpm: number;
  maxBpm: number;
  colorClass: string;
  badgeBg: string;
  textColor: string;
  description: string;
}

export function getHeartRateZone(bpm: number): ZoneDetails {
  if (bpm < 110) {
    return {
      name: 'Rest',
      minBpm: 0,
      maxBpm: 109,
      colorClass: 'from-slate-600 to-slate-700',
      badgeBg: 'bg-slate-800 border-slate-700',
      textColor: 'text-slate-300',
      description: 'Resting / Recovery'
    };
  } else if (bpm < 130) {
    return {
      name: 'Warm-up',
      minBpm: 110,
      maxBpm: 129,
      colorClass: 'from-sky-500 to-blue-600',
      badgeBg: 'bg-sky-500/20 border-sky-500/40',
      textColor: 'text-sky-300',
      description: 'Active Warm-Up & Mobility'
    };
  } else if (bpm < 150) {
    return {
      name: 'Fat Burn',
      minBpm: 130,
      maxBpm: 149,
      colorClass: 'from-emerald-500 to-green-600',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/40',
      textColor: 'text-emerald-300',
      description: 'Aerobic Fat Oxidation Zone'
    };
  } else if (bpm < 170) {
    return {
      name: 'Cardio',
      minBpm: 150,
      maxBpm: 169,
      colorClass: 'from-amber-500 to-orange-500',
      badgeBg: 'bg-amber-500/20 border-amber-500/40',
      textColor: 'text-amber-300',
      description: 'Cardiovascular Endurance'
    };
  } else if (bpm < 185) {
    return {
      name: 'Peak',
      minBpm: 170,
      maxBpm: 184,
      colorClass: 'from-orange-600 to-rose-600',
      badgeBg: 'bg-orange-500/20 border-orange-500/40',
      textColor: 'text-orange-300',
      description: 'High Intensity Anaerobic'
    };
  } else {
    return {
      name: 'Extreme',
      minBpm: 185,
      maxBpm: 220,
      colorClass: 'from-rose-600 to-red-700',
      badgeBg: 'bg-rose-500/20 border-rose-500/40',
      textColor: 'text-rose-300',
      description: 'Max VO2 Exertion Limit'
    };
  }
}

// Web Audio API Beep Generator for Rest Timer & Set Completion
export function playBeepSound(type: 'rest_complete' | 'set_logged' | 'workout_complete') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (type === 'set_logged') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'rest_complete') {
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.2);
      });
    } else if (type === 'workout_complete') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.3);
      });
    }
  } catch (e) {
    // Ignore audio context errors if muted/blocked
  }
}
