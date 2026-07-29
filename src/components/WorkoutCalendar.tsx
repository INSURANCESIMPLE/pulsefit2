import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Flame, 
  Dumbbell, HeartPulse, Trophy, Clock, Zap, MessageSquare, X, CheckCircle2 
} from 'lucide-react';
import { WorkoutSession } from '../types';

interface WorkoutCalendarProps {
  workoutSessions: WorkoutSession[];
}

export const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ workoutSessions }) => {
  // Determine initial month based on latest session or today
  const latestSessionDate = useMemo(() => {
    if (workoutSessions.length === 0) return new Date();
    const sorted = [...workoutSessions].sort((a, b) => b.date.localeCompare(a.date));
    return new Date(sorted[0].date + 'T12:00:00');
  }, [workoutSessions]);

  const [currentDate, setCurrentDate] = useState<Date>(() => latestSessionDate);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(() => {
    if (workoutSessions.length > 0) {
      const sorted = [...workoutSessions].sort((a, b) => b.date.localeCompare(a.date));
      return sorted[0].date;
    }
    return null;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Group workout sessions by YYYY-MM-DD
  const sessionsByDate = useMemo(() => {
    const map: Record<string, WorkoutSession[]> = {};
    workoutSessions.forEach((s) => {
      // Normalize date to YYYY-MM-DD
      const dateKey = s.date.slice(0, 10);
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(s);
    });
    return map;
  }, [workoutSessions]);

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon, ...
    const daysInMonth = lastDayOfMonth.getDate();

    const days: {
      dateObj: Date;
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      sessions: WorkoutSession[];
    }[] = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const pDate = new Date(year, month - 1, pDay);
      const pStr = formatDateString(pDate);
      days.push({
        dateObj: pDate,
        dateStr: pStr,
        dayNumber: pDay,
        isCurrentMonth: false,
        sessions: sessionsByDate[pStr] || []
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const cDate = new Date(year, month, d);
      const cStr = formatDateString(cDate);
      days.push({
        dateObj: cDate,
        dateStr: cStr,
        dayNumber: d,
        isCurrentMonth: true,
        sessions: sessionsByDate[cStr] || []
      });
    }

    // Next month padding days to complete 35 or 42 cells (5 or 6 weeks)
    const totalCells = days.length > 35 ? 42 : 35;
    const remaining = totalCells - days.length;
    for (let n = 1; n <= remaining; n++) {
      const nDate = new Date(year, month + 1, n);
      const nStr = formatDateString(nDate);
      days.push({
        dateObj: nDate,
        dateStr: nStr,
        dayNumber: n,
        isCurrentMonth: false,
        sessions: sessionsByDate[nStr] || []
      });
    }

    return days;
  }, [year, month, sessionsByDate]);

  // Nav Handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(formatDateString(now));
  };

  const selectedSessions = selectedDateStr ? sessionsByDate[selectedDateStr] || [] : [];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bento-card border-lime-500/30 space-y-4 shadow-xl">
      {/* Calendar Header & Month Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-lime-500/10 text-lime-400 border border-lime-500/20">
            <CalendarIcon className="w-4 h-4 text-lime-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-lime-500">Session History</span>
            <h3 className="text-base font-extrabold text-slate-100">
              {monthNames[month]} {year}
            </h3>
          </div>
        </div>

        {/* Month Navigation Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-[10px] font-bold uppercase text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition mr-1"
          >
            Today
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((item) => {
          const hasWorkouts = item.sessions.length > 0;
          const isSelected = selectedDateStr === item.dateStr;
          const isToday = item.dateStr === formatDateString(new Date());

          return (
            <button
              key={item.dateStr}
              onClick={() => setSelectedDateStr(item.dateStr)}
              className={`relative rounded-xl p-2 min-h-[52px] sm:min-h-[60px] flex flex-col justify-between text-left transition border ${
                isSelected
                  ? 'bg-lime-500/15 border-lime-400 text-slate-100 ring-2 ring-lime-500/50 shadow-lg'
                  : hasWorkouts
                  ? 'bg-slate-900/90 border-lime-500/40 hover:border-lime-400/80 text-slate-200'
                  : item.isCurrentMonth
                  ? 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 text-slate-400'
                  : 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-40'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs font-bold ${
                    isToday
                      ? 'bg-lime-500 text-slate-950 px-1.5 py-0.2 rounded-full font-black text-[10px]'
                      : isSelected
                      ? 'text-lime-400 font-extrabold'
                      : 'text-slate-300'
                  }`}
                >
                  {item.dayNumber}
                </span>

                {hasWorkouts && (
                  <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse shadow-sm shadow-lime-500" />
                )}
              </div>

              {/* Workout Badge Indicator */}
              {hasWorkouts && (
                <div className="mt-1 space-y-0.5">
                  <div className="flex items-center space-x-1 bg-lime-500/20 border border-lime-500/40 text-lime-300 px-1.5 py-0.5 rounded-md text-[9px] font-bold leading-none truncate">
                    <Dumbbell className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{item.sessions[0].name.split(' ')[0]}</span>
                  </div>
                  {item.sessions.length > 1 && (
                    <div className="text-[8px] font-black text-lime-400 font-mono">
                      +{item.sessions.length - 1} more
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Workout Detail Summary Panel */}
      {selectedDateStr && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-lime-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Session Log Summary: {formatFriendlyDate(selectedDateStr)}
              </h4>
            </div>

            <button
              onClick={() => setSelectedDateStr(null)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 transition"
              title="Close Summary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {selectedSessions.length > 0 ? (
            <div className="space-y-3">
              {selectedSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
                >
                  {/* Session Title & Gym Name */}
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] uppercase font-black text-slate-950 bg-lime-400 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                        <span className="text-xs font-bold text-slate-400 font-mono">
                          {session.gymName}
                        </span>
                      </div>
                      <h5 className="text-sm font-extrabold text-slate-100 mt-1">
                        {session.name}
                      </h5>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-lime-400 font-mono">
                        +{session.xpEarned || 300} XP
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {formatDuration(session.durationSeconds)}
                      </div>
                    </div>
                  </div>

                  {/* Key Stats Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-center">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">Total Volume</div>
                      <div className="text-xs font-black text-lime-400 font-mono mt-0.5">
                        {session.totalVolumeKg} <span className="text-[9px] text-slate-400">kg</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-center">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">Avg Heart Rate</div>
                      <div className="text-xs font-black text-rose-400 font-mono mt-0.5 flex items-center justify-center space-x-1">
                        <HeartPulse className="w-3 h-3 text-rose-500" />
                        <span>{session.avgHeartRate} BPM</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-center">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">Calories Burned</div>
                      <div className="text-xs font-black text-amber-400 font-mono mt-0.5">
                        {session.caloriesBurned} <span className="text-[9px] text-slate-400">kcal</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-center">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">Exertion Score</div>
                      <div className="text-xs font-black text-indigo-400 font-mono mt-0.5">
                        {session.exertionScore} <span className="text-[9px] text-slate-400">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Logged Exercises breakdown */}
                  {session.exercises && session.exercises.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Exercises & Sets Completed ({session.exercises.length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {session.exercises.map((ex, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-200 text-xs">{ex.exerciseName}</div>
                              <div className="text-[10px] text-slate-400">{ex.category}</div>
                            </div>
                            <div className="text-right font-mono font-bold text-lime-400 text-xs">
                              {ex.sets.length} sets logged
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes & Recovery Feedback if present */}
                  {session.notes && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
                      <div className="flex items-center space-x-1.5 text-lime-400 text-[10px] font-bold uppercase tracking-wider">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Workout Notes & Recovery Feedback</span>
                      </div>
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        "{session.notes}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-6 text-center space-y-1.5">
              <div className="inline-flex p-2.5 rounded-full bg-slate-900 text-slate-500 mb-1">
                <CalendarIcon className="w-5 h-5 text-slate-500" />
              </div>
              <h5 className="text-xs font-bold text-slate-300">Rest & Recovery Day</h5>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                No active workout sessions logged for this date. Muscle synthesis occurs during recovery!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Date Format Helpers
function formatDateString(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatFriendlyDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatDuration(seconds: number): string {
  if (!seconds) return '45 mins';
  const mins = Math.floor(seconds / 60);
  return `${mins} mins`;
}
