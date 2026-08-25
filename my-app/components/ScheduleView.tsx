'use client';

import React, { useState } from 'react';
import { 
  Subject, 
  StudyTask, 
  UserPreferences, 
  TimeSlot, 
  TaskType, 
  StudyPace 
} from '../types/study';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Printer, 
  Sparkles, 
  Zap, 
  Filter, 
  Play, 
  BookOpen,
  Info,
  CalendarDays,
  ListTodo,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScheduleViewProps {
  subjects: Subject[];
  schedule: StudyTask[];
  preferences: UserPreferences;
  onToggleTask: (taskId: string) => void;
  onRecalculateSchedule: (newPrefs: UserPreferences) => void;
  onStartPomodoroForTask: (task: StudyTask) => void;
  onExplainTopic: (topicTitle: string, subjectCode: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  subjects,
  schedule,
  preferences,
  onToggleTask,
  onRecalculateSchedule,
  onStartPomodoroForTask,
  onExplainTopic,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'full'>('daily');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [slotFilter, setSlotFilter] = useState<string>('all');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Modal State for Schedule Generation Settings
  const [tempPrefs, setTempPrefs] = useState<UserPreferences>(preferences);

  // New Custom Task form
  const [customTaskTitle, setCustomTaskTitle] = useState('');
  const [customTaskSubjectId, setCustomTaskSubjectId] = useState(subjects[0]?.id || '');
  const [customTaskDate, setCustomTaskDate] = useState(todayStr);
  const [customTaskSlot, setCustomTaskSlot] = useState<TimeSlot>('morning');
  const [customTaskDuration, setCustomTaskDuration] = useState(45);
  const [customTaskType, setCustomTaskType] = useState<TaskType>('learn');

  // Compute unique dates in schedule (next 14 days)
  const uniqueDates = Array.from(new Set(schedule.map(t => t.date))).sort();
  if (!uniqueDates.includes(todayStr)) {
    uniqueDates.unshift(todayStr);
  }

  // Filtered tasks for current selected day
  const dailyTasks = schedule.filter(t => {
    const matchDate = t.date === selectedDate;
    const matchSubject = subjectFilter === 'all' || t.subjectId === subjectFilter;
    const matchSlot = slotFilter === 'all' || t.timeSlot === slotFilter;
    return matchDate && matchSubject && matchSlot;
  });

  const handleDateShift = (direction: 'prev' | 'next') => {
    const currentIndex = uniqueDates.indexOf(selectedDate);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedDate(uniqueDates[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < uniqueDates.length - 1) {
      setSelectedDate(uniqueDates[currentIndex + 1]);
    }
  };

  const handleApplyRecalculation = () => {
    onRecalculateSchedule(tempPrefs);
    setShowConfigModal(false);
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 }
    });
  };

  const handlePrint = () => {
    window.print();
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

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Adaptive Study Schedule</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic AI schedule calibrated for your upcoming exams and daily time availability.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('daily')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'daily' ? 'bg-indigo-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              Daily View
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'weekly' ? 'bg-indigo-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              14-Day Matrix
            </button>
          </div>

          {/* Regenerate AI Schedule Button */}
          <button
            onClick={() => {
              setTempPrefs(preferences);
              setShowConfigModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            Configure & Regenerate
          </button>

          {/* Print Timetable */}
          <button
            onClick={handlePrint}
            title="Print or Save PDF timetable"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </div>

      {/* DAILY TIMELINE VIEW */}
      {viewMode === 'daily' && (
        <div className="space-y-5">
          
          {/* Date Selector Strip & Filters */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDateShift('prev')}
                disabled={uniqueDates.indexOf(selectedDate) <= 0}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedDate(todayStr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedDate === todayStr 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Today
              </button>

              {/* Quick Date Pills */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
                {uniqueDates.slice(0, 7).map(dateStr => {
                  const isSelected = selectedDate === dateStr;
                  const isToday = dateStr === todayStr;
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      {isToday ? 'Today' : formatDateDisplay(dateStr)}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handleDateShift('next')}
                disabled={uniqueDates.indexOf(selectedDate) >= uniqueDates.length - 1}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Subject & Slot Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>

              {/* Subject dropdown */}
              <select
                value={subjectFilter}
                onChange={e => setSubjectFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>

              {/* Slot dropdown */}
              <select
                value={slotFilter}
                onChange={e => setSlotFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="all">All Slots</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>

          </div>

          {/* Daily Schedule Card Container */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Schedule for {formatDateDisplay(selectedDate)}</span>
                  {selectedDate === todayStr && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Today
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {dailyTasks.length} study sessions planned ({dailyTasks.reduce((acc, t) => acc + t.durationMinutes, 0)} minutes)
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">
                  {dailyTasks.filter(t => t.completed).length} / {dailyTasks.length} Done
                </span>
              </div>
            </div>

            {/* List of Tasks for Selected Day */}
            {dailyTasks.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/30">
                <CheckCircle2 className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-60" />
                <h3 className="text-slate-200 font-bold text-base">No Sessions Scheduled For This Day</h3>
                <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                  Either all syllabus requirements for this date have been met, or adjust your study preferences using the Configure button.
                </p>
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Adjust Study Hours & Slots
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyTasks.map(task => {
                  const typeBadge = getTaskTypeBadge(task.type);

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        task.completed 
                          ? 'bg-slate-900/40 border-slate-800/60 opacity-60' 
                          : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50 shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 flex-1">
                        <button
                          onClick={() => {
                            onToggleTask(task.id);
                            if (!task.completed) {
                              confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
                            }
                          }}
                          className="mt-0.5 text-slate-400 hover:text-emerald-400 transition"
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
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-indigo-300 border border-slate-700">
                              Priority: {task.priorityScore}
                            </span>
                          </div>

                          <h3 className={`text-sm font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                            {task.topicTitle}
                          </h3>

                          <p className="text-xs text-slate-400">{task.chapter}</p>

                          {task.reason && (
                            <p className="text-[11px] text-amber-300/90 font-medium flex items-center gap-1 pt-0.5">
                              <span>🤖 AI Scheduler:</span> {task.reason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => onExplainTopic(task.topicTitle, task.subjectCode)}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400 inline mr-1" />
                          AI Notes
                        </button>
                        <button
                          onClick={() => onStartPomodoroForTask(task)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          Start Focus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

      {/* 14-DAY ROADMAP MATRIX VIEW */}
      {viewMode === 'weekly' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">14-Day Subject Distribution Matrix</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Overview of scheduled focus topics leading up to your examination milestones.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uniqueDates.map(dateStr => {
              const tasksOnDate = schedule.filter(t => t.date === dateStr);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setViewMode('daily');
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isToday
                      ? 'border-indigo-500/70 bg-indigo-950/20 hover:bg-indigo-950/30'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold ${isToday ? 'text-indigo-400' : 'text-slate-300'}`}>
                      {formatDateDisplay(dateStr)}
                    </span>
                    {isToday && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-indigo-600 text-white">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {tasksOnDate.slice(0, 3).map(t => (
                      <div
                        key={t.id}
                        className="p-1.5 rounded bg-slate-900 border border-slate-800/80 text-[11px] truncate flex items-center gap-1.5"
                      >
                        <span 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: t.subjectColor || '#6366F1' }}
                        />
                        <span className="font-bold text-slate-300">{t.subjectCode}:</span>
                        <span className="text-slate-400 truncate">{t.topicTitle}</span>
                      </div>
                    ))}

                    {tasksOnDate.length > 3 && (
                      <p className="text-[10px] text-indigo-400 font-semibold text-right pt-1">
                        +{tasksOnDate.length - 3} more sessions
                      </p>
                    )}

                    {tasksOnDate.length === 0 && (
                      <p className="text-[11px] text-slate-500 italic py-2 text-center">Rest / Free Day</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* REGENERATE AI SCHEDULE MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-5 bg-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Customize AI Study Engine</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Weekday Study Hours */}
              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>Weekday Study Hours / Day:</span>
                  <span className="text-indigo-400">{tempPrefs.dailyHoursWeekday} Hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={tempPrefs.dailyHoursWeekday}
                  onChange={e => setTempPrefs({ ...tempPrefs, dailyHoursWeekday: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              {/* Weekend Study Hours */}
              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>Weekend Study Hours / Day:</span>
                  <span className="text-purple-400">{tempPrefs.dailyHoursWeekend} Hours</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="0.5"
                  value={tempPrefs.dailyHoursWeekend}
                  onChange={e => setTempPrefs({ ...tempPrefs, dailyHoursWeekend: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Session Duration */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Session Block Duration:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 45, 60].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setTempPrefs({ ...tempPrefs, sessionDurationMinutes: mins })}
                      className={`py-2 rounded-lg font-medium border text-center transition ${
                        tempPrefs.sessionDurationMinutes === mins
                          ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              {/* Study Pace */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Study Intensity:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['relaxed', 'balanced', 'intensive'] as StudyPace[]).map(pace => (
                    <button
                      key={pace}
                      type="button"
                      onClick={() => setTempPrefs({ ...tempPrefs, studyPace: pace })}
                      className={`py-2 rounded-lg capitalize font-medium border text-center transition ${
                        tempPrefs.studyPace === pace
                          ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {pace}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spaced Repetition Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <p className="font-semibold text-slate-200">Spaced Repetition Review Cycles</p>
                  <p className="text-[11px] text-slate-400">Adds automatic Day+2 & Day+5 revision and quiz triggers</p>
                </div>
                <input
                  type="checkbox"
                  checked={tempPrefs.spacedRepetitionEnabled}
                  onChange={e => setTempPrefs({ ...tempPrefs, spacedRepetitionEnabled: e.target.checked })}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyRecalculation}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
              >
                ⚡ Recalculate AI Schedule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
