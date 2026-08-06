export type ActiveTab = 
  | 'dashboard' 
  | 'modules' 
  | 'active-recall' 
  | 'results' 
  | 'performance' 
  | 'lifestyle' 
  | 'settings';

export type Language = 'en' | 'ar' | 'ar-eg';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  university: string;
  faculty: string;
  academicYear: string;
  studySystem?: string;
  role: string;
  language: Language;
  theme: ThemeMode;
}

export interface Lecture {
  id: string;
  moduleId: string;
  name: string;
  studied: boolean;
  solved: boolean;
  studyDate: string;
  notes: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'High-Yield';
  topicCategory?: string;
  inActiveRecall?: boolean;
}

export interface Module {
  id: string;
  name: string;
  icon: string;
  totalLectures: number;
  completedLectures: number;
  status: 'ACTIVE' | 'OPEN' | 'COMPLETED' | 'UPCOMING';
  color: string;
  description?: string;
  estimatedCompletionDate?: string;
}

export interface ActiveRecallItem {
  id: string;
  lectureId: string;
  lectureName: string;
  moduleName: string;
  dateStudied: string; // e.g. "2026-07-30"
  daysSinceStudy: number; // e.g. 7
  scheduledReviewDate: string; // dateStudied + 7 days
  reviewed: boolean;
  reviewedDate?: string;
  notes?: string;
  // Optional compatibility fields
  reviewCount?: number;
}

export interface AcademicResult {
  id: string;
  academicYear: string;
  moduleName: string;
  percentage: number; // e.g. 78.53
  dateLogged: string;
  notes?: string;
  aiConclusion?: {
    effortMatch: boolean;
    summary: string;
    suggestions: string[];
  };
}

export interface LifestyleEntry {
  id: string;
  date: string;
  sleepTime: string; // e.g. "23:30"
  wakeUpTime: string; // e.g. "06:30"
  sleepHours: number;
  exerciseMins: number;
  waterIntakeLiters: number;
  phoneUsageHours: number;
  studyHours: number;
  caffeineCups: number;
  badHabits: string[];
  habitsToQuit: string[];
  stressLevel: number; // 1-10
  mood: 'great' | 'good' | 'neutral' | 'tired' | 'stressed';
}

export interface LifestyleScores {
  lifestyleScore: number; // 0-100
  productivityScore: number; // 0-100
  disciplineScore: number; // 0-100
  sleepQuality: 'Poor' | 'Fair' | 'Good' | 'Optimal';
  mentalReadiness: 'Low' | 'Moderate' | 'High' | 'Peak';
}

export interface AcademicPrediction {
  predictedExamScore: number; // e.g. 88
  predictedGrade: string; // "A", "A+", "B+", etc.
  confidenceLevel: number; // e.g. 92%
  examReadiness: 'Low' | 'Moderate' | 'High' | 'Peak';
  targetGradeOrScore?: string; // e.g. "A+ (90%+)"
}

export interface MedicalJourneyMetrics {
  journeyScore: number; // weighted 0-100 (70% Studied+Solved + 30% Weekly Review Completed)
  scoreTrend: number; // +2.4%
  moduleCompletionRate: number; // percentage
  lectureCompletionRate: number; // percentage
  questionSolvingRate: number; // percentage
  weeklyReviewCompletionRate: number; // percentage
  pendingWeeklyReviewsCount: number;
  completedWeeklyReviewsCount: number;
  totalEligibleReviewsCount: number;
  solvedQuestionsTotal: number;
  studyConsistencyPercentage: number;
}

export interface AIInsight {
  id: string;
  category: 'Performance' | 'Active Recall' | 'Lifestyle' | 'Predictive';
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'tip';
  date: string;
}
