import React, { useState } from 'react';
import { X, FileText, Check, Trash2, BookOpen, AlertCircle } from 'lucide-react';

interface NotesContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachedNotes: string;
  onSaveNotes: (notes: string) => void;
}

const SAMPLE_NOTES = [
  {
    title: 'CS: Graphs & Dijkstra',
    text: `Course: CS301 Algorithms
Topic: Single-Source Shortest Paths
Key theorems: Dijkstra algorithm runs in O((V + E) log V) with min-priority queue (binary heap).
Constraints: All edge weights must be non-negative w(u,v) >= 0. If negative edge exists, must use Bellman-Ford (O(VE)).
Exam Question focus: Hand-trace relaxation steps for 5-vertex graph and state why Dijkstra fails on negative cycles.`,
  },
  {
    title: 'Math: Eigenvalues & Vectors',
    text: `Course: MATH220 Linear Algebra
Characteristic Equation: det(A - lambda*I) = 0.
Eigenspace: null space of (A - lambda*I).
Diagonalizability theorem: An n x n matrix is diagonalizable iff it has n linearly independent eigenvectors.
Application: Principal Component Analysis (PCA) and PageRank power iteration.`,
  },
  {
    title: 'Biology: Cell Signaling Pathways',
    text: `Course: BIO210 Molecular Biology
Topic: GPCR (G-Protein Coupled Receptor) Cascade
Mechanism: Ligand binds GPCR -> GDP swapped for GTP on alpha subunit -> activates Adenylyl Cyclase -> converts ATP to cAMP (second messenger) -> activates Protein Kinase A (PKA) -> phosphorylation of target enzymes.
Exam alert: Contrast GPCR with Receptor Tyrosine Kinases (RTKs) autophosphorylation.`,
  },
];

export const NotesContextModal: React.FC<NotesContextModalProps> = ({
  isOpen,
  onClose,
  attachedNotes,
  onSaveNotes,
}) => {
  const [text, setText] = useState(attachedNotes || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveNotes(text);
    onClose();
  };

  const handleClear = () => {
    setText('');
    onSaveNotes('');
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Attach Study Material & Lecture Notes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ground the AI chatbot directly in your college syllabus or assignment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Preset quick buttons */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Load Quick Sample College Notes:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_NOTES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setText(sample.text)}
                className="text-xs px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="p-6 space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Paste your lecture notes, textbook excerpt, professor's slides text, homework prompt, or syllabus outline here... The AI will prioritize this material in every response."
            className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 p-4 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono leading-relaxed"
          />

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              {wordCount} words ({text.length} characters)
            </span>
            {text.trim() && (
              <button
                onClick={handleClear}
                className="text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear Notes</span>
              </button>
            )}
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Once attached, the AI will contextualize its explanations, flashcards, and quizzes to directly reflect these course definitions and notation styles!
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 px-6 py-3 bg-slate-50 dark:bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Check className="h-4 w-4" />
            <span>Apply to Chat Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
