-- Simple profiles policy without tenant isolation
-- This avoids all recursion by using only auth.uid() and USING(true)
-- Applied via Supabase Management API on 2025-12-07

-- ===========================================
-- DROP ALL EXISTING PROFILES POLICIES
-- ===========================================

DROP POLICY IF EXISTS "Allow users to read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can read all\n  profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in same tenant" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view team profiles" ON public.profiles;
DROP POLICY IF EXISTS "Executives and admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_auth" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_manager_team" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Drop old views and functions if exist (excluding those with dependencies)
DROP VIEW IF EXISTS public.profiles_internal;
-- Note: These functions have dependent policies, keeping them:
-- DROP FUNCTION IF EXISTS public.get_user_tenant_id();
-- DROP FUNCTION IF EXISTS public.get_user_role(UUID);

-- ===========================================
-- CREATE SIMPLE NON-RECURSIVE POLICIES
-- ===========================================

-- All authenticated users can read all profiles (no tenant isolation for now)
-- Tenant isolation will be implemented via JWT claims later
CREATE POLICY "profiles_read_all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only insert their own profile
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Note: For tenant isolation in the future, consider:
-- 1. Add tenant_id to JWT claims via Supabase Auth hooks
-- 2. Use (auth.jwt() ->> 'tenant_id')::uuid in policies
-- 3. This avoids querying profiles table within policies
