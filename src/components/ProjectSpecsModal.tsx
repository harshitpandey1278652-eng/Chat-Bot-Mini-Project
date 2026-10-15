import React from 'react';
import { X, GraduationCap, Cpu, Layers, ShieldCheck, Sparkles, BookOpen, Terminal, CheckCircle2 } from 'lucide-react';

interface ProjectSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSpecsModal: React.FC<ProjectSpecsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-linear-to-r from-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-indigo-300">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">College Project Architecture & Specs</h2>
                <span className="text-[10px] font-mono bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Viva Presentation Ready
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                ScholarAI: Tiered Progressive Study Assistant & Socratic Learning Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          {/* Executive Overview */}
          <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2">
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Project Abstract & Core Innovation</span>
            </h3>
            <p className="leading-relaxed">
              Most standard AI chatbots produce monolithic answers that either oversimplify complex college material or overwhelm beginners with ungrounded jargon. <strong>ScholarAI</strong> addresses this through a novel <strong>4-Tier Progressive Pedagogical Engine</strong> (Intuition ➔ Mechanics ➔ Mathematical/Algorithmic Rigor ➔ Active Recall) alongside interactive flashcard generation, diagnostic quizzes, and lecture note grounding.
            </p>
          </div>

          {/* Key Pedagogical Modules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-indigo-500" />
              <span>Core Functional Modules</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-1.5">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>1. Progressive Tiered Response</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Automatically segments explanations into Level 1 (Intuition), Level 2 (Mechanics), Level 3 (Formal Math/Proof), and Level 4 (Active Recall challenge).
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-1.5">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>2. Socratic Scaffolding Engine</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instead of doing homework for the student, it guides critical thinking using targeted hints, diagnostic questions, and progressive step-by-step discovery.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-1.5">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>3. Active Recall & Quizzing</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Generates interactive 3D flip flashcards and university exam-style MCQs with distractor analysis and instant scoring powered by structured JSON schemas.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-1.5">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>4. Syllabus & Lecture Notes Ingestion</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Grounds AI responses in the student's exact course syllabus, textbook chapters, or exam problem sheets.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Architecture */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-indigo-500" />
              <span>Technical Stack & Gemini API Integration</span>
            </h4>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-indigo-400 font-bold">API / Model Stack:</span>
                <span className="text-emerald-400">Google GenAI TypeScript SDK (^2.4.0)</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                <li><strong className="text-slate-200">Chat & Streaming:</strong> <code className="text-amber-300">gemini-3.8-flash</code> via Server-Sent Events (SSE)</li>
                <li><strong className="text-slate-200">Flashcards & Quiz Engine:</strong> <code className="text-amber-300">gemini-3.8-flash</code> with <code className="text-indigo-300">responseSchema: Type.ARRAY</code> & <code className="text-indigo-300">responseMimeType: "application/json"</code></li>
                <li><strong className="text-slate-200">Voice Synthesis:</strong> <code className="text-amber-300">gemini-3.8-flash-lite-tts</code> with <code className="text-indigo-300">Modality: AUDIO</code></li>
                <li><strong className="text-slate-200">Backend Server:</strong> Node.js + Express proxy on Port 3000 (Prevents API key exposure)</li>
                <li><strong className="text-slate-200">Frontend UI:</strong> React 19, TypeScript, Tailwind CSS, Motion, Lucide, Canvas Confetti</li>
              </ul>
            </div>
          </div>

          {/* College Viva Questions & Answers */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              <span>Sample College Viva Questions & Model Answers</span>
            </h4>

            <div className="space-y-2">
              <details className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/30">
                <summary className="font-semibold text-slate-900 dark:text-slate-100 cursor-pointer">
                  Q1: Why use Server-Sent Events (SSE) instead of standard REST for chat?
                </summary>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Academic answers can be extensive. SSE allows tokens to be streamed in real time as the Gemini model generates them, slashing Time-To-First-Token (TTFT) from 5-10 seconds down to ~300ms, creating an interactive conversation feel.
                </p>
              </details>

              <details className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/30">
                <summary className="font-semibold text-slate-900 dark:text-slate-100 cursor-pointer">
                  Q2: How do you guarantee the flashcards and quizzes return valid JSON?
                </summary>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  We leverage Gemini's native <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">responseSchema</code> using the modern <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">@google/genai</code> SDK. This enforces strict JSON schema adherence at decoding time, eliminating JSON syntax errors.
                </p>
              </details>

              <details className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/30">
                <summary className="font-semibold text-slate-900 dark:text-slate-100 cursor-pointer">
                  Q3: How does the system prevent student cheating in Socratic mode?
                </summary>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The Socratic system prompt dynamically instructs the model to withhold monolithic direct code or assignment answers, instead querying the student on their current hypothesis, diagnosing misconceptions, and providing scaffolded hints.
                </p>
              </details>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-3 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="h-4 w-4" />
            <span>Secure Full-Stack Node.js Architecture</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
          >
            Close Specs
          </button>
        </div>
      </div>
    </div>
  );
};
