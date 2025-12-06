import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, ClipboardList, TrendingUp, Award } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin Dashboard | Otrar Transformation Portal',
  description: 'Панель администратора',
}

type Profile = {
  id: string
  email: string
  full_name: string | null
  role: string
  mbti_type: string | null
}

type Quiz = {
  id: string
  title: string
  published: boolean
}

type QuizAttempt = {
  id: string
  status: string
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get stats
  const { data: allProfiles, count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' }) as { data: Profile[] | null; count: number | null }

  const { data: allQuizzes, count: totalQuizzes } = await supabase
    .from('quizzes')
    .select('*', { count: 'exact' }) as { data: Quiz[] | null; count: number | null }

  const { data: allAttempts, count: totalAttempts } = await supabase
    .from('quiz_attempts')
    .select('*', { count: 'exact' }) as { data: QuizAttempt[] | null; count: number | null }

  const publishedQuizzes = allQuizzes?.filter(q => q.published).length || 0
  const completedAttempts = allAttempts?.filter(a => a.status === 'completed').length || 0
  const usersWithMbti = allProfiles?.filter(p => p.mbti_type !== null).length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Панель администратора</h1>
        <p className="text-muted-foreground mt-1">
          Управление пользователями, контентом и системой
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Всего пользователей"
          value={totalUsers?.toString() || '0'}
          description={`${usersWithMbti} с определенным MBTI`}
          icon={Users}
        />
        <StatCard
          title="Тесты"
          value={totalQuizzes?.toString() || '0'}
          description={`${publishedQuizzes} опубликовано`}
          icon={ClipboardList}
        />
        <StatCard
          title="Прохождения"
          value={totalAttempts?.toString() || '0'}
          description={`${completedAttempts} завершено`}
          icon={TrendingUp}
        />
        <StatCard
          title="Активные планы"
          value="0"
          description="ИПР в процессе"
          icon={Award}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Управление пользователями
            </CardTitle>
            <CardDescription>
              Просмотр и управление профилями пользователей
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/users">
                Перейти к пользователям
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Управление тестами
            </CardTitle>
            <CardDescription>
              Создание и редактирование тестов и опросов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/quizzes">
                Перейти к тестам
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Последняя активность</CardTitle>
          <CardDescription>
            Недавние действия в системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Лог активности будет доступен в следующей версии
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
