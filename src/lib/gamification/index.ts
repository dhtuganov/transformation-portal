// Gamification Library
// Server-side functions for gamification system

// Queries (read)
export {
  getUserGamification,
  getAllAchievements,
  getUserAchievements,
  getRecentXPTransactions,
  getWeeklyXPData,
  getActiveChallenges,
  getGamificationPageData,
} from './queries'

export type { GamificationPageData } from './queries'

// Actions (write)
export {
  awardXP,
  updateStreak,
  awardArticleXP,
  awardQuizXP,
  awardJournalXP,
  awardExerciseXP,
  awardShadowWorkXP,
} from './actions'

// Constants
export { XP_REWARDS, LEVEL_THRESHOLDS, getLevelForXp } from './constants'
export type { DBGamificationRecord } from './constants'
