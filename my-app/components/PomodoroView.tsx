'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StudyTask, Subject, TaskType } from '../types/study';
import { soundEngine } from '../lib/audio';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Flame, 
  CloudRain, 
  Radio, 
  Music 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PomodoroViewProps {
  schedule: StudyTask[];
  subjects: Subject[];
  activeTask?: StudyTask | null;
  onLogStudySession: (subjectId: string, topicId: string | undefined, minutes: number, taskType: TaskType) => void;
  onToggleTaskComplete: (taskId: string) => void;
}

export const PomodoroView: React.FC<PomodoroViewProps> = ({
  schedule,
  subjects,
  activeTask: initialActiveTask,
  onLogStudySession,
  onToggleTaskComplete,
}) => {
  const [timerMode, setTimerMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [customFocusMinutes, setCustomFocusMinutes] = useState(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialActiveTask?.id || '');
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'lofi' | 'white'>('none');
  const [volume, setVolume] = useState(0.7);
  const [isZenMode, setIsZenMode] = useState(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeTask = schedule.find(t => t.id === selectedTaskId) || initialActiveTask;

  // Set total duration based on mode
  const getTotalSeconds = () => {
    switch (timerMode) {
      case 'focus': return customFocusMinutes * 60;
      case 'short_break': return 5 * 60;
      case 'long_break': return 15 * 60;
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timerMode, customFocusMinutes]);

  // Ambient sound management
  useEffect(() => {
    if (!soundEngine) return;
    
    soundEngine.setVolume(volume);

    if (isRunning && ambientSound !== 'none') {
      if (ambientSound === 'rain') soundEngine.startRain();
      else if (ambientSound === 'lofi') soundEngine.startLofiPad();
      else if (ambientSound === 'white') soundEngine.startWhiteNoise();
    } else {
      soundEngine.stopAmbient();
    }

    return () => {
      if (soundEngine) soundEngine.stopAmbient();
    };
  }, [isRunning, ambientSound, volume]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    
    // Play completion chime
    if (soundEngine) {
      soundEngine.playCompletionChime();
    }

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (timerMode === 'focus') {
      setCompletedSessionsCount(prev => prev + 1);
      
      // Log session
      if (activeTask) {
        onLogStudySession(activeTask.subjectId, activeTask.topicId, customFocusMinutes, activeTask.type);
        onToggleTaskComplete(activeTask.id);
      } else if (subjects[0]) {
        onLogStudySession(subjects[0].id, undefined, customFocusMinutes, 'learn');
      }

      // Auto switch to break
      setTimerMode('short_break');
      setTimeLeftSeconds(5 * 60);
    } else {
      setTimerMode('focus');
      setTimeLeftSeconds(customFocusMinutes * 60);
    }
  };

  const handleSwitchMode = (mode: 'focus' | 'short_break' | 'long_break', mins: number = 25) => {
    setIsRunning(false);
    setTimerMode(mode);
    if (mode === 'focus') {
      setCustomFocusMinutes(mins);
      setTimeLeftSeconds(mins * 60);
    } else if (mode === 'short_break') {
      setTimeLeftSeconds(5 * 60);
    } else {
      setTimeLeftSeconds(15 * 60);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeftSeconds(getTotalSeconds());
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const totalSecs = getTotalSeconds();
  const progressPercent = totalSecs > 0 ? ((totalSecs - timeLeftSeconds) / totalSecs) * 100 : 0;
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  return (
    <div className={`space-y-6 animate-fadeIn ${isZenMode ? 'fixed inset-0 z-50 bg-[#0B0F19] p-8 overflow-y-auto flex flex-col justify-center' : ''}`}>
      
      {/* Top Header */}
      {!isZenMode && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Focus Mode & Pomodoro</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deep work intervals with ambient audio soundscapes to eliminate distractions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{completedSessionsCount} Focus Blocks Completed</span>
            </span>
          </div>
        </div>
      )}

      {/* Main Pomodoro Container */}
      <div className="glass-panel p-6 sm:p-10 rounded-2xl border border-slate-800 shadow-2xl max-w-xl mx-auto space-y-8 text-center relative">
        
        {/* Zen Mode Button */}
        <button
          onClick={() => setIsZenMode(!isZenMode)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          title={isZenMode ? 'Exit Zen Mode' : 'Enter Fullscreen Zen Mode'}
        >
          {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Mode Selector Tabs */}
        <div className="inline-flex items-center bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => handleSwitchMode('focus', 25)}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
              timerMode === 'focus' && customFocusMinutes === 25 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            25m Focus
          </button>
          <button
            onClick={() => handleSwitchMode('focus', 50)}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
              timerMode === 'focus' && customFocusMinutes === 50 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            50m Deep Focus
          </button>
          <button
            onClick={() => handleSwitchMode('short_break')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
              timerMode === 'short_break' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            5m Break
          </button>
          <button
            onClick={() => handleSwitchMode('long_break')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
              timerMode === 'long_break' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            15m Break
          </button>
        </div>

        {/* Big Circular Progress Timer */}
        <div className="relative flex items-center justify-center w-64 h-64 mx-auto">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className="text-slate-800"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className={`transition-all duration-1000 ease-linear ${
                timerMode === 'focus' ? 'text-indigo-500' : 'text-emerald-400'
              }`}
              strokeWidth="6"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Clock Display */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
              {formatTime(timeLeftSeconds)}
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
              {timerMode === 'focus' ? '🎯 Stay Focused' : '☕ Relax & Recharge'}
            </span>
          </div>
        </div>

        {/* Task Association Badge */}
        {activeTask && (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs inline-flex items-center gap-2 max-w-md mx-auto truncate">
            <span 
              className="px-2 py-0.5 text-[10px] font-bold rounded text-white"
              style={{ backgroundColor: activeTask.subjectColor || '#6366F1' }}
            >
              {activeTask.subjectCode}
            </span>
            <span className="font-semibold text-slate-200 truncate">{activeTask.topicTitle}</span>
          </div>
        )}

        {/* Timer Play / Pause Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700 transition"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2 transition ${
              isRunning
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Start Session</span>
              </>
            )}
          </button>
        </div>

        {/* Ambient Soundscape Controller */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <span className="text-xs font-semibold text-slate-400 block">Ambient Focus Soundscape (Web Audio):</span>
          
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <button
              onClick={() => setAmbientSound('none')}
              className={`px-3 py-1.5 rounded-lg border transition ${
                ambientSound === 'none' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              Off
            </button>
            <button
              onClick={() => setAmbientSound('rain')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                ambientSound === 'rain' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" /> Gentle Rain
            </button>
            <button
              onClick={() => setAmbientSound('lofi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                ambientSound === 'lofi' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Music className="w-3.5 h-3.5" /> Lo-Fi Synth
            </button>
            <button
              onClick={() => setAmbientSound('white')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                ambientSound === 'white' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5" /> White Noise
            </button>
          </div>

          {ambientSound !== 'none' && (
            <div className="flex items-center justify-center gap-2 max-w-xs mx-auto pt-2">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
