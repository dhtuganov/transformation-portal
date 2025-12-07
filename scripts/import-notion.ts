/**
 * Notion to MDX Import Script
 *
 * Converts exported Notion markdown files to MDX format with proper frontmatter.
 *
 * Usage:
 *   1. Export from Notion: Export → Markdown & CSV → Include subpages
 *   2. Unzip to notion-export/raw/
 *   3. Run: npx tsx scripts/import-notion.ts
 *
 * Features:
 *   - Parses Notion markdown
 *   - Converts Notion-specific syntax to MDX components
 *   - Generates frontmatter based on content analysis
 *   - Interactive category selection
 *   - Validates output
 */

import fs from 'fs'
import path from 'path'
import readline from 'readline'

// ============================================================================
// Types
// ============================================================================

interface NotionFile {
  path: string
  name: string
  content: string
}

interface ParsedContent {
  title: string
  body: string
  estimatedDuration: number
  detectedKeywords: string[]
  suggestedCategory: CategorySuggestion
}

interface CategorySuggestion {
  category: 'core' | 'industry' | 'functional'
  subcategory: string
  path: string
  confidence: number
}

interface ConversionResult {
  success: boolean
  outputPath?: string
  error?: string
}

// ============================================================================
// Configuration
// ============================================================================

const NOTION_RAW_DIR = path.join(process.cwd(), 'notion-export', 'raw')
const NOTION_PROCESSED_DIR = path.join(process.cwd(), 'notion-export', 'processed')
const CONTENT_DIR = path.join(process.cwd(), 'content', 'articles')
const LOG_FILE = path.join(process.cwd(), 'notion-export', 'import-log.json')

const CATEGORY_KEYWORDS: Record<string, { category: string; subcategory: string; keywords: string[] }> = {
  // Core - Psychology
  'core/psychology/mbti': {
    category: 'core',
    subcategory: 'psychology',
    keywords: ['mbti', 'психотип', 'интроверт', 'экстраверт', 'личност', 'тип личности', 'myers-briggs'],
  },
  'core/psychology/emotional-intelligence': {
    category: 'core',
    subcategory: 'psychology',
    keywords: ['эмоциональн', 'eq', 'эмпатия', 'самосознание', 'emotional intelligence'],
  },
  'core/psychology/communication': {
    category: 'core',
    subcategory: 'psychology',
    keywords: ['коммуникац', 'общение', 'диалог', 'обратная связь', 'feedback'],
  },
  // Core - Soft Skills
  'core/soft-skills/negotiation': {
    category: 'core',
    subcategory: 'soft-skills',
    keywords: ['переговор', 'negotiat', 'торг', 'компромисс', 'win-win'],
  },
  'core/soft-skills/time-management': {
    category: 'core',
    subcategory: 'soft-skills',
    keywords: ['тайм-менеджмент', 'время', 'приоритет', 'планирование', 'productiv', 'pomodoro', 'gtd'],
  },
  'core/soft-skills/presentations': {
    category: 'core',
    subcategory: 'soft-skills',
    keywords: ['презентац', 'выступлен', 'публичн', 'спикер', 'слайд'],
  },
  'core/soft-skills/leadership': {
    category: 'core',
    subcategory: 'soft-skills',
    keywords: ['лидерств', 'руководств', 'менеджмент', 'команд', 'leadership', 'управлен'],
  },
  // Core - Digital
  'core/digital/excel': {
    category: 'core',
    subcategory: 'digital',
    keywords: ['excel', 'spreadsheet', 'таблиц', 'формул', 'pivot', 'сводн'],
  },
  'core/digital/crm': {
    category: 'core',
    subcategory: 'digital',
    keywords: ['crm', 'salesforce', 'hubspot', 'клиентская база', 'воронка'],
  },
  'core/digital/ai-tools': {
    category: 'core',
    subcategory: 'digital',
    keywords: ['ai', 'искусственный интеллект', 'chatgpt', 'claude', 'нейросет', 'автоматизац'],
  },
  // Core - Change Management
  'core/change-management/adkar': {
    category: 'core',
    subcategory: 'change-management',
    keywords: ['adkar', 'prosci', 'изменени', 'трансформац', 'change management'],
  },
  // Industry - Travel
  'industry/travel/aviation': {
    category: 'industry',
    subcategory: 'travel',
    keywords: ['авиа', 'gds', 'amadeus', 'sabre', 'бронирован', 'тариф', 'рейс', 'билет'],
  },
  'industry/travel/tourism': {
    category: 'industry',
    subcategory: 'travel',
    keywords: ['туризм', 'направлен', 'виза', 'страхован', 'отель', 'тур'],
  },
  'industry/travel/mice': {
    category: 'industry',
    subcategory: 'travel',
    keywords: ['mice', 'event', 'мероприят', 'конференц', 'инсентив', 'площадк'],
  },
  'industry/travel/concierge': {
    category: 'industry',
    subcategory: 'travel',
    keywords: ['консьерж', 'vip', 'премиум', 'персонал', 'индивидуальн'],
  },
  // Functional
  'functional/sales': {
    category: 'functional',
    subcategory: 'sales',
    keywords: ['продаж', 'sales', 'клиент', 'сделк', 'лид', 'конверс', 'b2b', 'pipeline'],
  },
  'functional/marketing': {
    category: 'functional',
    subcategory: 'marketing',
    keywords: ['маркетинг', 'smm', 'контент', 'реклам', 'бренд', 'seo', 'таргет'],
  },
  'functional/customer-service': {
    category: 'functional',
    subcategory: 'customer-service',
    keywords: ['сервис', 'жалоб', 'лояльност', 'nps', 'csat', 'поддержк', 'service'],
  },
  'functional/operations': {
    category: 'functional',
    subcategory: 'operations',
    keywords: ['операци', 'процесс', 'sla', 'качеств', 'оптимизац', 'эффективност'],
  },
  'functional/finance': {
    category: 'functional',
    subcategory: 'finance',
    keywords: ['финанс', 'бюджет', 'p&l', 'unit economics', 'cash flow', 'roi'],
  },
}

// ============================================================================
// Utility Functions
// ============================================================================

function slugify(text: string): string {
  const cyrillicMap: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  }

  return text
    .toLowerCase()
    // First transliterate Cyrillic to Latin
    .split('')
    .map(char => cyrillicMap[char] || char)
    .join('')
    // Then remove non-word characters except spaces and hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Remove duplicate hyphens
    .replace(/-+/g, '-')
    // Limit length
    .substring(0, 60)
}

function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

function extractTitle(content: string, filename: string): string {
  // Try to find H1 heading
  const h1Match = content.match(/^#\s+(.+)$/m)
  if (h1Match) {
    return h1Match[1].trim()
  }
  // Fall back to filename
  return filename.replace(/\.md$/, '').replace(/-/g, ' ')
}

function detectKeywords(content: string): string[] {
  const found: string[] = []
  const lowerContent = content.toLowerCase()

  for (const [path, config] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of config.keywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        found.push(keyword)
      }
    }
  }

  return [...new Set(found)]
}

function suggestCategory(content: string, title: string): CategorySuggestion {
  const lowerContent = (content + ' ' + title).toLowerCase()
  let bestMatch: CategorySuggestion = {
    category: 'core',
    subcategory: 'soft-skills',
    path: 'core/soft-skills/leadership',
    confidence: 0,
  }

  for (const [categoryPath, config] of Object.entries(CATEGORY_KEYWORDS)) {
    let matchCount = 0
    for (const keyword of config.keywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        matchCount++
      }
    }
    const confidence = matchCount / config.keywords.length

    if (confidence > bestMatch.confidence) {
      bestMatch = {
        category: config.category as 'core' | 'industry' | 'functional',
        subcategory: config.subcategory,
        path: categoryPath,
        confidence,
      }
    }
  }

  return bestMatch
}

// ============================================================================
// Notion Syntax Conversion
// ============================================================================

function convertNotionSyntax(content: string): string {
  let converted = content

  // Remove Notion page IDs from links
  converted = converted.replace(/\[([^\]]+)\]\([^)]+%20[a-f0-9]{32}\)/gi, '[$1](#)')

  // Convert Notion callouts to MDX Callout component
  // > 💡 Note text → <Callout type="info">Note text</Callout>
  converted = converted.replace(
    /^>\s*[💡📝ℹ️]\s*(.+)$/gm,
    '<Callout type="info">\n$1\n</Callout>'
  )
  converted = converted.replace(
    /^>\s*[⚠️🚨❗]\s*(.+)$/gm,
    '<Callout type="warning">\n$1\n</Callout>'
  )
  converted = converted.replace(
    /^>\s*[✅💚🟢]\s*(.+)$/gm,
    '<Callout type="tip">\n$1\n</Callout>'
  )

  // Convert Notion toggle blocks (basic support)
  // ▶ Toggle title → <details><summary>Toggle title</summary>
  converted = converted.replace(
    /^[▶►]\s*(.+)$/gm,
    '<details>\n<summary>$1</summary>\n'
  )

  // Remove empty Notion database references
  converted = converted.replace(/^\s*\|\s*\|\s*\|\s*$/gm, '')

  // Clean up multiple blank lines
  converted = converted.replace(/\n{3,}/g, '\n\n')

  // Remove Notion-specific metadata comments
  converted = converted.replace(/<!--\s*notion-[^>]+-->/g, '')

  return converted
}

// ============================================================================
// MDX Generation
// ============================================================================

function generateFrontmatter(parsed: ParsedContent, categoryPath: string): string {
  const slug = slugify(parsed.title)
  const category = parsed.suggestedCategory.category
  const subcategory = parsed.suggestedCategory.subcategory

  // Determine difficulty based on content length and complexity
  let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  if (parsed.estimatedDuration > 15) difficulty = 'intermediate'
  if (parsed.estimatedDuration > 25) difficulty = 'advanced'

  // Generate tags from detected keywords
  const tags = parsed.detectedKeywords.slice(0, 5)

  const frontmatter = `---
title: "${parsed.title.replace(/"/g, '\\"')}"
description: "Обучающий материал по теме: ${parsed.title}"
category: "${category}"
subcategory: "${subcategory}"
tenant_scope: "otrar"
department_tags: []
role_tags: ["employee", "manager"]
mbti_types: ["all"]
difficulty: "${difficulty}"
competency_level: 2
author: "ТОО «Нейрошторм»"
duration: ${parsed.estimatedDuration}
xp_reward: ${Math.ceil(parsed.estimatedDuration * 1.5)}
published: true
featured: false
sort_order: 0
tags: ${JSON.stringify(tags)}
---`

  return frontmatter
}

function convertToMDX(parsed: ParsedContent, categoryPath: string): string {
  const frontmatter = generateFrontmatter(parsed, categoryPath)
  const body = convertNotionSyntax(parsed.body)

  return `${frontmatter}

${body}
`
}

// ============================================================================
// File Operations
// ============================================================================

function scanNotionExport(): NotionFile[] {
  const files: NotionFile[] = []

  if (!fs.existsSync(NOTION_RAW_DIR)) {
    console.log(`📁 Creating directory: ${NOTION_RAW_DIR}`)
    fs.mkdirSync(NOTION_RAW_DIR, { recursive: true })
    return files
  }

  const entries = fs.readdirSync(NOTION_RAW_DIR, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const filePath = path.join(NOTION_RAW_DIR, entry.name)
      const content = fs.readFileSync(filePath, 'utf-8')
      files.push({
        path: filePath,
        name: entry.name,
        content,
      })
    }
  }

  return files
}

function parseNotionFile(file: NotionFile): ParsedContent {
  const title = extractTitle(file.content, file.name)
  const body = file.content.replace(/^#\s+.+$/m, '').trim()
  const duration = estimateReadingTime(body)
  const keywords = detectKeywords(file.content)
  const category = suggestCategory(file.content, title)

  return {
    title,
    body,
    estimatedDuration: duration,
    detectedKeywords: keywords,
    suggestedCategory: category,
  }
}

function saveToContentFolder(mdx: string, categoryPath: string, title: string): string {
  const slug = slugify(title)
  const targetDir = path.join(CONTENT_DIR, categoryPath)
  const targetPath = path.join(targetDir, `${slug}.mdx`)

  // Ensure directory exists
  fs.mkdirSync(targetDir, { recursive: true })

  // Write file
  fs.writeFileSync(targetPath, mdx, 'utf-8')

  return targetPath
}

// ============================================================================
// Interactive CLI
// ============================================================================

async function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function interactiveImport(): Promise<void> {
  console.log('\n🔄 Notion → MDX Import Tool\n')
  console.log('=' .repeat(50))

  const files = scanNotionExport()

  if (files.length === 0) {
    console.log('\n📂 No files found in notion-export/raw/')
    console.log('\nTo import from Notion:')
    console.log('  1. Open your Notion workspace')
    console.log('  2. Select pages to export')
    console.log('  3. Click "..." → Export → Markdown & CSV')
    console.log('  4. Extract ZIP to notion-export/raw/')
    console.log('  5. Run this script again')
    return
  }

  console.log(`\n📂 Found ${files.length} files in notion-export/raw/\n`)

  const log: Array<{ file: string; action: string; output?: string }> = []
  let processed = 0
  let skipped = 0

  for (const file of files) {
    console.log('\n' + '-'.repeat(50))
    console.log(`\n📄 Processing: ${file.name}`)

    const parsed = parseNotionFile(file)

    console.log(`   Title: ${parsed.title}`)
    console.log(`   Duration: ${parsed.estimatedDuration} min`)
    console.log(`   Keywords: ${parsed.detectedKeywords.slice(0, 3).join(', ')}`)
    console.log(`   Suggested: ${parsed.suggestedCategory.path} (${Math.round(parsed.suggestedCategory.confidence * 100)}% confidence)`)

    console.log('\n   Options:')
    console.log('   [1] Accept suggested category')
    console.log('   [2] Change category')
    console.log('   [3] Skip file')
    console.log('   [4] View content preview')
    console.log('   [q] Quit')

    const choice = await askQuestion('\n   Choice: ')

    if (choice === 'q') {
      console.log('\n👋 Exiting...')
      break
    }

    if (choice === '3') {
      console.log('   ⏭️  Skipped')
      log.push({ file: file.name, action: 'skipped' })
      skipped++
      continue
    }

    if (choice === '4') {
      console.log('\n   Preview (first 500 chars):')
      console.log('   ' + parsed.body.substring(0, 500).replace(/\n/g, '\n   '))
      continue
    }

    let categoryPath = parsed.suggestedCategory.path

    if (choice === '2') {
      console.log('\n   Available categories:')
      const categories = Object.keys(CATEGORY_KEYWORDS)
      categories.forEach((cat, i) => console.log(`   [${i + 1}] ${cat}`))

      const catChoice = await askQuestion('\n   Enter number: ')
      const catIndex = parseInt(catChoice) - 1
      if (catIndex >= 0 && catIndex < categories.length) {
        categoryPath = categories[catIndex]
      }
    }

    // Convert and save
    const mdx = convertToMDX(parsed, categoryPath)
    const outputPath = saveToContentFolder(mdx, categoryPath, parsed.title)

    console.log(`   ✅ Saved to: ${outputPath}`)
    log.push({ file: file.name, action: 'converted', output: outputPath })
    processed++
  }

  // Save log
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2), 'utf-8')

  console.log('\n' + '='.repeat(50))
  console.log(`\n📊 Import Summary:`)
  console.log(`   Processed: ${processed}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Log saved to: ${LOG_FILE}`)
  console.log('\n💡 Next step: Run "npm run sync-content" to update database')
}

// ============================================================================
// Batch Mode (non-interactive)
// ============================================================================

async function batchImport(): Promise<void> {
  console.log('\n🔄 Notion → MDX Batch Import\n')

  const files = scanNotionExport()

  if (files.length === 0) {
    console.log('📂 No files found in notion-export/raw/')
    return
  }

  console.log(`📂 Found ${files.length} files`)

  const log: Array<{ file: string; action: string; output?: string; category: string }> = []

  for (const file of files) {
    const parsed = parseNotionFile(file)
    const categoryPath = parsed.suggestedCategory.path

    const mdx = convertToMDX(parsed, categoryPath)
    const outputPath = saveToContentFolder(mdx, categoryPath, parsed.title)

    console.log(`✅ ${file.name} → ${categoryPath}`)
    log.push({
      file: file.name,
      action: 'converted',
      output: outputPath,
      category: categoryPath,
    })
  }

  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2), 'utf-8')

  console.log(`\n📊 Processed ${files.length} files`)
  console.log(`📝 Log saved to: ${LOG_FILE}`)
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--batch')) {
    await batchImport()
  } else {
    await interactiveImport()
  }
}

main().catch(console.error)
