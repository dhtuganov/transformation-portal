import type { MBTIType } from '@/types/database'
import type { Week, WeekTheme, CognitiveFunction, WeekNumber } from './types'
import { COGNITIVE_FUNCTIONS } from '@/lib/mbti'

/**
 * Shadow Work 8-Week Program
 * Structured program for integrating inferior (shadow) function
 */

// Get inferior function for MBTI type
export function getInferiorFunction(type: MBTIType): CognitiveFunction {
  return COGNITIVE_FUNCTIONS[type].inferior as CognitiveFunction
}

// Get dominant function for MBTI type
export function getDominantFunction(type: MBTIType): CognitiveFunction {
  return COGNITIVE_FUNCTIONS[type].dominant as CognitiveFunction
}

// Map of inferior functions to MBTI types
export const INFERIOR_FUNCTION_MAP: Record<CognitiveFunction, MBTIType[]> = {
  Se: ['INTJ', 'INFJ'], // Introverted Intuitives
  Si: ['ENTP', 'ENFP'], // Extraverted Intuitives
  Ne: ['ISTJ', 'ISFJ'], // Introverted Sensors
  Ni: ['ESTP', 'ESFP'], // Extraverted Sensors
  Te: ['INFP', 'ISFP'], // Introverted Feelers
  Ti: ['ENFJ', 'ESFJ'], // Extraverted Feelers
  Fe: ['INTP', 'ISTP'], // Introverted Thinkers
  Fi: ['ENTJ', 'ESTJ'], // Extraverted Thinkers
}

// Function descriptions in Russian
export const FUNCTION_DESCRIPTIONS: Record<CognitiveFunction, {
  name: string
  description: string
  manifestation: string
  growthPath: string
}> = {
  Se: {
    name: 'Экстравертное Ощущение',
    description: 'Восприятие настоящего момента через органы чувств, телесный опыт, эстетика',
    manifestation: 'Сложности с заземлением в теле, игнорирование физических потребностей, отсутствие эстетического восприятия',
    growthPath: 'Развитие телесной осознанности, присутствия в моменте, чувственного восприятия мира'
  },
  Si: {
    name: 'Интровертное Ощущение',
    description: 'Внутренние телесные ощущения, память о прошлом опыте, традиции',
    manifestation: 'Игнорирование телесных сигналов, неуважение к традициям, трудности с рутиной',
    growthPath: 'Развитие внимания к телу, уважение к опыту прошлого, создание полезных ритуалов'
  },
  Ne: {
    name: 'Экстравертная Интуиция',
    description: 'Видение множества возможностей, паттернов, связей во внешнем мире',
    manifestation: 'Ригидность мышления, страх перед неизвестным, сопротивление новому',
    growthPath: 'Развитие гибкости мышления, открытости опыту, видения альтернатив'
  },
  Ni: {
    name: 'Интровертная Интуиция',
    description: 'Внутренние инсайты, видение глубинных паттернов, долгосрочная перспектива',
    manifestation: 'Отсутствие долгосрочного видения, импульсивность, жизнь только настоящим',
    growthPath: 'Развитие рефлексии, способности к предвидению, глубинного понимания'
  },
  Te: {
    name: 'Экстравертное Мышление',
    description: 'Логическая организация внешнего мира, эффективность, структурирование',
    manifestation: 'Неорганизованность, избегание планирования, неумение ставить четкие цели',
    growthPath: 'Развитие навыков планирования, организации, практического применения идей'
  },
  Ti: {
    name: 'Интровертное Мышление',
    description: 'Внутренняя логическая согласованность, анализ, понимание принципов',
    manifestation: 'Непоследовательность в рассуждениях, эмоциональная аргументация вместо логической',
    growthPath: 'Развитие логического мышления, способности к анализу, внутренней согласованности'
  },
  Fe: {
    name: 'Экстравертное Чувство',
    description: 'Гармония в отношениях, эмпатия, социальные нормы, забота о других',
    manifestation: 'Социальная неловкость, игнорирование чувств других, конфликтность',
    growthPath: 'Развитие эмпатии, навыков общения, способности создавать гармонию'
  },
  Fi: {
    name: 'Интровертное Чувство',
    description: 'Внутренние ценности, аутентичность, личная этика, глубина чувств',
    manifestation: 'Отсутствие контакта с собственными чувствами, игнорирование ценностей',
    growthPath: 'Развитие эмоционального интеллекта, контакта с ценностями, аутентичности'
  }
}

// 8-Week Program Structure
export const WEEK_THEMES: Record<WeekNumber, WeekTheme> = {
  1: {
    number: 1,
    title: 'Осознание Тени',
    subtitle: 'Знакомство с теневой функцией',
    focus: 'Распознавание проявлений теневой функции в своей жизни',
    goal: 'Понять, как проявляется ваша теневая функция и почему она вызывает трудности',
    description: 'Первая неделя посвящена осознанию существования теневой функции и её проявлений. Вы научитесь замечать моменты, когда она активируется, и понимать, какие ситуации её триггерят.',
    keyPoints: [
      'Что такое теневая (inferior) функция',
      'Как она проявляется в стрессе',
      'Почему она создаёт трудности',
      'Первые шаги к осознанности'
    ]
  },
  2: {
    number: 2,
    title: 'Распознавание Паттернов',
    subtitle: 'Изучение своих реакций',
    focus: 'Выявление повторяющихся паттернов поведения, связанных с теневой функцией',
    goal: 'Составить карту своих триггеров и типичных реакций',
    description: 'На второй неделе вы будете отслеживать ситуации, в которых теневая функция берёт контроль. Цель — создать детальную карту ваших триггеров и реакций.',
    keyPoints: [
      'Триггеры теневой функции',
      'Типичные защитные реакции',
      'Паттерны поведения',
      'Эмоциональные сигналы'
    ]
  },
  3: {
    number: 3,
    title: 'Работа с Триггерами',
    subtitle: 'Управление реакциями',
    focus: 'Развитие навыков управления триггерами и эмоциональными реакциями',
    goal: 'Научиться останавливать автоматические реакции и выбирать осознанный ответ',
    description: 'Третья неделя фокусируется на развитии способности замечать триггер до того, как теневая функция активируется. Вы научитесь техникам паузы и осознанного выбора реакции.',
    keyPoints: [
      'Техники заземления',
      'Пауза перед реакцией',
      'Альтернативные ответы',
      'Работа с эмоциями'
    ]
  },
  4: {
    number: 4,
    title: 'Принятие Тени',
    subtitle: 'От борьбы к принятию',
    focus: 'Принятие теневой функции как части себя',
    goal: 'Перейти от отрицания и борьбы к принятию и любопытству',
    description: 'Четвёртая неделя — переломный момент. Вместо борьбы с теневой функцией вы учитесь принимать её как часть себя, которая нуждается в развитии и интеграции.',
    keyPoints: [
      'Самосострадание',
      'Принятие несовершенства',
      'Ценность теневой функции',
      'Интеграция вместо подавления'
    ]
  },
  5: {
    number: 5,
    title: 'Первые Шаги Интеграции',
    subtitle: 'Практика в безопасной среде',
    focus: 'Начало активного развития теневой функции в контролируемых условиях',
    goal: 'Создать безопасное пространство для экспериментов с теневой функцией',
    description: 'Пятая неделя начинает активную фазу интеграции. Вы будете практиковать использование теневой функции в безопасных, контролируемых ситуациях.',
    keyPoints: [
      'Безопасные эксперименты',
      'Малые шаги',
      'Позитивный опыт',
      'Постепенное расширение'
    ]
  },
  6: {
    number: 6,
    title: 'Углубление Практики',
    subtitle: 'Расширение зоны комфорта',
    focus: 'Применение теневой функции в более сложных ситуациях',
    goal: 'Расширить репертуар использования теневой функции',
    description: 'Шестая неделя углубляет практику. Вы начинаете применять теневую функцию в более сложных и реальных жизненных ситуациях.',
    keyPoints: [
      'Более сложные ситуации',
      'Реальная жизнь',
      'Работа с неудачами',
      'Рефлексия опыта'
    ]
  },
  7: {
    number: 7,
    title: 'Интеграция в Жизнь',
    subtitle: 'Создание новых привычек',
    focus: 'Встраивание практики теневой функции в повседневную жизнь',
    goal: 'Сделать использование теневой функции регулярной практикой',
    description: 'Седьмая неделя посвящена созданию устойчивых привычек. Вы интегрируете практику теневой функции в свою повседневную рутину.',
    keyPoints: [
      'Ежедневная практика',
      'Создание ритуалов',
      'Поддерживающие привычки',
      'Долгосрочная перспектива'
    ]
  },
  8: {
    number: 8,
    title: 'Мастерство и Рост',
    subtitle: 'Интеграция и движение вперёд',
    focus: 'Оценка прогресса и планирование дальнейшего развития',
    goal: 'Осознать достигнутый прогресс и наметить путь дальнейшего роста',
    description: 'Восьмая неделя — время подведения итогов и планирования будущего. Вы оцениваете свой прогресс и создаёте план долгосрочного развития.',
    keyPoints: [
      'Оценка прогресса',
      'Инсайты и прорывы',
      'План на будущее',
      'Празднование достижений'
    ]
  }
}

// Get program weeks for specific MBTI type
export function getProgramWeeks(mbtiType: MBTIType): Week[] {
  const inferiorFunction = getInferiorFunction(mbtiType)

  return Object.values(WEEK_THEMES).map(theme => ({
    theme,
    dailyExercises: [], // Will be populated from exercises.ts
    weeklyReflection: {
      prompt: getWeeklyReflectionPrompt(theme.number, inferiorFunction),
      questions: getWeeklyReflectionQuestions(theme.number, inferiorFunction)
    },
    readingMaterial: `/programs/shadow-work/week-${theme.number}`,
    milestones: getWeekMilestones(theme.number)
  }))
}

// Get weekly reflection prompt
function getWeeklyReflectionPrompt(week: WeekNumber, func: CognitiveFunction): string {
  const funcDesc = FUNCTION_DESCRIPTIONS[func]

  const prompts: Record<WeekNumber, string> = {
    1: `Какие проявления ${funcDesc.name} вы заметили в своей жизни на этой неделе? Как они повлияли на ваше состояние?`,
    2: `Какие триггеры активируют вашу теневую функцию чаще всего? Какие паттерны вы обнаружили?`,
    3: `Удалось ли вам заметить момент активации триггера до того, как сработала автоматическая реакция? Что помогло?`,
    4: `Что изменилось в вашем отношении к теневой функции? Удалось ли принять её как часть себя?`,
    5: `Какие первые шаги в практике ${funcDesc.name} были для вас наиболее значимыми? Что удивило?`,
    6: `Как расширилась ваша зона комфорта в использовании теневой функции? Какие сложности возникли?`,
    7: `Какие практики вошли в вашу ежедневную рутину? Как это влияет на вашу жизнь?`,
    8: `Какой путь вы прошли за эти 8 недель? Что изменилось? Куда вы движетесь дальше?`
  }

  return prompts[week]
}

// Get weekly reflection questions
function getWeeklyReflectionQuestions(week: WeekNumber, func: CognitiveFunction): string[] {
  const baseQuestions: Record<WeekNumber, string[]> = {
    1: [
      'Как проявляется моя теневая функция в стрессовых ситуациях?',
      'Какие ситуации чаще всего активируют эту функцию?',
      'Что я чувствую, когда она берёт контроль?',
      'Какой первый шаг я могу сделать для лучшего осознания?'
    ],
    2: [
      'Какие повторяющиеся паттерны я заметил?',
      'Какие триггеры наиболее сильные?',
      'Как я обычно реагирую на эти триггеры?',
      'Что предшествует активации теневой функции?'
    ],
    3: [
      'Какие техники заземления работают для меня лучше всего?',
      'Удаётся ли делать паузу перед реакцией?',
      'Какие альтернативные ответы я попробовал?',
      'Что помогает мне оставаться осознанным?'
    ],
    4: [
      'Могу ли я относиться к себе с состраданием?',
      'Какую ценность несёт моя теневая функция?',
      'Что мешает принятию?',
      'Как бы я отнёсся к другу с такими же сложностями?'
    ],
    5: [
      'Какие безопасные эксперименты я провёл?',
      'Что получилось? Что не получилось?',
      'Какой позитивный опыт я получил?',
      'Куда я хочу двигаться дальше?'
    ],
    6: [
      'В каких новых ситуациях я практиковал теневую функцию?',
      'Как я справлялся с неудачами?',
      'Что я узнал о себе?',
      'Как расширилась моя зона комфорта?'
    ],
    7: [
      'Какие привычки я создал?',
      'Как они влияют на мою жизнь?',
      'Что поддерживает мою практику?',
      'Какие долгосрочные цели я вижу?'
    ],
    8: [
      'Какой прогресс я сделал за 8 недель?',
      'Какие инсайты были самыми важными?',
      'Что я хочу продолжить практиковать?',
      'Как я буду поддерживать свой рост?'
    ]
  }

  return baseQuestions[week]
}

// Get week milestones
function getWeekMilestones(week: WeekNumber): string[] {
  const milestones: Record<WeekNumber, string[]> = {
    1: [
      'Осознал проявления теневой функции',
      'Начал вести дневник наблюдений',
      'Понял базовые концепции'
    ],
    2: [
      'Составил карту триггеров',
      'Выявил основные паттерны',
      'Начал отслеживать реакции'
    ],
    3: [
      'Освоил техники заземления',
      'Научился делать паузу',
      'Попробовал альтернативные реакции'
    ],
    4: [
      'Принял теневую функцию',
      'Развил самосострадание',
      'Увидел ценность интеграции'
    ],
    5: [
      'Начал активную практику',
      'Провёл первые эксперименты',
      'Получил позитивный опыт'
    ],
    6: [
      'Расширил зону комфорта',
      'Практиковал в сложных ситуациях',
      'Научился работать с неудачами'
    ],
    7: [
      'Создал ежедневные ритуалы',
      'Интегрировал практику в жизнь',
      'Сформировал привычки'
    ],
    8: [
      'Оценил свой прогресс',
      'Создал план дальнейшего роста',
      'Отпраздновал достижения'
    ]
  }

  return milestones[week]
}

// Calculate integration level based on progress
export function calculateIntegrationLevel(
  completedWeeks: number,
  totalExercises: number,
  streakDays: number
): number {
  const weekProgress = (completedWeeks / 8) * 40 // 40% for weeks
  const exerciseProgress = Math.min(totalExercises / 56, 1) * 40 // 40% for exercises (7 per week)
  const consistencyBonus = Math.min(streakDays / 56, 1) * 20 // 20% for consistency

  return Math.round(weekProgress + exerciseProgress + consistencyBonus)
}

// Get next recommended week
export function getNextWeek(currentWeek: WeekNumber): WeekNumber | null {
  if (currentWeek >= 8) return null
  return (currentWeek + 1) as WeekNumber
}

// Check if week is unlocked
export function isWeekUnlocked(
  targetWeek: WeekNumber,
  currentWeek: WeekNumber,
  completedExercises: number
): boolean {
  // Week 1 is always unlocked
  if (targetWeek === 1) return true

  // Can only access current week or earlier
  if (targetWeek > currentWeek + 1) return false

  // To unlock next week, need to complete at least 5 out of 7 exercises
  const requiredExercises = (targetWeek - 1) * 5
  return completedExercises >= requiredExercises
}
