'use client';

import React from 'react';
import { 
  Subject, 
  StudyTask, 
  UserPreferences, 
  TaskType,
  TimeSlot 
} from '../types/study';
import { calculateOverallReadiness, getDaysDifference } from '../lib/scheduler';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle, 
  Play, 
  Calendar, 
  Sparkles, 
  Flame, 
  ArrowRight, 
  Target, 
  Zap, 
  BookOpen,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardViewProps {
  subjects: Subject[];
  schedule: StudyTask[];
  preferences: UserPreferences;
  onToggleTask: (taskId: string) => void;
  onNavigateTab: (tab: any) => void;
  onStartPomodoroForTask: (task: StudyTask) => void;
  onTakeQuizForTopic: (subjectId: string, topicId: string) => void;
  onExplainTopic: (topicTitle: string, subjectCode: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  subjects,
  schedule,
  preferences,
  onToggleTask,
  onNavigateTab,
  onStartPomodoroForTask,
  onTakeQuizForTopic,
  onExplainTopic,
}) => {
  const [selectedSlot, setSelectedSlot] = React.useState<string>('all');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const readiness = calculateOverallReadiness(subjects);

  // Filter tasks for today
  const todayTasks = schedule.filter(t => t.date === todayStr);
  const filteredTasks = selectedSlot === 'all' 
    ? todayTasks 
    : todayTasks.filter(t => t.timeSlot === selectedSlot);

  const completedTodayCount = todayTasks.filter(t => t.completed).length;
  const totalTodayCount = todayTasks.length;
  const todayProgressPercent = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;

  // Minutes studied today
  const minutesPlannedToday = todayTasks.reduce((acc, t) => acc + t.durationMinutes, 0);
  const minutesDoneToday = todayTasks.filter(t => t.completed).reduce((acc, t) => acc + t.durationMinutes, 0);

  // Sort subjects by upcoming exam date
  const sortedUpcomingExams = [...subjects].sort((a, b) => {
    return getDaysDifference(a.examDate) - getDaysDifference(b.examDate);
  });

  // Find top 4 weakest topics across all subjects
  const weakTopics: { subject: Subject; topic: any; daysLeft: number }[] = [];
  subjects.forEach(subject => {
    const daysLeft = getDaysDifference(subject.examDate);
    subject.topics.forEach(topic => {
      if ((topic.quizScore !== undefined && topic.quizScore < 60) || topic.currentConfidence < 50) {
        weakTopics.push({ subject, topic, daysLeft });
      }
    });
  });
  weakTopics.sort((a, b) => {
    const aScore = (a.topic.quizScore ?? a.topic.currentConfidence);
    const bScore = (b.topic.quizScore ?? b.topic.currentConfidence);
    return aScore - bScore;
  });

  const handleTaskCheck = (taskId: string, currentCompleted: boolean) => {
    onToggleTask(taskId);
    if (!currentCompleted) {
      // Trigger confetti celebration!
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366F1', '#10B981', '#8B5CF6', '#F59E0B']
      });
    }
  };

  const getSlotBadgeColor = (slot: TimeSlot) => {
    switch (slot) {
      case 'morning': return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'afternoon': return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'evening': return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'night': return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getTaskTypeBadge = (type: TaskType) => {
    switch (type) {
      case 'learn': return { label: '📖 Learn', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
      case 'revision': return { label: '🔄 Spaced Review', color: 'bg-blue-500/10 text-blue-300 border-blue-500/30' };
      case 'practice_quiz': return { label: '🧠 Quiz Recall', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
      case 'cheat_sheet': return { label: '📑 Cheat Sheet', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
      default: return { label: 'Task', color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero Exam Readiness Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-purple-950/70 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Adaptive Exam Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Ready to crush your exams, <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">Engineer?</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              StudyBuddy has optimized your schedule. We prioritized urgent deadlines & weak topics like <span className="text-amber-300 font-medium">Dynamic Programming</span> and <span className="text-indigo-300 font-medium">Semaphores</span>.
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>{readiness.completedTopics} of {readiness.totalTopics} Topics Mastered</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>~{readiness.totalHoursNeeded}h Total Prep Required</span>
              </div>
            </div>
          </div>

          {/* Big Readiness Radial Score */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-900/80 rounded-2xl border border-slate-800/80 shadow-inner min-w-[200px]">
            <div className="relative flex items-center justify-center w-28 h-28">
              {/* SVG Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-500 transition-all duration-1000 ease-out"
                  strokeDasharray={`${readiness.overallPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white">{readiness.overallPercentage}%</span>
                <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">Readiness</span>
              </div>
            </div>
            <p className="mt-2 text-xs font-semibold text-emerald-400 text-center">
              {readiness.overallPercentage >= 80 ? '🌟 Outstanding Progress' : readiness.overallPercentage >= 50 ? '📈 On Track for A Grade' : '⚡ Revision Needed'}
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Exam Countdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Upcoming Exam Countdowns</h2>
          </div>
          <button 
            onClick={() => onNavigateTab('subjects')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
          >
            View All Syllabus <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {sortedUpcomingExams.map((subject) => {
            const daysLeft = getDaysDifference(subject.examDate);
            const isUrgent = daysLeft <= 4;
            const isCritical = daysLeft <= 2;

            return (
              <div 
                key={subject.id}
                className={`glass-card p-4 rounded-xl border relative overflow-hidden transition-all duration-200 ${
                  isCritical 
                    ? 'border-rose-500/50 bg-rose-950/20' 
                    : isUrgent 
                    ? 'border-amber-500/40 bg-amber-950/15' 
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                {/* Top accent line */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1" 
                  style={{ backgroundColor: subject.color || '#6366F1' }} 
                />

                <div className="flex items-start justify-between gap-2 mt-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800/90 text-slate-200 border border-slate-700">
                    {subject.code}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                    isCritical 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
                      : isUrgent 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {daysLeft === 0 ? 'Today!' : daysLeft === 1 ? 'Tomorrow!' : `${daysLeft} days`}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white mt-2.5 truncate" title={subject.name}>
                  {subject.name}
                </h3>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Exam: {subject.examDate}</span>
                  <span className="text-slate-300 font-medium">{subject.creditHours} Credits</span>
                </div>

                {/* Micro topic count bar */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{subject.topics.length} Chapters</span>
                  <button 
                    onClick={() => onNavigateTab('subjects')}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Open
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Today's Action Plan + Weak Topics / Velocity Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Today's Schedule & Action Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">Today&apos;s AI Study Schedule</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {completedTodayCount} of {totalTodayCount} sessions completed ({todayProgressPercent}%)
                </p>
              </div>

              {/* Slot Filter Buttons */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                {['all', 'morning', 'afternoon', 'evening', 'night'].map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-2.5 py-1 rounded-md capitalize font-medium transition ${
                      selectedSlot === slot
                        ? 'bg-indigo-600 text-white font-semibold shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${todayProgressPercent}%` }}
              />
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/30">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-slate-300 font-semibold text-sm">No tasks in this slot for today!</p>
                <p className="text-slate-500 text-xs mt-1">Enjoy your break or generate more sessions in the Schedule tab.</p>
                <button
                  onClick={() => onNavigateTab('schedule')}
                  className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Configure Study Blocks
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const typeBadge = getTaskTypeBadge(task.type);

                  return (
                    <div 
                      key={task.id}
                      className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        task.completed 
                          ? 'bg-slate-900/40 border-slate-800/60 opacity-65' 
                          : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40 hover:bg-slate-850 shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 flex-1">
                        <button
                          onClick={() => handleTaskCheck(task.id, task.completed)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-400 transition"
                          title={task.completed ? 'Mark uncompleted' : 'Mark as completed'}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-500 hover:text-indigo-400" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span 
                              className="px-2 py-0.5 text-[10px] font-bold rounded text-white"
                              style={{ backgroundColor: task.subjectColor || '#6366F1' }}
                            >
                              {task.subjectCode}
                            </span>
                            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${typeBadge.color}`}>
                              {typeBadge.label}
                            </span>
                            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border capitalize ${getSlotBadgeColor(task.timeSlot)}`}>
                              {task.timeSlot}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {task.durationMinutes} min
                            </span>
                          </div>

                          <h4 className={`text-sm font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                            {task.topicTitle}
                          </h4>

                          <p className="text-xs text-slate-400">{task.chapter}</p>

                          {task.reason && (
                            <p className="text-[11px] text-amber-300/90 font-medium flex items-center gap-1 pt-0.5">
                              <span>🤖 AI Note:</span> {task.reason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onExplainTopic(task.topicTitle, task.subjectCode)}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
                          title="Explain concept with AI"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400 inline mr-1" />
                          Explain
                        </button>

                        <button
                          onClick={() => onStartPomodoroForTask(task)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          Focus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Weak Areas Alert & Velocity Tracker */}
        <div className="space-y-6">
          
          {/* Weak Topics Diagnostic Alert */}
          <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-slate-900/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">Diagnostic Weak Spots</h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-full">
                {weakTopics.length} Areas
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Topics with quiz scores or confidence below 60%. Prioritize these to boost exam grades!
            </p>

            <div className="space-y-2.5">
              {weakTopics.slice(0, 4).map(({ subject, topic }) => (
                <div 
                  key={topic.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition space-y-2"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span 
                      className="px-1.5 py-0.5 text-[10px] font-bold rounded text-white"
                      style={{ backgroundColor: subject.color }}
                    >
                      {subject.code}
                    </span>
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      Score: {topic.quizScore !== undefined ? `${topic.quizScore}%` : `${topic.currentConfidence}%`}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-200 truncate" title={topic.title}>
                    {topic.title}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => onExplainTopic(topic.title, subject.code)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      💡 AI Breakdown
                    </button>
                    <button
                      onClick={() => onTakeQuizForTopic(subject.id, topic.id)}
                      className="px-2 py-1 text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-md border border-amber-500/30 transition"
                    >
                      Quiz Me
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Study Velocity */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-indigo-400" />
                <span>Daily Study Velocity</span>
              </h3>
              <span className="text-xs font-mono text-indigo-300 font-semibold">
                {Math.round(minutesDoneToday / 60 * 10) / 10}h / {preferences.dailyHoursWeekday}h Goal
              </span>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((minutesDoneToday / (preferences.dailyHoursWeekday * 60)) * 100))}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-400">
              Studying at a steady pace improves long-term recall by 60% compared to last-night cramming.
            </p>
          </div>

          {/* AI Quick Strategy Tip */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Exam Prep Pro Tip</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              &quot;Use the <strong>Focus Timer</strong> with Lo-Fi or Rain sounds for 45 minutes on DAA Dynamic Programming, then test yourself immediately in the <strong>Quiz</strong> tab.&quot;
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
