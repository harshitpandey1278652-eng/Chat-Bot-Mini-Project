import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, XCircle, Award, RotateCcw, HelpCircle, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '../types';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizQuestions: QuizQuestion[];
  onGenerateNew: (topic: string, count: number, difficulty: string) => void;
  isLoading: boolean;
  currentTopic: string;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  quizQuestions,
  onGenerateNew,
  isLoading,
  currentTopic,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [customTopic, setCustomTopic] = useState(currentTopic || '');
  const [difficulty, setDifficulty] = useState('Undergraduate');

  // Reset quiz state when new questions arrive
  useEffect(() => {
    setSelectedAnswers({});
    setShowResults(false);
  }, [quizQuestions]);

  if (!isOpen) return null;

  const totalQuestions = quizQuestions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const correctCount = quizQuestions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.correctIndex ? 1 : 0);
  }, 0);

  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (selectedAnswers[questionIdx] !== undefined) return; // already answered
    const updated = { ...selectedAnswers, [questionIdx]: optionIdx };
    setSelectedAnswers(updated);

    if (Object.keys(updated).length === totalQuestions) {
      setShowResults(true);
      const isHighPass = (correctCount + (optionIdx === quizQuestions[questionIdx].correctIndex ? 1 : 0)) / totalQuestions >= 0.7;
      if (isHighPass) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Assessment & Quiz</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Self-evaluation & conceptual diagnostic testing
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

        {/* Generator Toolbar */}
        <div className="p-4 bg-slate-50/70 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Subject or subtopic (e.g., QuickSort, Bayes Theorem, Photosynthesis)"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            className="flex-1 min-w-[200px] text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-slate-700 dark:text-slate-300"
          >
            <option value="Basic Fundamentals">Basic Fundamentals</option>
            <option value="Undergraduate">Undergraduate Level</option>
            <option value="Graduate / Advanced">Graduate / Advanced</option>
          </select>
          <button
            onClick={() => onGenerateNew(customTopic || currentTopic || 'Core Subject Matter', 5, difficulty)}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3 py-1.5 text-xs font-medium shadow-xs transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isLoading ? 'Creating Quiz...' : 'New Quiz'}</span>
          </button>
          {quizQuestions.length > 0 && (
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1"
              title="Reset Answers"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-purple-600 border-t-transparent" />
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                Drafting university exam-grade MCQs with Gemini 3.8 Flash...
              </p>
            </div>
          ) : !quizQuestions || quizQuestions.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <HelpCircle className="h-10 w-10 text-slate-400 mx-auto" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No quiz ready yet. Click "New Quiz" to test your mastery of this topic!
              </p>
              <button
                onClick={() => onGenerateNew(customTopic || currentTopic || 'Core Subject Concepts', 5, difficulty)}
                className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm font-medium"
              >
                Generate 5-Question Quiz
              </button>
            </div>
          ) : (
            <>
              {/* Score summary bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">
                    Progress: {answeredCount} / {totalQuestions} answered
                  </span>
                </div>
                {answeredCount > 0 && (
                  <div className="text-xs font-bold text-purple-700 dark:text-purple-300">
                    Current Score: {correctCount}/{answeredCount} ({Math.round((correctCount / answeredCount) * 100)}%)
                  </div>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {quizQuestions.map((q, qIndex) => {
                  const userAnswer = selectedAnswers[qIndex];
                  const hasAnswered = userAnswer !== undefined;
                  const isCorrect = userAnswer === q.correctIndex;

                  return (
                    <div
                      key={q.id || `q-${qIndex}`}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded-md">
                          Question {qIndex + 1}
                        </span>
                        {q.difficulty && (
                          <span className="text-[11px] text-slate-400 font-medium">
                            {q.difficulty}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 leading-relaxed">
                        {q.question}
                      </h3>

                      {/* Options */}
                      <div className="space-y-2">
                        {q.options.map((option, optIndex) => {
                          let optStyle =
                            'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:border-purple-300 dark:hover:border-purple-600';

                          if (hasAnswered) {
                            if (optIndex === q.correctIndex) {
                              optStyle =
                                'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-medium';
                            } else if (userAnswer === optIndex) {
                              optStyle =
                                'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200';
                            } else {
                              optStyle = 'opacity-50 border-slate-200 dark:border-slate-800 text-slate-400';
                            }
                          }

                          return (
                            <button
                              key={optIndex}
                              onClick={() => handleSelectOption(qIndex, optIndex)}
                              disabled={hasAnswered}
                              className={`w-full text-left p-3 rounded-lg border text-sm transition-all flex items-start gap-3 ${optStyle}`}
                            >
                              <span className="font-mono text-xs font-bold uppercase shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span className="flex-1">{option}</span>
                              {hasAnswered && optIndex === q.correctIndex && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              )}
                              {hasAnswered && userAnswer === optIndex && !isCorrect && (
                                <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation box after answering */}
                      {hasAnswered && (
                        <div
                          className={`mt-4 p-3.5 rounded-lg text-xs leading-relaxed border ${
                            isCorrect
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
                              : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300'
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1.5 mb-1">
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Correct! Academic Breakdown:</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                                <span>Exam Trap Analysis:</span>
                              </>
                            )}
                          </div>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Completion Banner */}
              {answeredCount === totalQuestions && (
                <div className="p-6 rounded-2xl bg-linear-to-r from-purple-900 via-indigo-900 to-slate-900 text-white text-center shadow-xl space-y-3">
                  <Award className="h-10 w-10 text-amber-400 mx-auto" />
                  <h3 className="text-xl font-bold">Quiz Complete!</h3>
                  <p className="text-sm text-slate-300">
                    You scored <strong className="text-amber-300 text-lg">{correctCount}</strong> out of {totalQuestions} ({scorePercent}%)
                  </p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {scorePercent >= 80
                      ? 'Outstanding college-level grasp! You are ready for advanced applications.'
                      : scorePercent >= 60
                      ? 'Solid foundation. Review the flagged conceptual traps to achieve mastery.'
                      : 'Good diagnostic attempt. Switch chat to "Progressive: Basic to Advanced" to review core mechanics.'}
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium"
                    >
                      Retake Quiz
                    </button>
                    <button
                      onClick={() => onGenerateNew(customTopic || currentTopic, 5, difficulty)}
                      className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold shadow-md"
                    >
                      Generate Another Quiz
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
