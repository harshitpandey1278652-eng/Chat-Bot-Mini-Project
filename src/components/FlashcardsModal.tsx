import React, { useState } from 'react';
import { X, Sparkles, RotateCw, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Layers, Shuffle, Download } from 'lucide-react';
import { Flashcard } from '../types';

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashcards: Flashcard[];
  onGenerateNew: (topic: string, count: number, difficulty: string) => void;
  isLoading: boolean;
  currentTopic: string;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  isOpen,
  onClose,
  flashcards,
  onGenerateNew,
  isLoading,
  currentTopic,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [customTopic, setCustomTopic] = useState(currentTopic || '');
  const [cardDifficulty, setCardDifficulty] = useState('All Levels');

  if (!isOpen) return null;

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;
  const masteredCount = masteredIds.size;
  const progressPercent = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % totalCards);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  const toggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExport = () => {
    const text = flashcards
      .map(
        (c, i) =>
          `Card ${i + 1} [${c.difficulty || 'General'}]\nQ: ${c.frontQuestion}\nA: ${c.backAnswer}\nKey Concept: ${c.keyTerm}\nTip: ${c.quickTip || 'None'}\n\n`
      )
      .join('---\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Flashcards-${customTopic || 'study'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Recall Flashcards</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Spaced repetition & concept mastery for college exams
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

        {/* Generator Controls */}
        <div className="p-4 bg-slate-50/70 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Topic (e.g., Dynamic Programming, Thermodynamics, Mitosis)"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            className="flex-1 min-w-[200px] text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={cardDifficulty}
            onChange={(e) => setCardDifficulty(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-slate-700 dark:text-slate-300"
          >
            <option value="All Levels">All Levels (Basic to Adv)</option>
            <option value="Basic Fundamentals">Basic Fundamentals</option>
            <option value="Undergraduate Exam">Undergraduate Exam</option>
            <option value="Graduate Deep-Dive">Graduate Deep-Dive</option>
          </select>
          <button
            onClick={() => onGenerateNew(customTopic || currentTopic || 'Key Course Concepts', 6, cardDifficulty)}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-1.5 text-xs font-medium shadow-xs transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isLoading ? 'Generating...' : 'Regenerate'}</span>
          </button>
          {flashcards.length > 0 && (
            <button
              onClick={handleExport}
              title="Download Flashcards"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                Synthesizing high-yield study cards using Gemini 3.8 Flash...
              </p>
            </div>
          ) : !flashcards || flashcards.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Layers className="h-10 w-10 text-slate-400 mx-auto" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No flashcards created yet. Click Generate to create an active recall deck for this topic!
              </p>
              <button
                onClick={() => onGenerateNew(customTopic || currentTopic || 'Core Subject Concepts', 6, cardDifficulty)}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium"
              >
                Generate 6 Cards Now
              </button>
            </div>
          ) : currentCard ? (
            <div className="w-full max-w-lg space-y-4">
              {/* Progress and status */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Card {currentIndex + 1} of {totalCards}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  {masteredCount} Mastered ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="group relative min-h-[260px] w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-linear-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-6 shadow-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      currentCard.difficulty?.toLowerCase().includes('basic')
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : currentCard.difficulty?.toLowerCase().includes('adv')
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {currentCard.difficulty || 'Concept'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <RotateCw className="h-3.5 w-3.5" />
                    <span>Click to flip</span>
                  </div>
                </div>

                {/* Card Face */}
                <div className="my-auto py-4 text-center">
                  {!isFlipped ? (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-indigo-500 font-bold mb-2">
                        Question / Prompt
                      </p>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {currentCard.frontQuestion}
                      </h3>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold mb-2">
                        Answer & Explanation
                      </p>
                      <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                        {currentCard.backAnswer}
                      </p>
                      {currentCard.keyTerm && (
                        <div className="mt-3 inline-block rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 text-xs text-indigo-700 dark:text-indigo-300 font-mono">
                          Key Term: <strong>{currentCard.keyTerm}</strong>
                        </div>
                      )}
                      {currentCard.quickTip && (
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
                          💡 Exam Tip: {currentCard.quickTip}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {isFlipped ? 'Side: Answer' : 'Side: Question'}
                  </span>
                  <button
                    onClick={(e) => toggleMastered(currentCard.id, e)}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      masteredIds.has(currentCard.id)
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>{masteredIds.has(currentCard.id) ? 'Mastered!' : 'Mark Mastered'}</span>
                  </button>
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-xs"
                  title="Previous card"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Flip Space
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-xs"
                  title="Next card"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
