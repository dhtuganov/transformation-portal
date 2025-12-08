import type { MBTIType } from '@/types/database'
import type { TypeProfile, TypeProfiles } from '../types'

// Import NF types
import { ENFP_PROFILE, INFP_PROFILE, ENFJ_PROFILE, INFJ_PROFILE } from './nf-types'

// Import NT types
import { ENTJ_PROFILE, INTJ_PROFILE, ENTP_PROFILE, INTP_PROFILE } from './nt-types'

// Import SJ types
import { ISTJ_PROFILE, ISFJ_PROFILE, ESTJ_PROFILE, ESFJ_PROFILE } from './sj-types'

// Import SP types
import { ISTP_PROFILE, ISFP_PROFILE, ESTP_PROFILE, ESFP_PROFILE } from './sp-types'

// Combined profiles object
export const TYPE_PROFILES: TypeProfiles = {
  // NF - Idealists
  ENFP: ENFP_PROFILE,
  INFP: INFP_PROFILE,
  ENFJ: ENFJ_PROFILE,
  INFJ: INFJ_PROFILE,

  // NT - Rationals
  ENTJ: ENTJ_PROFILE,
  INTJ: INTJ_PROFILE,
  ENTP: ENTP_PROFILE,
  INTP: INTP_PROFILE,

  // SJ - Guardians
  ISTJ: ISTJ_PROFILE,
  ISFJ: ISFJ_PROFILE,
  ESTJ: ESTJ_PROFILE,
  ESFJ: ESFJ_PROFILE,

  // SP - Artisans
  ISTP: ISTP_PROFILE,
  ISFP: ISFP_PROFILE,
  ESTP: ESTP_PROFILE,
  ESFP: ESFP_PROFILE,
}

// Helper function to get profile by type
export function getTypeProfile(type: MBTIType): TypeProfile {
  return TYPE_PROFILES[type]
}

// Export individual profiles for direct imports
export {
  // NF
  ENFP_PROFILE,
  INFP_PROFILE,
  ENFJ_PROFILE,
  INFJ_PROFILE,
  // NT
  ENTJ_PROFILE,
  INTJ_PROFILE,
  ENTP_PROFILE,
  INTP_PROFILE,
  // SJ
  ISTJ_PROFILE,
  ISFJ_PROFILE,
  ESTJ_PROFILE,
  ESFJ_PROFILE,
  // SP
  ISTP_PROFILE,
  ISFP_PROFILE,
  ESTP_PROFILE,
  ESFP_PROFILE,
}
