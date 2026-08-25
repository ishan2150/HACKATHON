'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BookOpen, 
  GraduationCap, 
  Bot, 
  Timer, 
  BarChart3, 
  Flame, 
  Sparkles,
  Download,
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'schedule' | 'subjects' | 'quiz' | 'copilot' | 'pomodoro' | 'analytics';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  streakCount: number;
  onLoadPresets: () => void;
  onExportData: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  streakCount,
  onLoadPresets,
  onExportData,
  onResetData,
}) => {
  const [isDark, setIsDark] = React.useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (document.documentElement.classList.contains('light')) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule' as ActiveTab, label: 'AI Schedule', icon: CalendarDays },
    { id: 'subjects' as ActiveTab, label: 'Syllabus', icon: BookOpen },
    { id: 'quiz' as ActiveTab, label: 'Quiz & Flashcards', icon: GraduationCap },
    { id: 'copilot' as ActiveTab, label: 'AI Copilot', icon: Bot },
    { id: 'pomodoro' as ActiveTab, label: 'Focus Timer', icon: Timer },
    { id: 'analytics' as ActiveTab, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                  StudyBuddy
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
                  AI v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Personal Adaptive Exam Planner</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-2.5">
            {/* Streak Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold shadow-sm">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
              <span>{streakCount} Day Streak</span>
            </div>

            {/* 1-Click Load CSE Syllabus Preset */}
            <button
              onClick={onLoadPresets}
              title="Reset or load 2nd-Year BTech CSE courses"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>CSE Preset</span>
            </button>

            {/* Export backup */}
            <button
              onClick={onExportData}
              title="Export study plan JSON backup"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg border border-transparent hover:border-slate-700 transition"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle Dark/Light Mode"
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-lg border border-transparent hover:border-slate-700 transition"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Tabs */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 bg-slate-900/90 border-t border-slate-800/60 scrollbar-none gap-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
