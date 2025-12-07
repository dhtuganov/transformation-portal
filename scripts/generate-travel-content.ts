/**
 * Travel Content Generation Strategy
 *
 * Automated pipeline for creating industry-specific travel content:
 * 1. Search - Find authoritative sources
 * 2. Analyze - Extract key topics and structure
 * 3. Adapt - Localize for Kazakh market
 * 4. Assemble - Generate MDX with proper frontmatter
 *
 * Usage:
 *   npx tsx scripts/generate-travel-content.ts --topic "GDS systems"
 *   npx tsx scripts/generate-travel-content.ts --batch travel-topics.json
 */

import fs from 'fs'
import path from 'path'

// ============================================================================
// Travel Content Taxonomy
// ============================================================================

const TRAVEL_CONTENT_TAXONOMY = {
  aviation: {
    name: 'Авиа',
    description: 'GDS системы, тарифы, маршрутизация',
    topics: [
      {
        slug: 'gds-introduction',
        title: 'Введение в GDS системы',
        subtopics: ['Amadeus', 'Sabre', 'Galileo', 'Travelport'],
        difficulty: 'beginner',
        duration: 15,
        xp: 25,
        sources: [
          'https://amadeus.com/en/insights',
          'https://www.sabre.com/insights/',
          'IATA training materials'
        ]
      },
      {
        slug: 'airline-tariffs',
        title: 'Тарифообразование авиакомпаний',
        subtopics: ['Fare classes', 'Fare rules', 'Branded fares', 'Ancillaries'],
        difficulty: 'intermediate',
        duration: 20,
        xp: 35,
        sources: ['ATPCO', 'IATA', 'Airline revenue management']
      },
      {
        slug: 'routing-connections',
        title: 'Маршрутизация и стыковки',
        subtopics: ['MCT', 'Interline agreements', 'Codeshare', 'Alliance benefits'],
        difficulty: 'intermediate',
        duration: 15,
        xp: 30,
        sources: ['Star Alliance', 'oneworld', 'SkyTeam']
      },
      {
        slug: 'ticketing-basics',
        title: 'Основы выписки билетов',
        subtopics: ['PNR structure', 'Ticket issuance', 'Reissue', 'Refunds'],
        difficulty: 'intermediate',
        duration: 25,
        xp: 40,
        sources: ['BSP', 'Airline documentation']
      },
      {
        slug: 'ndc-modern-distribution',
        title: 'NDC и современная дистрибуция',
        subtopics: ['NDC standard', 'Direct connects', 'API integration'],
        difficulty: 'advanced',
        duration: 20,
        xp: 45,
        sources: ['IATA NDC', 'Airline NDC programs']
      }
    ]
  },
  tourism: {
    name: 'Туризм',
    description: 'Направления, визы, страхование',
    topics: [
      {
        slug: 'destination-knowledge-europe',
        title: 'География направлений: Европа',
        subtopics: ['Шенген', 'Популярные маршруты', 'Сезонность', 'Особенности'],
        difficulty: 'beginner',
        duration: 20,
        xp: 30,
        sources: ['Destination guides', 'Tourism boards']
      },
      {
        slug: 'destination-knowledge-asia',
        title: 'География направлений: Азия',
        subtopics: ['Визовые режимы', 'Климат', 'Культурные особенности'],
        difficulty: 'beginner',
        duration: 20,
        xp: 30,
        sources: ['Destination guides', 'Tourism boards']
      },
      {
        slug: 'visa-requirements',
        title: 'Визовые требования для граждан РК',
        subtopics: ['Безвизовые страны', 'Электронные визы', 'Процедура получения'],
        difficulty: 'beginner',
        duration: 15,
        xp: 25,
        sources: ['MFA Kazakhstan', 'Embassy websites', 'Timatic']
      },
      {
        slug: 'travel-insurance',
        title: 'Страхование путешественников',
        subtopics: ['Виды покрытия', 'Медицинское страхование', 'Отмена поездки'],
        difficulty: 'beginner',
        duration: 10,
        xp: 20,
        sources: ['Insurance providers', 'EU requirements']
      },
      {
        slug: 'package-tour-design',
        title: 'Создание турпакетов',
        subtopics: ['Компонентов тура', 'Ценообразование', 'Margin calculation'],
        difficulty: 'intermediate',
        duration: 25,
        xp: 40,
        sources: ['Tour operator guides']
      }
    ]
  },
  mice: {
    name: 'MICE',
    description: 'Мероприятия, конференции, инсентивы',
    topics: [
      {
        slug: 'mice-fundamentals',
        title: 'Основы MICE индустрии',
        subtopics: ['M-I-C-E segments', 'Market overview', 'Key players'],
        difficulty: 'beginner',
        duration: 15,
        xp: 25,
        sources: ['ICCA', 'MPI', 'SITE']
      },
      {
        slug: 'event-planning-process',
        title: 'Процесс планирования мероприятий',
        subtopics: ['Brief', 'RFP', 'Site selection', 'Contracts'],
        difficulty: 'intermediate',
        duration: 20,
        xp: 35,
        sources: ['CMP certification', 'Event planning guides']
      },
      {
        slug: 'venue-selection',
        title: 'Выбор площадки и отеля',
        subtopics: ['Критерии выбора', 'Site inspection', 'Negotiation'],
        difficulty: 'intermediate',
        duration: 15,
        xp: 30,
        sources: ['Venue guides', 'CVB resources']
      },
      {
        slug: 'mice-budgeting',
        title: 'Бюджетирование мероприятий',
        subtopics: ['Cost categories', 'Contingency', 'ROI calculation'],
        difficulty: 'intermediate',
        duration: 20,
        xp: 35,
        sources: ['PCMA', 'Event budgeting guides']
      },
      {
        slug: 'incentive-travel',
        title: 'Инсентив-программы',
        subtopics: ['Program design', 'Destinations', 'Measurement'],
        difficulty: 'advanced',
        duration: 20,
        xp: 40,
        sources: ['SITE', 'IRF']
      },
      {
        slug: 'hybrid-events',
        title: 'Гибридные мероприятия',
        subtopics: ['Technology', 'Engagement', 'Production'],
        difficulty: 'advanced',
        duration: 15,
        xp: 35,
        sources: ['EventMB', 'Hybrid event guides']
      }
    ]
  },
  concierge: {
    name: 'Консьерж',
    description: 'VIP-сервис, персонализация',
    topics: [
      {
        slug: 'vip-service-standards',
        title: 'Стандарты VIP-сервиса',
        subtopics: ['Service levels', 'Client expectations', 'Quality assurance'],
        difficulty: 'beginner',
        duration: 15,
        xp: 25,
        sources: ['Luxury hospitality guides', 'Les Clefs d\'Or']
      },
      {
        slug: 'personalization-techniques',
        title: 'Техники персонализации',
        subtopics: ['Client profiling', 'Preference tracking', 'Surprise & delight'],
        difficulty: 'intermediate',
        duration: 15,
        xp: 30,
        sources: ['CRM best practices', 'Luxury service guides']
      },
      {
        slug: 'crisis-management-travel',
        title: 'Кризисный менеджмент в путешествиях',
        subtopics: ['Emergency protocols', 'Rebooking', 'Communication'],
        difficulty: 'intermediate',
        duration: 20,
        xp: 35,
        sources: ['TMC guides', 'Crisis management']
      },
      {
        slug: 'special-requests',
        title: 'Работа со специальными запросами',
        subtopics: ['Dietary', 'Accessibility', 'Religious', 'Medical'],
        difficulty: 'beginner',
        duration: 15,
        xp: 25,
        sources: ['Service guides', 'Accessibility standards']
      }
    ]
  }
}

// ============================================================================
// Content Generation Templates
// ============================================================================

function generateArticleTemplate(
  category: string,
  topic: typeof TRAVEL_CONTENT_TAXONOMY.aviation.topics[0]
): string {
  const frontmatter = `---
title: "${topic.title}"
description: "Обучающий материал по теме: ${topic.title}. ${topic.subtopics.join(', ')}."
category: "industry"
subcategory: "travel/${category}"
tenant_scope: "otrar"
industry_tags: ["travel", "${category}"]
department_tags: ["operations", "sales"]
role_tags: ["employee", "manager"]
mbti_types: ["all"]
difficulty: "${topic.difficulty}"
competency_level: ${topic.difficulty === 'beginner' ? 2 : topic.difficulty === 'intermediate' ? 3 : 4}
author: "ТОО «Нейрошторм»"
duration: ${topic.duration}
xp_reward: ${topic.xp}
published: false
featured: false
sort_order: 0
tags: ["${category}", "travel", "${topic.subtopics.slice(0, 3).join('", "')}"]
prerequisites: []
next_articles: []
---

## Введение

<!-- TODO: Написать введение о важности темы для сотрудников Otrar Travel -->

## Ключевые понятия

${topic.subtopics.map(st => `### ${st}\n\n<!-- TODO: Раскрыть тему -->\n`).join('\n')}

## Практическое применение

<!-- TODO: Добавить примеры из практики Otrar Travel -->

## Контрольные вопросы

1. <!-- TODO -->
2. <!-- TODO -->
3. <!-- TODO -->

## Дополнительные материалы

${topic.sources.map(s => `- ${s}`).join('\n')}

---

*Статья создана автоматически. Требуется наполнение контентом.*
`

  return frontmatter
}

// ============================================================================
// Content Generation Pipeline
// ============================================================================

interface GenerationResult {
  category: string
  topic: string
  path: string
  status: 'created' | 'exists' | 'error'
}

function generateAllTravelContent(dryRun: boolean = true): GenerationResult[] {
  const results: GenerationResult[] = []
  const contentDir = path.join(process.cwd(), 'content', 'articles', 'industry', 'travel')

  for (const [categoryKey, category] of Object.entries(TRAVEL_CONTENT_TAXONOMY)) {
    const categoryDir = path.join(contentDir, categoryKey)

    console.log(`\n📁 ${category.name} (${categoryKey})`)
    console.log(`   ${category.description}`)

    for (const topic of category.topics) {
      const filePath = path.join(categoryDir, `${topic.slug}.mdx`)
      const relativePath = path.relative(process.cwd(), filePath)

      if (fs.existsSync(filePath)) {
        console.log(`   ⏭️  ${topic.slug} - already exists`)
        results.push({
          category: categoryKey,
          topic: topic.slug,
          path: relativePath,
          status: 'exists'
        })
        continue
      }

      if (dryRun) {
        console.log(`   📝 ${topic.slug} - would create`)
        results.push({
          category: categoryKey,
          topic: topic.slug,
          path: relativePath,
          status: 'created'
        })
      } else {
        try {
          fs.mkdirSync(categoryDir, { recursive: true })
          const content = generateArticleTemplate(categoryKey, topic)
          fs.writeFileSync(filePath, content)
          console.log(`   ✅ ${topic.slug} - created`)
          results.push({
            category: categoryKey,
            topic: topic.slug,
            path: relativePath,
            status: 'created'
          })
        } catch (e) {
          console.log(`   ❌ ${topic.slug} - error: ${e}`)
          results.push({
            category: categoryKey,
            topic: topic.slug,
            path: relativePath,
            status: 'error'
          })
        }
      }
    }
  }

  return results
}

// ============================================================================
// Content Enrichment Strategy
// ============================================================================

function printEnrichmentStrategy() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                    СТРАТЕГИЯ ОБОГАЩЕНИЯ TRAVEL-КОНТЕНТА                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ЭТАП 1: Автоматическая генерация (этот скрипт)                            ║
║  ├── Создать скелеты статей с frontmatter                                   ║
║  ├── Определить структуру и подтемы                                         ║
║  └── Указать источники для наполнения                                       ║
║                                                                              ║
║  ЭТАП 2: Сбор контента (Claude + Web Search)                               ║
║  ├── Поиск отраслевых стандартов (IATA, ICCA, etc.)                        ║
║  ├── Анализ лучших практик конкурентов                                      ║
║  ├── Адаптация международного контента для РК                               ║
║  └── Интеграция внутренних процедур Otrar Travel                           ║
║                                                                              ║
║  ЭТАП 3: Написание контента (Claude + Human Review)                        ║
║  ├── Заполнение шаблонов конкретным контентом                              ║
║  ├── Добавление примеров из практики Otrar                                  ║
║  ├── Создание контрольных вопросов                                          ║
║  └── Редактура и проверка экспертом                                         ║
║                                                                              ║
║  ЭТАП 4: Публикация и связывание                                           ║
║  ├── Установить published: true                                             ║
║  ├── Заполнить prerequisites и next_articles                               ║
║  ├── Синхронизировать с БД (npm run sync-content)                          ║
║  └── Создать learning paths                                                 ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  ИСТОЧНИКИ КОНТЕНТА:                                                        ║
║  • IATA (iata.org) - авиационные стандарты                                  ║
║  • ICCA (iccaworld.org) - MICE статистика                                   ║
║  • MPI (mpi.org) - event planning                                           ║
║  • SITE (siteglobal.com) - incentive travel                                 ║
║  • Amadeus/Sabre Learning - GDS обучение                                    ║
║  • Tourism boards - информация о направлениях                               ║
║  • МИД РК - визовая информация                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`)
}

// ============================================================================
// Main
// ============================================================================

const args = process.argv.slice(2)
const execute = args.includes('--execute')
const strategyOnly = args.includes('--strategy')

if (strategyOnly) {
  printEnrichmentStrategy()
  process.exit(0)
}

console.log('🌍 Travel Content Generation\n')

const results = generateAllTravelContent(!execute)

// Summary
const created = results.filter(r => r.status === 'created').length
const exists = results.filter(r => r.status === 'exists').length
const errors = results.filter(r => r.status === 'error').length

console.log(`\n📊 Summary:`)
console.log(`   Would create: ${created}`)
console.log(`   Already exist: ${exists}`)
console.log(`   Errors: ${errors}`)

if (!execute) {
  console.log(`\n⚠️  DRY RUN - no files created`)
  console.log(`Run with --execute to create files`)
  console.log(`Run with --strategy to see enrichment strategy`)
}

printEnrichmentStrategy()
