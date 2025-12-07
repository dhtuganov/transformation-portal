// Example Usage: IRT Adaptive Testing Engine
// Complete workflow from session start to final results

import type {
  AdaptiveSession,
  AdaptiveResponse,
  PsychometricItem,
  MBTIDimension,
} from '@/types/psychometric'

import {
  estimateTheta,
  selectNextItem,
  selectNextDimension,
  checkStoppingCriteria,
  isAssessmentComplete,
  checkValidity,
  createAssessmentResult,
  getItemsByDimension,
  DEFAULT_ADAPTIVE_CONFIG,
} from '@/lib/psychometric'

/**
 * Example 1: Initialize new adaptive session
 */
export function initializeSession(userId: string, tenantId: string): AdaptiveSession {
  return {
    id: crypto.randomUUID(),
    userId,
    tenantId,
    status: 'in_progress',
    startedAt: new Date().toISOString(),

    // Initial theta estimates (prior: N(0, 1))
    theta: {
      EI: { value: 0, se: 1, information: 0 },
      SN: { value: 0, se: 1, information: 0 },
      TF: { value: 0, se: 1, information: 0 },
      JP: { value: 0, se: 1, information: 0 },
    },

    // No items administered yet
    itemsAdministered: {
      EI: 0,
      SN: 0,
      TF: 0,
      JP: 0,
    },

    // Initial validity state
    validity: {
      responseTimeFlag: false,
    },
  }
}

/**
 * Example 2: Get next item to administer
 */
export function getNextItem(
  session: AdaptiveSession,
  allItems: PsychometricItem[],
  administeredItemIds: Set<string>
): { item: PsychometricItem; dimension: MBTIDimension } | null {
  // Determine which dimension to test
  const dimension = selectNextDimension(session, DEFAULT_ADAPTIVE_CONFIG)

  if (!dimension) {
    return null // Assessment complete
  }

  // Get items for this dimension
  const dimensionItems = allItems.filter(item => item.dimension === dimension)

  // Select next item using Maximum Information
  const item = selectNextItem(
    session.theta[dimension].value,
    dimensionItems,
    administeredItemIds,
    'maximum_information'
  )

  if (!item) {
    return null // No more items available
  }

  return { item, dimension }
}

/**
 * Example 3: Process user response and update theta
 */
export function processResponse(
  session: AdaptiveSession,
  dimension: MBTIDimension,
  item: PsychometricItem,
  response: 'A' | 'B',
  responseTimeMs: number,
  allResponsesForDimension: Array<{ item: PsychometricItem; response: 'A' | 'B' }>
): AdaptiveSession {
  // Add current response to history
  const responses = [
    ...allResponsesForDimension,
    { item, response },
  ]

  // Re-estimate theta using EAP
  const thetaBefore = session.theta[dimension]
  const thetaAfter = estimateTheta(responses)

  // Update session
  const updatedSession: AdaptiveSession = {
    ...session,
    theta: {
      ...session.theta,
      [dimension]: thetaAfter,
    },
    itemsAdministered: {
      ...session.itemsAdministered,
      [dimension]: session.itemsAdministered[dimension] + 1,
    },
  }

  // Store response for validity checking later
  const responseRecord: AdaptiveResponse = {
    id: crypto.randomUUID(),
    sessionId: session.id,
    itemId: item.id,
    response,
    responseTimeMs,
    thetaBefore: thetaBefore.value,
    thetaAfter: thetaAfter.value,
    seBefore: thetaBefore.se,
    seAfter: thetaAfter.se,
    information: thetaAfter.information,
    presentationOrder: session.itemsAdministered[dimension] + 1,
    answeredAt: new Date().toISOString(),
  }

  // In real app, save responseRecord to database here

  return updatedSession
}

/**
 * Example 4: Check if dimension testing should stop
 */
export function shouldStopDimension(
  session: AdaptiveSession,
  dimension: MBTIDimension,
  availableItemsCount: number
): { shouldStop: boolean; reason?: string } {
  const itemCount = session.itemsAdministered[dimension]
  const se = session.theta[dimension].se

  const stopping = checkStoppingCriteria(
    itemCount,
    se,
    availableItemsCount,
    DEFAULT_ADAPTIVE_CONFIG
  )

  return stopping
}

/**
 * Example 5: Finalize assessment and calculate results
 */
export async function finalizeAssessment(
  session: AdaptiveSession,
  allResponses: AdaptiveResponse[],
  itemsMap: Map<string, PsychometricItem>,
  startTime: Date
): Promise<{
  result: Omit<import('@/types/psychometric').AssessmentResult, 'id' | 'createdAt'>
  isValid: boolean
  warnings: string[]
}> {
  // Calculate total time
  const endTime = new Date()
  const totalTimeSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)

  // Check validity
  const validity = checkValidity(allResponses, itemsMap, DEFAULT_ADAPTIVE_CONFIG)

  // Create assessment result
  const result = createAssessmentResult(session, validity, totalTimeSeconds)

  // Collect warnings
  const warnings: string[] = []

  if (!validity.isValid) {
    warnings.push('Assessment validity is questionable')
  }

  if (validity.flags.includes('suspicious_response_times')) {
    warnings.push('Response times are suspicious (too fast or too slow)')
  }

  if (validity.flags.includes('low_consistency')) {
    warnings.push('Response consistency is below threshold')
  }

  if (validity.flags.includes('possible_social_desirability')) {
    warnings.push('Possible social desirability bias detected')
  }

  // Check if assessment is truly complete
  const isComplete = isAssessmentComplete(session, DEFAULT_ADAPTIVE_CONFIG)
  if (!isComplete) {
    warnings.push('Assessment may be incomplete (not all dimensions finished)')
  }

  return {
    result,
    isValid: validity.isValid,
    warnings,
  }
}

/**
 * Example 6: Complete workflow (simplified)
 */
export async function runAdaptiveAssessment(
  userId: string,
  tenantId: string
): Promise<void> {
  // 1. Initialize
  const session = initializeSession(userId, tenantId)
  const allItems = getItemsByDimension('EI') // In real app, load from DB
  const administeredIds = new Set<string>()
  const allResponses: AdaptiveResponse[] = []
  const responseHistory: Record<MBTIDimension, Array<{ item: PsychometricItem; response: 'A' | 'B' }>> = {
    EI: [],
    SN: [],
    TF: [],
    JP: [],
  }

  const startTime = new Date()

  // 2. Adaptive loop
  let currentSession = session

  while (!isAssessmentComplete(currentSession, DEFAULT_ADAPTIVE_CONFIG)) {
    // Get next item
    const next = getNextItem(currentSession, allItems, administeredIds)
    if (!next) break

    const { item, dimension } = next

    // Present to user (simulated)
    console.log(`\nQuestion ${administeredIds.size + 1}:`)
    console.log(item.questionTextRu)
    console.log(`A: ${item.optionATextRu}`)
    console.log(`B: ${item.optionBTextRu}`)

    // Simulate user response
    const response: 'A' | 'B' = Math.random() > 0.5 ? 'A' : 'B'
    const responseTimeMs = 2000 + Math.random() * 3000

    // Process response
    currentSession = processResponse(
      currentSession,
      dimension,
      item,
      response,
      responseTimeMs,
      responseHistory[dimension]
    )

    // Track
    administeredIds.add(item.id)
    responseHistory[dimension].push({ item, response })

    // Check stopping
    const stopping = shouldStopDimension(
      currentSession,
      dimension,
      allItems.filter(i => i.dimension === dimension && !administeredIds.has(i.id)).length
    )

    if (stopping.shouldStop) {
      console.log(`✓ Dimension ${dimension} complete: ${stopping.reason}`)
    }
  }

  // 3. Finalize
  const itemsMap = new Map(allItems.map(item => [item.id, item]))
  const { result, isValid, warnings } = await finalizeAssessment(
    currentSession,
    allResponses,
    itemsMap,
    startTime
  )

  // 4. Display results
  console.log('\n=== Assessment Results ===')
  console.log(`MBTI Type: ${result.mbtiType}`)
  console.log(`Valid: ${isValid ? 'Yes' : 'No'}`)
  console.log(`Total Items: ${result.totalItems}`)
  console.log(`Total Time: ${result.totalTimeSeconds}s`)

  console.log('\nDimension Scores:')
  Object.entries(result.dimensions).forEach(([dim, score]) => {
    console.log(`  ${dim}: ${score.preference} (clarity: ${score.clarity}, confidence: ${score.confidence.toFixed(2)})`)
  })

  console.log('\nTop 3 Type Probabilities:')
  result.typeProbabilities.slice(0, 3).forEach((tp, i) => {
    console.log(`  ${i + 1}. ${tp.type}: ${(tp.probability * 100).toFixed(1)}%`)
  })

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    warnings.forEach(w => console.log(`  - ${w}`))
  }

  console.log('\nCognitive Functions:')
  console.log(`  Dominant: ${result.cognitiveFunctions.dominant.function} (${result.cognitiveFunctions.dominant.score})`)
  console.log(`  Auxiliary: ${result.cognitiveFunctions.auxiliary.function} (${result.cognitiveFunctions.auxiliary.score})`)
  console.log(`  Tertiary: ${result.cognitiveFunctions.tertiary.function} (${result.cognitiveFunctions.tertiary.score})`)
  console.log(`  Inferior: ${result.cognitiveFunctions.inferior.function} (${result.cognitiveFunctions.inferior.score})`)
}

// Uncomment to run example
// runAdaptiveAssessment('user-123', 'tenant-456')
