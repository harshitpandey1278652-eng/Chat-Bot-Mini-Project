import React, { useState } from 'react';
import { X, Sparkles, Calendar, Clock, CheckSquare, Square, Target, Lightbulb, Copy, Check, Download } from 'lucide-react';
import { StudyPlan } from '../types';

interface StudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyPlan: StudyPlan | null;
  onGeneratePlan: (subject: string, topic: string, days: number, dailyHours: number) => void;
  isLoading: boolean;
  currentSubject: string;
  currentTopic: string;
}

export const StudyPlanModal: React.FC<StudyPlanModalProps> = ({
  isOpen,
  onClose,
  studyPlan,
  onGeneratePlan,
  isLoading,
  currentSubject,
  currentTopic,
}) => {
  const [subject, setSubject] = useState(currentSubject || 'Computer Science');
  const [topic, setTopic] = useState(currentTopic || 'Data Structures & Algorithms');
  const [days, setDays] = useState(7);
  const [hours, setHours] = useState(2);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleCopy = () => {
    if (!studyPlan) return;
    let text = `# ${studyPlan.planTitle}\n${studyPlan.overview}\n\n`;
    studyPlan.dailySchedule.forEach((day) => {
      text += `## Day ${day.dayNumber}: ${day.title} (${day.tier} - ~${day.estimatedHours} hrs)\n`;
      text += `Tasks:\n${day.keyTasks.map((t) => `- [ ] ${t}`).join('\n')}\n`;
      if (day.practiceProblemIdea) text += `Practice: ${day.practiceProblemIdea}\n`;
      text += `Mastery Check: ${day.masteryCheck}\n\n`;
    });
    text += `### Pro Study Tips:\n${studyPlan.proStudyTips.map((t) => `- ${t}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!studyPlan) return;
    let text = `# ${studyPlan.planTitle}\n${studyPlan.overview}\n\n`;
    studyPlan.dailySchedule.forEach((day) => {
      text += `## Day ${day.dayNumber}: ${day.title} (${day.tier} - ~${day.estimatedHours} hrs)\n`;
      text += `Tasks:\n${day.keyTasks.map((t) => `- [ ] ${t}`).join('\n')}\n`;
      if (day.practiceProblemIdea) text += `Practice: ${day.practiceProblemIdea}\n`;
      text += `Mastery Check: ${day.masteryCheck}\n\n`;
    });
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyPlan-${topic.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Revision Roadmap & Study Plan</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paced milestones from foundational intuition to exam readiness
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

        {/* Input Parameters Toolbar */}
        <div className="p-4 bg-slate-50/70 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Course / Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-36 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-slate-800 dark:text-slate-100"
          />
          <input
            type="text"
            placeholder="Focus Topic (e.g. Operating Systems: Memory Management)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 min-w-[180px] text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-slate-800 dark:text-slate-100"
          />
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-slate-700 dark:text-slate-300"
          >
            <option value={5}>5 Days (Sprint)</option>
            <option value={7}>7 Days (1 Week)</option>
            <option value={14}>14 Days (2 Weeks)</option>
          </select>
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-slate-700 dark:text-slate-300"
          >
            <option value={1}>1 hr / day</option>
            <option value={2}>2 hrs / day</option>
            <option value={3}>3 hrs / day</option>
          </select>
          <button
            onClick={() => onGeneratePlan(subject, topic, days, hours)}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 text-xs font-medium shadow-xs transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isLoading ? 'Generating...' : 'Build Plan'}</span>
          </button>
          {studyPlan && (
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1"
                title="Copy Markdown"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1"
                title="Download Markdown"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                Designing tailored progressive study roadmap with Gemini 3.8 Flash...
              </p>
            </div>
          ) : !studyPlan ? (
            <div className="py-16 text-center space-y-3">
              <Calendar className="h-10 w-10 text-slate-400 mx-auto" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No study plan generated yet. Select your subject & exam horizon to create a custom study roadmap.
              </p>
              <button
                onClick={() => onGeneratePlan(subject, topic, days, hours)}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
              >
                Generate 7-Day Roadmap
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview Card */}
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30">
                <div className="flex items-center gap-2 mb-1.5">
                  <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {studyPlan.planTitle}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {studyPlan.overview}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                  <span className="bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded">
                    Duration: {studyPlan.totalDays} Days
                  </span>
                  <span className="bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded">
                    Subject: {studyPlan.targetSubject || subject}
                  </span>
                </div>
              </div>

              {/* Day-by-Day Schedule */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Daily Learning Milestones
                </h4>
                <div className="space-y-3">
                  {studyPlan.dailySchedule.map((day) => {
                    const tierBadgeColor =
                      day.tier?.toLowerCase().includes('foundation')
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : day.tier?.toLowerCase().includes('exam')
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
                        : day.tier?.toLowerCase().includes('advanced')
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300';

                    return (
                      <div
                        key={day.dayNumber}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white bg-slate-900 dark:bg-slate-700 px-2 py-0.5 rounded">
                              Day {day.dayNumber}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {day.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${tierBadgeColor}`}>
                              {day.tier}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                              <Clock className="h-3 w-3" />
                              ~{day.estimatedHours}h
                            </span>
                          </div>
                        </div>

                        {/* Tasks checklist */}
                        <div className="space-y-1.5 my-2.5">
                          {day.keyTasks.map((task, tIdx) => {
                            const taskId = `d${day.dayNumber}-t${tIdx}`;
                            const isDone = completedTasks[taskId];

                            return (
                              <div
                                key={taskId}
                                onClick={() => toggleTask(taskId)}
                                className="flex items-start gap-2.5 cursor-pointer text-xs group"
                              >
                                {isDone ? (
                                  <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-400 group-hover:text-blue-500 shrink-0 mt-0.5 transition-colors" />
                                )}
                                <span
                                  className={`leading-snug transition-colors ${
                                    isDone
                                      ? 'line-through text-slate-400 dark:text-slate-500'
                                      : 'text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {task}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Practice & Mastery */}
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {day.practiceProblemIdea && (
                            <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                ✏️ Practice Idea:
                              </span>{' '}
                              {day.practiceProblemIdea}
                            </div>
                          )}
                          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              🎯 Mastery Check:
                            </span>{' '}
                            {day.masteryCheck}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pro Study Tips */}
              {studyPlan.proStudyTips && studyPlan.proStudyTips.length > 0 && (
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30">
                  <div className="flex items-center gap-2 mb-2 text-amber-900 dark:text-amber-200 font-semibold text-xs">
                    <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>Academic Tutor Pro Tips for Exam Success</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {studyPlan.proStudyTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
