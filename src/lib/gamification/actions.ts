'use server'

// Gamification Server Actions
// Server-side functions for awarding XP and updating gamification stats

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { XP_REWARDS, getLevelForXp, type DBGamificationRecord } from './constants'

// ===========================================
// CORE XP FUNCTIONS
// ===========================================

interface AwardXPResult {
  success: boolean
  xpAwarded: number
  newTotalXp: number
  levelUp: boolean
  newLevel?: number
  newLevelName?: string
  error?: string
}

/**
 * Award XP to a user and update their stats
 */
export async function awardXP(
  userId: string,
  amount: number,
  source: 'article' | 'quiz' | 'achievement' | 'challenge' | 'streak' | 'exercise' | 'journal' | 'shadow_work',
  sourceId?: string,
  description?: string
): Promise<AwardXPResult> {
  const supabase = await createClient()

  try {
    // 1. Get or create user gamification record

    const { data: gamification, error: fetchError } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .single() as { data: DBGamificationRecord | null; error: { code?: string; message: string } | null }

    let currentGamification = gamification

    if (fetchError && fetchError.code === 'PGRST116') {
      // Record doesn't exist, create it

      const { data: newRecord, error: createError } = await (supabase
        .from('user_gamification') as ReturnType<typeof supabase.from>)
        .insert({ user_id: userId })
        .select()
        .single() as { data: DBGamificationRecord | null; error: { message: string } | null }

      if (createError) {
        return { success: false, xpAwarded: 0, newTotalXp: 0, levelUp: false, error: createError.message }
      }
      currentGamification = newRecord
    } else if (fetchError) {
      return { success: false, xpAwarded: 0, newTotalXp: 0, levelUp: false, error: fetchError.message }
    }

    if (!currentGamification) {
      return { success: false, xpAwarded: 0, newTotalXp: 0, levelUp: false, error: 'Failed to get gamification record' }
    }

    const oldLevel = currentGamification.level
    const newTotalXp = currentGamification.total_xp + amount
    const { level: newLevel, name: newLevelName } = getLevelForXp(newTotalXp)
    const levelUp = newLevel > oldLevel

    // 2. Update gamification stats
    const today = new Date().toISOString().split('T')[0]
    const weekStart = getWeekStart()
    const monthStart = getMonthStart()

    // Reset weekly/monthly XP if needed
    let weeklyXp = currentGamification.weekly_xp + amount
    let monthlyXp = currentGamification.monthly_xp + amount

    if (currentGamification.week_start_date !== weekStart) {
      weeklyXp = amount // Reset weekly
    }
    if (currentGamification.month_start_date !== monthStart) {
      monthlyXp = amount // Reset monthly
    }

    // Build stats update based on source
    const statsUpdate: Record<string, number | string> = {
      total_xp: newTotalXp,
      level: newLevel,
      level_name: newLevelName,
      weekly_xp: weeklyXp,
      monthly_xp: monthlyXp,
      week_start_date: weekStart,
      month_start_date: monthStart,
      last_activity_date: today,
      updated_at: new Date().toISOString(),
    }

    // Increment specific counters
    if (source === 'article') {
      statsUpdate.total_articles_read = currentGamification.total_articles_read + 1
    } else if (source === 'quiz') {
      statsUpdate.total_quizzes_completed = currentGamification.total_quizzes_completed + 1
    } else if (source === 'exercise') {
      statsUpdate.total_exercises_completed = currentGamification.total_exercises_completed + 1
    } else if (source === 'journal') {
      statsUpdate.total_journal_entries = currentGamification.total_journal_entries + 1
    } else if (source === 'challenge') {
      statsUpdate.total_challenges_completed = currentGamification.total_challenges_completed + 1
    }


    const { error: updateError } = await (supabase
      .from('user_gamification') as ReturnType<typeof supabase.from>)
      .update(statsUpdate)
      .eq('user_id', userId)

    if (updateError) {
      return { success: false, xpAwarded: 0, newTotalXp: 0, levelUp: false, error: updateError.message }
    }

    // 3. Log the XP transaction
    await (supabase.from('xp_transactions') as ReturnType<typeof supabase.from>).insert({
      user_id: userId,
      amount,
      source,
      source_id: sourceId,
      description,
    })

    // 4. Revalidate relevant paths
    revalidatePath('/dashboard/profile/achievements')
    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard')

    return {
      success: true,
      xpAwarded: amount,
      newTotalXp,
      levelUp,
      newLevel: levelUp ? newLevel : undefined,
      newLevelName: levelUp ? newLevelName : undefined,
    }
  } catch (error) {
    console.error('Error awarding XP:', error)
    return {
      success: false,
      xpAwarded: 0,
      newTotalXp: 0,
      levelUp: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ===========================================
// STREAK MANAGEMENT
// ===========================================

interface UpdateStreakResult {
  success: boolean
  currentStreak: number
  longestStreak: number
  streakBroken: boolean
  streakBonus: number
  error?: string
}

/**
 * Update user's streak based on activity
 */
export async function updateStreak(userId: string): Promise<UpdateStreakResult> {
  const supabase = await createClient()

  try {

    const { data: gamification, error: fetchError } = await supabase
      .from('user_gamification')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('user_id', userId)
      .single() as { data: Pick<DBGamificationRecord, 'current_streak' | 'longest_streak' | 'last_activity_date'> | null; error: { message: string } | null }

    if (fetchError || !gamification) {
      return {
        success: false,
        currentStreak: 0,
        longestStreak: 0,
        streakBroken: false,
        streakBonus: 0,
        error: fetchError?.message || 'No gamification record',
      }
    }

    const today = new Date().toISOString().split('T')[0]
    const lastActivity = gamification.last_activity_date
    let currentStreak = gamification.current_streak
    let longestStreak = gamification.longest_streak
    let streakBroken = false
    let streakBonus = 0

    if (lastActivity === today) {
      // Already active today, no change needed
      return {
        success: true,
        currentStreak,
        longestStreak,
        streakBroken: false,
        streakBonus: 0,
      }
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastActivity === yesterdayStr) {
      // Continue streak
      currentStreak += 1
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak
      }
      // Calculate streak bonus (capped at max)
      streakBonus = Math.min(currentStreak * XP_REWARDS.STREAK_BONUS_BASE, XP_REWARDS.STREAK_BONUS_MAX)
    } else if (lastActivity && lastActivity < yesterdayStr) {
      // Streak broken
      streakBroken = true
      currentStreak = 1 // Start new streak
    } else {
      // First activity ever
      currentStreak = 1
    }

    // Update streak in database

    const { error: updateError } = await (supabase
      .from('user_gamification') as ReturnType<typeof supabase.from>)
      .update({
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (updateError) {
      return {
        success: false,
        currentStreak: 0,
        longestStreak: 0,
        streakBroken: false,
        streakBonus: 0,
        error: updateError.message,
      }
    }

    // Award streak bonus XP if applicable
    if (streakBonus > 0) {
      await awardXP(userId, streakBonus, 'streak', undefined, `Бонус за ${currentStreak} дней подряд`)
    }

    revalidatePath('/dashboard/profile/achievements')

    return {
      success: true,
      currentStreak,
      longestStreak,
      streakBroken,
      streakBonus,
    }
  } catch (error) {
    console.error('Error updating streak:', error)
    return {
      success: false,
      currentStreak: 0,
      longestStreak: 0,
      streakBroken: false,
      streakBonus: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ===========================================
// CONVENIENCE FUNCTIONS
// ===========================================

/**
 * Award XP for reading an article
 */
export async function awardArticleXP(userId: string, articleSlug: string, articleTitle?: string) {
  return awardXP(
    userId,
    XP_REWARDS.ARTICLE_READ,
    'article',
    articleSlug,
    articleTitle ? `Прочитана статья: ${articleTitle}` : 'Прочитана статья'
  )
}

/**
 * Award XP for completing a quiz
 */
export async function awardQuizXP(userId: string, quizId: string, score: number, quizTitle?: string) {
  let totalXp = XP_REWARDS.QUIZ_COMPLETED
  let description = quizTitle ? `Пройден тест: ${quizTitle}` : 'Пройден тест'

  // Bonus for perfect score
  if (score === 100) {
    totalXp += XP_REWARDS.QUIZ_PERFECT_SCORE
    description += ' (идеальный результат!)'
  }

  return awardXP(userId, totalXp, 'quiz', quizId, description)
}

/**
 * Award XP for journal entry
 */
export async function awardJournalXP(userId: string, entryId: string) {
  return awardXP(userId, XP_REWARDS.JOURNAL_ENTRY, 'journal', entryId, 'Запись в дневник')
}

/**
 * Award XP for completing an exercise
 */
export async function awardExerciseXP(userId: string, exerciseId: string, exerciseName?: string) {
  return awardXP(
    userId,
    XP_REWARDS.EXERCISE_COMPLETED,
    'exercise',
    exerciseId,
    exerciseName ? `Выполнено упражнение: ${exerciseName}` : 'Выполнено упражнение'
  )
}

/**
 * Award XP for Shadow Work progress
 */
export async function awardShadowWorkXP(
  userId: string,
  weekNumber: number,
  isComplete: boolean = false
) {
  if (isComplete) {
    return awardXP(
      userId,
      XP_REWARDS.SHADOW_WORK_COMPLETE,
      'shadow_work',
      'complete',
      'Завершена программа Shadow Work'
    )
  }

  return awardXP(
    userId,
    XP_REWARDS.SHADOW_WORK_WEEK,
    'shadow_work',
    `week-${weekNumber}`,
    `Завершена неделя ${weekNumber} Shadow Work`
  )
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function getWeekStart(): string {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust for Monday start
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split('T')[0]
}

function getMonthStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
}
