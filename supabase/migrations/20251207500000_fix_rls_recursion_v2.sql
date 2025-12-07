-- Fix RLS recursion in profiles table - Version 2
-- The security definer function still causes recursion because it queries profiles

-- ===========================================
-- DROP ALL DEPENDENT POLICIES FIRST
-- ===========================================

-- Drop policies that depend on get_user_tenant_id()
DROP POLICY IF EXISTS "Users can view published content in same tenant" ON public.content;
DROP POLICY IF EXISTS "Users can view published quizzes in same tenant" ON public.quizzes;
DROP POLICY IF EXISTS "Users can view tenant feature flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;

-- Drop profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in same tenant" ON public.profiles;

-- Now drop the function
DROP FUNCTION IF EXISTS public.get_user_tenant_id();

-- ===========================================
-- SOLUTION: Use JWT claims for tenant isolation
-- For now, we'll use a simpler approach:
-- Users can view their own profile + profiles in same tenant (via subquery with SECURITY DEFINER)
-- ===========================================

-- First, create a view that's not subject to RLS for internal lookups
CREATE OR REPLACE VIEW public.profiles_internal AS
SELECT id, tenant_id FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.profiles_internal TO authenticated;

-- Create security definer function that uses the view (not the table directly)
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles_internal WHERE id = auth.uid();
$$;

-- Policy 1: Users can ALWAYS view their own profile (no recursion possible)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Policy 2: Users can view other profiles in same tenant
-- This uses the security definer function which queries the VIEW, not the table
CREATE POLICY "Users can view profiles in same tenant"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id != auth.uid() AND -- Exclude own profile (already covered by first policy)
    tenant_id = public.get_user_tenant_id()
  );

-- Policy for INSERT: Users can only insert their own profile in their tenant
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Policy for UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ===========================================
-- RECREATE POLICIES FOR OTHER TABLES
-- ===========================================

-- Content: Users can view published content in same tenant
CREATE POLICY "Users can view published content in same tenant"
  ON public.content FOR SELECT
  TO authenticated
  USING (
    published = true AND
    tenant_id = public.get_user_tenant_id()
  );

-- Quizzes: Users can view published quizzes in same tenant
CREATE POLICY "Users can view published quizzes in same tenant"
  ON public.quizzes FOR SELECT
  TO authenticated
  USING (
    published = true AND
    tenant_id = public.get_user_tenant_id()
  );

-- Feature flags: Users can view their tenant's flags
CREATE POLICY "Users can view tenant feature flags"
  ON public.feature_flags FOR SELECT
  TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id()
  );

-- Tenants: Users can view their own tenant
CREATE POLICY "Users can view own tenant"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (
    id = public.get_user_tenant_id()
  );
