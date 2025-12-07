import type { AIUsage, SafetyValidation, RateLimitCheck, PersonalizationConfig } from './types'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

// Type for AI usage table row
type AIUsageRow = Database['public']['Tables']['ai_usage']['Row']

/**
 * Default configuration for AI personalization
 */
export const DEFAULT_CONFIG: PersonalizationConfig = {
  dailyTokenBudget: 1000,
  maxRequestsPerDay: 10,
  maxTokensPerRequest: 300,
  allowedTopics: [
    'психология',
    'развитие личности',
    'когнитивные функции',
    'MBTI',
    'самопознание',
    'эмоциональный интеллект',
    'коммуникация',
    'рефлексия',
    'личностный рост',
    'мотивация'
  ],
  xpRewards: {
    dailyInsight: 10,
    journalAnalysis: 15,
    tipGeneration: 5
  }
}

/**
 * Get current date in ISO format (YYYY-MM-DD)
 */
function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get AI usage for a user on a specific date
 */
async function getUsage(userId: string, date: string): Promise<AIUsage | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ai_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single()

  if (error || !data) {
    // If no record exists, return null
    if (error?.code === 'PGRST116') {
      return null
    }
    if (error) {
      console.error('Error fetching AI usage:', error)
    }
    return null
  }

  const row = data as AIUsageRow
  return {
    userId: row.user_id,
    date: row.date,
    tokensUsed: row.tokens_used,
    requestCount: row.request_count,
    lastRequestAt: new Date(row.last_request_at)
  }
}

/**
 * Update AI usage for a user
 */
async function updateUsage(
  userId: string,
  date: string,
  tokensUsed: number
): Promise<void> {
  const supabase = await createClient()

  const currentUsage = await getUsage(userId, date)

  if (currentUsage) {
    // Update existing record
    const updateData: Database['public']['Tables']['ai_usage']['Update'] = {
      tokens_used: currentUsage.tokensUsed + tokensUsed,
      request_count: currentUsage.requestCount + 1,
      last_request_at: new Date().toISOString()
    }
    await supabase
      .from('ai_usage')
      .update(updateData as never)
      .eq('user_id', userId)
      .eq('date', date)
  } else {
    // Create new record
    const insertData: Database['public']['Tables']['ai_usage']['Insert'] = {
      user_id: userId,
      date,
      tokens_used: tokensUsed,
      request_count: 1,
      last_request_at: new Date().toISOString()
    }
    await supabase
      .from('ai_usage')
      .insert(insertData as never)
  }
}

/**
 * Check if user has exceeded rate limits
 */
export async function checkRateLimit(
  userId: string,
  config: PersonalizationConfig = DEFAULT_CONFIG
): Promise<RateLimitCheck> {
  const today = getCurrentDate()
  const usage = await getUsage(userId, today)

  if (!usage) {
    // No usage yet today
    return {
      allowed: true,
      tokensRemaining: config.dailyTokenBudget,
      requestsRemaining: config.maxRequestsPerDay
    }
  }

  const tokensRemaining = config.dailyTokenBudget - usage.tokensUsed
  const requestsRemaining = config.maxRequestsPerDay - usage.requestCount

  // Calculate reset time (next day at midnight)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  if (tokensRemaining <= 0 || requestsRemaining <= 0) {
    return {
      allowed: false,
      tokensRemaining: Math.max(0, tokensRemaining),
      requestsRemaining: Math.max(0, requestsRemaining),
      resetAt: tomorrow
    }
  }

  return {
    allowed: true,
    tokensRemaining,
    requestsRemaining,
    resetAt: tomorrow
  }
}

/**
 * Track AI usage after a request
 */
export async function trackUsage(
  userId: string,
  tokensUsed: number
): Promise<void> {
  const today = getCurrentDate()
  await updateUsage(userId, today, tokensUsed)
}

/**
 * Validate that the topic is within allowed scope
 */
export function validateTopic(
  userInput: string,
  config: PersonalizationConfig = DEFAULT_CONFIG
): SafetyValidation {
  const lowerInput = userInput.toLowerCase()

  // Check for disallowed topics
  const disallowedTopics = [
    'политика',
    'религия',
    'медицинский диагноз',
    'лечение',
    'терапия',
    'медикаменты',
    'суицид',
    'самоповреждение'
  ]

  for (const topic of disallowedTopics) {
    if (lowerInput.includes(topic)) {
      return {
        isValid: false,
        reason: `Этот запрос содержит тему "${topic}", которая выходит за рамки допустимых.`,
        topic
      }
    }
  }

  // Check if input contains at least one allowed topic
  const hasAllowedTopic = config.allowedTopics.some(topic =>
    lowerInput.includes(topic.toLowerCase())
  )

  // For general psychology insights, be more lenient
  const generalPsychologyTerms = [
    'развитие',
    'рост',
    'личность',
    'характер',
    'поведение',
    'мышление',
    'чувства',
    'эмоции',
    'отношения',
    'общение',
    'работа',
    'карьера',
    'цели',
    'мотивация'
  ]

  const hasGeneralTerm = generalPsychologyTerms.some(term =>
    lowerInput.includes(term)
  )

  if (!hasAllowedTopic && !hasGeneralTerm && userInput.length > 50) {
    return {
      isValid: false,
      reason: 'Этот запрос не связан с психологией и развитием личности.'
    }
  }

  return { isValid: true }
}

/**
 * Sanitize user input to prevent prompt injection
 */
export function sanitizeInput(input: string): string {
  // Remove potential prompt injection attempts
  let sanitized = input
    .replace(/system:/gi, '')
    .replace(/assistant:/gi, '')
    .replace(/human:/gi, '')
    .replace(/\[INST\]/gi, '')
    .replace(/\[\/INST\]/gi, '')
    .trim()

  // Limit length
  const maxLength = 2000
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}

/**
 * Estimate token count (rough approximation)
 * Claude uses ~4 characters per token on average
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Validate that response doesn't exceed token budget
 */
export function validateResponseLength(
  response: string,
  maxTokens: number = DEFAULT_CONFIG.maxTokensPerRequest
): boolean {
  const estimatedTokens = estimateTokens(response)
  return estimatedTokens <= maxTokens
}

/**
 * Complete safety check before making AI request
 */
export async function performSafetyCheck(
  userId: string,
  userInput: string,
  config: PersonalizationConfig = DEFAULT_CONFIG
): Promise<{
  passed: boolean
  reason?: string
  rateLimitCheck?: RateLimitCheck
}> {
  // Check rate limits
  const rateLimitCheck = await checkRateLimit(userId, config)
  if (!rateLimitCheck.allowed) {
    return {
      passed: false,
      reason: 'Превышен дневной лимит запросов. Попробуйте завтра.',
      rateLimitCheck
    }
  }

  // Validate topic
  const topicValidation = validateTopic(userInput, config)
  if (!topicValidation.isValid) {
    return {
      passed: false,
      reason: topicValidation.reason,
      rateLimitCheck
    }
  }

  return {
    passed: true,
    rateLimitCheck
  }
}

/**
 * Get usage statistics for a user (for admin/analytics)
 */
export async function getUserUsageStats(userId: string, days: number = 7): Promise<AIUsage[]> {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('ai_usage')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false })

  if (error || !data) {
    console.error('Error fetching usage stats:', error)
    return []
  }

  const rows = data as AIUsageRow[]
  return rows.map(row => ({
    userId: row.user_id,
    date: row.date,
    tokensUsed: row.tokens_used,
    requestCount: row.request_count,
    lastRequestAt: new Date(row.last_request_at)
  }))
}
