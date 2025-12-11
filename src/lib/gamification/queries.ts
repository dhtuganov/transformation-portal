// Gamification Database Queries
// Server-side functions for gamification data

import { createClient } from '@/lib/supabase/server'
import type {
  UserGamification,
  Achievement,
  UserAchievement,
  XPTransaction,
  Challenge,
  UserChallenge,
} from '@/types/gamification'

// ===========================================
// USER GAMIFICATION STATS
// ===========================================

interface DBUserGamification {
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

function mapDBToUserGamification(db: DBUserGamification): UserGamification {
  return {
    id: db.id,
    userId: db.user_id,
    tenantId: db.tenant_id,
    totalXp: db.total_xp,
    level: db.level,
    levelName: db.level_name,
    currentStreak: db.current_streak,
    longestStreak: db.longest_streak,
    lastActivityDate: db.last_activity_date,
    totalArticlesRead: db.total_articles_read,
    totalQuizzesCompleted: db.total_quizzes_completed,
    totalExercisesCompleted: db.total_exercises_completed,
    totalJournalEntries: db.total_journal_entries,
    totalChallengesCompleted: db.total_challenges_completed,
    weeklyXp: db.weekly_xp,
    monthlyXp: db.monthly_xp,
    weekStartDate: db.week_start_date,
    monthStartDate: db.month_start_date,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }
}

export async function getUserGamification(userId: string): Promise<UserGamification | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_gamification')
    .select('*')
    .eq('user_id', userId)
    .single<DBUserGamification>()

  if (error || !data) {
    // Create default record if doesn't exist
    if (error?.code === 'PGRST116') {
      return createDefaultGamification(userId)
    }
    console.error('Error fetching gamification:', error)
    return null
  }

  return mapDBToUserGamification(data)
}

function createDefaultGamification(userId: string): UserGamification {
  // Return default values for new users
  // The record will be created when they earn their first XP
  return {
    id: 'default',
    userId: userId,
    tenantId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    totalXp: 0,
    level: 1,
    levelName: 'Исследователь',
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    totalArticlesRead: 0,
    totalQuizzesCompleted: 0,
    totalExercisesCompleted: 0,
    totalJournalEntries: 0,
    totalChallengesCompleted: 0,
    weeklyXp: 0,
    monthlyXp: 0,
    weekStartDate: null,
    monthStartDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// ===========================================
// ACHIEVEMENTS
// ===========================================

interface DBAchievement {
  id: string
  code: string
  category: string
  name_ru: string
  name_en: string
  description_ru: string
  description_en: string
  icon: string
  requirement_type: string
  requirement_value: number
  requirement_context: Record<string, unknown> | null
  xp_reward: number
  badge_url: string | null
  is_hidden: boolean
  is_active: boolean
  created_at: string
}

function mapDBAchievement(db: DBAchievement): Achievement {
  return {
    id: db.id,
    code: db.code,
    category: db.category as Achievement['category'],
    nameRu: db.name_ru,
    nameEn: db.name_en,
    descriptionRu: db.description_ru,
    descriptionEn: db.description_en,
    icon: db.icon,
    requirementType: db.requirement_type as Achievement['requirementType'],
    requirementValue: db.requirement_value,
    requirementContext: db.requirement_context || undefined,
    xpReward: db.xp_reward,
    badgeUrl: db.badge_url || undefined,
    isHidden: db.is_hidden,
    isActive: db.is_active,
  }
}

export async function getAllAchievements(): Promise<Achievement[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })

  if (error) {
    console.error('Error fetching achievements:', error)
    return []
  }

  return (data as DBAchievement[]).map(mapDBAchievement)
}

// ===========================================
// USER ACHIEVEMENTS
// ===========================================

interface DBUserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string | null
  progress: number
  notified: boolean
}

function mapDBUserAchievement(db: DBUserAchievement): UserAchievement {
  return {
    id: db.id,
    userId: db.user_id,
    achievementId: db.achievement_id,
    earnedAt: db.earned_at || '',
    progress: db.progress,
    notified: db.notified,
  }
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching user achievements:', error)
    return []
  }

  return (data as DBUserAchievement[]).map(mapDBUserAchievement)
}

// ===========================================
// XP TRANSACTIONS
// ===========================================

interface DBXPTransaction {
  id: string
  user_id: string
  amount: number
  source: string
  source_id: string | null
  description: string | null
  created_at: string
}

function mapDBXPTransaction(db: DBXPTransaction): XPTransaction {
  return {
    id: db.id,
    userId: db.user_id,
    amount: db.amount,
    source: db.source as XPTransaction['source'],
    sourceId: db.source_id || undefined,
    description: db.description || undefined,
    createdAt: db.created_at,
  }
}

export async function getRecentXPTransactions(userId: string, limit = 10): Promise<XPTransaction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('xp_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching XP transactions:', error)
    return []
  }

  return (data as DBXPTransaction[]).map(mapDBXPTransaction)
}

export async function getWeeklyXPData(userId: string): Promise<{ day: string; xp: number }[]> {
  const supabase = await createClient()

  // Get transactions from last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data, error } = await supabase
    .from('xp_transactions')
    .select('amount, created_at')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching weekly XP:', error)
    return getEmptyWeekData()
  }

  // Group by day
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  const weekData: Record<string, number> = {}

  // Initialize all days with 0
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayKey = date.toISOString().split('T')[0]
    weekData[dayKey] = 0
  }

  // Sum up transactions per day
  for (const tx of data as { amount: number; created_at: string }[]) {
    const dayKey = tx.created_at.split('T')[0]
    if (weekData[dayKey] !== undefined) {
      weekData[dayKey] += tx.amount
    }
  }

  // Convert to array format
  return Object.entries(weekData).map(([date, xp]) => {
    const dayOfWeek = new Date(date).getDay()
    return { day: dayNames[dayOfWeek], xp }
  })
}

function getEmptyWeekData(): { day: string; xp: number }[] {
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return { day: dayNames[date.getDay()], xp: 0 }
  })
}

// ===========================================
// CHALLENGES
// ===========================================

interface DBChallenge {
  id: string
  tenant_id: string
  code: string
  challenge_type: string
  title_ru: string
  title_en: string
  description_ru: string
  description_en: string
  icon: string | null
  task_type: string
  task_count: number
  task_filter: Record<string, unknown> | null
  recommended_types: string[]
  xp_reward: number
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
}

function mapDBChallenge(db: DBChallenge): Challenge {
  return {
    id: db.id,
    tenantId: db.tenant_id,
    code: db.code,
    challengeType: db.challenge_type as Challenge['challengeType'],
    titleRu: db.title_ru,
    titleEn: db.title_en,
    descriptionRu: db.description_ru,
    descriptionEn: db.description_en,
    icon: db.icon || undefined,
    taskType: db.task_type as Challenge['taskType'],
    taskCount: db.task_count,
    taskFilter: db.task_filter as Challenge['taskFilter'],
    recommendedTypes: db.recommended_types,
    xpReward: db.xp_reward,
    startDate: db.start_date || undefined,
    endDate: db.end_date || undefined,
    isActive: db.is_active,
  }
}

export async function getActiveChallenges(): Promise<Challenge[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('is_active', true)
    .order('challenge_type', { ascending: true })

  if (error) {
    console.error('Error fetching challenges:', error)
    return []
  }

  return (data as DBChallenge[]).map(mapDBChallenge)
}

// ===========================================
// COMBINED DATA FOR PAGE
// ===========================================

export interface GamificationPageData {
  gamification: UserGamification
  achievements: Achievement[]
  userAchievements: UserAchievement[]
  weeklyXp: { day: string; xp: number }[]
  recentTransactions: XPTransaction[]
}

export async function getGamificationPageData(userId: string): Promise<GamificationPageData | null> {
  const [gamification, achievements, userAchievements, weeklyXp, recentTransactions] = await Promise.all([
    getUserGamification(userId),
    getAllAchievements(),
    getUserAchievements(userId),
    getWeeklyXPData(userId),
    getRecentXPTransactions(userId, 5),
  ])

  if (!gamification) {
    return null
  }

  return {
    gamification,
    achievements,
    userAchievements,
    weeklyXp,
    recentTransactions,
  }
}
