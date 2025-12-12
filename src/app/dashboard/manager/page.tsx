'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  Target,
  Brain,
  CheckCircle
} from 'lucide-react'

interface TeamMember {
  id: string
  full_name: string
  email: string
  role: string
  mbti_type?: string
  department?: string
}

interface TeamStats {
  totalMembers: number
  mbtiCompleted: number
  quizzesCompleted: number
  iprActive: number
  avgProgress: number
}

export default function ManagerDashboardPage() {
  const { profile } = useAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [stats, setStats] = useState<TeamStats>({
    totalMembers: 0,
    mbtiCompleted: 0,
    quizzesCompleted: 0,
    iprActive: 0,
    avgProgress: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      if (!profile) return

      // For admin, fetch all profiles
      // For manager, fetch team members only

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name')

      if (profiles) {
        setTeamMembers(profiles as TeamMember[])

        // Calculate stats
        const mbtiCount = profiles.filter((p: TeamMember) => p.mbti_type).length

        setStats({
          totalMembers: profiles.length,
          mbtiCompleted: mbtiCount,
          quizzesCompleted: 0, // Will be fetched separately
          iprActive: 0,
          avgProgress: profiles.length > 0 ? Math.round((mbtiCount / profiles.length) * 100) : 0
        })

        // Fetch quiz attempts count
        const { data: quizAttempts } = await supabase
          .from('quiz_attempts')
          .select('id')
          .eq('status', 'completed')

        if (quizAttempts) {
          setStats(prev => ({ ...prev, quizzesCompleted: quizAttempts.length }))
        }

        // Fetch active IPR count
        const { data: iprPlans } = await supabase
          .from('development_plans')
          .select('id')
          .eq('status', 'active')

        if (iprPlans) {
          setStats(prev => ({ ...prev, iprActive: iprPlans.length }))
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [profile, supabase])

  // Check access
  if (!profile || !['admin', 'executive', 'manager'].includes(profile.role || '')) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Доступ ограничен</CardTitle>
            <CardDescription>
              Эта страница доступна только для руководителей и администраторов.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-8 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard руководителя</h1>
        <p className="text-muted-foreground mt-1">
          Мониторинг прогресса трансформации команды
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего сотрудников</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">в системе</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MBTI профили</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mbtiCompleted}</div>
            <Progress value={stats.avgProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{stats.avgProgress}% заполнено</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Тесты пройдено</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.quizzesCompleted}</div>
            <p className="text-xs text-muted-foreground">завершённых попыток</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активных ИПР</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.iprActive}</div>
            <p className="text-xs text-muted-foreground">планов развития</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Tabs defaultValue="team" className="space-y-4">
        <TabsList>
          <TabsTrigger value="team">Команда</TabsTrigger>
          <TabsTrigger value="progress">Прогресс</TabsTrigger>
          <TabsTrigger value="mbti">MBTI профили</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Сотрудники</CardTitle>
              <CardDescription>Все участники программы трансформации</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {member.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.full_name || 'Без имени'}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.mbti_type && (
                        <Badge variant="secondary">{member.mbti_type}</Badge>
                      )}
                      <Badge variant="outline">{member.role || 'employee'}</Badge>
                    </div>
                  </div>
                ))}
                {teamMembers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Нет данных о сотрудниках
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Общий прогресс трансформации</CardTitle>
              <CardDescription>Метрики выполнения программы</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>MBTI профилирование</span>
                  <span>{stats.mbtiCompleted}/{stats.totalMembers}</span>
                </div>
                <Progress value={stats.avgProgress} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Прохождение тестов</span>
                  <span>{stats.quizzesCompleted} попыток</span>
                </div>
                <Progress value={Math.min((stats.quizzesCompleted / Math.max(stats.totalMembers, 1)) * 100, 100)} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Активные ИПР</span>
                  <span>{stats.iprActive} планов</span>
                </div>
                <Progress value={(stats.iprActive / Math.max(stats.totalMembers, 1)) * 100} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mbti" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Распределение MBTI типов</CardTitle>
              <CardDescription>Типы личности в команде</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-4">
                {['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
                  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'].map(type => {
                  const count = teamMembers.filter(m => m.mbti_type === type).length
                  return (
                    <div key={type} className={`p-3 rounded-lg border ${count > 0 ? 'bg-primary/5 border-primary/20' : ''}`}>
                      <div className="font-mono font-bold">{type}</div>
                      <div className="text-sm text-muted-foreground">{count} чел.</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
