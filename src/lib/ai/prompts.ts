import type { MBTIType } from '@/types/database'
import { getCognitiveFunctions, getTypeName } from '@/lib/mbti'

/**
 * Generate system prompt for Claude Haiku
 */
export function getSystemPrompt(): string {
  return `Ты — эксперт по типологии MBTI и когнитивным функциям. Твоя задача — предоставлять персонализированные инсайты и рекомендации на основе типа личности пользователя.

ВАЖНО:
- Все ответы только на русском языке
- Максимальная длина ответа: 300 токенов
- Фокус на практичности и применимости
- Используй научный подход к MBTI и когнитивным функциям
- Избегай общих фраз, будь конкретным
- Связывай рекомендации с когнитивными функциями

Когнитивные функции:
- Ni (Интровертная интуиция): видение паттернов, долгосрочное планирование
- Ne (Экстравертная интуиция): исследование возможностей, креативность
- Ti (Интровертное мышление): логический анализ, внутренняя согласованность
- Te (Экстравертное мышление): организация, эффективность, достижение целей
- Fi (Интровертное чувство): личные ценности, аутентичность
- Fe (Экстравертное чувство): гармония в отношениях, эмпатия
- Si (Интровертное ощущение): опора на опыт, внимание к деталям
- Se (Экстравертное ощущение): восприятие настоящего момента, практичность`
}

/**
 * Generate prompt for daily insight
 */
export function getDailyInsightPrompt(mbtiType: MBTIType, userName?: string): string {
  const functions = getCognitiveFunctions(mbtiType)
  const typeName = getTypeName(mbtiType, 'ru')

  return `Создай ежедневный инсайт для пользователя с типом личности ${mbtiType} (${typeName}).

Когнитивные функции этого типа:
- Доминирующая: ${functions.dominant}
- Вспомогательная: ${functions.auxiliary}
- Третичная: ${functions.tertiary}
- Инферiorная: ${functions.inferior}

Требования к инсайту:
1. Заголовок (5-7 слов): привлекающий внимание, релевантный типу
2. Содержание (150-200 слов): конкретный инсайт о развитии одной из когнитивных функций
3. Когнитивная функция: укажи, какую функцию развивает этот инсайт
4. Действие на сегодня: одно конкретное действие, которое пользователь может выполнить

Формат ответа (JSON):
{
  "title": "Заголовок инсайта",
  "content": "Основной текст инсайта с объяснением",
  "cognitiveFunction": "Ni|Ne|Ti|Te|Fi|Fe|Si|Se",
  "actionItem": "Конкретное действие на сегодня"
}

Сосредоточься на практических аспектах развития и применения когнитивных функций в повседневной жизни${userName ? `, ${userName}` : ''}.`
}

/**
 * Generate prompt for journal analysis
 */
export function getJournalAnalysisPrompt(mbtiType: MBTIType, journalEntry: string): string {
  const functions = getCognitiveFunctions(mbtiType)
  const typeName = getTypeName(mbtiType, 'ru')

  return `Проанализируй запись в дневнике пользователя с типом ${mbtiType} (${typeName}).

Когнитивные функции этого типа:
- Доминирующая: ${functions.dominant}
- Вспомогательная: ${functions.auxiliary}
- Третичная: ${functions.tertiary}
- Инферiorная: ${functions.inferior}

Запись в дневнике:
"""
${journalEntry}
"""

Требования к анализу:
1. Определи эмоциональный тон (positive/neutral/negative/mixed)
2. Выдели 2-3 ключевые темы
3. Определи, какие когнитивные функции проявляются в записи
4. Найди 1-2 возможности для роста
5. Дай персонализированную обратную связь (50-100 слов)

Формат ответа (JSON):
{
  "emotionalTone": "positive|neutral|negative|mixed",
  "themes": ["тема1", "тема2", "тема3"],
  "cognitiveFunctionsUsed": ["функция1", "функция2"],
  "growthOpportunities": ["возможность1", "возможность2"],
  "feedback": "Персонализированная обратная связь с учетом типа личности"
}

Будь поддерживающим, но честным. Связывай наблюдения с когнитивными функциями.`
}

/**
 * Generate prompt for type-specific tip
 */
export function getTypeSpecificTipPrompt(
  mbtiType: MBTIType,
  context: string,
  challenges?: string[]
): string {
  const functions = getCognitiveFunctions(mbtiType)
  const typeName = getTypeName(mbtiType, 'ru')

  const challengesText = challenges && challenges.length > 0
    ? `\n\nТекущие вызовы пользователя:\n${challenges.map(c => `- ${c}`).join('\n')}`
    : ''

  return `Создай персонализированный совет для пользователя с типом ${mbtiType} (${typeName}).

Когнитивные функции:
- Доминирующая: ${functions.dominant}
- Вспомогательная: ${functions.auxiliary}
- Третичная: ${functions.tertiary}
- Инферiorная: ${functions.inferior}

Контекст ситуации:
${context}${challengesText}

Требования к совету:
1. Совет (50-100 слов): конкретная рекомендация с учетом сильных сторон типа
2. Когнитивная функция: какая функция поможет решить ситуацию
3. Объяснение (30-50 слов): почему этот совет подходит именно этому типу

Формат ответа (JSON):
{
  "tip": "Конкретный практический совет",
  "cognitiveFunction": "Ni|Ne|Ti|Te|Fi|Fe|Si|Se",
  "rationale": "Объяснение, почему это работает для данного типа"
}

Используй сильные стороны типа ${mbtiType} и помоги развивать слабые функции безопасным способом.`
}

/**
 * Generate growth-focused prompt for inferior function development
 */
export function getInferiorFunctionPrompt(mbtiType: MBTIType): string {
  const functions = getCognitiveFunctions(mbtiType)
  const inferiorFunction = functions.inferior

  return `Создай безопасное упражнение для развития инферiorной функции ${inferiorFunction} для типа ${mbtiType}.

Важно:
- Инферiorная функция — это самая слабая и стрессовая функция
- Развивать её нужно осторожно, через игру и низкое давление
- Не перегружай пользователя
- Предложи простое 5-10 минутное упражнение

Формат ответа (JSON):
{
  "title": "Название упражнения",
  "content": "Описание упражнения и его пользы",
  "cognitiveFunction": "${inferiorFunction}",
  "actionItem": "Конкретные шаги для выполнения упражнения"
}

Сделай упражнение увлекательным и не вызывающим стресс.`
}

/**
 * Validate that response is in correct JSON format
 */
export function validateResponseFormat(response: string): boolean {
  try {
    const parsed = JSON.parse(response)
    return typeof parsed === 'object' && parsed !== null
  } catch {
    return false
  }
}

/**
 * Extract JSON from Claude response (handles markdown code blocks)
 */
export function extractJSON(response: string): string {
  // Remove markdown code blocks if present
  const jsonMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (jsonMatch) {
    return jsonMatch[1].trim()
  }

  // Try to find JSON object in response
  const objectMatch = response.match(/\{[\s\S]*\}/)
  if (objectMatch) {
    return objectMatch[0]
  }

  return response.trim()
}

/**
 * Default prompts for fallback scenarios
 */
export const DEFAULT_PROMPTS = {
  noMBTIType: 'Пожалуйста, пройдите MBTI-тестирование для получения персонализированных инсайтов.',
  rateLimitExceeded: 'Вы достигли дневного лимита AI-инсайтов. Попробуйте завтра!',
  invalidTopic: 'Этот запрос выходит за рамки психологии и развития личности.',
  error: 'Произошла ошибка при генерации инсайта. Попробуйте позже.'
}
