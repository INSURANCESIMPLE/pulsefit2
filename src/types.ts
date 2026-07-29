export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio' | 'Full Body';

export type EquipmentCategory = 
  | 'Barbell' 
  | 'Dumbbell' 
  | 'Machine' 
  | 'Cable' 
  | 'Bodyweight' 
  | 'Kettlebell' 
  | 'Treadmill' 
  | 'Bicycle' 
  | 'Resistance Band';

export interface Exercise {
  id: string;
  name: string;
  category: MuscleGroup;
  equipmentRequired: EquipmentCategory;
  instructions: string;
  targetMuscle: string;
  secondaryMuscles?: string[];
  alternativeExerciseIds?: string[];
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  targetReps: number;
  actualReps: number;
  weightKg: number;
  completed: boolean;
  rpe: number; // Rate of Perceived Exertion (1 - 10)
  heartRateBpm?: number;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  category: MuscleGroup;
  sets: WorkoutSet[];
  notes?: string;
}

export interface HeartRatePoint {
  timestamp: number; // relative second or epoch
  bpm: number;
  zone: 'Rest' | 'Warm-up' | 'Fat Burn' | 'Cardio' | 'Peak' | 'Extreme';
}

export interface WorkoutSession {
  id: string;
  name: string;
  routineId?: string;
  date: string; // ISO format or YYYY-MM-DD
  durationSeconds: number;
  totalVolumeKg: number;
  avgHeartRate: number;
  maxHeartRate: number;
  caloriesBurned: number;
  exertionScore: number; // 1-100 derived from HR & RPE
  gymName?: string;
  exercises: ExerciseLog[];
  heartRateTelemetry: HeartRatePoint[];
  xpEarned: number;
  notes?: string;
}

export interface RoutineExercise {
  exerciseId: string;
  exerciseName: string;
  category: MuscleGroup;
  targetSets: number;
  targetReps: number;
  targetWeightKg: number;
  restSeconds: number;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  targetGoal: string;
  daysPerWeek: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  exercises: RoutineExercise[];
  isAiGenerated?: boolean;
  createdAt: string;
}

export interface GymEquipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  count: number;
  busyStatus: 'Available' | 'In Use' | 'High Demand';
  waitTimeMins: number;
  locationArea: string; // e.g. "Free Weight Section", "Cardio Zone", "Machine Bay 2"
}

export interface GymFacility {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  isFavorite: boolean;
  occupancyRatePercent: number;
  equipment: GymEquipment[];
}

export interface GoalRegimeRequest {
  goalPrompt: string;
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  daysPerWeek: number;
  sessionDurationMins: number;
  availableEquipment: EquipmentCategory[];
  gymName?: string;
  heightCm?: number;
  weightKg?: number;
  age?: number;
  gender?: string;
  bodyFatPercent?: number;
  primaryGoal?: string;
  focusAreas?: string[];
  trainingStyle?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  currentProgress: number;
  maxProgress: number;
  xpValue: number;
  category: 'Streak' | 'Volume' | 'Exertion' | 'AI Goal' | 'Gym Explorer';
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl: string;
  xp: number;
  weeklyVolumeKg: number;
  streakDays: number;
  exertionPoints: number;
  badgeTitle: string;
  isCurrentUser?: boolean;
}

export interface UserProfile {
  name: string;
  goal: string;
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  streakDays: number;
  activeGymId: string;
  weightKg: number;
  heightCm: number;
  age?: number;
  gender?: string;
  bodyFatPercent?: number;
  primaryGoal?: string;
  focusAreas?: string[];
  trainingStyle?: string;
  restTimerSound: boolean;
  hapticFeedback: boolean;
  bluetoothHrDeviceId?: string;
  weightUnit?: 'lbs' | 'kg';
  distanceUnit?: 'mi' | 'km';
  heightUnit?: 'ft-in' | 'cm';
  zipcode?: string;
}

export type NutritionGoalCategory = 'Muscle Building' | 'Fat Loss' | 'Endurance' | 'Maintenance' | 'Keto';

export type DietaryRestriction = 'None' | 'High Protein' | 'Low Carb' | 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Dairy-Free' | 'Keto';

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  goalCategory: NutritionGoalCategory;
  prepTimeMins: number;
  cookTimeMins: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  servings: number;
  tags: DietaryRestriction[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  imageUrl?: string;
  isAiGenerated?: boolean;
}

export interface LoggedMeal {
  id: string;
  recipeId?: string;
  name: string;
  timestamp: string; // ISO or formatted date
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  servingsLogged: number;
}

export interface DailyMacroTarget {
  targetCalories: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
}

export interface PostComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: string;
}

export interface SocialPost {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorBadge?: string;
  timestamp: string;
  milestoneTitle: string;
  milestoneCategory: 'PR Record' | 'Streak' | 'Volume' | 'Workout Finished';
  workoutName?: string;
  statsHighlight: {
    label: string;
    value: string;
  }[];
  caption: string;
  reactions: Record<string, { count: number; userReacted: boolean }>;
  comments: PostComment[];
}


