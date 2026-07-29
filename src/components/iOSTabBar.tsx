import React from 'react';
import { Dumbbell, Building2, BarChart3, Trophy, Sparkles, Download, Play, Utensils, Users } from 'lucide-react';

export type TabType = 'workouts' | 'gym_sync' | 'progress' | 'nutrition' | 'social' | 'gamify' | 'ai_regime' | 'export';

interface iOSTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onQuickStartWorkout: () => void;
  isWorkoutActive: boolean;
}

export const IOSTabBar: React.FC<iOSTabBarProps> = ({
  activeTab,
  onTabChange,
  onQuickStartWorkout,
  isWorkoutActive
}) => {
  const tabs = [
    { id: 'workouts' as TabType, label: 'Routines', icon: Dumbbell },
    { id: 'gym_sync' as TabType, label: 'Gym Sync', icon: Building2 },
    { id: 'progress' as TabType, label: 'Insights', icon: BarChart3 },
    { id: 'nutrition' as TabType, label: 'Nutrition', icon: Utensils },
    { id: 'social' as TabType, label: 'Social', icon: Users },
    { id: 'gamify' as TabType, label: 'Rewards', icon: Trophy },
    { id: 'ai_regime' as TabType, label: 'AI Regime', icon: Sparkles },
    { id: 'export' as TabType, label: 'Export', icon: Download }
  ];



  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none">
      <div className="max-w-md mx-auto bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-1.5 flex items-center justify-around pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-lime-400 bg-lime-500/10 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-lime-400' : 'text-slate-400'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight font-semibold">{tab.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 bg-lime-400 rounded-full shadow-[0_0_8px_rgba(132,204,22,0.8)]"></span>
              )}
            </button>
          );
        })}

        {/* Quick Action floating start button if workout not active */}
        {!isWorkoutActive && (
          <button
            onClick={onQuickStartWorkout}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-black shadow-lg shadow-lime-950/60 active:scale-95 transition shrink-0 ml-1"
            title="Quick Start Live Workout Tracker"
          >
            <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span className="text-[9px] uppercase font-black tracking-wider">Start</span>
          </button>
        )}
      </div>
    </div>
  );
};
