# IRT Adaptive Testing Engine for MBTI

Psychometric assessment system using **Item Response Theory (IRT)** with adaptive item selection for accurate, efficient MBTI type determination.

## Overview

This implementation uses:
- **2PL IRT Model**: Two-Parameter Logistic model (discrimination + difficulty)
- **EAP Estimation**: Expected A Posteriori (Bayesian) theta estimation
- **Maximum Information**: Item selection criterion for optimal precision
- **Adaptive Stopping**: SE threshold + min/max items per dimension

## Architecture

```
psychometric/
├── adaptive-engine.ts      # Main engine (item selection, stopping rules)
├── theta-estimation.ts     # EAP estimation with Bayesian inference
├── validity-detection.ts   # Anti-faking detection (time, consistency, SD)
├── result-calculator.ts    # Final scoring and type probabilities
├── item-bank.ts           # 80 calibrated items (20 per dimension)
└── index.ts               # Public API
```

## Quick Start

### 1. Initialize Session

```typescript
import { estimateTheta, selectNextItem } from '@/lib/psychometric'

// Start with prior (theta = 0, SE = 1)
const session: AdaptiveSession = {
  id: 'session-123',
  userId: 'user-456',
  tenantId: 'tenant-789',
  status: 'in_progress',
  startedAt: new Date().toISOString(),
  theta: {
    EI: { value: 0, se: 1, information: 0 },
    SN: { value: 0, se: 1, information: 0 },
    TF: { value: 0, se: 1, information: 0 },
    JP: { value: 0, se: 1, information: 0 },
  },
  itemsAdministered: { EI: 0, SN: 0, TF: 0, JP: 0 },
  validity: {
    responseTimeFlag: false,
  },
}
```

### 2. Select and Administer Items

```typescript
import { getItemsByDimension } from '@/lib/psychometric'

// Get items for current dimension
const dimension = 'EI'
const availableItems = getItemsByDimension(dimension)
const administeredIds = new Set<string>()

// Select next item (Maximum Information)
const nextItem = selectNextItem(
  session.theta.EI.value,
  availableItems,
  administeredIds,
  'maximum_information'
)

// Present item to user
console.log(nextItem.questionTextRu)
console.log('A:', nextItem.optionATextRu)
console.log('B:', nextItem.optionBTextRu)
```

### 3. Update Theta After Response

```typescript
// User responds
const response: 'A' | 'B' = 'B'
const responseTimeMs = 3500

// Build response history
const responses = [
  { item: nextItem, response },
  // ... previous responses
]

// Re-estimate theta
const newTheta = estimateTheta(responses)

// Update session
session.theta.EI = newTheta
session.itemsAdministered.EI += 1
```

### 4. Check Stopping Criteria

```typescript
import { checkStoppingCriteria, DEFAULT_ADAPTIVE_CONFIG } from '@/lib/psychometric'

const stopping = checkStoppingCriteria(
  session.itemsAdministered.EI,
  session.theta.EI.se,
  availableItems.length - administeredIds.size,
  DEFAULT_ADAPTIVE_CONFIG
)

if (stopping.shouldStop) {
  console.log(`Stopping: ${stopping.reason}`)
  // Move to next dimension
}
```

### 5. Calculate Final Results

```typescript
import {
  createAssessmentResult,
  checkValidity,
  calculateMBTIType,
} from '@/lib/psychometric'

// Validate responses
const validity = checkValidity(allResponses, itemsMap, DEFAULT_ADAPTIVE_CONFIG)

// Create assessment result
const result = createAssessmentResult(
  session,
  validity,
  totalTimeSeconds
)

console.log('MBTI Type:', result.mbtiType)
console.log('Confidence:', result.validity.isValid ? 'Valid' : 'Questionable')
console.log('Type Probabilities:', result.typeProbabilities.slice(0, 3))
```

## IRT Model

### 2PL Formula

```
P(θ) = 1 / (1 + exp(-a(θ - b)))
```

Where:
- **θ (theta)**: Latent trait level (ability)
- **a**: Discrimination parameter (0.8 - 2.0)
- **b**: Difficulty parameter (-2.0 to +2.0)

### Information Function

```
I(θ) = a² × P(θ) × Q(θ)
```

Where:
- **Q(θ) = 1 - P(θ)**
- Higher information = more precise measurement

### EAP Estimation

Bayesian estimation with **standard normal prior** N(0, 1):

```
θ_EAP = ∫ θ × L(θ|responses) × P(θ) dθ / ∫ L(θ|responses) × P(θ) dθ
```

Numerical integration: 41 quadrature points from -4 to +4.

## Item Bank

### Statistics

- **Total Items**: 80 (20 per dimension)
- **Languages**: Russian (primary), English (secondary)
- **Sources**: MBTI Form M, MBTI Step II, Custom

### IRT Parameters by Dimension

| Dimension | Avg Discrimination | Difficulty Range | High SD Items |
|-----------|-------------------|------------------|---------------|
| E/I       | 1.57              | -1.2 to 1.0      | 2/20          |
| S/N       | 1.64              | -0.7 to 1.1      | 2/20          |
| T/F       | 1.68              | -0.7 to 1.0      | 8/20          |
| J/P       | 1.68              | -0.7 to 0.9      | 2/20          |

### Sample Item

```typescript
{
  itemCode: 'EI-002',
  dimension: 'EI',
  questionTextRu: 'После долгого дня общения я чувствую себя...',
  optionATextRu: 'Воодушевлённым и энергичным',  // Extraversion
  optionBTextRu: 'Уставшим и нуждающимся в отдыхе',  // Introversion
  irt: {
    discrimination: 1.8,  // High discrimination (informative item)
    difficulty: -0.5,     // Slightly easier to endorse E
    guessing: 0,          // No guessing (forced choice)
  },
  socialDesirabilityRisk: 'low',
  reverseScored: false,
}
```

## Adaptive Strategy

### Item Selection

1. **Maximum Information**: Select item with highest I(θ) at current estimate
2. **Stratified**: Balance difficulty levels for robustness
3. **Random**: For pilot testing (not recommended for production)

### Stopping Rules

Test stops when **any** of these conditions is met:

1. **SE Threshold**: Standard error ≤ 0.3 (high precision)
2. **Max Items**: 15 items per dimension (efficiency cap)
3. **Min Items**: Always administer at least 8 items (reliability floor)

### Theta-to-Score Conversion

| Theta Range | Preference | Clarity     | Score Range |
|-------------|------------|-------------|-------------|
| ≥ 1.5       | Strong I/N/F/P | Very Clear  | 75-100      |
| 1.0 - 1.5   | Clear I/N/F/P  | Clear       | 67-74       |
| 0.5 - 1.0   | Moderate I/N/F/P | Moderate    | 59-66       |
| 0.25 - 0.5  | Slight I/N/F/P | Slight      | 54-58       |
| -0.25 - 0.25| Balanced      | Unclear     | 46-53       |
| -0.5 - -0.25| Slight E/S/T/J | Slight      | 42-45       |
| -1.0 - -0.5 | Moderate E/S/T/J | Moderate    | 34-41       |
| -1.5 - -1.0 | Clear E/S/T/J  | Clear       | 26-33       |
| ≤ -1.5      | Strong E/S/T/J | Very Clear  | 0-25        |

## Validity Detection

### Response Time Analysis

- **Too Fast**: < 500ms (not reading)
- **Too Slow**: > 30,000ms (distracted)
- **Flag**: If > 20% suspicious times

### Consistency Check

Compares actual responses to IRT model predictions:

```typescript
consistency = matches / totalResponses
threshold = 0.6  // Flag if below
```

### Social Desirability

Tracks responses to high-SD items (e.g., T/F dimension):

```typescript
sdScore = desirableResponses / highSDItems
threshold = 0.7  // Flag if above
```

### Pattern Detection

- **Uniform**: All A or all B
- **Alternating**: A-B-A-B-A...
- **Random**: 50/50 split with unstable theta

## Type Probabilities

Calculate probability distribution across all 16 types using theta estimates and SE:

```typescript
P(Type|θ) = ∏ P(preference_i|θ_i)
```

Example output:

```typescript
[
  { type: 'INTJ', probability: 0.82, confidence: 0.91 },
  { type: 'INFJ', probability: 0.11, confidence: 0.88 },
  { type: 'INTP', probability: 0.04, confidence: 0.85 },
  // ... 13 more types
]
```

## Cognitive Functions

Derived from MBTI type using Jungian function stacks:

```typescript
// INTJ Example
{
  dominant: { function: 'Ni', score: 90, position: 'dominant' },
  auxiliary: { function: 'Te', score: 75, position: 'auxiliary' },
  tertiary: { function: 'Fi', score: 45, position: 'tertiary' },
  inferior: { function: 'Se', score: 30, position: 'inferior' },
  shadow: [
    { function: 'Ne', score: 20 },
    { function: 'Ti', score: 15 },
    { function: 'Fe', score: 15 },
    { function: 'Si', score: 10 },
  ],
}
```

## Configuration

### Default Config

```typescript
{
  minItemsPerDimension: 8,       // Minimum reliability
  maxItemsPerDimension: 15,      // Maximum efficiency
  seThreshold: 0.3,              // Precision target
  itemSelectionMethod: 'maximum_information',
  contentBalancing: true,
  minResponseTimeMs: 500,        // Anti-speed flag
  maxResponseTimeMs: 30000,      // Anti-distraction flag
  consistencyThreshold: 0.6,     // Person fit minimum
}
```

### Custom Config Example

```typescript
const quickConfig: AdaptiveEngineConfig = {
  ...DEFAULT_ADAPTIVE_CONFIG,
  minItemsPerDimension: 5,      // Faster, less reliable
  seThreshold: 0.5,             // Lower precision
}
```

## Database Integration

### Required Tables

1. **psychometric_items**: Item bank with IRT parameters
2. **adaptive_sessions**: Session state (theta, SE, item counts)
3. **adaptive_responses**: Individual item responses with timing
4. **assessment_results**: Final MBTI results with validity

### Seeding the Database

```typescript
import { getAllItems } from '@/lib/psychometric'
import { supabase } from '@/lib/supabase'

const items = getAllItems()

// Insert items
for (const item of items) {
  await supabase.from('psychometric_items').insert({
    item_code: item.itemCode,
    dimension: item.dimension,
    question_text_ru: item.questionTextRu,
    question_text_en: item.questionTextEn,
    option_a_text_ru: item.optionATextRu,
    option_a_text_en: item.optionATextEn,
    option_b_text_ru: item.optionBTextRu,
    option_b_text_en: item.optionBTextEn,
    irt_discrimination: item.irt.discrimination,
    irt_difficulty: item.irt.difficulty,
    irt_guessing: item.irt.guessing,
    social_desirability_risk: item.socialDesirabilityRisk,
    reverse_scored: item.reverseScored,
    source: item.source,
    version: item.version,
    is_active: item.isActive,
  })
}
```

## Performance

### Efficiency

- **Average Items**: 8-12 per dimension (32-48 total)
- **Time**: 5-10 minutes (vs. 20-30 for classical MBTI)
- **Precision**: SE ≤ 0.3 (equivalent to 60+ classical items)

### Computational Cost

- **EAP Estimation**: O(n × q) where n = responses, q = quadrature points
- **Item Selection**: O(m) where m = available items
- **Total per Response**: < 10ms on modern hardware

## Testing

### Unit Tests

```bash
npm test src/lib/psychometric
```

### Integration Tests

```typescript
// Test full session
const session = await runAdaptiveTest(userId)
expect(session.itemsAdministered.EI).toBeGreaterThanOrEqual(8)
expect(session.theta.EI.se).toBeLessThanOrEqual(0.3)
```

### Validation

Compare against:
- MBTI Form M results (r > 0.85 expected)
- Manual expert assessment
- Test-retest reliability (r > 0.80 expected)

## References

### Psychometric Theory

- Embretson, S. E., & Reise, S. P. (2000). *Item Response Theory for Psychologists*
- Lord, F. M. (1980). *Applications of Item Response Theory to Practical Testing Problems*
- van der Linden, W. J., & Hambleton, R. K. (1997). *Handbook of Modern Item Response Theory*

### MBTI Research

- Myers, I. B., & McCaulley, M. H. (1985). *Manual: A Guide to the Development and Use of the Myers-Briggs Type Indicator*
- Quenk, N. L. (2009). *Essentials of Myers-Briggs Type Indicator Assessment*

### Adaptive Testing

- Wainer, H. (2000). *Computerized Adaptive Testing: A Primer*
- van der Linden, W. J., & Glas, C. A. W. (2010). *Elements of Adaptive Testing*

## License

Internal use only - Otrar Travel Portal project.

---

**Version**: 1.0
**Last Updated**: 2024-12-07
**Maintainer**: Development Team
