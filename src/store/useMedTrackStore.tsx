import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  ActiveTab
} from '../types';

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

const emptyProfile: UserProfile = {
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

const defaultLifestyle: LifestyleEntry = {
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

export const MedTrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [user, setUser] = useState<UserProfile>(emptyProfile);
  const [modules, setModules] = useState<Module[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [activeRecallList, setActiveRecallList] = useState<ActiveRecallItem[]>([]);
  const [academicResults, setAcademicResults] = useState<AcademicResult[]>([]);
  const [lifestyle, setLifestyle] = useState<LifestyleEntry>(defaultLifestyle);
  const [insights, setInsights] = useState<AIInsight[]>([]);

  // Ref to prevent premature save overwrites during data fetching
  const isSyncingFromSupabase = useRef<boolean>(false);

  // Clear memory state completely
  const clearWorkspaceState = () => {
    setUser(emptyProfile);
    setModules([]);
    setLectures([]);
    setActiveRecallList([]);
    setAcademicResults([]);
    setLifestyle(defaultLifestyle);
    setInsights([]);
  };

  // Function to load workspace data strictly from server database API & Supabase
  const loadWorkspaceFromSupabase = async (userId: string, email?: string, name?: string) => {
    if (!userId && !email) return;
    isSyncingFromSupabase.current = true;

    try {
      let loadedProfile: UserProfile | null = null;
      let loadedModules: Module[] | null = null;
      let loadedLectures: Lecture[] | null = null;
      let loadedRecall: ActiveRecallItem[] | null = null;
      let loadedResults: AcademicResult[] | null = null;
      let loadedLifestyle: LifestyleEntry | null = null;

      // 1. Load from persistent server database API
      try {
        const apiRes = await fetch('/api/workspace/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, email }),
        });
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.success && apiData.workspace) {
            const w = apiData.workspace;
            loadedProfile = w.profile;
            loadedModules = w.modules;
            loadedLectures = w.lectures;
            loadedRecall = w.activeRecallList;
            loadedResults = w.academicResults;
            loadedLifestyle = w.lifestyle;
          }
        }
      } catch (err) {
        console.warn('Backend API workspace get warning:', err);
      }

      // 2. Query Supabase Database tables & Auth Metadata where user_id = userId if configured
      let meta: any = {};
      let userEmail = email || '';
      if (isSupabaseConfigured()) {
        try {
          const { data: authUserData } = await supabase.auth.getUser();
          if (authUserData?.user) {
            meta = authUserData.user.user_metadata || {};
            userEmail = authUserData.user.email || userEmail;
          }

          const [profRes, modRes, lecRes, arRes, resRes, lifeRes] = await Promise.allSettled([
            supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
            supabase.from('modules').select('*').eq('user_id', userId),
            supabase.from('lectures').select('*').eq('user_id', userId),
            supabase.from('active_recall').select('*').eq('user_id', userId),
            supabase.from('results').select('*').eq('user_id', userId),
            supabase.from('lifestyle').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(1),
          ]);

          if (profRes.status === 'fulfilled' && profRes.value.data) {
            const p = profRes.value.data;
            loadedProfile = {
              id: p.id,
              name: p.name || name || loadedProfile?.name || 'Medical Student',
              email: p.email || userEmail || loadedProfile?.email || '',
              avatarUrl: p.avatar_url || loadedProfile?.avatarUrl || '',
              university: p.university || loadedProfile?.university || '',
              faculty: p.faculty || loadedProfile?.faculty || '',
              academicYear: p.academic_year || loadedProfile?.academicYear || 'Medical Student',
              studySystem: p.study_system || loadedProfile?.studySystem || 'Credit Hours System',
              role: p.role || loadedProfile?.role || 'Student',
              language: p.language || loadedProfile?.language || 'en',
              theme: p.theme || loadedProfile?.theme || 'light',
            };
          }

          if (modRes.status === 'fulfilled' && Array.isArray(modRes.value.data) && modRes.value.data.length > 0) {
            loadedModules = modRes.value.data.map(m => ({
              id: m.id,
              name: m.name,
              icon: m.icon || 'layers',
              totalLectures: Number(m.total_lectures || 0),
              completedLectures: Number(m.completed_lectures || 0),
              status: m.status || 'ACTIVE',
              color: m.color || 'blue',
              description: m.description || '',
              estimatedCompletionDate: m.estimated_completion_date || 'TBD',
            }));
          }

          if (lecRes.status === 'fulfilled' && Array.isArray(lecRes.value.data) && lecRes.value.data.length > 0) {
            loadedLectures = lecRes.value.data.map(l => ({
              id: l.id,
              moduleId: l.module_id,
              name: l.name,
              difficulty: (l.difficulty as any) || 'High-Yield',
              topicCategory: l.topic_category || 'General',
              studyDate: l.study_date || '',
              studied: Boolean(l.studied),
              solved: Boolean(l.solved),
              inActiveRecall: Boolean(l.in_active_recall),
              notes: l.notes || '',
            }));
          }

          if (arRes.status === 'fulfilled' && Array.isArray(arRes.value.data) && arRes.value.data.length > 0) {
            loadedRecall = arRes.value.data.map(ar => ({
              id: ar.id,
              lectureId: ar.lecture_id,
              lectureName: ar.lecture_name,
              moduleName: ar.module_name,
              dateStudied: ar.date_studied,
              daysSinceStudy: Number(ar.days_since_study || 0),
              scheduledReviewDate: ar.scheduled_review_date,
              reviewed: Boolean(ar.reviewed),
              reviewedDate: ar.reviewed_date || undefined,
              notes: ar.notes || '',
            }));
          }

          if (resRes.status === 'fulfilled' && Array.isArray(resRes.value.data) && resRes.value.data.length > 0) {
            loadedResults = resRes.value.data.map(r => ({
              id: r.id,
              academicYear: r.academic_year || 'Current Year',
              moduleName: r.module_name,
              percentage: Number(r.percentage),
              notes: r.notes || '',
              dateLogged: r.date_logged || '',
              aiConclusion: r.ai_conclusion || { effortMatch: true, summary: '', suggestions: [] },
            }));
          }

          if (lifeRes.status === 'fulfilled' && Array.isArray(lifeRes.value.data) && lifeRes.value.data.length > 0) {
            const l = lifeRes.value.data[0];
            loadedLifestyle = {
              id: l.id,
              date: l.date,
              sleepTime: l.sleep_time || '23:00',
              wakeUpTime: l.wake_up_time || '07:00',
              sleepHours: Number(l.sleep_hours || 7.5),
              exerciseMins: Number(l.exercise_mins || 30),
              waterIntakeLiters: Number(l.water_intake_liters || 2.5),
              phoneUsageHours: Number(l.phone_usage_hours || 2.0),
              studyHours: Number(l.study_hours || 4.0),
              caffeineCups: Number(l.caffeine_cups || 1),
              badHabits: l.bad_habits || [],
              habitsToQuit: l.habits_to_quit || [],
              stressLevel: Number(l.stress_level || 3),
              mood: l.mood || 'good',
            };
          }
        } catch (supabaseErr) {
          console.warn('Supabase query warning:', supabaseErr);
        }
      }

      // 3. Fallback / Merge with Auth Metadata
      const fallbackProfile: UserProfile = meta.profile || {
        ...emptyProfile,
        id: userId,
        email: userEmail || email || '',
        name: name || meta.full_name || (userEmail ? userEmail.split('@')[0] : 'Medical Student'),
      };

      const finalProfile = loadedProfile || fallbackProfile;
      const finalModules = loadedModules || meta.modules || [];
      const finalLectures = loadedLectures || meta.lectures || [];
      const finalRecall = loadedRecall || meta.activeRecallList || [];
      const finalResults = loadedResults || meta.academicResults || [];
      const finalLifestyle = loadedLifestyle || meta.lifestyle || { ...defaultLifestyle, id: 'ls-' + userId };

      finalProfile.id = userId;
      if (userEmail || email) finalProfile.email = userEmail || email || '';

      setUser(finalProfile);
      setModules(finalModules);
      setLectures(finalLectures);
      setActiveRecallList(finalRecall);
      setAcademicResults(finalResults);
      setLifestyle(finalLifestyle);

      // Save active session for instant restoration on refresh
      localStorage.setItem('medtrack_active_session', JSON.stringify({
        userId,
        email: finalProfile.email,
        name: finalProfile.name
      }));
    } catch (err) {
      console.error('Failed to load workspace:', err);
    } finally {
      isSyncingFromSupabase.current = false;
    }
  };

  // Master function to sync updated workspace to Server Database API & Supabase
  const syncWorkspaceToSupabase = async (
    updatedProfile: UserProfile,
    updatedModules: Module[],
    updatedLectures: Lecture[],
    updatedRecall: ActiveRecallItem[],
    updatedResults: AcademicResult[],
    updatedLifestyle: LifestyleEntry
  ) => {
    if (!updatedProfile.id || isSyncingFromSupabase.current) return;

    const userId = updatedProfile.id;
    const email = updatedProfile.email;

    // 1. Sync to persistent server database API
    try {
      await fetch('/api/workspace/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email,
          profile: updatedProfile,
          modules: updatedModules,
          lectures: updatedLectures,
          activeRecallList: updatedRecall,
          academicResults: updatedResults,
          lifestyle: updatedLifestyle,
        }),
      });
    } catch (err) {
      console.error('Error syncing workspace to server API:', err);
    }

    // 2. Sync to Supabase Auth Cloud User Metadata & Tables if Supabase configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: updatedProfile.name,
            profile: updatedProfile,
            modules: updatedModules,
            lectures: updatedLectures,
            activeRecallList: updatedRecall,
            academicResults: updatedResults,
            lifestyle: updatedLifestyle,
          },
        });

        await supabase.from('profiles').upsert({
          id: userId,
          name: updatedProfile.name,
          email: updatedProfile.email,
          avatar_url: updatedProfile.avatarUrl,
          university: updatedProfile.university,
          faculty: updatedProfile.faculty,
          academic_year: updatedProfile.academicYear,
          study_system: updatedProfile.studySystem,
          role: updatedProfile.role,
          language: updatedProfile.language,
          theme: updatedProfile.theme,
          updated_at: new Date().toISOString(),
        });

        if (updatedModules.length > 0) {
          await supabase.from('modules').upsert(
            updatedModules.map(m => ({
              id: m.id,
              user_id: userId,
              name: m.name,
              icon: m.icon,
              total_lectures: m.totalLectures,
              completed_lectures: m.completedLectures,
              status: m.status,
              color: m.color,
              description: m.description,
              estimated_completion_date: m.estimatedCompletionDate,
            }))
          );
        }

        if (updatedLectures.length > 0) {
          await supabase.from('lectures').upsert(
            updatedLectures.map(l => ({
              id: l.id,
              user_id: userId,
              module_id: l.moduleId,
              name: l.name,
              difficulty: l.difficulty,
              topic_category: l.topicCategory,
              study_date: l.studyDate,
              studied: l.studied,
              solved: l.solved,
              in_active_recall: l.inActiveRecall,
              notes: l.notes,
            }))
          );
        }

        if (updatedRecall.length > 0) {
          await supabase.from('active_recall').upsert(
            updatedRecall.map(ar => ({
              id: ar.id,
              user_id: userId,
              lecture_id: ar.lectureId,
              lecture_name: ar.lectureName,
              module_name: ar.moduleName,
              date_studied: ar.dateStudied,
              days_since_study: ar.daysSinceStudy,
              scheduled_review_date: ar.scheduledReviewDate,
              reviewed: ar.reviewed,
              reviewed_date: ar.reviewedDate,
              notes: ar.notes,
            }))
          );
        }

        if (updatedResults.length > 0) {
          await supabase.from('results').upsert(
            updatedResults.map(r => ({
              id: r.id,
              user_id: userId,
              academic_year: r.academicYear,
              module_name: r.moduleName,
              percentage: r.percentage,
              notes: r.notes,
              date_logged: r.dateLogged,
              ai_conclusion: r.aiConclusion,
            }))
          );
        }

        await supabase.from('lifestyle').upsert({
          id: updatedLifestyle.id || ('ls-' + userId),
          user_id: userId,
          date: updatedLifestyle.date,
          sleep_time: updatedLifestyle.sleepTime,
          wake_up_time: updatedLifestyle.wakeUpTime,
          sleep_hours: updatedLifestyle.sleepHours,
          exercise_mins: updatedLifestyle.exerciseMins,
          water_intake_liters: updatedLifestyle.waterIntakeLiters,
          phone_usage_hours: updatedLifestyle.phoneUsageHours,
          study_hours: updatedLifestyle.studyHours,
          caffeine_cups: updatedLifestyle.caffeineCups,
          bad_habits: updatedLifestyle.badHabits,
          habits_to_quit: updatedLifestyle.habitsToQuit,
          stress_level: updatedLifestyle.stressLevel,
          mood: updatedLifestyle.mood,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase sync warning:', err);
      }
    }
  };

  // Initial Auth Session Check
  useEffect(() => {
    let mounted = true;

    async function initAuthSession() {
      try {
        const storedSession = localStorage.getItem('medtrack_active_session');
        if (storedSession) {
          try {
            const { userId, email, name } = JSON.parse(storedSession);
            if (userId && mounted) {
              await loadWorkspaceFromSupabase(userId, email, name);
              setIsAuthenticated(true);
              return;
            }
          } catch (e) {
            console.warn('Error reading stored session:', e);
          }
        }

        if (isSupabaseConfigured()) {
          const { data: { session } } = await supabase.auth.getSession();
          if (mounted && session?.user) {
            setIsAuthenticated(true);
            await loadWorkspaceFromSupabase(
              session.user.id,
              session.user.email,
              session.user.user_metadata?.full_name
            );
            return;
          }
        }

        if (mounted) {
          setIsAuthenticated(false);
          clearWorkspaceState();
        }
      } catch (err) {
        console.error('Error initializing auth session:', err);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    }

    initAuthSession();

    let authSubscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session?.user) {
          setIsAuthenticated(true);
          await loadWorkspaceFromSupabase(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.full_name
          );
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          clearWorkspaceState();
        }
      });
      authSubscription = subscription;
    }

    return () => {
      mounted = false;
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

  // Sync theme mode to document root
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

  // Auth Functions
  const login = async (email: string, password?: string): Promise<boolean> => {
    setAuthError(null);
    try {
      // 1. Authenticate with server API database
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Invalid credentials.');
        return false;
      }

      // 2. Also authenticate with Supabase in background if configured and password provided
      if (isSupabaseConfigured() && password) {
        supabase.auth.signInWithPassword({ email, password }).catch((e) => console.warn('Supabase signin background notice:', e));
      }

      const userObj = data.user;
      await loadWorkspaceFromSupabase(userObj.id, userObj.email, userObj.fullName);
      setIsAuthenticated(true);
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign in. Please check your network connection.');
      return false;
    }
  };

  const register = async (fullName: string, email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    try {
      // 1. Register with server API database
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Registration failed.');
        return false;
      }

      // 2. Also attempt Supabase signup in background if configured
      if (isSupabaseConfigured()) {
        supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        }).catch((e) => console.warn('Supabase signup background notice:', e));
      }

      const userObj = data.user;
      await loadWorkspaceFromSupabase(userObj.id, userObj.email, userObj.fullName);
      setIsAuthenticated(true);
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
      }
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Password reset request failed.');
      return false;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('medtrack_active_session');
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut().catch(() => {});
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
      clearWorkspaceState();
      setActiveTab('dashboard');
    }
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    syncWorkspaceToSupabase(updated, modules, lectures, activeRecallList, academicResults, lifestyle);
  };

  // Spaced Repetition Trigger Logic
  const checkActiveRecallTrigger = (updatedLectures: Lecture[]): ActiveRecallItem[] => {
    let updatedRecall = [...activeRecallList];
    const todayStr = new Date().toISOString().split('T')[0];

    updatedLectures.forEach(lec => {
      const isStudiedAndSolved = lec.studied && lec.solved;
      const existingIndex = updatedRecall.findIndex(ar => ar.lectureId === lec.id);

      if (isStudiedAndSolved) {
        const studyDate = lec.studyDate || todayStr;
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
          updatedRecall[existingIndex] = {
            ...updatedRecall[existingIndex],
            daysSinceStudy,
            notes: lec.notes || updatedRecall[existingIndex].notes,
          };
        }
      } else {
        if (existingIndex !== -1) {
          updatedRecall.splice(existingIndex, 1);
        }
      }
    });

    return updatedRecall;
  };

  // Module actions
  const addModule = (moduleData: Omit<Module, 'id' | 'completedLectures'>) => {
    const newMod: Module = {
      ...moduleData,
      id: 'mod-' + Date.now(),
      completedLectures: 0,
    };
    const updatedMods = [...modules, newMod];
    setModules(updatedMods);
    syncWorkspaceToSupabase(user, updatedMods, lectures, activeRecallList, academicResults, lifestyle);
  };

  const deleteModule = (moduleId: string) => {
    const updatedMods = modules.filter(m => m.id !== moduleId);
    const updatedLecs = lectures.filter(l => l.moduleId !== moduleId);
    const updatedRecall = activeRecallList.filter(ar => {
      const lec = lectures.find(l => l.id === ar.lectureId);
      return lec ? lec.moduleId !== moduleId : true;
    });

    setModules(updatedMods);
    setLectures(updatedLecs);
    setActiveRecallList(updatedRecall);

    if (isSupabaseConfigured() && user.id) {
      supabase.from('modules').delete().eq('id', moduleId).eq('user_id', user.id);
      supabase.from('lectures').delete().eq('module_id', moduleId).eq('user_id', user.id);
    }

    syncWorkspaceToSupabase(user, updatedMods, updatedLecs, updatedRecall, academicResults, lifestyle);
  };

  // Lecture actions
  const addLecture = (lectureData: Omit<Lecture, 'id' | 'inActiveRecall'>) => {
    const newLec: Lecture = {
      ...lectureData,
      id: 'lec-' + Date.now(),
      inActiveRecall: lectureData.studied && lectureData.solved,
    };

    const updatedLecs = [...lectures, newLec];
    setLectures(updatedLecs);

    const updatedMods = modules.map(m => {
      if (m.id === newLec.moduleId) {
        const moduleLectures = updatedLecs.filter(l => l.moduleId === m.id);
        const studiedCount = moduleLectures.filter(l => l.studied).length;
        const targetTotal = Math.max(m.totalLectures || 0, moduleLectures.length);
        return {
          ...m,
          totalLectures: targetTotal,
          completedLectures: studiedCount,
        };
      }
      return m;
    });
    setModules(updatedMods);

    const updatedRecall = checkActiveRecallTrigger(updatedLecs);
    setActiveRecallList(updatedRecall);

    syncWorkspaceToSupabase(user, updatedMods, updatedLecs, updatedRecall, academicResults, lifestyle);
  };

  const toggleLectureStudied = (lectureId: string) => {
    const updatedLecs = lectures.map(l => {
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

    setLectures(updatedLecs);

    const updatedMods = modules.map(m => {
      const moduleLectures = updatedLecs.filter(l => l.moduleId === m.id);
      const studiedCount = moduleLectures.filter(l => l.studied).length;
      return { ...m, completedLectures: studiedCount };
    });
    setModules(updatedMods);

    const updatedRecall = checkActiveRecallTrigger(updatedLecs);
    setActiveRecallList(updatedRecall);

    syncWorkspaceToSupabase(user, updatedMods, updatedLecs, updatedRecall, academicResults, lifestyle);
  };

  const toggleLectureSolved = (lectureId: string) => {
    const updatedLecs = lectures.map(l => {
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

    setLectures(updatedLecs);

    const updatedMods = modules.map(m => {
      const moduleLectures = updatedLecs.filter(l => l.moduleId === m.id);
      const studiedCount = moduleLectures.filter(l => l.studied).length;
      return { ...m, completedLectures: studiedCount };
    });
    setModules(updatedMods);

    const updatedRecall = checkActiveRecallTrigger(updatedLecs);
    setActiveRecallList(updatedRecall);

    syncWorkspaceToSupabase(user, updatedMods, updatedLecs, updatedRecall, academicResults, lifestyle);
  };

  const deleteLecture = (lectureId: string) => {
    const updatedLecs = lectures.filter(l => l.id !== lectureId);
    const updatedRecall = activeRecallList.filter(ar => ar.lectureId !== lectureId);

    setLectures(updatedLecs);
    setActiveRecallList(updatedRecall);

    const updatedMods = modules.map(m => {
      const moduleLectures = updatedLecs.filter(l => l.moduleId === m.id);
      const studiedCount = moduleLectures.filter(l => l.studied).length;
      return { ...m, completedLectures: studiedCount };
    });
    setModules(updatedMods);

    if (isSupabaseConfigured() && user.id) {
      supabase.from('lectures').delete().eq('id', lectureId).eq('user_id', user.id);
      supabase.from('active_recall').delete().eq('lecture_id', lectureId).eq('user_id', user.id);
    }

    syncWorkspaceToSupabase(user, updatedMods, updatedLecs, updatedRecall, academicResults, lifestyle);
  };

  // Active Recall Actions
  const toggleActiveRecallItemReviewed = (itemId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];

    const updatedRecall = activeRecallList.map(item => {
      if (item.id === itemId) {
        const nextReviewed = !item.reviewed;
        return {
          ...item,
          reviewed: nextReviewed,
          reviewedDate: nextReviewed ? todayStr : undefined,
        };
      }
      return item;
    });

    setActiveRecallList(updatedRecall);
    syncWorkspaceToSupabase(user, modules, lectures, updatedRecall, academicResults, lifestyle);
  };

  // Academic Results Actions
  const addAcademicResult = async (resultData: Omit<AcademicResult, 'id' | 'dateLogged'>) => {
    const totalLec = lectures.length || 1;
    const studiedLec = lectures.filter(l => l.studied).length;
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

    const updatedResults = [newResult, ...academicResults];
    setAcademicResults(updatedResults);
    syncWorkspaceToSupabase(user, modules, lectures, activeRecallList, updatedResults, lifestyle);
  };

  const deleteAcademicResult = (resultId: string) => {
    const updatedResults = academicResults.filter(r => r.id !== resultId);
    setAcademicResults(updatedResults);

    if (isSupabaseConfigured() && user.id) {
      supabase.from('results').delete().eq('id', resultId).eq('user_id', user.id);
    }

    syncWorkspaceToSupabase(user, modules, lectures, activeRecallList, updatedResults, lifestyle);
  };

  // Lifestyle Actions
  const updateLifestyle = (updates: Partial<LifestyleEntry>) => {
    const updatedLife = { ...lifestyle, ...updates };
    setLifestyle(updatedLife);
    syncWorkspaceToSupabase(user, modules, lectures, activeRecallList, academicResults, updatedLife);
  };

  // Computed Lifestyle Scores
  const computeLifestyleScores = (): LifestyleScores => {
    let score = 70;
    
    if (lifestyle.sleepHours >= 7 && lifestyle.sleepHours <= 9) score += 10;
    else if (lifestyle.sleepHours < 6) score -= 10;

    if (lifestyle.exerciseMins >= 30) score += 8;
    if (lifestyle.waterIntakeLiters >= 2.0) score += 5;

    if (lifestyle.caffeineCups <= 2) score += 4;
    else if (lifestyle.caffeineCups > 4) score -= 6;

    if (lifestyle.phoneUsageHours <= 2) score += 5;
    else if (lifestyle.phoneUsageHours >= 4) score -= 8;

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
  const computeJourneyMetrics = (): MedicalJourneyMetrics => {
    const totalLecCount = lectures.length;
    const studiedLecCount = lectures.filter(l => l.studied).length;
    const solvedLecCount = lectures.filter(l => l.solved).length;

    const moduleCompPct = modules.length 
      ? Math.round(modules.reduce((acc, m) => acc + (m.totalLectures ? (m.completedLectures / m.totalLectures) : 0), 0) / modules.length * 100)
      : 0;

    const lectureCompPct = totalLecCount ? Math.min(100, Math.round((studiedLecCount / totalLecCount) * 100)) : 0;
    const questionSolvingPct = totalLecCount ? Math.min(100, Math.round((solvedLecCount / totalLecCount) * 100)) : 0;

    const todayStr = new Date().toISOString().split('T')[0];

    let totalLecturePoints = 0;
    
    if (totalLecCount > 0) {
      lectures.forEach(lec => {
        let lecPoints = 0;
        const isStudiedAndSolved = lec.studied && lec.solved;

        if (isStudiedAndSolved) {
          lecPoints += 70;
          const reviewItem = activeRecallList.find(ar => ar.lectureId === lec.id);
          if (reviewItem) {
            if (reviewItem.reviewed || reviewItem.scheduledReviewDate > todayStr) {
              lecPoints += 30;
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
    }

    const journeyScore = totalLecCount > 0 ? Math.min(100, Math.max(0, Math.round(totalLecturePoints / totalLecCount))) : 0;

    const eligibleReviews = activeRecallList;
    const pendingReviews = eligibleReviews.filter(ar => !ar.reviewed && ar.scheduledReviewDate <= todayStr);
    const completedReviews = eligibleReviews.filter(ar => ar.reviewed);

    const weeklyReviewCompPct = eligibleReviews.length > 0
      ? Math.round((completedReviews.length / eligibleReviews.length) * 100)
      : 0;

    return {
      journeyScore,
      scoreTrend: totalLecCount > 0 ? 2.4 : 0,
      moduleCompletionRate: moduleCompPct,
      lectureCompletionRate: lectureCompPct,
      questionSolvingRate: questionSolvingPct,
      weeklyReviewCompletionRate: weeklyReviewCompPct,
      pendingWeeklyReviewsCount: pendingReviews.length,
      completedWeeklyReviewsCount: completedReviews.length,
      totalEligibleReviewsCount: eligibleReviews.length,
      solvedQuestionsTotal: solvedLecCount * 25,
      studyConsistencyPercentage: totalLecCount > 0 ? Math.min(100, Math.round(journeyScore * 0.95)) : 0,
    };
  };

  const journeyMetrics = computeJourneyMetrics();

  // Academic Prediction Model
  const hasData = lectures.length > 0 || academicResults.length > 0;
  const avgResult = academicResults.length 
    ? Math.round(academicResults.reduce((sum, r) => sum + r.percentage, 0) / academicResults.length)
    : 0;

  const predictedScore = hasData 
    ? (academicResults.length ? Math.round(avgResult * 0.7 + journeyMetrics.journeyScore * 0.3) : Math.round(journeyMetrics.journeyScore * 0.92 + 10))
    : 0;

  const prediction: AcademicPrediction = {
    predictedExamScore: predictedScore,
    predictedGrade: !hasData ? 'N/A' : predictedScore >= 88 ? 'A+' : predictedScore >= 82 ? 'A' : predictedScore >= 75 ? 'B+' : 'B',
    confidenceLevel: hasData ? 90 : 0,
    examReadiness: !hasData ? 'Low' : predictedScore >= 80 ? 'High' : 'Moderate',
    targetGradeOrScore: hasData ? 'A+ (90%+)' : 'No Data Yet',
  };

  // Data Export & Clear
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
    clearWorkspaceState();
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
