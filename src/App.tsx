/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { IOSHeader } from './components/iOSHeader';
import { IOSTabBar, TabType } from './components/iOSTabBar';
import { RoutinesView } from './components/RoutinesView';
import { GymSyncView } from './components/GymSyncView';
import { ProgressView } from './components/ProgressView';
import { GamificationView } from './components/GamificationView';
import { AiRegimeGenerator } from './components/AiRegimeGenerator';
import { ExportDataModal } from './components/ExportDataModal';
import { ActiveWorkoutModal } from './components/ActiveWorkoutModal';
import { AiSwapModal } from './components/AiSwapModal';
import { NutritionView } from './components/NutritionView';
import { SocialFeedView } from './components/SocialFeedView';
import { WeeklySummaryNotification } from './components/WeeklySummaryNotification';
import { UserSettingsModal } from './components/UserSettingsModal';
import { BluetoothHrModal } from './components/BluetoothHrModal';

import {
  INITIAL_USER_PROFILE,
  CLEAN_START_USER_PROFILE,
  INITIAL_GYM_FACILITIES,
  INITIAL_ROUTINES,
  INITIAL_HISTORICAL_SESSIONS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_LEADERBOARD
} from './data/mockData';

import { Routine, WorkoutSession, GymFacility, Achievement, UserProfile, EquipmentCategory } from './types';

export default function App() {
  // Application Persistent States
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('pulsefit_user_profile');
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  const [gyms, setGyms] = useState<GymFacility[]>(() => {
    const saved = localStorage.getItem('pulsefit_gyms');
    return saved ? JSON.parse(saved) : INITIAL_GYM_FACILITIES;
  });

  const [activeGymId, setActiveGymId] = useState<string>(() => {
    return userProfile.activeGymId || 'gym-equinox-downtown';
  });

  const [routines, setRoutines] = useState<Routine[]>(() => {
    const saved = localStorage.getItem('pulsefit_routines');
    return saved ? JSON.parse(saved) : INITIAL_ROUTINES;
  });

  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>(() => {
    const saved = localStorage.getItem('pulsefit_sessions');
    return saved ? JSON.parse(saved) : INITIAL_HISTORICAL_SESSIONS;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('pulsefit_achievements');
    return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });

  const [leaderboard, setLeaderboard] = useState(() => {
    const saved = localStorage.getItem('pulsefit_leaderboard');
    return saved ? JSON.parse(saved) : INITIAL_LEADERBOARD;
  });

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>('workouts');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [activeWorkoutRoutine, setActiveWorkoutRoutine] = useState<Routine | undefined>(undefined);
  const [showWeeklySummary, setShowWeeklySummary] = useState(true);
  const [showUserSettings, setShowUserSettings] = useState(false);

  // Heart Rate Monitor Connection State
  const [isHrConnected, setIsHrConnected] = useState(true);
  const [currentHrBpm, setCurrentHrBpm] = useState(132);
  const [connectedHrDevice, setConnectedHrDevice] = useState('Polar H10 (A894)');
  const [showBluetoothHrModal, setShowBluetoothHrModal] = useState(false);

  // AI Exercise Swap Modal State
  const [aiSwapTarget, setAiSwapTarget] = useState<{ exerciseName: string; category: string } | null>(null);

  // Local Storage Synchronizers
  useEffect(() => {
    localStorage.setItem('pulsefit_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('pulsefit_gyms', JSON.stringify(gyms));
  }, [gyms]);

  useEffect(() => {
    localStorage.setItem('pulsefit_routines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem('pulsefit_sessions', JSON.stringify(workoutSessions));
  }, [workoutSessions]);

  useEffect(() => {
    localStorage.setItem('pulsefit_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('pulsefit_leaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  const activeGym = gyms.find((g) => g.id === activeGymId) || gyms[0];

  // Helper: Get available equipment tags from active gym
  const availableEquipment: EquipmentCategory[] = activeGym
    ? activeGym.equipment.map((eq) => eq.category)
    : ['Barbell', 'Dumbbell', 'Machine', 'Cable'];

  // Reset App Stats & Wipe Data for First-Time Trial
  const handleResetAllData = (mode: 'fresh_subscriber' | 'clean_zero' = 'clean_zero') => {
    localStorage.removeItem('pulsefit_user_profile');
    localStorage.removeItem('pulsefit_gyms');
    localStorage.removeItem('pulsefit_routines');
    localStorage.removeItem('pulsefit_sessions');
    localStorage.removeItem('pulsefit_achievements');
    localStorage.removeItem('pulsefit_leaderboard');
    localStorage.removeItem('pulsefit_logged_meals');
    localStorage.removeItem('pulsefit_created_recipes');

    if (mode === 'clean_zero') {
      setUserProfile(CLEAN_START_USER_PROFILE);
      setWorkoutSessions([]);
      setRoutines(INITIAL_ROUTINES);
      setGyms(INITIAL_GYM_FACILITIES);
      setAchievements(INITIAL_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false, currentProgress: 0 })));
    } else {
      setUserProfile(INITIAL_USER_PROFILE);
      setWorkoutSessions(INITIAL_HISTORICAL_SESSIONS);
      setRoutines(INITIAL_ROUTINES);
      setGyms(INITIAL_GYM_FACILITIES);
      setAchievements(INITIAL_ACHIEVEMENTS);
      setLeaderboard(INITIAL_LEADERBOARD);
    }

    setActiveTab('workouts');
    setShowWeeklySummary(false);
  };

  // Start workout routine
  const handleStartRoutine = (routine?: Routine) => {
    setActiveWorkoutRoutine(routine);
    setIsWorkoutActive(true);
  };

  // Save new routine (from AI or custom)
  const handleSaveRoutine = (routine: Routine) => {
    setRoutines((prev) => [routine, ...prev]);
    setActiveTab('workouts');
  };

  // Finish workout session callback
  const handleFinishWorkoutSession = (session: WorkoutSession) => {
    setWorkoutSessions((prev) => [session, ...prev]);

    // Update user profile XP and Level
    setUserProfile((prev) => {
      const newXp = prev.currentXp + session.xpEarned;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNextLevel;

      if (newXp >= newXpToNext) {
        newLevel += 1;
        newXpToNext += 1000;
      }

      return {
        ...prev,
        level: newLevel,
        currentXp: newXp,
        xpToNextLevel: newXpToNext
      };
    });

    // Update leaderboard current user entry
    setLeaderboard((prev) =>
      prev.map((entry) => {
        if (entry.isCurrentUser) {
          return {
            ...entry,
            xp: entry.xp + session.xpEarned,
            weeklyVolumeKg: entry.weeklyVolumeKg + session.totalVolumeKg,
            exertionPoints: Math.max(entry.exertionPoints, session.exertionScore)
          };
        }
        return entry;
      })
    );

    setIsWorkoutActive(false);
    setActiveWorkoutRoutine(undefined);
    setActiveTab('progress');
  };

  // Crowdsourced equipment status reporter
  const handleReportEquipmentStatus = (gymId: string, equipmentId: string, newStatus: 'Available' | 'In Use' | 'High Demand') => {
    setGyms((prev) =>
      prev.map((gym) => {
        if (gym.id === gymId) {
          return {
            ...gym,
            equipment: gym.equipment.map((eq) =>
              eq.id === equipmentId ? { ...eq, busyStatus: newStatus, waitTimeMins: newStatus === 'Available' ? 0 : 5 } : eq
            )
          };
        }
        return gym;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* iOS App Top Header */}
      <IOSHeader
        userProfile={userProfile}
        currentGym={activeGym}
        isHrConnected={isHrConnected}
        currentHrBpm={currentHrBpm}
        onToggleHrConnection={() => setShowBluetoothHrModal(true)}
        onSelectGymClick={() => setActiveTab('gym_sync')}
        onOpenAiRegime={() => setActiveTab('ai_regime')}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenWeeklySummary={() => setShowWeeklySummary(true)}
        onOpenSettings={() => setShowUserSettings(true)}
      />

      {/* Main View Container */}
      <main className="max-w-2xl mx-auto px-4 pt-4">
        {activeTab === 'workouts' && (
          <RoutinesView
            routines={routines}
            onStartRoutine={handleStartRoutine}
            onOpenAiRegime={() => setActiveTab('ai_regime')}
            onCreateCustomRoutine={handleSaveRoutine}
            onDeleteRoutine={(id) => setRoutines((prev) => prev.filter((r) => r.id !== id))}
          />
        )}

        {activeTab === 'gym_sync' && (
          <GymSyncView
            gyms={gyms}
            activeGymId={activeGymId}
            userProfile={userProfile}
            onSelectGym={(id) => {
              setActiveGymId(id);
              setUserProfile((p) => ({ ...p, activeGymId: id }));
            }}
            onAddGym={(newGym) => setGyms((prev) => [newGym, ...prev])}
            onReqAiSwap={(exerciseName, category) => setAiSwapTarget({ exerciseName, category })}
            onReportEquipmentStatus={handleReportEquipmentStatus}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressView workoutSessions={workoutSessions} />
        )}

        {activeTab === 'nutrition' && (
          <NutritionView userProfile={userProfile} />
        )}

        {activeTab === 'social' && (
          <SocialFeedView userProfile={userProfile} />
        )}

        {activeTab === 'gamify' && (
          <GamificationView
            userProfile={userProfile}
            achievements={achievements}
            leaderboard={leaderboard}
            onClaimAchievementXp={(id, xp) => {
              setUserProfile((p) => ({ ...p, currentXp: p.currentXp + xp }));
            }}
          />
        )}

        {activeTab === 'ai_regime' && (
          <AiRegimeGenerator
            userProfile={userProfile}
            onUpdateUserProfile={(updated) => setUserProfile((p) => ({ ...p, ...updated }))}
            availableGymEquipment={availableEquipment}
            gymName={activeGym.name}
            onSaveRoutine={handleSaveRoutine}
            onStartRoutineNow={(rt) => {
              handleSaveRoutine(rt);
              handleStartRoutine(rt);
            }}
          />
        )}

        {activeTab === 'export' && (
          <ExportDataModal
            userProfile={userProfile}
            workoutSessions={workoutSessions}
            routines={routines}
          />
        )}
      </main>

      {/* Floating iOS Bottom Tab Bar */}
      <IOSTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickStartWorkout={() => handleStartRoutine(undefined)}
        isWorkoutActive={isWorkoutActive}
      />

      {/* Full screen Active Workout Tracker Modal */}
      {isWorkoutActive && (
        <ActiveWorkoutModal
          routine={activeWorkoutRoutine}
          gymName={activeGym.name}
          availableEquipment={availableEquipment}
          onClose={() => setIsWorkoutActive(false)}
          onFinishWorkout={handleFinishWorkoutSession}
          onReqAiSwap={(exerciseName, category) => setAiSwapTarget({ exerciseName, category })}
          onOpenBluetoothModal={() => setShowBluetoothHrModal(true)}
        />
      )}

      {/* Machine Busy AI Exercise Swap Modal */}
      {aiSwapTarget && (
        <AiSwapModal
          busyExerciseName={aiSwapTarget.exerciseName}
          category={aiSwapTarget.category}
          availableEquipment={availableEquipment}
          onClose={() => setAiSwapTarget(null)}
          onSelectSubstitute={(subName) => {
            alert(`Swapped in ${subName}!`);
            setAiSwapTarget(null);
          }}
        />
      )}

      {/* Weekly Summary Sunday Notification / Toast Overlay */}
      {showWeeklySummary && (
        <WeeklySummaryNotification
          workoutSessions={workoutSessions}
          onClose={() => setShowWeeklySummary(false)}
        />
      )}

      {/* User Settings & Profile Customization Modal */}
      {showUserSettings && (
        <UserSettingsModal
          userProfile={userProfile}
          gyms={gyms}
          onSaveProfile={(updated) => {
            setUserProfile(updated);
            if (updated.activeGymId !== activeGymId) {
              setActiveGymId(updated.activeGymId);
            }
          }}
          onResetAllData={handleResetAllData}
          onClose={() => setShowUserSettings(false)}
        />
      )}

      {/* Bluetooth Heart Rate Monitor Pairing Modal */}
      {showBluetoothHrModal && (
        <BluetoothHrModal
          isHrConnected={isHrConnected}
          currentHrBpm={currentHrBpm}
          deviceName={connectedHrDevice}
          onConnectDevice={(devName, bpm) => {
            setIsHrConnected(true);
            setConnectedHrDevice(devName);
            setCurrentHrBpm(bpm);
          }}
          onDisconnectDevice={() => {
            setIsHrConnected(false);
          }}
          onUpdateBpm={(bpm) => {
            setCurrentHrBpm(bpm);
          }}
          onClose={() => setShowBluetoothHrModal(false)}
        />
      )}
    </div>
  );
}
