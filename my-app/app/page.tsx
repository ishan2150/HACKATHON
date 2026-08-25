'use client';

import React, { useState } from 'react';
import { useStudyStore } from '../lib/useStudyStore';
import { Navbar, ActiveTab } from '../components/Navbar';
import { DashboardView } from '../components/DashboardView';
import { ScheduleView } from '../components/ScheduleView';
import { SubjectsView } from '../components/SubjectsView';
import { QuizView } from '../components/QuizView';
import { AiCopilotView } from '../components/AiCopilotView';
import { PomodoroView } from '../components/PomodoroView';
import { AnalyticsView } from '../components/AnalyticsView';
import { StudyTask } from '../types/study';
import { Sparkles, GraduationCap, BookOpen, Layers, Bot, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Cross-component transition state
  const [selectedTaskForPomodoro, setSelectedTaskForPomodoro] = useState<StudyTask | null>(null);
  const [quizTargetSubjectId, setQuizTargetSubjectId] = useState<string | undefined>();
  const [quizTargetTopicId, setQuizTargetTopicId] = useState<string | undefined>();
  const [explainerTargetTopic, setExplainerTargetTopic] = useState<string | undefined>();
  const [explainerTargetSubjectCode, setExplainerTargetSubjectCode] = useState<string | undefined>();

  const {
    isLoaded,
    subjects,
    schedule,
    preferences,
    quizQuestions,
    flashcards,
    quizResults,
    studyLogs,
    streak,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    deleteTopic,
    recalculateSchedule,
    toggleTaskComplete,
    recordQuizResult,
    logStudySession,
    toggleFlashcardMastered,
    loadCSEPresets,
    resetAllData,
    exportDataJSON,
    importDataJSON,
  } = useStudyStore();

  // Cross-Tab Navigation Handlers
  const handleStartPomodoroForTask = (task: StudyTask) => {
    setSelectedTaskForPomodoro(task);
    setActiveTab('pomodoro');
  };

  const handleTakeQuizForTopic = (subjectId: string, topicId: string) => {
    setQuizTargetSubjectId(subjectId);
    setQuizTargetTopicId(topicId);
    setActiveTab('quiz');
  };

  const handleExplainTopic = (topicTitle: string, subjectCode: string) => {
    setExplainerTargetTopic(topicTitle);
    setExplainerTargetSubjectCode(subjectCode);
    setActiveTab('copilot');
  };

  const handleExportData = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studybuddy-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadPresets = () => {
    if (confirm('Load sample 2nd-Year BTech CSE course data (OS, DBMS, DAA, CN, TOC)?')) {
      loadCSEPresets();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center animate-bounce">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-semibold text-slate-300">Loading StudyBuddy AI Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streakCount={streak.count}
        onLoadPresets={handleLoadPresets}
        onExportData={handleExportData}
        onResetData={resetAllData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            subjects={subjects}
            schedule={schedule}
            preferences={preferences}
            onToggleTask={toggleTaskComplete}
            onNavigateTab={setActiveTab}
            onStartPomodoroForTask={handleStartPomodoroForTask}
            onTakeQuizForTopic={handleTakeQuizForTopic}
            onExplainTopic={handleExplainTopic}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            subjects={subjects}
            schedule={schedule}
            preferences={preferences}
            onToggleTask={toggleTaskComplete}
            onRecalculateSchedule={recalculateSchedule}
            onStartPomodoroForTask={handleStartPomodoroForTask}
            onExplainTopic={handleExplainTopic}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectsView
            subjects={subjects}
            onAddSubject={addSubject}
            onUpdateSubject={updateSubject}
            onDeleteSubject={deleteSubject}
            onAddTopic={addTopic}
            onUpdateTopic={updateTopic}
            onDeleteTopic={deleteTopic}
            onTakeQuiz={handleTakeQuizForTopic}
            onExplainTopic={handleExplainTopic}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            subjects={subjects}
            quizQuestions={quizQuestions}
            flashcards={flashcards}
            onRecordQuizResult={recordQuizResult}
            onToggleFlashcardMastered={toggleFlashcardMastered}
            onExplainTopic={handleExplainTopic}
            initialSubjectId={quizTargetSubjectId}
            initialTopicId={quizTargetTopicId}
          />
        )}

        {activeTab === 'copilot' && (
          <AiCopilotView
            subjects={subjects}
            initialTopicTitle={explainerTargetTopic}
            initialSubjectCode={explainerTargetSubjectCode}
          />
        )}

        {activeTab === 'pomodoro' && (
          <PomodoroView
            schedule={schedule}
            subjects={subjects}
            activeTask={selectedTaskForPomodoro}
            onLogStudySession={logStudySession}
            onToggleTaskComplete={toggleTaskComplete}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            subjects={subjects}
            studyLogs={studyLogs}
            quizResults={quizResults}
            streakCount={streak.count}
            onExportData={handleExportData}
            onImportData={importDataJSON}
            onExplainTopic={handleExplainTopic}
            onTakeQuiz={handleTakeQuizForTopic}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="glass-nav border-t border-slate-800/80 mt-16 py-8 text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white">StudyBuddy</span>
            <span>— AI-Powered Study Planner for College Students</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <span>2nd-Year BTech CSE Project</span>
            <span>•</span>
            <span>Next.js 16 + React 19 + Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
