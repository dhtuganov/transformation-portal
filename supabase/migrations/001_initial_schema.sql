-- Otrar Transformation Portal - Initial Schema
-- Version: 1.0
-- Date: 2025-12-04

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- PROFILES TABLE (extends auth.users)
-- ===========================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'executive', 'admin')),
  department TEXT,
  branch TEXT,
  mbti_type TEXT CHECK (mbti_type IS NULL OR mbti_type ~ '^[EI][SN][TF][JP]$'),
  mbti_verified BOOLEAN DEFAULT false,
  job_title TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- MBTI PROFILES TABLE (detailed MBTI data)
-- ===========================================
CREATE TABLE public.mbti_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mbti_type TEXT NOT NULL CHECK (mbti_type ~ '^[EI][SN][TF][JP]$'),
  dominant_function TEXT,
  auxiliary_function TEXT,
  tertiary_function TEXT,
  inferior_function TEXT,
  strengths JSONB DEFAULT '[]',
  growth_areas JSONB DEFAULT '[]',
  communication_style JSONB DEFAULT '{}',
  assessed_by TEXT,
  assessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ===========================================
-- CONTENT TABLE (metadata for learning materials)
-- ===========================================
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT DEFAULT 'article' CHECK (content_type IN ('article', 'video', 'test', 'document', 'checklist')),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  mbti_types TEXT[] DEFAULT '{}',
  roles TEXT[] DEFAULT '{}',
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER,
  author TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- LEARNING PROGRESS TABLE
-- ===========================================
CREATE TABLE public.learning_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER DEFAULT 0,
  UNIQUE(user_id, content_id)
);

-- ===========================================
-- TEAMS TABLE
-- ===========================================
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  branch TEXT,
  manager_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- TEAM MEMBERS TABLE
-- ===========================================
CREATE TABLE public.team_members (
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

-- ===========================================
-- FUNCTION: Handle new user registration
-- ===========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- FUNCTION: Update updated_at timestamp
-- ===========================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mbti_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS POLICIES: Profiles
-- ===========================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Managers can view team members' profiles
CREATE POLICY "Managers can view team profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = profiles.id
      AND t.manager_id = auth.uid()
    )
  );

-- Executives and admins can view all profiles
CREATE POLICY "Executives and admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'executive')
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================================
-- RLS POLICIES: MBTI Profiles
-- ===========================================

-- Users can view their own MBTI profile
CREATE POLICY "Users can view own MBTI profile"
  ON public.mbti_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Managers can view team MBTI profiles
CREATE POLICY "Managers can view team MBTI profiles"
  ON public.mbti_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = mbti_profiles.user_id
      AND t.manager_id = auth.uid()
    )
  );

-- Executives and admins can view all MBTI profiles
CREATE POLICY "Executives and admins can view all MBTI profiles"
  ON public.mbti_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'executive')
    )
  );

-- Admins can manage all MBTI profiles
CREATE POLICY "Admins can manage MBTI profiles"
  ON public.mbti_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================================
-- RLS POLICIES: Content
-- ===========================================

-- Anyone authenticated can view published content
CREATE POLICY "Authenticated users can view published content"
  ON public.content FOR SELECT
  USING (published = true);

-- Admins can manage all content
CREATE POLICY "Admins can manage content"
  ON public.content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================================
-- RLS POLICIES: Learning Progress
-- ===========================================

-- Users can manage their own progress
CREATE POLICY "Users can view own progress"
  ON public.learning_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.learning_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.learning_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Managers can view team progress
CREATE POLICY "Managers can view team progress"
  ON public.learning_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = learning_progress.user_id
      AND t.manager_id = auth.uid()
    )
  );

-- Executives and admins can view all progress
CREATE POLICY "Executives and admins can view all progress"
  ON public.learning_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'executive')
    )
  );

-- ===========================================
-- RLS POLICIES: Teams
-- ===========================================

-- Users can view teams they belong to
CREATE POLICY "Users can view own teams"
  ON public.teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = teams.id AND user_id = auth.uid()
    )
    OR manager_id = auth.uid()
  );

-- Executives and admins can view all teams
CREATE POLICY "Executives and admins can view all teams"
  ON public.teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'executive')
    )
  );

-- Admins can manage teams
CREATE POLICY "Admins can manage teams"
  ON public.teams FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================================
-- RLS POLICIES: Team Members
-- ===========================================

-- Team managers can view their team members
CREATE POLICY "Managers can view team members"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE id = team_members.team_id AND manager_id = auth.uid()
    )
  );

-- Users can see their own team memberships
CREATE POLICY "Users can view own team memberships"
  ON public.team_members FOR SELECT
  USING (auth.uid() = user_id);

-- Executives and admins can view all team members
CREATE POLICY "Executives and admins can view all team members"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'executive')
    )
  );

-- Admins can manage team members
CREATE POLICY "Admins can manage team members"
  ON public.team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_mbti_type ON public.profiles(mbti_type);
CREATE INDEX idx_profiles_branch ON public.profiles(branch);
CREATE INDEX idx_content_slug ON public.content(slug);
CREATE INDEX idx_content_category ON public.content(category);
CREATE INDEX idx_content_published ON public.content(published);
CREATE INDEX idx_learning_progress_user ON public.learning_progress(user_id);
CREATE INDEX idx_learning_progress_content ON public.learning_progress(content_id);
CREATE INDEX idx_learning_progress_status ON public.learning_progress(status);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);
CREATE INDEX idx_team_members_team ON public.team_members(team_id);
