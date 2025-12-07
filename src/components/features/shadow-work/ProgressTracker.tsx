'use client'

import type { ShadowWorkProfile } from '@/lib/shadow-work/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  Calendar,
  Clock,
  Award,
  Target,
  Zap,
  CheckCircle2,
  BarChart3
} from 'lucide-react'
import { FUNCTION_DESCRIPTIONS } from '@/lib/shadow-work/program'

interface ProgressTrackerProps {
  profile: ShadowWorkProfile
}

export function ProgressTracker({ profile }: ProgressTrackerProps) {
  const funcDesc = FUNCTION_DESCRIPTIONS[profile.inferiorFunction]

  // Calculate stats
  const completionRate = profile.currentWeek ? (profile.completedWeeks / 8) * 100 : 0
  const averagePracticePerWeek = profile.completedWeeks > 0
    ? profile.totalPracticeHours / profile.completedWeeks
    : 0

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Общий прогресс
          </CardTitle>
          <CardDescription>
            Ваш путь интеграции {funcDesc.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Integration Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Уровень интеграции</span>
              <span className="text-2xl font-bold text-primary">
                {profile.integrationLevel}%
              </span>
            </div>
            <Progress value={profile.integrationLevel} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {profile.integrationLevel < 25 && 'Начало пути — фаза осознания'}
              {profile.integrationLevel >= 25 && profile.integrationLevel < 50 && 'Развитие — активное обучение'}
              {profile.integrationLevel >= 50 && profile.integrationLevel < 75 && 'Интеграция — применение на практике'}
              {profile.integrationLevel >= 75 && 'Мастерство — естественное использование'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="w-4 h-4" />
                Недели
              </div>
              <div className="text-2xl font-bold">
                {profile.completedWeeks}/8
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock className="w-4 h-4" />
                Практика
              </div>
              <div className="text-2xl font-bold">
                {profile.totalPracticeHours}ч
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Award className="w-4 h-4" />
                Прорывы
              </div>
              <div className="text-2xl font-bold">
                {profile.breakthroughs.length}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Zap className="w-4 h-4" />
                В среднем/нед
              </div>
              <div className="text-2xl font-bold">
                {averagePracticePerWeek.toFixed(1)}ч
              </div>
            </div>
          </div>

          {/* Program Start Date */}
          {profile.programStartDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Начало программы:{' '}
                {new Date(profile.programStartDate).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Growth Areas */}
      {profile.growthAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Области роста
            </CardTitle>
            <CardDescription>
              Развитие по ключевым направлениям
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.growthAreas.map((area, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <span className="font-medium">{area.area}</span>
                      <p className="text-xs text-muted-foreground">
                        Обновлено:{' '}
                        {new Date(area.lastUpdated).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">{area.progress}%</span>
                  </div>
                  <Progress value={area.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breakthroughs Timeline */}
      {profile.breakthroughs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Прорывы и инсайты
            </CardTitle>
            <CardDescription>
              Ключевые моменты трансформации
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.breakthroughs
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((breakthrough, index) => (
                  <div
                    key={index}
                    className="relative pl-6 pb-4 border-l-2 border-primary/20 last:pb-0"
                  >
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(breakthrough.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Неделя {breakthrough.weekNumber}
                        </Badge>
                      </div>
                      <p className="font-medium">{breakthrough.description}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Triggers & Patterns */}
      {(profile.commonTriggers.length > 0 || profile.behaviorPatterns.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Распознанные паттерны
            </CardTitle>
            <CardDescription>
              Триггеры и поведенческие паттерны
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Triggers */}
            {profile.commonTriggers.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Триггеры</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.commonTriggers.map((trigger, index) => (
                    <Badge key={index} variant="secondary">
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Behavior Patterns */}
            {profile.behaviorPatterns.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Поведенческие паттерны</h4>
                <ul className="space-y-1">
                  {profile.behaviorPatterns.map((pattern, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{pattern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cognitive Functions Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Ваш когнитивный стек</CardTitle>
          <CardDescription>
            Иерархия функций для {profile.mbtiType}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <div>
                <p className="font-semibold">1. Доминантная</p>
                <p className="text-sm text-muted-foreground">{profile.dominantFunction}</p>
              </div>
              <Badge>Сильнейшая</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
              <div>
                <p className="font-semibold">2. Вспомогательная</p>
                <p className="text-sm text-muted-foreground">{profile.auxiliaryFunction}</p>
              </div>
              <Badge variant="secondary">Поддержка</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-semibold">3. Третичная</p>
                <p className="text-sm text-muted-foreground">{profile.tertiaryFunction}</p>
              </div>
              <Badge variant="outline">Развивается</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
              <div>
                <p className="font-semibold">4. Теневая (Inferior)</p>
                <p className="text-sm text-muted-foreground">{profile.inferiorFunction}</p>
              </div>
              <Badge className="bg-purple-600 hover:bg-purple-700">
                Фокус программы
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
