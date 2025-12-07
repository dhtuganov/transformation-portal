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

// ===========================================
// MOCK DATA (matches types/gamification.ts)
// ===========================================

const MOCK_GAMIFICATION: UserGamification = {
  id: 'gam-1',
  userId: 'demo-user',
  tenantId: 'otrar',
  totalXp: 2750,
  level: 3,
  levelName: 'Ученик',
  currentStreak: 5,
  longestStreak: 12,
  lastActivityDate: new Date().toISOString(),
  totalArticlesRead: 15,
  totalQuizzesCompleted: 3,
  totalExercisesCompleted: 8,
  totalJournalEntries: 5,
  totalChallengesCompleted: 2,
  weeklyXp: 450,
  monthlyXp: 1200,
  weekStartDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  monthStartDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    code: 'first_assessment',
    category: 'discovery',
    nameRu: 'Первооткрыватель',
    nameEn: 'Pioneer',
    descriptionRu: 'Пройти первый тест MBTI',
    descriptionEn: 'Complete your first MBTI test',
    icon: '🎯',
    xpReward: 100,
    requirementType: 'completion',
    requirementValue: 1,
    isHidden: false,
    isActive: true,
  },
  {
    id: '2',
    code: 'student',
    category: 'learning',
    nameRu: 'Студент',
    nameEn: 'Student',
    descriptionRu: 'Изучить 5 статей о типах',
    descriptionEn: 'Read 5 articles about types',
    icon: '📚',
    xpReward: 150,
    requirementType: 'count',
    requirementValue: 5,
    isHidden: false,
    isActive: true,
  },
  {
    id: '3',
    code: 'week_streak',
    category: 'consistency',
    nameRu: 'Неделя в потоке',
    nameEn: 'Week in Flow',
    descriptionRu: 'Поддерживать серию 7 дней',
    descriptionEn: 'Maintain a 7-day streak',
    icon: '🔥',
    xpReward: 200,
    requirementType: 'streak',
    requirementValue: 7,
    isHidden: false,
    isActive: true,
  },
  {
    id: '4',
    code: 'practitioner',
    category: 'practice',
    nameRu: 'Практик',
    nameEn: 'Practitioner',
    descriptionRu: 'Выполнить 10 практических упражнений',
    descriptionEn: 'Complete 10 practical exercises',
    icon: '💪',
    xpReward: 250,
    requirementType: 'count',
    requirementValue: 10,
    isHidden: false,
    isActive: true,
  },
  {
    id: '5',
    code: 'shadow_explorer',
    category: 'shadow_work',
    nameRu: 'Исследователь тени',
    nameEn: 'Shadow Explorer',
    descriptionRu: 'Начать работу с теневыми функциями',
    descriptionEn: 'Start working with shadow functions',
    icon: '🌑',
    xpReward: 300,
    requirementType: 'completion',
    requirementValue: 1,
    isHidden: false,
    isActive: true,
  },
  {
    id: '6',
    code: 'connector',
    category: 'connection',
    nameRu: 'Связующий',
    nameEn: 'Connector',
    descriptionRu: 'Добавить первый профиль отношений',
    descriptionEn: 'Add your first relationship profile',
    icon: '🤝',
    xpReward: 150,
    requirementType: 'completion',
    requirementValue: 1,
    isHidden: false,
    isActive: true,
  },
  {
    id: '7',
    code: 'communication_master',
    category: 'mastery',
    nameRu: 'Мастер коммуникации',
    nameEn: 'Communication Master',
    descriptionRu: 'Изучить стили общения для всех 16 типов',
    descriptionEn: 'Learn communication styles for all 16 types',
    icon: '⭐',
    xpReward: 500,
    requirementType: 'count',
    requirementValue: 16,
    isHidden: false,
    isActive: true,
  },
  {
    id: '8',
    code: 'early_adopter',
    category: 'special',
    nameRu: 'Ранний последователь',
    nameEn: 'Early Adopter',
    descriptionRu: 'Зарегистрироваться в первом месяце',
    descriptionEn: 'Register in the first month',
    icon: '🎁',
    xpReward: 100,
    requirementType: 'completion',
    requirementValue: 1,
    isHidden: false,
    isActive: true,
  },
  {
    id: '9',
    code: 'function_expert',
    category: 'discovery',
    nameRu: 'Знаток функций',
    nameEn: 'Function Expert',
    descriptionRu: 'Изучить все 8 когнитивных функций',
    descriptionEn: 'Learn all 8 cognitive functions',
    icon: '🧠',
    xpReward: 200,
    requirementType: 'count',
    requirementValue: 8,
    isHidden: false,
    isActive: true,
  },
  {
    id: '10',
    code: 'month_of_power',
    category: 'consistency',
    nameRu: 'Месяц силы',
    nameEn: 'Month of Power',
    descriptionRu: 'Поддерживать серию 30 дней',
    descriptionEn: 'Maintain a 30-day streak',
    icon: '💎',
    xpReward: 500,
    requirementType: 'streak',
    requirementValue: 30,
    isHidden: false,
    isActive: true,
  },
]

const MOCK_USER_ACHIEVEMENTS: UserAchievement[] = [
  {
    id: 'ua-1',
    userId: 'demo-user',
    achievementId: '1',
    earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 1,
    notified: true,
  },
  {
    id: 'ua-2',
    userId: 'demo-user',
    achievementId: '8',
    earnedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 1,
    notified: true,
  },
  {
    id: 'ua-3',
    userId: 'demo-user',
    achievementId: '2',
    earnedAt: '', // In progress
    progress: 3, // 3 of 5
    notified: false,
  },
]

const MOCK_WEEKLY_XP = [
  { day: 'Пн', xp: 150 },
  { day: 'Вт', xp: 200 },
  { day: 'Ср', xp: 75 },
  { day: 'Чт', xp: 300 },
  { day: 'Пт', xp: 125 },
  { day: 'Сб', xp: 0 },
  { day: 'Вс', xp: 50 },
]

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | undefined>()

  // Calculate category counts
  const categoryCounts = MOCK_ACHIEVEMENTS.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = { earned: 0, total: 0 }
    }
    acc[achievement.category].total++

    const userAchievement = MOCK_USER_ACHIEVEMENTS.find(
      ua => ua.achievementId === achievement.id && ua.earnedAt
    )
    if (userAchievement) {
      acc[achievement.category].earned++
    }

    return acc
  }, {} as Record<AchievementCategory, { earned: number; total: number }>)

  const totalEarned = MOCK_USER_ACHIEVEMENTS.filter(ua => ua.earnedAt).length
  const totalAchievements = MOCK_ACHIEVEMENTS.length

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
        gamification={MOCK_GAMIFICATION}
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
                gamification={MOCK_GAMIFICATION}
                showDetails
                size="lg"
                locale="ru"
              />
              <LevelJourney
                currentXp={MOCK_GAMIFICATION.totalXp}
                locale="ru"
              />
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Все достижения</CardTitle>
              <CardDescription>
                Фильтруйте по категориям, чтобы найти нужные достижения
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CategoryFilters
                selected={selectedCategory}
                onChange={setSelectedCategory}
                counts={categoryCounts}
                locale="ru"
              />
              <AchievementGallery
                achievements={MOCK_ACHIEVEMENTS}
                userAchievements={MOCK_USER_ACHIEVEMENTS}
                category={selectedCategory}
                locale="ru"
              />
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
                currentStreak={MOCK_GAMIFICATION.currentStreak}
                longestStreak={MOCK_GAMIFICATION.longestStreak}
                size="md"
                locale="ru"
              />
            </CardContent>
          </Card>

          {/* Weekly XP */}
          <Card>
            <CardHeader>
              <CardTitle>Активность за неделю</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyXPChart data={MOCK_WEEKLY_XP} locale="ru" />
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
                  📚 Изучить статью (+50 XP)
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/assessment">
                  🎯 Пройти тест (+100 XP)
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/profile/cognitive">
                  🧠 Изучить функции (+75 XP)
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
