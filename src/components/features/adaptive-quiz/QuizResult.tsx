'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { MBTIType } from '@/types/database'
import { MBTI_DESCRIPTIONS } from '@/types/quiz'
import { CognitiveFunctionStack } from '../cognitive-functions/CognitiveFunctionStack'

// ===========================================
// TYPES
// ===========================================

interface QuizResultProps {
  result: {
    mbtiType: string
    dimensions: {
      EI: { preference: string; confidence: number; score: number }
      SN: { preference: string; confidence: number; score: number }
      TF: { preference: string; confidence: number; score: number }
      JP: { preference: string; confidence: number; score: number }
    }
    totalTime: number
  }
  onContinue?: () => void
  onRetake?: () => void
  locale?: 'ru' | 'en'
  className?: string
}

// ===========================================
// DIMENSION LABELS
// ===========================================

const DIMENSION_LABELS: Record<'ru' | 'en', Record<string, { left: string; right: string }>> = {
  ru: {
    EI: { left: 'Экстраверсия (E)', right: 'Интроверсия (I)' },
    SN: { left: 'Сенсорика (S)', right: 'Интуиция (N)' },
    TF: { left: 'Логика (T)', right: 'Чувство (F)' },
    JP: { left: 'Суждение (J)', right: 'Восприятие (P)' },
  },
  en: {
    EI: { left: 'Extraversion (E)', right: 'Introversion (I)' },
    SN: { left: 'Sensing (S)', right: 'Intuition (N)' },
    TF: { left: 'Thinking (T)', right: 'Feeling (F)' },
    JP: { left: 'Judging (J)', right: 'Perceiving (P)' },
  },
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export function QuizResult({
  result,
  onContinue,
  onRetake,
  locale = 'ru',
  className,
}: QuizResultProps) {
  const mbtiType = result.mbtiType as MBTIType
  const typeInfo = MBTI_DESCRIPTIONS[mbtiType]

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getConfidenceLabel = (confidence: number, loc: 'ru' | 'en') => {
    if (confidence >= 0.8) return loc === 'ru' ? 'Очень чёткое' : 'Very clear'
    if (confidence >= 0.6) return loc === 'ru' ? 'Чёткое' : 'Clear'
    if (confidence >= 0.4) return loc === 'ru' ? 'Умеренное' : 'Moderate'
    if (confidence >= 0.2) return loc === 'ru' ? 'Слабое' : 'Slight'
    return loc === 'ru' ? 'Неясное' : 'Unclear'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-blue-600'
    if (confidence >= 0.4) return 'text-yellow-600'
    return 'text-orange-600'
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-block">
          <div className="text-6xl mb-2">{typeInfo?.emoji || '🎯'}</div>
          <h1 className="text-4xl font-bold tracking-tight">{mbtiType}</h1>
          <p className="text-xl text-muted-foreground mt-1">
            {typeInfo?.name || ''}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          {locale === 'ru' ? 'Время прохождения:' : 'Time taken:'} {formatTime(result.totalTime)}
        </p>
      </div>

      {/* Dimension bars */}
      <div className="space-y-6 max-w-xl mx-auto">
        {(['EI', 'SN', 'TF', 'JP'] as const).map(dim => {
          const data = result.dimensions[dim]
          const labels = DIMENSION_LABELS[locale][dim]
          const isLeftPreference = data.preference === dim[0]
          const position = isLeftPreference ? 50 - (100 - data.score) / 2 : 50 + (data.score - 50) / 2

          return (
            <div key={dim} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={cn(!isLeftPreference && 'text-muted-foreground')}>
                  {labels.left}
                </span>
                <span className={cn(
                  'font-medium',
                  getConfidenceColor(data.confidence)
                )}>
                  {getConfidenceLabel(data.confidence, locale)}
                </span>
                <span className={cn(isLeftPreference && 'text-muted-foreground')}>
                  {labels.right}
                </span>
              </div>

              <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                {/* Center line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400 dark:bg-gray-500 z-10" />

                {/* Preference indicator */}
                <div
                  className="absolute top-1 bottom-1 rounded-full bg-primary transition-all duration-500"
                  style={{
                    left: isLeftPreference ? `${100 - data.score}%` : '50%',
                    right: isLeftPreference ? '50%' : `${100 - data.score}%`,
                  }}
                />

                {/* Preference letter */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg transition-all duration-500 z-20"
                  style={{
                    left: `calc(${isLeftPreference ? (100 - data.score) / 2 : 50 + (data.score - 50) / 2}% - 12px)`,
                  }}
                >
                  {data.preference}
                </div>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{100 - data.score}%</span>
                <span>{data.score}%</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Overall confidence */}
      <div className="text-center p-4 bg-muted rounded-lg max-w-xl mx-auto">
        <p className="text-sm text-muted-foreground mb-1">
          {locale === 'ru' ? 'Общая уверенность результата' : 'Overall result confidence'}
        </p>
        <p className={cn(
          'text-lg font-bold',
          getConfidenceColor(
            (result.dimensions.EI.confidence +
              result.dimensions.SN.confidence +
              result.dimensions.TF.confidence +
              result.dimensions.JP.confidence) / 4
          )
        )}>
          {Math.round(
            ((result.dimensions.EI.confidence +
              result.dimensions.SN.confidence +
              result.dimensions.TF.confidence +
              result.dimensions.JP.confidence) / 4) * 100
          )}%
        </p>
      </div>

      {/* Cognitive functions preview */}
      <div className="max-w-xl mx-auto">
        <h3 className="font-semibold mb-4">
          {locale === 'ru' ? 'Ваши когнитивные функции' : 'Your Cognitive Functions'}
        </h3>
        <CognitiveFunctionStack
          mbtiType={mbtiType}
          showScores={false}
          showDescriptions={false}
          locale={locale}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        {onRetake && (
          <Button variant="outline" onClick={onRetake}>
            {locale === 'ru' ? 'Пройти заново' : 'Retake'}
          </Button>
        )}
        {onContinue && (
          <Button onClick={onContinue}>
            {locale === 'ru' ? 'Продолжить' : 'Continue'}
          </Button>
        )}
      </div>
    </div>
  )
}
