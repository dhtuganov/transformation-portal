import type { MBTIType } from '@/types/database'

// MBTI Colors by Temperament
export const MBTI_COLORS: Record<MBTIType, string> = {
  // Analysts (NT) - Purple
  INTJ: '#7C3AED',
  INTP: '#7C3AED',
  ENTJ: '#7C3AED',
  ENTP: '#7C3AED',
  // Diplomats (NF) - Green
  INFJ: '#10B981',
  INFP: '#10B981',
  ENFJ: '#10B981',
  ENFP: '#10B981',
  // Sentinels (SJ) - Blue
  ISTJ: '#3B82F6',
  ISFJ: '#3B82F6',
  ESTJ: '#3B82F6',
  ESFJ: '#3B82F6',
  // Explorers (SP) - Orange
  ISTP: '#F97316',
  ISFP: '#F97316',
  ESTP: '#F97316',
  ESFP: '#F97316',
}

// Temperament groups
export const TEMPERAMENTS = {
  analysts: ['INTJ', 'INTP', 'ENTJ', 'ENTP'] as MBTIType[],
  diplomats: ['INFJ', 'INFP', 'ENFJ', 'ENFP'] as MBTIType[],
  sentinels: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'] as MBTIType[],
  explorers: ['ISTP', 'ISFP', 'ESTP', 'ESFP'] as MBTIType[],
}

export const TEMPERAMENT_NAMES: Record<string, { ru: string; en: string }> = {
  analysts: { ru: 'Аналитики', en: 'Analysts' },
  diplomats: { ru: 'Дипломаты', en: 'Diplomats' },
  sentinels: { ru: 'Хранители', en: 'Sentinels' },
  explorers: { ru: 'Искатели', en: 'Explorers' },
}

export const TEMPERAMENT_COLORS = {
  analysts: '#7C3AED',
  diplomats: '#10B981',
  sentinels: '#3B82F6',
  explorers: '#F97316',
}

// MBTI Type Names
export const MBTI_TYPE_NAMES: Record<MBTIType, { ru: string; en: string }> = {
  INTJ: { ru: 'Стратег', en: 'Architect' },
  INTP: { ru: 'Учёный', en: 'Logician' },
  ENTJ: { ru: 'Командир', en: 'Commander' },
  ENTP: { ru: 'Полемист', en: 'Debater' },
  INFJ: { ru: 'Активист', en: 'Advocate' },
  INFP: { ru: 'Посредник', en: 'Mediator' },
  ENFJ: { ru: 'Тренер', en: 'Protagonist' },
  ENFP: { ru: 'Борец', en: 'Campaigner' },
  ISTJ: { ru: 'Администратор', en: 'Logistician' },
  ISFJ: { ru: 'Защитник', en: 'Defender' },
  ESTJ: { ru: 'Менеджер', en: 'Executive' },
  ESFJ: { ru: 'Консул', en: 'Consul' },
  ISTP: { ru: 'Виртуоз', en: 'Virtuoso' },
  ISFP: { ru: 'Артист', en: 'Adventurer' },
  ESTP: { ru: 'Делец', en: 'Entrepreneur' },
  ESFP: { ru: 'Развлекатель', en: 'Entertainer' },
}

// Cognitive Functions by Type
export const COGNITIVE_FUNCTIONS: Record<MBTIType, {
  dominant: string
  auxiliary: string
  tertiary: string
  inferior: string
}> = {
  INTJ: { dominant: 'Ni', auxiliary: 'Te', tertiary: 'Fi', inferior: 'Se' },
  INTP: { dominant: 'Ti', auxiliary: 'Ne', tertiary: 'Si', inferior: 'Fe' },
  ENTJ: { dominant: 'Te', auxiliary: 'Ni', tertiary: 'Se', inferior: 'Fi' },
  ENTP: { dominant: 'Ne', auxiliary: 'Ti', tertiary: 'Fe', inferior: 'Si' },
  INFJ: { dominant: 'Ni', auxiliary: 'Fe', tertiary: 'Ti', inferior: 'Se' },
  INFP: { dominant: 'Fi', auxiliary: 'Ne', tertiary: 'Si', inferior: 'Te' },
  ENFJ: { dominant: 'Fe', auxiliary: 'Ni', tertiary: 'Se', inferior: 'Ti' },
  ENFP: { dominant: 'Ne', auxiliary: 'Fi', tertiary: 'Te', inferior: 'Si' },
  ISTJ: { dominant: 'Si', auxiliary: 'Te', tertiary: 'Fi', inferior: 'Ne' },
  ISFJ: { dominant: 'Si', auxiliary: 'Fe', tertiary: 'Ti', inferior: 'Ne' },
  ESTJ: { dominant: 'Te', auxiliary: 'Si', tertiary: 'Ne', inferior: 'Fi' },
  ESFJ: { dominant: 'Fe', auxiliary: 'Si', tertiary: 'Ne', inferior: 'Ti' },
  ISTP: { dominant: 'Ti', auxiliary: 'Se', tertiary: 'Ni', inferior: 'Fe' },
  ISFP: { dominant: 'Fi', auxiliary: 'Se', tertiary: 'Ni', inferior: 'Te' },
  ESTP: { dominant: 'Se', auxiliary: 'Ti', tertiary: 'Fe', inferior: 'Ni' },
  ESFP: { dominant: 'Se', auxiliary: 'Fi', tertiary: 'Te', inferior: 'Ni' },
}

// Helper functions
export function getTemperament(type: MBTIType): string {
  if (TEMPERAMENTS.analysts.includes(type)) return 'analysts'
  if (TEMPERAMENTS.diplomats.includes(type)) return 'diplomats'
  if (TEMPERAMENTS.sentinels.includes(type)) return 'sentinels'
  if (TEMPERAMENTS.explorers.includes(type)) return 'explorers'
  return 'unknown'
}

export function getTypeColor(type: MBTIType): string {
  return MBTI_COLORS[type] || '#6B7280'
}

export function getTypeName(type: MBTIType, lang: 'ru' | 'en' = 'ru'): string {
  return MBTI_TYPE_NAMES[type]?.[lang] || type
}

export function getCognitiveFunctions(type: MBTIType) {
  return COGNITIVE_FUNCTIONS[type]
}

// All MBTI types
export const ALL_MBTI_TYPES: MBTIType[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
]
