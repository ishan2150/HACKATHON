'use client';

import React, { useState } from 'react';
import { Subject, StudyLog, QuizResult } from '../types/study';
import { calculateOverallReadiness } from '../lib/scheduler';
import { 
  BarChart3, 
  Target, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Download, 
  Upload, 
  Printer, 
  Sparkles, 
  GraduationCap, 
  BookOpen,
  Award
} from 'lucide-react';

interface AnalyticsViewProps {
  subjects: Subject[];
  studyLogs: StudyLog[];
  quizResults: QuizResult[];
  streakCount: number;
  onExportData: () => void;
  onImportData: (jsonStr: string) => boolean;
  onExplainTopic: (topicTitle: string, subjectCode: string) => void;
  onTakeQuiz: (subjectId: string, topicId: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  subjects,
  studyLogs,
  quizResults,
  streakCount,
  onExportData,
  onImportData,
  onExplainTopic,
  onTakeQuiz,
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState('');

  const readiness = calculateOverallReadiness(subjects);

  // Total study minutes logged
  const totalMinutesLogged = studyLogs.reduce((acc, l) => acc + l.minutesSpent, 0);
  const totalHoursLogged = Math.round(totalMinutesLogged / 60 * 10) / 10;

  // Average quiz score
  const avgQuizScore = quizResults.length > 0 
    ? Math.round(quizResults.reduce((acc, q) => acc + q.score, 0) / quizResults.length)
    : 72; // default estimated from presets

  // Find all weak topics (< 60%)
  const weakTopicsList: { subject: Subject; topic: any }[] = [];
  subjects.forEach(subject => {
    subject.topics.forEach(topic => {
      const score = topic.quizScore !== undefined ? topic.quizScore : topic.currentConfidence;
      if (score < 60) {
        weakTopicsList.push({ subject, topic });
      }
    });
  });

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    const success = onImportData(importJsonText);
    if (success) {
      setShowImportModal(false);
      setImportJsonText('');
      alert('Study plan backup successfully restored!');
    } else {
      setImportError('Invalid JSON backup format. Please check the text and try again.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Header */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Performance Analytics & Insights</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track syllabus coverage, weak area radar, diagnostic scores, and export your study dossier.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportData}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            Export Backup
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            Restore
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Exam Readiness Score */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exam Readiness</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{readiness.overallPercentage}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${readiness.overallPercentage}%` }} />
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">
            {readiness.completedTopics} of {readiness.totalTopics} chapters mastered
          </p>
        </div>

        {/* 2. Projected Exam Grade */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projected Grade</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-300">
            {readiness.overallPercentage >= 85 ? 'A+ (9.2 CGPA)' : readiness.overallPercentage >= 70 ? 'A (8.5 CGPA)' : readiness.overallPercentage >= 50 ? 'B+ (7.5 CGPA)' : 'B (6.8 CGPA)'}
          </div>
          <p className="text-[11px] text-slate-400">
            Based on topic confidence & diagnostic quiz scores
          </p>
        </div>

        {/* 3. Study Hours Logged */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time Invested</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalHoursLogged}h</div>
          <p className="text-[11px] text-slate-400">
            ~{readiness.totalHoursNeeded}h estimated remaining for finals
          </p>
        </div>

        {/* 4. Active Study Streak */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Study Streak</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">{streakCount} Days</div>
          <p className="text-[11px] text-slate-400">
            Daily consistency beats cramming by 3.2x retention
          </p>
        </div>

      </div>

      {/* Course Readiness Breakdown & Weak Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Course-by-Course Readiness Bar List */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Subject Syllabus Coverage</span>
          </h2>

          <div className="space-y-4">
            {readiness.subjectBreakdown.map(subj => (
              <div key={subj.subjectId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: subj.color || '#6366F1' }}
                    />
                    <span>{subj.code}</span>
                    <span className="text-slate-400 font-normal truncate max-w-[200px]">{subj.name}</span>
                  </div>
                  <span className="font-mono font-bold text-indigo-300">{subj.readiness}%</span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${subj.readiness}%`,
                      backgroundColor: subj.color || '#6366F1'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Areas Radar / List */}
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Priority Weak Areas Radar</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
              {weakTopicsList.length} Chapters
            </span>
          </div>

          <p className="text-xs text-slate-300">
            These chapters have confidence or quiz scores &lt; 60%. StudyBuddy prioritizes these in your daily schedule.
          </p>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {weakTopicsList.map(({ subject, topic }) => (
              <div 
                key={topic.id}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="px-1.5 py-0.5 text-[9px] font-bold rounded text-white"
                      style={{ backgroundColor: subject.color }}
                    >
                      {subject.code}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">{topic.chapter}</span>
                  </div>
                  <p className="font-semibold text-slate-200 truncate">{topic.title}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onExplainTopic(topic.title, subject.code)}
                    className="px-2 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded font-semibold text-[11px]"
                  >
                    AI Notes
                  </button>
                  <button
                    onClick={() => onTakeQuiz(subject.id, topic.id)}
                    className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded font-semibold text-[11px]"
                  >
                    Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Study Logs Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <span>Recent Focus Sessions History</span>
        </h2>

        {studyLogs.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">No completed study sessions logged yet. Complete tasks or run the Focus Timer to track your velocity!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Course</th>
                  <th className="pb-3">Session Type</th>
                  <th className="pb-3">Minutes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {studyLogs.slice(0, 8).map(log => {
                  const subj = subjects.find(s => s.id === log.subjectId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5">{log.date}</td>
                      <td className="py-2.5 font-sans font-bold text-white">{subj?.code || 'CSE'}</td>
                      <td className="py-2.5 capitalize font-sans">{log.taskType}</td>
                      <td className="py-2.5 text-indigo-400 font-bold">{log.minutesSpent} min</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* IMPORT JSON MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleImportSubmit} className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-4 bg-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Restore Study Plan Backup</h3>
              <button type="button" onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">Paste your exported StudyBuddy JSON backup string below:</p>
              <textarea
                rows={8}
                placeholder="Paste backup JSON data here..."
                required
                value={importJsonText}
                onChange={e => setImportJsonText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-mono text-[11px] p-3 rounded-lg focus:outline-none focus:border-indigo-500"
              />
              {importError && (
                <p className="text-rose-400 font-medium">{importError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
              >
                Restore Plan
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
