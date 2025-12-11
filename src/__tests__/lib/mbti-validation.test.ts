import { describe, it, expect } from 'vitest'

// MBTI validation utilities
const VALID_MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
] as const

type MBTIType = typeof VALID_MBTI_TYPES[number]

function isValidMBTI(type: string): type is MBTIType {
  return VALID_MBTI_TYPES.includes(type as MBTIType)
}

function parseMBTI(type: string): {
  energyOrientation: 'E' | 'I'
  informationGathering: 'S' | 'N'
  decisionMaking: 'T' | 'F'
  lifestyle: 'J' | 'P'
} | null {
  if (!isValidMBTI(type)) return null
  
  return {
    energyOrientation: type[0] as 'E' | 'I',
    informationGathering: type[1] as 'S' | 'N',
    decisionMaking: type[2] as 'T' | 'F',
    lifestyle: type[3] as 'J' | 'P'
  }
}

describe('MBTI Type Validation', () => {
  it('should validate correct MBTI types', () => {
    expect(isValidMBTI('INTJ')).toBe(true)
    expect(isValidMBTI('ESFP')).toBe(true)
    expect(isValidMBTI('ENFJ')).toBe(true)
  })

  it('should reject invalid MBTI types', () => {
    expect(isValidMBTI('XXXX')).toBe(false)
    expect(isValidMBTI('INTE')).toBe(false)
    expect(isValidMBTI('ABCD')).toBe(false)
    expect(isValidMBTI('')).toBe(false)
  })

  it('should parse MBTI components correctly', () => {
    const parsed = parseMBTI('INTJ')
    expect(parsed).toEqual({
      energyOrientation: 'I',
      informationGathering: 'N',
      decisionMaking: 'T',
      lifestyle: 'J'
    })
  })

  it('should return null for invalid MBTI types', () => {
    expect(parseMBTI('INVALID')).toBeNull()
  })

  it('should have exactly 16 valid MBTI types', () => {
    expect(VALID_MBTI_TYPES).toHaveLength(16)
  })

  it('should cover all combinations', () => {
    const energies = ['E', 'I']
    const information = ['S', 'N']
    const decisions = ['T', 'F']
    const lifestyles = ['J', 'P']
    
    const expectedCombinations = energies.length * information.length * decisions.length * lifestyles.length
    expect(VALID_MBTI_TYPES).toHaveLength(expectedCombinations)
  })

  it('should reject lowercase MBTI types', () => {
    expect(isValidMBTI('intj')).toBe(false)
  })

  it('should reject MBTI types with extra characters', () => {
    expect(isValidMBTI('INTJ-A')).toBe(false)
    expect(isValidMBTI('INTJ ')).toBe(false)
  })
})
