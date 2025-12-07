'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { UserGamification, Achievement, UserAchievement } from '@/types/gamification'
import { XPProgress, StreakDisplay, LevelBadge } from './XPProgress'
import { AchievementCard } from './Achievements'
import { Trophy, Flame, Star, ChevronRight } from 'lucide-react'

// ===========================================
// GAMIFICATION PANEL
// ===========================================

interface GamificationPanelProps {
  gamification: UserGamification
  recentAchievements?: (Achievement & { userAchievement: UserAchievement })[]
  locale?: 'ru' | 'en'
  className?: string
}

export function GamificationPanel({
  gamification,
  recentAchievements = [],
  locale = 'ru',
  className,
}: GamificationPanelProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {locale === 'ru' ? 'Ваш прогресс' : 'Your Progress'}
        </CardTitle>
        <CardDescription>
          {locale === 'ru'
            ? 'Продолжайте развиваться и получайте награды'
            : 'Keep growing and earn rewards'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* XP Progress */}
        <XPProgress
          gamification={gamification}
          showDetails
          size="md"
          locale={locale}
        />

        {/* Streak */}
        <StreakDisplay
          currentStreak={gamification.currentStreak}
          longestStreak={gamification.longestStreak}
          size="sm"
          locale={locale}
        />

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              {locale === 'ru' ? 'Недавние достижения' : 'Recent Achievements'}
            </h4>
            <div className="space-y-2">
              {recentAchievements.slice(0, 3).map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  userAchievement={achievement.userAchievement}
                  size="sm"
                  locale={locale}
                />
              ))}
            </div>
          </div>
        )}

        {/* View All Link */}
        <Button variant="outline" asChild className="w-full">
          <Link href="/dashboard/profile/achievements">
            {locale === 'ru' ? 'Все достижения' : 'All Achievements'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// ===========================================
// COMPACT GAMIFICATION WIDGET
// ===========================================

interface GamificationWidgetProps {
  gamification: UserGamification
  locale?: 'ru' | 'en'
  className?: string
}

export function GamificationWidget({
  gamification,
  locale = 'ru',
  className,
}: GamificationWidgetProps) {
  return (
    <div className={cn(
      'flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border',
      className
    )}>
      <LevelBadge level={gamification.level} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{gamification.totalXp} XP</span>
          <span className="text-muted-foreground">•</span>
          <span className="flex items-center gap-1">
            <Flame className="h-3 w-3 text-orange-500" />
            {gamification.currentStreak}
            {locale === 'ru' ? ' дней' : ' days'}
          </span>
        </div>
      </div>

      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/profile/achievements">
          <Trophy className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}

// ===========================================
// DAILY CHALLENGE CARD
// ===========================================

interface DailyChallengeProps {
  challenge: {
    id: string
    title: string
    description: string
    xpReward: number
    completed: boolean
  }
  onComplete?: () => void
  locale?: 'ru' | 'en'
  className?: string
}

export function DailyChallengeCard({
  challenge,
  onComplete,
  locale = 'ru',
  className,
}: DailyChallengeProps) {
  return (
    <Card className={cn(
      'border-2',
      challenge.completed
        ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20'
        : 'border-primary/20',
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            challenge.completed
              ? 'bg-green-100 text-green-600'
              : 'bg-primary/10 text-primary'
          )}>
            {challenge.completed ? '✓' : '⚡'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{challenge.title}</h4>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                +{challenge.xpReward} XP
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {challenge.description}
            </p>
          </div>

          {!challenge.completed && onComplete && (
            <Button size="sm" onClick={onComplete}>
              {locale === 'ru' ? 'Выполнить' : 'Complete'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ===========================================
// STATS OVERVIEW
// ===========================================

interface GamificationStatsProps {
  gamification: UserGamification
  achievementCount: { earned: number; total: number }
  locale?: 'ru' | 'en'
  className?: string
}

export function GamificationStats({
  gamification,
  achievementCount,
  locale = 'ru',
  className,
}: GamificationStatsProps) {
  const stats = [
    {
      label: locale === 'ru' ? 'Всего XP' : 'Total XP',
      value: gamification.totalXp.toLocaleString(),
      icon: '⭐',
    },
    {
      label: locale === 'ru' ? 'Уровень' : 'Level',
      value: gamification.level,
      icon: '🏆',
    },
    {
      label: locale === 'ru' ? 'Серия' : 'Streak',
      value: `${gamification.currentStreak} ${locale === 'ru' ? 'дн.' : 'days'}`,
      icon: '🔥',
    },
    {
      label: locale === 'ru' ? 'Достижения' : 'Achievements',
      value: `${achievementCount.earned}/${achievementCount.total}`,
      icon: '🎯',
    },
  ]

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="text-center p-4 rounded-lg bg-muted/50"
        >
          <div className="text-2xl mb-1">{stat.icon}</div>
          <div className="text-lg font-bold">{stat.value}</div>
          <div className="text-xs text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
