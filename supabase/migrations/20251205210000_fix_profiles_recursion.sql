-- Fix infinite recursion in profiles RLS policies
-- The problem: policies that SELECT from profiles to check role cause recursion

-- First, create a SECURITY DEFINER function to get user role without RLS
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop ALL existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Managers can view team profiles" ON profiles;
DROP POLICY IF EXISTS "Executives and admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON profiles;
DROP POLICY IF EXISTS "Authenticated can view all profiles" ON profiles;

-- Create simple non-recursive policies

-- 1. Users can view and update their own profile (no recursion)
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Insert for authenticated users (for new user trigger)
CREATE POLICY "profiles_insert_auth"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Admins/Executives can view all profiles using SECURITY DEFINER function
CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  USING (public.get_user_role(auth.uid()) IN ('admin', 'executive'));

-- 4. Managers can view team profiles using SECURITY DEFINER function
CREATE POLICY "profiles_select_manager_team"
  ON profiles FOR SELECT
  USING (
    public.get_user_role(auth.uid()) = 'manager'
    AND EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = profiles.id
      AND t.manager_id = auth.uid()
    )
  );

-- 5. Admins can update any profile using SECURITY DEFINER function
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Fix similar issues in other tables that reference profiles for role checks

-- Learning Progress policies
DROP POLICY IF EXISTS "Executives and admins can view all progress" ON learning_progress;
CREATE POLICY "progress_select_admin"
  ON learning_progress FOR SELECT
  USING (public.get_user_role(auth.uid()) IN ('admin', 'executive'));

-- Content policies
DROP POLICY IF EXISTS "Admins can manage content" ON content;
CREATE POLICY "content_admin_all"
  ON content FOR ALL
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Teams policies
DROP POLICY IF EXISTS "Executives and admins can view all teams" ON teams;
DROP POLICY IF EXISTS "Admins can manage teams" ON teams;
CREATE POLICY "teams_select_admin"
  ON teams FOR SELECT
  USING (public.get_user_role(auth.uid()) IN ('admin', 'executive'));
CREATE POLICY "teams_admin_all"
  ON teams FOR ALL
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Team Members policies
DROP POLICY IF EXISTS "Executives and admins can view all team members" ON team_members;
DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;
CREATE POLICY "team_members_select_admin"
  ON team_members FOR SELECT
  USING (public.get_user_role(auth.uid()) IN ('admin', 'executive'));
CREATE POLICY "team_members_admin_all"
  ON team_members FOR ALL
  USING (public.get_user_role(auth.uid()) = 'admin');

-- MBTI Profiles policies
DROP POLICY IF EXISTS "Executives and admins can view all MBTI profiles" ON mbti_profiles;
DROP POLICY IF EXISTS "Admins can manage MBTI profiles" ON mbti_profiles;
CREATE POLICY "mbti_profiles_select_admin"
  ON mbti_profiles FOR SELECT
  USING (public.get_user_role(auth.uid()) IN ('admin', 'executive'));
CREATE POLICY "mbti_profiles_admin_all"
  ON mbti_profiles FOR ALL
  USING (public.get_user_role(auth.uid()) = 'admin');
