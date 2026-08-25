'use client';

import React, { useState } from 'react';
import { Subject, Topic, Difficulty, Weightage } from '../types/study';
import { getDaysDifference } from '../lib/scheduler';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  Award, 
  HelpCircle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubjectsViewProps {
  subjects: Subject[];
  onAddSubject: (subject: Subject) => void;
  onUpdateSubject: (subjectId: string, updates: Partial<Subject>) => void;
  onDeleteSubject: (subjectId: string) => void;
  onAddTopic: (subjectId: string, topic: Topic) => void;
  onUpdateTopic: (subjectId: string, topicId: string, updates: Partial<Topic>) => void;
  onDeleteTopic: (subjectId: string, topicId: string) => void;
  onTakeQuiz: (subjectId: string, topicId: string) => void;
  onExplainTopic: (topicTitle: string, subjectCode: string) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onAddTopic,
  onUpdateTopic,
  onDeleteTopic,
  onTakeQuiz,
  onExplainTopic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState<{ [id: string]: boolean }>(
    subjects.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );

  // Modals
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [activeSubjectForTopic, setActiveSubjectForTopic] = useState<string>('');

  // New Subject Form
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjColor, setNewSubjColor] = useState('#6366F1');
  const [newSubjExamDate, setNewSubjExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });
  const [newSubjCredits, setNewSubjCredits] = useState(4);
  const [newSubjTargetGrade, setNewSubjTargetGrade] = useState('A+ (90%+)');

  // New Topic Form
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicChapter, setNewTopicChapter] = useState('Unit 1');
  const [newTopicDifficulty, setNewTopicDifficulty] = useState<Difficulty>('medium');
  const [newTopicWeightage, setNewTopicWeightage] = useState<Weightage>('high');
  const [newTopicConfidence, setNewTopicConfidence] = useState(50);
  const [newTopicHours, setNewTopicHours] = useState(2.5);
  const [newTopicNotes, setNewTopicNotes] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjCode || !newSubjName) return;

    const newSubj: Subject = {
      id: `subj-${Date.now()}`,
      code: newSubjCode.toUpperCase(),
      name: newSubjName,
      color: newSubjColor,
      examDate: newSubjExamDate,
      creditHours: newSubjCredits,
      targetGrade: newSubjTargetGrade,
      topics: []
    };

    onAddSubject(newSubj);
    setShowAddSubjectModal(false);
    setNewSubjCode('');
    setNewSubjName('');
    confetti({ particleCount: 40, spread: 50 });
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle || !activeSubjectForTopic) return;

    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      subjectId: activeSubjectForTopic,
      title: newTopicTitle,
      chapter: newTopicChapter,
      difficulty: newTopicDifficulty,
      weightage: newTopicWeightage,
      currentConfidence: newTopicConfidence,
      estimatedHours: newTopicHours,
      completed: false,
      notes: newTopicNotes
    };

    onAddTopic(activeSubjectForTopic, newTopic);
    setShowAddTopicModal(false);
    setNewTopicTitle('');
    setNewTopicNotes('');
  };

  const filteredSubjects = subjects.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchSubject = s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
    const matchTopic = s.topics.some(t => t.title.toLowerCase().includes(q) || t.chapter.toLowerCase().includes(q));
    return matchSubject || matchTopic;
  });

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'hard': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'very_hard': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  const getWeightageColor = (weight: Weightage) => {
    switch (weight) {
      case 'low': return 'bg-slate-800 text-slate-400 border-slate-700';
      case 'medium': return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
      case 'high': return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'critical': return 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header & Controls */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Courses & Syllabus Master</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your semester subjects, topic difficulty, confidence levels, and exam weightage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topics, codes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 w-48 sm:w-60 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
            />
          </div>

          {/* Add Subject Button */}
          <button
            onClick={() => setShowAddSubjectModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      </div>

      {/* Subjects Accordion List */}
      <div className="space-y-6">
        {filteredSubjects.map(subject => {
          const isExpanded = !!expandedSubjects[subject.id];
          const daysLeft = getDaysDifference(subject.examDate);
          const completedCount = subject.topics.filter(t => t.completed).length;
          const totalCount = subject.topics.length;
          const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div
              key={subject.id}
              className="glass-panel rounded-2xl border border-slate-800/90 overflow-hidden shadow-xl"
            >
              {/* Top Subject Banner */}
              <div 
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer bg-slate-900/60 hover:bg-slate-850 transition"
                onClick={() => toggleExpand(subject.id)}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-3.5 h-12 rounded-full flex-shrink-0"
                    style={{ backgroundColor: subject.color || '#6366F1' }}
                  />

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-md bg-slate-800 text-white border border-slate-700">
                        {subject.code}
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-white">
                        {subject.name}
                      </h2>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded">
                        {subject.creditHours} Credits
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Exam: {subject.examDate} ({daysLeft === 0 ? 'Today' : `${daysLeft} days left`})
                      </span>
                      {subject.targetGrade && (
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <Award className="w-3.5 h-3.5" />
                          Target: {subject.targetGrade}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right summary and expand toggle */}
                <div className="flex items-center gap-4 self-end md:self-center">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-white">{completedCount}/{totalCount} Completed</span>
                    <div className="w-28 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div 
                        className="bg-emerald-400 h-full rounded-full transition-all"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSubjectForTopic(subject.id);
                      setShowAddTopicModal(true);
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg text-xs font-semibold border border-slate-700 transition"
                    title="Add Topic"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete subject ${subject.name}?`)) {
                        onDeleteSubject(subject.id);
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-lg transition"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="text-slate-400 p-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Topics Breakdown List */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
                  {subject.topics.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No topics added yet. Click &quot;+ Add Topic&quot; to build this subject&apos;s syllabus.
                    </div>
                  ) : (
                    subject.topics.map(topic => (
                      <div
                        key={topic.id}
                        className={`p-4 rounded-xl border transition-all space-y-3 ${
                          topic.completed 
                            ? 'bg-slate-900/40 border-slate-800/60' 
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          {/* Topic Info */}
                          <div className="space-y-1 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-slate-400">{topic.chapter}</span>
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border capitalize ${getDifficultyColor(topic.difficulty)}`}>
                                {topic.difficulty.replace('_', ' ')}
                              </span>
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border capitalize ${getWeightageColor(topic.weightage)}`}>
                                {topic.weightage} Weight
                              </span>
                              {topic.quizScore !== undefined && (
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                                  topic.quizScore >= 75 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                }`}>
                                  Quiz: {topic.quizScore}%
                                </span>
                              )}
                            </div>

                            <h3 className={`text-sm font-bold ${topic.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                              {topic.title}
                            </h3>

                            {topic.notes && (
                              <p className="text-xs text-slate-400 line-clamp-2 italic">
                                &quot;{topic.notes}&quot;
                              </p>
                            )}
                          </div>

                          {/* Interactive Confidence Slider & Quick Actions */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            
                            {/* Confidence Level Slider */}
                            <div className="min-w-[130px]">
                              <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1">
                                <span>Confidence:</span>
                                <span className={`font-bold ${topic.currentConfidence < 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                  {topic.currentConfidence}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={topic.currentConfidence}
                                onChange={e => {
                                  onUpdateTopic(subject.id, topic.id, { currentConfidence: parseInt(e.target.value) });
                                }}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              {/* AI Explainer */}
                              <button
                                onClick={() => onExplainTopic(topic.title, subject.code)}
                                className="px-2.5 py-1.5 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition"
                                title="Explain this topic with analogies and code"
                              >
                                <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                                Explain
                              </button>

                              {/* Take Quiz */}
                              <button
                                onClick={() => onTakeQuiz(subject.id, topic.id)}
                                className="px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition"
                                title="Diagnostic Quiz"
                              >
                                <GraduationCap className="w-3.5 h-3.5 inline mr-1" />
                                Quiz
                              </button>

                              {/* Mark Complete Toggle */}
                              <button
                                onClick={() => {
                                  const nowCompleted = !topic.completed;
                                  onUpdateTopic(subject.id, topic.id, { 
                                    completed: nowCompleted,
                                    currentConfidence: nowCompleted ? Math.max(85, topic.currentConfidence) : topic.currentConfidence
                                  });
                                  if (nowCompleted) {
                                    confetti({ particleCount: 30, spread: 40 });
                                  }
                                }}
                                className={`p-1.5 rounded-lg border transition ${
                                  topic.completed 
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                }`}
                                title={topic.completed ? 'Completed' : 'Mark complete'}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>

                              {/* Delete Topic */}
                              <button
                                onClick={() => {
                                  if (confirm(`Remove topic "${topic.title}"?`)) {
                                    onDeleteTopic(subject.id, topic.id);
                                  }
                                }}
                                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ADD SUBJECT MODAL */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleCreateSubject} className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-4 bg-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add New Subject</h3>
              <button type="button" onClick={() => setShowAddSubjectModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subject Code:</label>
                <input
                  type="text"
                  placeholder="e.g. CS206, IT301"
                  required
                  value={newSubjCode}
                  onChange={e => setNewSubjCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subject Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineering & Agile"
                  required
                  value={newSubjName}
                  onChange={e => setNewSubjName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Exam Date:</label>
                  <input
                    type="date"
                    required
                    value={newSubjExamDate}
                    onChange={e => setNewSubjExamDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Credit Hours:</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newSubjCredits}
                    onChange={e => setNewSubjCredits(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Grade:</label>
                <input
                  type="text"
                  placeholder="e.g. A+ (90%+)"
                  value={newSubjTargetGrade}
                  onChange={e => setNewSubjTargetGrade(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Color Accent:</label>
                <div className="flex items-center gap-3">
                  {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSubjColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition ${
                        newSubjColor === c ? 'border-white scale-110 shadow' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddSubjectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
              >
                Create Subject
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD TOPIC MODAL */}
      {showAddTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleCreateTopic} className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-4 bg-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Topic / Chapter</h3>
              <button type="button" onClick={() => setShowAddTopicModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Unit / Chapter:</label>
                <input
                  type="text"
                  placeholder="e.g. Unit 3: Concurrency"
                  required
                  value={newTopicChapter}
                  onChange={e => setNewTopicChapter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Topic Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Peterson's Algorithm & Mutex Locks"
                  required
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Difficulty:</label>
                  <select
                    value={newTopicDifficulty}
                    onChange={e => setNewTopicDifficulty(e.target.value as Difficulty)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 capitalize"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="very_hard">Very Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Exam Weightage:</label>
                  <select
                    value={newTopicWeightage}
                    onChange={e => setNewTopicWeightage(e.target.value as Weightage)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 capitalize"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Initial Confidence (0-100%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newTopicConfidence}
                    onChange={e => setNewTopicConfidence(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Est. Study Hours:</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="20"
                    value={newTopicHours}
                    onChange={e => setNewTopicHours(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Important Formulas / Notes (optional):</label>
                <textarea
                  rows={2}
                  placeholder="Key concepts, page numbers, or exam tips..."
                  value={newTopicNotes}
                  onChange={e => setNewTopicNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddTopicModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
              >
                Add Topic
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
