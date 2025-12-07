import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Brain, Sparkles, AlertTriangle, TrendingUp } from 'lucide-react'
import type { MBTIType } from '@/types/database'
import { CognitiveFunctionStack, ShadowFunctions, FunctionRadar } from '@/components/features/cognitive-functions'
import { MBTI_FUNCTION_STACKS, COGNITIVE_FUNCTION_INFO, DEVELOPMENT_STAGE_INFO, type DevelopmentStage, type CognitiveProfile, type CognitiveFunction } from '@/types/psychometric'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Cognitive Profile | Otrar Transformation Portal',
  description: 'Your cognitive functions and development path',
}

// Type definitions
type ProfileData = {
  id: string
  mbti_type: string | null
  mbti_verified: boolean
  full_name: string | null
}

// Development stage icons (not in the type)
const STAGE_ICONS: Record<DevelopmentStage, string> = {
  emergence: '🌱',
  crystallization: '💎',
  differentiation: '🔀',
  integration: '🔄',
  transcendence: '✨',
}

export default async function CognitiveProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, mbti_type, mbti_verified, full_name')
    .eq('id', user.id)
    .single() as { data: ProfileData | null }

  // Get cognitive profile from new table (if exists)
  let cognitiveProfile: CognitiveProfile | null = null
  try {
    const { data } = await (supabase as unknown as {
      from: (t: string) => {
        select: (s: string) => {
          eq: (k: string, v: string) => {
            single: () => Promise<{ data: CognitiveProfile | null }>
          }
        }
      }
    })
      .from('cognitive_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    cognitiveProfile = data
  } catch {
    // Table might not exist yet - use defaults
  }

  const mbtiType = profile?.mbti_type as MBTIType | null
  const functionStack = mbtiType ? MBTI_FUNCTION_STACKS[mbtiType] : null

  // Generate default cognitive profile based on type
  const generateDefaultProfile = (type: MBTIType): CognitiveProfile => {
    const stack = MBTI_FUNCTION_STACKS[type]
    return {
      id: 'default',
      userId: user.id,
      tenantId: 'default',
      scores: {
        Ni: stack.dominant === 'Ni' ? 85 : stack.auxiliary === 'Ni' ? 70 : stack.tertiary === 'Ni' ? 45 : stack.inferior === 'Ni' ? 25 : 15,
        Ne: stack.dominant === 'Ne' ? 85 : stack.auxiliary === 'Ne' ? 70 : stack.tertiary === 'Ne' ? 45 : stack.inferior === 'Ne' ? 25 : 15,
        Si: stack.dominant === 'Si' ? 85 : stack.auxiliary === 'Si' ? 70 : stack.tertiary === 'Si' ? 45 : stack.inferior === 'Si' ? 25 : 15,
        Se: stack.dominant === 'Se' ? 85 : stack.auxiliary === 'Se' ? 70 : stack.tertiary === 'Se' ? 45 : stack.inferior === 'Se' ? 25 : 15,
        Ti: stack.dominant === 'Ti' ? 85 : stack.auxiliary === 'Ti' ? 70 : stack.tertiary === 'Ti' ? 45 : stack.inferior === 'Ti' ? 25 : 15,
        Te: stack.dominant === 'Te' ? 85 : stack.auxiliary === 'Te' ? 70 : stack.tertiary === 'Te' ? 45 : stack.inferior === 'Te' ? 25 : 15,
        Fi: stack.dominant === 'Fi' ? 85 : stack.auxiliary === 'Fi' ? 70 : stack.tertiary === 'Fi' ? 45 : stack.inferior === 'Fi' ? 25 : 15,
        Fe: stack.dominant === 'Fe' ? 85 : stack.auxiliary === 'Fe' ? 70 : stack.tertiary === 'Fe' ? 45 : stack.inferior === 'Fe' ? 25 : 15,
      },
      functionStack: [stack.dominant, stack.auxiliary, stack.tertiary, stack.inferior],
      shadowStack: [...stack.shadow],
      developmentStage: 'differentiation',
      manuallyAdjusted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  const effectiveProfile = mbtiType
    ? (cognitiveProfile || generateDefaultProfile(mbtiType))
    : null

  // Determine development stage
  const developmentStage = effectiveProfile?.developmentStage || 'differentiation'
  const stageInfo = DEVELOPMENT_STAGE_INFO[developmentStage]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/profile">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Когнитивный профиль
          </h1>
          <p className="text-muted-foreground mt-1">
            Ваши когнитивные функции и путь развития
          </p>
        </div>
      </div>

      {!mbtiType ? (
        /* No MBTI type yet */
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                MBTI-тип не определён
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Для просмотра когнитивного профиля необходимо пройти типирование.
                Это займёт около 10-15 минут.
              </p>
              <Button asChild>
                <Link href="/dashboard/assessment">
                  Пройти типирование
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Main Cognitive Stack */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Function Stack */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Функциональный стек {mbtiType}
                </CardTitle>
                <CardDescription>
                  Ваши основные когнитивные функции в порядке предпочтения
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CognitiveFunctionStack
                  mbtiType={mbtiType}
                  profile={effectiveProfile || undefined}
                  showScores
                  showDescriptions
                  locale="ru"
                />
              </CardContent>
            </Card>

            {/* Function Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Радар функций</CardTitle>
                <CardDescription>
                  Визуализация всех 8 когнитивных функций
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {effectiveProfile && (
                  <FunctionRadar
                    profile={effectiveProfile}
                    size={300}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Shadow Functions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Теневые функции
              </CardTitle>
              <CardDescription>
                Функции, которые работают неосознанно и проявляются в стрессе.
                Интеграция тени — ключ к личностному росту.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShadowFunctions
                mbtiType={mbtiType}
                collapsed={false}
                locale="ru"
              />
            </CardContent>
          </Card>

          {/* Development Stage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Стадия развития
              </CardTitle>
              <CardDescription>
                Модель развития типа по Тайгер (Tiger Development Model)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Stage */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{STAGE_ICONS[developmentStage]}</span>
                    <div>
                      <h4 className="font-bold text-lg">{stageInfo.name.ru}</h4>
                      <p className="text-sm text-muted-foreground">
                        {stageInfo.ageRange}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    {stageInfo.description.ru}
                  </p>

                  {/* Focus areas */}
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-medium mb-2">Фокус развития:</h5>
                    {functionStack && (
                      <div className="flex flex-wrap gap-2">
                        {developmentStage === 'emergence' && (
                          <FunctionBadge func={functionStack.dominant} />
                        )}
                        {developmentStage === 'crystallization' && (
                          <>
                            <FunctionBadge func={functionStack.dominant} />
                            <FunctionBadge func={functionStack.auxiliary} secondary />
                          </>
                        )}
                        {developmentStage === 'differentiation' && (
                          <>
                            <FunctionBadge func={functionStack.auxiliary} />
                            <FunctionBadge func={functionStack.tertiary} secondary />
                          </>
                        )}
                        {developmentStage === 'integration' && (
                          <>
                            <FunctionBadge func={functionStack.tertiary} />
                            <FunctionBadge func={functionStack.inferior} secondary />
                          </>
                        )}
                        {developmentStage === 'transcendence' && (
                          <>
                            <FunctionBadge func={functionStack.inferior} />
                            <span className="text-sm text-muted-foreground">
                              + тень
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* All Stages Timeline */}
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                  {(Object.entries(DEVELOPMENT_STAGE_INFO) as [DevelopmentStage, typeof stageInfo][]).map(([stage, info], index) => {
                    const isActive = stage === developmentStage
                    const isPast = Object.keys(DEVELOPMENT_STAGE_INFO).indexOf(developmentStage) > index

                    return (
                      <div key={stage} className="relative flex items-start gap-4 pb-6 last:pb-0">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm z-10
                          ${isActive
                            ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                            : isPast
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-muted-foreground'
                          }
                        `}>
                          {isPast ? '✓' : STAGE_ICONS[stage]}
                        </div>
                        <div className={`flex-1 ${!isActive && 'opacity-60'}`}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{info.name.ru}</span>
                            <span className="text-xs text-muted-foreground">
                              {info.ageRange}
                            </span>
                          </div>
                          {isActive && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {info.description.ru}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Function Info */}
          <Card>
            <CardHeader>
              <CardTitle>Подробное описание функций</CardTitle>
              <CardDescription>
                Нажмите на функцию для получения детальной информации
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {functionStack && (
                  <>
                    <FunctionDetailCard
                      func={functionStack.dominant}
                      role="Доминантная"
                      description="Ваша главная сила, естественный режим работы сознания"
                    />
                    <FunctionDetailCard
                      func={functionStack.auxiliary}
                      role="Вспомогательная"
                      description="Поддерживает доминантную, балансирует восприятие"
                    />
                    <FunctionDetailCard
                      func={functionStack.tertiary}
                      role="Третичная"
                      description="Развивается в зрелом возрасте, источник творчества"
                    />
                    <FunctionDetailCard
                      func={functionStack.inferior}
                      role="Подчинённая"
                      description="Слабое место и источник роста, проявляется в стрессе"
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/dashboard/learning?topic=cognitive-functions">
                Изучить когнитивные функции
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/development?focus=shadow">
                Начать работу с тенью
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// ===========================================
// HELPER COMPONENTS
// ===========================================

function FunctionBadge({ func, secondary }: { func: CognitiveFunction; secondary?: boolean }) {
  const info = COGNITIVE_FUNCTION_INFO[func]

  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
      ${secondary
        ? 'bg-gray-100 dark:bg-gray-800 text-muted-foreground'
        : 'bg-primary/10 text-primary font-medium'
      }
    `}>
      {info?.icon} {func} - {info?.name.ru}
    </span>
  )
}

function FunctionDetailCard({
  func,
  role,
  description
}: {
  func: CognitiveFunction
  role: string
  description: string
}) {
  const info = COGNITIVE_FUNCTION_INFO[func]

  if (!info) return null

  return (
    <div className="p-4 rounded-lg border hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{info.icon}</span>
        <div>
          <h4 className="font-bold">{func} - {info.name.ru}</h4>
          <p className="text-xs text-primary">{role}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{description}</p>
      <p className="text-sm">{info.description.ru}</p>
    </div>
  )
}
