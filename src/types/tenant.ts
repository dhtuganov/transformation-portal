// Multi-Tenant System Types
// White-label architecture for Otrar, iWendy, and future clients

// ===========================================
// TENANT
// ===========================================

export type TenantPlan = 'free' | 'pro' | 'enterprise'

export interface TenantBranding {
  primaryColor: string
  secondaryColor: string
  logo: string | null
  favicon: string | null
  fontFamily: string
}

export interface TenantFeatures {
  adaptive_testing: boolean
  shadow_work: boolean
  type_simulator: boolean
  relationship_navigator: boolean
  career_compass: boolean
  team_builder: boolean
  ai_insights: boolean
  gamification: boolean
  stress_radar: boolean
}

export interface TenantConfig {
  defaultLocale: 'ru' | 'en'
  availableLocales: ('ru' | 'en')[]
  maxUsersFreePlan: number | null
  customDomain: string | null
}

export interface Tenant {
  id: string
  slug: string
  name: string
  branding: TenantBranding
  features: TenantFeatures
  config: TenantConfig
  plan: TenantPlan
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ===========================================
// FEATURE FLAGS
// ===========================================

export type FeatureKey =
  | 'adaptive_testing'
  | 'shadow_work'
  | 'type_simulator'
  | 'relationship_navigator'
  | 'career_compass'
  | 'team_builder'
  | 'ai_insights'
  | 'gamification'
  | 'stress_radar'
  | 'journal'
  | 'daily_challenges'
  | 'leaderboard'
  | 'export_pdf'
  | 'team_analytics'
  | 'custom_content'

export interface FeatureFlag {
  id: string
  tenantId: string
  featureKey: FeatureKey
  isEnabled: boolean
  config: Record<string, unknown>
  rolloutPercentage: number  // 0-100 for gradual rollout
  createdAt: string
  updatedAt: string
}

// ===========================================
// PREDEFINED TENANTS
// ===========================================

export const TENANTS = {
  OTRAR: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  IWENDY: 'b1ffcd00-0d1c-5fg9-cc7e-7cc0ce491b22',
} as const

export const DEFAULT_TENANT_ID = TENANTS.OTRAR

// ===========================================
// TENANT CONTEXT
// ===========================================

export interface TenantContext {
  tenant: Tenant
  features: TenantFeatures
  locale: 'ru' | 'en'
  isLoading: boolean
}

// ===========================================
// FEATURE CHECKS
// ===========================================

export function isFeatureEnabled(
  tenant: Tenant | null,
  feature: keyof TenantFeatures
): boolean {
  if (!tenant) return false
  return tenant.features[feature] ?? false
}

export function isFeatureEnabledWithRollout(
  featureFlags: FeatureFlag[],
  featureKey: FeatureKey,
  userId: string
): boolean {
  const flag = featureFlags.find(f => f.featureKey === featureKey)
  if (!flag || !flag.isEnabled) return false

  if (flag.rolloutPercentage >= 100) return true
  if (flag.rolloutPercentage <= 0) return false

  // Deterministic rollout based on user ID
  const hash = simpleHash(userId + featureKey)
  return (hash % 100) < flag.rolloutPercentage
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// ===========================================
// PLAN FEATURES
// ===========================================

export const PLAN_FEATURES: Record<TenantPlan, {
  maxUsers: number | null
  features: (keyof TenantFeatures)[]
  support: 'community' | 'email' | 'priority'
  customBranding: boolean
  analytics: 'basic' | 'advanced' | 'full'
}> = {
  free: {
    maxUsers: 50,
    features: ['gamification'],
    support: 'community',
    customBranding: false,
    analytics: 'basic',
  },
  pro: {
    maxUsers: 500,
    features: [
      'adaptive_testing',
      'shadow_work',
      'type_simulator',
      'relationship_navigator',
      'career_compass',
      'ai_insights',
      'gamification',
      'stress_radar',
    ],
    support: 'email',
    customBranding: true,
    analytics: 'advanced',
  },
  enterprise: {
    maxUsers: null, // Unlimited
    features: [
      'adaptive_testing',
      'shadow_work',
      'type_simulator',
      'relationship_navigator',
      'career_compass',
      'team_builder',
      'ai_insights',
      'gamification',
      'stress_radar',
    ],
    support: 'priority',
    customBranding: true,
    analytics: 'full',
  },
}

// ===========================================
// BRANDING PRESETS
// ===========================================

export const BRANDING_PRESETS: Record<string, TenantBranding> = {
  otrar: {
    primaryColor: '#1E40AF',
    secondaryColor: '#3B82F6',
    logo: '/tenants/otrar/logo.svg',
    favicon: '/tenants/otrar/favicon.ico',
    fontFamily: 'Inter',
  },
  iwendy: {
    primaryColor: '#7C3AED',
    secondaryColor: '#A78BFA',
    logo: '/tenants/iwendy/logo.svg',
    favicon: '/tenants/iwendy/favicon.ico',
    fontFamily: 'Inter',
  },
  default: {
    primaryColor: '#1E40AF',
    secondaryColor: '#3B82F6',
    logo: null,
    favicon: null,
    fontFamily: 'Inter',
  },
}
