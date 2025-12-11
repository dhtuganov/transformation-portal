import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content/articles')

const VALID_CATEGORIES = ['business', 'personal', 'industry']
const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced']
const VALID_MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
  'all' // Special value for content applicable to all types
]

interface ContentFile {
  slug: string
  path: string
  title: string
  category: string
  subcategory?: string
  difficulty?: string
  duration?: number
  published: boolean
  mbtiTypes: string[]
  tags: string[]
  hasErrors: boolean
  errors: string[]
  warnings: string[]
  wordCount: number
  lastModified: string
}

interface ContentStats {
  totalFiles: number
  publishedFiles: number
  draftFiles: number
  filesWithErrors: number
  filesWithWarnings: number
  byCategory: Record<string, number>
  byDifficulty: Record<string, number>
  byMbtiType: Record<string, number>
  averageDuration: number
  averageWordCount: number
  totalWordCount: number
  files: ContentFile[]
}

function getAllMdxFiles(dir: string): string[] {
  const files: string[] = []

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return
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

  walk(dir)
  return files
}

function validateFile(filePath: string): ContentFile {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)
  const relativePath = path.relative(CONTENT_DIR, filePath)
  const slug = path.basename(filePath, '.mdx')
  const stat = fs.statSync(filePath)

  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!data.title) errors.push('Missing title')
  if (!data.description) errors.push('Missing description')
  if (!data.category) errors.push('Missing category')
  // Missing published is a warning (draft content), not an error
  if (data.published === undefined) warnings.push('Draft content (missing published flag)')

  // Validate category
  if (data.category && !VALID_CATEGORIES.includes(data.category)) {
    errors.push(`Invalid category: ${data.category}`)
  }

  // Validate difficulty
  if (data.difficulty && !VALID_DIFFICULTIES.includes(data.difficulty)) {
    errors.push(`Invalid difficulty: ${data.difficulty}`)
  }

  // Validate MBTI types
  if (data.mbti_types && Array.isArray(data.mbti_types)) {
    for (const type of data.mbti_types) {
      if (!VALID_MBTI_TYPES.includes(type)) {
        errors.push(`Invalid MBTI type: ${type}`)
      }
    }
  }

  // Warnings
  if (!data.tags || data.tags.length === 0) {
    warnings.push('No tags defined')
  }
  if (data.description && data.description.length < 20) {
    warnings.push('Description too short')
  }
  if (content.trim().length < 100) {
    warnings.push('Content too short')
  }
  if (content.includes('TODO') || content.includes('FIXME')) {
    warnings.push('Contains TODO/FIXME')
  }

  // Word count
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length

  return {
    slug,
    path: relativePath,
    title: data.title || slug,
    category: data.category || 'unknown',
    subcategory: data.subcategory,
    difficulty: data.difficulty,
    duration: data.duration,
    published: data.published === true,
    mbtiTypes: data.mbti_types || [],
    tags: data.tags || [],
    hasErrors: errors.length > 0,
    errors,
    warnings,
    wordCount,
    lastModified: stat.mtime.toISOString()
  }
}

function calculateStats(files: ContentFile[]): ContentStats {
  const byCategory: Record<string, number> = {}
  const byDifficulty: Record<string, number> = {}
  const byMbtiType: Record<string, number> = {}

  let totalDuration = 0
  let durationCount = 0
  let totalWordCount = 0

  for (const file of files) {
    // Category
    byCategory[file.category] = (byCategory[file.category] || 0) + 1

    // Difficulty
    if (file.difficulty) {
      byDifficulty[file.difficulty] = (byDifficulty[file.difficulty] || 0) + 1
    }

    // MBTI types
    for (const type of file.mbtiTypes) {
      byMbtiType[type] = (byMbtiType[type] || 0) + 1
    }

    // Duration
    if (file.duration) {
      totalDuration += file.duration
      durationCount++
    }

    // Word count
    totalWordCount += file.wordCount
  }

  return {
    totalFiles: files.length,
    publishedFiles: files.filter(f => f.published).length,
    draftFiles: files.filter(f => !f.published).length,
    filesWithErrors: files.filter(f => f.hasErrors).length,
    filesWithWarnings: files.filter(f => f.warnings.length > 0).length,
    byCategory,
    byDifficulty,
    byMbtiType,
    averageDuration: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
    averageWordCount: files.length > 0 ? Math.round(totalWordCount / files.length) : 0,
    totalWordCount,
    files
  }
}

export async function GET() {
  try {
    // Check admin access
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string }>()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all MDX files
    const mdxFiles = getAllMdxFiles(CONTENT_DIR)
    const files = mdxFiles.map(validateFile)
    const stats = calculateStats(files)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error getting content stats:', error)
    return NextResponse.json(
      { error: 'Failed to get content stats' },
      { status: 500 }
    )
  }
}
