'use client'

import { cn } from '@/lib/utils'
import type { UserGamification, GamificationLevel } from '@/types/gamification'
import { GAMIFICATION_LEVELS, getLevelForXP, getXPToNextLevel, getLevelProgress, formatXP } from '@/types/gamification'

// ===========================================
// XP PROGRESS BAR
// ===========================================

interface XPProgressProps {
  gamification: UserGamification
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
  locale?: 'ru' | 'en'
  className?: string
}

export function XPProgress({
  gamification,
  showDetails = true,
  size = 'md',
  locale = 'ru',
  className,
}: XPProgressProps) {
  const level = getLevelForXP(gamification.totalXp)
  const progress = getLevelProgress(gamification.totalXp)
  const xpToNext = getXPToNextLevel(gamification.totalXp)
  const isMaxLevel = level.maxXp === null

  const sizeStyles = {
    sm: { bar: 'h-2', text: 'text-xs', badge: 'text-lg' },
    md: { bar: 'h-3', text: 'text-sm', badge: 'text-2xl' },
    lg: { bar: 'h-4', text: 'text-base', badge: 'text-3xl' },
  }

  const styles = sizeStyles[size]

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={styles.badge}>{level.badgeIcon}</span>
          <div>
            <div className="font-bold" style={{ color: level.color }}>
              {locale === 'ru' ? level.nameRu : level.nameEn}
            </div>
            <div className={cn('text-muted-foreground', styles.text)}>
              {locale === 'ru' ? 'Уровень' : 'Level'} {level.level}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="font-bold">{formatXP(gamification.totalXp)} XP</div>
          {!isMaxLevel && (
            <div className={cn('text-muted-foreground', styles.text)}>
              {locale === 'ru' ? `${formatXP(xpToNext)} до следующего` : `${formatXP(xpToNext)} to next`}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className={cn('bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', styles.bar)}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            backgroundColor: level.color,
          }}
        />
      </div>

      {/* Details */}
      {showDetails && (
        <div className={cn('flex justify-between text-muted-foreground', styles.text)}>
          <span>{level.minXp} XP</span>
          <span>{progress}%</span>
          <span>{isMaxLevel ? '∞' : `${level.maxXp} XP`}</span>
        </div>
      )}
    </div>
  )
}

// ===========================================
// LEVEL BADGE
// ===========================================

interface LevelBadgeProps {
  level: number
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  locale?: 'ru' | 'en'
  className?: string
}

export function LevelBadge({
  level: levelNum,
  size = 'md',
  showName = false,
  locale = 'ru',
  className,
}: LevelBadgeProps) {
  const level = GAMIFICATION_LEVELS.find(l => l.level === levelNum) || GAMIFICATION_LEVELS[0]

  const sizeStyles = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  }

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center shadow-lg',
          sizeStyles[size]
        )}
        style={{
          backgroundColor: level.color,
          boxShadow: `0 0 20px ${level.color}40`,
        }}
      >
        {level.badgeIcon}
      </div>
      {showName && (
        <span className="text-xs font-medium">
          {locale === 'ru' ? level.nameRu : level.nameEn}
        </span>
      )}
    </div>
  )
}

// ===========================================
// STREAK DISPLAY
// ===========================================

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
  size?: 'sm' | 'md' | 'lg'
  locale?: 'ru' | 'en'
  className?: string
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  size = 'md',
  locale = 'ru',
  className,
}: StreakDisplayProps) {
  const sizeStyles = {
    sm: { number: 'text-xl', label: 'text-xs' },
    md: { number: 'text-3xl', label: 'text-sm' },
    lg: { number: 'text-5xl', label: 'text-base' },
  }

  const styles = sizeStyles[size]
  const isStreakActive = currentStreak > 0

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Current streak */}
      <div className={cn(
        'text-center p-4 rounded-lg',
        isStreakActive ? 'bg-orange-100 dark:bg-orange-950/30' : 'bg-gray-100 dark:bg-gray-800'
      )}>
        <div className={cn('font-bold flex items-center justify-center gap-2', styles.number)}>
          <span className={isStreakActive ? 'animate-pulse' : ''}>🔥</span>
          {currentStreak}
        </div>
        <div className={cn('text-muted-foreground', styles.label)}>
          {locale === 'ru'
            ? currentStreak === 1 ? 'день' : 'дней подряд'
            : currentStreak === 1 ? 'day' : 'day streak'}
        </div>
      </div>

      {/* Best streak */}
      <div className="text-center">
        <div className={cn('font-bold text-muted-foreground', styles.number)}>
          ⭐ {longestStreak}
        </div>
        <div className={cn('text-muted-foreground', styles.label)}>
          {locale === 'ru' ? 'лучший' : 'best'}
        </div>
      </div>
    </div>
  )
}

// ===========================================
// XP GAIN ANIMATION
// ===========================================

interface XPGainProps {
  amount: number
  source: string
  className?: string
}

export function XPGain({
  amount,
  source,
  className,
}: XPGainProps) {
  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium animate-bounce',
      className
    )}>
      <span>+{amount} XP</span>
      <span className="text-xs opacity-70">• {source}</span>
    </div>
  )
}

// ===========================================
// LEVEL JOURNEY
// ===========================================

interface LevelJourneyProps {
  currentXp: number
  locale?: 'ru' | 'en'
  className?: string
}

export function LevelJourney({
  currentXp,
  locale = 'ru',
  className,
}: LevelJourneyProps) {
  const currentLevel = getLevelForXP(currentXp)

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="font-semibold">
        {locale === 'ru' ? 'Путь развития' : 'Level Journey'}
      </h3>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div
          className="absolute top-4 left-4 h-1 rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, (currentXp / 15000) * 100)}%`,
            backgroundColor: currentLevel.color,
          }}
        />

        {/* Level markers */}
        <div className="relative flex justify-between">
          {GAMIFICATION_LEVELS.map((level) => {
            const isReached = currentXp >= level.minXp
            const isCurrent = level.level === currentLevel.level

            return (
              <div key={level.level} className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all',
                    isReached ? 'scale-100' : 'scale-75 opacity-50',
                    isCurrent && 'ring-2 ring-offset-2'
                  )}
                  style={{
                    backgroundColor: isReached ? level.color : 'gray',
                    '--tw-ring-color': level.color,
                  } as React.CSSProperties}
                >
                  {level.badgeIcon}
                </div>
                <span className={cn(
                  'text-xs mt-1',
                  isReached ? 'font-medium' : 'text-muted-foreground'
                )}>
                  {level.level}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ===========================================
// WEEKLY XP CHART
// ===========================================

interface WeeklyXPChartProps {
  data: { day: string; xp: number }[]
  locale?: 'ru' | 'en'
  className?: string
}

export function WeeklyXPChart({
  data,
  locale = 'ru',
  className,
}: WeeklyXPChartProps) {
  const maxXp = Math.max(...data.map(d => d.xp), 1)

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-medium text-muted-foreground">
        {locale === 'ru' ? 'XP за неделю' : 'Weekly XP'}
      </h4>

      <div className="flex items-end gap-1 h-24">
        {data.map((day, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-primary/20 rounded-t transition-all hover:bg-primary/30"
              style={{
                height: `${(day.xp / maxXp) * 100}%`,
                minHeight: day.xp > 0 ? '4px' : '0',
              }}
            >
              <div
                className="w-full h-full bg-primary rounded-t"
                style={{ opacity: day.xp > 0 ? 1 : 0 }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{day.day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
