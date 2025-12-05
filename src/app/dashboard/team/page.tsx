import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TeamChart } from '@/components/mbti/TeamChart'
import { TypeBadge } from '@/components/mbti/TypeBadge'
import { Users, BookOpen, TrendingUp } from 'lucide-react'
import type { MBTIType } from '@/types/database'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Моя команда | Otrar Transformation Portal',
  description: 'Управление командой и аналитика',
}

// DEMO MODE flag - set to false when connecting real Supabase
const DEMO_MODE = true

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

// Mock data for demo
const MOCK_TEAM_MEMBERS: ProfileData[] = [
  { id: '1', email: 'aigul@otrar.kz', full_name: 'Айгуль Сериккызы', role: 'manager', mbti_type: 'ENFP', mbti_verified: true, department: 'Продажи', branch: 'Алматы', job_title: 'Менеджер по продажам', avatar_url: null },
  { id: '2', email: 'nurlan@otrar.kz', full_name: 'Нурлан Ахметов', role: 'employee', mbti_type: 'ISTJ', mbti_verified: true, department: 'Операции', branch: 'Алматы', job_title: 'Специалист', avatar_url: null },
  { id: '3', email: 'dana@otrar.kz', full_name: 'Дана Касымова', role: 'employee', mbti_type: 'INFJ', mbti_verified: true, department: 'HR', branch: 'Алматы', job_title: 'HR-менеджер', avatar_url: null },
  { id: '4', email: 'timur@otrar.kz', full_name: 'Тимур Сагынбаев', role: 'employee', mbti_type: 'ENTJ', mbti_verified: true, department: 'IT', branch: 'Алматы', job_title: 'Разработчик', avatar_url: null },
  { id: '5', email: 'aliya@otrar.kz', full_name: 'Алия Бектурганова', role: 'employee', mbti_type: 'ESFP', mbti_verified: false, department: 'Продажи', branch: 'Астана', job_title: 'Консультант', avatar_url: null },
  { id: '6', email: 'bekzat@otrar.kz', full_name: 'Бекзат Нурмагамбетов', role: 'employee', mbti_type: 'INTP', mbti_verified: true, department: 'IT', branch: 'Алматы', job_title: 'Аналитик', avatar_url: null },
  { id: '7', email: 'madina@otrar.kz', full_name: 'Мадина Ережепова', role: 'employee', mbti_type: 'ISFJ', mbti_verified: true, department: 'Финансы', branch: 'Алматы', job_title: 'Бухгалтер', avatar_url: null },
  { id: '8', email: 'arman@otrar.kz', full_name: 'Арман Куатов', role: 'employee', mbti_type: null, mbti_verified: false, department: 'Операции', branch: 'Шымкент', job_title: 'Логист', avatar_url: null },
]

const MOCK_PROGRESS: Record<string, number> = {
  '1': 63, '2': 85, '3': 45, '4': 92, '5': 30, '6': 78, '7': 55, '8': 10
}

export default async function TeamPage() {
  let profile: ProfileData | null = MOCK_TEAM_MEMBERS[0]
  let teamMembers: ProfileData[] = MOCK_TEAM_MEMBERS
  let progressByUser: Record<string, number> = MOCK_PROGRESS

  if (!DEMO_MODE) {
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

    profile = profileData

    // Only managers, executives, and admins can access this page
    if (!profile?.role || !['manager', 'executive', 'admin'].includes(profile.role)) {
      redirect('/dashboard')
    }

    // For admin/executive, get all profiles
    // For manager, get team members (simplified - in real app would use team_members table)
    teamMembers = []

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

    // Get learning progress for team
    const teamIds = teamMembers.map(m => m.id)
    type ProgressItem = { user_id: string; status: string }
    const { data: progressData } = await supabase
      .from('learning_progress')
      .select('user_id, status')
      .in('user_id', teamIds) as { data: ProgressItem[] | null }

    // Calculate team stats
    progressByUser = teamIds.reduce((acc, id) => {
      const userProgress = progressData?.filter(p => p.user_id === id) || []
      const completed = userProgress.filter(p => p.status === 'completed').length
      const total = userProgress.length
      acc[id] = total > 0 ? Math.round((completed / total) * 100) : 0
      return acc
    }, {} as Record<string, number>)
  }

  const avgProgress = teamMembers.length > 0
    ? Math.round(Object.values(progressByUser).reduce((a, b) => a + b, 0) / teamMembers.length)
    : 0

  const withMbti = teamMembers.filter(m => m.mbti_type).length
  const mbtiPercent = teamMembers.length > 0
    ? Math.round((withMbti / teamMembers.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Моя команда</h1>
        <p className="text-muted-foreground mt-1">
          Обзор команды и прогресс трансформации
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего сотрудников</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              {withMbti} с определённым MBTI-типом
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средний прогресс обучения</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
            <Progress value={avgProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MBTI-профилирование</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mbtiPercent}%</div>
            <p className="text-xs text-muted-foreground">
              команды прошли типирование
            </p>
          </CardContent>
        </Card>
      </div>

      {/* MBTI Charts */}
      <TeamChart members={teamMembers.map(m => ({
        id: m.id,
        full_name: m.full_name,
        mbti_type: m.mbti_type as MBTIType | null,
      }))} />

      {/* Team Members List */}
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
    </div>
  )
}
