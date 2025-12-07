'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { MBTIDimension, PsychometricItem, AdaptiveSession } from '@/types/psychometric'
import {
  estimateTheta,
  selectNextItem,
  checkStoppingCriteria,
  selectNextDimension,
  isAssessmentComplete,
  thetaToPreference,
  DEFAULT_ADAPTIVE_CONFIG,
} from '@/lib/psychometric/adaptive-engine'

// ===========================================
// TYPES
// ===========================================

interface AdaptiveQuizProps {
  items: PsychometricItem[]
  onComplete: (result: QuizResult) => void
  onProgress?: (progress: QuizProgress) => void
  locale?: 'ru' | 'en'
  className?: string
}

interface QuizProgress {
  totalAnswered: number
  estimatedRemaining: number
  currentDimension: MBTIDimension
  dimensionProgress: Record<MBTIDimension, number>
}

interface QuizResult {
  mbtiType: string
  dimensions: {
    EI: { preference: string; confidence: number; score: number }
    SN: { preference: string; confidence: number; score: number }
    TF: { preference: string; confidence: number; score: number }
    JP: { preference: string; confidence: number; score: number }
  }
  responses: ResponseRecord[]
  totalTime: number
}

interface ResponseRecord {
  itemId: string
  response: 'A' | 'B'
  responseTimeMs: number
  dimension: MBTIDimension
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export function AdaptiveQuiz({
  items,
  onComplete,
  onProgress,
  locale = 'ru',
  className,
}: AdaptiveQuizProps) {
  // Session state
  const [session, setSession] = useState<AdaptiveSession | null>(null)
  const [currentItem, setCurrentItem] = useState<PsychometricItem | null>(null)
  const [responses, setResponses] = useState<ResponseRecord[]>([])
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [startTime] = useState<number>(Date.now())

  // Item pools by dimension
  const [itemPools] = useState(() => {
    const pools: Record<MBTIDimension, PsychometricItem[]> = {
      EI: items.filter(i => i.dimension === 'EI'),
      SN: items.filter(i => i.dimension === 'SN'),
      TF: items.filter(i => i.dimension === 'TF'),
      JP: items.filter(i => i.dimension === 'JP'),
    }
    return pools
  })

  // Administered items tracking
  const [administeredIds] = useState<Record<MBTIDimension, Set<string>>>({
    EI: new Set(),
    SN: new Set(),
    TF: new Set(),
    JP: new Set(),
  })

  // Initialize session
  useEffect(() => {
    const initialSession: AdaptiveSession = {
      id: crypto.randomUUID(),
      userId: '',
      tenantId: '',
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      theta: {
        EI: { value: 0, se: 1, information: 0 },
        SN: { value: 0, se: 1, information: 0 },
        TF: { value: 0, se: 1, information: 0 },
        JP: { value: 0, se: 1, information: 0 },
      },
      itemsAdministered: { EI: 0, SN: 0, TF: 0, JP: 0 },
      validity: {
        consistencyScore: undefined,
        responseTimeFlag: false,
        socialDesirabilityScore: undefined,
      },
    }
    setSession(initialSession)
    selectNextQuestion(initialSession)
  }, [])

  // Select next question
  const selectNextQuestion = useCallback((currentSession: AdaptiveSession) => {
    // Check if assessment is complete
    if (isAssessmentComplete(currentSession, DEFAULT_ADAPTIVE_CONFIG)) {
      finishAssessment(currentSession)
      return
    }

    // Select dimension to test
    const dimension = selectNextDimension(currentSession, DEFAULT_ADAPTIVE_CONFIG)
    if (!dimension) {
      finishAssessment(currentSession)
      return
    }

    // Select item from that dimension
    const item = selectNextItem(
      currentSession.theta[dimension].value,
      itemPools[dimension],
      administeredIds[dimension],
      DEFAULT_ADAPTIVE_CONFIG.itemSelectionMethod
    )

    if (!item) {
      // No more items for this dimension, try another
      const altDimensions: MBTIDimension[] = ['EI', 'SN', 'TF', 'JP'].filter(d => d !== dimension) as MBTIDimension[]
      for (const altDim of altDimensions) {
        const altItem = selectNextItem(
          currentSession.theta[altDim].value,
          itemPools[altDim],
          administeredIds[altDim],
          DEFAULT_ADAPTIVE_CONFIG.itemSelectionMethod
        )
        if (altItem) {
          setCurrentItem(altItem)
          setQuestionStartTime(Date.now())
          return
        }
      }
      finishAssessment(currentSession)
      return
    }

    setCurrentItem(item)
    setQuestionStartTime(Date.now())

    // Report progress
    if (onProgress) {
      const totalAnswered = Object.values(currentSession.itemsAdministered).reduce((a, b) => a + b, 0)
      const estimatedRemaining = Math.max(0,
        (DEFAULT_ADAPTIVE_CONFIG.minItemsPerDimension * 4) - totalAnswered
      )
      onProgress({
        totalAnswered,
        estimatedRemaining,
        currentDimension: dimension,
        dimensionProgress: { ...currentSession.itemsAdministered },
      })
    }
  }, [itemPools, administeredIds, onProgress])

  // Handle answer
  const handleAnswer = useCallback((response: 'A' | 'B') => {
    if (!currentItem || !session || isTransitioning) return

    setIsTransitioning(true)
    const responseTime = Date.now() - questionStartTime

    // Record response
    const newResponse: ResponseRecord = {
      itemId: currentItem.id,
      response,
      responseTimeMs: responseTime,
      dimension: currentItem.dimension,
    }
    const updatedResponses = [...responses, newResponse]
    setResponses(updatedResponses)

    // Mark item as administered
    administeredIds[currentItem.dimension].add(currentItem.id)

    // Get all responses for this dimension
    const dimensionResponses = updatedResponses
      .filter(r => r.dimension === currentItem.dimension)
      .map(r => ({
        item: items.find(i => i.id === r.itemId)!,
        response: r.response,
      }))

    // Re-estimate theta for this dimension
    const newTheta = estimateTheta(dimensionResponses)

    // Update session
    const updatedSession: AdaptiveSession = {
      ...session,
      theta: {
        ...session.theta,
        [currentItem.dimension]: newTheta,
      },
      itemsAdministered: {
        ...session.itemsAdministered,
        [currentItem.dimension]: session.itemsAdministered[currentItem.dimension] + 1,
      },
    }
    setSession(updatedSession)

    // Brief transition delay
    setTimeout(() => {
      setIsTransitioning(false)
      selectNextQuestion(updatedSession)
    }, 300)
  }, [currentItem, session, isTransitioning, questionStartTime, responses, items, administeredIds, selectNextQuestion])

  // Finish assessment
  const finishAssessment = useCallback((finalSession: AdaptiveSession) => {
    const result: QuizResult = {
      mbtiType: '',
      dimensions: {
        EI: { preference: 'E', confidence: 0, score: 50 },
        SN: { preference: 'S', confidence: 0, score: 50 },
        TF: { preference: 'T', confidence: 0, score: 50 },
        JP: { preference: 'J', confidence: 0, score: 50 },
      },
      responses,
      totalTime: Date.now() - startTime,
    }

    // Calculate final results for each dimension
    const dims: MBTIDimension[] = ['EI', 'SN', 'TF', 'JP']
    let mbtiType = ''

    for (const dim of dims) {
      const theta = finalSession.theta[dim]
      const pref = thetaToPreference(theta.value, dim)

      result.dimensions[dim] = {
        preference: pref.preference,
        confidence: Math.max(0, Math.min(1, 1 - theta.se)),
        score: pref.score,
      }

      mbtiType += pref.preference
    }

    result.mbtiType = mbtiType
    onComplete(result)
  }, [responses, startTime, onComplete])

  // Calculate progress
  const totalAnswered = session
    ? Object.values(session.itemsAdministered).reduce((a, b) => a + b, 0)
    : 0
  const estimatedTotal = DEFAULT_ADAPTIVE_CONFIG.minItemsPerDimension * 4
  const progressPercent = Math.min(100, (totalAnswered / estimatedTotal) * 100)

  if (!currentItem || !session) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const questionText = locale === 'ru' ? currentItem.questionTextRu : (currentItem.questionTextEn || currentItem.questionTextRu)
  const optionAText = locale === 'ru' ? currentItem.optionATextRu : (currentItem.optionATextEn || currentItem.optionATextRu)
  const optionBText = locale === 'ru' ? currentItem.optionBTextRu : (currentItem.optionBTextEn || currentItem.optionBTextRu)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {locale === 'ru' ? 'Вопрос' : 'Question'} {totalAnswered + 1}
          </span>
          <span>~{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />

        {/* Dimension indicators */}
        <div className="flex justify-center gap-2 mt-3">
          {(['EI', 'SN', 'TF', 'JP'] as MBTIDimension[]).map(dim => {
            const count = session.itemsAdministered[dim]
            const isActive = currentItem.dimension === dim
            const isComplete = checkStoppingCriteria(
              count,
              session.theta[dim].se,
              itemPools[dim].length - administeredIds[dim].size,
              DEFAULT_ADAPTIVE_CONFIG
            ).shouldStop

            return (
              <div
                key={dim}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  isActive && 'ring-2 ring-primary ring-offset-2 scale-110',
                  isComplete
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {dim}
              </div>
            )
          })}
        </div>
      </div>

      {/* Question */}
      <div
        className={cn(
          'text-center py-8 transition-opacity duration-300',
          isTransitioning && 'opacity-50'
        )}
      >
        <h2 className="text-xl font-semibold mb-8">
          {questionText}
        </h2>

        {/* Options */}
        <div className="space-y-4 max-w-lg mx-auto">
          <Button
            variant="outline"
            size="lg"
            className={cn(
              'w-full py-6 h-auto text-left justify-start whitespace-normal',
              'hover:bg-primary hover:text-primary-foreground transition-all'
            )}
            onClick={() => handleAnswer('A')}
            disabled={isTransitioning}
          >
            <span className="mr-3 text-lg font-bold opacity-50">A</span>
            {optionAText}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className={cn(
              'w-full py-6 h-auto text-left justify-start whitespace-normal',
              'hover:bg-primary hover:text-primary-foreground transition-all'
            )}
            onClick={() => handleAnswer('B')}
            disabled={isTransitioning}
          >
            <span className="mr-3 text-lg font-bold opacity-50">B</span>
            {optionBText}
          </Button>
        </div>
      </div>

      {/* Hint */}
      <p className="text-center text-sm text-muted-foreground">
        {locale === 'ru'
          ? 'Выберите вариант, который лучше описывает вас в большинстве ситуаций'
          : 'Choose the option that better describes you in most situations'}
      </p>
    </div>
  )
}
