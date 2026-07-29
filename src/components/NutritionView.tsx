import React, { useState } from 'react';
import { 
  Utensils, Flame, Zap, Dumbbell, Sparkles, Plus, Search, CheckCircle2, 
  Clock, ChefHat, Heart, ChevronRight, X, RotateCcw, AlertCircle, Apple,
  Filter, Trash2, BookOpen, Layers
} from 'lucide-react';
import { Recipe, NutritionGoalCategory, DietaryRestriction, LoggedMeal, UserProfile, DailyMacroTarget } from '../types';
import { INITIAL_RECIPES } from '../data/mockRecipes';
import { WaterTracker } from './WaterTracker';

interface NutritionViewProps {
  userProfile: UserProfile;
}

export const NutritionView: React.FC<NutritionViewProps> = ({ userProfile }) => {
  // Recipes State
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('pulsefit_recipes');
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  // Today's Logged Meals
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>(() => {
    const saved = localStorage.getItem('pulsefit_logged_meals');
    return saved ? JSON.parse(saved) : [
      {
        id: 'logged-1',
        name: 'Anabolic Grilled Chicken & Quinoa Power Bowl',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calories: 580,
        proteinGrams: 52,
        carbsGrams: 58,
        fatGrams: 14,
        servingsLogged: 1
      }
    ];
  });

  // Goal & Search Filters
  const [selectedGoal, setSelectedGoal] = useState<NutritionGoalCategory | 'All'>('All');
  const [selectedTag, setSelectedTag] = useState<DietaryRestriction | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals State
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  // AI Generator Form State
  const [aiGoal, setAiGoal] = useState<NutritionGoalCategory>('Muscle Building');
  const [aiTag, setAiTag] = useState<DietaryRestriction>('High Protein');
  const [aiCalories, setAiCalories] = useState<number>(550);
  const [aiIngredients, setAiIngredients] = useState<string>('Chicken breast, spinach, eggs, quinoa');
  const [aiNote, setAiNote] = useState<string>('Quick prep, wholesome whole foods');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Quick Manual Log Form State
  const [quickMealName, setQuickMealName] = useState('');
  const [quickCalories, setQuickCalories] = useState<number>(450);
  const [quickProtein, setQuickProtein] = useState<number>(35);
  const [quickCarbs, setQuickCarbs] = useState<number>(45);
  const [quickFat, setQuickFat] = useState<number>(12);

  // Persistence Effects
  const saveRecipesToStorage = (updated: Recipe[]) => {
    setRecipes(updated);
    localStorage.setItem('pulsefit_recipes', JSON.stringify(updated));
  };

  const saveLoggedMealsToStorage = (updated: LoggedMeal[]) => {
    setLoggedMeals(updated);
    localStorage.setItem('pulsefit_logged_meals', JSON.stringify(updated));
  };

  // Calculate Daily Target Macro Goals based on user profile
  const userWeight = userProfile.weightKg || 75;
  const isMuscleGoal = userProfile.goal?.toLowerCase().includes('muscle') || userProfile.goal?.toLowerCase().includes('hypertrophy');
  const isFatLossGoal = userProfile.goal?.toLowerCase().includes('loss') || userProfile.goal?.toLowerCase().includes('cut');

  const dailyMacroTarget: DailyMacroTarget = {
    targetCalories: isMuscleGoal ? Math.round(userWeight * 33) : isFatLossGoal ? Math.round(userWeight * 24) : Math.round(userWeight * 28),
    targetProteinGrams: Math.round(userWeight * 2.2), // ~1g per lb body weight
    targetCarbsGrams: isMuscleGoal ? Math.round(userWeight * 3.5) : isFatLossGoal ? Math.round(userWeight * 1.8) : Math.round(userWeight * 2.8),
    targetFatGrams: Math.round(userWeight * 0.9)
  };

  // Aggregate Today's Consumed Totals
  const totalCaloriesConsumed = loggedMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProteinConsumed = loggedMeals.reduce((acc, m) => acc + m.proteinGrams, 0);
  const totalCarbsConsumed = loggedMeals.reduce((acc, m) => acc + m.carbsGrams, 0);
  const totalFatConsumed = loggedMeals.reduce((acc, m) => acc + m.fatGrams, 0);

  // Log Recipe Meal Action
  const handleLogRecipeMeal = (recipe: Recipe, servings = 1) => {
    const newLoggedMeal: LoggedMeal = {
      id: `logged-${Date.now()}`,
      recipeId: recipe.id,
      name: recipe.title,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calories: Math.round(recipe.calories * servings),
      proteinGrams: Math.round(recipe.proteinGrams * servings),
      carbsGrams: Math.round(recipe.carbsGrams * servings),
      fatGrams: Math.round(recipe.fatGrams * servings),
      servingsLogged: servings
    };

    saveLoggedMealsToStorage([newLoggedMeal, ...loggedMeals]);
    setSelectedRecipe(null);
  };

  // Quick Custom Meal Log Action
  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMealName.trim()) return;

    const newLoggedMeal: LoggedMeal = {
      id: `logged-${Date.now()}`,
      name: quickMealName.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calories: Number(quickCalories),
      proteinGrams: Number(quickProtein),
      carbsGrams: Number(quickCarbs),
      fatGrams: Number(quickFat),
      servingsLogged: 1
    };

    saveLoggedMealsToStorage([newLoggedMeal, ...loggedMeals]);
    setQuickMealName('');
    setIsQuickLogOpen(false);
  };

  // Remove Logged Meal
  const handleRemoveLoggedMeal = (id: string) => {
    saveLoggedMealsToStorage(loggedMeals.filter(m => m.id !== id));
  };

  // AI Recipe Generation Submit
  const handleGenerateAiRecipes = async () => {
    setIsGenerating(true);
    setAiError(null);

    try {
      const response = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalCategory: aiGoal,
          dietaryRestriction: aiTag,
          targetCalories: aiCalories,
          ingredientsOnHand: aiIngredients,
          userWeightKg: userProfile.weightKg,
          customNote: aiNote
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate recipes');
      }

      if (data.recipes && data.recipes.length > 0) {
        const newFormattedRecipes: Recipe[] = data.recipes.map((r: any, idx: number) => ({
          ...r,
          id: `ai-recipe-${Date.now()}-${idx}`,
          isAiGenerated: true
        }));

        const updatedList = [...newFormattedRecipes, ...recipes];
        saveRecipesToStorage(updatedList);
        setIsAiModalOpen(false);
      } else {
        throw new Error('No recipes returned from AI.');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Error communicating with AI nutrition server.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter Recipes
  const filteredRecipes = recipes.filter((r) => {
    const matchesGoal = selectedGoal === 'All' || r.goalCategory === selectedGoal;
    const matchesTag = selectedTag === 'All' || r.tags.includes(selectedTag);
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ingredients.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesGoal && matchesTag && matchesSearch;
  });

  const goalCategoryColors: Record<NutritionGoalCategory, { bg: string; text: string; border: string }> = {
    'Muscle Building': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    'Fat Loss': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
    'Endurance': { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
    'Keto': { bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/30' },
    'Maintenance': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' }
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Header Banner */}
      <div className="bento-card border-lime-500/30 space-y-3 relative overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-lime-500/10 to-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 relative">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-lime-500/20 to-amber-500/20 text-lime-400 rounded-2xl border border-lime-500/30 shadow-inner">
              <Utensils className="w-6 h-6 text-lime-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded border border-lime-500/20">
                  Goal-Based Nutrition
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-100 mt-0.5">
                Dietary & Recipe Hub
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="bg-gradient-to-r from-lime-500 to-amber-500 hover:from-lime-400 hover:to-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition shadow-lg flex items-center space-x-1.5 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>AI Recipe Creator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Macro Targets Progress Bar */}
      <div className="bento-card space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Today's Nutrition Intake vs Targets
            </h2>
          </div>

          <button
            onClick={() => setIsQuickLogOpen(true)}
            className="text-[11px] font-bold text-lime-400 hover:text-lime-300 bg-lime-500/10 px-2.5 py-1 rounded-lg border border-lime-500/20 flex items-center space-x-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Custom Meal</span>
          </button>
        </div>

        {/* 4 Macro Progress Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Calories */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
              <span>Calories</span>
              <span className="font-mono text-amber-400">{Math.round((totalCaloriesConsumed / dailyMacroTarget.targetCalories) * 100)}%</span>
            </div>
            <div className="text-lg font-black font-mono text-slate-100">
              {totalCaloriesConsumed} <span className="text-xs text-slate-400 font-sans font-normal">/ {dailyMacroTarget.targetCalories} kcal</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((totalCaloriesConsumed / dailyMacroTarget.targetCalories) * 100, 100)}%` }} 
              />
            </div>
          </div>

          {/* Protein */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
              <span>Protein</span>
              <span className="font-mono text-lime-400">{Math.round((totalProteinConsumed / dailyMacroTarget.targetProteinGrams) * 100)}%</span>
            </div>
            <div className="text-lg font-black font-mono text-lime-400">
              {totalProteinConsumed}g <span className="text-xs text-slate-400 font-sans font-normal">/ {dailyMacroTarget.targetProteinGrams}g</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-lime-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((totalProteinConsumed / dailyMacroTarget.targetProteinGrams) * 100, 100)}%` }} 
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
              <span>Carbs</span>
              <span className="font-mono text-sky-400">{Math.round((totalCarbsConsumed / dailyMacroTarget.targetCarbsGrams) * 100)}%</span>
            </div>
            <div className="text-lg font-black font-mono text-sky-400">
              {totalCarbsConsumed}g <span className="text-xs text-slate-400 font-sans font-normal">/ {dailyMacroTarget.targetCarbsGrams}g</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-sky-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((totalCarbsConsumed / dailyMacroTarget.targetCarbsGrams) * 100, 100)}%` }} 
              />
            </div>
          </div>

          {/* Fats */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
              <span>Fats</span>
              <span className="font-mono text-purple-400">{Math.round((totalFatConsumed / dailyMacroTarget.targetFatGrams) * 100)}%</span>
            </div>
            <div className="text-lg font-black font-mono text-purple-400">
              {totalFatConsumed}g <span className="text-xs text-slate-400 font-sans font-normal">/ {dailyMacroTarget.targetFatGrams}g</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((totalFatConsumed / dailyMacroTarget.targetFatGrams) * 100, 100)}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Logged Meals List Dropdown / Pills */}
        {loggedMeals.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
              Today's Logged Meals ({loggedMeals.length})
            </div>
            <div className="space-y-1.5">
              {loggedMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs hover:border-slate-700 transition"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200">{meal.name}</span>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-2 font-mono">
                      <span>{meal.timestamp}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-semibold">{meal.calories} kcal</span>
                      <span>•</span>
                      <span className="text-lime-400 font-semibold">{meal.proteinGrams}g P</span>
                      <span>•</span>
                      <span className="text-sky-400">{meal.carbsGrams}g C</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveLoggedMeal(meal.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                    title="Remove logged meal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Daily Water Intake & Hydration Tracker */}
      <WaterTracker />

      {/* Goal Filters & Category Pills */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
            Select Fitness Goal & Filter Recipes
          </span>
          <span className="text-xs text-slate-400 font-mono font-bold">
            {filteredRecipes.length} recipes found
          </span>
        </div>

        {/* Goal Categories Horizontal Scroll */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {(['All', 'Muscle Building', 'Fat Loss', 'Endurance', 'Keto', 'Maintenance'] as const).map((category) => {
            const isActive = selectedGoal === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedGoal(category)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition border ${
                  isActive
                    ? 'bg-lime-500 text-slate-950 border-lime-400 shadow-md scale-105'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {category === 'Muscle Building' && '💪 '}
                {category === 'Fat Loss' && '🔥 '}
                {category === 'Endurance' && '⚡ '}
                {category === 'Keto' && '🥑 '}
                {category === 'Maintenance' && '🥗 '}
                {category}
              </button>
            );
          })}
        </div>

        {/* Search Bar & Dietary Filter Pills */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search recipes, chicken, quinoa, keto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-lime-500 transition"
            />
          </div>

          {/* Dietary Tags Dropdown Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-0.5">
            {(['All', 'High Protein', 'Low Carb', 'Gluten-Free', 'Vegetarian', 'Keto'] as const).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag as any)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap border transition ${
                  selectedTag === tag
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecipes.map((recipe) => {
          const colors = goalCategoryColors[recipe.goalCategory] || {
            bg: 'bg-slate-800',
            text: 'text-slate-200',
            border: 'border-slate-700'
          };

          return (
            <div
              key={recipe.id}
              className="bento-card hover:border-lime-500/40 transition-all duration-300 space-y-3 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {recipe.goalCategory}
                    </span>
                    {recipe.isAiGenerated && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center space-x-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>AI Crafted</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-mono font-bold">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{recipe.prepTimeMins + recipe.cookTimeMins} mins</span>
                  </div>
                </div>

                {/* Recipe Title & Description */}
                <div>
                  <h3 className="text-base font-extrabold text-slate-100 group-hover:text-lime-300 transition line-clamp-1">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>

                {/* Macro Nutrition Banner */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 grid grid-cols-4 gap-1 text-center font-mono">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Calories</span>
                    <span className="text-xs font-black text-amber-400">{recipe.calories}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Protein</span>
                    <span className="text-xs font-black text-lime-400">{recipe.proteinGrams}g</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Carbs</span>
                    <span className="text-xs font-black text-sky-400">{recipe.carbsGrams}g</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Fat</span>
                    <span className="text-xs font-black text-purple-400">{recipe.fatGrams}g</span>
                  </div>
                </div>

                {/* Tags Pill */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {recipe.tags.map((t) => (
                    <span key={t} className="text-[9px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedRecipe(recipe);
                    setServingMultiplier(1);
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-200 font-extrabold text-xs py-2 rounded-xl border border-slate-800 transition flex items-center justify-center space-x-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-lime-400" />
                  <span>View Prep Steps</span>
                </button>

                <button
                  onClick={() => handleLogRecipeMeal(recipe, 1)}
                  className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-black text-xs px-3 py-2 rounded-xl transition shadow flex items-center space-x-1 shrink-0"
                  title="Log 1 serving to today's nutrition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Meal</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredRecipes.length === 0 && (
          <div className="col-span-full bento-card text-center py-12 space-y-3">
            <ChefHat className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-extrabold text-slate-300">No matching recipes found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your goal filters, search terms, or generate a custom recipe using AI.
            </p>
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition shadow"
            >
              Generate AI Recipe
            </button>
          </div>
        )}
      </div>

      {/* FULL RECIPE PREPARATION DETAIL MODAL */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded border border-lime-500/20">
                  {selectedRecipe.goalCategory}
                </span>
                <span className="text-xs text-slate-400 font-mono font-bold">
                  ⏱ {selectedRecipe.prepTimeMins + selectedRecipe.cookTimeMins} mins total
                </span>
              </div>

              <button
                onClick={() => setSelectedRecipe(null)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-5 text-slate-200">
              <div>
                <h2 className="text-xl font-black text-slate-100">{selectedRecipe.title}</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedRecipe.description}</p>
              </div>

              {/* Serving Size Multiplier Controls */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-300 block">Serving Size Multiplier</span>
                  <span className="text-[10px] text-slate-500">Recalculates ingredient quantities & macros</span>
                </div>

                <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 font-mono">
                  {[0.5, 1, 1.5, 2].map((mult) => (
                    <button
                      key={mult}
                      onClick={() => setServingMultiplier(mult)}
                      className={`px-2.5 py-1 text-xs font-black rounded-lg transition ${
                        servingMultiplier === mult
                          ? 'bg-lime-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mult}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Recalculated Macros Banner */}
              <div className="bg-slate-950 border border-lime-500/30 rounded-2xl p-3.5 grid grid-cols-4 gap-2 text-center font-mono">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Calories</span>
                  <span className="text-sm font-black text-amber-400">{Math.round(selectedRecipe.calories * servingMultiplier)} kcal</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Protein</span>
                  <span className="text-sm font-black text-lime-400">{Math.round(selectedRecipe.proteinGrams * servingMultiplier)}g</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Carbs</span>
                  <span className="text-sm font-black text-sky-400">{Math.round(selectedRecipe.carbsGrams * servingMultiplier)}g</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Fat</span>
                  <span className="text-sm font-black text-purple-400">{Math.round(selectedRecipe.fatGrams * servingMultiplier)}g</span>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-lime-400">
                  Required Ingredients ({selectedRecipe.ingredients.length})
                </h3>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 divide-y divide-slate-800/60">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{ing.name}</span>
                      <span className="font-mono text-lime-400 font-semibold">{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Cooking Guide */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-lime-400">
                  Step-by-Step Preparation
                </h3>

                <div className="space-y-2">
                  {selectedRecipe.instructions.map((step, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-start space-x-3 text-xs">
                      <div className="w-5 h-5 rounded-full bg-lime-500/20 text-lime-400 border border-lime-500/30 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-slate-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Bottom Log Action */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono font-bold">
                Log {servingMultiplier}x serving ({Math.round(selectedRecipe.calories * servingMultiplier)} kcal)
              </span>

              <button
                onClick={() => handleLogRecipeMeal(selectedRecipe, servingMultiplier)}
                className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition shadow-lg flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Log to Daily Nutrition Tracker</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI RECIPE CREATOR MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-lime-400" />
                <h3 className="text-base font-extrabold text-slate-100">AI Goal Recipe Creator</h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4 text-xs">
              {aiError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* Goal Select */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Primary Goal</label>
                <select
                  value={aiGoal}
                  onChange={(e) => setAiGoal(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-lime-500"
                >
                  <option value="Muscle Building">💪 Muscle Building (High Protein)</option>
                  <option value="Fat Loss">🔥 Fat Loss / Cutting (Low Calorie Density)</option>
                  <option value="Endurance">⚡ Endurance & Energy (Complex Carbs)</option>
                  <option value="Keto">🥑 Keto / Low Carb</option>
                  <option value="Maintenance">🥗 Maintenance & Balance</option>
                </select>
              </div>

              {/* Tag Select */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Dietary Tag</label>
                <select
                  value={aiTag}
                  onChange={(e) => setAiTag(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-lime-500"
                >
                  <option value="High Protein">High Protein</option>
                  <option value="Low Carb">Low Carb</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Gluten-Free">Gluten-Free</option>
                  <option value="Dairy-Free">Dairy-Free</option>
                  <option value="None">No Restriction</option>
                </select>
              </div>

              {/* Target Calories Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center font-bold text-slate-300 text-[10px] uppercase">
                  <span>Target Meal Calories</span>
                  <span className="font-mono text-lime-400 text-xs">{aiCalories} kcal</span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="1000"
                  step="25"
                  value={aiCalories}
                  onChange={(e) => setAiCalories(Number(e.target.value))}
                  className="w-full accent-lime-500"
                />
              </div>

              {/* Ingredients on Hand */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Ingredients on Hand (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Chicken breast, eggs, avocados, rice"
                  value={aiIngredients}
                  onChange={(e) => setAiIngredients(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-lime-500"
                />
              </div>

              {/* Additional Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Special Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Under 15 minutes preparation, high satiety"
                  value={aiNote}
                  onChange={(e) => setAiNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-lime-500"
                />
              </div>

              <button
                onClick={handleGenerateAiRecipes}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-lime-500 to-amber-500 hover:from-lime-400 hover:to-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Crafting AI Recipes with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Generate Custom AI Recipes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK CUSTOM MEAL LOG MODAL */}
      {isQuickLogOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-100">Log Custom Meal Intake</h3>
              <button
                onClick={() => setIsQuickLogOpen(false)}
                className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickLogSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 text-[10px] uppercase">Meal / Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Protein Shake & Banana"
                  value={quickMealName}
                  onChange={(e) => setQuickMealName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-lime-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 text-[10px] uppercase">Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    value={quickCalories}
                    onChange={(e) => setQuickCalories(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-amber-400 focus:border-lime-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 text-[10px] uppercase">Protein (g)</label>
                  <input
                    type="number"
                    required
                    value={quickProtein}
                    onChange={(e) => setQuickProtein(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-lime-400 focus:border-lime-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 text-[10px] uppercase">Carbs (g)</label>
                  <input
                    type="number"
                    required
                    value={quickCarbs}
                    onChange={(e) => setQuickCarbs(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-sky-400 focus:border-lime-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 text-[10px] uppercase">Fats (g)</label>
                  <input
                    type="number"
                    required
                    value={quickFat}
                    onChange={(e) => setQuickFat(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-purple-400 focus:border-lime-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-black text-xs py-2.5 rounded-xl transition shadow mt-2"
              >
                Log Custom Meal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
