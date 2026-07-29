import { Exercise, GymFacility, Routine, WorkoutSession, Achievement, LeaderboardEntry, UserProfile } from '../types';

export const INITIAL_EXERCISES: Exercise[] = [
  {
    id: 'ex-bench-press',
    name: 'Barbell Bench Press',
    category: 'Chest',
    equipmentRequired: 'Barbell',
    targetMuscle: 'Mid Pectorals',
    secondaryMuscles: ['Triceps', 'Anterior Deltoids'],
    instructions: 'Lie flat on the bench, grip the barbell slightly wider than shoulder width. Unrack and lower slowly to mid-chest, drive up explosively.',
    alternativeExerciseIds: ['ex-dumbbell-press', 'ex-chest-press-machine']
  },
  {
    id: 'ex-dumbbell-press',
    name: 'Incline Dumbbell Press',
    category: 'Chest',
    equipmentRequired: 'Dumbbell',
    targetMuscle: 'Upper Pectorals',
    secondaryMuscles: ['Triceps', 'Shoulders'],
    instructions: 'Set bench to 30-45 degree incline. Press dumbbells vertically, contracting chest at top without clacking weights.',
    alternativeExerciseIds: ['ex-chest-press-machine', 'ex-cable-fly']
  },
  {
    id: 'ex-chest-press-machine',
    name: 'Seated Chest Press Machine',
    category: 'Chest',
    equipmentRequired: 'Machine',
    targetMuscle: 'Pectorals',
    secondaryMuscles: ['Triceps'],
    instructions: 'Adjust seat height so handles align with mid-chest. Press forward until arms are almost locked.',
    alternativeExerciseIds: ['ex-bench-press', 'ex-dumbbell-press']
  },
  {
    id: 'ex-cable-fly',
    name: 'High-To-Low Cable Fly',
    category: 'Chest',
    equipmentRequired: 'Cable',
    targetMuscle: 'Lower & Inner Chest',
    secondaryMuscles: ['Anterior Deltoids'],
    instructions: 'Attach handles to high pulleys. Stand forward in split stance, bring hands down and together in sweeping arc.',
    alternativeExerciseIds: ['ex-dumbbell-press']
  },
  {
    id: 'ex-lat-pulldown',
    name: 'Lat Pulldown Machine',
    category: 'Back',
    equipmentRequired: 'Cable',
    targetMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Biceps', 'Rhomboids'],
    instructions: 'Grip bar wide, sit with knees secured under pad. Pull bar down toward upper chest, driving elbows down.',
    alternativeExerciseIds: ['ex-pullup', 'ex-seated-row']
  },
  {
    id: 'ex-pullup',
    name: 'Bodyweight Pull-Up',
    category: 'Back',
    equipmentRequired: 'Bodyweight',
    targetMuscle: 'Lats & Upper Back',
    secondaryMuscles: ['Biceps', 'Core'],
    instructions: 'Hang from pull-up bar with overhand grip. Pull chest up to bar, lowering with control.',
    alternativeExerciseIds: ['ex-lat-pulldown']
  },
  {
    id: 'ex-seated-row',
    name: 'Seated Cable Row',
    category: 'Back',
    equipmentRequired: 'Cable',
    targetMuscle: 'Mid-Back & Rhomboids',
    secondaryMuscles: ['Rear Deltoids', 'Biceps'],
    instructions: 'Sit with feet braced, grasp V-bar. Pull handle toward navel while squeezing shoulder blades together.',
    alternativeExerciseIds: ['ex-lat-pulldown', 'ex-dumbbell-row']
  },
  {
    id: 'ex-barbell-squat',
    name: 'Barbell Back Squat',
    category: 'Legs',
    equipmentRequired: 'Barbell',
    targetMuscle: 'Quadriceps & Glutes',
    secondaryMuscles: ['Hamstrings', 'Lower Back'],
    instructions: 'Rest bar across upper back. Lower hips back and down until thighs are parallel to ground, drive through heels to stand.',
    alternativeExerciseIds: ['ex-leg-press', 'ex-goblet-squat']
  },
  {
    id: 'ex-leg-press',
    name: '45° Leg Press Machine',
    category: 'Legs',
    equipmentRequired: 'Machine',
    targetMuscle: 'Quadriceps',
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    instructions: 'Place feet shoulder-width on footplate. Release safety hooks, lower weight smoothly, press back up without locking knees.',
    alternativeExerciseIds: ['ex-barbell-squat']
  },
  {
    id: 'ex-leg-extension',
    name: 'Leg Extension Machine',
    category: 'Legs',
    equipmentRequired: 'Machine',
    targetMuscle: 'Isolated Quadriceps',
    secondaryMuscles: [],
    instructions: 'Sit with back against pad, pad resting above ankles. Extend legs straight out, hold contraction for 1 sec.',
    alternativeExerciseIds: ['ex-leg-press']
  },
  {
    id: 'ex-overhead-press',
    name: 'Barbell Overhead Shoulder Press',
    category: 'Shoulders',
    equipmentRequired: 'Barbell',
    targetMuscle: 'Anterior & Lateral Deltoids',
    secondaryMuscles: ['Triceps', 'Upper Traps'],
    instructions: 'Stand tall with bar rested on front shoulders. Press bar overhead until arms are extended, head slightly forward.',
    alternativeExerciseIds: ['ex-dumbbell-shoulder-press']
  },
  {
    id: 'ex-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    category: 'Shoulders',
    equipmentRequired: 'Dumbbell',
    targetMuscle: 'Lateral Deltoids',
    secondaryMuscles: [],
    instructions: 'Hold dumbbells at sides with slight elbow bend. Raise arms out to sides until shoulder height.',
    alternativeExerciseIds: ['ex-cable-fly']
  },
  {
    id: 'ex-bicep-curl',
    name: 'Dumbbell Bicep Curl',
    category: 'Arms',
    equipmentRequired: 'Dumbbell',
    targetMuscle: 'Biceps Brachii',
    secondaryMuscles: ['Brachialis'],
    instructions: 'Hold dumbbells at arms length. Supinate wrists while curling weights toward shoulders.',
    alternativeExerciseIds: ['ex-cable-curl']
  },
  {
    id: 'ex-tricep-pushdown',
    name: 'Cable Tricep Pushdown',
    category: 'Arms',
    equipmentRequired: 'Cable',
    targetMuscle: 'Triceps Lateral & Medial Head',
    secondaryMuscles: [],
    instructions: 'Attach rope or bar to high cable. Keep elbows pinned to sides, push handle down until elbows lock.',
    alternativeExerciseIds: ['ex-bicep-curl']
  },
  {
    id: 'ex-treadmill-hiit',
    name: 'Treadmill Incline Sprints',
    category: 'Cardio',
    equipmentRequired: 'Treadmill',
    targetMuscle: 'Cardiovascular System',
    secondaryMuscles: ['Legs', 'Calves'],
    instructions: 'Set incline to 4-6%. Alternate 30s high-intensity sprint with 60s recovery walk for 15-20 minutes.',
    alternativeExerciseIds: ['ex-stationary-bike']
  },
  {
    id: 'ex-stationary-bike',
    name: 'Smart Stationary Exercise Bike',
    category: 'Cardio',
    equipmentRequired: 'Bicycle',
    targetMuscle: 'Cardio & Quads',
    secondaryMuscles: ['Hamstrings'],
    instructions: 'Maintain 80-100 RPM at moderate resistance, keeping heart rate in target exertion zone.',
    alternativeExerciseIds: ['ex-treadmill-hiit']
  }
];

export const INITIAL_GYM_FACILITIES: GymFacility[] = [
  {
    id: 'gym-equinox-downtown',
    name: 'Equinox Fitness - Downtown Hub',
    address: '450 Pine St, Financial District',
    distanceKm: 0.8,
    isFavorite: true,
    occupancyRatePercent: 42,
    equipment: [
      { id: 'eq-1', name: 'Barbell Olympic Bench', category: 'Barbell', count: 4, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Free Weight Bay' },
      { id: 'eq-2', name: 'Power Squat Rack', category: 'Barbell', count: 3, busyStatus: 'In Use', waitTimeMins: 4, locationArea: 'Power Zone' },
      { id: 'eq-3', name: '45° Leg Press Machine', category: 'Machine', count: 2, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Plate Loaded' },
      { id: 'eq-4', name: 'Cable Crossover Station', category: 'Cable', count: 2, busyStatus: 'High Demand', waitTimeMins: 8, locationArea: 'Functional Rig' },
      { id: 'eq-5', name: 'Dumbbell Rack (5-100lbs)', category: 'Dumbbell', count: 3, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Free Weight Bay' },
      { id: 'eq-6', name: 'Lat Pulldown Machine', category: 'Cable', count: 2, busyStatus: 'In Use', waitTimeMins: 3, locationArea: 'Selectorized Bay' },
      { id: 'eq-7', name: 'Pro Incline Treadmills', category: 'Treadmill', count: 12, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Cardio Loft' },
      { id: 'eq-8', name: 'Smart Exercise Bikes', category: 'Bicycle', count: 8, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Cardio Loft' }
    ]
  },
  {
    id: 'gym-golds-central',
    name: "Gold's Gym - Metro Center",
    address: '820 Market St, Suite 200',
    distanceKm: 1.5,
    isFavorite: false,
    occupancyRatePercent: 78,
    equipment: [
      { id: 'gq-1', name: 'Barbell Olympic Bench', category: 'Barbell', count: 6, busyStatus: 'High Demand', waitTimeMins: 10, locationArea: 'Main Floor' },
      { id: 'gq-2', name: 'Power Squat Rack', category: 'Barbell', count: 4, busyStatus: 'High Demand', waitTimeMins: 12, locationArea: 'Squat Alley' },
      { id: 'gq-3', name: '45° Leg Press Machine', category: 'Machine', count: 3, busyStatus: 'In Use', waitTimeMins: 5, locationArea: 'Leg Section' },
      { id: 'gq-4', name: 'Cable Crossover Station', category: 'Cable', count: 4, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Cable Center' }
    ]
  },
  {
    id: 'gym-home-setup',
    name: 'Home Garage Gym',
    address: 'My Residence',
    distanceKm: 0.0,
    isFavorite: false,
    occupancyRatePercent: 10,
    equipment: [
      { id: 'hq-1', name: 'Adjustable Dumbbells (10-50lbs)', category: 'Dumbbell', count: 1, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Garage' },
      { id: 'hq-2', name: 'Adjustable Bench', category: 'Dumbbell', count: 1, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Garage' },
      { id: 'hq-3', name: 'Pull-Up Station', category: 'Bodyweight', count: 1, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Garage' },
      { id: 'hq-4', name: 'Resistance Bands Set', category: 'Resistance Band', count: 1, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Garage' }
    ]
  }
];

export const INITIAL_ROUTINES: Routine[] = [
  {
    id: 'rt-push-hypertrophy',
    name: 'Hypertrophy Push Day (Chest/Delts/Triceps)',
    description: 'Designed for maximal chest hypertrophy, shoulder cap development, and heavy tricep overload.',
    targetGoal: 'Build Muscle Mass',
    daysPerWeek: 4,
    difficulty: 'Intermediate',
    isAiGenerated: false,
    createdAt: '2026-07-20',
    exercises: [
      { exerciseId: 'ex-bench-press', exerciseName: 'Barbell Bench Press', category: 'Chest', targetSets: 4, targetReps: 8, targetWeightKg: 80, restSeconds: 90 },
      { exerciseId: 'ex-dumbbell-press', exerciseName: 'Incline Dumbbell Press', category: 'Chest', targetSets: 3, targetReps: 10, targetWeightKg: 28, restSeconds: 75 },
      { exerciseId: 'ex-overhead-press', exerciseName: 'Barbell Overhead Shoulder Press', category: 'Shoulders', targetSets: 3, targetReps: 8, targetWeightKg: 50, restSeconds: 90 },
      { exerciseId: 'ex-lateral-raise', exerciseName: 'Dumbbell Lateral Raise', category: 'Shoulders', targetSets: 4, targetReps: 12, targetWeightKg: 12, restSeconds: 60 },
      { exerciseId: 'ex-tricep-pushdown', exerciseName: 'Cable Tricep Pushdown', category: 'Arms', targetSets: 3, targetReps: 12, targetWeightKg: 35, restSeconds: 60 }
    ]
  },
  {
    id: 'rt-pull-strength',
    name: 'Pull & Lats Density Routine',
    description: 'Full back width, lat activation, rear delts, and bicep curling peak.',
    targetGoal: 'Strength & V-Taper',
    daysPerWeek: 4,
    difficulty: 'Intermediate',
    isAiGenerated: false,
    createdAt: '2026-07-21',
    exercises: [
      { exerciseId: 'ex-lat-pulldown', exerciseName: 'Lat Pulldown Machine', category: 'Back', targetSets: 4, targetReps: 10, targetWeightKg: 65, restSeconds: 75 },
      { exerciseId: 'ex-seated-row', exerciseName: 'Seated Cable Row', category: 'Back', targetSets: 3, targetReps: 10, targetWeightKg: 60, restSeconds: 75 },
      { exerciseId: 'ex-pullup', exerciseName: 'Bodyweight Pull-Up', category: 'Back', targetSets: 3, targetReps: 8, targetWeightKg: 0, restSeconds: 90 },
      { exerciseId: 'ex-bicep-curl', exerciseName: 'Dumbbell Bicep Curl', category: 'Arms', targetSets: 3, targetReps: 12, targetWeightKg: 16, restSeconds: 60 }
    ]
  },
  {
    id: 'rt-leg-power',
    name: 'Lower Body & Core Crusher',
    description: 'Heavy quad focus, glute recruitment, and leg press burnout.',
    targetGoal: 'Leg Power & Athleticism',
    daysPerWeek: 3,
    difficulty: 'Advanced',
    isAiGenerated: false,
    createdAt: '2026-07-22',
    exercises: [
      { exerciseId: 'ex-barbell-squat', exerciseName: 'Barbell Back Squat', category: 'Legs', targetSets: 4, targetReps: 6, targetWeightKg: 105, restSeconds: 120 },
      { exerciseId: 'ex-leg-press', exerciseName: '45° Leg Press Machine', category: 'Legs', targetSets: 4, targetReps: 10, targetWeightKg: 180, restSeconds: 90 },
      { exerciseId: 'ex-leg-extension', exerciseName: 'Leg Extension Machine', category: 'Legs', targetSets: 3, targetReps: 15, targetWeightKg: 50, restSeconds: 60 }
    ]
  }
];

export const INITIAL_HISTORICAL_SESSIONS: WorkoutSession[] = [
  {
    id: 'session-1',
    name: 'Hypertrophy Push Day',
    date: '2026-07-22',
    durationSeconds: 3120, // 52 mins
    totalVolumeKg: 4820,
    avgHeartRate: 138,
    maxHeartRate: 168,
    caloriesBurned: 420,
    exertionScore: 82,
    gymName: 'Equinox Fitness - Downtown Hub',
    xpEarned: 350,
    exercises: [
      {
        exerciseId: 'ex-bench-press',
        exerciseName: 'Barbell Bench Press',
        category: 'Chest',
        sets: [
          { id: 's1', setNumber: 1, targetReps: 8, actualReps: 8, weightKg: 80, completed: true, rpe: 7, heartRateBpm: 128 },
          { id: 's2', setNumber: 2, targetReps: 8, actualReps: 8, weightKg: 80, completed: true, rpe: 8, heartRateBpm: 136 },
          { id: 's3', setNumber: 3, targetReps: 8, actualReps: 8, weightKg: 82.5, completed: true, rpe: 8.5, heartRateBpm: 144 },
          { id: 's4', setNumber: 4, targetReps: 8, actualReps: 7, weightKg: 82.5, completed: true, rpe: 9.5, heartRateBpm: 156 }
        ]
      },
      {
        exerciseId: 'ex-dumbbell-press',
        exerciseName: 'Incline Dumbbell Press',
        category: 'Chest',
        sets: [
          { id: 's5', setNumber: 1, targetReps: 10, actualReps: 10, weightKg: 28, completed: true, rpe: 8, heartRateBpm: 140 },
          { id: 's6', setNumber: 2, targetReps: 10, actualReps: 10, weightKg: 28, completed: true, rpe: 8.5, heartRateBpm: 148 },
          { id: 's7', setNumber: 3, targetReps: 10, actualReps: 9, weightKg: 28, completed: true, rpe: 9, heartRateBpm: 152 }
        ]
      }
    ],
    heartRateTelemetry: [
      { timestamp: 0, bpm: 92, zone: 'Rest' },
      { timestamp: 300, bpm: 118, zone: 'Warm-up' },
      { timestamp: 600, bpm: 132, zone: 'Fat Burn' },
      { timestamp: 900, bpm: 145, zone: 'Cardio' },
      { timestamp: 1200, bpm: 158, zone: 'Peak' },
      { timestamp: 1500, bpm: 142, zone: 'Cardio' },
      { timestamp: 1800, bpm: 165, zone: 'Peak' },
      { timestamp: 2100, bpm: 138, zone: 'Cardio' },
      { timestamp: 2400, bpm: 125, zone: 'Fat Burn' },
      { timestamp: 2700, bpm: 110, zone: 'Warm-up' }
    ]
  },
  {
    id: 'session-2',
    name: 'Pull & Lats Density Routine',
    date: '2026-07-24',
    durationSeconds: 2850, // 47 mins
    totalVolumeKg: 5210,
    avgHeartRate: 134,
    maxHeartRate: 162,
    caloriesBurned: 390,
    exertionScore: 78,
    gymName: 'Equinox Fitness - Downtown Hub',
    xpEarned: 320,
    exercises: [
      {
        exerciseId: 'ex-lat-pulldown',
        exerciseName: 'Lat Pulldown Machine',
        category: 'Back',
        sets: [
          { id: 's8', setNumber: 1, targetReps: 10, actualReps: 10, weightKg: 65, completed: true, rpe: 7, heartRateBpm: 125 },
          { id: 's9', setNumber: 2, targetReps: 10, actualReps: 10, weightKg: 65, completed: true, rpe: 8, heartRateBpm: 132 },
          { id: 's10', setNumber: 3, targetReps: 10, actualReps: 10, weightKg: 70, completed: true, rpe: 8.5, heartRateBpm: 142 }
        ]
      }
    ],
    heartRateTelemetry: [
      { timestamp: 0, bpm: 88, zone: 'Rest' },
      { timestamp: 300, bpm: 115, zone: 'Warm-up' },
      { timestamp: 600, bpm: 130, zone: 'Fat Burn' },
      { timestamp: 900, bpm: 142, zone: 'Cardio' },
      { timestamp: 1200, bpm: 155, zone: 'Peak' },
      { timestamp: 1800, bpm: 136, zone: 'Cardio' }
    ]
  },
  {
    id: 'session-3',
    name: 'Lower Body & Leg Power',
    date: '2026-07-26',
    durationSeconds: 3400, // 56 mins
    totalVolumeKg: 7450,
    avgHeartRate: 149,
    maxHeartRate: 178,
    caloriesBurned: 520,
    exertionScore: 91,
    gymName: 'Equinox Fitness - Downtown Hub',
    xpEarned: 450,
    exercises: [
      {
        exerciseId: 'ex-barbell-squat',
        exerciseName: 'Barbell Back Squat',
        category: 'Legs',
        sets: [
          { id: 's11', setNumber: 1, targetReps: 6, actualReps: 6, weightKg: 100, completed: true, rpe: 8, heartRateBpm: 145 },
          { id: 's12', setNumber: 2, targetReps: 6, actualReps: 6, weightKg: 105, completed: true, rpe: 8.5, heartRateBpm: 158 },
          { id: 's13', setNumber: 3, targetReps: 6, actualReps: 6, weightKg: 110, completed: true, rpe: 9, heartRateBpm: 168 },
          { id: 's14', setNumber: 4, targetReps: 6, actualReps: 5, weightKg: 110, completed: true, rpe: 9.5, heartRateBpm: 175 }
        ]
      }
    ],
    heartRateTelemetry: [
      { timestamp: 0, bpm: 95, zone: 'Rest' },
      { timestamp: 300, bpm: 128, zone: 'Fat Burn' },
      { timestamp: 600, bpm: 146, zone: 'Cardio' },
      { timestamp: 900, bpm: 165, zone: 'Peak' },
      { timestamp: 1200, bpm: 176, zone: 'Extreme' },
      { timestamp: 1800, bpm: 158, zone: 'Peak' }
    ]
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-workout',
    title: 'Iron Premiere',
    description: 'Complete your first full workout log on PulseFit',
    iconName: 'Dumbbell',
    unlocked: true,
    unlockedAt: '2026-07-22',
    currentProgress: 1,
    maxProgress: 1,
    xpValue: 100,
    category: 'Volume'
  },
  {
    id: 'ach-streak-5',
    title: 'Consistency Titan',
    description: 'Maintain a 5-day active workout streak',
    iconName: 'Flame',
    unlocked: true,
    unlockedAt: '2026-07-26',
    currentProgress: 5,
    maxProgress: 5,
    xpValue: 250,
    category: 'Streak'
  },
  {
    id: 'ach-volume-10k',
    title: '10 Ton Club',
    description: 'Lift over 10,000 kg total volume across workouts',
    iconName: 'Trophy',
    unlocked: true,
    unlockedAt: '2026-07-26',
    currentProgress: 17480,
    maxProgress: 10000,
    xpValue: 300,
    category: 'Volume'
  },
  {
    id: 'ach-peak-hr',
    title: 'Cardio Catalyst',
    description: 'Maintain HR in Peak/Extreme Exertion Zone (>160 BPM) for 15 cumulative minutes',
    iconName: 'HeartPulse',
    unlocked: false,
    currentProgress: 11,
    maxProgress: 15,
    xpValue: 200,
    category: 'Exertion'
  },
  {
    id: 'ach-ai-designer',
    title: 'Architect of Fitness',
    description: 'Generate and save a personalized AI Workout Regime',
    iconName: 'Sparkles',
    unlocked: false,
    currentProgress: 0,
    maxProgress: 1,
    xpValue: 150,
    category: 'AI Goal'
  },
  {
    id: 'ach-gym-pioneer',
    title: 'Equipment Explorer',
    description: 'Check machine availability & sync workout with local gym gear',
    iconName: 'Building2',
    unlocked: true,
    unlockedAt: '2026-07-23',
    currentProgress: 1,
    maxProgress: 1,
    xpValue: 150,
    category: 'Gym Explorer'
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'user-alex',
    userName: 'Alex "The Tank" Mercer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    xp: 3850,
    weeklyVolumeKg: 24500,
    streakDays: 14,
    exertionPoints: 94,
    badgeTitle: 'Hypertrophy Master'
  },
  {
    rank: 2,
    userId: 'user-you',
    userName: 'You (Current User)',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    xp: 2920,
    weeklyVolumeKg: 17480,
    streakDays: 5,
    exertionPoints: 88,
    badgeTitle: 'Pulse Elite',
    isCurrentUser: true
  },
  {
    rank: 3,
    userId: 'user-sarah',
    userName: 'Sarah Jenkins',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    xp: 2640,
    weeklyVolumeKg: 15200,
    streakDays: 8,
    exertionPoints: 85,
    badgeTitle: 'Cardio Beast'
  },
  {
    rank: 4,
    userId: 'user-marcus',
    userName: 'Marcus Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    xp: 2100,
    weeklyVolumeKg: 12800,
    streakDays: 4,
    exertionPoints: 79,
    badgeTitle: 'Iron Warrior'
  },
  {
    rank: 5,
    userId: 'user-elena',
    userName: 'Elena Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    xp: 1950,
    weeklyVolumeKg: 11200,
    streakDays: 6,
    exertionPoints: 82,
    badgeTitle: 'HIIT Specialist'
  }
];

 

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Jason York',
  goal: 'Gain Lean Muscle & Maximize Heart Health',
  level: 4,
  currentXp: 2920,
  xpToNextLevel: 3500,
  streakDays: 5,
  activeGymId: 'gym-equinox-downtown',
  weightKg: 78.5,
  heightCm: 180,
  age: 28,
  gender: 'Male',
  bodyFatPercent: 15,
  primaryGoal: 'Hypertrophy & Lean Mass',
  focusAreas: ['Chest', 'Back', 'Legs'],
  trainingStyle: 'Pyramid Overload (Hypertrophy)',
  restTimerSound: true,
  hapticFeedback: true,
  weightUnit: 'lbs',
  distanceUnit: 'mi',
  heightUnit: 'ft-in',
  zipcode: '90210'
};

export const CLEAN_START_USER_PROFILE: UserProfile = {
  name: 'Subscriber Athlete',
  goal: 'Gain Lean Muscle & Maximize Heart Health',
  level: 1,
  currentXp: 0,
  xpToNextLevel: 1000,
  streakDays: 0,
  activeGymId: 'gym-equinox-downtown',
  weightKg: 77,
  heightCm: 178,
  age: 28,
  gender: 'Male',
  bodyFatPercent: 15,
  primaryGoal: 'Hypertrophy & Lean Mass',
  focusAreas: ['Chest', 'Back', 'Legs'],
  trainingStyle: 'Progressive Overload',
  restTimerSound: true,
  hapticFeedback: true,
  weightUnit: 'lbs',
  distanceUnit: 'mi',
  heightUnit: 'ft-in',
  zipcode: '90210'
};
