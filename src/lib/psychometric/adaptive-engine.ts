// Adaptive Testing Engine (IRT-based)
// Maximum Information item selection with EAP theta estimation

import type {
  MBTIDimension,
  PsychometricItem,
  ThetaEstimate,
  AdaptiveSession,
  AdaptiveResponse,
  AdaptiveEngineConfig,
} from '@/types/psychometric'

import { DEFAULT_ADAPTIVE_CONFIG } from '@/types/psychometric'

// Import from separated modules
import {
  calculateProbability,
  calculateInformation,
  calculateLikelihood,
  estimateTheta,
} from './theta-estimation'

import { checkValidity } from './validity-detection'

import { thetaToPreference } from './result-calculator'

export { DEFAULT_ADAPTIVE_CONFIG }

// Re-export commonly used functions
export {
  calculateProbability,
  calculateInformation,
  calculateLikelihood,
  estimateTheta,
  checkValidity,
  thetaToPreference,
}

// ===========================================
// ITEM SELECTION
// ===========================================

/**
 * Select next item using Maximum Information criterion
 */
export function selectNextItem(
  currentTheta: number,
  availableItems: PsychometricItem[],
  administeredItemIds: Set<string>,
  method: 'maximum_information' | 'random' | 'stratified' = 'maximum_information'
): PsychometricItem | null {
  // Filter out already administered items
  const candidates = availableItems.filter(item => !administeredItemIds.has(item.id))

  if (candidates.length === 0) {
    return null
  }

  switch (method) {
    case 'maximum_information':
      return selectMaximumInformation(currentTheta, candidates)

    case 'random':
      return candidates[Math.floor(Math.random() * candidates.length)]

    case 'stratified':
      return selectStratified(currentTheta, candidates)

    default:
      return selectMaximumInformation(currentTheta, candidates)
  }
}

/**
 * Select item with maximum information at current theta
 */
function selectMaximumInformation(
  theta: number,
  items: PsychometricItem[]
): PsychometricItem {
  let maxInfo = -Infinity
  let bestItem = items[0]

  for (const item of items) {
    const info = calculateInformation(
      theta,
      item.irt.discrimination,
      item.irt.difficulty
    )

    if (info > maxInfo) {
      maxInfo = info
      bestItem = item
    }
  }

  return bestItem
}

/**
 * Stratified selection: balances difficulty levels
 */
function selectStratified(
  theta: number,
  items: PsychometricItem[]
): PsychometricItem {
  // Divide items into difficulty strata
  const easy = items.filter(i => i.irt.difficulty < -0.5)
  const medium = items.filter(i => i.irt.difficulty >= -0.5 && i.irt.difficulty <= 0.5)
  const hard = items.filter(i => i.irt.difficulty > 0.5)

  // Select from stratum closest to current theta
  let targetStratum: PsychometricItem[]
  if (theta < -0.5) {
    targetStratum = easy.length > 0 ? easy : medium.length > 0 ? medium : hard
  } else if (theta > 0.5) {
    targetStratum = hard.length > 0 ? hard : medium.length > 0 ? medium : easy
  } else {
    targetStratum = medium.length > 0 ? medium : easy.length > 0 ? easy : hard
  }

  // From stratum, select maximum information item
  return selectMaximumInformation(theta, targetStratum)
}

// ===========================================
// STOPPING RULES
// ===========================================

export interface StoppingCriteria {
  shouldStop: boolean
  reason?: 'min_items_reached' | 'max_items_reached' | 'se_threshold' | 'no_items_left'
}

/**
 * Check if testing should stop for a dimension
 */
export function checkStoppingCriteria(
  itemsAdministered: number,
  currentSE: number,
  availableItems: number,
  config: AdaptiveEngineConfig
): StoppingCriteria {
  // Not enough items yet
  if (itemsAdministered < config.minItemsPerDimension) {
    return { shouldStop: false }
  }

  // No more items available
  if (availableItems === 0) {
    return { shouldStop: true, reason: 'no_items_left' }
  }

  // Maximum items reached
  if (itemsAdministered >= config.maxItemsPerDimension) {
    return { shouldStop: true, reason: 'max_items_reached' }
  }

  // SE threshold reached (good precision)
  if (currentSE <= config.seThreshold) {
    return { shouldStop: true, reason: 'se_threshold' }
  }

  return { shouldStop: false }
}

// ===========================================
// VALIDITY DETECTION
// ===========================================

// Moved to validity-detection.ts
// Re-exported at top of file

// ===========================================
// SESSION MANAGEMENT
// ===========================================

/**
 * Determine which dimension to test next
 */
export function selectNextDimension(
  session: AdaptiveSession,
  config: AdaptiveEngineConfig
): MBTIDimension | null {
  const dimensions: MBTIDimension[] = ['EI', 'SN', 'TF', 'JP']

  // Find dimensions that haven't reached stopping criteria
  const activeDimensions = dimensions.filter(dim => {
    const itemCount = session.itemsAdministered[dim]
    const se = session.theta[dim].se

    if (itemCount >= config.maxItemsPerDimension) return false
    if (itemCount >= config.minItemsPerDimension && se <= config.seThreshold) return false

    return true
  })

  if (activeDimensions.length === 0) {
    return null // All dimensions complete
  }

  // Prioritize dimensions with fewer items
  activeDimensions.sort((a, b) =>
    session.itemsAdministered[a] - session.itemsAdministered[b]
  )

  return activeDimensions[0]
}

/**
 * Check if assessment is complete
 */
export function isAssessmentComplete(
  session: AdaptiveSession,
  config: AdaptiveEngineConfig
): boolean {
  const dimensions: MBTIDimension[] = ['EI', 'SN', 'TF', 'JP']

  return dimensions.every(dim => {
    const itemCount = session.itemsAdministered[dim]
    const se = session.theta[dim].se

    return (
      itemCount >= config.maxItemsPerDimension ||
      (itemCount >= config.minItemsPerDimension && se <= config.seThreshold)
    )
  })
}

// ===========================================
// RESULT CALCULATION
// ===========================================

// Moved to result-calculator.ts
// Re-exported at top of file
