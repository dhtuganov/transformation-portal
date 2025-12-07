/**
 * Script to clean imported content:
 * 1. Remove MindTools links and copyrights
 * 2. Clean up Notion metadata remnants
 * 3. Fix broken formatting
 * 4. Update categories based on new structure
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles')

// New category structure
const CATEGORY_MAP = {
  // Business / Professional Skills
  'business': {
    label: 'Бизнес навыки',
    subcategories: [
      'project-management',
      'leadership',
      'negotiation',
      'team-management',
      'knowledge-management',
      'operations',
      'sales',
      'marketing',
      'finance'
    ]
  },
  // Personal Development
  'personal': {
    label: 'Личное развитие',
    subcategories: [
      'psychology',
      'emotional-intelligence',
      'communication',
      'time-management',
      'career-development',
      'learning-skills',
      'mbti',
      'shadow-work'
    ]
  },
  // Industry Knowledge
  'industry': {
    label: 'Отраслевые знания',
    subcategories: [
      'travel',
      'mice',
      'aviation',
      'tourism',
      'hospitality'
    ]
  }
}

// Patterns to remove
const PATTERNS_TO_REMOVE = [
  // MindTools URLs and references
  /https?:\/\/(www\.)?mindtools\.com[^\s\)]+/gi,
  /\[.*?\]\(https?:\/\/(www\.)?mindtools\.com[^\)]+\)/gi,
  // Notion metadata remnants
  /^Tags:.*$/gm,
  /^URL:.*$/gm,
  /^Property:.*$/gm,
  /^Описание:.*$/gm,
  // Annotate markers
  /^Annotate$/gm,
  // Copyright notices
  /©.*?(mindtools|Mind Tools).*$/gim,
  /Copyright.*?(mindtools|Mind Tools).*$/gim,
  // Empty link references like **text**  without actual link
  /\*\*([^*]+)\*\*\s+(?=[,\.]|$)/g,
]

// Patterns to fix
const FORMATTING_FIXES: [RegExp, string][] = [
  // Fix double spaces
  [/  +/g, ' '],
  // Fix multiple newlines (more than 2)
  [/\n{4,}/g, '\n\n\n'],
  // Remove trailing whitespace
  [/ +$/gm, ''],
]

interface ContentFile {
  path: string
  frontmatter: Record<string, unknown>
  content: string
  needsUpdate: boolean
  issues: string[]
}

/**
 * Improved categorization based on file path structure
 *
 * New structure:
 * - business/ - бизнес навыки (project-management, leadership, negotiation, team-management, operations, marketing, sales, finance)
 * - personal/ - личное развитие (psychology, mbti, time-management, career-development, communication)
 * - industry/ - отраслевые знания (travel/aviation, travel/mice, travel/tourism, travel/concierge)
 */
function categorizeContent(filePath: string, frontmatter: Record<string, unknown>): { category: string; subcategory: string } {
  const pathParts = filePath.split('/')

  // Find the position after 'articles' in path
  const articlesIdx = pathParts.indexOf('articles')
  if (articlesIdx === -1 || articlesIdx >= pathParts.length - 1) {
    return { category: 'personal', subcategory: 'general' }
  }

  // Get current folder structure after 'articles'
  const afterArticles = pathParts.slice(articlesIdx + 1)
  const currentTopLevel = afterArticles[0] // core, functional, industry, mbti, etc.

  // === INDUSTRY CONTENT ===
  // industry/travel/* should stay as industry/travel
  if (currentTopLevel === 'industry') {
    const subPath = afterArticles.slice(1, -1).join('/') // e.g., travel/mice, travel/aviation
    return { category: 'industry', subcategory: subPath || 'travel' }
  }

  // === MBTI CONTENT (existing structure) ===
  // mbti/* stays as personal/psychology/mbti
  if (currentTopLevel === 'mbti') {
    return { category: 'personal', subcategory: 'psychology/mbti' }
  }

  // Individual MBTI type folders (enfj, enfp, intj, etc.)
  const mbtiTypes = ['enfj', 'enfp', 'entj', 'entp', 'esfj', 'esfp', 'estj', 'estp',
                     'infj', 'infp', 'intj', 'intp', 'isfj', 'isfp', 'istj', 'istp']
  if (mbtiTypes.includes(currentTopLevel)) {
    return { category: 'personal', subcategory: 'psychology/mbti' }
  }

  // === TRANSFORMATION ===
  if (currentTopLevel === 'transformation') {
    return { category: 'personal', subcategory: 'change-management' }
  }

  // === CORE CONTENT (needs reassignment) ===
  if (currentTopLevel === 'core') {
    const secondLevel = afterArticles[1] // psychology, soft-skills, digital, change-management
    const thirdLevel = afterArticles[2] // leadership, time-management, etc.

    // Psychology & emotional intelligence -> personal
    if (secondLevel === 'psychology' || secondLevel === 'emotional-intelligence') {
      return { category: 'personal', subcategory: 'psychology' }
    }

    // Digital skills -> personal
    if (secondLevel === 'digital') {
      return { category: 'personal', subcategory: 'digital-skills' }
    }

    // Change management -> personal
    if (secondLevel === 'change-management') {
      return { category: 'personal', subcategory: 'change-management' }
    }

    // Soft skills - split between business and personal
    if (secondLevel === 'soft-skills') {
      // Business skills
      if (['leadership', 'team-management', 'project-management', 'negotiation', 'knowledge-management'].includes(thirdLevel)) {
        return { category: 'business', subcategory: thirdLevel }
      }
      // Personal development skills
      if (['time-management', 'career-development', 'presentations', 'problem-solving', 'systems-thinking'].includes(thirdLevel)) {
        return { category: 'personal', subcategory: thirdLevel || 'skills' }
      }
      // Communication can be personal
      if (thirdLevel === 'communication') {
        return { category: 'personal', subcategory: 'communication' }
      }
    }

    return { category: 'personal', subcategory: secondLevel || 'general' }
  }

  // === FUNCTIONAL CONTENT (business-focused) ===
  if (currentTopLevel === 'functional') {
    const secondLevel = afterArticles[1] // marketing, sales, operations, finance, strategy

    if (['marketing', 'sales', 'operations', 'finance'].includes(secondLevel)) {
      return { category: 'business', subcategory: secondLevel }
    }

    if (secondLevel === 'strategy') {
      return { category: 'business', subcategory: 'strategy' }
    }

    return { category: 'business', subcategory: secondLevel || 'operations' }
  }

  // Default fallback
  return { category: 'personal', subcategory: 'general' }
}

function cleanContent(content: string): { cleaned: string; issues: string[] } {
  let cleaned = content
  const issues: string[] = []

  // Remove problematic patterns
  for (const pattern of PATTERNS_TO_REMOVE) {
    const matches = cleaned.match(pattern)
    if (matches) {
      issues.push(`Removed ${matches.length} matches of ${pattern.source.slice(0, 30)}...`)
    }
    cleaned = cleaned.replace(pattern, '')
  }

  // Apply formatting fixes
  for (const [pattern, replacement] of FORMATTING_FIXES) {
    cleaned = cleaned.replace(pattern, replacement)
  }

  // Remove lines that are just whitespace after Notion remnants removal
  cleaned = cleaned.replace(/^\s*\n/gm, '\n')

  return { cleaned, issues }
}

function generateTags(content: string, title: string): string[] {
  const tagKeywords: Record<string, string[]> = {
    'leadership': ['лидер', 'руковод', 'менеджер', 'команд'],
    'management': ['управлен', 'менеджмент', 'организац'],
    'communication': ['коммуникац', 'общени', 'перегов'],
    'time-management': ['время', 'планирован', 'приоритет'],
    'project-management': ['проект', 'agile', 'scrum'],
    'psychology': ['психолог', 'эмоц', 'поведен'],
    'motivation': ['мотивац', 'вовлечен'],
    'delegation': ['делегир'],
    'feedback': ['обратн', 'связь'],
    'teamwork': ['команд', 'сотруднич'],
  }

  const tags: Set<string> = new Set()
  const lowerContent = (content + ' ' + title).toLowerCase()

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(kw => lowerContent.includes(kw))) {
      tags.add(tag)
    }
  }

  return Array.from(tags).slice(0, 8) // Max 8 tags
}

function processFile(filePath: string): ContentFile | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data: frontmatter, content } = matter(fileContent)

    const issues: string[] = []
    let needsUpdate = false

    // Clean content
    const { cleaned, issues: contentIssues } = cleanContent(content)
    if (contentIssues.length > 0) {
      needsUpdate = true
      issues.push(...contentIssues)
    }

    // Check for MindTools in content
    if (content.toLowerCase().includes('mindtools')) {
      needsUpdate = true
      issues.push('Contains MindTools reference')
    }

    // Check for broken formatting
    if (content.includes('**') && !content.match(/\*\*[^*]+\*\*/)) {
      issues.push('Possibly broken bold formatting')
    }

    // Update categories
    const { category, subcategory } = categorizeContent(filePath, frontmatter)
    if (frontmatter.category !== category || frontmatter.subcategory !== subcategory) {
      needsUpdate = true
      issues.push(`Category update: ${frontmatter.category}/${frontmatter.subcategory} → ${category}/${subcategory}`)
    }

    // Generate better tags if current ones look auto-generated or truncated
    const currentTags = frontmatter.tags as string[] || []
    if (currentTags.some(t => t.length < 4) || currentTags.length < 3) {
      const newTags = generateTags(cleaned, frontmatter.title as string || '')
      if (newTags.length > 0) {
        needsUpdate = true
        issues.push(`Updated tags: [${newTags.join(', ')}]`)
        frontmatter.tags = newTags
      }
    }

    // Update frontmatter
    frontmatter.category = category
    frontmatter.subcategory = subcategory

    return {
      path: filePath,
      frontmatter,
      content: cleaned,
      needsUpdate,
      issues
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error)
    return null
  }
}

function getAllMdxFiles(dir: string): string[] {
  const files: string[] = []

  function scan(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        scan(fullPath)
      } else if (entry.name.endsWith('.mdx')) {
        files.push(fullPath)
      }
    }
  }

  scan(dir)
  return files
}

async function main() {
  console.log('🔍 Scanning content files...\n')

  const files = getAllMdxFiles(ARTICLES_DIR)
  console.log(`Found ${files.length} MDX files\n`)

  const results: ContentFile[] = []
  let needsUpdateCount = 0

  for (const file of files) {
    const result = processFile(file)
    if (result) {
      results.push(result)
      if (result.needsUpdate) {
        needsUpdateCount++
      }
    }
  }

  console.log(`\n📊 Analysis complete:`)
  console.log(`   Total files: ${results.length}`)
  console.log(`   Need updates: ${needsUpdateCount}`)
  console.log('')

  // Show files that need updates
  const filesToUpdate = results.filter(r => r.needsUpdate)

  if (filesToUpdate.length > 0) {
    console.log('📝 Files needing updates:\n')

    for (const file of filesToUpdate) {
      const relativePath = path.relative(ARTICLES_DIR, file.path)
      console.log(`  ${relativePath}`)
      for (const issue of file.issues) {
        console.log(`    - ${issue}`)
      }
      console.log('')
    }

    // Check for --apply flag
    if (process.argv.includes('--apply')) {
      console.log('\n✏️  Applying changes...\n')

      for (const file of filesToUpdate) {
        const newContent = matter.stringify(file.content, file.frontmatter)
        fs.writeFileSync(file.path, newContent)
        console.log(`  ✓ Updated: ${path.relative(ARTICLES_DIR, file.path)}`)
      }

      console.log(`\n✅ Updated ${filesToUpdate.length} files`)
    } else {
      console.log('\n💡 Run with --apply flag to apply changes')
    }
  } else {
    console.log('✅ All files are clean!')
  }
}

main().catch(console.error)
