/**
 * Frontmatter Enrichment Script
 *
 * Analyzes MDX content and enriches frontmatter with:
 * - department_tags based on content
 * - difficulty based on content complexity
 * - prerequisites based on topic dependencies
 * - xp_reward based on duration and difficulty
 * - competency_level based on difficulty
 */

import fs from 'fs'
import path from 'path'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'articles')

// ============================================================================
// Department Tag Rules
// ============================================================================

const DEPARTMENT_RULES: Array<{
  keywords: string[]
  department: string
}> = [
  { keywords: ['продаж', 'sales', 'клиент', 'сделк', 'лид', 'crm', 'pipeline', 'b2b'], department: 'sales' },
  { keywords: ['маркетинг', 'marketing', 'бренд', 'smm', 'контент', 'реклам', 'pr'], department: 'marketing' },
  { keywords: ['операц', 'process', 'sla', 'vendor', 'логистик', 'procurement'], department: 'operations' },
  { keywords: ['mice', 'event', 'мероприят', 'конференц', 'venue'], department: 'mice' },
  { keywords: ['hr', 'найм', 'onboarding', 'персонал', 'команд', 'обучен'], department: 'hr' },
  { keywords: ['финанс', 'бюджет', 'p&l', 'экономик', 'roi', 'margin'], department: 'finance' },
  { keywords: ['gds', 'авиа', 'билет', 'бронирован', 'amadeus', 'sabre'], department: 'aviation' },
  { keywords: ['тур', 'направлен', 'виз', 'страхован', 'отель'], department: 'tourism' },
  { keywords: ['vip', 'консьерж', 'персонализ', 'премиум'], department: 'concierge' },
]

// ============================================================================
// Difficulty Assessment Rules
// ============================================================================

interface DifficultyFactors {
  wordCount: number
  headingCount: number
  codeBlocks: number
  technicalTerms: number
  existingDifficulty?: string
}

function assessDifficulty(content: string, factors: DifficultyFactors): 'beginner' | 'intermediate' | 'advanced' {
  // If already set to advanced, keep it
  if (factors.existingDifficulty === 'advanced') return 'advanced'

  let score = 0

  // Word count scoring
  if (factors.wordCount > 2000) score += 2
  else if (factors.wordCount > 1000) score += 1

  // Heading count (more structure = more complex)
  if (factors.headingCount > 10) score += 2
  else if (factors.headingCount > 5) score += 1

  // Technical terms
  if (factors.technicalTerms > 15) score += 2
  else if (factors.technicalTerms > 8) score += 1

  // Code blocks
  if (factors.codeBlocks > 3) score += 1

  if (score >= 4) return 'advanced'
  if (score >= 2) return 'intermediate'
  return 'beginner'
}

// Technical terms to detect
const TECHNICAL_TERMS = [
  'api', 'sdk', 'gds', 'pnr', 'ndc', 'bsp', 'iata', 'roi', 'kpi', 'nps',
  'csat', 'ltv', 'cac', 'mrr', 'arpu', 'churn', 'cohort', 'funnel',
  'saas', 'crm', 'erp', 'b2b', 'b2c', 'rfp', 'rfi', 'sla', 'poc',
  'mvp', 'okr', 'adkar', 'prosci', 'scrum', 'kanban', 'agile', 'lean',
  'mbti', 'disc', 'eq', 'iq', 'swot', 'pest', 'canvas'
]

// ============================================================================
// XP Calculation
// ============================================================================

function calculateXP(duration: number, difficulty: string): number {
  const baseXP = Math.ceil(duration * 1.5)
  const multiplier = difficulty === 'advanced' ? 1.5 : difficulty === 'intermediate' ? 1.25 : 1
  return Math.ceil(baseXP * multiplier)
}

// ============================================================================
// Competency Level Mapping
// ============================================================================

function getCompetencyLevel(difficulty: string): number {
  switch (difficulty) {
    case 'advanced': return 4
    case 'intermediate': return 3
    default: return 2
  }
}

// ============================================================================
// Main Processing
// ============================================================================

interface EnrichmentResult {
  file: string
  changes: string[]
}

function enrichFrontmatter(filePath: string): EnrichmentResult | null {
  const content = fs.readFileSync(filePath, 'utf-8')
  const changes: string[] = []

  // Parse frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch) return null

  const frontmatter = frontmatterMatch[1]
  const body = content.slice(frontmatterMatch[0].length)

  // Parse existing values
  const existingDepartments = frontmatter.match(/department_tags:\s*\[(.*?)\]/)?.[1] || ''
  const existingDifficulty = frontmatter.match(/difficulty:\s*"(\w+)"/)?.[1]
  const existingDuration = parseInt(frontmatter.match(/duration:\s*(\d+)/)?.[1] || '10')

  // Analyze content
  const fullText = (frontmatter + body).toLowerCase()
  const wordCount = body.split(/\s+/).length
  const headingCount = (body.match(/^#{1,6}\s/gm) || []).length
  const codeBlocks = (body.match(/```/g) || []).length / 2
  const technicalTerms = TECHNICAL_TERMS.filter(term => fullText.includes(term)).length

  // 1. Detect departments
  const detectedDepartments = new Set<string>()
  for (const rule of DEPARTMENT_RULES) {
    if (rule.keywords.some(kw => fullText.includes(kw))) {
      detectedDepartments.add(rule.department)
    }
  }

  // 2. Assess difficulty
  const assessedDifficulty = assessDifficulty(body, {
    wordCount,
    headingCount,
    codeBlocks,
    technicalTerms,
    existingDifficulty
  })

  // 3. Calculate XP
  const newXP = calculateXP(existingDuration, assessedDifficulty)

  // 4. Get competency level
  const newCompetencyLevel = getCompetencyLevel(assessedDifficulty)

  // Build new frontmatter
  let newFrontmatter = frontmatter

  // Update department_tags if we found any
  if (detectedDepartments.size > 0 && existingDepartments === '') {
    const deptArray = Array.from(detectedDepartments).map(d => `"${d}"`)
    newFrontmatter = newFrontmatter.replace(
      /department_tags:\s*\[\]/,
      `department_tags: [${deptArray.join(', ')}]`
    )
    changes.push(`departments: [${Array.from(detectedDepartments).join(', ')}]`)
  }

  // Update difficulty if changed
  if (existingDifficulty && existingDifficulty !== assessedDifficulty) {
    newFrontmatter = newFrontmatter.replace(
      /difficulty:\s*"\w+"/,
      `difficulty: "${assessedDifficulty}"`
    )
    changes.push(`difficulty: ${existingDifficulty} → ${assessedDifficulty}`)
  }

  // Update XP
  const existingXP = parseInt(frontmatter.match(/xp_reward:\s*(\d+)/)?.[1] || '0')
  if (existingXP !== newXP) {
    newFrontmatter = newFrontmatter.replace(
      /xp_reward:\s*\d+/,
      `xp_reward: ${newXP}`
    )
    changes.push(`xp: ${existingXP} → ${newXP}`)
  }

  // Update competency level
  const existingLevel = parseInt(frontmatter.match(/competency_level:\s*(\d+)/)?.[1] || '2')
  if (existingLevel !== newCompetencyLevel) {
    newFrontmatter = newFrontmatter.replace(
      /competency_level:\s*\d+/,
      `competency_level: ${newCompetencyLevel}`
    )
    changes.push(`level: ${existingLevel} → ${newCompetencyLevel}`)
  }

  if (changes.length === 0) return null

  // Write updated content
  const newContent = `---\n${newFrontmatter}\n---${body}`
  fs.writeFileSync(filePath, newContent)

  return {
    file: path.relative(CONTENT_DIR, filePath),
    changes
  }
}

function scanAndEnrich(dryRun: boolean = true): EnrichmentResult[] {
  const results: EnrichmentResult[] = []

  function scanDir(dir: string) {
    if (!fs.existsSync(dir)) return

    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        scanDir(fullPath)
      } else if (entry.name.endsWith('.mdx')) {
        const result = enrichFrontmatter(fullPath)
        if (result) {
          results.push(result)
          console.log(`✅ ${result.file}`)
          result.changes.forEach(c => console.log(`   └─ ${c}`))
        }
      }
    }
  }

  scanDir(CONTENT_DIR)
  return results
}

// ============================================================================
// Main
// ============================================================================

console.log('🔍 Enriching frontmatter...\n')

const results = scanAndEnrich(false)

console.log(`\n📊 Summary: ${results.length} files updated`)

if (results.length > 0) {
  console.log('\n📝 Run npm run sync-content to update database')
}
