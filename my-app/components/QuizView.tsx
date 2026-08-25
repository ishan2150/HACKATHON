'use client';

import React, { useState } from 'react';
import { 
  Subject, 
  QuizQuestion, 
  Flashcard, 
  QuizResult 
} from '../types/study';
import { 
  GraduationCap, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  Award, 
  Brain, 
  Plus, 
  HelpCircle,
  Zap,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizViewProps {
  subjects: Subject[];
  quizQuestions: QuizQuestion[];
  flashcards: Flashcard[];
  onRecordQuizResult: (result: QuizResult) => void;
  onToggleFlashcardMastered: (cardId: string) => void;
  onExplainTopic: (topicTitle: string, subjectCode: string) => void;
  initialSubjectId?: string;
  initialTopicId?: string;
}

export const QuizView: React.FC<QuizViewProps> = ({
  subjects,
  quizQuestions,
  flashcards,
  onRecordQuizResult,
  onToggleFlashcardMastered,
  onExplainTopic,
  initialSubjectId,
  initialTopicId,
}) => {
  const [activeMode, setActiveMode] = useState<'quiz' | 'flashcards'>('quiz');
  
  // Quiz State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId || subjects[0]?.id || '');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId || 'all');
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScoreCount, setQuizScoreCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ questionId: string; selectedIndex: number; isCorrect: boolean }[]>([]);

  // Flashcards State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Available questions based on selection
  const activeQuestions = quizQuestions.filter(q => {
    const matchSubj = selectedSubjectId === 'all' || q.subjectId === selectedSubjectId;
    const matchTopic = selectedTopicId === 'all' || q.topicId === selectedTopicId;
    return matchSubj && matchTopic;
  });

  // Current question object
  const currentQ = activeQuestions[currentQuestionIndex];

  // Available flashcards based on subject filter
  const activeCards = flashcards.filter(c => {
    return selectedSubjectId === 'all' || c.subjectId === selectedSubjectId;
  });
  const currentCard = activeCards[currentCardIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQ) return;
    
    const isCorrect = selectedOption === currentQ.correctIndex;
    if (isCorrect) {
      setQuizScoreCount(prev => prev + 1);
    }

    setUserAnswers(prev => [
      ...prev,
      { questionId: currentQ.id, selectedIndex: selectedOption, isCorrect }
    ]);
    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Finished quiz!
      const total = activeQuestions.length;
      const finalScorePct = total > 0 ? Math.round(((quizScoreCount + (selectedOption === currentQ.correctIndex ? 0 : 0)) / total) * 100) : 0;
      
      const currentSubject = subjects.find(s => s.id === selectedSubjectId);
      const currentTopic = currentSubject?.topics.find(t => t.id === selectedTopicId);

      const result: QuizResult = {
        id: `res-${Date.now()}`,
        subjectId: selectedSubjectId,
        topicId: selectedTopicId === 'all' ? (currentSubject?.topics[0]?.id || '') : selectedTopicId,
        topicTitle: currentTopic?.title || currentSubject?.name || 'CSE Review',
        score: finalScorePct,
        totalQuestions: total,
        correctAnswers: quizScoreCount,
        timestamp: new Date().toISOString(),
        answers: userAnswers
      };

      onRecordQuizResult(result);
      setQuizFinished(true);

      if (finalScorePct >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScoreCount(0);
    setQuizFinished(false);
    setUserAnswers([]);
  };

  const selectedSubjectObj = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header & Mode Switcher */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Active Recall & Diagnostic Hub</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Test topic mastery to automatically calibrate and prioritize your AI study schedule.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => {
              setActiveMode('quiz');
              handleRestartQuiz();
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold transition ${
              activeMode === 'quiz' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            Diagnostic MCQ Quiz
          </button>
          <button
            onClick={() => {
              setActiveMode('flashcards');
              setIsCardFlipped(false);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold transition ${
              activeMode === 'flashcards' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            3D Flashcards Deck
          </button>
        </div>
      </div>

      {/* Subject / Topic Filters */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Select Course:</label>
          <select
            value={selectedSubjectId}
            onChange={e => {
              setSelectedSubjectId(e.target.value);
              setSelectedTopicId('all');
              handleRestartQuiz();
              setCurrentCardIndex(0);
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>
        </div>

        {activeMode === 'quiz' && selectedSubjectObj && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Select Chapter / Topic:</label>
            <select
              value={selectedTopicId}
              onChange={e => {
                setSelectedTopicId(e.target.value);
                handleRestartQuiz();
              }}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Topics (Comprehensive Test)</option>
              {selectedSubjectObj.topics.map(t => (
                <option key={t.id} value={t.id}>{t.chapter}: {t.title}</option>
              ))}
            </select>
          </div>
        )}

        <div className="ml-auto text-xs text-slate-400 self-end pb-1.5">
          {activeMode === 'quiz' 
            ? `${activeQuestions.length} Questions Available` 
            : `${activeCards.length} Flashcards in Deck`}
        </div>
      </div>

      {/* QUIZ MODE */}
      {activeMode === 'quiz' && (
        <div>
          {quizFinished ? (
            /* Quiz Score Summary Screen */
            <div className="glass-panel p-8 rounded-2xl border border-indigo-500/30 text-center space-y-6 max-w-xl mx-auto animate-fadeIn bg-gradient-to-b from-indigo-950/30 to-slate-900">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Diagnostic Test Complete!</h2>
                <p className="text-sm text-slate-300">
                  You scored <strong className="text-indigo-400 font-bold text-lg">{quizScoreCount}</strong> out of <strong className="text-white">{activeQuestions.length}</strong> ({Math.round((quizScoreCount / activeQuestions.length) * 100)}%)
                </p>
              </div>

              {/* Dynamic Schedule Recalibration Notice */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>AI Schedule Recalibration Impact:</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {Math.round((quizScoreCount / activeQuestions.length) * 100) < 60 ? (
                    <>⚠️ Your score indicates this topic requires reinforcement. StudyBuddy has <strong>boosted its priority in your schedule</strong> and added extra review blocks before your exam!</>
                  ) : (
                    <>✅ Great mastery! StudyBuddy has adjusted this topic to <strong>maintenance review</strong>, freeing up study hours for your more urgent subjects.</>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestartQuiz}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
                >
                  <RotateCw className="w-4 h-4" />
                  Retake Test
                </button>
                <button
                  onClick={() => {
                    const top = selectedSubjectObj?.topics.find(t => t.id === selectedTopicId) || selectedSubjectObj?.topics[0];
                    if (top) onExplainTopic(top.title, selectedSubjectObj?.code || 'CSE');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  Review Notes with AI Copilot
                </button>
              </div>
            </div>
          ) : activeQuestions.length === 0 ? (
            /* No questions state */
            <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
              <HelpCircle className="w-12 h-12 text-slate-500 mx-auto opacity-70" />
              <h3 className="text-base font-bold text-white">No Diagnostic Questions Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select another subject or topic above, or ask the AI Copilot to generate new practice questions for this syllabus area!
              </p>
            </div>
          ) : (
            /* Active MCQ Question Card */
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 max-w-3xl mx-auto shadow-2xl">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-extrabold bg-indigo-600 text-white rounded-md">
                    Question {currentQuestionIndex + 1} / {activeQuestions.length}
                  </span>
                  {currentQ.topicTitle && (
                    <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
                      • {currentQ.topicTitle}
                    </span>
                  )}
                </div>

                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border bg-slate-800 text-slate-300 border-slate-700">
                  {currentQ.difficulty}
                </span>
              </div>

              {/* Question Text */}
              <div className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {currentQ.question}
                </h2>

                {currentQ.codeSnippet && (
                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
                    <code>{currentQ.codeSnippet}</code>
                  </pre>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  
                  let optionClass = 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-indigo-500/50 hover:bg-slate-850';
                  
                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionClass = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      optionClass = 'bg-rose-950/40 border-rose-500 text-rose-200';
                    } else {
                      optionClass = 'bg-slate-900/40 border-slate-800 text-slate-500';
                    }
                  } else if (isSelected) {
                    optionClass = 'bg-indigo-950/40 border-indigo-500 text-indigo-200 font-semibold shadow-sm';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between gap-3 text-xs sm:text-sm ${optionClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300 flex-shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Detailed Explanation Box after submission */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 animate-fadeIn text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Explanation & Exam Insight:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Bottom Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  Current Score: {quizScoreCount} / {isAnswerSubmitted ? currentQuestionIndex + 1 : currentQuestionIndex}
                </span>

                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md transition"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition"
                  >
                    <span>{currentQuestionIndex === activeQuestions.length - 1 ? 'Finish Test' : 'Next Question'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3D FLASHCARDS DECK MODE */}
      {activeMode === 'flashcards' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {activeCards.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
              <Layers className="w-12 h-12 text-slate-500 mx-auto opacity-70" />
              <h3 className="text-base font-bold text-white">No Flashcards in this Course Deck</h3>
              <p className="text-xs text-slate-400">Select another subject above to practice active recall flashcards.</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Card Indicator Bar */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                <span>Card {currentCardIndex + 1} of {activeCards.length}</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {activeCards.filter(c => c.mastered).length} Mastered
                </span>
              </div>

              {/* 3D Flip Card Container */}
              <div 
                className="perspective-1000 min-h-[300px] cursor-pointer"
                onClick={() => setIsCardFlipped(!isCardFlipped)}
              >
                <div 
                  className={`relative w-full h-full min-h-[300px] rounded-2xl transition-transform duration-500 transform-style-3d ${
                    isCardFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* FRONT SIDE */}
                  <div className="absolute inset-0 w-full h-full glass-panel p-8 rounded-2xl border border-slate-700 backface-hidden flex flex-col justify-between shadow-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {currentCard.topicTitle || 'CSE Flashcard'}
                        </span>
                        {currentCard.mastered && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Mastered
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mt-8 leading-relaxed">
                        {currentCard.front}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800">
                      <span className="flex items-center gap-1 text-indigo-400">
                        <RotateCw className="w-3.5 h-3.5" /> Click anywhere to flip & see answer
                      </span>
                      <span className="text-slate-500">Front</span>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div className="absolute inset-0 w-full h-full glass-panel p-8 rounded-2xl border border-indigo-500/40 backface-hidden rotate-y-180 flex flex-col justify-between shadow-2xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-purple-950/60">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Answer & Key Points
                        </span>
                      </div>
                      <div className="text-sm sm:text-base text-slate-200 mt-6 leading-relaxed whitespace-pre-line font-mono">
                        {currentCard.back}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800">
                      <span className="flex items-center gap-1 text-indigo-400">
                        <RotateCw className="w-3.5 h-3.5" /> Click to flip back
                      </span>
                      <span className="text-slate-500">Back</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flashcard Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setIsCardFlipped(false);
                    setCurrentCardIndex(prev => Math.max(0, prev - 1));
                  }}
                  disabled={currentCardIndex === 0}
                  className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (currentCard) onToggleFlashcardMastered(currentCard.id);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition ${
                      currentCard?.mastered
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 hover:text-emerald-300 border-slate-700'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    {currentCard?.mastered ? 'Mastered' : 'Mark Mastered'}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsCardFlipped(false);
                    setCurrentCardIndex(prev => Math.min(activeCards.length - 1, prev + 1));
                  }}
                  disabled={currentCardIndex === activeCards.length - 1}
                  className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
};
