import React, { useState } from 'react';
import { Trophy, Flame, Zap, Award, Sparkles, CheckCircle2, Lock, Users, Shield, ArrowUpRight } from 'lucide-react';
import { Achievement, LeaderboardEntry, UserProfile } from '../types';

interface GamificationViewProps {
  userProfile: UserProfile;
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  onClaimAchievementXp: (achievementId: string, xpValue: number) => void;
}

export const GamificationView: React.FC<GamificationViewProps> = ({
  userProfile,
  achievements,
  leaderboard,
  onClaimAchievementXp
}) => {
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'volume' | 'exertion' | 'streak'>('volume');

  // Sorted leaderboard based on tab
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (activeLeaderboardTab === 'volume') return b.weeklyVolumeKg - a.weeklyVolumeKg;
    if (activeLeaderboardTab === 'exertion') return b.exertionPoints - a.exertionPoints;
    return b.streakDays - a.streakDays;
  });

  const levelProgress = Math.min(100, Math.round((userProfile.currentXp / userProfile.xpToNextLevel) * 100));

  return (
    <div className="space-y-5 pb-28">
      {/* Level Banner Bento Card */}
      <div className="bento-card bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 space-y-4 border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-lime-500 to-emerald-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-lime-950/40">
              L{userProfile.level}
            </div>
            <div>
              <span className="text-[10px] font-bold text-lime-400 uppercase tracking-widest">Pulse Rank</span>
              <div className="text-base font-extrabold text-slate-100">{userProfile.name}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center space-x-1 text-lime-400 font-black text-lg justify-end">
              <Flame className="w-5 h-5 text-lime-400 fill-lime-400" />
              <span>{userProfile.streakDays} Days</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current Streak</div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>XP Level Progress</span>
            <span className="font-mono text-lime-400">{userProfile.currentXp} / {userProfile.xpToNextLevel} XP</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-lime-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Leaderboard Section Bento Card */}
      <div className="bento-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold text-slate-100 tracking-tight">Gym & Global Leaderboard</h3>
          </div>

          {/* Leaderboard Filter Tabs */}
          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-[10px] font-bold">
            {(['volume', 'exertion', 'streak'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveLeaderboardTab(tab)}
                className={`px-2.5 py-1 rounded-lg uppercase transition ${
                  activeLeaderboardTab === tab
                    ? 'bg-lime-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Entries List */}
        <div className="space-y-2">
          {sortedLeaderboard.map((entry, index) => {
            const isUser = entry.isCurrentUser;
            return (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                  isUser
                    ? 'bg-lime-500/10 border-lime-500/40 text-slate-100 shadow-md'
                    : 'bg-slate-950 border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-6 text-center font-black text-xs ${
                    index === 0 ? 'text-amber-400 text-sm' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    #{index + 1}
                  </span>

                  <img
                    src={entry.avatarUrl}
                    alt={entry.userName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-800"
                  />

                  <div>
                    <div className="font-bold text-xs flex items-center space-x-1.5">
                      <span>{entry.userName}</span>
                      {isUser && (
                        <span className="text-[9px] bg-lime-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">YOU</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{entry.badgeTitle}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-black text-xs text-lime-400">
                    {activeLeaderboardTab === 'volume' && `${(entry.weeklyVolumeKg / 1000).toFixed(1)}k kg`}
                    {activeLeaderboardTab === 'exertion' && `${entry.exertionPoints} pts`}
                    {activeLeaderboardTab === 'streak' && `${entry.streakDays} days`}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{entry.xp} Total XP</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-lime-500">Badges & Unlocks</span>
          <span className="text-xs text-slate-400 font-mono">
            {achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((ach) => {
            const isUnlocked = ach.unlocked;
            const progressPercent = Math.min(100, Math.round((ach.currentProgress / ach.maxProgress) * 100));

            return (
              <div
                key={ach.id}
                className={`bento-card space-y-2 transition ${
                  isUnlocked
                    ? 'border-lime-500/30'
                    : 'opacity-70 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2.5 rounded-xl ${
                      isUnlocked ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-950 text-slate-600'
                    }`}>
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-100">{ach.title}</h4>
                      <span className="text-[10px] text-amber-400 font-mono font-bold">+{ach.xpValue} XP</span>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <span className="text-[10px] bg-lime-500/10 text-lime-400 border border-lime-500/30 px-2 py-0.5 rounded-full font-bold">
                      Unlocked
                    </span>
                  ) : (
                    <Lock className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-normal">{ach.description}</p>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Progress</span>
                    <span>{ach.currentProgress} / {ach.maxProgress}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isUnlocked ? 'bg-amber-400' : 'bg-lime-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
