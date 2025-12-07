-- Fix RLS recursion in profiles table
-- The previous policy caused infinite recursion by querying profiles within a profiles policy

-- ===========================================
-- FIX PROFILES RLS POLICY
-- ===========================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view profiles in same tenant" ON public.profiles;

-- Create a non-recursive policy using auth.uid() directly
-- Option 1: Users can always view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Option 2: Use a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Users in same tenant can view each other (using function to break recursion)
CREATE POLICY "Users can view profiles in same tenant"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id()
  );

-- ===========================================
-- FIX CONTENT RLS POLICY
-- ===========================================

DROP POLICY IF EXISTS "Users can view published content in same tenant" ON public.content;

CREATE POLICY "Users can view published content in same tenant"
  ON public.content FOR SELECT
  TO authenticated
  USING (
    published = true AND
    tenant_id = public.get_user_tenant_id()
  );

-- ===========================================
-- FIX QUIZZES RLS POLICY
-- ===========================================

DROP POLICY IF EXISTS "Users can view published quizzes in same tenant" ON public.quizzes;

CREATE POLICY "Users can view published quizzes in same tenant"
  ON public.quizzes FOR SELECT
  TO authenticated
  USING (
    published = true AND
    tenant_id = public.get_user_tenant_id()
  );

-- ===========================================
-- FIX FEATURE FLAGS RLS POLICY
-- ===========================================

DROP POLICY IF EXISTS "Users can view tenant feature flags" ON public.feature_flags;

CREATE POLICY "Users can view tenant feature flags"
  ON public.feature_flags FOR SELECT
  TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id()
  );

-- ===========================================
-- FIX TENANTS RLS POLICY
-- ===========================================

DROP POLICY IF EXISTS "Tenant admins can view own tenant" ON public.tenants;

-- Simpler policy: users can view their own tenant
CREATE POLICY "Users can view own tenant"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (
    id = public.get_user_tenant_id()
  );

-- Keep the active tenants policy for public tenant selection
-- (already exists: "System can view active tenants")
