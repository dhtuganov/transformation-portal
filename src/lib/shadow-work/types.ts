import type { MBTIType } from '@/types/database'

/**
 * Shadow Work Program Types
 * 8-week program for inferior function integration
 */

// Cognitive functions (inferior/shadow)
export type CognitiveFunction = 'Se' | 'Si' | 'Ne' | 'Ni' | 'Te' | 'Ti' | 'Fe' | 'Fi'

// Week numbers in the program
export type WeekNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

// Exercise types
export type ExerciseType =
  | 'awareness'      // Осознание
  | 'reflection'     // Рефлексия
  | 'practice'       // Практика
  | 'integration'    // Интеграция
  | 'journaling'     // Ведение дневника
  | 'meditation'     // Медитация
  | 'behavioral'     // Поведенческие упражнения

// Exercise difficulty
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced'

// Exercise duration in minutes
export type ExerciseDuration = 5 | 10 | 15 | 20 | 25 | 30 | 45 | 60

// Exercise interface
export interface Exercise {
  id: string
  type: ExerciseType
  title: string
  description: string
  duration: ExerciseDuration
  difficulty: ExerciseDifficulty
  instructions: string[]
  targetFunction: CognitiveFunction
  compatibleTypes: MBTIType[]
  reflectionPrompts?: string[]
  benefits?: string[]
  tags?: string[]
}

// Weekly theme
export interface WeekTheme {
  number: WeekNumber
  title: string
  subtitle: string
  focus: string
  goal: string
  description: string
  keyPoints: string[]
}

// Week in the program
export interface Week {
  theme: WeekTheme
  dailyExercises: Exercise[]
  weeklyReflection: {
    prompt: string
    questions: string[]
  }
  readingMaterial?: string // Path to MDX content
  milestones: string[]
}

// Program progress tracking
export interface ExerciseCompletion {
  exerciseId: string
  completedAt: Date
  duration: number // actual time spent
  notes?: string
  insights?: string[]
  difficulty?: 'easy' | 'medium' | 'hard'
  willRepeat?: boolean
}

export interface WeekProgress {
  weekNumber: WeekNumber
  startDate?: Date
  completedDate?: Date
  completedExercises: ExerciseCompletion[]
  weeklyReflection?: {
    answers: Record<string, string>
    completedAt: Date
  }
  insights: string[]
  challenges: string[]
}

// Main program state
export interface ShadowWorkProgram {
  userId: string
  mbtiType: MBTIType
  inferiorFunction: CognitiveFunction
  startDate: Date
  currentWeek: WeekNumber
  weeks: Week[]
  progress: WeekProgress[]
  overallInsights: string[]
  streakDays: number
  totalExercisesCompleted: number
  lastActivityDate?: Date
}

// User's shadow work profile
export interface ShadowWorkProfile {
  userId: string
  mbtiType: MBTIType
  inferiorFunction: CognitiveFunction
  dominantFunction: CognitiveFunction
  auxiliaryFunction: CognitiveFunction
  tertiaryFunction: CognitiveFunction

  // Shadow integration level (0-100)
  integrationLevel: number

  // Triggers and patterns
  commonTriggers: string[]
  behaviorPatterns: string[]

  // Progress metrics
  programStartDate?: Date
  currentWeek?: WeekNumber
  completedWeeks: number
  totalPracticeHours: number

  // Insights and growth
  breakthroughs: {
    date: Date
    description: string
    weekNumber: WeekNumber
  }[]

  growthAreas: {
    area: string
    progress: number // 0-100
    lastUpdated: Date
  }[]
}

// Statistics and analytics
export interface ShadowWorkStats {
  totalUsers: number
  activePrograms: number
  completionRate: number
  averageIntegrationLevel: number
  byType: Record<MBTIType, {
    participants: number
    averageCompletion: number
    averageIntegrationLevel: number
  }>
  byFunction: Record<CognitiveFunction, {
    participants: number
    commonChallenges: string[]
    successStrategies: string[]
  }>
}

// Exercise recommendation
export interface ExerciseRecommendation {
  exercise: Exercise
  reason: string
  relevanceScore: number
  estimatedImpact: 'low' | 'medium' | 'high'
}

// Dashboard view data
export interface ShadowWorkDashboardData {
  profile: ShadowWorkProfile
  currentWeek: Week
  todayExercises: Exercise[]
  recentCompletions: ExerciseCompletion[]
  upcomingMilestones: {
    week: WeekNumber
    milestone: string
    daysUntil: number
  }[]
  recommendations: ExerciseRecommendation[]
  streakInfo: {
    current: number
    longest: number
    lastActivityDate?: Date
  }
}

// Content metadata for MDX files
export interface ShadowWorkContent {
  week: WeekNumber
  title: string
  subtitle: string
  objectives: string[]
  content: string
  exercises: Exercise[]
  reflectionQuestions: string[]
  additionalResources?: {
    title: string
    url: string
    type: 'article' | 'video' | 'book' | 'tool'
  }[]
}
