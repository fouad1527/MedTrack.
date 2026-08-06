import { Module, Lecture, ActiveRecallItem, AcademicResult, LifestyleEntry, UserProfile, AIInsight } from './types';

export const initialProfile: UserProfile = {
  id: 'user-01',
  name: 'Dr. Sarah Chen',
  email: 'sarah.chen@medtrack.io',
  avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&auto=format&fit=crop',
  university: 'Johns Hopkins University',
  faculty: 'School of Medicine',
  academicYear: 'PGY-2 (Internal Medicine)',
  studySystem: 'Credit Hours System',
  role: 'Medical Resident',
  language: 'en',
  theme: 'light',
};

export const initialModules: Module[] = [
  {
    id: 'mod-cardio',
    name: 'Cardiology',
    icon: 'favorite',
    totalLectures: 40,
    completedLectures: 30,
    status: 'ACTIVE',
    color: '#EF4444',
    description: 'Electrophysiology, Valve Disorders, Ischemic Heart Disease & Heart Failure',
    estimatedCompletionDate: 'Oct 28',
  },
  {
    id: 'mod-neuro',
    name: 'Neurology',
    icon: 'psychology',
    totalLectures: 28,
    completedLectures: 12,
    status: 'OPEN',
    color: '#6366F1',
    description: 'Cranio-facial Nerves, Cerebrovascular Accidents, Motor Tracts & Neuropathies',
    estimatedCompletionDate: 'Nov 14',
  },
  {
    id: 'mod-hema',
    name: 'Hematology',
    icon: 'water_drop',
    totalLectures: 15,
    completedLectures: 0,
    status: 'UPCOMING',
    color: '#F43F5E',
    description: 'Anemias, Hemostasis Disorders, Leukemia Classification & Lymphomas',
    estimatedCompletionDate: 'Dec 02',
  },
  {
    id: 'mod-pulmo',
    name: 'Pulmonology',
    icon: 'air',
    totalLectures: 22,
    completedLectures: 22,
    status: 'COMPLETED',
    color: '#0EA5E9',
    description: 'Restrictive vs Obstructive Diseases, Arterial Blood Gases, Mechanical Ventilation',
    estimatedCompletionDate: 'Completed',
  },
  {
    id: 'mod-nephro',
    name: 'Nephrology',
    icon: 'water',
    totalLectures: 25,
    completedLectures: 18,
    status: 'ACTIVE',
    color: '#10B981',
    description: 'Glomerulonephritis, Acute Kidney Injury, Electrolyte Disturbances & Acid-Base',
    estimatedCompletionDate: 'Nov 20',
  },
];

export const initialLectures: Lecture[] = [
  {
    id: 'lec-neuro-1',
    moduleId: 'mod-neuro',
    name: 'Anatomy of the Brain & Cerebrum',
    studied: true,
    solved: true,
    studyDate: '2026-10-12',
    notes: 'Key anatomical landmarks: Central sulcus, Precentral gyrus (motor), Postcentral gyrus (sensory).',
    difficulty: 'Medium',
    topicCategory: 'Central',
    inActiveRecall: true,
  },
  {
    id: 'lec-neuro-2',
    moduleId: 'mod-neuro',
    name: 'Cranial Nerves I - VI',
    studied: true,
    solved: false,
    studyDate: '2026-10-14',
    notes: 'Focus on CN III oculomotor palsy vs Horner syndrome ptosis differentiation.',
    difficulty: 'Hard',
    topicCategory: 'Peripheral',
    inActiveRecall: false,
  },
  {
    id: 'lec-neuro-3',
    moduleId: 'mod-neuro',
    name: 'Cranial Nerves VII - XII',
    studied: false,
    solved: false,
    studyDate: '2026-10-16',
    notes: 'Bell palsy vs central facial paralysis motor upper face sparing.',
    difficulty: 'Medium',
    topicCategory: 'Peripheral',
    inActiveRecall: false,
  },
  {
    id: 'lec-neuro-4',
    moduleId: 'mod-neuro',
    name: 'Spinal Cord Tracts & Lesions',
    studied: false,
    solved: false,
    studyDate: '2026-10-18',
    notes: 'Dorsal columns (proprioception/vibration) vs Spinothalamic (pain/temp) decussation.',
    difficulty: 'High-Yield',
    topicCategory: 'Central',
    inActiveRecall: false,
  },
  {
    id: 'lec-cardio-1',
    moduleId: 'mod-cardio',
    name: 'ECG Interpretation & Arrhythmias',
    studied: true,
    solved: true,
    studyDate: '2026-09-28',
    notes: 'Atrial Fibrillation vs Atrial Flutter sawtooth waves. AV Nodal Reentrant Tachycardia management.',
    difficulty: 'High-Yield',
    topicCategory: 'Electrophysiology',
    inActiveRecall: true,
  },
  {
    id: 'lec-cardio-2',
    moduleId: 'mod-cardio',
    name: 'Infective Endocarditis Criteria',
    studied: true,
    solved: true,
    studyDate: '2026-10-02',
    notes: 'Duke Criteria: Major (positive blood cultures, echo vegetation) and minor criteria.',
    difficulty: 'Medium',
    topicCategory: 'Valvular',
    inActiveRecall: true,
  },
  {
    id: 'lec-pulmo-1',
    moduleId: 'mod-pulmo',
    name: 'Arterial Blood Gas Analysis (ABG)',
    studied: true,
    solved: true,
    studyDate: '2026-09-15',
    notes: 'Anion gap calculation: Na - (Cl + HCO3). Metabolic acidosis with respiratory compensation.',
    difficulty: 'Easy',
    topicCategory: 'Physiology',
    inActiveRecall: true,
  },
];

const getRelativeDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const initialActiveRecall: ActiveRecallItem[] = [
  {
    id: 'ar-rev-1',
    lectureId: 'lec-cardio-2',
    lectureName: 'Infective Endocarditis Criteria',
    moduleName: 'Cardiology',
    dateStudied: getRelativeDate(-8), // Studied 8 days ago
    daysSinceStudy: 8,
    scheduledReviewDate: getRelativeDate(-1), // Due 1 day ago (ready for review!)
    reviewed: false,
    notes: 'Duke Criteria: 2 major, or 1 major + 3 minor, or 5 minor criteria.',
  },
  {
    id: 'ar-rev-2',
    lectureId: 'lec-neuro-1',
    lectureName: 'Anatomy of the Brain & Cerebrum',
    moduleName: 'Neurology',
    dateStudied: getRelativeDate(-7), // Studied 7 days ago
    daysSinceStudy: 7,
    scheduledReviewDate: getRelativeDate(0), // Scheduled for review TODAY!
    reviewed: false,
    notes: 'Cerebral cortex lobes, motor strip, somatosensory area, circle of Willis.',
  },
  {
    id: 'ar-rev-3',
    lectureId: 'lec-cardio-1',
    lectureName: 'ECG Interpretation & Arrhythmias',
    moduleName: 'Cardiology',
    dateStudied: getRelativeDate(-10), // Studied 10 days ago
    daysSinceStudy: 10,
    scheduledReviewDate: getRelativeDate(-3), // Due 3 days ago
    reviewed: false,
    notes: 'P-wave, QRS, T-wave. Atrial fibrillation shows irregularly irregular rhythm without P waves.',
  },
  {
    id: 'ar-rev-4',
    lectureId: 'lec-pulmo-1',
    lectureName: 'Arterial Blood Gas Analysis (ABG)',
    moduleName: 'Pulmonology',
    dateStudied: getRelativeDate(-14),
    daysSinceStudy: 14,
    scheduledReviewDate: getRelativeDate(-7),
    reviewed: true,
    reviewedDate: getRelativeDate(-7),
    notes: 'Anion gap calculation: Na - (Cl + HCO3). Metabolic acidosis with respiratory compensation.',
  },
];

export const initialAcademicResults: AcademicResult[] = [
  {
    id: 'res-1',
    academicYear: 'Year 3',
    moduleName: 'Cardiology Block Exam',
    percentage: 88.5,
    dateLogged: '2026-09-30',
    notes: 'Exceeded expected class average by 12 points.',
    aiConclusion: {
      effortMatch: true,
      summary: 'Exceptional mastery. You scored in the top 5% of your cohort. Consistent retrieval practice shows strong retention in electrophysiology concepts.',
      suggestions: [
        'Maintain current spaced repetition schedule.',
        'Apply high-yield question banks for valvular murmurs.',
      ],
    },
  },
  {
    id: 'res-2',
    academicYear: 'Year 3',
    moduleName: 'Neurology Midterm Exam',
    percentage: 82.4,
    dateLogged: '2026-10-08',
    notes: 'Solid performance; missed a few cranial nerve pathway trick questions.',
    aiConclusion: {
      effortMatch: true,
      summary: 'You achieved 82.4%. MedTrack expected 84%. Your result was very close to the predicted outcome based on mock exam performance.',
      suggestions: [
        'Focus specifically on peripheral motor tract decussations.',
        'Increase question bank volume on brainstem syndromes.',
      ],
    },
  },
  {
    id: 'res-3',
    academicYear: 'Year 2',
    moduleName: 'Pharmacology Final Exam',
    percentage: 68.2,
    dateLogged: '2026-06-15',
    notes: 'Difficult exam with heavy pharmacokinetics emphasis.',
    aiConclusion: {
      effortMatch: false,
      summary: 'Consistency was high but practice question volume was low. Increase question practice specifically targeting pharmacokinetics.',
      suggestions: [
        'Solve at least 25 questions daily on drug clearance and volume of distribution.',
        'Integrate Active Recall cards for cytochrome P450 inhibitors/inducers.',
      ],
    },
  },
  {
    id: 'res-4',
    academicYear: 'Year 2',
    moduleName: 'Immunology & Allergy Block',
    percentage: 91.0,
    dateLogged: '2026-05-20',
    notes: 'Outstanding score.',
    aiConclusion: {
      effortMatch: true,
      summary: 'Outstanding performance. Your spaced repetition adherence for this module was 98%, directly correlating with this result.',
      suggestions: ['Use this same review pattern for upcoming Hematology block.'],
    },
  },
];

export const initialLifestyleEntry: LifestyleEntry = {
  id: 'life-today',
  date: new Date().toISOString().split('T')[0],
  sleepTime: '23:30',
  wakeUpTime: '06:00',
  sleepHours: 6.5,
  exerciseMins: 30,
  waterIntakeLiters: 2.2,
  phoneUsageHours: 1.8,
  studyHours: 7.5,
  caffeineCups: 2,
  badHabits: ['Late night screen usage'],
  habitsToQuit: ['Excessive caffeine after 4 PM'],
  stressLevel: 4,
  mood: 'good',
};

export const initialInsights: AIInsight[] = [
  {
    id: 'ins-1',
    category: 'Performance',
    title: 'Study Window Optimization',
    description: 'Based on your retention metrics, you perform 15% better on practice blocks completed between 08:00 AM and 11:30 AM.',
    type: 'positive',
    date: 'Today',
  },
  {
    id: 'ins-2',
    category: 'Lifestyle',
    title: 'Caffeine & Exam Focus Correlation',
    description: 'Days with >3 cups of caffeine correlate with a 7% spike in error rate during evening active recall reviews.',
    type: 'warning',
    date: 'Yesterday',
  },
  {
    id: 'ins-3',
    category: 'Predictive',
    title: 'Predicted Academic Score Range',
    description: 'Based on current module mastery and solved questions, you are on track for an overall grade of A (88% - 94%).',
    type: 'tip',
    date: '2 days ago',
  },
];
