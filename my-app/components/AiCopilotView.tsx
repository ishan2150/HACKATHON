'use client';

import React, { useState, useEffect } from 'react';
import { Subject } from '../types/study';
import { 
  generateTopicExplanation, 
  generateCheatSheet, 
  getAiStudyAdvice,
  TopicExplanation,
  CheatSheetData
} from '../lib/aiEngine';
import { 
  Bot, 
  Sparkles, 
  BookOpen, 
  FileText, 
  Send, 
  MessageSquare, 
  HelpCircle, 
  Copy, 
  Check, 
  Printer, 
  Lightbulb, 
  Code, 
  AlertCircle,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AiCopilotViewProps {
  subjects: Subject[];
  initialTopicTitle?: string;
  initialSubjectCode?: string;
}

export const AiCopilotView: React.FC<AiCopilotViewProps> = ({
  subjects,
  initialTopicTitle,
  initialSubjectCode,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'explainer' | 'cheatsheet' | 'viva'>('chat');
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      id: 'msg-1',
      role: 'assistant',
      text: `Hello! 👋 I'm your **StudyBuddy AI Exam Copilot**.\n\nI have analyzed your courses and upcoming exams. How can I help you today?\n• 💡 Ask me to explain any complex CSE concept with real-world analogies\n• 📑 Generate 1-page high-yield cheat sheets & formula cards\n• 🎓 Practice top exam & viva questions for midterms and finals!`,
      time: 'Just now'
    }
  ]);

  // Explainer State
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(initialSubjectCode || subjects[0]?.code || 'CS201');
  const [explainerTopicInput, setExplainerTopicInput] = useState(initialTopicTitle || 'CPU Scheduling Algorithms');
  const [explanationData, setExplanationData] = useState<TopicExplanation | null>(null);
  const [isLoadingExplainer, setIsLoadingExplainer] = useState(false);

  // Cheat Sheet State
  const [cheatSheetTopic, setCheatSheetTopic] = useState('Functional Dependencies & Normalization');
  const [cheatSheetData, setCheatSheetData] = useState<CheatSheetData | null>(null);
  const [isLoadingCheatSheet, setIsLoadingCheatSheet] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Auto-trigger explainer if initial topic provided
  useEffect(() => {
    if (initialTopicTitle) {
      setExplainerTopicInput(initialTopicTitle);
      setActiveTab('explainer');
      handleGenerateExplanation(initialTopicTitle, initialSubjectCode);
    }
  }, [initialTopicTitle, initialSubjectCode]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const replyText = await getAiStudyAdvice(textToSend, {
        subjectsCount: subjects.length,
      });

      const assistantMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant' as const,
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant' as const,
          text: 'I encountered an issue generating your response. Please try asking again!',
          time: 'Just now'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateExplanation = async (topicTitle: string, subjCode?: string) => {
    setIsLoadingExplainer(true);
    try {
      const data = await generateTopicExplanation(topicTitle, subjCode || selectedSubjectCode);
      setExplanationData(data);
    } finally {
      setIsLoadingExplainer(false);
    }
  };

  const handleGenerateCheatSheet = async (topic: string) => {
    setIsLoadingCheatSheet(true);
    try {
      const data = await generateCheatSheet(topic, selectedSubjectCode);
      setCheatSheetData(data);
    } finally {
      setIsLoadingCheatSheet(false);
    }
  };

  const handleCopyCheatSheet = () => {
    if (!cheatSheetData) return;
    const textToCopy = `# ${cheatSheetData.topicTitle} - ${cheatSheetData.subjectCode}\n\nSummary:\n${cheatSheetData.summary}\n\nKey Points:\n${cheatSheetData.keyPoints.join('\n')}\n\nMust-Remember Formulas:\n${cheatSheetData.mustRememberFormulas.join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header & Sub-Navigation */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">AI Study Copilot & Explainer</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Your 24/7 intelligent CSE study partner: instant analogies, code schemas, formula cards, and viva prep.
          </p>
        </div>

        {/* Sub Tabs */}
        <div className="flex flex-wrap items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs gap-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Study Chat
          </button>
          <button
            onClick={() => {
              setActiveTab('explainer');
              if (!explanationData) handleGenerateExplanation(explainerTopicInput);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'explainer' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Concept Explainer
          </button>
          <button
            onClick={() => {
              setActiveTab('cheatsheet');
              if (!cheatSheetData) handleGenerateCheatSheet(cheatSheetTopic);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'cheatsheet' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            1-Page Cheat Sheet
          </button>
        </div>
      </div>

      {/* 1. CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="glass-panel rounded-2xl border border-slate-800 flex flex-col h-[600px] overflow-hidden shadow-2xl">
          
          {/* Quick Prompt Chips */}
          <div className="bg-slate-900/90 p-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
            <span className="text-slate-400 flex items-center gap-1 whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Quick Prompts:
            </span>
            {[
              'Explain Belady\'s Anomaly in simple terms',
              'How to solve 0/1 Knapsack using DP?',
              'Top 5 viva questions for Operating Systems',
              'How does 2-Phase Locking prevent conflicts?',
              'Give me a 3-day battle plan for DAA exam'
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg whitespace-nowrap border border-slate-700/80 transition text-[11px]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 flex-shrink-0">
                    <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-indigo-400" />
                    </div>
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'glass-panel border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`block text-[10px] mt-2 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-center text-xs text-slate-400">
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask any concept, algorithm, formula, or exam doubt..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isTyping}
                className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Ask AI</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. CONCEPT EXPLAINER TAB */}
      {activeTab === 'explainer' && (
        <div className="space-y-6">
          {/* Topic Selector Controls */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Enter or Pick Topic:</label>
              <input
                type="text"
                value={explainerTopicInput}
                onChange={e => setExplainerTopicInput(e.target.value)}
                placeholder="e.g. CPU Scheduling Algorithms, Paging, 2PL, Master Theorem..."
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:self-end">
              <button
                onClick={() => handleGenerateExplanation(explainerTopicInput)}
                disabled={isLoadingExplainer || !explainerTopicInput.trim()}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                {isLoadingExplainer ? 'Synthesizing...' : 'Generate Breakdown'}
              </button>
            </div>
          </div>

          {/* Explanation Output Cards */}
          {explanationData && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Title & Analogy Card */}
              <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/40 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
                    AI Concept Blueprint
                  </span>
                  <h2 className="text-xl font-black text-white">{explanationData.title}</h2>
                </div>

                {/* Real-World Analogy */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Lightbulb className="w-4 h-4" />
                    <span>Intuitive Real-World Analogy:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                    &quot;{explanationData.analogy}&quot;
                  </p>
                </div>
              </div>

              {/* Core Concepts & Working Mechanism */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Core Principles */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Core Engineering Concepts:</span>
                  </h3>
                  <div className="space-y-2 text-xs text-slate-300">
                    {explanationData.coreConcepts.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 leading-relaxed">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Formulas or Code */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-400" />
                    <span>Key Formulas & Schema:</span>
                  </h3>
                  <div className="space-y-2 font-mono text-xs text-indigo-300">
                    {explanationData.keyFormulasOrCode?.map((f, idx) => (
                      <pre key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 whitespace-pre-wrap">
                        <code>{f}</code>
                      </pre>
                    ))}
                  </div>
                </div>

              </div>

              {/* Exam Pitfalls & Viva Question Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Exam Traps / Pitfalls */}
                <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10 space-y-3">
                  <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Common Exam Traps & Pitfalls:</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {explanationData.examPitfalls.map((pit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{pit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Top Viva Question */}
                <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-3">
                  <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>Top Professor / Viva Question:</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <p className="font-semibold text-white">
                      Q: {explanationData.vivaQuestion.question}
                    </p>
                    <p className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed">
                      <strong>Model Answer:</strong> {explanationData.vivaQuestion.answer}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

      {/* 3. CHEAT SHEET GENERATOR TAB */}
      {activeTab === 'cheatsheet' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex-1 max-w-md">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Select Topic for Cheat Sheet:</label>
              <input
                type="text"
                value={cheatSheetTopic}
                onChange={e => setCheatSheetTopic(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 self-end">
              <button
                onClick={() => handleGenerateCheatSheet(cheatSheetTopic)}
                disabled={isLoadingCheatSheet}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                {isLoadingCheatSheet ? 'Generating...' : 'Generate Cheat Sheet'}
              </button>

              {cheatSheetData && (
                <button
                  onClick={handleCopyCheatSheet}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition flex items-center gap-1"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              )}
            </div>
          </div>

          {cheatSheetData && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    1-Page Rapid Revision Card
                  </span>
                  <h2 className="text-xl font-black text-white mt-1">{cheatSheetData.topicTitle}</h2>
                </div>
                <button
                  onClick={() => window.print()}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Card
                </button>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed">
                {cheatSheetData.summary}
              </div>

              {/* Key Bullet Points */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">High-Yield Key Takeaways</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {cheatSheetData.keyPoints.map((pt, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">✓</span>
                      <span className="text-slate-300">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time / Space Complexities */}
              {cheatSheetData.timeOrSpaceComplexity && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Complexity & Invariants</h3>
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    {cheatSheetData.timeOrSpaceComplexity.map((c, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulas & Schemas */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Must-Remember Formulas</h3>
                <div className="space-y-2 font-mono text-xs text-amber-300">
                  {cheatSheetData.mustRememberFormulas.map((f, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Exam Question & Model Solution */}
              <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-2 text-xs">
                <span className="font-bold text-indigo-300">Sample University Exam Question:</span>
                <p className="font-semibold text-white">{cheatSheetData.sampleExamQuestion.question}</p>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 whitespace-pre-line leading-relaxed">
                  {cheatSheetData.sampleExamQuestion.solution}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
};
