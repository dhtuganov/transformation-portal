import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { ContentFrontmatter, ContentItem } from '@/types/content'

const contentDirectory = path.join(process.cwd(), 'content', 'articles')

export function getContentFiles(category?: string): string[] {
  const baseDir = category
    ? path.join(contentDirectory, category)
    : contentDirectory

  if (!fs.existsSync(baseDir)) {
    return []
  }

  const getAllFiles = (dir: string): string[] => {
    const files: string[] = []
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        files.push(...getAllFiles(fullPath))
      } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
        files.push(fullPath)
      }
    }

    return files
  }

  return getAllFiles(baseDir)
}

export function getContentBySlug(slug: string): ContentItem | null {
  // Try different possible paths
  const possiblePaths = [
    path.join(contentDirectory, `${slug}.mdx`),
    path.join(contentDirectory, `${slug}.md`),
    path.join(contentDirectory, slug, 'index.mdx'),
    path.join(contentDirectory, slug, 'index.md'),
  ]

  // Also try with category prefix
  const categories = ['mbti', 'skills', 'transformation']
  for (const category of categories) {
    possiblePaths.push(
      path.join(contentDirectory, category, `${slug}.mdx`),
      path.join(contentDirectory, category, `${slug}.md`)
    )
  }

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)

      return {
        slug,
        content,
        ...(data as ContentFrontmatter),
      }
    }
  }

  return null
}

export function getAllContent(): ContentItem[] {
  const files = getContentFiles()

  const content = files.map((filePath) => {
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)

    // Extract slug from file path
    const relativePath = path.relative(contentDirectory, filePath)
    const slug = relativePath
      .replace(/\\/g, '/')
      .replace(/\.mdx?$/, '')
      .replace(/\/index$/, '')

    return {
      slug,
      content,
      ...(data as ContentFrontmatter),
    }
  })

  // Filter published only and sort by date
  return content
    .filter((item) => item.published !== false)
    .sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      return 0
    })
}

export function getContentByCategory(category: string): ContentItem[] {
  return getAllContent().filter((item) => item.category === category)
}

export function getContentByMBTIType(mbtiType: string): ContentItem[] {
  return getAllContent().filter(
    (item) =>
      item.mbti_types?.includes(mbtiType) ||
      item.mbti_types?.includes('all') ||
      !item.mbti_types?.length
  )
}

export function getCategories(): string[] {
  const content = getAllContent()
  const categories = new Set(content.map((item) => item.category).filter(Boolean))
  return Array.from(categories) as string[]
}
