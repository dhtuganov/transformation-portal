'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Moon,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  Play,
  BookOpen,
  Brain,
  Heart,
  Eye,
  Zap,
  ChevronRight,
  Save,
  Loader2
} from 'lucide-react'
import { COGNITIVE_FUNCTION_DESCRIPTIONS } from '@/lib/mbti'
import type {
  ShadowWorkProgram,
  ShadowWorkWeek,
  ShadowWorkExercise,
  ShadowWorkEnrollment,
  ShadowWorkProgress
} from '@/types/database'

interface WeekWithExercises extends ShadowWorkWeek {
  exercises: ShadowWorkExercise[]
}

interface ProgramData {
  program: ShadowWorkProgram
  weeks: WeekWithExercises[]
  enrollment: ShadowWorkEnrollment | null
  progress: ShadowWorkProgress[]
}

const EXERCISE_ICONS: Record<string, typeof BookOpen> = {
  reflection: Brain,
  journaling: BookOpen,
  practice: Zap,
  meditation: Heart,
  observation: Eye,
  action: Play,
}

const THEME_COLORS = {
  awareness: 'from-blue-500 to-blue-600',
  recognition: 'from-purple-500 to-purple-600',
  integration: 'from-green-500 to-green-600',
  mastery: 'from-amber-500 to-amber-600',
}

const THEME_LABELS = {
  awareness: 'Осознание',
  recognition: 'Распознавание',
  integration: 'Интеграция',
  mastery: 'Мастерство',
}

export default function ProgramPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [data, setData] = useState<ProgramData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeWeek, setActiveWeek] = useState<number>(1)
  const [activeExercise, setActiveExercise] = useState<ShadowWorkExercise | null>(null)
  const [reflection, setReflection] = useState('')
  const [moodBefore, setMoodBefore] = useState<number>(3)
  const [moodAfter, setMoodAfter] = useState<number>(3)
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Get program
    const { data: program } = await (supabase
      .from('shadow_work_programs') as any)
      .select('*')
      .eq('slug', slug)
      .single()

    if (!program) {
      router.push('/dashboard/shadow-work')
      return
    }

    // Get weeks with exercises
    const { data: weeks } = await (supabase
      .from('shadow_work_weeks') as any)
      .select(`
        *,
        exercises:shadow_work_exercises(*)
      `)
      .eq('program_id', program.id)
      .order('week_number')

    // Get enrollment
    const { data: enrollment } = await (supabase
      .from('shadow_work_enrollments') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('program_id', program.id)
      .single()

    // Get progress
    let progress: ShadowWorkProgress[] = []
    if (enrollment) {
      const { data: progressData } = await (supabase
        .from('shadow_work_progress') as any)
        .select('*')
        .eq('enrollment_id', enrollment.id)

      progress = progressData || []
    }

    // Sort exercises by day
    const weeksWithSortedExercises = (weeks || []).map((week: WeekWithExercises) => ({
      ...week,
      exercises: (week.exercises || []).sort((a: ShadowWorkExercise, b: ShadowWorkExercise) => a.day_number - b.day_number)
    }))

    setData({
      program,
      weeks: weeksWithSortedExercises,
      enrollment,
      progress
    })

    // Set active week from enrollment
    if (enrollment) {
      setActiveWeek(enrollment.current_week)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const getExerciseProgress = (exerciseId: string): ShadowWorkProgress | undefined => {
    return data?.progress.find(p => p.exercise_id === exerciseId)
  }

  const startExercise = async (exercise: ShadowWorkExercise) => {
    setActiveExercise(exercise)

    // Get existing progress if any
    const existing = getExerciseProgress(exercise.id)
    if (existing?.reflection_text) {
      setReflection(existing.reflection_text)
    } else {
      setReflection('')
    }
    if (existing?.mood_before) {
      setMoodBefore(existing.mood_before)
    }
    if (existing?.mood_after) {
      setMoodAfter(existing.mood_after)
    }
  }

  const saveExercise = async (complete: boolean = false) => {
    if (!data?.enrollment || !activeExercise) return

    setSaving(true)
    const supabase = createClient()

    const existing = getExerciseProgress(activeExercise.id)

    const progressData = {
      enrollment_id: data.enrollment.id,
      exercise_id: activeExercise.id,
      status: complete ? 'completed' : 'in_progress',
      reflection_text: reflection,
      mood_before: moodBefore,
      mood_after: moodAfter,
      xp_earned: complete ? activeExercise.xp_reward : 0,
      ...(complete ? { completed_at: new Date().toISOString() } : {}),
      ...(!existing ? { started_at: new Date().toISOString() } : {})
    }

    if (existing) {
      await (supabase
        .from('shadow_work_progress') as any)
        .update(progressData)
        .eq('id', existing.id)
    } else {
      await (supabase
        .from('shadow_work_progress') as any)
        .insert(progressData)
    }

    // Update enrollment XP if completed
    if (complete && !existing?.completed_at) {
      await (supabase
        .from('shadow_work_enrollments') as any)
        .update({
          total_xp_earned: (data.enrollment.total_xp_earned || 0) + activeExercise.xp_reward
        })
        .eq('id', data.enrollment.id)
    }

    await loadData()
    setSaving(false)

    if (complete) {
      setActiveExercise(null)
    }
  }

  const getWeekProgress = (week: WeekWithExercises): number => {
    if (!week.exercises.length) return 0
    const completed = week.exercises.filter(e => {
      const progress = getExerciseProgress(e.id)
      return progress?.status === 'completed'
    }).length
    return (completed / week.exercises.length) * 100
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  if (!data) return null

  const { program, weeks, enrollment } = data
  const functionDesc = COGNITIVE_FUNCTION_DESCRIPTIONS[program.target_function]
  const currentWeek = weeks.find(w => w.week_number === activeWeek)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/shadow-work">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Moon className="h-6 w-6 text-purple-600" />
            {program.title}
          </h1>
          <p className="text-gray-600">
            {functionDesc?.name} ({program.target_function})
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Общий прогресс</p>
              <p className="text-2xl font-bold">
                {enrollment?.total_xp_earned || 0} XP
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Неделя</p>
              <p className="text-2xl font-bold">
                {enrollment?.current_week || 1} / {program.duration_weeks}
              </p>
            </div>
          </div>
          <Progress
            value={((enrollment?.current_week || 1) / program.duration_weeks) * 100}
            className="mt-4 h-3"
          />
        </CardContent>
      </Card>

      {/* Exercise Modal */}
      {activeExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="mb-2">День {activeExercise.day_number}</Badge>
                  <CardTitle>{activeExercise.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4" />
                    {activeExercise.duration_minutes} минут
                    <span className="text-purple-600">+{activeExercise.xp_reward} XP</span>
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveExercise(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="font-medium mb-2">Описание</h4>
                <p className="text-gray-600">{activeExercise.description}</p>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="font-medium mb-2">Инструкции</h4>
                <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-sm">
                  {activeExercise.instructions}
                </div>
              </div>

              {/* Mood Before */}
              <div>
                <h4 className="font-medium mb-2">Настроение до упражнения</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Button
                      key={n}
                      variant={moodBefore === n ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMoodBefore(n)}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Reflection */}
              <div>
                <h4 className="font-medium mb-2">Ваши заметки и рефлексия</h4>
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Запишите ваши мысли, наблюдения и инсайты..."
                  rows={6}
                />
              </div>

              {/* Mood After */}
              <div>
                <h4 className="font-medium mb-2">Настроение после упражнения</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Button
                      key={n}
                      variant={moodAfter === n ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMoodAfter(n)}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => saveExercise(false)}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Сохранить черновик
                </Button>
                <Button
                  onClick={() => saveExercise(true)}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Завершить упражнение
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Week Tabs */}
      <Tabs value={String(activeWeek)} onValueChange={(v) => setActiveWeek(Number(v))}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
          {weeks.map((week) => {
            const progress = getWeekProgress(week)
            const isComplete = progress === 100
            const isCurrent = week.week_number === enrollment?.current_week

            return (
              <TabsTrigger
                key={week.week_number}
                value={String(week.week_number)}
                className={`
                  relative px-4 py-2 rounded-lg border
                  ${isCurrent ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}
                  data-[state=active]:bg-purple-600 data-[state=active]:text-white
                `}
              >
                <span className="text-sm">Неделя {week.week_number}</span>
                {isComplete && (
                  <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-green-600 bg-white rounded-full" />
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {weeks.map((week) => (
          <TabsContent key={week.week_number} value={String(week.week_number)} className="mt-6">
            {/* Week Header */}
            <Card className={`bg-gradient-to-r ${THEME_COLORS[week.theme as keyof typeof THEME_COLORS]} text-white mb-6`}>
              <CardContent className="p-6">
                <Badge className="bg-white/20 text-white mb-2">
                  {THEME_LABELS[week.theme as keyof typeof THEME_LABELS]}
                </Badge>
                <h2 className="text-xl font-bold">{week.title}</h2>
                <p className="text-white/80 mt-2">{week.description}</p>
                {week.learning_objectives.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Цели недели:</p>
                    <ul className="space-y-1">
                      {week.learning_objectives.map((obj, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-white/90">
                          <Target className="h-4 w-4" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4">
                  <Progress
                    value={getWeekProgress(week)}
                    className="h-2 bg-white/20"
                  />
                  <p className="text-sm text-white/80 mt-1">
                    {Math.round(getWeekProgress(week))}% выполнено
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Exercises */}
            <div className="space-y-3">
              {week.exercises.map((exercise) => {
                const progress = getExerciseProgress(exercise.id)
                const isCompleted = progress?.status === 'completed'
                const isStarted = progress?.status === 'in_progress'
                const Icon = EXERCISE_ICONS[exercise.exercise_type] || BookOpen

                return (
                  <Card
                    key={exercise.id}
                    className={`cursor-pointer transition-colors hover:border-purple-300 ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}
                    onClick={() => startExercise(exercise)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${isCompleted ? 'bg-green-100 text-green-600' : isStarted ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}
                        `}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              День {exercise.day_number}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {exercise.exercise_type}
                            </Badge>
                          </div>
                          <h4 className="font-medium mt-1">{exercise.title}</h4>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {exercise.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {exercise.duration_minutes} мин
                          </div>
                          <div className="text-sm text-purple-600 font-medium mt-1">
                            +{exercise.xp_reward} XP
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
