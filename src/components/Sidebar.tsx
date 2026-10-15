import React from 'react';
import { Plus, MessageSquare, Trash2, BookOpen, Layers, Award, Calendar, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onOpenFlashcards: () => void;
  onOpenQuiz: () => void;
  onOpenStudyPlan: () => void;
  onOpenNotes: () => void;
  attachedNotesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onOpenFlashcards,
  onOpenQuiz,
  onOpenStudyPlan,
  onOpenNotes,
  attachedNotesCount,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-30 bg-slate-950/50 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 flex flex-col w-72 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-64'
        }`}
      >
        {/* Top: New Study Session button */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={onNewSession}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Study Topic</span>
          </button>
        </div>

        {/* Quick Academic Toolkit Links */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5">
            Active Study Lab
          </div>

          <button
            onClick={onOpenFlashcards}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
          >
            <Layers className="h-4 w-4 text-indigo-500" />
            <span>Recall Flashcards</span>
          </button>

          <button
            onClick={onOpenQuiz}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
          >
            <Award className="h-4 w-4 text-purple-500" />
            <span>Diagnostic Quizzes</span>
          </button>

          <button
            onClick={onOpenStudyPlan}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
          >
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>Revision Roadmap</span>
          </button>

          <button
            onClick={onOpenNotes}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-emerald-500" />
              <span>Attached Notes</span>
            </div>
            {attachedNotesCount > 0 && (
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded-full font-mono">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5">
            Recent Study Dialogues
          </div>

          {sessions.length === 0 ? (
            <div className="py-6 px-3 text-center text-xs text-slate-400">
              No previous study sessions yet. Ask a question to begin!
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSession(s.id)}
                  className={`group relative flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs border border-slate-200 dark:border-slate-800'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{s.title || 'Untitled Study Topic'}</p>
                      <p className="text-[10px] text-slate-400 font-normal truncate">
                        {s.subject} • {s.messages.length} notes
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => onDeleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom College Project Credit */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>College AI Project</span>
          <span className="font-mono text-[10px] text-indigo-500 font-semibold">Gemini 3.8</span>
        </div>
      </aside>
    </>
  );
};
