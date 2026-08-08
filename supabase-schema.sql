-- MedTrack Supabase Relational Schema and Row Level Security (RLS) Policies
-- Run this script in the Supabase SQL Editor (https://app.supabase.com/project/_/sql)

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  university TEXT,
  faculty TEXT,
  academic_year TEXT,
  study_system TEXT,
  role TEXT,
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'light',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MODULES TABLE
CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  total_lectures INTEGER DEFAULT 0,
  completed_lectures INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE',
  color TEXT,
  description TEXT,
  estimated_completion_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LECTURES TABLE
CREATE TABLE IF NOT EXISTS public.lectures (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  name TEXT NOT NULL,
  difficulty TEXT DEFAULT 'High-Yield',
  topic_category TEXT,
  study_date TEXT,
  studied BOOLEAN DEFAULT FALSE,
  solved BOOLEAN DEFAULT FALSE,
  in_active_recall BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACTIVE RECALL TABLE
CREATE TABLE IF NOT EXISTS public.active_recall (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lecture_id TEXT NOT NULL,
  lecture_name TEXT NOT NULL,
  module_name TEXT NOT NULL,
  date_studied TEXT,
  days_since_study INTEGER DEFAULT 0,
  scheduled_review_date TEXT,
  reviewed BOOLEAN DEFAULT FALSE,
  reviewed_date TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ACADEMIC RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.results (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  academic_year TEXT,
  module_name TEXT NOT NULL,
  percentage NUMERIC NOT NULL,
  notes TEXT,
  date_logged TEXT,
  ai_conclusion JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LIFESTYLE TABLE
CREATE TABLE IF NOT EXISTS public.lifestyle (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  sleep_time TEXT,
  wake_up_time TEXT,
  sleep_hours NUMERIC DEFAULT 0,
  exercise_mins INTEGER DEFAULT 0,
  water_intake_liters NUMERIC DEFAULT 0,
  phone_usage_hours NUMERIC DEFAULT 0,
  study_hours NUMERIC DEFAULT 0,
  caffeine_cups INTEGER DEFAULT 0,
  bad_habits TEXT[],
  habits_to_quit TEXT[],
  stress_level INTEGER DEFAULT 3,
  mood TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_modules_user_id ON public.modules(user_id);
CREATE INDEX IF NOT EXISTS idx_lectures_user_id ON public.lectures(user_id);
CREATE INDEX IF NOT EXISTS idx_lectures_module_id ON public.lectures(module_id);
CREATE INDEX IF NOT EXISTS idx_active_recall_user_id ON public.active_recall(user_id);
CREATE INDEX IF NOT EXISTS idx_results_user_id ON public.results(user_id);
CREATE INDEX IF NOT EXISTS idx_lifestyle_user_id ON public.lifestyle(user_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_recall ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifestyle ENABLE ROW LEVEL SECURITY;

-- DROP EXISTING POLICIES IF RE-RUNNING
DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users manage own modules" ON public.modules;
DROP POLICY IF EXISTS "Users manage own lectures" ON public.lectures;
DROP POLICY IF EXISTS "Users manage own active_recall" ON public.active_recall;
DROP POLICY IF EXISTS "Users manage own results" ON public.results;
DROP POLICY IF EXISTS "Users manage own lifestyle" ON public.lifestyle;

-- CREATE ISOLATED USER POLICIES
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users manage own modules" ON public.modules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own lectures" ON public.lectures FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own active_recall" ON public.active_recall FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own results" ON public.results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own lifestyle" ON public.lifestyle FOR ALL USING (auth.uid() = user_id);
