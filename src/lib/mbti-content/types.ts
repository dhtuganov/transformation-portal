// Type definitions for extended MBTI content
import type { MBTIType } from '@/types/database'

export interface TypeStrength {
  title: string
  description: string
}

export interface TypeChallenge {
  title: string
  description: string
  tip: string
}

export interface TeamRole {
  role: string
  contribution: string
  bestWith: string[]
}

export interface CommunicationStyle {
  withType: 'NF' | 'NT' | 'SF' | 'ST'
  typeName: string
  tips: string[]
  avoid: string[]
}

export interface StressTrigger {
  trigger: string
  reaction: string
  copingStrategy: string
}

export interface GrowthArea {
  area: string
  why: string
  exercises: string[]
}

export interface TypeProfile {
  type: MBTIType

  // Basic info
  nickname: string
  tagline: string
  portrait: string

  // Key qualities
  keyQualities: string[]

  // Strengths & Growth
  strengths: TypeStrength[]
  challenges: TypeChallenge[]

  // Work & Team
  teamRole: TeamRole
  leadershipStyle: string
  idealWorkEnvironment: string[]

  // Communication
  communicationStyles: CommunicationStyle[]

  // Stress & Conflict
  stressTriggers: StressTrigger[]
  conflictStyle: string

  // Growth
  growthAreas: GrowthArea[]

  // Career
  suitableCareers: string[]
  challengingCareers: string[]
}

export type TypeProfiles = Record<MBTIType, TypeProfile>
