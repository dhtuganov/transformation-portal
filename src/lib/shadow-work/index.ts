/**
 * Shadow Work Module
 * 8-week program for inferior function integration
 */

// Types
export type * from './types'

// Program structure and logic
export {
  getInferiorFunction,
  getDominantFunction,
  INFERIOR_FUNCTION_MAP,
  FUNCTION_DESCRIPTIONS,
  WEEK_THEMES,
  getProgramWeeks,
  calculateIntegrationLevel,
  getNextWeek,
  isWeekUnlocked
} from './program'

// Exercises
export {
  EXERCISES_BY_FUNCTION,
  getExercisesForWeek,
  getAllExercises,
  getExerciseById,
  getRecommendedExercises,
  getNextExercise
} from './exercises'

// Progress tracking
export {
  initializeShadowWorkProgram,
  initializeShadowWorkProfile,
  completeExercise,
  completeWeeklyReflection,
  advanceToNextWeek,
  calculateStreak,
  getWeekCompletionPercentage,
  getOverallCompletionPercentage,
  updateIntegrationLevel,
  addTrigger,
  addBehaviorPattern,
  recordBreakthrough,
  updateGrowthArea,
  getExerciseRecommendations,
  getDashboardData,
  calculatePracticeHours,
  getInsightsSummary,
  canAdvanceToNextWeek,
  getWeekStatus,
  exportProgress,
  importProgress
} from './progress'
