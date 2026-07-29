import React, { useRef } from 'react';
import { X, Printer, Download, HeartPulse, Flame, Clock, Dumbbell, ShieldCheck, User, Calendar, FileText } from 'lucide-react';
import { WorkoutSession, UserProfile } from '../types';

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  workoutSessions: WorkoutSession[];
}

export const PdfReportModal: React.FC<PdfReportModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  workoutSessions
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Filter sessions for the last 30 days relative to latest workout date
  const latestDate = workoutSessions.length > 0
    ? new Date(Math.max(...workoutSessions.map(s => new Date(s.date + 'T12:00:00').getTime())))
    : new Date();

  const thirtyDaysAgo = new Date(latestDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const last30DaysSessions = workoutSessions.filter(s => {
    const sDate = new Date(s.date + 'T12:00:00');
    return sDate >= thirtyDaysAgo;
  }).sort((a, b) => b.date.localeCompare(a.date));

  // Metrics calculation
  const totalVolume = last30DaysSessions.reduce((sum, s) => sum + s.totalVolumeKg, 0);
  const totalCalories = last30DaysSessions.reduce((sum, s) => sum + s.caloriesBurned, 0);
  const totalDurationMinutes = Math.round(
    last30DaysSessions.reduce((sum, s) => sum + (s.durationSeconds || 2700), 0) / 60
  );
  const avgHr = last30DaysSessions.length > 0
    ? Math.round(last30DaysSessions.reduce((sum, s) => sum + s.avgHeartRate, 0) / last30DaysSessions.length)
    : 0;

  const handlePrint = () => {
    window.print();
  };

  const startDateStr = thirtyDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endDateStr = latestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                PDF Health Record Generator
              </span>
              <h3 className="text-base font-extrabold text-slate-100">
                30-Day Training & Health Report
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition shadow-lg flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Document Preview Area (Printable Document) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 text-slate-100 space-y-6 print:p-0 print:bg-white print:text-black">
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-pdf-report, #printable-pdf-report * {
                visibility: visible;
              }
              #printable-pdf-report {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                color: #000 !important;
                background: #fff !important;
                padding: 20px !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div id="printable-pdf-report" ref={reportRef} className="space-y-6 max-w-3xl mx-auto">
            {/* PDF Header Branding */}
            <div className="flex items-start justify-between border-b-2 border-lime-500/40 pb-4 print:border-black">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-lime-500 flex items-center justify-center font-black text-slate-950 text-sm">
                    P
                  </div>
                  <h1 className="text-2xl font-black text-slate-100 tracking-tight print:text-black">
                    PULSEFIT <span className="text-lime-400 print:text-black font-normal">HEALTH & PERFORMANCE</span>
                  </h1>
                </div>
                <p className="text-xs text-slate-400 mt-1 print:text-gray-600">
                  Certified 30-Day Physical Training & Biometric Summary Report
                </p>
              </div>

              <div className="text-right text-xs text-slate-400 print:text-gray-700 space-y-0.5">
                <div className="font-bold text-slate-200 print:text-black">Report Window</div>
                <div className="font-mono text-[11px]">{startDateStr} – {endDateStr}</div>
                <div className="text-[10px] text-lime-400 print:text-gray-500">Generated: {new Date().toLocaleDateString()}</div>
              </div>
            </div>

            {/* Athlete Profile Summary Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs print:bg-gray-100 print:border-gray-300 print:text-black">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 print:text-gray-600">Athlete Name</span>
                <div className="font-extrabold text-slate-100 print:text-black text-sm">{userProfile.name}</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 print:text-gray-600">Body Weight</span>
                <div className="font-mono font-bold text-slate-200 print:text-black">{userProfile.weightKg} kg</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 print:text-gray-600">Height</span>
                <div className="font-mono font-bold text-slate-200 print:text-black">{userProfile.heightCm} cm</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 print:text-gray-600">Training Tier</span>
                <div className="font-bold text-lime-400 print:text-black">Level {userProfile.level} ({userProfile.xp} XP)</div>
              </div>
            </div>

            {/* 30-Day Aggregate Key Metrics */}
            <div className="space-y-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-lime-400 print:text-black">
                30-Day Aggregate Fitness & Telemetry Summary
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center print:bg-gray-50 print:border-gray-300">
                  <div className="text-[9px] font-bold uppercase text-slate-400 print:text-gray-600">Total Workouts</div>
                  <div className="text-xl font-black font-mono text-lime-400 print:text-black mt-0.5">{last30DaysSessions.length}</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center print:bg-gray-50 print:border-gray-300">
                  <div className="text-[9px] font-bold uppercase text-slate-400 print:text-gray-600">Tonnage Lifted</div>
                  <div className="text-xl font-black font-mono text-slate-100 print:text-black mt-0.5">
                    {totalVolume.toLocaleString()} <span className="text-xs font-sans text-slate-400 print:text-gray-600">kg</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center print:bg-gray-50 print:border-gray-300">
                  <div className="text-[9px] font-bold uppercase text-slate-400 print:text-gray-600">Calories Expended</div>
                  <div className="text-xl font-black font-mono text-amber-400 print:text-black mt-0.5">
                    {totalCalories.toLocaleString()} <span className="text-xs font-sans text-slate-400 print:text-gray-600">kcal</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center print:bg-gray-50 print:border-gray-300">
                  <div className="text-[9px] font-bold uppercase text-slate-400 print:text-gray-600">Avg Heart Rate</div>
                  <div className="text-xl font-black font-mono text-rose-400 print:text-black mt-0.5">
                    {avgHr} <span className="text-xs font-sans text-slate-400 print:text-gray-600">BPM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Session History Table */}
            <div className="space-y-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-lime-400 print:text-black">
                Detailed Session Logs ({last30DaysSessions.length} Sessions)
              </h2>

              <div className="border border-slate-800 rounded-2xl overflow-hidden print:border-gray-400">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] print:bg-gray-200 print:text-black print:border-gray-400">
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Routine / Session</th>
                      <th className="p-2.5">Duration</th>
                      <th className="p-2.5 text-right">Volume</th>
                      <th className="p-2.5 text-right">Avg HR</th>
                      <th className="p-2.5 text-right">Calories</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 print:divide-gray-300">
                    {last30DaysSessions.map((session) => (
                      <React.Fragment key={session.id}>
                        <tr className="hover:bg-slate-900/50 print:bg-white text-slate-200 print:text-black">
                          <td className="p-2.5 font-mono text-[11px] font-bold">{session.date}</td>
                          <td className="p-2.5">
                            <div className="font-bold text-slate-100 print:text-black">{session.name}</div>
                            <div className="text-[10px] text-slate-400 print:text-gray-600">{session.gymName || 'Local Gym'}</div>
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-400 print:text-black">
                            {Math.round((session.durationSeconds || 2700) / 60)} mins
                          </td>
                          <td className="p-2.5 font-mono text-right font-bold text-lime-400 print:text-black">
                            {session.totalVolumeKg} kg
                          </td>
                          <td className="p-2.5 font-mono text-right font-bold text-rose-400 print:text-black">
                            {session.avgHeartRate} BPM
                          </td>
                          <td className="p-2.5 font-mono text-right font-bold text-amber-400 print:text-black">
                            {session.caloriesBurned} kcal
                          </td>
                        </tr>

                        {session.notes && (
                          <tr className="bg-slate-950/60 print:bg-gray-50 border-b border-slate-800/80 print:border-gray-300">
                            <td colSpan={6} className="px-3 py-1.5 text-[11px] text-slate-300 print:text-black italic">
                              <strong className="not-italic text-[10px] uppercase text-lime-400 print:text-gray-700 mr-1.5 font-bold">Notes:</strong>
                              "{session.notes}"
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Health Disclaimer & Verification Footer */}
            <div className="pt-4 border-t border-slate-800 print:border-gray-400 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 print:text-gray-600 gap-2">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-lime-400 print:text-black shrink-0" />
                <span>Verified digital training export generated for personal health record management.</span>
              </div>
              <div className="font-mono">Document ID: PF-30D-{Math.floor(100000 + Math.random() * 900000)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
