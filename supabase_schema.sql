-- ============================================================================
-- 🪷 SADHANA MONITOR — PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor (https://supabase.com)
-- Enables Row Level Security (RLS) so users only access their own data.

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  initiated_name TEXT DEFAULT '',
  guru_name TEXT DEFAULT '',
  role TEXT DEFAULT 'devotee', -- 'devotee' | 'counsellor'
  avatar_type TEXT DEFAULT 'preset',
  avatar_preset TEXT DEFAULT '🪷',
  avatar_data TEXT DEFAULT '',
  theme TEXT DEFAULT 'auto',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Sadhana Entries Table
CREATE TABLE IF NOT EXISTS public.sadhana_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL,
  score INT DEFAULT 0,
  routine JSONB DEFAULT '{}'::jsonb,
  morning_program JSONB DEFAULT '{}'::jsonb,
  chanting JSONB DEFAULT '{}'::jsonb,
  hearing JSONB DEFAULT '{}'::jsonb,
  reading JSONB DEFAULT '{}'::jsonb,
  shloka JSONB DEFAULT '{}'::jsonb,
  seva JSONB DEFAULT '{}'::jsonb,
  mood JSONB DEFAULT '{}'::jsonb,
  custom_logs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

-- Enable RLS on Sadhana Entries
ALTER TABLE public.sadhana_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sadhana entries"
  ON public.sadhana_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sadhana entries"
  ON public.sadhana_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sadhana entries"
  ON public.sadhana_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sadhana entries"
  ON public.sadhana_entries FOR DELETE
  USING (auth.uid() = user_id);

-- 3. User Goals Table
CREATE TABLE IF NOT EXISTS public.user_goals (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  chanting INT DEFAULT 16,
  hearing INT DEFAULT 60,
  reading INT DEFAULT 30,
  shloka_per_week INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own goals"
  ON public.user_goals FOR ALL
  USING (auth.uid() = user_id);

-- 4. Custom Tracked Activities Table
CREATE TABLE IF NOT EXISTS public.custom_activities (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  icon TEXT DEFAULT '📌',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.custom_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own custom activities"
  ON public.custom_activities FOR ALL
  USING (auth.uid() = user_id);

-- 5. Counsellor Notes & Mentee Mapping
CREATE TABLE IF NOT EXISTS public.counsellor_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  counsellor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mentee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  note_text TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(counsellor_id, mentee_id)
);

ALTER TABLE public.counsellor_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counsellors can view & edit own notes"
  ON public.counsellor_notes FOR ALL
  USING (auth.uid() = counsellor_id);

-- Automatically create profile entry on auth sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Devotee'),
    NOW()
  );
  INSERT INTO public.user_goals (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
