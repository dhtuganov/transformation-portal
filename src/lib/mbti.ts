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

// Cognitive Function Descriptions
export const COGNITIVE_FUNCTION_DESCRIPTIONS: Record<string, {
  name: string
  shortName: string
  description: string
  strengths: string[]
  challenges: string[]
}> = {
  Ni: {
    name: 'Интровертная интуиция',
    shortName: 'Ni',
    description: 'Способность видеть глубинные паттерны и предвидеть будущее. Формирует единое видение из разрозненных данных.',
    strengths: ['Стратегическое мышление', 'Долгосрочное планирование', 'Понимание скрытых смыслов'],
    challenges: ['Чрезмерная сосредоточенность на будущем', 'Сложности с объяснением интуитивных выводов']
  },
  Ne: {
    name: 'Экстравертная интуиция',
    shortName: 'Ne',
    description: 'Генерация идей и возможностей. Видит связи между концепциями и наслаждается исследованием новых путей.',
    strengths: ['Креативность', 'Адаптивность', 'Видение возможностей'],
    challenges: ['Сложности с фокусировкой', 'Незавершённые проекты']
  },
  Ti: {
    name: 'Интровертное мышление',
    shortName: 'Ti',
    description: 'Глубокий логический анализ и построение внутренне согласованных систем. Стремится к точности понимания.',
    strengths: ['Точный анализ', 'Независимое мышление', 'Решение сложных проблем'],
    challenges: ['Перфекционизм', 'Сложности с принятием внешних авторитетов']
  },
  Te: {
    name: 'Экстравертное мышление',
    shortName: 'Te',
    description: 'Организация внешнего мира для достижения целей. Ориентация на эффективность и результаты.',
    strengths: ['Организованность', 'Достижение целей', 'Принятие решений'],
    challenges: ['Может игнорировать эмоции', 'Чрезмерная прямолинейность']
  },
  Fi: {
    name: 'Интровертное чувство',
    shortName: 'Fi',
    description: 'Глубокие личные ценности и аутентичность. Стремление жить в согласии со своими убеждениями.',
    strengths: ['Аутентичность', 'Эмпатия', 'Моральная целостность'],
    challenges: ['Чрезмерная чувствительность', 'Сложности с компромиссами']
  },
  Fe: {
    name: 'Экстравертное чувство',
    shortName: 'Fe',
    description: 'Гармонизация социальных отношений и понимание групповой динамики. Забота о благополучии других.',
    strengths: ['Социальные навыки', 'Построение команд', 'Разрешение конфликтов'],
    challenges: ['Зависимость от мнения других', 'Игнорирование собственных потребностей']
  },
  Si: {
    name: 'Интровертное ощущение',
    shortName: 'Si',
    description: 'Детальная память и опора на проверенный опыт. Ценит традиции и надёжность.',
    strengths: ['Надёжность', 'Внимание к деталям', 'Сохранение традиций'],
    challenges: ['Сопротивление изменениям', 'Чрезмерная осторожность']
  },
  Se: {
    name: 'Экстравертное ощущение',
    shortName: 'Se',
    description: 'Полное присутствие в настоящем моменте. Быстрая реакция на окружающую среду.',
    strengths: ['Наблюдательность', 'Практичность', 'Спонтанность'],
    challenges: ['Импульсивность', 'Сложности с долгосрочным планированием']
  }
}

// Type Descriptions (detailed)
export const TYPE_DESCRIPTIONS: Record<MBTIType, {
  shortDescription: string
  detailedDescription: string
  workStyle: string
  stressPattern: string
  growthPath: string
}> = {
  INTJ: {
    shortDescription: 'Независимый стратег с глубоким видением',
    detailedDescription: 'INTJ сочетают интуитивное видение с логическим анализом для создания долгосрочных стратегий. Они ценят компетентность и эффективность.',
    workStyle: 'Предпочитают работать независимо над сложными проектами. Ценят интеллектуальную автономию и чёткие цели.',
    stressPattern: 'Под стрессом могут стать чрезмерно чувствительными к физическим ощущениям или импульсивными (активация Se).',
    growthPath: 'Развитие через баланс стратегического мышления и внимания к текущему моменту.'
  },
  INTP: {
    shortDescription: 'Логический мыслитель с богатым внутренним миром',
    detailedDescription: 'INTP — это архитекторы идей, которые стремятся понять глубинные принципы мира. Они ценят точность и логическую согласованность.',
    workStyle: 'Нуждаются в интеллектуальной свободе. Лучше всего работают, когда могут исследовать идеи без временных ограничений.',
    stressPattern: 'Под стрессом могут стать эмоционально уязвимыми или чрезмерно озабоченными отношениями (активация Fe).',
    growthPath: 'Развитие через применение идей на практике и развитие эмоционального интеллекта.'
  },
  ENTJ: {
    shortDescription: 'Решительный лидер с ориентацией на результат',
    detailedDescription: 'ENTJ естественные лидеры, которые организуют людей и ресурсы для достижения амбициозных целей. Они ценят эффективность и компетентность.',
    workStyle: 'Процветают в руководящих ролях. Нуждаются в чётких целях и возможности принимать стратегические решения.',
    stressPattern: 'Под стрессом могут стать чрезмерно чувствительными или замкнутыми (активация Fi).',
    growthPath: 'Развитие через баланс достижений и заботы о личных отношениях.'
  },
  ENTP: {
    shortDescription: 'Инноватор с талантом к дебатам',
    detailedDescription: 'ENTP — генераторы идей, которые любят интеллектуальные вызовы. Они видят возможности там, где другие видят препятствия.',
    workStyle: 'Нуждаются в разнообразии и интеллектуальной стимуляции. Избегают рутины и жёстких структур.',
    stressPattern: 'Под стрессом могут стать чрезмерно сосредоточенными на деталях или прошлом (активация Si).',
    growthPath: 'Развитие через завершение начатого и внимание к практическим деталям.'
  },
  INFJ: {
    shortDescription: 'Провидец с глубокой эмпатией',
    detailedDescription: 'INFJ сочетают интуитивное понимание с заботой о людях. Они стремятся помогать другим реализовать свой потенциал.',
    workStyle: 'Нуждаются в значимой работе и гармоничных отношениях. Лучше всего работают в спокойной обстановке.',
    stressPattern: 'Под стрессом могут стать импульсивными или чрезмерно озабоченными физическими удовольствиями (активация Se).',
    growthPath: 'Развитие через баланс заботы о других и внимания к собственным потребностям.'
  },
  INFP: {
    shortDescription: 'Идеалист с богатым внутренним миром',
    detailedDescription: 'INFP руководствуются глубокими личными ценностями. Они стремятся к аутентичности и поиску смысла.',
    workStyle: 'Нуждаются в автономии и возможности работать в соответствии со своими ценностями.',
    stressPattern: 'Под стрессом могут стать чрезмерно критичными или организованными (активация Te).',
    growthPath: 'Развитие через практическую реализацию идеалов и принятие решений.'
  },
  ENFJ: {
    shortDescription: 'Харизматичный лидер с фокусом на людях',
    detailedDescription: 'ENFJ — прирождённые менторы, которые вдохновляют других на развитие. Они создают гармоничные команды.',
    workStyle: 'Процветают в ролях, где могут развивать других. Нуждаются в позитивной обратной связи.',
    stressPattern: 'Под стрессом могут стать чрезмерно критичными или отстранёнными (активация Ti).',
    growthPath: 'Развитие через баланс заботы о других и логического анализа.'
  },
  ENFP: {
    shortDescription: 'Энтузиаст с безграничной креативностью',
    detailedDescription: 'ENFP — источники энергии и идей. Они вдохновляют других и видят потенциал в каждом.',
    workStyle: 'Нуждаются в свободе и разнообразии. Избегают рутины и ограничений.',
    stressPattern: 'Под стрессом могут стать чрезмерно сосредоточенными на деталях или традициях (активация Si).',
    growthPath: 'Развитие через завершение проектов и внимание к деталям.'
  },
  ISTJ: {
    shortDescription: 'Надёжный исполнитель с вниманием к деталям',
    detailedDescription: 'ISTJ — столпы организации, которые обеспечивают стабильность и порядок. Они ценят традиции и ответственность.',
    workStyle: 'Предпочитают чёткие процедуры и конкретные задачи. Надёжны и последовательны.',
    stressPattern: 'Под стрессом могут генерировать негативные сценарии или становиться нерешительными (активация Ne).',
    growthPath: 'Развитие через открытость к новым подходам и гибкость.'
  },
  ISFJ: {
    shortDescription: 'Заботливый хранитель традиций',
    detailedDescription: 'ISFJ сочетают внимание к деталям с глубокой заботой о других. Они создают стабильную и поддерживающую среду.',
    workStyle: 'Нуждаются в структуре и возможности помогать другим. Ценят признание своего вклада.',
    stressPattern: 'Под стрессом могут становиться тревожными о будущем или видеть негативные возможности (активация Ne).',
    growthPath: 'Развитие через открытость к изменениям и выражение собственных потребностей.'
  },
  ESTJ: {
    shortDescription: 'Организатор с сильным чувством долга',
    detailedDescription: 'ESTJ — эффективные менеджеры, которые организуют людей и процессы для достижения результатов.',
    workStyle: 'Процветают в структурированной среде с чёткими целями и ответственностью.',
    stressPattern: 'Под стрессом могут стать чрезмерно эмоциональными или чувствительными (активация Fi).',
    growthPath: 'Развитие через внимание к эмоциям и индивидуальным потребностям других.'
  },
  ESFJ: {
    shortDescription: 'Гармонизатор с фокусом на команде',
    detailedDescription: 'ESFJ создают тёплую и поддерживающую атмосферу. Они заботятся о благополучии каждого члена команды.',
    workStyle: 'Нуждаются в гармоничных отношениях и чёткой структуре. Ценят признание и благодарность.',
    stressPattern: 'Под стрессом могут стать чрезмерно критичными или отстранёнными (активация Ti).',
    growthPath: 'Развитие через принятие решений на основе логики и установление личных границ.'
  },
  ISTP: {
    shortDescription: 'Мастер-практик с аналитическим умом',
    detailedDescription: 'ISTP — искусные решатели проблем, которые понимают, как работают системы. Они ценят автономию и компетентность.',
    workStyle: 'Предпочитают практическую работу с возможностью решать технические проблемы.',
    stressPattern: 'Под стрессом могут стать эмоционально уязвимыми или озабоченными отношениями (активация Fe).',
    growthPath: 'Развитие через выражение эмоций и построение глубоких отношений.'
  },
  ISFP: {
    shortDescription: 'Художник с глубокими ценностями',
    detailedDescription: 'ISFP живут в гармонии со своими ценностями и эстетическим чувством. Они ценят подлинность и красоту.',
    workStyle: 'Нуждаются в свободе самовыражения и работе, соответствующей их ценностям.',
    stressPattern: 'Под стрессом могут стать чрезмерно организованными или критичными (активация Te).',
    growthPath: 'Развитие через структурирование творчества и принятие решений.'
  },
  ESTP: {
    shortDescription: 'Практик с талантом к действию',
    detailedDescription: 'ESTP — энергичные решатели проблем, которые процветают в динамичных ситуациях. Они ценят опыт и результаты.',
    workStyle: 'Нуждаются в разнообразии, действии и возможности влиять на ситуацию.',
    stressPattern: 'Под стрессом могут стать тревожными о будущем или чрезмерно интроспективными (активация Ni).',
    growthPath: 'Развитие через долгосрочное планирование и рефлексию.'
  },
  ESFP: {
    shortDescription: 'Энтертейнер с заразительной энергией',
    detailedDescription: 'ESFP — источники радости и спонтанности. Они создают позитивную атмосферу и наслаждаются моментом.',
    workStyle: 'Нуждаются в динамичной среде с возможностью взаимодействовать с людьми.',
    stressPattern: 'Под стрессом могут стать пессимистичными или чрезмерно сосредоточенными на будущем (активация Ni).',
    growthPath: 'Развитие через планирование и внимание к долгосрочным последствиям.'
  }
}
