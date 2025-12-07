'use client'

import { useState } from 'react'
import type { ShadowWorkDashboardData } from '@/lib/shadow-work/types'
import { WeekCard } from './WeekCard'
import { ExerciseCard } from './ExerciseCard'
import { ProgressTracker } from './ProgressTracker'
import { FUNCTION_DESCRIPTIONS } from '@/lib/shadow-work/program'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Target,
  TrendingUp,
  Calendar,
  Flame,
  Award,
  ChevronRight,
  BookOpen,
  Lightbulb
} from 'lucide-react'

interface ShadowWorkDashboardProps {
  data: ShadowWorkDashboardData
  onCompleteExercise?: (exerciseId: string) => void
  onAdvanceWeek?: () => void
}

export function ShadowWorkDashboard({
  data,
  onCompleteExercise,
  onAdvanceWeek
}: ShadowWorkDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const { profile, currentWeek, todayExercises, recentCompletions, upcomingMilestones, recommendations, streakInfo } = data

  const funcDesc = FUNCTION_DESCRIPTIONS[profile.inferiorFunction]

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Shadow Work</h1>
            <p className="text-muted-foreground mt-2">
              Программа интеграции теневой функции
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {profile.mbtiType}
          </Badge>
        </div>

        {/* Inferior Function Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Теневая функция: {funcDesc.name}
            </CardTitle>
            <CardDescription className="text-base">
              {funcDesc.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-semibold">Проявление: </span>
              <span className="text-muted-foreground">{funcDesc.manifestation}</span>
            </div>
            <div>
              <span className="font-semibold">Путь роста: </span>
              <span className="text-muted-foreground">{funcDesc.growthPath}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Неделя программы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentWeek.theme.number}/8</div>
            <p className="text-sm text-muted-foreground mt-1">
              {currentWeek.theme.title}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Интеграция
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile.integrationLevel}%</div>
            <div className="w-full bg-secondary h-2 rounded-full mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${profile.integrationLevel}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Серия дней
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streakInfo.current}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Рекорд: {streakInfo.longest} дней
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="w-4 h-4" />
              Практика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile.totalPracticeHours}ч</div>
            <p className="text-sm text-muted-foreground mt-1">
              Всего времени
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="exercises">Упражнения</TabsTrigger>
          <TabsTrigger value="progress">Прогресс</TabsTrigger>
          <TabsTrigger value="insights">Инсайты</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Current Week */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Текущая неделя</h2>
            <WeekCard
              week={currentWeek}
              status="current"
              progress={70} // TODO: Calculate from data
              onClick={() => {}}
            />
          </div>

          {/* Today's Exercises */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Упражнения на сегодня</h2>
              <Button variant="ghost" size="sm">
                Все упражнения
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayExercises.slice(0, 4).map(exercise => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onComplete={onCompleteExercise}
                />
              ))}
            </div>
          </div>

          {/* Upcoming Milestones */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Ближайшие цели</h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {upcomingMilestones.map((milestone, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                        {milestone.week}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{milestone.milestone}</p>
                        <p className="text-sm text-muted-foreground">
                          Через {milestone.daysUntil} дней
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Exercises Tab */}
        <TabsContent value="exercises" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Рекомендованные упражнения</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map(rec => (
                <ExerciseCard
                  key={rec.exercise.id}
                  exercise={rec.exercise}
                  recommendation={rec}
                  onComplete={onCompleteExercise}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Недавно выполненные</h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {recentCompletions.map((completion, index) => (
                    <li key={index} className="flex items-center justify-between pb-4 border-b last:border-0">
                      <div>
                        <p className="font-medium">Упражнение #{completion.exerciseId}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(completion.completedAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <Badge variant="outline">{completion.duration} мин</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <ProgressTracker profile={profile} />
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              Ваши инсайты
            </h2>

            {/* Breakthroughs */}
            {profile.breakthroughs.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Прорывы</CardTitle>
                  <CardDescription>
                    Ключевые моменты трансформации
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {profile.breakthroughs.map((breakthrough, index) => (
                      <li key={index} className="border-l-2 border-primary pl-4">
                        <p className="font-medium">{breakthrough.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(breakthrough.date).toLocaleDateString('ru-RU')}
                          <span>•</span>
                          <span>Неделя {breakthrough.weekNumber}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Growth Areas */}
            <Card>
              <CardHeader>
                <CardTitle>Области роста</CardTitle>
                <CardDescription>
                  Отслеживание развития по ключевым направлениям
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.growthAreas.map((area, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{area.area}</span>
                        <span className="text-sm text-muted-foreground">{area.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${area.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Common Triggers */}
            {profile.commonTriggers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Распознанные триггеры</CardTitle>
                  <CardDescription>
                    Ситуации, активирующие теневую функцию
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.commonTriggers.map((trigger, index) => (
                      <Badge key={index} variant="secondary">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
