// Validity Detection for Adaptive Testing
// Anti-faking detection: response time analysis, consistency checks, social desirability

import type {
  PsychometricItem,
  AdaptiveResponse,
  AdaptiveEngineConfig,
  AssessmentValidity,
} from '@/types/psychometric'
import { calculateProbability } from './theta-estimation'

// ===========================================
// VALIDITY CHECKS
// ===========================================

/**
 * Comprehensive validity check for assessment responses
 */
export function checkValidity(
  responses: AdaptiveResponse[],
  items: Map<string, PsychometricItem>,
  config: AdaptiveEngineConfig
): AssessmentValidity {
  const flags: string[] = []

  // 1. Response time analysis
  const responseTimeValid = checkResponseTimes(responses, config, flags)

  // 2. Consistency analysis (person fit)
  const consistencyScore = calculateConsistency(responses, items)
  if (consistencyScore < config.consistencyThreshold) {
    flags.push('low_consistency')
  }

  // 3. Social desirability detection
  const socialDesirabilityOk = checkSocialDesirability(responses, items, flags)

  // 4. Response pattern analysis
  checkResponsePatterns(responses, flags)

  return {
    isValid: responseTimeValid && consistencyScore >= config.consistencyThreshold && socialDesirabilityOk,
    consistencyScore,
    responseTimeValid,
    socialDesirabilityOk,
    flags,
  }
}

// ===========================================
// RESPONSE TIME ANALYSIS
// ===========================================

/**
 * Check for suspicious response times
 * Too fast = not reading, too slow = distracted
 */
function checkResponseTimes(
  responses: AdaptiveResponse[],
  config: AdaptiveEngineConfig,
  flags: string[]
): boolean {
  if (responses.length === 0) return true

  let tooFast = 0
  let tooSlow = 0

  for (const response of responses) {
    if (response.responseTimeMs < config.minResponseTimeMs) {
      tooFast++
    } else if (response.responseTimeMs > config.maxResponseTimeMs) {
      tooSlow++
    }
  }

  const fastPercent = tooFast / responses.length
  const slowPercent = tooSlow / responses.length

  // Flag if more than 20% are suspicious
  if (fastPercent > 0.2) {
    flags.push('too_fast_responses')
  }
  if (slowPercent > 0.2) {
    flags.push('too_slow_responses')
  }

  // Valid if less than 30% total suspicious times
  const suspiciousPercent = (tooFast + tooSlow) / responses.length
  return suspiciousPercent < 0.3
}

/**
 * Calculate average response time per dimension
 */
export function calculateAverageResponseTime(
  responses: AdaptiveResponse[]
): { mean: number; median: number; std: number } {
  if (responses.length === 0) {
    return { mean: 0, median: 0, std: 0 }
  }

  const times = responses.map(r => r.responseTimeMs).sort((a, b) => a - b)
  const mean = times.reduce((sum, t) => sum + t, 0) / times.length
  const median = times[Math.floor(times.length / 2)]

  // Calculate standard deviation
  const variance = times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / times.length
  const std = Math.sqrt(variance)

  return { mean, median, std }
}

// ===========================================
// CONSISTENCY ANALYSIS
// ===========================================

/**
 * Calculate response consistency (person fit statistic)
 * Measures how well responses match the IRT model predictions
 */
function calculateConsistency(
  responses: AdaptiveResponse[],
  items: Map<string, PsychometricItem>
): number {
  if (responses.length < 3) return 1 // Not enough data

  let matches = 0

  for (const response of responses) {
    const item = items.get(response.itemId)
    if (!item) continue

    // Calculate probability of choosing 'B' at the estimated theta
    const p = calculateProbability(
      response.thetaAfter,
      item.irt.discrimination,
      item.irt.difficulty
    )

    // Expected response
    const expectedResponse = p > 0.5 ? 'B' : 'A'

    // For items near 0.5 probability, either response is acceptable
    const uncertaintyRange = 0.2
    const isUncertain = Math.abs(p - 0.5) < uncertaintyRange

    if (isUncertain || response.response === expectedResponse) {
      matches++
    }
  }

  return matches / responses.length
}

/**
 * Calculate person fit statistic (lz standardized)
 * More sophisticated consistency measure
 */
export function calculatePersonFit(
  responses: AdaptiveResponse[],
  items: Map<string, PsychometricItem>
): number {
  if (responses.length < 5) return 0

  let sumLogLikelihood = 0
  let sumVariance = 0

  for (const response of responses) {
    const item = items.get(response.itemId)
    if (!item) continue

    const p = calculateProbability(
      response.thetaAfter,
      item.irt.discrimination,
      item.irt.difficulty
    )

    // Log-likelihood of actual response
    const likelihood = response.response === 'B' ? p : (1 - p)
    sumLogLikelihood += Math.log(Math.max(likelihood, 0.0001)) // Avoid log(0)

    // Variance component
    sumVariance += p * (1 - p)
  }

  // Standardize
  const expectedLogLikelihood = 0
  const variance = sumVariance
  const lz = variance > 0 ? (sumLogLikelihood - expectedLogLikelihood) / Math.sqrt(variance) : 0

  return lz
}

// ===========================================
// SOCIAL DESIRABILITY DETECTION
// ===========================================

/**
 * Check for social desirability bias
 * Detects if respondent is selecting "socially acceptable" answers
 */
function checkSocialDesirability(
  responses: AdaptiveResponse[],
  items: Map<string, PsychometricItem>,
  flags: string[]
): boolean {
  if (responses.length === 0) return true

  let highSDItems = 0
  let highSDResponses = 0

  for (const response of responses) {
    const item = items.get(response.itemId)
    if (!item) continue

    if (item.socialDesirabilityRisk === 'high') {
      highSDItems++
      // Check if response is the "desirable" one (usually option A for high SD items)
      if (response.response === 'A') {
        highSDResponses++
      }
    }
  }

  // If more than 70% of high SD items were answered "desirably", flag it
  if (highSDItems > 0) {
    const sdRate = highSDResponses / highSDItems
    if (sdRate > 0.7) {
      flags.push('possible_social_desirability')
      return false
    }
  }

  return true
}

/**
 * Calculate social desirability score
 * Higher score = more socially desirable responding
 */
export function calculateSocialDesirabilityScore(
  responses: AdaptiveResponse[],
  items: Map<string, PsychometricItem>
): number {
  if (responses.length === 0) return 0

  let sdScore = 0
  let sdItemCount = 0

  for (const response of responses) {
    const item = items.get(response.itemId)
    if (!item) continue

    // Weight by SD risk level
    const weight = item.socialDesirabilityRisk === 'high' ? 2 :
                   item.socialDesirabilityRisk === 'medium' ? 1 : 0

    if (weight > 0) {
      sdItemCount += weight
      // Assume option A is the "desirable" response for SD items
      if (response.response === 'A') {
        sdScore += weight
      }
    }
  }

  return sdItemCount > 0 ? sdScore / sdItemCount : 0
}

// ===========================================
// RESPONSE PATTERN ANALYSIS
// ===========================================

/**
 * Detect suspicious response patterns
 */
function checkResponsePatterns(
  responses: AdaptiveResponse[],
  flags: string[]
): void {
  if (responses.length < 5) return

  // Check for all-same responses
  const allA = responses.every(r => r.response === 'A')
  const allB = responses.every(r => r.response === 'B')

  if (allA || allB) {
    flags.push('uniform_responses')
    return
  }

  // Check for alternating pattern (A-B-A-B...)
  let alternatingCount = 0
  for (let i = 1; i < responses.length; i++) {
    if (responses[i].response !== responses[i - 1].response) {
      alternatingCount++
    }
  }

  const alternatingRate = alternatingCount / (responses.length - 1)
  if (alternatingRate > 0.8) {
    flags.push('alternating_pattern')
  }

  // Check for random-like responding (close to 50/50 split with high variance in theta)
  const aCount = responses.filter(r => r.response === 'A').length
  const aRate = aCount / responses.length

  if (Math.abs(aRate - 0.5) < 0.1) {
    // Close to 50/50, check if theta is stable
    const thetaValues = responses.map(r => r.thetaAfter)
    const thetaVariance = calculateVariance(thetaValues)

    if (thetaVariance > 1.0) {
      flags.push('possible_random_responding')
    }
  }
}

/**
 * Calculate variance of an array
 */
function calculateVariance(values: number[]): number {
  if (values.length < 2) return 0

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length

  return variance
}

// ===========================================
// SUMMARY STATISTICS
// ===========================================

/**
 * Calculate comprehensive validity statistics
 */
export function calculateValidityStatistics(
  responses: AdaptiveResponse[],
  items: Map<string, PsychometricItem>
): {
  totalResponses: number
  avgResponseTime: number
  consistencyScore: number
  personFit: number
  socialDesirabilityScore: number
  suspiciousPatterns: string[]
} {
  const flags: string[] = []
  const { mean } = calculateAverageResponseTime(responses)

  checkResponsePatterns(responses, flags)

  return {
    totalResponses: responses.length,
    avgResponseTime: mean,
    consistencyScore: calculateConsistency(responses, items),
    personFit: calculatePersonFit(responses, items),
    socialDesirabilityScore: calculateSocialDesirabilityScore(responses, items),
    suspiciousPatterns: flags,
  }
}
