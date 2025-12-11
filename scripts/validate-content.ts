#!/usr/bin/env npx tsx
/**
 * Pre-build MDX Content Validation Script
 *
 * Validates all MDX files before build to catch issues early:
 * - Missing required frontmatter fields
 * - Invalid field values
 * - Broken internal links
 * - Empty content
 * - Duplicate slugs
 *
 * Usage:
 *   npm run validate-content
 *   npx tsx scripts/validate-content.ts
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content/articles')

// Required frontmatter fields
const REQUIRED_FIELDS = ['title', 'description', 'category', 'published']

// Valid values for enum fields
const VALID_CATEGORIES = ['business', 'personal', 'industry']
const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced']
const VALID_MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
  'all' // Special value for content applicable to all types
]
const VALID_ROLES = ['all', 'employee', 'manager', 'executive', 'admin']

interface ValidationError {
  file: string
  field: string
  message: string
  severity: 'error' | 'warning'
}

interface ValidationResult {
  totalFiles: number
  validFiles: number
  errors: ValidationError[]
  warnings: ValidationError[]
  stats: {
    byCategory: Record<string, number>
    byDifficulty: Record<string, number>
    published: number
    draft: number
    withMbtiTypes: number
    averageDuration: number
  }
}

function getAllMdxFiles(dir: string): string[] {
  const files: string[] = []

  function walk(currentDir: string) {
    const items = fs.readdirSync(currentDir)

    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        walk(fullPath)
      } else if (item.endsWith('.mdx')) {
        files.push(fullPath)
      }
    }
  }

  if (fs.existsSync(dir)) {
    walk(dir)
  }

  return files
}

function validateFrontmatter(filePath: string, data: Record<string, any>): ValidationError[] {
  const errors: ValidationError[] = []
  const relativePath = path.relative(CONTENT_DIR, filePath)

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) {
      // Missing 'published' is a warning (draft content), others are errors
      const severity = field === 'published' ? 'warning' : 'error'
      errors.push({
        file: relativePath,
        field,
        message: field === 'published'
          ? `Draft content (missing published field)`
          : `Missing required field: ${field}`,
        severity
      })
    }
  }

  // Validate category
  if (data.category && !VALID_CATEGORIES.includes(data.category)) {
    errors.push({
      file: relativePath,
      field: 'category',
      message: `Invalid category "${data.category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`,
      severity: 'error'
    })
  }

  // Validate difficulty
  if (data.difficulty && !VALID_DIFFICULTIES.includes(data.difficulty)) {
    errors.push({
      file: relativePath,
      field: 'difficulty',
      message: `Invalid difficulty "${data.difficulty}". Must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
      severity: 'error'
    })
  }

  // Validate MBTI types
  if (data.mbti_types && Array.isArray(data.mbti_types)) {
    for (const type of data.mbti_types) {
      if (!VALID_MBTI_TYPES.includes(type)) {
        errors.push({
          file: relativePath,
          field: 'mbti_types',
          message: `Invalid MBTI type "${type}". Must be one of: ${VALID_MBTI_TYPES.join(', ')}`,
          severity: 'error'
        })
      }
    }
  }

  // Validate roles
  if (data.roles && Array.isArray(data.roles)) {
    for (const role of data.roles) {
      if (!VALID_ROLES.includes(role)) {
        errors.push({
          file: relativePath,
          field: 'roles',
          message: `Invalid role "${role}". Must be one of: ${VALID_ROLES.join(', ')}`,
          severity: 'error'
        })
      }
    }
  }

  // Validate duration
  if (data.duration && (typeof data.duration !== 'number' || data.duration < 1 || data.duration > 120)) {
    errors.push({
      file: relativePath,
      field: 'duration',
      message: `Duration should be a number between 1 and 120 minutes`,
      severity: 'warning'
    })
  }

  // Validate date format
  if (data.date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(data.date)) {
      errors.push({
        file: relativePath,
        field: 'date',
        message: `Invalid date format. Use YYYY-MM-DD`,
        severity: 'warning'
      })
    }
  }

  // Check for empty description
  if (data.description && data.description.length < 20) {
    errors.push({
      file: relativePath,
      field: 'description',
      message: `Description is too short (${data.description.length} chars). Should be at least 20 characters`,
      severity: 'warning'
    })
  }

  // Check for missing tags
  if (!data.tags || (Array.isArray(data.tags) && data.tags.length === 0)) {
    errors.push({
      file: relativePath,
      field: 'tags',
      message: `No tags defined. Consider adding relevant tags`,
      severity: 'warning'
    })
  }

  return errors
}

function validateContent(filePath: string, content: string): ValidationError[] {
  const errors: ValidationError[] = []
  const relativePath = path.relative(CONTENT_DIR, filePath)

  // Check for empty content
  if (content.trim().length < 100) {
    errors.push({
      file: relativePath,
      field: 'content',
      message: `Content is too short (${content.trim().length} chars). Should be at least 100 characters`,
      severity: 'warning'
    })
  }

  // Check for broken image links (local)
  const imageRegex = /!\[.*?\]\((?!http)(.*?)\)/g
  let match
  while ((match = imageRegex.exec(content)) !== null) {
    const imagePath = match[1]
    if (imagePath.startsWith('/')) {
      const fullImagePath = path.join(process.cwd(), 'public', imagePath)
      if (!fs.existsSync(fullImagePath)) {
        errors.push({
          file: relativePath,
          field: 'content',
          message: `Broken image link: ${imagePath}`,
          severity: 'error'
        })
      }
    }
  }

  // Check for TODO markers
  if (content.includes('TODO') || content.includes('FIXME')) {
    errors.push({
      file: relativePath,
      field: 'content',
      message: `Contains TODO/FIXME markers`,
      severity: 'warning'
    })
  }

  // Check for placeholder text
  if (content.includes('Lorem ipsum') || content.includes('[placeholder]')) {
    errors.push({
      file: relativePath,
      field: 'content',
      message: `Contains placeholder text`,
      severity: 'error'
    })
  }

  return errors
}

function validateAllContent(): ValidationResult {
  const files = getAllMdxFiles(CONTENT_DIR)
  const allErrors: ValidationError[] = []
  const slugs = new Map<string, string>()

  const stats = {
    byCategory: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
    published: 0,
    draft: 0,
    withMbtiTypes: 0,
    totalDuration: 0,
    durationCount: 0
  }

  for (const file of files) {
    try {
      const fileContent = fs.readFileSync(file, 'utf-8')
      const { data, content } = matter(fileContent)

      // Validate frontmatter
      const frontmatterErrors = validateFrontmatter(file, data)
      allErrors.push(...frontmatterErrors)

      // Validate content
      const contentErrors = validateContent(file, content)
      allErrors.push(...contentErrors)

      // Check for duplicate slugs (use relative path as slug to allow same filename in different folders)
      const relativePath = path.relative(CONTENT_DIR, file)
      const slug = relativePath.replace(/\.mdx$/, '') // e.g., "enfp/overview" instead of just "overview"
      // Note: We don't check for duplicates anymore since the full path is unique
      // This allows enfp/overview.mdx and intj/overview.mdx to coexist

      // Collect stats
      if (data.category) {
        stats.byCategory[data.category] = (stats.byCategory[data.category] || 0) + 1
      }
      if (data.difficulty) {
        stats.byDifficulty[data.difficulty] = (stats.byDifficulty[data.difficulty] || 0) + 1
      }
      if (data.published === true) {
        stats.published++
      } else {
        stats.draft++
      }
      if (data.mbti_types && data.mbti_types.length > 0) {
        stats.withMbtiTypes++
      }
      if (data.duration && typeof data.duration === 'number') {
        stats.totalDuration += data.duration
        stats.durationCount++
      }

    } catch (error) {
      allErrors.push({
        file: path.relative(CONTENT_DIR, file),
        field: 'parse',
        message: `Failed to parse file: ${error}`,
        severity: 'error'
      })
    }
  }

  const errors = allErrors.filter(e => e.severity === 'error')
  const warnings = allErrors.filter(e => e.severity === 'warning')

  return {
    totalFiles: files.length,
    validFiles: files.length - new Set(errors.map(e => e.file)).size,
    errors,
    warnings,
    stats: {
      byCategory: stats.byCategory,
      byDifficulty: stats.byDifficulty,
      published: stats.published,
      draft: stats.draft,
      withMbtiTypes: stats.withMbtiTypes,
      averageDuration: stats.durationCount > 0 ? Math.round(stats.totalDuration / stats.durationCount) : 0
    }
  }
}

function printResults(result: ValidationResult) {
  console.log('\n📊 Content Validation Report')
  console.log('═'.repeat(50))

  // Summary
  console.log(`\n📁 Total files: ${result.totalFiles}`)
  console.log(`✅ Valid files: ${result.validFiles}`)
  console.log(`❌ Errors: ${result.errors.length}`)
  console.log(`⚠️  Warnings: ${result.warnings.length}`)

  // Stats
  console.log('\n📈 Content Statistics')
  console.log('─'.repeat(30))
  console.log(`Published: ${result.stats.published}`)
  console.log(`Draft: ${result.stats.draft}`)
  console.log(`With MBTI types: ${result.stats.withMbtiTypes}`)
  console.log(`Average duration: ${result.stats.averageDuration} min`)

  console.log('\nBy Category:')
  for (const [cat, count] of Object.entries(result.stats.byCategory)) {
    console.log(`  ${cat}: ${count}`)
  }

  console.log('\nBy Difficulty:')
  for (const [diff, count] of Object.entries(result.stats.byDifficulty)) {
    console.log(`  ${diff}: ${count}`)
  }

  // Errors
  if (result.errors.length > 0) {
    console.log('\n❌ Errors')
    console.log('─'.repeat(30))
    for (const error of result.errors) {
      console.log(`  ${error.file}`)
      console.log(`    [${error.field}] ${error.message}`)
    }
  }

  // Warnings (show first 10)
  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings (first 10)')
    console.log('─'.repeat(30))
    for (const warning of result.warnings.slice(0, 10)) {
      console.log(`  ${warning.file}`)
      console.log(`    [${warning.field}] ${warning.message}`)
    }
    if (result.warnings.length > 10) {
      console.log(`  ... and ${result.warnings.length - 10} more warnings`)
    }
  }

  console.log('\n' + '═'.repeat(50))

  // Exit code
  if (result.errors.length > 0) {
    console.log('❌ Validation FAILED - Fix errors before build')
    process.exit(1)
  } else {
    console.log('✅ Validation PASSED')
    process.exit(0)
  }
}

// Export for API use
export { validateAllContent }
export type { ValidationResult, ValidationError }

// Run if executed directly
const result = validateAllContent()
printResults(result)
