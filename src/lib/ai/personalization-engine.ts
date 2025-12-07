import Anthropic from '@anthropic-ai/sdk'
import type { MBTIType } from '@/types/database'
import type {
  DailyInsight,
  JournalAnalysis,
  TypeSpecificTip,
  TipContext,
  PersonalizationConfig
} from './types'
import {
  getSystemPrompt,
  getDailyInsightPrompt,
  getJournalAnalysisPrompt,
  getTypeSpecificTipPrompt,
  getInferiorFunctionPrompt,
  extractJSON,
  DEFAULT_PROMPTS
} from './prompts'
import {
  performSafetyCheck,
  trackUsage,
  sanitizeInput,
  estimateTokens,
  DEFAULT_CONFIG
} from './sandbox'

/**
 * Main personalization engine using Claude Haiku
 */
export class PersonalizationEngine {
  private anthropic: Anthropic
  private config: PersonalizationConfig

  constructor(apiKey?: string, config?: Partial<PersonalizationConfig>) {
    if (!apiKey && !process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key is required. Set ANTHROPIC_API_KEY environment variable.')
    }

    this.anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY
    })

    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Make a request to Claude Haiku
   */
  private async makeRequest(
    prompt: string,
    systemPrompt?: string,
    maxTokens: number = 600
  ): Promise<string> {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: maxTokens,
      temperature: 0.7,
      system: systemPrompt || getSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    if (response.content[0].type === 'text') {
      return response.content[0].text
    }

    throw new Error('Unexpected response format from Claude')
  }

  /**
   * Generate a daily insight for a user
   */
  async generateDailyInsight(
    userId: string,
    mbtiType: MBTIType,
    userName?: string
  ): Promise<DailyInsight> {
    // Safety check
    const safetyCheck = await performSafetyCheck(
      userId,
      'daily insight generation',
      this.config
    )

    if (!safetyCheck.passed) {
      throw new Error(safetyCheck.reason || DEFAULT_PROMPTS.error)
    }

    try {
      // Generate prompt
      const prompt = getDailyInsightPrompt(mbtiType, userName)

      // Make request to Claude
      const response = await this.makeRequest(prompt)

      // Parse response
      const jsonStr = extractJSON(response)
      const parsed = JSON.parse(jsonStr)

      // Track usage (estimate)
      const tokensUsed = estimateTokens(response)
      await trackUsage(userId, tokensUsed)

      // Return structured insight
      return {
        title: parsed.title || 'Ваш ежедневный инсайт',
        content: parsed.content || '',
        cognitiveFunction: parsed.cognitiveFunction || 'Ni',
        actionItem: parsed.actionItem || 'Рефлексируйте о своих сильных сторонах',
        xpReward: this.config.xpRewards.dailyInsight,
        generatedAt: new Date()
      }
    } catch (error) {
      console.error('Error generating daily insight:', error)
      throw new Error(DEFAULT_PROMPTS.error)
    }
  }

  /**
   * Generate a type-specific tip for a given context
   */
  async generateTypeSpecificTip(
    userId: string,
    mbtiType: MBTIType,
    context: string,
    tipContext?: TipContext
  ): Promise<TypeSpecificTip> {
    // Sanitize input
    const sanitizedContext = sanitizeInput(context)

    // Safety check
    const safetyCheck = await performSafetyCheck(
      userId,
      sanitizedContext,
      this.config
    )

    if (!safetyCheck.passed) {
      throw new Error(safetyCheck.reason || DEFAULT_PROMPTS.error)
    }

    try {
      // Generate prompt
      const prompt = getTypeSpecificTipPrompt(
        mbtiType,
        sanitizedContext,
        tipContext?.challenges
      )

      // Make request to Claude
      const response = await this.makeRequest(prompt)

      // Parse response
      const jsonStr = extractJSON(response)
      const parsed = JSON.parse(jsonStr)

      // Track usage
      const tokensUsed = estimateTokens(response)
      await trackUsage(userId, tokensUsed)

      return {
        tip: parsed.tip || '',
        cognitiveFunction: parsed.cognitiveFunction || 'Ni',
        rationale: parsed.rationale || ''
      }
    } catch (error) {
      console.error('Error generating type-specific tip:', error)
      throw new Error(DEFAULT_PROMPTS.error)
    }
  }

  /**
   * Analyze a journal entry
   */
  async analyzeJournalEntry(
    userId: string,
    mbtiType: MBTIType,
    journalEntry: string
  ): Promise<JournalAnalysis> {
    // Sanitize input
    const sanitizedEntry = sanitizeInput(journalEntry)

    // Safety check
    const safetyCheck = await performSafetyCheck(
      userId,
      sanitizedEntry,
      this.config
    )

    if (!safetyCheck.passed) {
      throw new Error(safetyCheck.reason || DEFAULT_PROMPTS.error)
    }

    try {
      // Generate prompt
      const prompt = getJournalAnalysisPrompt(mbtiType, sanitizedEntry)

      // Make request to Claude (allow more tokens for analysis)
      const response = await this.makeRequest(prompt, undefined, 400)

      // Parse response
      const jsonStr = extractJSON(response)
      const parsed = JSON.parse(jsonStr)

      // Track usage
      const tokensUsed = estimateTokens(response)
      await trackUsage(userId, tokensUsed)

      return {
        emotionalTone: parsed.emotionalTone || 'neutral',
        themes: parsed.themes || [],
        cognitiveFunctionsUsed: parsed.cognitiveFunctionsUsed || [],
        growthOpportunities: parsed.growthOpportunities || [],
        feedback: parsed.feedback || '',
        xpReward: this.config.xpRewards.journalAnalysis
      }
    } catch (error) {
      console.error('Error analyzing journal entry:', error)
      throw new Error(DEFAULT_PROMPTS.error)
    }
  }

  /**
   * Generate an exercise for developing inferior function
   */
  async generateInferiorFunctionExercise(
    userId: string,
    mbtiType: MBTIType
  ): Promise<DailyInsight> {
    // Safety check
    const safetyCheck = await performSafetyCheck(
      userId,
      'inferior function exercise',
      this.config
    )

    if (!safetyCheck.passed) {
      throw new Error(safetyCheck.reason || DEFAULT_PROMPTS.error)
    }

    try {
      // Generate prompt
      const prompt = getInferiorFunctionPrompt(mbtiType)

      // Make request to Claude
      const response = await this.makeRequest(prompt)

      // Parse response
      const jsonStr = extractJSON(response)
      const parsed = JSON.parse(jsonStr)

      // Track usage
      const tokensUsed = estimateTokens(response)
      await trackUsage(userId, tokensUsed)

      return {
        title: parsed.title || 'Упражнение для развития',
        content: parsed.content || '',
        cognitiveFunction: parsed.cognitiveFunction || 'Se',
        actionItem: parsed.actionItem || 'Выполните упражнение сегодня',
        xpReward: this.config.xpRewards.dailyInsight,
        generatedAt: new Date()
      }
    } catch (error) {
      console.error('Error generating inferior function exercise:', error)
      throw new Error(DEFAULT_PROMPTS.error)
    }
  }

  /**
   * Get remaining quota for a user
   */
  async getRemainingQuota(userId: string): Promise<{
    tokensRemaining: number
    requestsRemaining: number
    resetAt?: Date
  }> {
    const safetyCheck = await performSafetyCheck(userId, '', this.config)

    return {
      tokensRemaining: safetyCheck.rateLimitCheck?.tokensRemaining || 0,
      requestsRemaining: safetyCheck.rateLimitCheck?.requestsRemaining || 0,
      resetAt: safetyCheck.rateLimitCheck?.resetAt
    }
  }
}

/**
 * Singleton instance for the personalization engine
 */
let engineInstance: PersonalizationEngine | null = null

/**
 * Get or create the personalization engine instance
 */
export function getPersonalizationEngine(
  apiKey?: string,
  config?: Partial<PersonalizationConfig>
): PersonalizationEngine {
  if (!engineInstance) {
    engineInstance = new PersonalizationEngine(apiKey, config)
  }
  return engineInstance
}

/**
 * Reset the engine instance (useful for testing)
 */
export function resetEngine(): void {
  engineInstance = null
}
