'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Trophy, Star, Flame } from 'lucide-react'
import {
  XPProgress,
  LevelJourney,
  StreakDisplay,
  WeeklyXPChart,
  AchievementGallery,
  CategoryFilters,
  GamificationStats,
} from '@/components/features/gamification'
import type { UserGamification, Achievement, UserAchievement, AchievementCategory } from '@/types/gamification'

interface AchievementsPageClientProps {
  gamification: UserGamification
  achievements: Achievement[]
  userAchievements: UserAchievement[]
  weeklyXp: { day: string; xp: number }[]
}

export function AchievementsPageClient({
  gamification,
  achievements,
  userAchievements,
  weeklyXp,
}: AchievementsPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | undefined>()

  // Calculate category counts
  const categoryCounts = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = { earned: 0, total: 0 }
    }
    acc[achievement.category].total++

    const userAchievement = userAchievements.find(
      ua => ua.achievementId === achievement.id && ua.earnedAt
    )
    if (userAchievement) {
      acc[achievement.category].earned++
    }

    return acc
  }, {} as Record<AchievementCategory, { earned: number; total: number }>)

  const totalEarned = userAchievements.filter(ua => ua.earnedAt).length
  const totalAchievements = achievements.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/profile">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Достижения и прогресс
          </h1>
          <p className="text-muted-foreground mt-1">
            Ваш путь развития и заработанные награды
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <GamificationStats
        gamification={gamification}
        achievementCount={{ earned: totalEarned, total: totalAchievements }}
        locale="ru"
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* XP and Level Progress */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Уровень и опыт
              </CardTitle>
              <CardDescription>
                Ваш текущий прогресс и путь к следующему уровню
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <XPProgress
                gamification={gamification}
                showDetails
                size="lg"
                locale="ru"
              />
              <LevelJourney
                currentXp={gamification.totalXp}
                locale="ru"
              />
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Все достижения</CardTitle>
              <CardDescription>
                {totalAchievements > 0
                  ? `Заработано ${totalEarned} из ${totalAchievements} достижений`
                  : 'Достижения скоро появятся'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {totalAchievements > 0 ? (
                <>
                  <CategoryFilters
                    selected={selectedCategory}
                    onChange={setSelectedCategory}
                    counts={categoryCounts}
                    locale="ru"
                  />
                  <AchievementGallery
                    achievements={achievements}
                    userAchievements={userAchievements}
                    category={selectedCategory}
                    locale="ru"
                  />
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Достижения будут добавлены в ближайшее время</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Streak */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Серия активности
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StreakDisplay
                currentStreak={gamification.currentStreak}
                longestStreak={gamification.longestStreak}
                size="md"
                locale="ru"
              />
            </CardContent>
          </Card>

          {/* Weekly XP */}
          <Card>
            <CardHeader>
              <CardTitle>Активность за неделю</CardTitle>
              <CardDescription>
                Заработано {weeklyXp.reduce((sum, d) => sum + d.xp, 0)} XP за 7 дней
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyXPChart data={weeklyXp} locale="ru" />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Заработать XP</CardTitle>
              <CardDescription>
                Быстрые способы получить опыт
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/learning">
                  📚 Изучить статью (+25 XP)
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/quizzes">
                  🎯 Пройти тест (+50 XP)
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/shadow-work">
                  🌑 Shadow Work (+40 XP)
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/my-type">
                  🧠 Изучить свой тип (+10 XP)
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
