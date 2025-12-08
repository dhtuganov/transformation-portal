import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { TypeBadge } from '@/components/mbti/TypeBadge'
import {
  User,
  Mail,
  Building,
  MapPin,
  Briefcase,
  Edit,
  Brain,
  Zap,
  Target,
  AlertTriangle,
  TrendingUp,
  Users,
  BookOpen,
  Sparkles
} from 'lucide-react'
import type { MBTIType, MBTIProfile } from '@/types/database'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  getTypeName,
  getCognitiveFunctions,
  getTemperament,
  TEMPERAMENT_NAMES,
  TEMPERAMENT_COLORS,
  COGNITIVE_FUNCTION_DESCRIPTIONS,
  TYPE_DESCRIPTIONS
} from '@/lib/mbti'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Мой профиль | Otrar Transformation Portal',
  description: 'Ваш профиль и MBTI-тип',
}

const ROLE_LABELS: Record<string, string> = {
  employee: 'Сотрудник',
  manager: 'Менеджер',
  executive: 'Руководитель',
  admin: 'Администратор',
}

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

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userEmail = user.email || ''

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: ProfileData | null }

  const profile = profileData

  // Get detailed MBTI profile if exists
  let mbtiProfile: MBTIProfile | null = null
  if (profile?.mbti_type) {
    const { data } = await supabase
      .from('mbti_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single() as { data: MBTIProfile | null }
    mbtiProfile = data
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return userEmail?.[0]?.toUpperCase() || 'U'
  }

  // Get type-specific data
  const mbtiType = profile?.mbti_type as MBTIType | null
  const functions = mbtiType ? getCognitiveFunctions(mbtiType) : null
  const temperament = mbtiType ? getTemperament(mbtiType) : null
  const temperamentName = temperament ? TEMPERAMENT_NAMES[temperament] : null
  const temperamentColor = temperament ? TEMPERAMENT_COLORS[temperament as keyof typeof TEMPERAMENT_COLORS] : null
  const typeDescription = mbtiType ? TYPE_DESCRIPTIONS[mbtiType] : null
  const typeName = mbtiType ? getTypeName(mbtiType, 'ru') : null
  const typeNameEn = mbtiType ? getTypeName(mbtiType, 'en') : null

  // Get function descriptions
  const dominantFn = functions?.dominant ? COGNITIVE_FUNCTION_DESCRIPTIONS[functions.dominant] : null
  const auxiliaryFn = functions?.auxiliary ? COGNITIVE_FUNCTION_DESCRIPTIONS[functions.auxiliary] : null
  const tertiaryFn = functions?.tertiary ? COGNITIVE_FUNCTION_DESCRIPTIONS[functions.tertiary] : null
  const inferiorFn = functions?.inferior ? COGNITIVE_FUNCTION_DESCRIPTIONS[functions.inferior] : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Мой профиль</h1>
          <p className="text-muted-foreground mt-1">
            Информация о вас и вашем психологическом профиле
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/profile/edit">
            <Edit className="mr-2 h-4 w-4" />
            Редактировать
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Info Card - Left Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center pb-2">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4">
              {profile?.full_name || 'Пользователь'}
            </CardTitle>
            <CardDescription>
              <Badge variant="secondary" className="mt-1">
                {ROLE_LABELS[profile?.role || 'employee']}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{userEmail}</span>
            </div>
            {profile?.job_title && (
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{profile.job_title}</span>
              </div>
            )}
            {profile?.department && (
              <div className="flex items-center gap-3 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{profile.department}</span>
              </div>
            )}
            {profile?.branch && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profile.branch}</span>
              </div>
            )}

            {/* MBTI Type Badge */}
            {mbtiType && (
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Тип личности</span>
                  <Badge variant="default">Подтверждён</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <TypeBadge type={mbtiType} size="lg" />
                  <div>
                    <p className="font-semibold">{typeName}</p>
                    <p className="text-xs text-muted-foreground">{typeNameEn}</p>
                  </div>
                </div>
                {temperamentName && (
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      style={{ borderColor: temperamentColor || undefined, color: temperamentColor || undefined }}
                    >
                      {temperamentName.ru}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="border-t pt-4 mt-4 space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/test-insights">
                  <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                  AI Инсайты
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/learning">
                  <BookOpen className="mr-2 h-4 w-4 text-blue-500" />
                  Обучение
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Right Side */}
        <div className="lg:col-span-2 space-y-6">
          {mbtiType ? (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Обзор</TabsTrigger>
                <TabsTrigger value="functions">Функции</TabsTrigger>
                <TabsTrigger value="work">Работа</TabsTrigger>
                <TabsTrigger value="growth">Развитие</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      О вашем типе
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {typeDescription && (
                      <>
                        <p className="text-lg font-medium text-primary">
                          {typeDescription.shortDescription}
                        </p>
                        <p className="text-muted-foreground">
                          {typeDescription.detailedDescription}
                        </p>
                      </>
                    )}

                    {/* Cognitive Stack Preview */}
                    <div className="grid grid-cols-4 gap-2 pt-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Доминирующая</p>
                        <p className="font-bold text-blue-600">{functions?.dominant}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Вспомогательная</p>
                        <p className="font-bold text-green-600">{functions?.auxiliary}</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Третичная</p>
                        <p className="font-bold text-yellow-600">{functions?.tertiary}</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Инфериорная</p>
                        <p className="font-bold text-red-600">{functions?.inferior}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Strengths & Growth Areas */}
                <div className="grid gap-4 md:grid-cols-2">
                  {mbtiProfile?.strengths && (mbtiProfile.strengths as string[]).length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Zap className="h-4 w-4 text-green-500" />
                          Сильные стороны
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {(mbtiProfile.strengths as string[]).map((strength, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-green-500 mt-0.5">&#10003;</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {mbtiProfile?.growth_areas && (mbtiProfile.growth_areas as string[]).length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          Зоны развития
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {(mbtiProfile.growth_areas as string[]).map((area, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-blue-500 mt-0.5">&#8594;</span>
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Cognitive Functions Tab */}
              <TabsContent value="functions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Когнитивные функции
                    </CardTitle>
                    <CardDescription>
                      Ваш когнитивный стек определяет, как вы обрабатываете информацию и принимаете решения
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Dominant Function */}
                    {dominantFn && (
                      <div className="p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-600">{functions?.dominant}</Badge>
                            <span className="font-semibold">{dominantFn.name}</span>
                          </div>
                          <Badge variant="outline">Доминирующая</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{dominantFn.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Progress value={100} className="h-2" />
                          <span className="text-xs text-muted-foreground">100%</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <p className="font-medium text-green-600 mb-1">Сильные стороны:</p>
                            <ul className="text-muted-foreground space-y-1">
                              {dominantFn.strengths.map((s, i) => <li key={i}>&#8226; {s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-amber-600 mb-1">Вызовы:</p>
                            <ul className="text-muted-foreground space-y-1">
                              {dominantFn.challenges.map((c, i) => <li key={i}>&#8226; {c}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Auxiliary Function */}
                    {auxiliaryFn && (
                      <div className="p-4 border rounded-lg bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-600">{functions?.auxiliary}</Badge>
                            <span className="font-semibold">{auxiliaryFn.name}</span>
                          </div>
                          <Badge variant="outline">Вспомогательная</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{auxiliaryFn.description}</p>
                        <div className="flex items-center gap-2">
                          <Progress value={75} className="h-2" />
                          <span className="text-xs text-muted-foreground">75%</span>
                        </div>
                      </div>
                    )}

                    {/* Tertiary Function */}
                    {tertiaryFn && (
                      <div className="p-4 border rounded-lg bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-600">{functions?.tertiary}</Badge>
                            <span className="font-semibold">{tertiaryFn.name}</span>
                          </div>
                          <Badge variant="outline">Третичная</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{tertiaryFn.description}</p>
                        <div className="flex items-center gap-2">
                          <Progress value={40} className="h-2" />
                          <span className="text-xs text-muted-foreground">40%</span>
                        </div>
                      </div>
                    )}

                    {/* Inferior Function */}
                    {inferiorFn && (
                      <div className="p-4 border rounded-lg bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-600">{functions?.inferior}</Badge>
                            <span className="font-semibold">{inferiorFn.name}</span>
                          </div>
                          <Badge variant="outline">Инфериорная</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{inferiorFn.description}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <Progress value={15} className="h-2" />
                          <span className="text-xs text-muted-foreground">15%</span>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded border border-amber-200 dark:border-amber-800">
                          <p className="text-sm text-amber-800 dark:text-amber-200">
                            <AlertTriangle className="h-4 w-4 inline mr-1" />
                            <strong>Точка роста:</strong> Развитие этой функции требует терпения и практики.
                            Используйте AI Инсайты для персональных упражнений.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Work Style Tab */}
              <TabsContent value="work" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Рабочий стиль
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {typeDescription && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-muted-foreground">{typeDescription.workStyle}</p>
                      </div>
                    )}

                    {/* Communication Style from MBTI Profile */}
                    {mbtiProfile?.communication_style && Object.keys(mbtiProfile.communication_style as object).length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Стиль коммуникации
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(mbtiProfile.communication_style as Record<string, string>).map(([key, value]) => (
                            <div key={key} className="flex gap-2 text-sm">
                              <span className="font-medium capitalize min-w-[100px]">{key}:</span>
                              <span className="text-muted-foreground">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Assessment Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Информация об оценке</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Статус</span>
                      <Badge variant="default">Подтверждён</Badge>
                    </div>
                    {mbtiProfile?.assessed_by && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Оценщик</span>
                        <span>{mbtiProfile.assessed_by}</span>
                      </div>
                    )}
                    {mbtiProfile?.assessed_at && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Дата оценки</span>
                        <span>{new Date(mbtiProfile.assessed_at).toLocaleDateString('ru-RU')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Growth Tab */}
              <TabsContent value="growth" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Путь развития
                    </CardTitle>
                    <CardDescription>
                      Рекомендации для личностного роста с учётом вашего типа
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {typeDescription && (
                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold mb-2 text-green-800 dark:text-green-200">Путь роста</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">{typeDescription.growthPath}</p>
                      </div>
                    )}

                    {typeDescription && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                        <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-200 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Паттерн стресса
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">{typeDescription.stressPattern}</p>
                      </div>
                    )}

                    {/* Quick Link to AI Insights */}
                    <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                      <h4 className="font-semibold mb-2 text-purple-800 dark:text-purple-200 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Персональные упражнения
                      </h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                        Получите AI-генерированные упражнения для развития вашей инфериорной функции ({functions?.inferior})
                      </p>
                      <Button asChild size="sm">
                        <Link href="/dashboard/test-insights">
                          Получить упражнение
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            /* No MBTI Type State */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  MBTI-профиль
                </CardTitle>
                <CardDescription>
                  Ваш психотип ещё не определён
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium mb-2">MBTI-тип не определён</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                    Для определения вашего MBTI-типа обратитесь к Зарине Сатубалдиной
                    или пройдите тестирование. После определения типа вы получите
                    персонализированные рекомендации.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/quizzes">
                      Пройти тестирование
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
