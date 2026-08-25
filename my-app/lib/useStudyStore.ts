'use client';

import { useState, useEffect, useCallback } from 'react';
import { Subject, Topic, StudyTask, UserPreferences, QuizQuestion, Flashcard, QuizResult, StudyLog, TaskType } from '../types/study';
import { SAMPLE_CSE_SUBJECTS, SAMPLE_QUIZ_QUESTIONS, SAMPLE_FLASHCARDS, DEFAULT_PREFERENCES } from '../data/csePresets';
import { generateAdaptiveSchedule, evaluateTopicPriority } from './scheduler';

const STORAGE_KEYS = {
  SUBJECTS: 'studybuddy_subjects_v1',
  SCHEDULE: 'studybuddy_schedule_v1',
  PREFERENCES: 'studybuddy_preferences_v1',
  QUIZZES: 'studybuddy_quizzes_v1',
  FLASHCARDS: 'studybuddy_flashcards_v1',
  RESULTS: 'studybuddy_results_v1',
  LOGS: 'studybuddy_logs_v1',
  STREAK: 'studybuddy_streak_v1',
};

export interface StreakData {
  count: number;
  lastDate: string; // YYYY-MM-DD
}

export function useStudyStore() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedule, setSchedule] = useState<StudyTask[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [streak, setStreak] = useState<StreakData>({ count: 1, lastDate: new Date().toISOString().split('T')[0] });

  // Initialize from LocalStorage or Presets on mount
  useEffect(() => {
    try {
      const savedSubjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      const savedSchedule = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      const savedPrefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      const savedQuizzes = localStorage.getItem(STORAGE_KEYS.QUIZZES);
      const savedCards = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
      const savedResults = localStorage.getItem(STORAGE_KEYS.RESULTS);
      const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      const savedStreak = localStorage.getItem(STORAGE_KEYS.STREAK);

      const initialPrefs = savedPrefs ? JSON.parse(savedPrefs) : DEFAULT_PREFERENCES;
      const initialSubjects = savedSubjects ? JSON.parse(savedSubjects) : SAMPLE_CSE_SUBJECTS;
      const initialQuizzes = savedQuizzes ? JSON.parse(savedQuizzes) : SAMPLE_QUIZ_QUESTIONS;
      const initialCards = savedCards ? JSON.parse(savedCards) : SAMPLE_FLASHCARDS;
      const initialResults = savedResults ? JSON.parse(savedResults) : [];
      const initialLogs = savedLogs ? JSON.parse(savedLogs) : [];

      let initialSchedule: StudyTask[] = [];
      if (savedSchedule) {
        initialSchedule = JSON.parse(savedSchedule);
      } else {
        // Generate initial schedule automatically
        initialSchedule = generateAdaptiveSchedule(initialSubjects, initialPrefs);
      }

      let streakData: StreakData = { count: 3, lastDate: new Date().toISOString().split('T')[0] };
      if (savedStreak) {
        streakData = JSON.parse(savedStreak);
      }

      setSubjects(initialSubjects);
      setSchedule(initialSchedule);
      setPreferences(initialPrefs);
      setQuizQuestions(initialQuizzes);
      setFlashcards(initialCards);
      setQuizResults(initialResults);
      setStudyLogs(initialLogs);
      setStreak(streakData);
    } catch (e) {
      console.error('Failed to load study store data from localStorage', e);
      setSubjects(SAMPLE_CSE_SUBJECTS);
      setPreferences(DEFAULT_PREFERENCES);
      setSchedule(generateAdaptiveSchedule(SAMPLE_CSE_SUBJECTS, DEFAULT_PREFERENCES));
      setQuizQuestions(SAMPLE_QUIZ_QUESTIONS);
      setFlashcards(SAMPLE_FLASHCARDS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizQuestions));
      localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(flashcards));
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(quizResults));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(studyLogs));
      localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [subjects, schedule, preferences, quizQuestions, flashcards, quizResults, studyLogs, streak, isLoaded]);

  // Recalculate schedule with current subjects and preferences
  const recalculateSchedule = useCallback((customPrefs?: UserPreferences) => {
    const activePrefs = customPrefs || preferences;
    if (customPrefs) {
      setPreferences(customPrefs);
    }
    const newSchedule = generateAdaptiveSchedule(subjects, activePrefs, schedule);
    setSchedule(newSchedule);
    return newSchedule;
  }, [subjects, preferences, schedule]);

  // Update a subject
  const updateSubject = useCallback((subjectId: string, updates: Partial<Subject>) => {
    setSubjects(prev => {
      const updated = prev.map(s => s.id === subjectId ? { ...s, ...updates } : s);
      // Auto-recalculate schedule after subject update
      setTimeout(() => {
        const newSched = generateAdaptiveSchedule(updated, preferences, schedule);
        setSchedule(newSched);
      }, 0);
      return updated;
    });
  }, [preferences, schedule]);

  // Add new subject
  const addSubject = useCallback((newSubject: Subject) => {
    setSubjects(prev => {
      const updated = [...prev, newSubject];
      setTimeout(() => {
        const newSched = generateAdaptiveSchedule(updated, preferences, schedule);
        setSchedule(newSched);
      }, 0);
      return updated;
    });
  }, [preferences, schedule]);

  // Delete subject
  const deleteSubject = useCallback((subjectId: string) => {
    setSubjects(prev => {
      const updated = prev.filter(s => s.id !== subjectId);
      setTimeout(() => {
        const newSched = generateAdaptiveSchedule(updated, preferences, schedule);
        setSchedule(newSched);
      }, 0);
      return updated;
    });
  }, [preferences, schedule]);

  // Update a topic (e.g. confidence slider, notes, completion)
  const updateTopic = useCallback((subjectId: string, topicId: string, updates: Partial<Topic>) => {
    setSubjects(prev => {
      const updated = prev.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.map(t => (t.id === topicId ? { ...t, ...updates } : t))
        };
      });

      setTimeout(() => {
        const newSched = generateAdaptiveSchedule(updated, preferences, schedule);
        setSchedule(newSched);
      }, 0);

      return updated;
    });
  }, [preferences, schedule]);

  // Add a topic to a subject
  const addTopic = useCallback((subjectId: string, newTopic: Topic) => {
    setSubjects(prev => {
      const updated = prev.map(s => {
        if (s.id !== subjectId) return s;
        return { ...s, topics: [...s.topics, newTopic] };
      });
      setTimeout(() => {
        const newSched = generateAdaptiveSchedule(updated, preferences, schedule);
        setSchedule(newSched);
      }, 0);
      return updated;
    });
  }, [preferences, schedule]);

  // Delete a topic
  const deleteTopic = useCallback((subjectId: string, topicId: string) => {
    setSubjects(prev => {
      const updated = prev.map(s => {
        if (s.id !== subjectId) return s;
        return { ...s, topics: s.topics.filter(t => t.id !== topicId) };
      });
      setTimeout(() => {
        const newSched = generateAdaptiveSchedule(updated, preferences, schedule);
        setSchedule(newSched);
      }, 0);
      return updated;
    });
  }, [preferences, schedule]);

  // Toggle task completion
  const toggleTaskComplete = useCallback((taskId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    setSchedule(prev => {
      return prev.map(task => {
        if (task.id === taskId) {
          const isNowCompleted = !task.completed;
          
          // If task completed, update streak & study log
          if (isNowCompleted) {
            setStreak(prevStreak => {
              if (prevStreak.lastDate === todayStr) {
                return prevStreak;
              }
              return { count: prevStreak.count + 1, lastDate: todayStr };
            });

            // Add study log entry
            setStudyLogs(prevLogs => [
              ...prevLogs,
              {
                id: `log-${Date.now()}`,
                date: todayStr,
                subjectId: task.subjectId,
                topicId: task.topicId,
                minutesSpent: task.durationMinutes,
                timestamp: new Date().toISOString(),
                taskType: task.type
              }
            ]);
          }

          return {
            ...task,
            completed: isNowCompleted,
            completedAt: isNowCompleted ? new Date().toISOString() : undefined
          };
        }
        return task;
      });
    });
  }, []);

  // Record a Quiz Result & Dynamically Calibrate Schedule
  const recordQuizResult = useCallback((result: QuizResult) => {
    setQuizResults(prev => [result, ...prev]);

    // Update topic quiz score & confidence in subject state
    setSubjects(prev => {
      const updated = prev.map(s => {
        if (s.id !== result.subjectId) return s;
        return {
          ...s,
          topics: s.topics.map(t => {
            if (t.id !== result.topicId) return t;
            // Adjust confidence based on quiz result
            const newConfidence = Math.round((t.currentConfidence * 0.4) + (result.score * 0.6));
            return {
              ...t,
              quizScore: result.score,
              currentConfidence: newConfidence,
              lastStudied: new Date().toISOString()
            };
          })
        };
      });

      // Recalculate schedule with boosted priority for weak scores
      setTimeout(() => {
        const newSched = generateAdaptiveSchedule(updated, preferences, schedule);
        setSchedule(newSched);
      }, 0);

      return updated;
    });
  }, [preferences, schedule]);

  // Log completed focus/Pomodoro time
  const logStudySession = useCallback((subjectId: string, topicId: string | undefined, minutes: number, taskType: TaskType = 'learn') => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    setStudyLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}`,
        date: todayStr,
        subjectId,
        topicId,
        minutesSpent: minutes,
        timestamp: new Date().toISOString(),
        taskType
      }
    ]);

    // Update streak if not logged today yet
    setStreak(prev => {
      if (prev.lastDate === todayStr) return prev;
      return { count: prev.count + 1, lastDate: todayStr };
    });
  }, []);

  // Flashcard mastered toggle
  const toggleFlashcardMastered = useCallback((cardId: string) => {
    setFlashcards(prev => prev.map(c => c.id === cardId ? { ...c, mastered: !c.mastered } : c));
  }, []);

  // Reset to default sample CSE presets
  const loadCSEPresets = useCallback(() => {
    setSubjects(SAMPLE_CSE_SUBJECTS);
    setPreferences(DEFAULT_PREFERENCES);
    setQuizQuestions(SAMPLE_QUIZ_QUESTIONS);
    setFlashcards(SAMPLE_FLASHCARDS);
    setQuizResults([]);
    setStudyLogs([]);
    const freshSchedule = generateAdaptiveSchedule(SAMPLE_CSE_SUBJECTS, DEFAULT_PREFERENCES);
    setSchedule(freshSchedule);
    setStreak({ count: 3, lastDate: new Date().toISOString().split('T')[0] });
  }, []);

  // Clear all data
  const resetAllData = useCallback(() => {
    setSubjects([]);
    setSchedule([]);
    setQuizResults([]);
    setStudyLogs([]);
    setStreak({ count: 0, lastDate: '' });
  }, []);

  // Export JSON backup
  const exportDataJSON = useCallback(() => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      subjects,
      schedule,
      preferences,
      quizResults,
      studyLogs,
      streak
    };
    return JSON.stringify(backupData, null, 2);
  }, [subjects, schedule, preferences, quizResults, studyLogs, streak]);

  // Import JSON backup
  const importDataJSON = useCallback((jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.subjects && Array.isArray(data.subjects)) {
        setSubjects(data.subjects);
        if (data.preferences) setPreferences(data.preferences);
        if (data.schedule) setSchedule(data.schedule);
        if (data.quizResults) setQuizResults(data.quizResults);
        if (data.studyLogs) setStudyLogs(data.studyLogs);
        if (data.streak) setStreak(data.streak);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return {
    isLoaded,
    subjects,
    schedule,
    preferences,
    quizQuestions,
    flashcards,
    quizResults,
    studyLogs,
    streak,
    // Actions
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
    setPreferences,
    setQuizQuestions
  };
}
