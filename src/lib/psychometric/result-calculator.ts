// Assessment Result Calculator
// Convert theta estimates to MBTI types with confidence scores and type probabilities

import type {
  MBTIType,
  MBTIDimension,
  ThetaEstimate,
  DimensionResult,
  TypeProbability,
  PreferenceClarity,
  CognitiveFunctionScore,
  CognitiveFunction,
  AssessmentResult,
  AdaptiveSession,
  AssessmentValidity,
} from '@/types/psychometric'
import { MBTI_FUNCTION_STACKS } from '@/types/psychometric'
import { calculateConfidence, calculateConfidenceInterval } from './theta-estimation'

// ===========================================
// THETA TO PREFERENCE
// ===========================================

/**
 * Convert theta to MBTI preference
 * Theta scale: negative = first pole (E, S, T, J), positive = second pole (I, N, F, P)
 */
export function thetaToPreference(
  theta: number,
  dimension: MBTIDimension
): { preference: string; clarity: PreferenceClarity; score: number } {
  const poles: Record<MBTIDimension, [string, string]> = {
    EI: ['E', 'I'],
    SN: ['S', 'N'],
    TF: ['T', 'F'],
    JP: ['J', 'P'],
  }

  const [poleA, poleB] = poles[dimension]
  const preference = theta < 0 ? poleA : poleB

  // Convert theta to 0-100 score (50 = balanced, 0/100 = extreme)
  const absTheta = Math.abs(theta)
  const score = Math.round(50 + (theta > 0 ? 1 : -1) * Math.min(absTheta * 16.67, 50))

  // Determine clarity based on absolute theta
  const clarity = getPreferenceClarity(absTheta)

  return { preference, clarity, score }
}

/**
 * Map theta magnitude to clarity level
 */
function getPreferenceClarity(absTheta: number): PreferenceClarity {
  if (absTheta >= 1.5) return 'very_clear'
  if (absTheta >= 1.0) return 'clear'
  if (absTheta >= 0.5) return 'moderate'
  if (absTheta >= 0.25) return 'slight'
  return 'unclear'
}

// ===========================================
// DIMENSION RESULTS
// ===========================================

/**
 * Calculate dimension result from theta estimate
 */
export function calculateDimensionResult(
  dimension: MBTIDimension,
  thetaEstimate: ThetaEstimate
): DimensionResult {
  const { preference, clarity, score } = thetaToPreference(thetaEstimate.value, dimension)
  const confidence = calculateConfidence(thetaEstimate.se)

  return {
    score,
    preference,
    confidence,
    clarity,
  }
}

// ===========================================
// MBTI TYPE DETERMINATION
// ===========================================

/**
 * Calculate MBTI type from dimension results
 */
export function calculateMBTIType(dimensions: {
  EI: DimensionResult
  SN: DimensionResult
  TF: DimensionResult
  JP: DimensionResult
}): MBTIType {
  const type = `${dimensions.EI.preference}${dimensions.SN.preference}${dimensions.TF.preference}${dimensions.JP.preference}` as MBTIType
  return type
}

// ===========================================
// TYPE PROBABILITIES
// ===========================================

/**
 * Calculate probabilities for all 16 MBTI types
 * Uses theta estimates and standard errors to model uncertainty
 */
export function calculateTypeProbabilities(
  session: AdaptiveSession
): TypeProbability[] {
  const allTypes: MBTIType[] = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP',
  ]

  const probabilities: TypeProbability[] = []

  // For each type, calculate probability based on how well it matches theta estimates
  for (const type of allTypes) {
    const probability = calculateTypeProbability(type, session)
    const confidence = calculateTypeConfidence(type, session)

    probabilities.push({
      type,
      probability,
      confidence,
    })
  }

  // Sort by probability (highest first)
  probabilities.sort((a, b) => b.probability - a.probability)

  return probabilities
}

/**
 * Calculate probability of a specific type
 */
function calculateTypeProbability(
  type: MBTIType,
  session: AdaptiveSession
): number {
  // Extract preferences from type string
  const [ei, sn, tf, jp] = type.split('') as ['E' | 'I', 'S' | 'N', 'T' | 'F', 'J' | 'P']

  // Map preferences to expected theta signs
  const expectedSigns: Record<MBTIDimension, number> = {
    EI: ei === 'E' ? -1 : 1,
    SN: sn === 'S' ? -1 : 1,
    TF: tf === 'T' ? -1 : 1,
    JP: jp === 'J' ? -1 : 1,
  }

  // Calculate probability for each dimension
  let totalLogProb = 0

  for (const dim of ['EI', 'SN', 'TF', 'JP'] as MBTIDimension[]) {
    const theta = session.theta[dim].value
    const se = session.theta[dim].se
    const expectedSign = expectedSigns[dim]

    // Probability = how likely this preference given the theta estimate
    // Use normal CDF approximation
    const z = (expectedSign * theta) / se // Positive z = strong match
    const prob = normalCDF(z)

    totalLogProb += Math.log(Math.max(prob, 0.001)) // Avoid log(0)
  }

  // Convert log probability back
  const probability = Math.exp(totalLogProb)

  return probability
}

/**
 * Calculate confidence for a specific type
 */
function calculateTypeConfidence(
  type: MBTIType,
  session: AdaptiveSession
): number {
  // Average confidence across dimensions
  let totalConfidence = 0

  for (const dim of ['EI', 'SN', 'TF', 'JP'] as MBTIDimension[]) {
    totalConfidence += calculateConfidence(session.theta[dim].se)
  }

  return totalConfidence / 4
}

/**
 * Normal CDF approximation (Zelen & Severo)
 */
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp(-z * z / 2)
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))

  return z > 0 ? 1 - prob : prob
}

// ===========================================
// COGNITIVE FUNCTIONS
// ===========================================

/**
 * Calculate cognitive function scores from MBTI type
 */
export function calculateCognitiveFunctions(
  type: MBTIType,
  dimensions: {
    EI: DimensionResult
    SN: DimensionResult
    TF: DimensionResult
    JP: DimensionResult
  }
): {
  dominant: CognitiveFunctionScore
  auxiliary: CognitiveFunctionScore
  tertiary: CognitiveFunctionScore
  inferior: CognitiveFunctionScore
  shadow: CognitiveFunctionScore[]
  developmentScores: Record<CognitiveFunction, number>
} {
  const stack = MBTI_FUNCTION_STACKS[type]

  // Calculate development scores based on preference clarity
  // Stronger preferences = higher function development
  const developmentScores = calculateFunctionDevelopment(type, dimensions)

  // Create function score objects
  const dominant: CognitiveFunctionScore = {
    function: stack.dominant,
    score: developmentScores[stack.dominant],
    position: 'dominant',
    description: 'Primary way of perceiving or judging',
  }

  const auxiliary: CognitiveFunctionScore = {
    function: stack.auxiliary,
    score: developmentScores[stack.auxiliary],
    position: 'auxiliary',
    description: 'Supporting function, balances dominant',
  }

  const tertiary: CognitiveFunctionScore = {
    function: stack.tertiary,
    score: developmentScores[stack.tertiary],
    position: 'tertiary',
    description: 'Developing function, often playful',
  }

  const inferior: CognitiveFunctionScore = {
    function: stack.inferior,
    score: developmentScores[stack.inferior],
    position: 'inferior',
    description: 'Least developed, area of growth',
  }

  const shadow: CognitiveFunctionScore[] = stack.shadow.map(fn => ({
    function: fn,
    score: developmentScores[fn],
    position: 'shadow' as const,
    description: 'Unconscious, appears under stress',
  }))

  return {
    dominant,
    auxiliary,
    tertiary,
    inferior,
    shadow,
    developmentScores,
  }
}

/**
 * Calculate function development scores
 */
function calculateFunctionDevelopment(
  type: MBTIType,
  dimensions: {
    EI: DimensionResult
    SN: DimensionResult
    TF: DimensionResult
    JP: DimensionResult
  }
): Record<CognitiveFunction, number> {
  const stack = MBTI_FUNCTION_STACKS[type]

  // Base scores by position
  const baseScores = {
    [stack.dominant]: 85,
    [stack.auxiliary]: 70,
    [stack.tertiary]: 40,
    [stack.inferior]: 25,
    [stack.shadow[0]]: 20,
    [stack.shadow[1]]: 15,
    [stack.shadow[2]]: 15,
    [stack.shadow[3]]: 10,
  }

  // Adjust based on preference clarity
  const adjustments = {
    very_clear: 10,
    clear: 5,
    moderate: 0,
    slight: -5,
    unclear: -10,
  }

  // Apply adjustments
  const scores = { ...baseScores }

  // Adjust perceiving functions (N/S)
  const snAdjustment = adjustments[dimensions.SN.clarity]
  if (type.includes('N')) {
    if (stack.dominant === 'Ni' || stack.dominant === 'Ne') scores[stack.dominant] += snAdjustment
    if (stack.auxiliary === 'Ni' || stack.auxiliary === 'Ne') scores[stack.auxiliary] += snAdjustment
  } else {
    if (stack.dominant === 'Si' || stack.dominant === 'Se') scores[stack.dominant] += snAdjustment
    if (stack.auxiliary === 'Si' || stack.auxiliary === 'Se') scores[stack.auxiliary] += snAdjustment
  }

  // Adjust judging functions (T/F)
  const tfAdjustment = adjustments[dimensions.TF.clarity]
  if (type.includes('F')) {
    if (stack.dominant === 'Fi' || stack.dominant === 'Fe') scores[stack.dominant] += tfAdjustment
    if (stack.auxiliary === 'Fi' || stack.auxiliary === 'Fe') scores[stack.auxiliary] += tfAdjustment
  } else {
    if (stack.dominant === 'Ti' || stack.dominant === 'Te') scores[stack.dominant] += tfAdjustment
    if (stack.auxiliary === 'Ti' || stack.auxiliary === 'Te') scores[stack.auxiliary] += tfAdjustment
  }

  return scores as Record<CognitiveFunction, number>
}

// ===========================================
// FINAL RESULT ASSEMBLY
// ===========================================

/**
 * Create complete assessment result from session
 */
export function createAssessmentResult(
  session: AdaptiveSession,
  validity: AssessmentValidity,
  totalTimeSeconds: number
): Omit<AssessmentResult, 'id' | 'createdAt'> {
  // Calculate dimension results
  const dimensions = {
    EI: calculateDimensionResult('EI', session.theta.EI),
    SN: calculateDimensionResult('SN', session.theta.SN),
    TF: calculateDimensionResult('TF', session.theta.TF),
    JP: calculateDimensionResult('JP', session.theta.JP),
  }

  // Determine MBTI type
  const mbtiType = calculateMBTIType(dimensions)

  // Calculate cognitive functions
  const cognitiveFunctions = calculateCognitiveFunctions(mbtiType, dimensions)

  // Calculate type probabilities
  const typeProbabilities = calculateTypeProbabilities(session)

  // Calculate total items
  const totalItems = Object.values(session.itemsAdministered).reduce((sum, count) => sum + count, 0)

  return {
    userId: session.userId,
    tenantId: session.tenantId,
    sessionId: session.id,
    mbtiType,
    dimensions,
    cognitiveFunctions,
    typeProbabilities,
    validity,
    assessmentVersion: '1.0',
    algorithm: 'adaptive_irt',
    totalItems,
    totalTimeSeconds,
    isPrimary: true,
  }
}

/**
 * Calculate overall confidence (average across dimensions)
 */
export function calculateOverallConfidence(dimensions: {
  EI: DimensionResult
  SN: DimensionResult
  TF: DimensionResult
  JP: DimensionResult
}): number {
  const confidences = [
    dimensions.EI.confidence,
    dimensions.SN.confidence,
    dimensions.TF.confidence,
    dimensions.JP.confidence,
  ]

  return confidences.reduce((sum, c) => sum + c, 0) / confidences.length
}
