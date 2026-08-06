import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  UserProfile, 
  Module, 
  Lecture, 
  ActiveRecallItem, 
  AcademicResult, 
  LifestyleEntry, 
  LifestyleScores,
  MedicalJourneyMetrics,
  AcademicPrediction,
  AIInsight,
  ActiveTab,
  Language,
  ThemeMode
} from '../types';
import { 
  initialProfile, 
  initialModules, 
  initialLectures, 
  initialActiveRecall, 
  initialAcademicResults, 
  initialLifestyleEntry, 
  initialInsights 
} from '../mockData';

interface MedTrackContextType {
  // Navigation & User State
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  
  // Data State
  modules: Module[];
  lectures: Lecture[];
  activeRecallList: ActiveRecallItem[];
  academicResults: AcademicResult[];
  lifestyle: LifestyleEntry;
  insights: AIInsight[];
  
  // Computed State
  journeyMetrics: MedicalJourneyMetrics;
  lifestyleScores: LifestyleScores;
  prediction: AcademicPrediction;
  
  // Module & Lecture Actions
  addModule: (moduleData: Omit<Module, 'id' | 'completedLectures'>) => void;
  deleteModule: (moduleId: string) => void;
  addLecture: (lectureData: Omit<Lecture, 'id' | 'inActiveRecall'>) => void;
  toggleLectureStudied: (lectureId: string) => void;
  toggleLectureSolved: (lectureId: string) => void;
  deleteLecture: (lectureId: string) => void;
  
  // Active Recall Actions
  toggleActiveRecallItemReviewed: (itemId: string) => void;
  
  // Results Actions
  addAcademicResult: (resultData: Omit<AcademicResult, 'id' | 'dateLogged'>) => Promise<void>;
  deleteAcademicResult: (resultId: string) => void;
  
  // Lifestyle Actions
  updateLifestyle: (updates: Partial<LifestyleEntry>) => void;
  
  // Data Export & Reset
  exportDataJSON: () => void;
  resetDemoData: () => void;
}

const MedTrackContext = createContext<MedTrackContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'medtrack_app_state_v1';

export const MedTrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem(LOCAL_STORAGE_KEY + '_authenticated');
    return savedAuth === 'true';
  });
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Load from localStorage or default mock data
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_user');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [modules, setModules] = useState<Module[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_modules');
    return saved ? JSON.parse(saved) : initialModules;
  });

  const [lectures, setLectures] = useState<Lecture[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_lectures');
    return saved ? JSON.parse(saved) : initialLectures;
  });

  const [activeRecallList, setActiveRecallList] = useState<ActiveRecallItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_activeRecall');
    return saved ? JSON.parse(saved) : initialActiveRecall;
  });

  const [academicResults, setAcademicResults] = useState<AcademicResult[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_results');
    return saved ? JSON.parse(saved) : initialAcademicResults;
  });

  const [lifestyle, setLifestyle] = useState<LifestyleEntry>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_lifestyle');
    return saved ? JSON.parse(saved) : initialLifestyleEntry;
  });

  const [insights, setInsights] = useState<AIInsight[]>(initialInsights);

  // Supabase Auth Listener & Initial Session Check
  useEffect(() => {
    let mounted = true;

    async function initAuthSession() {
      try {
        if (isSupabaseConfigured()) {
          const { data: { session } } = await supabase.auth.getSession();
          if (mounted) {
            if (session?.user) {
              setIsAuthenticated(true);
              localStorage.setItem(LOCAL_STORAGE_KEY + '_authenticated', 'true');
              const fullName = session.user.user_metadata?.full_name || user.name;
              setUser(prev => ({
                ...prev,
                id: session.user.id,
                email: session.user.email || prev.email,
                name: fullName,
              }));
            }
          }
        }
      } catch (err) {
        console.error('Error getting Supabase auth session:', err);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    }

    initAuthSession();

    let authSubscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setIsAuthenticated(true);
          localStorage.setItem(LOCAL_STORAGE_KEY + '_authenticated', 'true');
          const fullName = session.user.user_metadata?.full_name || user.name;
          setUser(prev => ({
            ...prev,
            id: session.user.id,
            email: session.user.email || prev.email,
            name: fullName,
          }));
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          localStorage.setItem(LOCAL_STORAGE_KEY + '_authenticated', 'false');
        }
      });
      authSubscription = subscription;
    }

    return () => {
      mounted = false;
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

  // Sync theme to <html> and <body> tags
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const isDark = user.theme === 'dark' || (user.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      body.classList.add('light');
      body.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [user.theme]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_modules', JSON.stringify(modules));
  }, [modules]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_lectures', JSON.stringify(lectures));
  }, [lectures]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_activeRecall', JSON.stringify(activeRecallList));
  }, [activeRecallList]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_results', JSON.stringify(academicResults));
  }, [academicResults]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_lifestyle', JSON.stringify(lifestyle));
  }, [lifestyle]);

  // Auth functions
  const login = async (email: string, password?: string): Promise<boolean> => {
    setAuthError(null);
    try {
      if (isSupabaseConfigured() && password) {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setAuthError(error.message);
          return false;
        }

        if (data.user) {
          const fullName = data.user.user_metadata?.full_name || user.name;
          setUser(prev => ({ ...prev, id: data.user.id, email: data.user.email || email, name: fullName }));
          setIsAuthenticated(true);
          localStorage.setItem(LOCAL_STORAGE_KEY + '_authenticated', 'true');
          return true;
        }
      }

      // Fallback local / demo authentication
      setUser(prev => ({ ...prev, email }));
      setIsAuthenticated(true);
      localStorage.setItem(LOCAL_STORAGE_KEY + '_authenticated', 'true');
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign in. Please check your credentials.');
      return false;
    }
  };

  const register = async (fullName: string, email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          setAuthError(error.message);
          return false;
        }

        if (data.user) {
          setUser(prev => ({
            ...prev,
            id: data.user.id,
            email: data.user.email || email,
            name: fullName,
          }));
          setIsAuthenticated(true);
          localStorage.setItem(LOCAL_STORAGE_KEY + '_authenticated', 'true');
          return true;
        }
      }

      // Local registration fallback
      setUser(prev => ({
        ...prev,
        name: fullName,
        email,
      }));
      setIsAuthenticated(true);
      localStorage.setItem(LOCAL_STORAGE_KEY + '_authenticated', 'true');
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed. Please try again.');
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setAuthError(null);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          setAuthError(error.message);
          return false;
        }
        return true;
      }
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Password reset request failed.');
      return false;
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
      localStorage.setItem(LOCAL_STORAGE_KEY + '_authenticated', 'false');
      setActiveTab('dashboard');
    }
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  // Spaced repetition intervals: 1d, 3d, 7d, 14d, 30d, 60d, 90d
  const SPACING_INTERVALS = [1, 3, 7, 14, 30, 60, 90];

  // Helper to re-evaluate automatic 7-Day Weekly Review triggering
  // Rule: ONLY triggered when BOTH Studied AND Solved are true.
  // Review is automatically scheduled exactly 7 days after studyDate.
  const checkActiveRecallTrigger = (updatedLectures: Lecture[]) => {
    let updatedRecall = [...activeRecallList];
    const todayStr = new Date().toISOString().split('T')[0];

    updatedLectures.forEach(lec => {
      const isStudiedAndSolved = lec.studied && lec.solved;
      const existingIndex = updatedRecall.findIndex(ar => ar.lectureId === lec.id);

      if (isStudiedAndSolved) {
        const studyDate = lec.studyDate || todayStr;
        // Calculate 7 days after study date
        const studyDateObj = new Date(studyDate);
        const scheduledObj = new Date(studyDateObj.getTime() + 7 * 86400000);
        const scheduledReviewDate = scheduledObj.toISOString().split('T')[0];

        const diffMs = new Date(todayStr).getTime() - studyDateObj.getTime();
        const daysSinceStudy = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        if (existingIndex === -1) {
          const moduleName = modules.find(m => m.id === lec.moduleId)?.name || 'General Module';
          const newItem: ActiveRecallItem = {
            id: 'wr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            lectureId: lec.id,
            lectureName: lec.name,
            moduleName,
            dateStudied: studyDate,
            daysSinceStudy,
            scheduledReviewDate,
            reviewed: false,
            notes: lec.notes || '',
          };
          updatedRecall.push(newItem);
        } else {
          // Keep daysSinceStudy updated
          updatedRecall[existingIndex] = {
            ...updatedRecall[existingIndex],
            daysSinceStudy,
            notes: lec.notes || updatedRecall[existingIndex].notes,
          };
        }
      } else {
        // If un-checked, automatically remove from Weekly Review list
        if (existingIndex !== -1) {
          updatedRecall.splice(existingIndex, 1);
        }
      }
    });

    setActiveRecallList(updatedRecall);
  };

  // Module actions
  const addModule = (moduleData: Omit<Module, 'id' | 'completedLectures'>) => {
    const newMod: Module = {
      ...moduleData,
      id: 'mod-' + Date.now(),
      completedLectures: 0,
    };
    setModules(prev => [...prev, newMod]);
  };

  const deleteModule = (moduleId: string) => {
    setModules(prev => prev.filter(m => m.id !== moduleId));
    setLectures(prev => prev.filter(l => l.moduleId !== moduleId));
  };

  // Lecture actions
  const addLecture = (lectureData: Omit<Lecture, 'id' | 'inActiveRecall'>) => {
    const newLec: Lecture = {
      ...lectureData,
      id: 'lec-' + Date.now(),
      inActiveRecall: lectureData.studied && lectureData.solved,
    };

    const updated = [...lectures, newLec];
    setLectures(updated);

    // Update module completed lectures based on studied status
    setModules(prev => prev.map(m => {
      if (m.id === newLec.moduleId) {
        const moduleLectures = updated.filter(l => l.moduleId === m.id);
        const studiedCount = moduleLectures.filter(l => l.studied).length;
        const targetTotal = Math.max(m.totalLectures || 0, moduleLectures.length);
        return {
          ...m,
          totalLectures: targetTotal,
          completedLectures: studiedCount,
        };
      }
      return m;
    }));

    checkActiveRecallTrigger(updated);
  };

  const toggleLectureStudied = (lectureId: string) => {
    const updated = lectures.map(l => {
      if (l.id === lectureId) {
        const nextStudied = !l.studied;
        return {
          ...l,
          studied: nextStudied,
          inActiveRecall: nextStudied && l.solved,
        };
      }
      return l;
    });

    setLectures(updated);

    // Recalculate module completed counts based on studied status
    setModules(prev => prev.map(m => {
      const moduleLectures = updated.filter(l => l.moduleId === m.id);
      const studiedCount = moduleLectures.filter(l => l.studied).length;
      return { ...m, completedLectures: studiedCount };
    }));

    checkActiveRecallTrigger(updated);
  };

  const toggleLectureSolved = (lectureId: string) => {
    const updated = lectures.map(l => {
      if (l.id === lectureId) {
        const nextSolved = !l.solved;
        return {
          ...l,
          solved: nextSolved,
          inActiveRecall: l.studied && nextSolved,
        };
      }
      return l;
    });

    setLectures(updated);

    // Recalculate module completed counts based on studied status
    setModules(prev => prev.map(m => {
      const moduleLectures = updated.filter(l => l.moduleId === m.id);
      const studiedCount = moduleLectures.filter(l => l.studied).length;
      return { ...m, completedLectures: studiedCount };
    }));

    checkActiveRecallTrigger(updated);
  };

  const deleteLecture = (lectureId: string) => {
    const updated = lectures.filter(l => l.id !== lectureId);
    setLectures(updated);
    setActiveRecallList(prev => prev.filter(ar => ar.lectureId !== lectureId));

    setModules(prev => prev.map(m => {
      const moduleLectures = updated.filter(l => l.moduleId === m.id);
      const studiedCount = moduleLectures.filter(l => l.studied).length;
      return { ...m, completedLectures: studiedCount };
    }));
  };

  // Weekly Review Actions
  const toggleActiveRecallItemReviewed = (itemId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];

    setActiveRecallList(prev => prev.map(item => {
      if (item.id === itemId) {
        const nextReviewed = !item.reviewed;
        return {
          ...item,
          reviewed: nextReviewed,
          reviewedDate: nextReviewed ? todayStr : undefined,
        };
      }
      return item;
    }));
  };

  // Results actions with AI analytical comparison
  const addAcademicResult = async (resultData: Omit<AcademicResult, 'id' | 'dateLogged'>) => {
    // Generate AI analytical conclusion based on effort vs result
    const totalLec = lectures.length || 1;
    const studiedLec = lectures.filter(l => l.studied).length;
    const solvedLec = lectures.filter(l => l.solved).length;
    const studyRatio = Math.round((studiedLec / totalLec) * 100);

    let summary = '';
    let effortMatch = true;
    let suggestions: string[] = [];

    if (resultData.percentage >= 85) {
      effortMatch = studyRatio >= 60;
      summary = `Exceptional score of ${resultData.percentage}%. Your effort in lecture coverage and active recall directly matched your high exam yield!`;
      suggestions = [
        'Maintain current study cadence and review schedules.',
        'Consider mentoring junior students or tackling higher-difficulty Step question blocks.',
      ];
    } else if (resultData.percentage >= 75) {
      summary = `Solid score of ${resultData.percentage}%. Close to optimal expectation. Minor gaps in solved question volume identified.`;
      suggestions = [
        'Increase daily solved question quota by 15-20%.',
        'Review missed questions and tag specific concept cards.',
      ];
    } else {
      effortMatch = false;
      summary = `Score of ${resultData.percentage}% indicates a mismatch between study time and active retention. Focus needed on high-yield recall over passive reading.`;
      suggestions = [
        'Shift focus from passive lecture viewing to solving practice questions.',
        'Use spaced repetition review daily before starting new modules.',
      ];
    }

    const newResult: AcademicResult = {
      ...resultData,
      id: 'res-' + Date.now(),
      dateLogged: new Date().toISOString().split('T')[0],
      aiConclusion: {
        effortMatch,
        summary,
        suggestions,
      },
    };

    setAcademicResults(prev => [newResult, ...prev]);
  };

  const deleteAcademicResult = (resultId: string) => {
    setAcademicResults(prev => prev.filter(r => r.id !== resultId));
  };

  // Lifestyle actions
  const updateLifestyle = (updates: Partial<LifestyleEntry>) => {
    setLifestyle(prev => ({ ...prev, ...updates }));
  };

  // Computed Lifestyle Scores
  const computeLifestyleScores = (): LifestyleScores => {
    let score = 70;
    
    // Sleep calculation (6.5h - 8.5h is optimal)
    if (lifestyle.sleepHours >= 7 && lifestyle.sleepHours <= 9) score += 10;
    else if (lifestyle.sleepHours < 6) score -= 10;

    // Exercise
    if (lifestyle.exerciseMins >= 30) score += 8;

    // Water
    if (lifestyle.waterIntakeLiters >= 2.0) score += 5;

    // Caffeine & Phone
    if (lifestyle.caffeineCups <= 2) score += 4;
    else if (lifestyle.caffeineCups > 4) score -= 6;

    if (lifestyle.phoneUsageHours <= 2) score += 5;
    else if (lifestyle.phoneUsageHours >= 4) score -= 8;

    // Stress impact
    score -= (lifestyle.stressLevel - 4) * 2;

    const finalScore = Math.max(30, Math.min(100, score));
    
    return {
      lifestyleScore: finalScore,
      productivityScore: Math.min(100, Math.round(finalScore * 0.95 + (lifestyle.studyHours / 8) * 10)),
      disciplineScore: Math.min(100, Math.round(finalScore * 0.9 + (lifestyle.exerciseMins > 0 ? 10 : 0))),
      sleepQuality: lifestyle.sleepHours >= 7.5 ? 'Optimal' : lifestyle.sleepHours >= 6.5 ? 'Good' : 'Fair',
      mentalReadiness: finalScore >= 85 ? 'Peak' : finalScore >= 70 ? 'High' : finalScore >= 55 ? 'Moderate' : 'Low',
    };
  };

  const lifestyleScores = computeLifestyleScores();

  // Computed Medical Journey Score
  // Progress System:
  // Studied + Solved = 70% of the lecture score.
  // Weekly Review completed = remaining 30%.
  const computeJourneyMetrics = (): MedicalJourneyMetrics => {
    const totalLecCount = lectures.length || 1;
    const studiedLecCount = lectures.filter(l => l.studied).length;
    const solvedLecCount = lectures.filter(l => l.solved).length;

    const moduleCompPct = modules.length 
      ? Math.round(modules.reduce((acc, m) => acc + (m.totalLectures ? (m.completedLectures / m.totalLectures) : 0), 0) / modules.length * 100)
      : 50;

    const lectureCompPct = Math.min(100, Math.round((studiedLecCount / totalLecCount) * 100));
    const questionSolvingPct = Math.min(100, Math.round((solvedLecCount / totalLecCount) * 100));

    const todayStr = new Date().toISOString().split('T')[0];

    // Evaluate lecture-by-lecture scores for the 70% + 30% journey score:
    let totalLecturePoints = 0;
    
    lectures.forEach(lec => {
      let lecPoints = 0;
      const isStudiedAndSolved = lec.studied && lec.solved;

      if (isStudiedAndSolved) {
        // Base 70% earned for completing both Studied + Solved
        lecPoints += 70;

        // Check Weekly Review status
        const reviewItem = activeRecallList.find(ar => ar.lectureId === lec.id);
        if (reviewItem) {
          if (reviewItem.reviewed) {
            // Completed weekly review -> remaining 30%
            lecPoints += 30;
          } else if (reviewItem.scheduledReviewDate > todayStr) {
            // Scheduled for future -> student is on track, count as full 100%
            lecPoints += 30;
          } else {
            // Review date has arrived or passed, but not reviewed yet -> only 70%
            lecPoints += 0;
          }
        } else {
          lecPoints += 30;
        }
      } else {
        if (lec.studied) lecPoints += 35;
        if (lec.solved) lecPoints += 35;
      }

      totalLecturePoints += lecPoints;
    });

    const journeyScore = Math.min(100, Math.max(0, Math.round(totalLecturePoints / totalLecCount)));

    // Weekly review specific counts
    const eligibleReviews = activeRecallList;
    const pendingReviews = eligibleReviews.filter(ar => !ar.reviewed && ar.scheduledReviewDate <= todayStr);
    const completedReviews = eligibleReviews.filter(ar => ar.reviewed);

    const weeklyReviewCompPct = eligibleReviews.length > 0
      ? Math.round((completedReviews.length / eligibleReviews.length) * 100)
      : 100;

    return {
      journeyScore,
      scoreTrend: 2.4,
      moduleCompletionRate: moduleCompPct,
      lectureCompletionRate: lectureCompPct,
      questionSolvingRate: questionSolvingPct,
      weeklyReviewCompletionRate: weeklyReviewCompPct,
      pendingWeeklyReviewsCount: pendingReviews.length,
      completedWeeklyReviewsCount: completedReviews.length,
      totalEligibleReviewsCount: eligibleReviews.length,
      solvedQuestionsTotal: solvedLecCount * 25,
      studyConsistencyPercentage: Math.min(100, Math.round(journeyScore * 0.95)),
    };
  };

  const journeyMetrics = computeJourneyMetrics();

  // Academic Prediction Model
  const prediction: AcademicPrediction = {
    predictedExamScore: Math.round(journeyMetrics.journeyScore * 0.92 + 10),
    predictedGrade: journeyMetrics.journeyScore >= 88 ? 'A+' : journeyMetrics.journeyScore >= 82 ? 'A' : journeyMetrics.journeyScore >= 75 ? 'B+' : 'B',
    confidenceLevel: 92,
    examReadiness: journeyMetrics.journeyScore >= 80 ? 'High' : 'Moderate',
    targetGradeOrScore: 'A+ (90%+)',
  };

  // Export & Reset
  const exportDataJSON = () => {
    const fullData = {
      profile: user,
      modules,
      lectures,
      activeRecallList,
      academicResults,
      lifestyle,
      exportDate: new Date().toISOString(),
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(fullData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `medtrack-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const resetDemoData = () => {
    setUser(initialProfile);
    setModules(initialModules);
    setLectures(initialLectures);
    setActiveRecallList(initialActiveRecall);
    setAcademicResults(initialAcademicResults);
    setLifestyle(initialLifestyleEntry);
    localStorage.clear();
  };

  return (
    <MedTrackContext.Provider
      value={{
        activeTab,
        setActiveTab,
        user,
        updateUser,
        isAuthenticated,
        authLoading,
        authError,
        login,
        register,
        resetPassword,
        logout,
        modules,
        lectures,
        activeRecallList,
        academicResults,
        lifestyle,
        insights,
        journeyMetrics,
        lifestyleScores,
        prediction,
        addModule,
        deleteModule,
        addLecture,
        toggleLectureStudied,
        toggleLectureSolved,
        deleteLecture,
        toggleActiveRecallItemReviewed,
        addAcademicResult,
        deleteAcademicResult,
        updateLifestyle,
        exportDataJSON,
        resetDemoData,
      }}
    >
      {children}
    </MedTrackContext.Provider>
  );
};

export const useMedTrack = () => {
  const context = useContext(MedTrackContext);
  if (!context) {
    throw new Error('useMedTrack must be used within a MedTrackProvider');
  }
  return context;
};
