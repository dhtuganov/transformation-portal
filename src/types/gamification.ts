// Gamification System Types
// XP, levels, streaks, achievements, challenges

// ===========================================
// LEVELS
// ===========================================

export interface GamificationLevel {
  level: number
  nameRu: string
  nameEn: string
  minXp: number
  maxXp: number | null  // null for max level
  badgeIcon: string
  color: string
}

export const GAMIFICATION_LEVELS: GamificationLevel[] = [
  { level: 1, nameRu: 'Исследователь', nameEn: 'Explorer', minXp: 0, maxXp: 499, badgeIcon: '🔍', color: '#6B7280' },
  { level: 2, nameRu: 'Искатель', nameEn: 'Seeker', minXp: 500, maxXp: 1499, badgeIcon: '🧭', color: '#3B82F6' },
  { level: 3, nameRu: 'Ученик', nameEn: 'Apprentice', minXp: 1500, maxXp: 3499, badgeIcon: '📚', color: '#10B981' },
  { level: 4, nameRu: 'Путешественник', nameEn: 'Journeyer', minXp: 3500, maxXp: 7499, badgeIcon: '🚀', color: '#8B5CF6' },
  { level: 5, nameRu: 'Проводник', nameEn: 'Guide', minXp: 7500, maxXp: 14999, badgeIcon: '🌟', color: '#F59E0B' },
  { level: 6, nameRu: 'Мудрец', nameEn: 'Sage', minXp: 15000, maxXp: null, badgeIcon: '🔮', color: '#EF4444' },
]

// ===========================================
// USER GAMIFICATION STATS
// ===========================================

export interface UserGamification {
  id: string
  userId: string
  tenantId: string

  // XP & Level
  totalXp: number
  level: number
  levelName: string

  // Streaks
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null

  // Activity stats
  totalArticlesRead: number
  totalQuizzesCompleted: number
  totalExercisesCompleted: number
  totalJournalEntries: number
  totalChallengesCompleted: number

  // Weekly/Monthly tracking
  weeklyXp: number
  monthlyXp: number
  weekStartDate: string | null
  monthStartDate: string | null

  createdAt: string
  updatedAt: string
}

// ===========================================
// ACHIEVEMENTS
// ===========================================

export type AchievementCategory =
  | 'discovery'     // Assessment, onboarding
  | 'learning'      // Content consumption
  | 'practice'      // Exercises, journaling
  | 'consistency'   // Streaks
  | 'shadow_work'   // Inferior function development
  | 'connection'    // Relationships, team activities
  | 'mastery'       // Advanced achievements
  | 'special'       // Events, milestones

export type AchievementRequirementType =
  | 'count'         // Do X times
  | 'streak'        // X days in a row
  | 'completion'    // Complete something
  | 'score'         // Reach X score/percentage

export interface Achievement {
  id: string
  code: string
  category: AchievementCategory

  // Display
  nameRu: string
  nameEn: string
  descriptionRu: string
  descriptionEn: string
  icon: string

  // Requirements
  requirementType: AchievementRequirementType
  requirementValue: number
  requirementContext?: Record<string, unknown>

  // Rewards
  xpReward: number
  badgeUrl?: string

  // Visibility
  isHidden: boolean
  isActive: boolean
}

export interface UserAchievement {
  id: string
  userId: string
  achievementId: string

  earnedAt: string
  progress: number  // For progressive achievements
  notified: boolean

  // Joined from achievements table
  achievement?: Achievement
}

// ===========================================
// CHALLENGES
// ===========================================

export type ChallengeType = 'daily' | 'weekly' | 'special'

export type ChallengeTaskType =
  | 'read_article'
  | 'complete_quiz'
  | 'journal_entry'
  | 'exercise'
  | 'shadow_work'
  | 'reflection'

export interface Challenge {
  id: string
  tenantId: string

  code: string
  challengeType: ChallengeType

  // Display
  titleRu: string
  titleEn: string
  descriptionRu: string
  descriptionEn: string
  icon?: string

  // Requirements
  taskType: ChallengeTaskType
  taskCount: number
  taskFilter?: {
    mbtiTypes?: string[]
    category?: string
    tags?: string[]
  }

  // MBTI relevance
  recommendedTypes: string[]

  // Rewards
  xpReward: number

  // Availability
  startDate?: string
  endDate?: string
  isActive: boolean
}

export interface UserChallenge {
  id: string
  userId: string
  challengeId: string

  status: 'in_progress' | 'completed' | 'expired'
  progress: number
  startedAt: string
  completedAt?: string

  // Joined from challenges table
  challenge?: Challenge
}

// ===========================================
// XP TRANSACTIONS
// ===========================================

export type XPSource =
  | 'article'
  | 'quiz'
  | 'achievement'
  | 'challenge'
  | 'streak'
  | 'exercise'
  | 'journal'
  | 'shadow_work'
  | 'bonus'

export interface XPTransaction {
  id: string
  userId: string

  amount: number
  source: XPSource
  sourceId?: string
  description?: string

  createdAt: string
}

// ===========================================
// XP REWARDS CONFIG
// ===========================================

export const XP_REWARDS = {
  // Content
  article_read: 10,
  article_completed: 25,
  quiz_started: 5,
  quiz_completed: 50,
  quiz_perfect: 100,

  // Exercises
  exercise_completed: 30,
  reflection_completed: 15,
  journal_entry: 10,

  // Streaks
  streak_day: 5,
  streak_week_bonus: 50,
  streak_month_bonus: 200,

  // Shadow Work
  shadow_work_session: 40,
  shadow_work_week: 100,
  shadow_work_completed: 500,

  // Social
  relationship_added: 15,
  compatibility_analyzed: 20,

  // Assessment
  assessment_completed: 100,
  profile_updated: 25,
} as const

// ===========================================
// LEADERBOARD
// ===========================================

export interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  avatarUrl?: string
  mbtiType?: string

  totalXp: number
  level: number
  levelName: string
  currentStreak: number

  weeklyXp?: number
  monthlyXp?: number
}

export type LeaderboardPeriod = 'all_time' | 'monthly' | 'weekly'

export interface LeaderboardFilters {
  period: LeaderboardPeriod
  tenantId: string
  department?: string
  mbtiType?: string
  limit?: number
}

// ===========================================
// GAMIFICATION EVENTS
// ===========================================

export type GamificationEventType =
  | 'xp_earned'
  | 'level_up'
  | 'achievement_unlocked'
  | 'streak_updated'
  | 'challenge_completed'
  | 'challenge_expired'

export interface GamificationEvent {
  type: GamificationEventType
  userId: string
  timestamp: string
  data: {
    xpAmount?: number
    newLevel?: number
    achievementId?: string
    achievementName?: string
    streakDays?: number
    challengeId?: string
  }
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

export function getLevelForXP(xp: number): GamificationLevel {
  for (let i = GAMIFICATION_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= GAMIFICATION_LEVELS[i].minXp) {
      return GAMIFICATION_LEVELS[i]
    }
  }
  return GAMIFICATION_LEVELS[0]
}

export function getXPToNextLevel(currentXp: number): number {
  const currentLevel = getLevelForXP(currentXp)
  if (currentLevel.maxXp === null) {
    return 0 // Already at max level
  }
  return currentLevel.maxXp - currentXp + 1
}

export function getLevelProgress(currentXp: number): number {
  const currentLevel = getLevelForXP(currentXp)
  if (currentLevel.maxXp === null) {
    return 100 // Max level
  }
  const levelRange = currentLevel.maxXp - currentLevel.minXp
  const progressInLevel = currentXp - currentLevel.minXp
  return Math.round((progressInLevel / levelRange) * 100)
}

export function formatXP(xp: number): string {
  if (xp >= 10000) {
    return `${(xp / 1000).toFixed(1)}K`
  }
  return xp.toLocaleString()
}
