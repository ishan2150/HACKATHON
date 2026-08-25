export type Difficulty = 'easy' | 'medium' | 'hard' | 'very_hard';
export type Weightage = 'low' | 'medium' | 'high' | 'critical';
export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';
export type TaskType = 'learn' | 'revision' | 'practice_quiz' | 'cheat_sheet' | 'practice_problems';
export type StudyPace = 'relaxed' | 'balanced' | 'intensive';

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  chapter: string;
  difficulty: Difficulty;
  weightage: Weightage;
  currentConfidence: number; // 0 to 100
  estimatedHours: number;
  completed: boolean;
  quizScore?: number; // 0 to 100
  lastStudied?: string; // ISO date string
  revisionDueDate?: string;
  notes?: string;
  keyFormulas?: string[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  color: string; // hex or tailwind color class
  examDate: string; // YYYY-MM-DD
  targetGrade?: string; // e.g. "A+", "9.0 CGPA"
  creditHours: number;
  topics: Topic[];
}

export interface StudyTask {
  id: string;
  date: string; // YYYY-MM-DD
  subjectId: string;
  topicId: string;
  subjectCode: string;
  subjectName: string;
  subjectColor: string;
  topicTitle: string;
  chapter: string;
  durationMinutes: number;
  timeSlot: TimeSlot;
  type: TaskType;
  priorityScore: number; // 0 - 100
  completed: boolean;
  completedAt?: string;
  reason?: string; // Why AI scheduled this (e.g. "Weak Topic (Quiz 45%)", "Exam in 4 days")
}

export interface QuizQuestion {
  id: string;
  subjectId: string;
  topicId: string;
  topicTitle?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: Difficulty;
  codeSnippet?: string;
}

export interface Flashcard {
  id: string;
  subjectId: string;
  topicId: string;
  topicTitle?: string;
  front: string;
  back: string;
  mastered: boolean;
  tags?: string[];
}

export interface UserPreferences {
  dailyHoursWeekday: number;
  dailyHoursWeekend: number;
  preferredSlots: TimeSlot[];
  studyPace: StudyPace;
  spacedRepetitionEnabled: boolean;
  sessionDurationMinutes: number;
  breakDurationMinutes: number;
  targetExamReadyDaysBefore: number; // e.g. finish syllabus 3 days before exam
}

export interface StudyLog {
  id: string;
  date: string; // YYYY-MM-DD
  subjectId: string;
  topicId?: string;
  minutesSpent: number;
  timestamp: string;
  taskType: TaskType;
}

export interface QuizResult {
  id: string;
  subjectId: string;
  topicId: string;
  topicTitle: string;
  score: number; // 0 - 100
  totalQuestions: number;
  correctAnswers: number;
  timestamp: string;
  answers: { questionId: string; selectedIndex: number; isCorrect: boolean }[];
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  topicContext?: string;
  type?: 'general' | 'explanation' | 'cheatsheet' | 'viva';
}
