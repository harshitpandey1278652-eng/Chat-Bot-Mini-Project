import React from 'react';
import {
  GraduationCap,
  Sparkles,
  Layers,
  Award,
  Calendar,
  FileText,
  Info,
  RotateCcw,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { StudyMode, AcademicLevel } from '../types';

interface NavbarProps {
  studyMode: StudyMode;
  onSelectStudyMode: (mode: StudyMode) => void;
  academicLevel: AcademicLevel;
  onSelectAcademicLevel: (level: AcademicLevel) => void;
  subject: string;
  onSelectSubject: (subject: string) => void;
  onOpenFlashcards: () => void;
  onOpenQuiz: () => void;
  onOpenStudyPlan: () => void;
  onOpenNotes: () => void;
  onOpenProjectSpecs: () => void;
  onNewChat: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  hasAttachedNotes: boolean;
}

const STUDY_MODES: { id: StudyMode; label: string; icon: string; desc: string }[] = [
  { id: 'progressive', label: 'Progressive (Basic ➔ Adv)', icon: '🚀', desc: '4-Tier response: Intuition, Mechanics, Rigor, Active Recall' },
  { id: 'basic', label: 'Basic & Intuitive', icon: '🟢', desc: 'Everyday analogies & simple conceptual clarity' },
  { id: 'advanced', label: 'Advanced Academic Rigor', icon: '🔴', desc: 'Graduate-level proofs, formal theorems & edge cases' },
  { id: 'socratic', label: 'Socratic Tutor', icon: '🏛️', desc: 'Guiding hints & questions, no raw answer dumping' },
  { id: 'code_analysis', label: 'CS & Algorithm Lab', icon: '💻', desc: 'Big-O complexity, dry-runs, and implementation' },
  { id: 'exam_prep', label: 'Exam Prep & Traps', icon: '📝', desc: 'Key formulas, mnemonic devices & common exam traps' },
];

const SUBJECTS = [
  'Computer Science',
  'Mathematics & Statistics',
  'Physics & Engineering',
  'Biology & Pre-Med',
  'Chemistry',
  'Economics & Finance',
  'Psychology & Humanities',
  'General Academic',
];

export const Navbar: React.FC<NavbarProps> = ({
  studyMode,
  onSelectStudyMode,
  academicLevel,
  onSelectAcademicLevel,
  subject,
  onSelectSubject,
  onOpenFlashcards,
  onOpenQuiz,
  onOpenStudyPlan,
  onOpenNotes,
  onOpenProjectSpecs,
  onNewChat,
  isDarkMode,
  onToggleDarkMode,
  hasAttachedNotes,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      {/* Primary Top Bar */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6 gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-md">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                ScholarAI
              </span>
              <span className="hidden sm:inline-block rounded-md bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-semibold px-1.5 py-0.5">
                College Edition
              </span>
            </div>
            <span className="block text-[10px] sm:text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
              Created by Harshit Pandey
            </span>
          </div>
        </div>

        {/* Center Study Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mode Selector Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/40 px-2.5 py-1.5 text-xs font-semibold text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors">
              <span>{STUDY_MODES.find((m) => m.id === studyMode)?.icon}</span>
              <span className="max-w-[130px] sm:max-w-none truncate">
                {STUDY_MODES.find((m) => m.id === studyMode)?.label}
              </span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>

            <div className="absolute left-0 mt-1 hidden w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl group-hover:block z-50">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select Pedagogical Mode
              </div>
              {STUDY_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => onSelectStudyMode(mode.id)}
                  className={`w-full text-left p-2 rounded-lg text-xs flex flex-col gap-0.5 transition-colors ${
                    studyMode === mode.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-medium'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{mode.icon}</span>
                    <span className="font-semibold">{mode.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 pl-5">{mode.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Academic Level */}
          <div className="relative group hidden lg:block">
            <select
              value={academicLevel}
              onChange={(e) => onSelectAcademicLevel(e.target.value as AcademicLevel)}
              className="text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <option value="High School / Freshman">Freshman / Beginner</option>
              <option value="Undergraduate">Undergraduate Level</option>
              <option value="Graduate">Graduate / Masters</option>
              <option value="Competitive Exam">Competitive / GRE / GATE</option>
            </select>
          </div>

          {/* Subject Preset */}
          <div className="relative group hidden sm:block">
            <select
              value={subject}
              onChange={(e) => onSelectSubject(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              {SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Notes Context */}
          <button
            onClick={onOpenNotes}
            title={hasAttachedNotes ? 'Lecture Notes Attached' : 'Attach Course Notes'}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              hasAttachedNotes
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">{hasAttachedNotes ? 'Notes Active' : 'Attach Notes'}</span>
          </button>

          {/* Flashcards */}
          <button
            onClick={onOpenFlashcards}
            className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
            title="Open Flashcards"
          >
            <Layers className="h-3.5 w-3.5 text-indigo-500" />
            <span className="hidden md:inline">Flashcards</span>
          </button>

          {/* Quiz */}
          <button
            onClick={onOpenQuiz}
            className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 transition-colors"
            title="Open Interactive Quiz"
          >
            <Award className="h-3.5 w-3.5 text-purple-500" />
            <span className="hidden md:inline">Quiz</span>
          </button>

          {/* Study Plan */}
          <button
            onClick={onOpenStudyPlan}
            className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-colors"
            title="Open Revision Roadmap"
          >
            <Calendar className="h-3.5 w-3.5 text-blue-500" />
            <span className="hidden md:inline">Plan</span>
          </button>

          {/* College Project Architecture & Viva Specs */}
          <button
            onClick={onOpenProjectSpecs}
            className="flex items-center gap-1 rounded-lg bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-200 dark:border-indigo-800/80 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:shadow-xs transition-all"
            title="College Project Specs & Viva Guide"
          >
            <Info className="h-3.5 w-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Project Specs</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>

          {/* New Chat */}
          <button
            onClick={onNewChat}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 hover:border-rose-200 transition-colors"
            title="New Chat Session"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
