// Gamification Constants
// Shared configuration values for XP rewards and levels

// ===========================================
// XP CONFIGURATION
// ===========================================

export const XP_REWARDS = {
  // Learning
  ARTICLE_READ: 25,
  QUIZ_COMPLETED: 50,
  QUIZ_PERFECT_SCORE: 25, // Bonus for 100%

  // Practice
  JOURNAL_ENTRY: 15,
  EXERCISE_COMPLETED: 40,

  // Shadow Work
  SHADOW_WORK_WEEK: 100,
  SHADOW_WORK_COMPLETE: 500,

  // Streaks (daily bonus)
  STREAK_BONUS_BASE: 5, // Per day in streak
  STREAK_BONUS_MAX: 50, // Max daily bonus

  // Achievements (defined per achievement)
  // Challenges (defined per challenge)
} as const

export type XPRewardType = keyof typeof XP_REWARDS

// ===========================================
// LEVEL THRESHOLDS
// ===========================================

export const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, maxXp: 499, name: 'Исследователь' },
  { level: 2, minXp: 500, maxXp: 1499, name: 'Искатель' },
  { level: 3, minXp: 1500, maxXp: 3499, name: 'Ученик' },
  { level: 4, minXp: 3500, maxXp: 7499, name: 'Путешественник' },
  { level: 5, minXp: 7500, maxXp: 14999, name: 'Проводник' },
  { level: 6, minXp: 15000, maxXp: Infinity, name: 'Мудрец' },
] as const

export function getLevelForXp(totalXp: number): { level: number; name: string } {
  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalXp >= threshold.minXp && totalXp <= threshold.maxXp) {
      return { level: threshold.level, name: threshold.name }
    }
  }
  return { level: 6, name: 'Мудрец' }
}

// ===========================================
// DB RECORD TYPE
// ===========================================

export interface DBGamificationRecord {
  id: string
  user_id: string
  tenant_id: string
  total_xp: number
  level: number
  level_name: string
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  total_articles_read: number
  total_quizzes_completed: number
  total_exercises_completed: number
  total_journal_entries: number
  total_challenges_completed: number
  weekly_xp: number
  monthly_xp: number
  week_start_date: string | null
  month_start_date: string | null
  created_at: string
  updated_at: string
}
