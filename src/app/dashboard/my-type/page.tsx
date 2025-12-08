'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getTypeProfile, TypeProfile } from '@/lib/mbti-content'
import { COGNITIVE_FUNCTIONS, MBTI_TYPE_NAMES, COGNITIVE_FUNCTION_DESCRIPTIONS } from '@/lib/mbti'
import { TypeBadge } from '@/components/mbti/TypeBadge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  User,
  Sparkles,
  Users,
  MessageCircle,
  AlertTriangle,
  TrendingUp,
  Briefcase,
  ArrowLeft,
  ChevronRight,
  Lightbulb,
  Target,
  Heart,
  Brain,
  Shield,
  Zap
} from 'lucide-react'
import type { MBTIType } from '@/types/database'

const FUNCTION_STACK_LABELS = ['Доминантная', 'Вспомогательная', 'Третичная', 'Подчинённая']
const FUNCTION_STACK_COLORS = ['bg-green-500', 'bg-blue-500', 'bg-amber-500', 'bg-red-500']

export default function MyTypePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<TypeProfile | null>(null)
  const [mbtiType, setMbtiType] = useState<MBTIType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('mbti_type')
        .eq('id', user.id)
        .single()

      if (profileData?.mbti_type) {
        const type = profileData.mbti_type as MBTIType
        setMbtiType(type)
        setProfile(getTypeProfile(type))
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!mbtiType || !profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/profile">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Link>
          </Button>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Тип личности не определён</h2>
            <p className="text-muted-foreground mb-6">
              Пройдите тест MBTI, чтобы узнать свой тип личности и получить персональные рекомендации
            </p>
            <Button asChild>
              <Link href="/dashboard/quizzes">Пройти тест</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const cognitiveStack = COGNITIVE_FUNCTIONS[mbtiType]
  const typeName = MBTI_TYPE_NAMES[mbtiType]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/profile">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Профиль
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <TypeBadge type={mbtiType} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{mbtiType}</h1>
                <Badge variant="secondary">{profile.nickname}</Badge>
              </div>
              <p className="text-xl text-muted-foreground mb-2">{typeName.ru}</p>
              <p className="text-lg">{profile.tagline}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview" className="gap-2">
            <User className="h-4 w-4 hidden sm:block" />
            Обзор
          </TabsTrigger>
          <TabsTrigger value="strengths" className="gap-2">
            <Sparkles className="h-4 w-4 hidden sm:block" />
            Сильные стороны
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4 hidden sm:block" />
            В команде
          </TabsTrigger>
          <TabsTrigger value="communication" className="gap-2">
            <MessageCircle className="h-4 w-4 hidden sm:block" />
            Коммуникация
          </TabsTrigger>
          <TabsTrigger value="stress" className="gap-2">
            <AlertTriangle className="h-4 w-4 hidden sm:block" />
            Стресс
          </TabsTrigger>
          <TabsTrigger value="growth" className="gap-2">
            <TrendingUp className="h-4 w-4 hidden sm:block" />
            Развитие
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Portrait */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Портрет типа
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{profile.portrait}</p>
              </CardContent>
            </Card>

            {/* Key Qualities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Ключевые качества
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.keyQualities.map((quality, index) => (
                    <Badge key={index} variant="secondary">{quality}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cognitive Stack */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Когнитивный стек
              </CardTitle>
              <CardDescription>
                Порядок когнитивных функций определяет ваш способ восприятия и принятия решений
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cognitiveStack && [cognitiveStack.dominant, cognitiveStack.auxiliary, cognitiveStack.tertiary, cognitiveStack.inferior].map((func, index) => {
                  const funcDesc = COGNITIVE_FUNCTION_DESCRIPTIONS[func]
                  return (
                    <div key={func} className="relative">
                      <div className={`absolute top-0 left-0 w-1 h-full ${FUNCTION_STACK_COLORS[index]} rounded-l`} />
                      <div className="pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">{func}</span>
                          <Badge variant="outline" className="text-xs">
                            {FUNCTION_STACK_LABELS[index]}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{funcDesc?.name}</p>
                        <p className="text-xs text-muted-foreground">{funcDesc?.shortLabel}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/shadow-work')}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Shadow Work</p>
                    <p className="text-sm text-muted-foreground">Интеграция подчинённой функции</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/team-builder')}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Team Builder</p>
                    <p className="text-sm text-muted-foreground">Совместимость с коллегами</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Strengths Tab */}
        <TabsContent value="strengths" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Zap className="h-5 w-5" />
                  Сильные стороны
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.strengths.map((strength, index) => (
                  <div key={index} className="border-l-2 border-green-500 pl-4">
                    <h4 className="font-medium">{strength.title}</h4>
                    <p className="text-sm text-muted-foreground">{strength.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <Target className="h-5 w-5" />
                  Зоны роста
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.challenges.map((challenge, index) => (
                  <div key={index} className="border-l-2 border-amber-500 pl-4">
                    <h4 className="font-medium">{challenge.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                    <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
                      <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-800 dark:text-amber-200">{challenge.tip}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Career */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Карьера
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-green-600">Подходящие направления</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.suitableCareers.map((career, index) => (
                      <Badge key={index} variant="outline" className="border-green-500 text-green-700">
                        {career}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3 text-red-600">Могут быть сложными</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.challengingCareers.map((career, index) => (
                      <Badge key={index} variant="outline" className="border-red-300 text-red-600">
                        {career}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Роль в команде
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge className="mb-2">{profile.teamRole.role}</Badge>
                  <p className="text-muted-foreground">{profile.teamRole.contribution}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Лучше всего работаете с:</h4>
                  <div className="flex gap-2">
                    {profile.teamRole.bestWith.map((type) => (
                      <TypeBadge key={type} type={type as MBTIType} size="sm" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Стиль лидерства</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{profile.leadershipStyle}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Идеальная рабочая среда</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {profile.idealWorkEnvironment.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {profile.communicationStyles.map((style) => (
              <Card key={style.withType}>
                <CardHeader>
                  <CardTitle className="text-base">С {style.typeName}</CardTitle>
                  <CardDescription>Типы: {style.withType === 'NF' ? 'ENFP, INFP, ENFJ, INFJ' : style.withType === 'NT' ? 'ENTJ, INTJ, ENTP, INTP' : style.withType === 'SF' ? 'ISFJ, ESFJ, ISFP, ESFP' : 'ISTJ, ESTJ, ISTP, ESTP'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-green-600 mb-2">Рекомендации</h4>
                    <ul className="space-y-1">
                      {style.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-green-500">+</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-600 mb-2">Избегайте</h4>
                    <ul className="space-y-1">
                      {style.avoid.map((item, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-red-500">-</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Стиль поведения в конфликте</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{profile.conflictStyle}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stress Tab */}
        <TabsContent value="stress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Триггеры стресса
              </CardTitle>
              <CardDescription>
                Понимание ваших триггеров помогает предотвращать стресс и эффективнее с ним справляться
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile.stressTriggers.map((trigger, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-lg shrink-0">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{trigger.trigger}</h4>
                      <p className="text-sm text-muted-foreground">{trigger.reaction}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg ml-11">
                    <Shield className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">Стратегия</p>
                      <p className="text-sm text-green-700 dark:text-green-300">{trigger.copingStrategy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Link to Shadow Work */}
          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Shadow Work: работа со стрессом</h3>
                    <p className="text-sm text-muted-foreground">
                      8-недельная программа интеграции подчинённой функции ({cognitiveStack?.inferior})
                    </p>
                  </div>
                </div>
                <Button asChild>
                  <Link href="/dashboard/shadow-work">Начать</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Growth Tab */}
        <TabsContent value="growth" className="space-y-6">
          {profile.growthAreas.map((area, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  {area.area}
                </CardTitle>
                <CardDescription>{area.why}</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-3">Упражнения для развития</h4>
                <div className="space-y-2">
                  {area.exercises.map((exercise, exIndex) => (
                    <div key={exIndex} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                        {exIndex + 1}
                      </div>
                      <span className="text-sm">{exercise}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Shadow Work CTA */}
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Готовы к глубокой трансформации?</h3>
                  <p className="text-muted-foreground mt-2">
                    Shadow Work — это 8-недельная программа для интеграции вашей подчинённой функции.
                    Работа с тенью открывает доступ к скрытым ресурсам личности.
                  </p>
                </div>
                <Button size="lg" asChild>
                  <Link href="/dashboard/shadow-work">
                    Начать Shadow Work
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
