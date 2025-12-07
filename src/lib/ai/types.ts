import type { MBTIType } from '@/types/database'

/**
 * AI-generated daily insight for a user
 */
export interface DailyInsight {
  /** Insight title (concise, attention-grabbing) */
  title: string
  /** Main insight content (max 300 tokens) */
  content: string
  /** Cognitive function being addressed (Ni, Ne, Ti, Te, Fi, Fe, Si, Se) */
  cognitiveFunction: string
  /** Specific actionable item the user can take today */
  actionItem: string
  /** XP reward for completing the action */
  xpReward: number
  /** Timestamp when insight was generated */
  generatedAt: Date
}

/**
 * Analysis of a user's journal entry
 */
export interface JournalAnalysis {
  /** Overall emotional tone (positive, neutral, negative, mixed) */
  emotionalTone: 'positive' | 'neutral' | 'negative' | 'mixed'
  /** Key themes identified in the entry */
  themes: string[]
  /** Cognitive functions being used/developed */
  cognitiveFunctionsUsed: string[]
  /** Growth areas identified */
  growthOpportunities: string[]
  /** Personalized encouragement or feedback */
  feedback: string
  /** XP reward for reflection quality */
  xpReward: number
}

/**
 * Context for generating type-specific tips
 */
export interface TipContext {
  /** Current activity or situation */
  activity: string
  /** User's current challenges (optional) */
  challenges?: string[]
  /** Recent achievements (optional) */
  achievements?: string[]
}

/**
 * Type-specific tip
 */
export interface TypeSpecificTip {
  /** The tip content */
  tip: string
  /** Related cognitive function */
  cognitiveFunction: string
  /** Why this tip is relevant for this type */
  rationale: string
}

/**
 * AI usage tracking for rate limiting
 */
export interface AIUsage {
  userId: string
  date: string // ISO date string (YYYY-MM-DD)
  tokensUsed: number
  requestCount: number
  lastRequestAt: Date
}

/**
 * Safety validation result
 */
export interface SafetyValidation {
  isValid: boolean
  reason?: string
  topic?: string
}

/**
 * Rate limit check result
 */
export interface RateLimitCheck {
  allowed: boolean
  tokensRemaining: number
  requestsRemaining: number
  resetAt?: Date
}

/**
 * Configuration for AI personalization
 */
export interface PersonalizationConfig {
  /** Daily token budget per user */
  dailyTokenBudget: number
  /** Max requests per day */
  maxRequestsPerDay: number
  /** Max tokens per request */
  maxTokensPerRequest: number
  /** Allowed topics for validation */
  allowedTopics: string[]
  /** XP rewards configuration */
  xpRewards: {
    dailyInsight: number
    journalAnalysis: number
    tipGeneration: number
  }
}

/**
 * Anthropic API request options
 */
export interface AnthropicRequestOptions {
  mbtiType: MBTIType
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
}

/**
 * Cognitive function names and descriptions
 */
export const COGNITIVE_FUNCTION_NAMES: Record<string, { ru: string; en: string; description: string }> = {
  Ni: {
    ru: 'Интровертная интуиция',
    en: 'Introverted Intuition',
    description: 'Видение глубинных паттернов и будущих возможностей'
  },
  Ne: {
    ru: 'Экстравертная интуиция',
    en: 'Extraverted Intuition',
    description: 'Исследование новых возможностей и связей'
  },
  Ti: {
    ru: 'Интровертное мышление',
    en: 'Introverted Thinking',
    description: 'Логический анализ и внутренняя согласованность'
  },
  Te: {
    ru: 'Экстравертное мышление',
    en: 'Extraverted Thinking',
    description: 'Организация и эффективность в действиях'
  },
  Fi: {
    ru: 'Интровертное чувство',
    en: 'Introverted Feeling',
    description: 'Глубокие личные ценности и аутентичность'
  },
  Fe: {
    ru: 'Экстравертное чувство',
    en: 'Extraverted Feeling',
    description: 'Гармония в отношениях и эмоциональный отклик'
  },
  Si: {
    ru: 'Интровертное ощущение',
    en: 'Introverted Sensing',
    description: 'Опора на опыт и детальное восприятие'
  },
  Se: {
    ru: 'Экстравертное ощущение',
    en: 'Extraverted Sensing',
    description: 'Восприятие текущего момента и физического мира'
  }
}
