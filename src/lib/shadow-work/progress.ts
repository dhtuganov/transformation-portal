import type {
  ShadowWorkProgram,
  ShadowWorkProfile,
  WeekProgress,
  ExerciseCompletion,
  WeekNumber,
  ExerciseRecommendation,
  ShadowWorkDashboardData
} from './types'
import type { MBTIType } from '@/types/database'
import {
  getInferiorFunction,
  getDominantFunction,
  calculateIntegrationLevel,
  getProgramWeeks,
  FUNCTION_DESCRIPTIONS
} from './program'
import {
  getExercisesForWeek,
  getAllExercises,
  getRecommendedExercises,
  getNextExercise,
  getExerciseById
} from './exercises'
import { COGNITIVE_FUNCTIONS } from '@/lib/mbti'

/**
 * Shadow Work Progress Tracking
 * Functions for managing user progress through the program
 */

// Initialize new program for user
export function initializeShadowWorkProgram(
  userId: string,
  mbtiType: MBTIType
): ShadowWorkProgram {
  const inferiorFunction = getInferiorFunction(mbtiType)
  const weeks = getProgramWeeks(mbtiType)

  return {
    userId,
    mbtiType,
    inferiorFunction,
    startDate: new Date(),
    currentWeek: 1,
    weeks,
    progress: [],
    overallInsights: [],
    streakDays: 0,
    totalExercisesCompleted: 0,
    lastActivityDate: new Date()
  }
}

// Initialize user profile
export function initializeShadowWorkProfile(
  userId: string,
  mbtiType: MBTIType
): ShadowWorkProfile {
  const functions = COGNITIVE_FUNCTIONS[mbtiType]

  return {
    userId,
    mbtiType,
    inferiorFunction: functions.inferior as 'Ni' | 'Ne' | 'Si' | 'Se' | 'Ti' | 'Te' | 'Fi' | 'Fe',
    dominantFunction: functions.dominant as 'Ni' | 'Ne' | 'Si' | 'Se' | 'Ti' | 'Te' | 'Fi' | 'Fe',
    auxiliaryFunction: functions.auxiliary as 'Ni' | 'Ne' | 'Si' | 'Se' | 'Ti' | 'Te' | 'Fi' | 'Fe',
    tertiaryFunction: functions.tertiary as 'Ni' | 'Ne' | 'Si' | 'Se' | 'Ti' | 'Te' | 'Fi' | 'Fe',
    integrationLevel: 0,
    commonTriggers: [],
    behaviorPatterns: [],
    programStartDate: new Date(),
    currentWeek: 1,
    completedWeeks: 0,
    totalPracticeHours: 0,
    breakthroughs: [],
    growthAreas: []
  }
}

// Complete an exercise
export function completeExercise(
  program: ShadowWorkProgram,
  exerciseId: string,
  actualDuration: number,
  notes?: string,
  insights?: string[],
  difficulty?: 'easy' | 'medium' | 'hard',
  willRepeat?: boolean
): ShadowWorkProgram {
  const completion: ExerciseCompletion = {
    exerciseId,
    completedAt: new Date(),
    duration: actualDuration,
    notes,
    insights,
    difficulty,
    willRepeat
  }

  // Find or create week progress
  let weekProgress = program.progress.find(
    p => p.weekNumber === program.currentWeek
  )

  if (!weekProgress) {
    weekProgress = {
      weekNumber: program.currentWeek,
      startDate: new Date(),
      completedExercises: [],
      insights: [],
      challenges: []
    }
    program.progress.push(weekProgress)
  }

  // Add completion
  weekProgress.completedExercises.push(completion)

  // Update overall stats
  program.totalExercisesCompleted++
  program.lastActivityDate = new Date()

  // Update streak
  program.streakDays = calculateStreak(program)

  // Add insights to overall if provided
  if (insights) {
    program.overallInsights.push(...insights)
  }

  return program
}

// Complete weekly reflection
export function completeWeeklyReflection(
  program: ShadowWorkProgram,
  weekNumber: WeekNumber,
  answers: Record<string, string>
): ShadowWorkProgram {
  const weekProgress = program.progress.find(p => p.weekNumber === weekNumber)

  if (!weekProgress) {
    throw new Error(`Week ${weekNumber} not started`)
  }

  weekProgress.weeklyReflection = {
    answers,
    completedAt: new Date()
  }

  weekProgress.completedDate = new Date()

  return program
}

// Advance to next week
export function advanceToNextWeek(
  program: ShadowWorkProgram
): ShadowWorkProgram {
  if (program.currentWeek >= 8) {
    throw new Error('Already at final week')
  }

  // Check if current week is completed (at least 5 exercises)
  const currentWeekProgress = program.progress.find(
    p => p.weekNumber === program.currentWeek
  )

  if (!currentWeekProgress) {
    throw new Error('Current week not started')
  }

  const completedCount = currentWeekProgress.completedExercises.length
  if (completedCount < 5) {
    throw new Error('Need to complete at least 5 exercises to advance')
  }

  if (!currentWeekProgress.weeklyReflection) {
    throw new Error('Need to complete weekly reflection to advance')
  }

  program.currentWeek = (program.currentWeek + 1) as WeekNumber

  return program
}

// Calculate streak days
export function calculateStreak(program: ShadowWorkProgram): number {
  if (!program.lastActivityDate) return 0

  const allCompletions = program.progress.flatMap(p => p.completedExercises)
  if (allCompletions.length === 0) return 0

  // Sort by date
  const sorted = allCompletions.sort(
    (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
  )

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const completion of sorted) {
    const completionDate = new Date(completion.completedAt)
    completionDate.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor(
      (currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysDiff === streak) {
      streak++
      currentDate = completionDate
    } else if (daysDiff > streak + 1) {
      break
    }
  }

  return streak
}

// Get completion percentage for week
export function getWeekCompletionPercentage(
  program: ShadowWorkProgram,
  weekNumber: WeekNumber
): number {
  const weekExercises = getExercisesForWeek(program.mbtiType, weekNumber)
  const totalExercises = weekExercises.length

  const weekProgress = program.progress.find(p => p.weekNumber === weekNumber)
  if (!weekProgress) return 0

  const completedCount = weekProgress.completedExercises.length

  return Math.round((completedCount / totalExercises) * 100)
}

// Get overall completion percentage
export function getOverallCompletionPercentage(
  program: ShadowWorkProgram
): number {
  const allExercises = getAllExercises(program.mbtiType)
  const totalExercises = allExercises.length

  return Math.round((program.totalExercisesCompleted / totalExercises) * 100)
}

// Update integration level
export function updateIntegrationLevel(
  profile: ShadowWorkProfile,
  program: ShadowWorkProgram
): ShadowWorkProfile {
  profile.integrationLevel = calculateIntegrationLevel(
    profile.completedWeeks,
    program.totalExercisesCompleted,
    program.streakDays
  )

  return profile
}

// Add trigger
export function addTrigger(
  profile: ShadowWorkProfile,
  trigger: string
): ShadowWorkProfile {
  if (!profile.commonTriggers.includes(trigger)) {
    profile.commonTriggers.push(trigger)
  }
  return profile
}

// Add behavior pattern
export function addBehaviorPattern(
  profile: ShadowWorkProfile,
  pattern: string
): ShadowWorkProfile {
  if (!profile.behaviorPatterns.includes(pattern)) {
    profile.behaviorPatterns.push(pattern)
  }
  return profile
}

// Record breakthrough
export function recordBreakthrough(
  profile: ShadowWorkProfile,
  description: string,
  weekNumber: WeekNumber
): ShadowWorkProfile {
  profile.breakthroughs.push({
    date: new Date(),
    description,
    weekNumber
  })
  return profile
}

// Update growth area
export function updateGrowthArea(
  profile: ShadowWorkProfile,
  area: string,
  progress: number
): ShadowWorkProfile {
  const existing = profile.growthAreas.find(g => g.area === area)

  if (existing) {
    existing.progress = progress
    existing.lastUpdated = new Date()
  } else {
    profile.growthAreas.push({
      area,
      progress,
      lastUpdated: new Date()
    })
  }

  return profile
}

// Get exercise recommendations
export function getExerciseRecommendations(
  program: ShadowWorkProgram,
  profile: ShadowWorkProfile
): ExerciseRecommendation[] {
  const completedIds = program.progress
    .flatMap(p => p.completedExercises)
    .map(c => c.exerciseId)

  const recommended = getRecommendedExercises(
    program.mbtiType,
    program.currentWeek,
    completedIds
  )

  return recommended.map(exercise => {
    // Calculate relevance based on triggers and patterns
    let relevanceScore = 50 // base score

    // Boost if matches common triggers
    if (profile.commonTriggers.some(t =>
      exercise.tags?.some(tag => tag.includes(t.toLowerCase()))
    )) {
      relevanceScore += 20
    }

    // Boost if targets growth areas
    if (profile.growthAreas.some(g =>
      exercise.benefits?.some(b => b.toLowerCase().includes(g.area.toLowerCase()))
    )) {
      relevanceScore += 15
    }

    // Adjust by difficulty based on integration level
    if (profile.integrationLevel < 30 && exercise.difficulty === 'beginner') {
      relevanceScore += 10
    } else if (profile.integrationLevel >= 60 && exercise.difficulty === 'advanced') {
      relevanceScore += 10
    }

    const estimatedImpact =
      relevanceScore >= 70 ? 'high' :
      relevanceScore >= 50 ? 'medium' : 'low'

    const reason = generateRecommendationReason(exercise, profile, relevanceScore)

    return {
      exercise,
      reason,
      relevanceScore: Math.min(100, relevanceScore),
      estimatedImpact: estimatedImpact as 'low' | 'medium' | 'high'
    }
  }).sort((a, b) => b.relevanceScore - a.relevanceScore)
}

// Generate recommendation reason
function generateRecommendationReason(
  exercise: { difficulty?: string },
  profile: ShadowWorkProfile,
  score: number
): string {
  if (score >= 70) {
    return `Идеально подходит для вашего уровня интеграции (${profile.integrationLevel}%) и работает с вашими текущими триггерами`
  } else if (score >= 50) {
    return `Рекомендуется для развития ${FUNCTION_DESCRIPTIONS[profile.inferiorFunction].name}`
  } else {
    return `Базовое упражнение для начала работы с теневой функцией`
  }
}

// Get dashboard data
export function getDashboardData(
  program: ShadowWorkProgram,
  profile: ShadowWorkProfile
): ShadowWorkDashboardData {
  const currentWeek = program.weeks.find(w => w.theme.number === program.currentWeek)!

  const completedIds = program.progress
    .flatMap(p => p.completedExercises)
    .map(c => c.exerciseId)

  const todayExercises = getRecommendedExercises(
    program.mbtiType,
    program.currentWeek,
    completedIds
  ).slice(0, 3)

  const recentCompletions = program.progress
    .flatMap(p => p.completedExercises)
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
    .slice(0, 5)

  const upcomingMilestones = program.weeks
    .filter(w => w.theme.number >= program.currentWeek)
    .flatMap(w => w.milestones.map(m => ({
      week: w.theme.number,
      milestone: m,
      daysUntil: (w.theme.number - program.currentWeek) * 7
    })))
    .slice(0, 3)

  const recommendations = getExerciseRecommendations(program, profile).slice(0, 5)

  const longestStreak = Math.max(program.streakDays, 0) // TODO: store longest separately

  return {
    profile,
    currentWeek,
    todayExercises,
    recentCompletions,
    upcomingMilestones,
    recommendations,
    streakInfo: {
      current: program.streakDays,
      longest: longestStreak,
      lastActivityDate: program.lastActivityDate
    }
  }
}

// Calculate total practice hours
export function calculatePracticeHours(program: ShadowWorkProgram): number {
  const totalMinutes = program.progress
    .flatMap(p => p.completedExercises)
    .reduce((sum, c) => sum + c.duration, 0)

  return Math.round((totalMinutes / 60) * 10) / 10 // Round to 1 decimal
}

// Get insights summary
export function getInsightsSummary(program: ShadowWorkProgram): {
  total: number
  byWeek: Record<WeekNumber, string[]>
  recent: string[]
} {
  const byWeek: Record<WeekNumber, string[]> = {} as Record<WeekNumber, string[]>

  program.progress.forEach(wp => {
    const weekInsights = wp.completedExercises
      .flatMap(c => c.insights || [])
      .concat(wp.insights)

    byWeek[wp.weekNumber] = weekInsights
  })

  const allInsights = Object.values(byWeek).flat()

  return {
    total: allInsights.length,
    byWeek,
    recent: allInsights.slice(-5)
  }
}

// Check if can advance to next week
export function canAdvanceToNextWeek(
  program: ShadowWorkProgram
): { can: boolean; reason?: string } {
  if (program.currentWeek >= 8) {
    return { can: false, reason: 'Вы уже на последней неделе программы' }
  }

  const currentWeekProgress = program.progress.find(
    p => p.weekNumber === program.currentWeek
  )

  if (!currentWeekProgress) {
    return { can: false, reason: 'Вы ещё не начали текущую неделю' }
  }

  const completedCount = currentWeekProgress.completedExercises.length
  if (completedCount < 5) {
    return {
      can: false,
      reason: `Выполните ещё ${5 - completedCount} упражнений для перехода на следующую неделю`
    }
  }

  if (!currentWeekProgress.weeklyReflection) {
    return {
      can: false,
      reason: 'Заполните еженедельную рефлексию для перехода на следующую неделю'
    }
  }

  return { can: true }
}

// Get week status
export function getWeekStatus(
  program: ShadowWorkProgram,
  weekNumber: WeekNumber
): 'locked' | 'current' | 'in-progress' | 'completed' {
  if (weekNumber > program.currentWeek) {
    return 'locked'
  }

  if (weekNumber === program.currentWeek) {
    return 'current'
  }

  const weekProgress = program.progress.find(p => p.weekNumber === weekNumber)

  if (!weekProgress) {
    return 'locked'
  }

  if (weekProgress.completedDate) {
    return 'completed'
  }

  return 'in-progress'
}

// Export progress as JSON for backup
export function exportProgress(
  program: ShadowWorkProgram,
  profile: ShadowWorkProfile
): string {
  return JSON.stringify(
    {
      program,
      profile,
      exportDate: new Date(),
      version: '1.0'
    },
    null,
    2
  )
}

// Import progress from JSON
export function importProgress(json: string): {
  program: ShadowWorkProgram
  profile: ShadowWorkProfile
} {
  const data = JSON.parse(json)

  // Convert date strings back to Date objects
  const program: ShadowWorkProgram = {
    ...data.program,
    startDate: new Date(data.program.startDate),
    lastActivityDate: data.program.lastActivityDate
      ? new Date(data.program.lastActivityDate)
      : undefined,
    progress: data.program.progress.map((wp: { startDate?: string; completedDate?: string; completedExercises: Array<{ completedAt: string }>; weeklyReflection?: { completedAt: string } }) => ({
      ...wp,
      startDate: wp.startDate ? new Date(wp.startDate) : undefined,
      completedDate: wp.completedDate ? new Date(wp.completedDate) : undefined,
      completedExercises: wp.completedExercises.map((c: { completedAt: string }) => ({
        ...c,
        completedAt: new Date(c.completedAt)
      })),
      weeklyReflection: wp.weeklyReflection
        ? {
            ...wp.weeklyReflection,
            completedAt: new Date(wp.weeklyReflection.completedAt)
          }
        : undefined
    }))
  }

  const profile: ShadowWorkProfile = {
    ...data.profile,
    programStartDate: data.profile.programStartDate
      ? new Date(data.profile.programStartDate)
      : undefined,
    breakthroughs: data.profile.breakthroughs.map((b: { date: string }) => ({
      ...b,
      date: new Date(b.date)
    })),
    growthAreas: data.profile.growthAreas.map((g: { lastUpdated: string }) => ({
      ...g,
      lastUpdated: new Date(g.lastUpdated)
    }))
  }

  return { program, profile }
}
