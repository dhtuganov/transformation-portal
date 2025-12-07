// Feature Flags System
// Tenant-aware feature flag management

import type { Tenant, TenantFeatures, FeatureKey, FeatureFlag } from '@/types/tenant'

// ===========================================
// FEATURE FLAG CONSTANTS
// ===========================================

export const FEATURES = {
  ADAPTIVE_TESTING: 'adaptive_testing',
  SHADOW_WORK: 'shadow_work',
  TYPE_SIMULATOR: 'type_simulator',
  RELATIONSHIP_NAVIGATOR: 'relationship_navigator',
  CAREER_COMPASS: 'career_compass',
  TEAM_BUILDER: 'team_builder',
  AI_INSIGHTS: 'ai_insights',
  GAMIFICATION: 'gamification',
  STRESS_RADAR: 'stress_radar',
  JOURNAL: 'journal',
  DAILY_CHALLENGES: 'daily_challenges',
  LEADERBOARD: 'leaderboard',
  EXPORT_PDF: 'export_pdf',
  TEAM_ANALYTICS: 'team_analytics',
  CUSTOM_CONTENT: 'custom_content',
} as const

// ===========================================
// FEATURE CHECK FUNCTIONS
// ===========================================

/**
 * Check if a feature is enabled for a tenant
 */
export function isFeatureEnabled(
  tenant: Tenant | null,
  feature: keyof TenantFeatures
): boolean {
  if (!tenant) return false
  return tenant.features[feature] ?? false
}

/**
 * Check if a feature is enabled with gradual rollout support
 */
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
  const hash = hashString(userId + featureKey)
  return (hash % 100) < flag.rolloutPercentage
}

/**
 * Get all enabled features for a tenant
 */
export function getEnabledFeatures(tenant: Tenant | null): (keyof TenantFeatures)[] {
  if (!tenant) return []

  return (Object.keys(tenant.features) as (keyof TenantFeatures)[])
    .filter(key => tenant.features[key])
}

/**
 * Check multiple features at once
 */
export function areFeaturesEnabled(
  tenant: Tenant | null,
  features: (keyof TenantFeatures)[]
): boolean {
  if (!tenant) return false
  return features.every(feature => tenant.features[feature])
}

/**
 * Check if any of the features is enabled
 */
export function isAnyFeatureEnabled(
  tenant: Tenant | null,
  features: (keyof TenantFeatures)[]
): boolean {
  if (!tenant) return false
  return features.some(feature => tenant.features[feature])
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Simple hash function for deterministic rollout
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// ===========================================
// FEATURE FLAG VALIDATION
// ===========================================

/**
 * Validate feature flag configuration
 */
export function validateFeatureFlag(flag: Partial<FeatureFlag>): string[] {
  const errors: string[] = []

  if (!flag.featureKey) {
    errors.push('Feature key is required')
  }

  if (flag.rolloutPercentage !== undefined) {
    if (flag.rolloutPercentage < 0 || flag.rolloutPercentage > 100) {
      errors.push('Rollout percentage must be between 0 and 100')
    }
  }

  return errors
}

// ===========================================
// FEATURE FLAG OPERATIONS
// ===========================================

/**
 * Merge base features with overrides from feature flags
 */
export function mergeFeatures(
  baseFeatures: TenantFeatures,
  featureFlags: FeatureFlag[],
  userId?: string
): TenantFeatures {
  const result = { ...baseFeatures }

  for (const flag of featureFlags) {
    const featureKey = flag.featureKey as keyof TenantFeatures

    if (featureKey in result) {
      if (userId) {
        // Apply rollout logic
        result[featureKey] = isFeatureEnabledWithRollout(featureFlags, flag.featureKey, userId)
      } else {
        result[featureKey] = flag.isEnabled
      }
    }
  }

  return result
}

// ===========================================
// FEATURE DESCRIPTIONS
// ===========================================

export const FEATURE_INFO: Record<keyof TenantFeatures, {
  nameRu: string
  nameEn: string
  descriptionRu: string
  descriptionEn: string
  icon: string
  category: 'assessment' | 'development' | 'social' | 'analytics' | 'content'
}> = {
  adaptive_testing: {
    nameRu: 'Адаптивное тестирование',
    nameEn: 'Adaptive Testing',
    descriptionRu: 'IRT-based тестирование с автоматическим подбором вопросов',
    descriptionEn: 'IRT-based testing with automatic question selection',
    icon: '🎯',
    category: 'assessment',
  },
  shadow_work: {
    nameRu: 'Работа с тенью',
    nameEn: 'Shadow Work',
    descriptionRu: '8-недельная программа интеграции подчинённой функции',
    descriptionEn: '8-week inferior function integration program',
    icon: '🌑',
    category: 'development',
  },
  type_simulator: {
    nameRu: 'Симулятор типов',
    nameEn: 'Type Simulator',
    descriptionRu: 'Понимание мышления других типов личности',
    descriptionEn: 'Understanding how other personality types think',
    icon: '🔄',
    category: 'development',
  },
  relationship_navigator: {
    nameRu: 'Навигатор отношений',
    nameEn: 'Relationship Navigator',
    descriptionRu: 'Анализ совместимости и улучшение коммуникации',
    descriptionEn: 'Compatibility analysis and communication improvement',
    icon: '🤝',
    category: 'social',
  },
  career_compass: {
    nameRu: 'Карьерный компас',
    nameEn: 'Career Compass',
    descriptionRu: 'Рекомендации по карьере на основе типа личности',
    descriptionEn: 'Career recommendations based on personality type',
    icon: '🧭',
    category: 'development',
  },
  team_builder: {
    nameRu: 'Командный конструктор',
    nameEn: 'Team Builder',
    descriptionRu: 'Анализ и оптимизация состава команды',
    descriptionEn: 'Team composition analysis and optimization',
    icon: '👥',
    category: 'social',
  },
  ai_insights: {
    nameRu: 'AI-инсайты',
    nameEn: 'AI Insights',
    descriptionRu: 'Персонализированные рекомендации от AI',
    descriptionEn: 'Personalized AI-powered recommendations',
    icon: '🤖',
    category: 'content',
  },
  gamification: {
    nameRu: 'Геймификация',
    nameEn: 'Gamification',
    descriptionRu: 'XP, уровни, достижения и челленджи',
    descriptionEn: 'XP, levels, achievements and challenges',
    icon: '🎮',
    category: 'development',
  },
  stress_radar: {
    nameRu: 'Радар стресса',
    nameEn: 'Stress Radar',
    descriptionRu: 'Мониторинг стресса и персонализированные рекомендации',
    descriptionEn: 'Stress monitoring and personalized recommendations',
    icon: '📡',
    category: 'analytics',
  },
}
