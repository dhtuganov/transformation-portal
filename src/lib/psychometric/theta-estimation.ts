// EAP (Expected A Posteriori) Theta Estimation
// Bayesian estimation with normal prior for IRT adaptive testing

import type { PsychometricItem, ThetaEstimate } from '@/types/psychometric'

// ===========================================
// IRT PROBABILITY FUNCTIONS
// ===========================================

/**
 * Calculate probability of response 'B' (second pole) using 2PL model
 * P(θ) = 1 / (1 + exp(-a(θ - b)))
 */
export function calculateProbability(
  theta: number,
  discrimination: number,  // a
  difficulty: number       // b
): number {
  const exponent = -discrimination * (theta - difficulty)
  return 1 / (1 + Math.exp(exponent))
}

/**
 * Calculate Fisher Information for an item at given theta
 * I(θ) = a² * P(θ) * Q(θ)
 * where Q(θ) = 1 - P(θ)
 */
export function calculateInformation(
  theta: number,
  discrimination: number,
  difficulty: number
): number {
  const p = calculateProbability(theta, discrimination, difficulty)
  const q = 1 - p
  return discrimination * discrimination * p * q
}

/**
 * Calculate likelihood for a response
 * L(θ|response) = P(θ) if response='B', else 1-P(θ)
 */
export function calculateLikelihood(
  theta: number,
  discrimination: number,
  difficulty: number,
  response: 'A' | 'B'
): number {
  const p = calculateProbability(theta, discrimination, difficulty)
  return response === 'B' ? p : (1 - p)
}

// ===========================================
// EAP ESTIMATION
// ===========================================

/**
 * Expected A Posteriori (EAP) theta estimation
 * Uses numerical integration with standard normal prior
 *
 * @param responses - Array of item-response pairs
 * @param quadraturePoints - Number of quadrature points for integration (default: 41)
 * @returns ThetaEstimate with value, SE, and information
 */
export function estimateTheta(
  responses: { item: PsychometricItem; response: 'A' | 'B' }[],
  quadraturePoints: number = 41
): ThetaEstimate {
  // No responses: return prior mean
  if (responses.length === 0) {
    return {
      value: 0,
      se: 1,
      information: 0,
    }
  }

  // Quadrature points from -4 to 4 (covers 99.99% of normal distribution)
  const minTheta = -4
  const maxTheta = 4
  const step = (maxTheta - minTheta) / (quadraturePoints - 1)

  let numerator = 0
  let denominator = 0

  // First pass: calculate EAP estimate
  for (let i = 0; i < quadraturePoints; i++) {
    const theta = minTheta + i * step

    // Prior: standard normal N(0, 1)
    const prior = normalPDF(theta, 0, 1)

    // Likelihood: product of all response likelihoods
    let likelihood = 1
    for (const { item, response } of responses) {
      likelihood *= calculateLikelihood(
        theta,
        item.irt.discrimination,
        item.irt.difficulty,
        response
      )
    }

    // Posterior (unnormalized)
    const posterior = likelihood * prior

    numerator += theta * posterior * step
    denominator += posterior * step
  }

  const thetaEAP = numerator / denominator

  // Second pass: calculate variance for SE
  let varianceNumerator = 0
  for (let i = 0; i < quadraturePoints; i++) {
    const theta = minTheta + i * step
    const prior = normalPDF(theta, 0, 1)

    let likelihood = 1
    for (const { item, response } of responses) {
      likelihood *= calculateLikelihood(
        theta,
        item.irt.discrimination,
        item.irt.difficulty,
        response
      )
    }

    const posterior = likelihood * prior
    varianceNumerator += (theta - thetaEAP) ** 2 * posterior * step
  }

  const variance = varianceNumerator / denominator
  const se = Math.sqrt(variance)

  // Calculate total information at estimated theta
  let totalInformation = 0
  for (const { item } of responses) {
    totalInformation += calculateInformation(
      thetaEAP,
      item.irt.discrimination,
      item.irt.difficulty
    )
  }

  return {
    value: thetaEAP,
    se,
    information: totalInformation,
  }
}

/**
 * Standard normal probability density function
 */
function normalPDF(x: number, mean: number, sd: number): number {
  const variance = sd * sd
  const denominator = Math.sqrt(2 * Math.PI * variance)
  const exponent = -((x - mean) ** 2) / (2 * variance)
  return Math.exp(exponent) / denominator
}

// ===========================================
// CONFIDENCE INTERVALS
// ===========================================

/**
 * Calculate confidence interval for theta estimate
 * @param theta - Estimated theta value
 * @param se - Standard error
 * @param confidence - Confidence level (0.90, 0.95, or 0.99)
 * @returns [lower, upper] bounds
 */
export function calculateConfidenceInterval(
  theta: number,
  se: number,
  confidence: 0.90 | 0.95 | 0.99 = 0.95
): [number, number] {
  // Z-scores for confidence levels
  const zScores: Record<number, number> = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  }

  const z = zScores[confidence]
  const margin = z * se

  return [theta - margin, theta + margin]
}

/**
 * Calculate confidence score (0-1) based on standard error
 * Lower SE = higher confidence
 */
export function calculateConfidence(se: number): number {
  // Map SE to confidence:
  // SE 0.3 or less = very confident (0.9+)
  // SE 0.5 = moderate (0.7)
  // SE 1.0+ = low confidence (0.5)

  if (se <= 0.3) return 0.95
  if (se <= 0.5) return 0.85
  if (se <= 0.7) return 0.75
  if (se <= 1.0) return 0.65
  return 0.5
}
