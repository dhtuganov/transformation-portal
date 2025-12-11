import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { TypeBadge } from '@/components/mbti/TypeBadge'
import { StatCard } from '@/components/dashboard/StatCard'
import { BookOpen, User, Users, TrendingUp, Sparkles, ClipboardCheck, Target, Brain, Moon, Activity, Heart, Compass } from 'lucide-react'
import type { MBTIType } from '@/types/database'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard | Otrar Transformation Portal',
  description: 'Ваш личный кабинет трансформации',
}

// DEMO MODE flag - set to false when connecting real Supabase
const DEMO_MODE = false

// Profile type
type Profile = {
  id: string
  email: string
  full_name: string | null
  role: string
  mbti_type: string | null
  mbti_verified: boolean
  department: string | null
  branch: string | null
}

export default async function DashboardPage() {
  let profile: Profile | null = null
  let completedCount = 0
  let totalCount = 0
  let progressPercent = 0

  if (!DEMO_MODE) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single() as { data: Profile | null; error: unknown }

    if (error) {
      console.error('Profile fetch error:', error)
    }

    profile = profileData || {
      id: user.id,
      email: user.email || '',
      full_name: user.email?.split('@')[0] || 'Пользователь',
      role: 'employee',
      mbti_type: null,
      mbti_verified: false,
      department: null,
      branch: null,
    }

    // Get learning progress
    type ProgressItem = { id: string; status: string; progress_percent: number }
    const { data: progress } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', user.id) as { data: ProgressItem[] | null }

    completedCount = progress?.filter(p => p.status === 'completed').length || 0
    totalCount = progress?.length || 0
    progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Добро пожаловать{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Ваш путь трансформации продолжается
          </p>
        </div>
        {profile?.mbti_type && (
          <TypeBadge type={profile.mbti_type as MBTIType} size="lg" showName />
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Прогресс обучения"
          value={`${progressPercent}%`}
          description={`${completedCount} из ${totalCount || '—'} материалов`}
          icon={BookOpen}
        />
        <StatCard
          title="Ваш тип"
          value={profile?.mbti_type || 'Не определён'}
          description={profile?.mbti_verified ? 'Подтверждён' : 'Требует подтверждения'}
          icon={User}
        />
        <StatCard
          title="Статус"
          value={profile?.role === 'employee' ? 'Сотрудник' :
                 profile?.role === 'manager' ? 'Менеджер' :
                 profile?.role === 'executive' ? 'Руководитель' :
                 profile?.role === 'admin' ? 'Администратор' : 'Сотрудник'}
          description={profile?.department || profile?.branch || 'Отдел не указан'}
          icon={Users}
        />
        <StatCard
          title="Трансформация"
          value="Фаза 1"
          description="Диагностика"
          icon={TrendingUp}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* MBTI Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Ваш MBTI-профиль
            </CardTitle>
            <CardDescription>
              Понимание своего типа — первый шаг к развитию
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.mbti_type ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <TypeBadge type={profile.mbti_type as MBTIType} size="lg" />
                  <div>
                    <p className="font-medium">Тип определён</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.mbti_verified ? 'Подтверждён экспертом' : 'Ожидает подтверждения'}
                    </p>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/dashboard/profile">
                    Подробнее о вашем типе
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  Ваш MBTI-тип ещё не определён
                </p>
                <Button asChild>
                  <Link href="/dashboard/profile">
                    Настроить профиль
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Обучение
            </CardTitle>
            <CardDescription>
              Рекомендованные материалы для вашего развития
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Общий прогресс</span>
                  <span className="font-medium">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {totalCount > 0
                    ? `Вы изучили ${completedCount} из ${totalCount} материалов`
                    : 'Начните изучать материалы для отслеживания прогресса'}
                </p>
              </div>

              <Button asChild className="w-full">
                <Link href="/dashboard/learning">
                  Перейти к обучению
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/dashboard/test-insights">
                <Sparkles className="h-6 w-6 text-purple-500" />
                <span className="text-sm">AI Инсайты</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/dashboard/quizzes">
                <ClipboardCheck className="h-6 w-6 text-blue-500" />
                <span className="text-sm">Тесты</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/dashboard/learning">
                <BookOpen className="h-6 w-6 text-green-500" />
                <span className="text-sm">Обучение</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/dashboard/development">
                <Target className="h-6 w-6 text-orange-500" />
                <span className="text-sm">ИПР</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/dashboard/profile">
                <User className="h-6 w-6 text-slate-500" />
                <span className="text-sm">Профиль</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/dashboard/profile/cognitive">
                <Brain className="h-6 w-6 text-pink-500" />
                <span className="text-sm">Функции</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/dashboard/shadow-work">
                <Moon className="h-6 w-6 text-purple-600" />
                <span className="text-sm">Shadow Work</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/dashboard/stress-radar">
                <Activity className="h-6 w-6 text-red-500" />
                <span className="text-sm">Stress Radar</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/dashboard/type-simulator">
                <Users className="h-6 w-6 text-indigo-500" />
                <span className="text-sm">Симулятор</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/dashboard/relationships">
                <Heart className="h-6 w-6 text-pink-500" />
                <span className="text-sm">Отношения</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/dashboard/career">
                <Compass className="h-6 w-6 text-emerald-500" />
                <span className="text-sm">Карьера</span>
              </Link>
            </Button>
            {profile?.role && ['manager', 'executive', 'admin'].includes(profile.role) && (
              <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
                <Link href="/dashboard/team">
                  <Users className="h-6 w-6 text-teal-500" />
                  <span className="text-sm">Команда</span>
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
