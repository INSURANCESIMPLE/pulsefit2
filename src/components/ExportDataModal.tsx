import React, { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, Printer, ShieldCheck, Check, Sparkles, FileText } from 'lucide-react';
import { WorkoutSession, UserProfile, Routine } from '../types';
import { PdfReportModal } from './PdfReportModal';

interface ExportDataModalProps {
  userProfile: UserProfile;
  workoutSessions: WorkoutSession[];
  routines: Routine[];
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  userProfile,
  workoutSessions,
  routines
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // JSON Export (Apple Health compatible schema format)
  const handleExportJson = () => {
    const healthKitPayload = {
      sourceApp: "PulseFit iOS Health Companion",
      exportTimestamp: new Date().toISOString(),
      user: {
        name: userProfile.name,
        weightKg: userProfile.weightKg,
        heightCm: userProfile.heightCm,
        level: userProfile.level
      },
      workoutHistory: workoutSessions.map((s) => ({
        sessionId: s.id,
        workoutName: s.name,
        date: s.date,
        durationSeconds: s.durationSeconds,
        totalVolumeKg: s.totalVolumeKg,
        averageHeartRateBpm: s.avgHeartRate,
        maximumHeartRateBpm: s.maxHeartRate,
        caloriesBurned: s.caloriesBurned,
        exertionScore: s.exertionScore,
        gymLocation: s.gymName,
        exercises: s.exercises.map((ex) => ({
          exerciseName: ex.exerciseName,
          category: ex.category,
          completedSets: ex.sets.map((set) => ({
            setNumber: set.setNumber,
            reps: set.actualReps,
            weightKg: set.weightKg,
            rpeExertion: set.rpe,
            heartRateBpm: set.heartRateBpm
          }))
        })),
        heartRateTelemetry: s.heartRateTelemetry
      })),
      customRoutines: routines
    };

    const jsonStr = JSON.stringify(healthKitPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulsefit_health_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess('JSON Apple Health Schema File Downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // CSV Export for spreadsheets
  const handleExportCsv = () => {
    let csvContent = "Date,Workout Name,Gym,Exercise,Set,Reps,Weight (kg),RPE (1-10),Avg HR (BPM)\n";

    workoutSessions.forEach((s) => {
      s.exercises.forEach((ex) => {
        ex.sets.forEach((set) => {
          csvContent += `"${s.date}","${s.name}","${s.gymName || 'Local Gym'}","${ex.exerciseName}",${set.setNumber},${set.actualReps},${set.weightKg},${set.rpe},${set.heartRateBpm || s.avgHeartRate}\n`;
        });
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulsefit_workout_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess('CSV Spreadsheet Log Exported!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Print Summary Report
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-28">
      {/* Banner Bento Card */}
      <div className="bento-card bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-slate-800 space-y-3">
        <div className="inline-flex items-center space-x-2 bg-lime-500/10 border border-lime-500/30 px-3 py-1 rounded-full text-lime-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-lime-400" />
          <span>Long-Term Health Vault & Telemetry Export</span>
        </div>

        <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">
          Robust Health Data Export
        </h2>

        <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
          Export your complete training history, raw heart rate telemetry series, physical exertion scores, and personalized routines into standard, unencrypted health formats compatible with Apple Health, HealthKit, and Excel.
        </p>
      </div>

      {/* Export Options Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Apple Health JSON */}
        <div className="bento-card space-y-4 shadow-xl hover:border-lime-500/30">
          <div className="p-3 bg-lime-500/10 text-lime-400 rounded-2xl w-fit border border-lime-500/20">
            <FileJson className="w-6 h-6" />
          </div>

          <div>
            <h3 className="font-extrabold text-sm text-slate-100">Apple Health JSON</h3>
            <p className="text-xs text-slate-400 mt-1">Full HealthKit compatible schema payload including HR telemetry and exercise logs.</p>
          </div>

          <button
            onClick={handleExportJson}
            className="w-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-black text-xs py-2.5 rounded-xl transition shadow-md flex items-center justify-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>

        {/* CSV Spreadsheet */}
        <div className="bento-card space-y-4 shadow-xl hover:border-lime-500/30">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit border border-emerald-500/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>

          <div>
            <h3 className="font-extrabold text-sm text-slate-100">CSV Workout Logs</h3>
            <p className="text-xs text-slate-400 mt-1">Spreadsheet compatible matrix with sets, reps, weights, RPE, and heart rate.</p>
          </div>

          <button
            onClick={handleExportCsv}
            className="w-full bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 font-extrabold text-xs py-2.5 rounded-xl transition shadow-md flex items-center justify-center space-x-1.5"
          >
            <Download className="w-4 h-4 text-lime-400" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Printable 30-Day PDF Health Summary Report */}
        <div className="bento-card space-y-4 shadow-xl hover:border-amber-500/40 border-amber-500/20 bg-gradient-to-br from-slate-900 to-amber-950/20">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl w-fit border border-amber-500/20">
            <FileText className="w-6 h-6 text-amber-400" />
          </div>

          <div>
            <div className="flex items-center space-x-1.5 mb-0.5">
              <span className="text-[9px] uppercase font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                30-Day Health Record
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-slate-100">Generate PDF Report</h3>
            <p className="text-xs text-slate-400 mt-1">Formatted 30-day training & biometric summary PDF for personal records or health professionals.</p>
          </div>

          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl transition shadow-md flex items-center justify-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Generate 30-Day PDF</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 bg-lime-500/10 border border-lime-500/40 text-lime-300 text-xs rounded-2xl font-bold flex items-center space-x-2 animate-bounce">
          <Check className="w-4 h-4 text-lime-400" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* History Preview List Bento Card */}
      <div className="bento-card space-y-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-lime-500">History Vault</span>
        <h3 className="text-sm font-bold text-slate-100">Exportable Workout History Records</h3>

        <div className="space-y-2">
          {workoutSessions.map((session) => (
            <div key={session.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">{session.name}</div>
                  <div className="text-[10px] text-slate-400">{session.date} • {session.gymName}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-lime-400">{session.totalVolumeKg} kg volume</div>
                  <div className="text-[10px] text-rose-400 font-bold">{session.avgHeartRate} BPM Avg HR</div>
                </div>
              </div>
              {session.notes && (
                <div className="text-[11px] text-slate-300 italic bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-lime-400 not-italic block mb-0.5">Notes & Recovery</span>
                  "{session.notes}"
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Printable 30-Day PDF Report Modal */}
      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        userProfile={userProfile}
        workoutSessions={workoutSessions}
      />
    </div>
  );
};
