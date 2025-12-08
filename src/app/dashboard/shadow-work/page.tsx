'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Moon,
  Play,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  Lock
} from 'lucide-react'
import { COGNITIVE_FUNCTIONS, COGNITIVE_FUNCTION_DESCRIPTIONS } from '@/lib/mbti'
import type { MBTIType, ShadowWorkProgram, ShadowWorkEnrollment } from '@/types/database'

interface ProgramWithEnrollment extends ShadowWorkProgram {
  enrollment?: ShadowWorkEnrollment | null
}

const THEME_COLORS = {
  awareness: 'bg-blue-100 text-blue-700',
  recognition: 'bg-purple-100 text-purple-700',
  integration: 'bg-green-100 text-green-700',
  mastery: 'bg-amber-100 text-amber-700',
}

const FUNCTION_ICONS: Record<string, string> = {
  Se: '👁️',
  Ne: '💡',
  Fe: '❤️',
  Te: '📊',
  Fi: '🎭',
  Ti: '🧠',
  Si: '📚',
  Ni: '🔮',
}

export default function ShadowWorkPage() {
  const [programs, setPrograms] = useState<ProgramWithEnrollment[]>([])
  const [userType, setUserType] = useState<MBTIType | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    console.log('[ShadowWork] Starting loadData...')
    try {
      const supabase = createClient()

      // Get user profile
      console.log('[ShadowWork] Getting user...')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('[ShadowWork] No user found')
        setLoading(false)
        return
      }
      console.log('[ShadowWork] User found:', user.id)

      console.log('[ShadowWork] Getting profile...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('mbti_type')
        .eq('id', user.id)
        .single() as { data: { mbti_type: string | null } | null; error: any }

      if (profileError) {
        console.error('[ShadowWork] Profile error:', profileError)
      }

      if (profile?.mbti_type) {
        setUserType(profile.mbti_type as MBTIType)
        console.log('[ShadowWork] User type:', profile.mbti_type)
      }

      // Get programs
      console.log('[ShadowWork] Getting programs...')
      const { data: programsData, error: programsError } = await (supabase
        .from('shadow_work_programs') as any)
        .select('*')
        .eq('is_active', true)
        .order('target_function')

      if (programsError) {
        console.error('[ShadowWork] Programs error:', programsError)
      }
      console.log('[ShadowWork] Programs loaded:', programsData?.length || 0)

      // Get user enrollments
      console.log('[ShadowWork] Getting enrollments...')
      const { data: enrollmentsData, error: enrollmentsError } = await (supabase
        .from('shadow_work_enrollments') as any)
        .select('*')
        .eq('user_id', user.id)

      if (enrollmentsError) {
        console.error('[ShadowWork] Enrollments error:', enrollmentsError)
      }
      console.log('[ShadowWork] Enrollments loaded:', enrollmentsData?.length || 0)

      // Merge programs with enrollments
      const programsWithEnrollment = (programsData || []).map((program: ShadowWorkProgram) => ({
        ...program,
        enrollment: enrollmentsData?.find((e: ShadowWorkEnrollment) => e.program_id === program.id) || null
      }))

      setPrograms(programsWithEnrollment)
      console.log('[ShadowWork] Data loaded successfully')
    } catch (error) {
      console.error('[ShadowWork] Error in loadData:', error)
    } finally {
      console.log('[ShadowWork] Setting loading to false')
      setLoading(false)
    }
  }

  const enrollInProgram = async (programId: string) => {
    setEnrolling(programId)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await (supabase
      .from('shadow_work_enrollments') as any)
      .insert({
        user_id: user.id,
        program_id: programId,
        status: 'active',
        current_week: 1,
        current_day: 1
      })

    if (!error) {
      await loadData()
    }
    setEnrolling(null)
  }

  const getInferiorFunction = (type: MBTIType): string => {
    return COGNITIVE_FUNCTIONS[type]?.inferior || ''
  }

  const getRecommendedProgram = (): ShadowWorkProgram | null => {
    if (!userType) return null
    const inferior = getInferiorFunction(userType)
    return programs.find(p => p.target_function === inferior) || null
  }

  const recommendedProgram = getRecommendedProgram()
  const activeEnrollment = programs.find(p => p.enrollment?.status === 'active')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Moon className="h-8 w-8 text-purple-600" />
          Shadow Work
        </h1>
        <p className="text-gray-600 mt-2">
          8-недельные программы интеграции подчинённой функции
        </p>
      </div>

      {/* Active Program Banner */}
      {activeEnrollment && (
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Badge className="bg-purple-600 mb-2">Активная программа</Badge>
                <h3 className="text-xl font-semibold">{activeEnrollment.title}</h3>
                <p className="text-gray-600 mt-1">
                  Неделя {activeEnrollment.enrollment?.current_week} из {activeEnrollment.duration_weeks} ·
                  День {activeEnrollment.enrollment?.current_day}
                </p>
                <div className="mt-3">
                  <Progress
                    value={((activeEnrollment.enrollment?.current_week || 1) - 1) / activeEnrollment.duration_weeks * 100}
                    className="w-64 h-2"
                  />
                </div>
              </div>
              <Link href={`/dashboard/shadow-work/${activeEnrollment.slug}`}>
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Продолжить
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Program */}
      {!activeEnrollment && recommendedProgram && userType && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">
                {FUNCTION_ICONS[recommendedProgram.target_function]}
              </div>
              <div className="flex-1">
                <Badge className="bg-amber-600 mb-2">Рекомендовано для {userType}</Badge>
                <h3 className="text-xl font-semibold">{recommendedProgram.title}</h3>
                <p className="text-gray-600 mt-1">{recommendedProgram.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="font-medium">{recommendedProgram.target_function}</span>
                  {' · '}
                  {COGNITIVE_FUNCTION_DESCRIPTIONS[recommendedProgram.target_function]?.shortLabel}
                  {' · '}
                  {COGNITIVE_FUNCTION_DESCRIPTIONS[recommendedProgram.target_function]?.name} — ваша подчинённая функция
                </p>
                <div className="mt-4">
                  <Button
                    onClick={() => enrollInProgram(recommendedProgram.id)}
                    disabled={enrolling === recommendedProgram.id}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {enrolling === recommendedProgram.id ? (
                      <>Запись...</>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Начать программу
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Programs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Все программы</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {programs.map((program) => {
            const isRecommended = userType && program.applicable_types.includes(userType)
            const functionDesc = COGNITIVE_FUNCTION_DESCRIPTIONS[program.target_function]
            const isEnrolled = program.enrollment !== null
            const isCompleted = program.enrollment?.status === 'completed'

            return (
              <Card
                key={program.id}
                className={`relative ${isRecommended ? 'ring-2 ring-purple-200' : ''}`}
              >
                {isRecommended && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-purple-600">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Для вас
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{FUNCTION_ICONS[program.target_function]}</div>
                    <div>
                      <CardTitle className="text-lg">{program.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <span className="font-medium">{program.target_function}</span>
                        {functionDesc && (
                          <span className="text-gray-500">
                            {' · '}{functionDesc.shortLabel} · {functionDesc.name}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{program.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {program.duration_weeks} недель
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {program.applicable_types.join(', ')}
                    </div>
                  </div>

                  {isCompleted ? (
                    <Button variant="outline" className="w-full" disabled>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                      Завершено
                    </Button>
                  ) : isEnrolled ? (
                    <Link href={`/dashboard/shadow-work/${program.slug}`}>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Продолжить
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : !isRecommended && userType ? (
                    <Button variant="outline" className="w-full" disabled>
                      <Lock className="mr-2 h-4 w-4" />
                      Не для вашего типа
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => enrollInProgram(program.id)}
                      disabled={enrolling === program.id || !userType}
                    >
                      {enrolling === program.id ? 'Запись...' : 'Начать программу'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Info Section */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Что такое Shadow Work?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Shadow Work (работа с тенью) — это процесс интеграции подчинённой когнитивной функции.
            Каждый MBTI-тип имеет &quot;слепую зону&quot; — функцию, которая развита меньше всего и часто
            активируется под стрессом негативным образом.
          </p>
          <div className="grid md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <Badge className={THEME_COLORS.awareness}>Недели 1-2</Badge>
              <p className="text-sm mt-2 font-medium">Осознание</p>
              <p className="text-xs text-gray-500">Заметить паттерны</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <Badge className={THEME_COLORS.recognition}>Недели 3-4</Badge>
              <p className="text-sm mt-2 font-medium">Распознавание</p>
              <p className="text-xs text-gray-500">Понять триггеры</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <Badge className={THEME_COLORS.integration}>Недели 5-6</Badge>
              <p className="text-sm mt-2 font-medium">Интеграция</p>
              <p className="text-xs text-gray-500">Практиковать</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <Badge className={THEME_COLORS.mastery}>Недели 7-8</Badge>
              <p className="text-sm mt-2 font-medium">Мастерство</p>
              <p className="text-xs text-gray-500">Балансировать</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
