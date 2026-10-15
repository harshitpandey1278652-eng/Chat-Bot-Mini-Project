/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Layers,
  Award,
  Calendar,
  FileText,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Menu,
  Download,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { FlashcardsModal } from './components/FlashcardsModal';
import { QuizModal } from './components/QuizModal';
import { StudyPlanModal } from './components/StudyPlanModal';
import { NotesContextModal } from './components/NotesContextModal';
import { ProjectSpecsModal } from './components/ProjectSpecsModal';
import {
  StudyMode,
  AcademicLevel,
  Message,
  ChatSession,
  Flashcard,
  QuizQuestion,
  StudyPlan,
} from './types';

const INITIAL_PROMPT_CHIPS = [
  {
    category: 'Computer Science',
    title: "Dijkstra's Algorithm",
    prompt: "Explain Dijkstra's shortest path algorithm step-by-step with time complexity and an example trace.",
  },
  {
    category: 'Computer Science',
    title: 'Dynamic Programming',
    prompt: 'How does the 0/1 Knapsack Problem work? Explain the recurrence relation, table state, and Big-O.',
  },
  {
    category: 'Mathematics',
    title: 'Eigenvalues & Vectors',
    prompt: 'Give me the intuition behind Eigenvalues and Eigenvectors, how to find them with det(A - λI) = 0, and why they matter.',
  },
  {
    category: 'Physics & Engineering',
    title: 'Fourier Transform',
    prompt: 'Explain the Fourier Transform from physical sound frequency intuition up to the continuous integral formula.',
  },
  {
    category: 'Biology & Pre-Med',
    title: 'CRISPR-Cas9',
    prompt: 'How does CRISPR-Cas9 target DNA sequences, make double-strand breaks, and how does cellular repair work?',
  },
  {
    category: 'Economics & Business',
    title: 'Nash Equilibrium',
    prompt: "Explain Nash Equilibrium in game theory using Prisoner's Dilemma payoff matrix and modern market applications.",
  },
];

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('scholarai_theme') === 'dark' ||
      (!('scholarai_theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('scholarai_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('scholarai_theme', 'light');
    }
  }, [isDarkMode]);

  // Sidebar toggle for mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Active study parameters
  const [studyMode, setStudyMode] = useState<StudyMode>('progressive');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('Undergraduate');
  const [subject, setSubject] = useState<string>('Computer Science');
  const [attachedNotes, setAttachedNotes] = useState<string>('');

  // Sessions management
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('scholarai_sessions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const defaultId = 'session-' + Date.now();
    return [
      {
        id: defaultId,
        title: 'New Study Topic',
        subject: 'Computer Science',
        academicLevel: 'Undergraduate',
        studyMode: 'progressive',
        messages: [],
        updatedAt: Date.now(),
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'session-default';
  });

  // Current Chat Session
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  // Chat input and streaming state
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Audio / TTS state
  const [activeAudioMessageId, setActiveAudioMessageId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Modals state
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isFlashcardsLoading, setIsFlashcardsLoading] = useState(false);

  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  const [isStudyPlanOpen, setIsStudyPlanOpen] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isStudyPlanLoading, setIsStudyPlanLoading] = useState(false);

  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isProjectSpecsOpen, setIsProjectSpecsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamBuffer]);

  // Persist sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('scholarai_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions:', e);
    }
  }, [sessions]);

  // Focus textarea when session changes
  useEffect(() => {
    textareaRef.current?.focus();
  }, [activeSessionId]);

  // Handle New Session
  const handleNewSession = () => {
    const newId = 'session-' + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Study Topic',
      subject: subject,
      academicLevel: academicLevel,
      studyMode: studyMode,
      messages: [],
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setInputPrompt('');
    setStreamBuffer('');
    setIsSidebarOpen(false);
  };

  // Delete session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      handleNewSession();
      return;
    }
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      setActiveSessionId(updated[0].id);
    }
  };

  // Send Message with SSE streaming
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isGenerating) return;

    setInputPrompt('');

    const userMessage: Message = {
      id: 'msg-user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    // Update session title if first message
    const updatedMessages = [...messages, userMessage];
    const newTitle =
      messages.length === 0
        ? text.slice(0, 32) + (text.length > 32 ? '...' : '')
        : activeSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: newTitle,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
          : s
      )
    );

    setIsGenerating(true);
    setStreamBuffer('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          studyMode,
          academicLevel,
          subject,
          attachedText: attachedNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.chunk) {
                  accumulated += parsed.chunk;
                  setStreamBuffer(accumulated);
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (e) {
                // non-json or incomplete chunk
              }
            }
          }
        }
      }

      // Add final assistant message
      const assistantMessage: Message = {
        id: 'msg-asst-' + Date.now(),
        role: 'assistant',
        content: accumulated || 'No response generated.',
        timestamp: Date.now(),
        studyMode,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: [...updatedMessages, assistantMessage],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content: `⚠️ **Unable to complete study response:** ${error?.message || 'Server error'}.\n\nPlease ensure your API connection is active and retry.`,
        timestamp: Date.now(),
        studyMode,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: [...updatedMessages, errorMessage],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } finally {
      setIsGenerating(false);
      setStreamBuffer('');
    }
  };

  // Generate Flashcards
  const handleGenerateFlashcards = async (
    topicToUse: string,
    count = 6,
    difficulty = 'All Levels'
  ) => {
    setIsFlashcardsLoading(true);
    setIsFlashcardsOpen(true);

    try {
      // Gather recent context from chat
      const recentChatContext = messages
        .slice(-3)
        .map((m) => `${m.role}: ${m.content.slice(0, 300)}`)
        .join('\n');

      const res = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse || activeSession.title,
          context: recentChatContext || attachedNotes,
          count,
          difficulty,
        }),
      });

      const data = await res.json();
      if (data.flashcards) {
        setFlashcards(data.flashcards);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFlashcardsLoading(false);
    }
  };

  // Generate Quiz
  const handleGenerateQuiz = async (
    topicToUse: string,
    count = 5,
    difficulty = 'Undergraduate'
  ) => {
    setIsQuizLoading(true);
    setIsQuizOpen(true);

    try {
      const recentChatContext = messages
        .slice(-3)
        .map((m) => `${m.role}: ${m.content.slice(0, 300)}`)
        .join('\n');

      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse || activeSession.title,
          context: recentChatContext || attachedNotes,
          count,
          difficulty,
        }),
      });

      const data = await res.json();
      if (data.quiz) {
        setQuizQuestions(data.quiz);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsQuizLoading(false);
    }
  };

  // Generate Study Plan
  const handleGenerateStudyPlan = async (
    subj: string,
    top: string,
    days = 7,
    dailyHours = 2
  ) => {
    setIsStudyPlanLoading(true);
    setIsStudyPlanOpen(true);

    try {
      const res = await fetch('/api/generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subj || subject,
          topic: top || activeSession.title,
          days,
          dailyHours,
        }),
      });

      const data = await res.json();
      if (data.studyPlan) {
        setStudyPlan(data.studyPlan);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsStudyPlanLoading(false);
    }
  };

  // TTS Voice Readout
  const handleSpeak = async (messageId: string, text: string) => {
    // If currently playing this message, stop it
    if (activeAudioMessageId === messageId && isPlayingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      setActiveAudioMessageId(null);
      return;
    }

    // Stop existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();

    setActiveAudioMessageId(messageId);
    setIsPlayingAudio(true);

    try {
      // First try Gemini 3.8 Flash Lite TTS endpoint
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 500) }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audioRef.current = audio;
          audio.onended = () => {
            setIsPlayingAudio(false);
            setActiveAudioMessageId(null);
          };
          audio.onerror = () => {
            playFallbackSpeech(text);
          };
          await audio.play();
          return;
        }
      }
      // If TTS endpoint failed or empty, fallback to Web Speech API
      playFallbackSpeech(text);
    } catch (e) {
      console.error('Gemini TTS error, falling back to Web Speech:', e);
      playFallbackSpeech(text);
    }
  };

  const playFallbackSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setIsPlayingAudio(false);
      setActiveAudioMessageId(null);
      return;
    }
    const cleanText = text
      .replace(/[#*`_\[\]()🟢🟡🔴🧠]/g, '')
      .slice(0, 600);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => {
      setIsPlayingAudio(false);
      setActiveAudioMessageId(null);
    };
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setActiveAudioMessageId(null);
    };
    window.speechSynthesis.speak(utterance);
  };

  // Copy message text
  const handleCopy = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Export current session as Markdown
  const handleExportChat = () => {
    if (messages.length === 0) return;
    let md = `# Study Session: ${activeSession.title}\n`;
    md += `Subject: ${activeSession.subject} | Mode: ${activeSession.studyMode} | Level: ${activeSession.academicLevel}\n`;
    md += `Date: ${new Date().toLocaleString()}\n\n---\n\n`;

    messages.forEach((m) => {
      md += `### ${m.role === 'user' ? '🧑‍🎓 Student Query' : '🤖 ScholarAI Tutor'}\n\n${m.content}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyNotes-${activeSession.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Keyboard shortcut: Enter to send (Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        studyMode={studyMode}
        onSelectStudyMode={setStudyMode}
        academicLevel={academicLevel}
        onSelectAcademicLevel={setAcademicLevel}
        subject={subject}
        onSelectSubject={setSubject}
        onOpenFlashcards={() => handleGenerateFlashcards(activeSession.title, 6)}
        onOpenQuiz={() => handleGenerateQuiz(activeSession.title, 5)}
        onOpenStudyPlan={() => handleGenerateStudyPlan(subject, activeSession.title, 7, 2)}
        onOpenNotes={() => setIsNotesOpen(true)}
        onOpenProjectSpecs={() => setIsProjectSpecsOpen(true)}
        onNewChat={handleNewSession}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        hasAttachedNotes={!!attachedNotes.trim()}
      />

      {/* Main Body with Sidebar + Chat */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => {
            setActiveSessionId(id);
            setIsSidebarOpen(false);
          }}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onOpenFlashcards={() => handleGenerateFlashcards(activeSession.title, 6)}
          onOpenQuiz={() => handleGenerateQuiz(activeSession.title, 5)}
          onOpenStudyPlan={() => handleGenerateStudyPlan(subject, activeSession.title, 7, 2)}
          onOpenNotes={() => setIsNotesOpen(true)}
          attachedNotesCount={attachedNotes.trim() ? 1 : 0}
        />

        {/* Central Chat Column */}
        <main className="flex flex-1 flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900/60 relative">
          {/* Sub-header banner showing active mode badge */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 px-4 py-2 bg-white/70 dark:bg-slate-900/70 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Menu className="h-4 w-4" />
              </button>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                {activeSession.title}
              </span>
              <span className="hidden sm:inline-block text-[11px] text-slate-400">
                ({subject} • {academicLevel})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {attachedNotes.trim() && (
                <button
                  onClick={() => setIsNotesOpen(true)}
                  className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full"
                >
                  <FileText className="h-3 w-3" />
                  <span>Notes Grounding Active</span>
                </button>
              )}
              {messages.length > 0 && (
                <button
                  onClick={handleExportChat}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  title="Export Markdown Notes"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export Notes</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.length === 0 && !streamBuffer ? (
              /* Hero Welcome & Prompt Chips */
              <div className="mx-auto max-w-2xl py-6 sm:py-10 space-y-8 animate-in fade-in duration-300">
                <div className="text-center space-y-3">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-xl">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Master Any Subject From <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 via-indigo-600 to-purple-600 dark:from-emerald-400 dark:via-indigo-400 dark:to-purple-400">
                      Basic Fundamentals to Advanced Rigor
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                    Powered by Google Gemini 3.8 Flash. Select your topic, attach lecture notes, or pick a sample college concept below to begin your personalized Socratic learning session.
                  </p>
                </div>

                {/* 4-Tier Explanation Showcase Card */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    <BookOpen className="h-4 w-4 text-indigo-500" />
                    <span>How ScholarAI Structures Every Study Response:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                      <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                        <span>🟢 Level 1: Intuition (Basic)</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-snug">
                        Everyday analogies, core definition, and why the concept exists.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20">
                      <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                        <span>🟡 Level 2: Mechanics (Intermediate)</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-snug">
                        Step-by-step algorithms, canonical equations, and workflow diagrams.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
                      <div className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-1">
                        <span>🔴 Level 3: Rigor & Proofs (Advanced)</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-snug">
                        Mathematical formulations, Big-O analysis, edge cases & proofs.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-purple-200/80 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20">
                      <div className="font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5 mb-1">
                        <span>🧠 Level 4: Active Recall Check</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-snug">
                        Immediate self-test question to lock the concept into long-term memory.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sample Prompt Chips */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
                    <span>Try a High-Yield College Topic:</span>
                    <span className="text-[11px] text-indigo-500">Click to start</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {INITIAL_PROMPT_CHIPS.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip.prompt)}
                        className="group flex flex-col items-start p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            {chip.category}
                          </span>
                          <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {chip.title}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                          {chip.prompt}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Message List */
              <div className="mx-auto max-w-4xl space-y-6">
                {messages.map((msg) => {
                  const isAssistant = msg.role === 'assistant';

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 sm:gap-4 ${
                        isAssistant ? 'items-start' : 'items-start flex-row-reverse'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl shadow-xs ${
                          isAssistant
                            ? 'bg-linear-to-tr from-indigo-600 to-purple-600 text-white'
                            : 'bg-slate-800 text-slate-100 dark:bg-slate-700'
                        }`}
                      >
                        {isAssistant ? (
                          <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <User className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </div>

                      {/* Message Content Bubble */}
                      <div
                        className={`group relative max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 sm:p-5 shadow-xs transition-shadow ${
                          isAssistant
                            ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100'
                            : 'bg-indigo-600 text-white font-medium'
                        }`}
                      >
                        {/* Header for assistant message */}
                        {isAssistant && (
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5 mb-3 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">
                                ScholarAI Tutor
                              </span>
                              {msg.studyMode && (
                                <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
                                  {msg.studyMode === 'progressive'
                                    ? '🚀 Basic ➔ Advanced'
                                    : msg.studyMode === 'socratic'
                                    ? '🏛️ Socratic'
                                    : msg.studyMode === 'code_analysis'
                                    ? '💻 Algorithm Lab'
                                    : msg.studyMode === 'exam_prep'
                                    ? '📝 Exam Prep'
                                    : msg.studyMode}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}

                        {/* Text / Markdown */}
                        {isAssistant ? (
                          <MarkdownRenderer content={msg.content} />
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                            {msg.content}
                          </p>
                        )}

                        {/* Action buttons on assistant message */}
                        {isAssistant && (
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Voice TTS */}
                              <button
                                onClick={() => handleSpeak(msg.id, msg.content)}
                                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                                  activeAudioMessageId === msg.id && isPlayingAudio
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                                title="Listen to Voice Readout (Gemini TTS)"
                              >
                                {activeAudioMessageId === msg.id && isPlayingAudio ? (
                                  <>
                                    <VolumeX className="h-3.5 w-3.5 text-purple-600 animate-pulse" />
                                    <span>Stop Voice</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="h-3.5 w-3.5 text-indigo-500" />
                                    <span>Voice Readout</span>
                                  </>
                                )}
                              </button>

                              {/* Copy response */}
                              <button
                                onClick={() => handleCopy(msg.id, msg.content)}
                                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                {copiedMessageId === msg.id ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                    <span className="text-emerald-500">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Convert to Study Tools */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() =>
                                  handleGenerateFlashcards(activeSession.title, 6)
                                }
                                className="flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 px-2 py-1 text-[11px] font-semibold transition-colors"
                                title="Generate Flashcards from this topic"
                              >
                                <Layers className="h-3 w-3" />
                                <span>Flashcards</span>
                              </button>
                              <button
                                onClick={() =>
                                  handleGenerateQuiz(activeSession.title, 5)
                                }
                                className="flex items-center gap-1 rounded-md bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 px-2 py-1 text-[11px] font-semibold transition-colors"
                                title="Generate MCQ Quiz from this topic"
                              >
                                <Award className="h-3 w-3" />
                                <span>Quiz</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Active Streaming Message */}
                {isGenerating && streamBuffer && (
                  <div className="flex gap-3 sm:gap-4 items-start">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-tr from-indigo-600 to-purple-600 text-white shadow-xs animate-pulse">
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 sm:p-5 shadow-xs bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-800 text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2 mb-3 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          ScholarAI Tutor
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-full">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                          Streaming Progressive Analysis...
                        </span>
                      </div>
                      <MarkdownRenderer content={streamBuffer} />
                    </div>
                  </div>
                )}

                {/* Thinking spinner if stream not started yet */}
                {isGenerating && !streamBuffer && (
                  <div className="flex gap-3 sm:gap-4 items-start">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white animate-pulse">
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      <span>
                        Formulating progressive college breakdown with Gemini 3.8 Flash...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Bottom Chat Input Form */}
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 sm:p-4">
            <div className="mx-auto max-w-4xl space-y-2">
              {/* Quick mode reminder pill & notes badge */}
              <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Current Mode:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-md">
                    {studyMode === 'progressive'
                      ? '🚀 Progressive: Basic ➔ Advanced'
                      : studyMode === 'socratic'
                      ? '🏛️ Socratic Tutor'
                      : studyMode === 'code_analysis'
                      ? '💻 CS & Algorithm Lab'
                      : studyMode === 'exam_prep'
                      ? '📝 Exam Prep'
                      : studyMode}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline text-slate-400">
                    Press <kbd className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">Enter</kbd> to ask, <kbd className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">Shift+Enter</kbd> for newline
                  </span>
                </div>
              </div>

              {/* Input box */}
              <div className="relative flex items-end rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-xs transition-all">
                <textarea
                  ref={textareaRef}
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask any college concept, homework question, or algorithm (e.g. 'Explain Gradient Descent with cost function math')..."
                  rows={2}
                  className="max-h-36 min-h-[52px] w-full resize-none border-0 bg-transparent p-3 sm:p-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
                />

                <div className="flex items-center gap-1.5 p-2 sm:p-2.5 shrink-0">
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputPrompt.trim() || isGenerating}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-xs transition-colors"
                    title="Send Study Query"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Interactive Modals */}
      <FlashcardsModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
        flashcards={flashcards}
        onGenerateNew={(top, count, diff) => handleGenerateFlashcards(top, count, diff)}
        isLoading={isFlashcardsLoading}
        currentTopic={activeSession.title}
      />

      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        quizQuestions={quizQuestions}
        onGenerateNew={(top, count, diff) => handleGenerateQuiz(top, count, diff)}
        isLoading={isQuizLoading}
        currentTopic={activeSession.title}
      />

      <StudyPlanModal
        isOpen={isStudyPlanOpen}
        onClose={() => setIsStudyPlanOpen(false)}
        studyPlan={studyPlan}
        onGeneratePlan={(s, t, d, h) => handleGenerateStudyPlan(s, t, d, h)}
        isLoading={isStudyPlanLoading}
        currentSubject={subject}
        currentTopic={activeSession.title}
      />

      <NotesContextModal
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        attachedNotes={attachedNotes}
        onSaveNotes={(n) => setAttachedNotes(n)}
      />

      <ProjectSpecsModal
        isOpen={isProjectSpecsOpen}
        onClose={() => setIsProjectSpecsOpen(false)}
      />
    </div>
  );
}
