import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TypeBadge } from '@/components/mbti/TypeBadge'
import { LazyTeamChart } from '@/components/mbti/LazyTeamChart'
import { TeamExportButton } from '@/components/team/TeamExportButton'
import type { TeamMemberExportData } from '@/lib/export/excel'
import {
  Users,
  BookOpen,
  TrendingUp,
  Target,
  Award,
  Clock,
  BarChart3,
  Activity,
  Brain,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import type { MBTIType } from '@/types/database'

export const revalidate = 0 // force-dynamic equivalent

export const metadata = {
  title: 'Dashboard руководителя | Otrar Transformation Portal',
  description: 'Управление командой, KPI и зрелость трансформации',
}

// Maturity levels for transformation
const MATURITY_LEVELS = [
  { level: 1, name: 'Осведомлённость', description: 'Сотрудники знают о трансформации', target: 20 },
  { level: 2, name: 'Понимание', description: 'Понимают цели и своё место', target: 40 },
  { level: 3, name: 'Принятие', description: 'Принимают изменения', target: 60 },
  { level: 4, name: 'Применение', description: 'Применяют новые практики', target: 80 },
  { level: 5, name: 'Интеграция', description: 'Новые практики стали нормой', target: 100 },
]

type ProfileData = {
  id: string
  email: string
  full_name: string | null
  role: string
  mbti_type: string | null
  mbti_verified: boolean
  department: string | null
  branch: string | null
  job_title: string | null
  avatar_url: string | null
}

export default async function TeamPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get current user's profile to check role
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: ProfileData | null }

  const profile = profileData

  // Only managers, executives, and admins can access this page
  if (!profile?.role || !['manager', 'executive', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Fetch all team members
  let teamMembers: ProfileData[] = []

  if (profile.role === 'admin' || profile.role === 'executive') {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name') as { data: ProfileData[] | null }
    teamMembers = data || []
  } else {
    // Manager sees team by branch/department
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .or(`branch.eq.${profile.branch},department.eq.${profile.department}`)
      .order('full_name') as { data: ProfileData[] | null }
    teamMembers = data || []
  }

  // Fetch learning progress, quiz attempts, and development plans in PARALLEL
  const teamIds = teamMembers.map(m => m.id)
  const safeTeamIds = teamIds.length > 0 ? teamIds : ['']

  const [progressResult, quizResult, plansResult] = await Promise.all([
    supabase
      .from('learning_progress')
      .select('user_id, status, progress_percent')
      .in('user_id', safeTeamIds),
    supabase
      .from('quiz_attempts')
      .select('user_id, status, completed_at')
      .eq('status', 'completed')
      .in('user_id', safeTeamIds),
    supabase
      .from('development_plans')
      .select('user_id, status')
      .in('user_id', safeTeamIds)
  ])

  const progressData = progressResult.data as { user_id: string; status: string; progress_percent: number }[] | null
  const quizAttempts = quizResult.data as { user_id: string; status: string }[] | null
  const developmentPlans = plansResult.data as { user_id: string; status: string }[] | null

  // Calculate statistics
  const totalMembers = teamMembers.length
  const membersWithMBTI = teamMembers.filter(m => m.mbti_type).length
  const verifiedMBTI = teamMembers.filter(m => m.mbti_verified).length

  // Pre-build Maps for O(1) lookups instead of O(N) filter in loops
  // Progress by user: Map<userId, { completed: number, total: number }>
  const progressMap = new Map<string, { completed: number; total: number }>()
  progressData?.forEach(p => {
    const current = progressMap.get(p.user_id) || { completed: 0, total: 0 }
    progressMap.set(p.user_id, {
      completed: current.completed + (p.status === 'completed' ? 1 : 0),
      total: current.total + 1
    })
  })

  // Quiz attempts by user: Map<userId, count>
  const quizMap = new Map<string, number>()
  quizAttempts?.forEach(a => {
    quizMap.set(a.user_id, (quizMap.get(a.user_id) || 0) + 1)
  })

  // Development plans by user: Map<userId, { count: number, hasActive: boolean }>
  const plansMap = new Map<string, { count: number; hasActive: boolean }>()
  let activePlansCount = 0
  developmentPlans?.forEach(p => {
    const current = plansMap.get(p.user_id) || { count: 0, hasActive: false }
    const isActive = p.status === 'active'
    if (isActive) activePlansCount++
    plansMap.set(p.user_id, {
      count: current.count + 1,
      hasActive: current.hasActive || isActive
    })
  })

  // Learning progress calculation using Map (O(N) instead of O(N*M))
  const progressByUser: Record<string, number> = {}
  teamIds.forEach(id => {
    const userProgress = progressMap.get(id)
    progressByUser[id] = userProgress && userProgress.total > 0
      ? Math.round((userProgress.completed / userProgress.total) * 100)
      : 0
  })

  const usersWithProgress = new Set(progressMap.keys())
  const avgProgress = teamMembers.length > 0
    ? Math.round(Object.values(progressByUser).reduce((a, b) => a + b, 0) / Math.max(teamMembers.length, 1))
    : 0

  // Quiz statistics
  const completedQuizzes = quizAttempts?.length || 0
  const usersWithQuizzes = new Set(quizMap.keys())

  // Development plans
  const activePlans = activePlansCount
  const usersWithPlans = new Set(plansMap.keys())

  // Calculate maturity score
  const mbtiCoverage = totalMembers > 0 ? (membersWithMBTI / totalMembers) * 25 : 0
  const learningCoverage = totalMembers > 0 ? (usersWithProgress.size / totalMembers) * 25 : 0
  const quizCoverage = totalMembers > 0 ? (usersWithQuizzes.size / totalMembers) * 25 : 0
  const iprCoverage = totalMembers > 0 ? (usersWithPlans.size / totalMembers) * 25 : 0
  const maturityScore = Math.round(mbtiCoverage + learningCoverage + quizCoverage + iprCoverage)

  const currentMaturityLevel = MATURITY_LEVELS.find((l, i) =>
    maturityScore >= (l.target - 20) && (i === MATURITY_LEVELS.length - 1 || maturityScore < MATURITY_LEVELS[i + 1].target - 20)
  ) || MATURITY_LEVELS[0]

  // MBTI distribution
  const mbtiDistribution: Record<string, number> = {}
  teamMembers.forEach(m => {
    if (m.mbti_type) {
      mbtiDistribution[m.mbti_type] = (mbtiDistribution[m.mbti_type] || 0) + 1
    }
  })

  const mbtiPercent = totalMembers > 0 ? Math.round((membersWithMBTI / totalMembers) * 100) : 0

  // Prepare export data using pre-built Maps (O(1) lookups)
  const exportData: TeamMemberExportData[] = teamMembers.map(member => {
    const quizzesCompleted = quizMap.get(member.id) || 0
    const learningProgress = progressByUser[member.id] || 0
    const userPlansInfo = plansMap.get(member.id)
    const iprCount = userPlansInfo?.count || 0
    const iprStatus = userPlansInfo?.hasActive ? 'Активный' : iprCount > 0 ? 'Есть планы' : 'Нет ИПР'

    return {
      id: member.id,
      full_name: member.full_name,
      email: member.email,
      department: member.department,
      branch: member.branch,
      job_title: member.job_title,
      mbti_type: member.mbti_type,
      mbti_verified: member.mbti_verified,
      quizzes_completed: quizzesCompleted,
      learning_progress: learningProgress,
      ipr_status: iprStatus,
      ipr_count: iprCount,
    }
  })

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard руководителя</h1>
          <p className="text-muted-foreground mt-1">
            Обзор команды, KPI и зрелость трансформации
          </p>
        </div>
        <TeamExportButton teamMembers={exportData} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Команда</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {membersWithMBTI} с MBTI ({verifiedMBTI} верифицировано)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Обучение</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
            <p className="text-xs text-muted-foreground">
              средний прогресс ({usersWithProgress.size} активных)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Тесты</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedQuizzes}</div>
            <p className="text-xs text-muted-foreground">
              завершённых ({usersWithQuizzes.size} участников)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ИПР</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePlans}</div>
            <p className="text-xs text-muted-foreground">
              активных планов ({usersWithPlans.size} сотрудников)
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="maturity" className="space-y-6">
        <TabsList>
          <TabsTrigger value="maturity">
            <BarChart3 className="w-4 h-4 mr-2" />
            Зрелость
          </TabsTrigger>
          <TabsTrigger value="team">
            <Brain className="w-4 h-4 mr-2" />
            MBTI команды
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="w-4 h-4 mr-2" />
            Сотрудники
          </TabsTrigger>
        </TabsList>

        <TabsContent value="maturity" className="space-y-6">
          {/* Maturity Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Зрелость трансформации</CardTitle>
              <CardDescription>
                Оценка готовности команды к изменениям по модели ADKAR
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold">{maturityScore}%</div>
                  <p className="text-muted-foreground">
                    Уровень: {currentMaturityLevel.name}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    {currentMaturityLevel.level}/5
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentMaturityLevel.description}
                  </p>
                </div>
              </div>

              <Progress value={maturityScore} className="h-3" />

              <div className="grid gap-4 md:grid-cols-5">
                {MATURITY_LEVELS.map((level) => (
                  <div
                    key={level.level}
                    className={`p-3 rounded-lg border ${
                      currentMaturityLevel.level >= level.level
                        ? 'bg-primary/10 border-primary'
                        : 'bg-muted/50 border-transparent'
                    }`}
                  >
                    <div className="font-semibold text-sm">{level.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {level.description}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Metrics */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">MBTI охват</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Прошли тестирование</span>
                    <span>{mbtiPercent}%</span>
                  </div>
                  <Progress value={mbtiPercent} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Верифицированы</span>
                    <span>{membersWithMBTI > 0 ? Math.round((verifiedMBTI / membersWithMBTI) * 100) : 0}%</span>
                  </div>
                  <Progress value={membersWithMBTI > 0 ? (verifiedMBTI / membersWithMBTI) * 100 : 0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Вовлечённость</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Активны в обучении</span>
                    <span>{totalMembers > 0 ? Math.round((usersWithProgress.size / totalMembers) * 100) : 0}%</span>
                  </div>
                  <Progress value={totalMembers > 0 ? (usersWithProgress.size / totalMembers) * 100 : 0} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Имеют ИПР</span>
                    <span>{totalMembers > 0 ? Math.round((usersWithPlans.size / totalMembers) * 100) : 0}%</span>
                  </div>
                  <Progress value={totalMembers > 0 ? (usersWithPlans.size / totalMembers) * 100 : 0} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Рекомендуемые действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mbtiPercent < 80 && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-sm">Увеличить охват MBTI</p>
                      <p className="text-xs text-muted-foreground">
                        {totalMembers - membersWithMBTI} сотрудников ещё не прошли типирование
                      </p>
                    </div>
                  </div>
                )}
                {usersWithPlans.size < totalMembers * 0.5 && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Target className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Создать ИПР для сотрудников</p>
                      <p className="text-xs text-muted-foreground">
                        Менее половины команды имеют планы развития
                      </p>
                    </div>
                  </div>
                )}
                {maturityScore >= 80 && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">Отличный прогресс!</p>
                      <p className="text-xs text-muted-foreground">
                        Команда достигла высокого уровня зрелости
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          {/* MBTI Chart */}
          <LazyTeamChart members={teamMembers.map(m => ({
            id: m.id,
            full_name: m.full_name,
            mbti_type: m.mbti_type as MBTIType | null,
          }))} />

          {/* Temperament Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            {(['NT', 'NF', 'SJ', 'SP'] as const).map((temperament) => {
              const types: Record<string, string[]> = {
                NT: ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
                NF: ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
                SJ: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
                SP: ['ISTP', 'ISFP', 'ESTP', 'ESFP'],
              }
              const count = types[temperament].reduce(
                (sum, type) => sum + (mbtiDistribution[type] || 0),
                0
              )

              const labels: Record<string, { name: string; emoji: string; desc: string }> = {
                NT: { name: 'Аналитики', emoji: '🧠', desc: 'Стратегия, логика' },
                NF: { name: 'Дипломаты', emoji: '🌟', desc: 'Видение, эмпатия' },
                SJ: { name: 'Хранители', emoji: '🛡️', desc: 'Стабильность, процессы' },
                SP: { name: 'Искатели', emoji: '🔥', desc: 'Адаптивность, действие' },
              }

              return (
                <Card key={temperament}>
                  <CardContent className="pt-6 text-center">
                    <span className="text-3xl">{labels[temperament].emoji}</span>
                    <div className="text-2xl font-bold mt-2">{count}</div>
                    <p className="font-medium text-sm">{labels[temperament].name}</p>
                    <p className="text-xs text-muted-foreground">{labels[temperament].desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Skill Gap Analysis */}
          {(() => {
            // Cognitive functions mapping
            const functionMapping: Record<string, { dominant: string; auxiliary: string }> = {
              'INTJ': { dominant: 'Ni', auxiliary: 'Te' },
              'ENTJ': { dominant: 'Te', auxiliary: 'Ni' },
              'INTP': { dominant: 'Ti', auxiliary: 'Ne' },
              'ENTP': { dominant: 'Ne', auxiliary: 'Ti' },
              'INFJ': { dominant: 'Ni', auxiliary: 'Fe' },
              'ENFJ': { dominant: 'Fe', auxiliary: 'Ni' },
              'INFP': { dominant: 'Fi', auxiliary: 'Ne' },
              'ENFP': { dominant: 'Ne', auxiliary: 'Fi' },
              'ISTJ': { dominant: 'Si', auxiliary: 'Te' },
              'ESTJ': { dominant: 'Te', auxiliary: 'Si' },
              'ISTP': { dominant: 'Ti', auxiliary: 'Se' },
              'ESTP': { dominant: 'Se', auxiliary: 'Ti' },
              'ISFJ': { dominant: 'Si', auxiliary: 'Fe' },
              'ESFJ': { dominant: 'Fe', auxiliary: 'Si' },
              'ISFP': { dominant: 'Fi', auxiliary: 'Se' },
              'ESFP': { dominant: 'Se', auxiliary: 'Fi' },
            }

            const allFunctions = ['Te', 'Ti', 'Fe', 'Fi', 'Ne', 'Ni', 'Se', 'Si']
            const functionLabels: Record<string, { name: string; desc: string }> = {
              'Te': { name: 'Логика действий', desc: 'Структура, эффективность, системы' },
              'Ti': { name: 'Логика понятий', desc: 'Анализ, точность, модели' },
              'Fe': { name: 'Эмоции группы', desc: 'Коммуникация, гармония, эмпатия' },
              'Fi': { name: 'Эмоции личности', desc: 'Ценности, аутентичность, этика' },
              'Ne': { name: 'Интуиция возможностей', desc: 'Идеи, связи, инновации' },
              'Ni': { name: 'Интуиция предвидения', desc: 'Видение, стратегия, инсайты' },
              'Se': { name: 'Сенсорика опыта', desc: 'Действие, адаптация, практика' },
              'Si': { name: 'Сенсорика памяти', desc: 'Детали, традиции, стабильность' },
            }

            // Calculate function counts
            const functionCounts: Record<string, number> = {}
            allFunctions.forEach(f => functionCounts[f] = 0)

            teamMembers.forEach(member => {
              if (member.mbti_type && functionMapping[member.mbti_type]) {
                const funcs = functionMapping[member.mbti_type]
                functionCounts[funcs.dominant] = (functionCounts[funcs.dominant] || 0) + 2 // dominant counts double
                functionCounts[funcs.auxiliary] = (functionCounts[funcs.auxiliary] || 0) + 1
              }
            })

            const maxCount = Math.max(...Object.values(functionCounts), 1)
            const sortedFunctions = allFunctions.sort((a, b) => functionCounts[b] - functionCounts[a])

            const strongFunctions = sortedFunctions.filter(f => functionCounts[f] >= maxCount * 0.4)
            const weakFunctions = sortedFunctions.filter(f => functionCounts[f] < maxCount * 0.2)

            // Recommend types based on missing functions
            const recommendTypes: Record<string, string[]> = {
              'Te': ['ENTJ', 'ESTJ', 'INTJ', 'ISTJ'],
              'Ti': ['INTP', 'ISTP', 'ENTP', 'ESTP'],
              'Fe': ['ENFJ', 'ESFJ', 'INFJ', 'ISFJ'],
              'Fi': ['INFP', 'ISFP', 'ENFP', 'ESFP'],
              'Ne': ['ENTP', 'ENFP', 'INTP', 'INFP'],
              'Ni': ['INTJ', 'INFJ', 'ENTJ', 'ENFJ'],
              'Se': ['ESTP', 'ESFP', 'ISTP', 'ISFP'],
              'Si': ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
            }

            const recommendations = weakFunctions.flatMap(f => recommendTypes[f] || [])
            const uniqueRecommendations = Array.from(new Set(recommendations))
              .filter(type => !teamMembers.some(m => m.mbti_type === type))
              .slice(0, 4)

            return (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Анализ когнитивных функций
                  </CardTitle>
                  <CardDescription>
                    Распределение функций MBTI и выявление пробелов в команде
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Function Distribution */}
                  <div className="space-y-3">
                    {sortedFunctions.map(func => {
                      const count = functionCounts[func]
                      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0
                      const isStrong = count >= maxCount * 0.4
                      const isWeak = count < maxCount * 0.2

                      return (
                        <div key={func} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold w-6">{func}</span>
                              <span className="text-muted-foreground">
                                {functionLabels[func].name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-xs">
                                {functionLabels[func].desc}
                              </span>
                              <span className="font-medium w-8 text-right">{count}</span>
                            </div>
                          </div>
                          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                isStrong ? 'bg-green-500' :
                                isWeak ? 'bg-orange-400' :
                                'bg-blue-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Summary */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <p className="font-semibold text-sm text-green-900 mb-2">
                        Сильные стороны
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {strongFunctions.map(f => (
                          <Badge key={f} variant="outline" className="bg-green-100 border-green-300">
                            {f} - {functionLabels[f].name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                      <p className="font-semibold text-sm text-orange-900 mb-2">
                        Пробелы в команде
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {weakFunctions.length > 0 ? (
                          weakFunctions.map(f => (
                            <Badge key={f} variant="outline" className="bg-orange-100 border-orange-300">
                              {f} - {functionLabels[f].name}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Все функции представлены</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {uniqueRecommendations.length > 0 && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="font-semibold text-sm text-blue-900 mb-3">
                        Рекомендации по найму
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Для усиления слабых функций рассмотрите кандидатов с типами:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {uniqueRecommendations.map(type => (
                          <TypeBadge key={type} type={type as MBTIType} size="sm" />
                        ))}
                      </div>
                    </div>
                  )}

                  {membersWithMBTI === 0 && (
                    <div className="text-center py-6">
                      <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Анализ доступен после прохождения MBTI тестирования командой
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })()}
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Список команды</CardTitle>
              <CardDescription>
                Все члены команды с прогрессом обучения
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => {
                  const initials = member.full_name
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'U'

                  const hasIPR = developmentPlans?.some(p => p.user_id === member.id)
                  const hasQuiz = quizAttempts?.some(a => a.user_id === member.id)

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.full_name || 'Без имени'}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.job_title || member.department || 'Сотрудник'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                          {hasIPR && (
                            <Badge variant="outline" className="text-xs bg-green-50">
                              ИПР
                            </Badge>
                          )}
                          {hasQuiz && (
                            <Badge variant="outline" className="text-xs bg-blue-50">
                              Тест
                            </Badge>
                          )}
                        </div>

                        {member.mbti_type ? (
                          <TypeBadge type={member.mbti_type as MBTIType} size="sm" />
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Тип не определён
                          </Badge>
                        )}

                        <div className="text-right min-w-[80px]">
                          <p className="text-sm font-medium">
                            {progressByUser[member.id] || 0}%
                          </p>
                          <p className="text-xs text-muted-foreground">обучение</p>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {teamMembers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Команда пуста</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
