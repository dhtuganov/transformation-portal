'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdaptiveQuiz } from '@/components/features/adaptive-quiz'
import { QuizResult } from '@/components/features/adaptive-quiz'
import { Brain, Clock, Target, Shield, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { PsychometricItem, MBTIDimension } from '@/types/psychometric'

// ===========================================
// TYPES
// ===========================================

interface AssessmentResult {
  mbtiType: string
  dimensions: {
    EI: { preference: string; confidence: number; score: number }
    SN: { preference: string; confidence: number; score: number }
    TF: { preference: string; confidence: number; score: number }
    JP: { preference: string; confidence: number; score: number }
  }
  totalTime: number
}

type AssessmentState = 'intro' | 'quiz' | 'result' | 'saving'

// ===========================================
// MOCK ITEMS (until we connect to Supabase)
// Uses proper PsychometricItem interface
// ===========================================

const createMockItem = (
  id: string,
  code: string,
  dimension: MBTIDimension,
  questionRu: string,
  optionARu: string,
  optionBRu: string,
  difficulty: number = 0
): PsychometricItem => ({
  id,
  itemCode: code,
  dimension,
  questionTextRu: questionRu,
  questionTextEn: '',
  optionATextRu: optionARu,
  optionATextEn: '',
  optionBTextRu: optionBRu,
  optionBTextEn: '',
  irt: {
    discrimination: 1.5,
    difficulty,
    guessing: 0.1,
  },
  socialDesirabilityRisk: 'low',
  reverseScored: false,
  version: 1,
  isActive: true,
})

const MOCK_ITEMS: PsychometricItem[] = [
  // EI dimension
  createMockItem('1', 'EI-001', 'EI',
    'Что вас больше заряжает энергией?',
    'Общение с людьми, активные мероприятия',
    'Время наедине с собой, тихая обстановка',
    0
  ),
  createMockItem('2', 'EI-002', 'EI',
    'Как вы предпочитаете проводить выходные?',
    'Встречи с друзьями, вечеринки, активный отдых',
    'Чтение, хобби дома, прогулки в одиночестве',
    0.2
  ),
  createMockItem('3', 'EI-003', 'EI',
    'На совещании вы обычно:',
    'Активно высказываетесь, предлагаете идеи',
    'Слушаете, обдумываете, говорите по делу',
    -0.3
  ),

  // SN dimension
  createMockItem('4', 'SN-001', 'SN',
    'При решении задачи вы фокусируетесь на:',
    'Конкретных фактах и деталях',
    'Общей картине и возможностях',
    0.1
  ),
  createMockItem('5', 'SN-002', 'SN',
    'Какой подход к работе вам ближе?',
    'Проверенные методы и практический опыт',
    'Новые идеи и эксперименты',
    0
  ),
  createMockItem('6', 'SN-003', 'SN',
    'Что для вас важнее в проекте?',
    'Реалистичность и достижимость',
    'Инновационность и потенциал',
    0.2
  ),

  // TF dimension
  createMockItem('7', 'TF-001', 'TF',
    'При принятии решений вы опираетесь на:',
    'Логику и объективные критерии',
    'Ценности и влияние на людей',
    0
  ),
  createMockItem('8', 'TF-002', 'TF',
    'В конфликтной ситуации вы:',
    'Ищете объективное справедливое решение',
    'Стараетесь сохранить гармонию в отношениях',
    0.1
  ),
  createMockItem('9', 'TF-003', 'TF',
    'При критике чужой работы вы:',
    'Прямо указываете на недостатки',
    'Формулируете мягко, с учётом чувств',
    0.3
  ),

  // JP dimension
  createMockItem('10', 'JP-001', 'JP',
    'Как вы относитесь к планированию?',
    'Планирую заранее и придерживаюсь плана',
    'Предпочитаю гибкость и импровизацию',
    0
  ),
  createMockItem('11', 'JP-002', 'JP',
    'Незавершённые задачи вас:',
    'Беспокоят, стараюсь завершить быстрее',
    'Не особо тревожат, закончу когда будет нужно',
    0.2
  ),
  createMockItem('12', 'JP-003', 'JP',
    'Дедлайны для вас:',
    'Важные ориентиры, стараюсь не нарушать',
    'Скорее рекомендации, главное результат',
    -0.2
  ),
]

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function AssessmentPage() {
  const router = useRouter()
  const [state, setState] = useState<AssessmentState>('intro')
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasExistingResult, setHasExistingResult] = useState(false)

  useEffect(() => {
    checkExistingAssessment()
  }, [])

  const checkExistingAssessment = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('mbti_type')
          .eq('id', user.id)
          .single() as { data: { mbti_type: string | null } | null }

        if (profile?.mbti_type) {
          setHasExistingResult(true)
        }
      }
    } catch (error) {
      console.error('Error checking existing assessment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuizComplete = async (quizResult: AssessmentResult) => {
    setResult(quizResult)
    setState('saving')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Update profile with MBTI type
        // Using type assertion for columns added via migration
        await (supabase as unknown as {
          from: (t: string) => {
            update: (data: Record<string, unknown>) => {
              eq: (k: string, v: string) => Promise<unknown>
            }
          }
        })
          .from('profiles')
          .update({
            mbti_type: quizResult.mbtiType,
            mbti_verified: false,
          })
          .eq('id', user.id)

        // Save detailed assessment result
        // Note: assessment_results table from migration
        try {
          await (supabase as unknown as {
            from: (t: string) => {
              insert: (data: Record<string, unknown>) => Promise<unknown>
            }
          })
            .from('assessment_results')
            .insert({
              user_id: user.id,
              mbti_type: quizResult.mbtiType,
              dimension_scores: quizResult.dimensions,
              overall_confidence: calculateOverallConfidence(quizResult.dimensions),
              validity_flags: {},
              completion_time: quizResult.totalTime,
            })
        } catch {
          // Table might not exist yet
          console.log('Could not save to assessment_results table')
        }
      }
    } catch (error) {
      console.error('Error saving assessment result:', error)
    }

    setState('result')
  }

  const handleRetake = () => {
    setResult(null)
    setState('intro')
  }

  const handleContinue = () => {
    router.push('/dashboard/profile/cognitive')
  }

  const calculateOverallConfidence = (dimensions: AssessmentResult['dimensions']) => {
    return (
      dimensions.EI.confidence +
      dimensions.SN.confidence +
      dimensions.TF.confidence +
      dimensions.JP.confidence
    ) / 4
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      {state === 'intro' && (
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Brain className="h-8 w-8" />
              Типирование MBTI
            </h1>
            <p className="text-muted-foreground mt-1">
              Адаптивный тест для определения вашего психотипа
            </p>
          </div>
        </div>
      )}

      {/* Intro State */}
      {state === 'intro' && (
        <>
          {hasExistingResult && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="py-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  У вас уже есть результат типирования. Вы можете пройти тест заново,
                  и новый результат заменит предыдущий.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Как это работает</CardTitle>
              <CardDescription>
                Наш адаптивный тест использует современную психометрику
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Адаптивный алгоритм</h3>
                  <p className="text-sm text-muted-foreground">
                    Тест подстраивается под ваши ответы, задавая наиболее
                    информативные вопросы
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">10-15 минут</h3>
                  <p className="text-sm text-muted-foreground">
                    В среднем 40-60 вопросов. Точное количество зависит
                    от ваших ответов
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Научная точность</h3>
                  <p className="text-sm text-muted-foreground">
                    Основан на теории IRT (Item Response Theory),
                    используемой в профессиональной психодиагностике
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Рекомендации перед началом</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">1.</span>
                  <span>
                    Отвечайте так, как вы обычно себя ведёте, а не как хотели бы
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">2.</span>
                  <span>
                    Не задумывайтесь слишком долго — первая реакция обычно самая точная
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">3.</span>
                  <span>
                    Найдите спокойное место, где вас не будут отвлекать
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">4.</span>
                  <span>
                    Нет правильных или неправильных ответов — каждый тип уникален
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button size="lg" onClick={() => setState('quiz')}>
              Начать типирование
            </Button>
          </div>
        </>
      )}

      {/* Quiz State */}
      {state === 'quiz' && (
        <AdaptiveQuiz
          items={MOCK_ITEMS}
          onComplete={handleQuizComplete}
          locale="ru"
        />
      )}

      {/* Saving State */}
      {state === 'saving' && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Сохраняем результат...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result State */}
      {state === 'result' && result && (
        <QuizResult
          result={result}
          onContinue={handleContinue}
          onRetake={handleRetake}
          locale="ru"
        />
      )}
    </div>
  )
}
