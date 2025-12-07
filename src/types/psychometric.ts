// Psychometric Assessment System Types
// Advanced IRT-based adaptive testing for MBTI and cognitive functions

import type { MBTIType } from './database'

// Re-export MBTIType for convenience
export type { MBTIType }

// ===========================================
// COGNITIVE FUNCTIONS
// ===========================================

export type CognitiveFunction =
  | 'Ni' | 'Ne' // Intuition (Introverted/Extroverted)
  | 'Si' | 'Se' // Sensing
  | 'Ti' | 'Te' // Thinking
  | 'Fi' | 'Fe' // Feeling

export type MBTIDimension = 'EI' | 'SN' | 'TF' | 'JP'

export type PreferenceClarity = 'very_clear' | 'clear' | 'moderate' | 'slight' | 'unclear'

export type DevelopmentStage =
  | 'emergence'       // 0-6 years
  | 'crystallization' // 6-12 years
  | 'differentiation' // 12-25 years
  | 'integration'     // 25-50 years
  | 'transcendence'   // 50+ years

// ===========================================
// IRT PARAMETERS
// ===========================================

export interface IRTParameters {
  discrimination: number  // 'a' parameter (0.5 - 2.5 typical)
  difficulty: number      // 'b' parameter (-3 to +3)
  guessing: number        // 'c' parameter (usually 0 for forced choice)
}

export interface ThetaEstimate {
  value: number      // Current ability estimate
  se: number         // Standard error
  information: number // Fisher information at this point
}

// ===========================================
// PSYCHOMETRIC ITEMS
// ===========================================

export interface PsychometricItem {
  id: string
  itemCode: string  // 'EI-001', 'SN-042'
  dimension: MBTIDimension

  // Content
  questionTextRu: string
  questionTextEn?: string
  optionATextRu: string  // First pole (E, S, T, J)
  optionATextEn?: string
  optionBTextRu: string  // Second pole (I, N, F, P)
  optionBTextEn?: string

  // IRT parameters
  irt: IRTParameters

  // Validity
  socialDesirabilityRisk: 'low' | 'medium' | 'high'
  reverseScored: boolean

  // Metadata
  source?: string
  version: number
  isActive: boolean
}

// ===========================================
// ADAPTIVE SESSION
// ===========================================

export interface AdaptiveSession {
  id: string
  userId: string
  tenantId: string

  status: 'in_progress' | 'completed' | 'abandoned'
  startedAt: string
  completedAt?: string

  // Current theta estimates per dimension
  theta: {
    EI: ThetaEstimate
    SN: ThetaEstimate
    TF: ThetaEstimate
    JP: ThetaEstimate
  }

  // Items administered per dimension
  itemsAdministered: {
    EI: number
    SN: number
    TF: number
    JP: number
  }

  // Validity indicators
  validity: {
    consistencyScore?: number
    responseTimeFlag: boolean
    socialDesirabilityScore?: number
  }
}

export interface AdaptiveResponse {
  id: string
  sessionId: string
  itemId: string

  response: 'A' | 'B'
  responseTimeMs: number

  // State at time of response
  thetaBefore: number
  thetaAfter: number
  seBefore: number
  seAfter: number
  information: number

  presentationOrder: number
  answeredAt: string
}

// ===========================================
// ASSESSMENT RESULTS
// ===========================================

export interface DimensionResult {
  score: number           // -100 to 100 (negative = E/S/T/J, positive = I/N/F/P)
  preference: string      // 'E' or 'I', etc.
  confidence: number      // 0-1
  clarity: PreferenceClarity
  rawCounts?: {
    poleA: number
    poleB: number
  }
}

export interface CognitiveFunctionScore {
  function: CognitiveFunction
  score: number           // 0-100 development level
  position: 'dominant' | 'auxiliary' | 'tertiary' | 'inferior' | 'shadow'
  description: string
}

export interface TypeProbability {
  type: MBTIType
  probability: number     // 0-1
  confidence: number
}

export interface AssessmentValidity {
  isValid: boolean
  consistencyScore?: number
  responseTimeValid: boolean
  socialDesirabilityOk: boolean
  flags: string[]
}

export interface AssessmentResult {
  id: string
  userId: string
  sessionId?: string
  tenantId: string

  // Primary result
  mbtiType: MBTIType

  // Detailed dimension scores
  dimensions: {
    EI: DimensionResult
    SN: DimensionResult
    TF: DimensionResult
    JP: DimensionResult
  }

  // Cognitive functions profile
  cognitiveFunctions: {
    dominant: CognitiveFunctionScore
    auxiliary: CognitiveFunctionScore
    tertiary: CognitiveFunctionScore
    inferior: CognitiveFunctionScore
    shadow: CognitiveFunctionScore[]
    developmentScores: Record<CognitiveFunction, number>
  }

  // All 16 type probabilities
  typeProbabilities: TypeProbability[]

  // Validity metrics
  validity: AssessmentValidity

  // Metadata
  assessmentVersion: string
  algorithm: 'adaptive_irt' | 'classical' | 'hybrid'
  totalItems: number
  totalTimeSeconds: number

  isPrimary: boolean
  createdAt: string
}

// ===========================================
// COGNITIVE PROFILE
// ===========================================

export interface CognitiveProfile {
  id: string
  userId: string
  tenantId: string

  // 8 Cognitive Functions (0-100)
  scores: {
    Ni: number
    Ne: number
    Si: number
    Se: number
    Ti: number
    Te: number
    Fi: number
    Fe: number
  }

  // Function stacks
  functionStack: CognitiveFunction[]    // ["Ni", "Te", "Fi", "Se"] for INTJ
  shadowStack: CognitiveFunction[]      // ["Ne", "Ti", "Fe", "Si"] for INTJ

  // Development stage (Tiger model)
  developmentStage?: DevelopmentStage

  // Tracking
  lastAssessmentId?: string
  manuallyAdjusted: boolean

  createdAt: string
  updatedAt: string
}

// ===========================================
// FUNCTION STACK MAPPING
// ===========================================

export const MBTI_FUNCTION_STACKS: Record<MBTIType, {
  dominant: CognitiveFunction
  auxiliary: CognitiveFunction
  tertiary: CognitiveFunction
  inferior: CognitiveFunction
  shadow: [CognitiveFunction, CognitiveFunction, CognitiveFunction, CognitiveFunction]
}> = {
  INTJ: { dominant: 'Ni', auxiliary: 'Te', tertiary: 'Fi', inferior: 'Se', shadow: ['Ne', 'Ti', 'Fe', 'Si'] },
  INTP: { dominant: 'Ti', auxiliary: 'Ne', tertiary: 'Si', inferior: 'Fe', shadow: ['Te', 'Ni', 'Se', 'Fi'] },
  ENTJ: { dominant: 'Te', auxiliary: 'Ni', tertiary: 'Se', inferior: 'Fi', shadow: ['Ti', 'Ne', 'Si', 'Fe'] },
  ENTP: { dominant: 'Ne', auxiliary: 'Ti', tertiary: 'Fe', inferior: 'Si', shadow: ['Ni', 'Te', 'Fi', 'Se'] },
  INFJ: { dominant: 'Ni', auxiliary: 'Fe', tertiary: 'Ti', inferior: 'Se', shadow: ['Ne', 'Fi', 'Te', 'Si'] },
  INFP: { dominant: 'Fi', auxiliary: 'Ne', tertiary: 'Si', inferior: 'Te', shadow: ['Fe', 'Ni', 'Se', 'Ti'] },
  ENFJ: { dominant: 'Fe', auxiliary: 'Ni', tertiary: 'Se', inferior: 'Ti', shadow: ['Fi', 'Ne', 'Si', 'Te'] },
  ENFP: { dominant: 'Ne', auxiliary: 'Fi', tertiary: 'Te', inferior: 'Si', shadow: ['Ni', 'Fe', 'Ti', 'Se'] },
  ISTJ: { dominant: 'Si', auxiliary: 'Te', tertiary: 'Fi', inferior: 'Ne', shadow: ['Se', 'Ti', 'Fe', 'Ni'] },
  ISFJ: { dominant: 'Si', auxiliary: 'Fe', tertiary: 'Ti', inferior: 'Ne', shadow: ['Se', 'Fi', 'Te', 'Ni'] },
  ESTJ: { dominant: 'Te', auxiliary: 'Si', tertiary: 'Ne', inferior: 'Fi', shadow: ['Ti', 'Se', 'Ni', 'Fe'] },
  ESFJ: { dominant: 'Fe', auxiliary: 'Si', tertiary: 'Ne', inferior: 'Ti', shadow: ['Fi', 'Se', 'Ni', 'Te'] },
  ISTP: { dominant: 'Ti', auxiliary: 'Se', tertiary: 'Ni', inferior: 'Fe', shadow: ['Te', 'Si', 'Ne', 'Fi'] },
  ISFP: { dominant: 'Fi', auxiliary: 'Se', tertiary: 'Ni', inferior: 'Te', shadow: ['Fe', 'Si', 'Ne', 'Ti'] },
  ESTP: { dominant: 'Se', auxiliary: 'Ti', tertiary: 'Fe', inferior: 'Ni', shadow: ['Si', 'Te', 'Fi', 'Ne'] },
  ESFP: { dominant: 'Se', auxiliary: 'Fi', tertiary: 'Te', inferior: 'Ni', shadow: ['Si', 'Fe', 'Ti', 'Ne'] },
}

// ===========================================
// COGNITIVE FUNCTION DESCRIPTIONS
// ===========================================

export const COGNITIVE_FUNCTION_INFO: Record<CognitiveFunction, {
  name: { ru: string; en: string }
  description: { ru: string; en: string }
  color: string
  icon: string
}> = {
  Ni: {
    name: { ru: 'Интровертная интуиция', en: 'Introverted Intuition' },
    description: {
      ru: 'Глубокое понимание паттернов, предвидение, стратегическое видение',
      en: 'Deep pattern recognition, foresight, strategic vision'
    },
    color: '#8B5CF6',
    icon: '🔮'
  },
  Ne: {
    name: { ru: 'Экстравертная интуиция', en: 'Extroverted Intuition' },
    description: {
      ru: 'Генерация идей, связи между концепциями, возможности',
      en: 'Idea generation, connections between concepts, possibilities'
    },
    color: '#EC4899',
    icon: '💡'
  },
  Si: {
    name: { ru: 'Интровертное ощущение', en: 'Introverted Sensing' },
    description: {
      ru: 'Память о деталях, традиции, сравнение с прошлым опытом',
      en: 'Detailed memory, traditions, comparison with past experience'
    },
    color: '#10B981',
    icon: '📚'
  },
  Se: {
    name: { ru: 'Экстравертное ощущение', en: 'Extroverted Sensing' },
    description: {
      ru: 'Восприятие момента, физический мир, действие',
      en: 'Present moment awareness, physical world, action'
    },
    color: '#F59E0B',
    icon: '⚡'
  },
  Ti: {
    name: { ru: 'Интровертное мышление', en: 'Introverted Thinking' },
    description: {
      ru: 'Логический анализ, внутренняя модель, точность',
      en: 'Logical analysis, internal framework, precision'
    },
    color: '#3B82F6',
    icon: '🧠'
  },
  Te: {
    name: { ru: 'Экстравертное мышление', en: 'Extroverted Thinking' },
    description: {
      ru: 'Организация, эффективность, объективные критерии',
      en: 'Organization, efficiency, objective criteria'
    },
    color: '#6366F1',
    icon: '📊'
  },
  Fi: {
    name: { ru: 'Интровертное чувство', en: 'Introverted Feeling' },
    description: {
      ru: 'Личные ценности, аутентичность, внутренняя этика',
      en: 'Personal values, authenticity, internal ethics'
    },
    color: '#EF4444',
    icon: '❤️'
  },
  Fe: {
    name: { ru: 'Экстравертное чувство', en: 'Extroverted Feeling' },
    description: {
      ru: 'Социальная гармония, эмпатия, групповые ценности',
      en: 'Social harmony, empathy, group values'
    },
    color: '#14B8A6',
    icon: '🤝'
  }
}

// ===========================================
// DEVELOPMENT STAGES (Tiger Model)
// ===========================================

export const DEVELOPMENT_STAGE_INFO: Record<DevelopmentStage, {
  name: { ru: string; en: string }
  ageRange: string
  description: { ru: string; en: string }
  focus: string
}> = {
  emergence: {
    name: { ru: 'Пробуждение', en: 'Emergence' },
    ageRange: '0-6',
    description: {
      ru: 'Тип начинает проявляться, базовые предпочтения формируются',
      en: 'Type begins to emerge, basic preferences forming'
    },
    focus: 'dominant'
  },
  crystallization: {
    name: { ru: 'Кристаллизация', en: 'Crystallization' },
    ageRange: '6-12',
    description: {
      ru: 'Доминантная функция укрепляется, характер становится более определённым',
      en: 'Dominant function solidifies, character becomes more defined'
    },
    focus: 'dominant'
  },
  differentiation: {
    name: { ru: 'Дифференциация', en: 'Differentiation' },
    ageRange: '12-25',
    description: {
      ru: 'Вспомогательная функция развивается, баланс между функциями',
      en: 'Auxiliary function develops, balance between functions'
    },
    focus: 'auxiliary'
  },
  integration: {
    name: { ru: 'Интеграция', en: 'Integration' },
    ageRange: '25-50',
    description: {
      ru: 'Третичная функция и начало работы с тенью, кризис середины жизни',
      en: 'Tertiary function and beginning shadow work, midlife navigation'
    },
    focus: 'tertiary'
  },
  transcendence: {
    name: { ru: 'Трансценденция', en: 'Transcendence' },
    ageRange: '50+',
    description: {
      ru: 'Подчинённая функция становится доступной, мудрость и целостность',
      en: 'Inferior function becomes accessible, wisdom and wholeness'
    },
    focus: 'inferior'
  }
}

// ===========================================
// ADAPTIVE ENGINE CONFIGURATION
// ===========================================

export interface AdaptiveEngineConfig {
  // Stopping criteria
  minItemsPerDimension: number      // Minimum items before stopping (default: 8)
  maxItemsPerDimension: number      // Maximum items per dimension (default: 15)
  seThreshold: number               // Stop when SE drops below this (default: 0.3)

  // Item selection
  itemSelectionMethod: 'maximum_information' | 'random' | 'stratified'
  contentBalancing: boolean         // Ensure diverse item content

  // Validity detection
  minResponseTimeMs: number         // Flag if faster than this (default: 500)
  maxResponseTimeMs: number         // Flag if slower than this (default: 30000)
  consistencyThreshold: number      // Minimum consistency score (default: 0.6)
}

export const DEFAULT_ADAPTIVE_CONFIG: AdaptiveEngineConfig = {
  minItemsPerDimension: 8,
  maxItemsPerDimension: 15,
  seThreshold: 0.3,
  itemSelectionMethod: 'maximum_information',
  contentBalancing: true,
  minResponseTimeMs: 500,
  maxResponseTimeMs: 30000,
  consistencyThreshold: 0.6
}
