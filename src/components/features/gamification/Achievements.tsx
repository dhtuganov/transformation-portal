'use client'

import { cn } from '@/lib/utils'
import type { Achievement, UserAchievement, AchievementCategory } from '@/types/gamification'

// ===========================================
// ACHIEVEMENT CARD
// ===========================================

interface AchievementCardProps {
  achievement: Achievement
  userAchievement?: UserAchievement
  size?: 'sm' | 'md' | 'lg'
  locale?: 'ru' | 'en'
  onClick?: () => void
  className?: string
}

export function AchievementCard({
  achievement,
  userAchievement,
  size = 'md',
  locale = 'ru',
  onClick,
  className,
}: AchievementCardProps) {
  const isEarned = !!userAchievement
  const isHidden = achievement.isHidden && !isEarned

  const sizeStyles = {
    sm: { icon: 'text-2xl', title: 'text-sm', desc: 'text-xs' },
    md: { icon: 'text-3xl', title: 'text-base', desc: 'text-sm' },
    lg: { icon: 'text-4xl', title: 'text-lg', desc: 'text-base' },
  }

  const styles = sizeStyles[size]
  const categoryColors = CATEGORY_COLORS[achievement.category]

  if (isHidden) {
    return (
      <div
        className={cn(
          'p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900',
          'flex items-center justify-center',
          className
        )}
      >
        <div className="text-center text-muted-foreground">
          <span className={cn('block opacity-50', styles.icon)}>❓</span>
          <span className={cn('block', styles.desc)}>
            {locale === 'ru' ? 'Скрытое достижение' : 'Hidden achievement'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg border-2 transition-all',
        isEarned
          ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 opacity-60',
        onClick && 'cursor-pointer hover:shadow-md hover:scale-[1.02]',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          'flex-shrink-0',
          styles.icon,
          !isEarned && 'grayscale'
        )}>
          {achievement.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={cn('font-bold truncate', styles.title)}>
              {locale === 'ru' ? achievement.nameRu : achievement.nameEn}
            </h4>
            {isEarned && (
              <span className="text-yellow-500">✓</span>
            )}
          </div>

          <p className={cn('text-muted-foreground line-clamp-2', styles.desc)}>
            {locale === 'ru' ? achievement.descriptionRu : achievement.descriptionEn}
          </p>

          {/* Progress or earned date */}
          <div className="mt-2 flex items-center gap-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: categoryColors.bg,
                color: categoryColors.text,
              }}
            >
              {CATEGORY_LABELS[locale][achievement.category]}
            </span>

            {isEarned ? (
              <span className="text-xs text-muted-foreground">
                {new Date(userAchievement.earnedAt).toLocaleDateString(
                  locale === 'ru' ? 'ru-RU' : 'en-US'
                )}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                +{achievement.xpReward} XP
              </span>
            )}
          </div>

          {/* Progress bar for in-progress achievements */}
          {(() => {
            const progress = userAchievement?.progress ?? 0
            if (isEarned || progress <= 0) return null
            return (
              <div className="mt-2">
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (progress / achievement.requirementValue) * 100)}%`
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {progress} / {achievement.requirementValue}
                </span>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

// ===========================================
// ACHIEVEMENT GALLERY
// ===========================================

interface AchievementGalleryProps {
  achievements: Achievement[]
  userAchievements: UserAchievement[]
  category?: AchievementCategory
  showEarnedOnly?: boolean
  locale?: 'ru' | 'en'
  className?: string
}

export function AchievementGallery({
  achievements,
  userAchievements,
  category,
  showEarnedOnly = false,
  locale = 'ru',
  className,
}: AchievementGalleryProps) {
  const userAchievementMap = new Map(
    userAchievements.map(ua => [ua.achievementId, ua])
  )

  let filteredAchievements = achievements
  if (category) {
    filteredAchievements = filteredAchievements.filter(a => a.category === category)
  }
  if (showEarnedOnly) {
    filteredAchievements = filteredAchievements.filter(a => userAchievementMap.has(a.id))
  }

  // Sort: earned first, then by category
  filteredAchievements.sort((a, b) => {
    const aEarned = userAchievementMap.has(a.id) ? 1 : 0
    const bEarned = userAchievementMap.has(b.id) ? 1 : 0
    if (aEarned !== bEarned) return bEarned - aEarned
    return a.category.localeCompare(b.category)
  })

  const earned = filteredAchievements.filter(a => userAchievementMap.has(a.id)).length
  const total = filteredAchievements.length

  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {locale === 'ru' ? 'Достижения' : 'Achievements'}
        </h3>
        <span className="text-sm text-muted-foreground">
          {earned} / {total}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            userAchievement={userAchievementMap.get(achievement.id)}
            locale={locale}
          />
        ))}
      </div>
    </div>
  )
}

// ===========================================
// ACHIEVEMENT NOTIFICATION
// ===========================================

interface AchievementNotificationProps {
  achievement: Achievement
  locale?: 'ru' | 'en'
  onClose?: () => void
  className?: string
}

export function AchievementNotification({
  achievement,
  locale = 'ru',
  onClose,
  className,
}: AchievementNotificationProps) {
  return (
    <div className={cn(
      'fixed bottom-4 right-4 max-w-sm p-4 rounded-lg shadow-2xl',
      'bg-gradient-to-br from-yellow-400 to-amber-500 text-white',
      'animate-in slide-in-from-bottom-5 fade-in duration-500',
      className
    )}>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 opacity-70 hover:opacity-100"
      >
        ✕
      </button>

      <div className="flex items-center gap-3">
        <div className="text-4xl animate-bounce">{achievement.icon}</div>
        <div>
          <div className="text-sm opacity-80">
            {locale === 'ru' ? 'Достижение разблокировано!' : 'Achievement Unlocked!'}
          </div>
          <div className="font-bold text-lg">
            {locale === 'ru' ? achievement.nameRu : achievement.nameEn}
          </div>
          <div className="text-sm opacity-90">
            +{achievement.xpReward} XP
          </div>
        </div>
      </div>
    </div>
  )
}

// ===========================================
// CATEGORY FILTERS
// ===========================================

interface CategoryFiltersProps {
  selected?: AchievementCategory
  onChange: (category: AchievementCategory | undefined) => void
  counts?: Record<AchievementCategory, { earned: number; total: number }>
  locale?: 'ru' | 'en'
  className?: string
}

export function CategoryFilters({
  selected,
  onChange,
  counts,
  locale = 'ru',
  className,
}: CategoryFiltersProps) {
  const categories: AchievementCategory[] = [
    'discovery',
    'learning',
    'practice',
    'consistency',
    'shadow_work',
    'connection',
    'mastery',
    'special',
  ]

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <button
        onClick={() => onChange(undefined)}
        className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
          selected === undefined
            ? 'bg-primary text-primary-foreground'
            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
        )}
      >
        {locale === 'ru' ? 'Все' : 'All'}
      </button>

      {categories.map(category => {
        const colors = CATEGORY_COLORS[category]
        const count = counts?.[category]

        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1',
              selected === category
                ? 'ring-2 ring-offset-2'
                : 'hover:opacity-80'
            )}
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              '--tw-ring-color': colors.text,
            } as React.CSSProperties}
          >
            {CATEGORY_ICONS[category]}{' '}
            {CATEGORY_LABELS[locale][category]}
            {count && (
              <span className="text-xs opacity-70">
                ({count.earned}/{count.total})
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ===========================================
// CONSTANTS
// ===========================================

const CATEGORY_ICONS: Record<AchievementCategory, string> = {
  discovery: '🔍',
  learning: '📚',
  practice: '💪',
  consistency: '🔥',
  shadow_work: '🌑',
  connection: '🤝',
  mastery: '⭐',
  special: '🎁',
}

const CATEGORY_LABELS: Record<'ru' | 'en', Record<AchievementCategory, string>> = {
  ru: {
    discovery: 'Открытия',
    learning: 'Обучение',
    practice: 'Практика',
    consistency: 'Постоянство',
    shadow_work: 'Работа с тенью',
    connection: 'Связи',
    mastery: 'Мастерство',
    special: 'Особые',
  },
  en: {
    discovery: 'Discovery',
    learning: 'Learning',
    practice: 'Practice',
    consistency: 'Consistency',
    shadow_work: 'Shadow Work',
    connection: 'Connection',
    mastery: 'Mastery',
    special: 'Special',
  },
}

const CATEGORY_COLORS: Record<AchievementCategory, { bg: string; text: string }> = {
  discovery: { bg: '#DBEAFE', text: '#1E40AF' },
  learning: { bg: '#D1FAE5', text: '#065F46' },
  practice: { bg: '#FEE2E2', text: '#991B1B' },
  consistency: { bg: '#FFEDD5', text: '#9A3412' },
  shadow_work: { bg: '#E5E7EB', text: '#374151' },
  connection: { bg: '#CCFBF1', text: '#0F766E' },
  mastery: { bg: '#FEF3C7', text: '#92400E' },
  special: { bg: '#EDE9FE', text: '#5B21B6' },
}
