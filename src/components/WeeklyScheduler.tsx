import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Dumbbell, Play, Plus, 
  Trash2, Move, Sparkles, CheckCircle2, ChevronRight, GripVertical, AlertCircle
} from 'lucide-react';
import { Routine } from '../types';

interface WeeklySchedulerProps {
  routines: Routine[];
  onStartRoutine: (routine: Routine) => void;
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const WeeklyScheduler: React.FC<WeeklySchedulerProps> = ({
  routines,
  onStartRoutine
}) => {
  // Scheduled routines mapped by day name e.g. { "Monday": ["rt-1"], "Wednesday": ["rt-2"] }
  const [schedule, setSchedule] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('pulsefit_weekly_schedule');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse weekly schedule', e);
      }
    }
    // Default initial schedule demo
    return {
      'Monday': routines[0] ? [routines[0].id] : [],
      'Wednesday': routines[1] ? [routines[1].id] : [],
      'Friday': routines[2] ? [routines[2].id] : []
    };
  });

  const [draggedRoutineId, setDraggedRoutineId] = useState<string | null>(null);
  const [activeDropDay, setActiveDropDay] = useState<string | null>(null);
  const [selectedAssignDay, setSelectedAssignDay] = useState<string | null>(null);

  // Save schedule to local storage
  const updateSchedule = (newSched: Record<string, string[]>) => {
    setSchedule(newSched);
    localStorage.setItem('pulsefit_weekly_schedule', JSON.stringify(newSched));
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, routineId: string) => {
    e.dataTransfer.setData('text/plain', routineId);
    e.dataTransfer.effectAllowed = 'copyMove';
    setDraggedRoutineId(routineId);
  };

  const handleDragOver = (e: React.DragEvent, day: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (activeDropDay !== day) {
      setActiveDropDay(day);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setActiveDropDay(null);
  };

  const handleDrop = (e: React.DragEvent, day: string) => {
    e.preventDefault();
    setActiveDropDay(null);
    const routineId = e.dataTransfer.getData('text/plain') || draggedRoutineId;
    if (!routineId) return;

    // Assign routine to day if not already assigned
    const currentDayRoutines = schedule[day] || [];
    if (!currentDayRoutines.includes(routineId)) {
      const updated = {
        ...schedule,
        [day]: [...currentDayRoutines, routineId]
      };
      updateSchedule(updated);
    }
    setDraggedRoutineId(null);
  };

  // Quick click assign helper for mobile
  const handleAssignClick = (day: string, routineId: string) => {
    const currentDayRoutines = schedule[day] || [];
    if (!currentDayRoutines.includes(routineId)) {
      const updated = {
        ...schedule,
        [day]: [...currentDayRoutines, routineId]
      };
      updateSchedule(updated);
    }
    setSelectedAssignDay(null);
  };

  // Remove routine from schedule day
  const handleRemoveFromDay = (day: string, routineId: string) => {
    const currentDayRoutines = schedule[day] || [];
    const updated = {
      ...schedule,
      [day]: currentDayRoutines.filter((id) => id !== routineId)
    };
    updateSchedule(updated);
  };

  // Helper to map routine IDs to routine objects
  const getRoutineById = (id: string): Routine | undefined => {
    return routines.find((r) => r.id === id);
  };

  // Calculate today's index (0 = Monday, ..., 6 = Sunday)
  const todayDate = new Date();
  const dayIndex = (todayDate.getDay() + 6) % 7; // Convert JS 0(Sun) to Mon=0, Sun=6
  const currentDayName = DAYS_OF_WEEK[dayIndex];

  // Derive Upcoming Workouts list in chronological order starting from today
  const upcomingWorkoutsList = React.useMemo(() => {
    const list: { day: string; routine: Routine; isToday: boolean }[] = [];
    
    // Iterate 7 days starting from today
    for (let i = 0; i < 7; i++) {
      const idx = (dayIndex + i) % 7;
      const day = DAYS_OF_WEEK[idx];
      const assignedIds = schedule[day] || [];
      
      assignedIds.forEach((id) => {
        const rt = getRoutineById(id);
        if (rt) {
          list.push({
            day,
            routine: rt,
            isToday: day === currentDayName && i === 0
          });
        }
      });
    }
    return list;
  }, [schedule, routines, dayIndex, currentDayName]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Schedule Header Banner */}
      <div className="bento-card bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-lime-500/30 p-4 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-lime-500/10 text-lime-400 rounded-2xl border border-lime-500/30">
              <CalendarIcon className="w-6 h-6 text-lime-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded border border-lime-500/20">
                Weekly Routine Planner
              </span>
              <h2 className="text-xl font-extrabold text-slate-100 mt-0.5">
                Drag & Drop Workout Schedule
              </h2>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            <span>Today is <strong>{currentDayName}</strong></span>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Drag any saved routine below and drop it onto a day to plan your week. Upcoming scheduled workouts will automatically update!
        </p>
      </div>

      {/* DRAGGABLE SAVED ROUTINES PALETTE */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-lime-400" />
            <span>Saved Routines (Drag or Tap + to Assign)</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Hold & drag card</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {routines.map((rt) => (
            <div
              key={rt.id}
              draggable
              onDragStart={(e) => handleDragStart(e, rt.id)}
              className="bg-slate-900 border border-slate-800 hover:border-lime-500/50 rounded-2xl p-3 shadow-md hover:shadow-lime-500/10 transition group cursor-grab active:cursor-grabbing space-y-2 relative"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-lime-400 transition" />
                  <div>
                    <h4 className="text-xs font-black text-slate-100 group-hover:text-lime-400 transition">
                      {rt.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {rt.exercises.length} Exercises • {rt.daysPerWeek} Days/Wk
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAssignDay(selectedAssignDay === rt.id ? null : rt.id)}
                  className="p-1.5 bg-slate-950 hover:bg-slate-800 text-lime-400 rounded-xl border border-slate-800 transition"
                  title="Quick Assign to Day"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Assign Dropdown overlay for mobile / touch */}
              {selectedAssignDay === rt.id && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2 animate-fade-in text-xs z-10">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Assign to Day:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        onClick={() => handleAssignClick(day, rt.id)}
                        className="py-1 px-2 bg-slate-900 hover:bg-lime-500 hover:text-slate-950 text-slate-200 rounded-lg text-[11px] font-extrabold text-left transition border border-slate-800"
                      >
                        + {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* WEEKLY CALENDAR GRID (DROP ZONES) */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
          Weekly Calendar Schedule Grid
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
          {DAYS_OF_WEEK.map((day) => {
            const isToday = day === currentDayName;
            const assignedIds = schedule[day] || [];
            const isHovered = activeDropDay === day;

            return (
              <div
                key={day}
                onDragOver={(e) => handleDragOver(e, day)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day)}
                className={`min-h-[140px] rounded-2xl p-3 border transition-all space-y-2 flex flex-col justify-between ${
                  isHovered
                    ? 'bg-lime-500/15 border-lime-400 ring-2 ring-lime-500/30 scale-[1.02]'
                    : isToday
                    ? 'bg-slate-900 border-lime-500/50 shadow-lg shadow-lime-950/20'
                    : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Day Card Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-xs font-black ${isToday ? 'text-lime-400' : 'text-slate-200'}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-black uppercase bg-lime-500 text-slate-950 px-1.5 py-0.2 rounded font-mono">
                        TODAY
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {assignedIds.length} Workouts
                  </span>
                </div>

                {/* Assigned Routines List inside Day Box */}
                <div className="space-y-1.5 flex-1">
                  {assignedIds.map((rtId) => {
                    const rt = getRoutineById(rtId);
                    if (!rt) return null;

                    return (
                      <div
                        key={rtId}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-2 space-y-1 group relative animate-fade-in"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-bold text-slate-100 truncate block">
                            {rt.name}
                          </span>
                          <button
                            onClick={() => handleRemoveFromDay(day, rtId)}
                            className="text-slate-600 hover:text-rose-400 transition p-0.5"
                            title="Unschedule"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-[9px] font-mono text-lime-400">
                            {rt.exercises.length} Ex
                          </span>

                          <button
                            onClick={() => onStartRoutine(rt)}
                            className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md flex items-center space-x-0.5 transition"
                          >
                            <Play className="w-2.5 h-2.5 fill-slate-950" />
                            <span>Start</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {assignedIds.length === 0 && (
                    <div className="h-full min-h-[60px] border-2 border-dashed border-slate-800/80 rounded-xl flex flex-col items-center justify-center p-2 text-center text-[10px] text-slate-600 space-y-1">
                      <Move className="w-3.5 h-3.5 text-slate-700" />
                      <span>Drop Routine Here</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AUTOMATICALLY POPULATED 'UPCOMING WORKOUTS' LIST */}
      <div className="bento-card border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-lime-400" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-100">
                Upcoming Scheduled Workouts
              </h3>
              <span className="text-[10px] text-slate-400">
                Automatically populates based on your weekly schedule calendar above
              </span>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-lime-400 bg-lime-500/10 px-2.5 py-1 rounded-lg border border-lime-500/20">
            {upcomingWorkoutsList.length} Scheduled
          </span>
        </div>

        <div className="space-y-3">
          {upcomingWorkoutsList.map((item, idx) => (
            <div
              key={`${item.day}-${item.routine.id}-${idx}`}
              className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                item.isToday
                  ? 'bg-gradient-to-r from-slate-900 to-lime-950/20 border-lime-500/50 shadow-md'
                  : 'bg-slate-950 border-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl border text-center min-w-[65px] ${
                  item.isToday
                    ? 'bg-lime-500 text-slate-950 border-lime-400 font-black'
                    : 'bg-slate-900 text-slate-300 border-slate-800 font-bold'
                }`}>
                  <span className="text-[9px] uppercase block tracking-wider font-mono">
                    {item.isToday ? 'TODAY' : 'DAY'}
                  </span>
                  <span className="text-xs font-extrabold">{item.day.slice(0, 3)}</span>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-black text-slate-100">{item.routine.name}</h4>
                    {item.routine.isAiGenerated && (
                      <span className="text-[9px] font-black uppercase text-lime-400 bg-lime-500/10 px-1.5 py-0.5 rounded border border-lime-500/20">
                        AI
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                    {item.routine.exercises.map((e) => e.exerciseName).join(' • ')}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => onStartRoutine(item.routine)}
                  className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition shadow flex items-center space-x-1.5 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                  <span>Start Workout</span>
                </button>
              </div>
            </div>
          ))}

          {upcomingWorkoutsList.length === 0 && (
            <div className="text-center py-8 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-bold">No workouts scheduled for this week yet</p>
              <p className="text-[11px] text-slate-500">Drag any saved routine from the top palette onto a day card to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
