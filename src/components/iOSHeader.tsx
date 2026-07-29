import React, { useState } from 'react';
import { 
  Flame, HeartPulse, Sparkles, Building2, Zap, Menu, X, 
  Dumbbell, BarChart3, Utensils, Users, Trophy, Download, ChevronRight, CalendarCheck, Settings 
} from 'lucide-react';
import { UserProfile, GymFacility } from '../types';
import { TabType } from './iOSTabBar';

interface iOSHeaderProps {
  userProfile: UserProfile;
  currentGym?: GymFacility;
  isHrConnected: boolean;
  currentHrBpm: number;
  onToggleHrConnection: () => void;
  onSelectGymClick: () => void;
  onOpenAiRegime: () => void;
  activeTab?: TabType;
  onSelectTab?: (tab: TabType) => void;
  onOpenWeeklySummary?: () => void;
  onOpenSettings?: () => void;
}

export const IOSHeader: React.FC<iOSHeaderProps> = ({
  userProfile,
  currentGym,
  isHrConnected,
  currentHrBpm,
  onToggleHrConnection,
  onSelectGymClick,
  onOpenAiRegime,
  activeTab,
  onSelectTab,
  onOpenWeeklySummary,
  onOpenSettings
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const levelProgress = Math.min(100, Math.round((userProfile.currentXp / userProfile.xpToNextLevel) * 100));

  const navItems: { id: TabType; label: string; description: string; icon: any }[] = [
    { id: 'workouts', label: 'Workout Routines', description: 'Schedule & start exercises', icon: Dumbbell },
    { id: 'gym_sync', label: 'Gym Sync & Live Hub', description: 'Real-time equipment availability', icon: Building2 },
    { id: 'progress', label: 'Analytics & Insights', description: 'Volume, 1RM, & cardio trends', icon: BarChart3 },
    { id: 'nutrition', label: 'Nutrition & Macros', description: 'Calorie burn & meal logging', icon: Utensils },
    { id: 'social', label: 'Community Feed', description: 'Activity & gym leaderboard', icon: Users },
    { id: 'gamify', label: 'Rewards & Ranks', description: 'Achievements & XP progression', icon: Trophy },
    { id: 'ai_regime', label: 'AI Regime Generator', description: 'Tailored workout plans', icon: Sparkles },
    { id: 'export', label: 'Export Data', description: 'Download PDF report & logs', icon: Download }
  ];

  const handleNavClick = (tabId: TabType) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    } else if (tabId === 'ai_regime') {
      onOpenAiRegime();
    } else if (tabId === 'gym_sync') {
      onSelectGymClick();
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 text-slate-100">
      {/* Main Header Bar */}
      <div className="flex items-center justify-between">
        {/* User Level & XP */}
        <div 
          onClick={onOpenSettings}
          className="flex items-center space-x-3 cursor-pointer group rounded-2xl p-1 hover:bg-slate-900/60 transition"
          title="Open User Profile & Settings"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lime-500 to-emerald-600 p-0.5 shadow-md shadow-lime-950/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center font-black text-xs text-lime-400">
                L{userProfile.level}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-lime-500 text-slate-950 text-[9px] font-black px-1 rounded-full flex items-center shadow">
              <Zap className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-sm tracking-tight text-slate-100 group-hover:text-lime-400 transition">{userProfile.name}</h1>
              <div className="flex items-center space-x-1 bg-lime-500/10 text-lime-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-lime-500/20 uppercase tracking-wider">
                <Flame className="w-3 h-3 text-lime-400 fill-lime-400" />
                <span>{userProfile.streakDays}D Streak</span>
              </div>
            </div>
            {/* XP progress bar */}
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-24 sm:w-28 bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-lime-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${levelProgress}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{userProfile.currentXp}/{userProfile.xpToNextLevel} XP</span>
            </div>
          </div>
        </div>

        {/* Action Controls: HR Sync and Hamburger Navigation Menu */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={onToggleHrConnection}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isHrConnected 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-sm' 
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
            title="Toggle Bluetooth Heart Rate Monitor Sync"
          >
            <HeartPulse className={`w-3.5 h-3.5 ${isHrConnected ? 'text-rose-500 animate-pulse' : ''}`} />
            <span className="hidden sm:inline">{isHrConnected ? `${currentHrBpm} BPM` : 'HR Sync'}</span>
          </button>

          {/* Quick Navigation Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-xl border transition-all ${
              isMenuOpen
                ? 'bg-lime-500 text-slate-950 border-lime-400 shadow-md shadow-lime-950/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
            }`}
            title="Open Quick Navigation Menu"
            aria-label="Navigation Menu"
          >
            {isMenuOpen ? <X className="w-4 h-4 stroke-[2.5]" /> : <Menu className="w-4 h-4 stroke-[2.5]" />}
          </button>
        </div>
      </div>

      {/* Hamburger Navigation Drawer Dropdown */}
      {isMenuOpen && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 animate-fade-in space-y-2">
          {onOpenSettings && (
            <button
              onClick={() => {
                onOpenSettings();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-200 transition"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-slate-950 text-lime-400 rounded-lg font-black border border-slate-800">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-100">User Profile & Settings</div>
                  <div className="text-[10px] text-slate-400">Goals, body metrics, audio & haptics</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          )}

          {onOpenWeeklySummary && (
            <button
              onClick={() => {
                onOpenWeeklySummary();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 bg-gradient-to-r from-lime-500/20 via-emerald-500/10 to-slate-900 border border-lime-500/40 rounded-xl text-lime-400 hover:border-lime-400 transition"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-lime-500 text-slate-950 rounded-lg font-black">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-100">Sunday Weekly Digest</div>
                  <div className="text-[10px] text-slate-400">Total volume, calories & peak HR</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-lime-400" />
            </button>
          )}

          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-lime-400 font-mono">
              Quick Navigation Menu
            </span>
            <span className="text-[10px] text-slate-500">Tap to jump to section</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                    isActive
                      ? 'bg-lime-500/15 border-lime-500/50 text-lime-400 font-bold'
                      : 'bg-slate-900/90 border-slate-800/80 hover:bg-slate-800 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-1.5 rounded-lg border ${
                      isActive 
                        ? 'bg-lime-500 text-slate-950 border-lime-400' 
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black leading-tight">{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{item.description}</div>
                    </div>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-lime-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
