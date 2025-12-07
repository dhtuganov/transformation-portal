// Psychometric Assessment Library - Main Exports
// IRT-based adaptive testing for MBTI

// Core engine
export {
  selectNextItem,
  checkStoppingCriteria,
  selectNextDimension,
  isAssessmentComplete,
  DEFAULT_ADAPTIVE_CONFIG,
} from './adaptive-engine'

// Theta estimation
export {
  calculateProbability,
  calculateInformation,
  calculateLikelihood,
  estimateTheta,
  calculateConfidenceInterval,
  calculateConfidence,
} from './theta-estimation'

// Validity detection
export {
  checkValidity,
  calculateAverageResponseTime,
  calculatePersonFit,
  calculateSocialDesirabilityScore,
  calculateValidityStatistics,
} from './validity-detection'

// Result calculation
export {
  thetaToPreference,
  calculateDimensionResult,
  calculateMBTIType,
  calculateTypeProbabilities,
  calculateCognitiveFunctions,
  createAssessmentResult,
  calculateOverallConfidence,
} from './result-calculator'

// Item bank
export {
  EI_ITEMS,
  SN_ITEMS,
  TF_ITEMS,
  JP_ITEMS,
  getItemsByDimension,
  getAllItems,
  getItemBankStats,
} from './item-bank'

// Re-export types
export type {
  PsychometricItem,
  ThetaEstimate,
  AdaptiveSession,
  AdaptiveResponse,
  AdaptiveEngineConfig,
  AssessmentResult,
  DimensionResult,
  TypeProbability,
  CognitiveFunctionScore,
  MBTIDimension,
  PreferenceClarity,
} from '@/types/psychometric'
