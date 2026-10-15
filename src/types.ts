export type StudyMode =
  | 'progressive'
  | 'basic'
  | 'advanced'
  | 'socratic'
  | 'code_analysis'
  | 'exam_prep';

export type AcademicLevel =
  | 'High School / Freshman'
  | 'Undergraduate'
  | 'Graduate'
  | 'Competitive Exam';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  studyMode?: StudyMode;
  audioUrl?: string;
  isAudioLoading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  subject: string;
  academicLevel: AcademicLevel;
  studyMode: StudyMode;
  messages: Message[];
  attachedNotes?: string;
  updatedAt: number;
}

export interface Flashcard {
  id: string;
  frontQuestion: string;
  backAnswer: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced' | string;
  keyTerm: string;
  quickTip?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: string;
  topicArea?: string;
}

export interface StudyPlanDay {
  dayNumber: number;
  title: string;
  tier: string;
  estimatedHours: number;
  keyTasks: string[];
  practiceProblemIdea?: string;
  masteryCheck: string;
}

export interface StudyPlan {
  planTitle: string;
  overview: string;
  targetSubject: string;
  totalDays: number;
  dailySchedule: StudyPlanDay[];
  proStudyTips: string[];
}
