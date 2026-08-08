import { Module, Lecture, ActiveRecallItem, AcademicResult, LifestyleEntry, UserProfile, AIInsight } from './types';

export const initialProfile: UserProfile = {
  id: '',
  name: 'Medical Student',
  email: '',
  avatarUrl: '',
  university: '',
  faculty: '',
  academicYear: 'Medical Student',
  studySystem: 'Credit Hours System',
  role: 'Student',
  language: 'en',
  theme: 'light',
};

export const initialModules: Module[] = [];

export const initialLectures: Lecture[] = [];

export const initialActiveRecall: ActiveRecallItem[] = [];

export const initialAcademicResults: AcademicResult[] = [];

export const initialLifestyleEntry: LifestyleEntry = {
  id: 'ls-default',
  date: new Date().toISOString().split('T')[0],
  sleepTime: '23:00',
  wakeUpTime: '07:00',
  sleepHours: 7.5,
  exerciseMins: 30,
  waterIntakeLiters: 2.5,
  phoneUsageHours: 2.0,
  studyHours: 4.0,
  caffeineCups: 1,
  badHabits: [],
  habitsToQuit: [],
  stressLevel: 3,
  mood: 'good',
};

export const initialInsights: AIInsight[] = [];
