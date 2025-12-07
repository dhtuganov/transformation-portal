-- Otrar Transformation Platform - Multi-Tenant Foundation
-- Version: 2.0
-- Date: 2025-12-07
-- Purpose: White-label architecture for Otrar, iWendy, and future clients

-- ===========================================
-- TENANTS TABLE
-- ===========================================
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- 'otrar', 'iwendy', 'acme-corp'
  name TEXT NOT NULL,
  branding JSONB DEFAULT '{
    "primaryColor": "#1E40AF",
    "secondaryColor": "#3B82F6",
    "logo": null,
    "favicon": null,
    "fontFamily": "Inter"
  }'::jsonb,
  features JSONB DEFAULT '{
    "adaptive_testing": false,
    "shadow_work": false,
    "type_simulator": false,
    "relationship_navigator": false,
    "career_compass": false,
    "team_builder": false,
    "ai_insights": false,
    "gamification": false,
    "stress_radar": false
  }'::jsonb,
  config JSONB DEFAULT '{
    "defaultLocale": "ru",
    "availableLocales": ["ru"],
    "maxUsersFreePlan": 50,
    "customDomain": null
  }'::jsonb,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- FEATURE FLAGS TABLE (granular control)
-- ===========================================
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, feature_key)
);

-- ===========================================
-- ADD tenant_id TO EXISTING TABLES
-- ===========================================

-- Create default tenant (Otrar)
INSERT INTO public.tenants (id, slug, name, plan, features)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'otrar',
  'Otrar Travel',
  'enterprise',
  '{
    "adaptive_testing": true,
    "shadow_work": true,
    "type_simulator": true,
    "relationship_navigator": true,
    "career_compass": true,
    "team_builder": true,
    "ai_insights": true,
    "gamification": true,
    "stress_radar": true
  }'::jsonb
);

-- Add tenant_id to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Add tenant_id to content
ALTER TABLE public.content
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Add tenant_id to quizzes
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Add tenant_id to teams
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- ===========================================
-- INDEXES FOR TENANT ISOLATION
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_content_tenant ON public.content(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_tenant ON public.quizzes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_teams_tenant ON public.teams(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_tenant ON public.feature_flags(tenant_id);

-- ===========================================
-- TENANT CONTEXT FUNCTION
-- ===========================================

-- Function to get current tenant from session
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    current_setting('app.current_tenant', true)::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid -- Default to Otrar
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ===========================================
-- RLS POLICIES FOR TENANTS TABLE
-- ===========================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Tenant admins can view their own tenant
CREATE POLICY "Tenant admins can view own tenant"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- System can view all tenants (for tenant selection)
CREATE POLICY "System can view active tenants"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Feature flags: Users can view their tenant's flags
CREATE POLICY "Users can view tenant feature flags"
  ON public.feature_flags FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid()
    )
  );

-- ===========================================
-- UPDATE EXISTING RLS POLICIES FOR TENANT ISOLATION
-- ===========================================

-- Drop and recreate profiles policies with tenant awareness
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view team profiles" ON public.profiles;
DROP POLICY IF EXISTS "Executives and admins can view all profiles" ON public.profiles;

-- Users can view profiles in same tenant
CREATE POLICY "Users can view profiles in same tenant"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Drop and recreate content policies with tenant awareness
DROP POLICY IF EXISTS "Authenticated users can view published content" ON public.content;

CREATE POLICY "Users can view published content in same tenant"
  ON public.content FOR SELECT
  TO authenticated
  USING (
    published = true AND
    tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Drop and recreate quizzes policies with tenant awareness
DROP POLICY IF EXISTS "Authenticated users can view published quizzes" ON public.quizzes;

CREATE POLICY "Users can view published quizzes in same tenant"
  ON public.quizzes FOR SELECT
  TO authenticated
  USING (
    published = true AND
    tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
  );

-- ===========================================
-- TRIGGERS
-- ===========================================

CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===========================================
-- SEED: iWendy Tenant (B2C)
-- ===========================================

INSERT INTO public.tenants (slug, name, plan, config, features)
VALUES (
  'iwendy',
  'iWendy',
  'pro',
  '{
    "defaultLocale": "ru",
    "availableLocales": ["ru", "en"],
    "maxUsersFreePlan": null,
    "customDomain": "app.iwendy.ai"
  }'::jsonb,
  '{
    "adaptive_testing": true,
    "shadow_work": true,
    "type_simulator": true,
    "relationship_navigator": true,
    "career_compass": true,
    "team_builder": false,
    "ai_insights": true,
    "gamification": true,
    "stress_radar": true
  }'::jsonb
);
