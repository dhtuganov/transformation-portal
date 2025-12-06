/**
 * Sync MDX Content to Supabase
 *
 * This script reads all MDX files from content/ directory and syncs their
 * metadata to the content_metadata table in Supabase.
 *
 * Usage:
 *   npx tsx scripts/sync-content.ts
 *
 * Or add to package.json:
 *   "sync-content": "tsx scripts/sync-content.ts"
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const CONTENT_DIR = path.join(process.cwd(), 'content', 'articles')

interface ContentFrontmatter {
  title: string
  description?: string
  author?: string
  date?: string
  category?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  duration?: number
  tags?: string[]
  mbti_types?: string[]
  roles?: string[]
  published?: boolean
  featured?: boolean
  sort_order?: number
  videos?: Array<{
    url: string
    title: string
    duration?: number
    platform?: string
  }>
  external_links?: Array<{
    url: string
    title: string
    description?: string
  }>
}

interface ContentMetadata {
  slug: string
  title: string
  description: string | null
  author: string | null
  category: string | null
  difficulty: string | null
  duration: number | null
  tags: string[]
  mbti_types: string[]
  roles: string[]
  videos: object[]
  external_links: object[]
  published: boolean
  featured: boolean
  sort_order: number
  content_updated_at: string
}

function getAllMdxFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = []

  if (!fs.existsSync(dir)) {
    return files
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...getAllMdxFiles(fullPath, baseDir))
    } else if (entry.name.endsWith('.mdx')) {
      files.push(fullPath)
    }
  }

  return files
}

function parseContentFile(filePath: string): ContentMetadata | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const parsed = matter(content)
    const data = parsed.data as ContentFrontmatter

    // Generate slug from file path
    const relativePath = path.relative(CONTENT_DIR, filePath)
    const slug = relativePath.replace(/\.mdx$/, '').replace(/\\/g, '/')

    // Get file modification time
    const stats = fs.statSync(filePath)

    return {
      slug,
      title: data.title || path.basename(filePath, '.mdx'),
      description: data.description || null,
      author: data.author || null,
      category: data.category || null,
      difficulty: data.difficulty || null,
      duration: data.duration || null,
      tags: data.tags || [],
      mbti_types: data.mbti_types || [],
      roles: data.roles || [],
      videos: data.videos || [],
      external_links: data.external_links || [],
      published: data.published !== false,
      featured: data.featured || false,
      sort_order: data.sort_order || 0,
      content_updated_at: stats.mtime.toISOString(),
    }
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error)
    return null
  }
}

async function syncContent() {
  console.log('Starting content sync...')
  console.log(`Content directory: ${CONTENT_DIR}`)

  // Get all MDX files
  const mdxFiles = getAllMdxFiles(CONTENT_DIR)
  console.log(`Found ${mdxFiles.length} MDX files`)

  if (mdxFiles.length === 0) {
    console.log('No MDX files found')
    return
  }

  // Parse all files
  const contentItems = mdxFiles
    .map(parseContentFile)
    .filter((item): item is ContentMetadata => item !== null)

  console.log(`Parsed ${contentItems.length} content items`)

  // Get existing slugs from database
  const { data: existingSlugs, error: fetchError } = await supabase
    .from('content_metadata')
    .select('slug')

  if (fetchError) {
    console.error('Error fetching existing content:', fetchError)
    return
  }

  const existingSlugSet = new Set(existingSlugs?.map(item => item.slug) || [])

  // Separate into insert and update operations
  const toInsert = contentItems.filter(item => !existingSlugSet.has(item.slug))
  const toUpdate = contentItems.filter(item => existingSlugSet.has(item.slug))

  console.log(`New items: ${toInsert.length}, Updates: ${toUpdate.length}`)

  // Insert new items
  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('content_metadata')
      .insert(toInsert)

    if (insertError) {
      console.error('Error inserting content:', insertError)
    } else {
      console.log(`Inserted ${toInsert.length} new items`)
    }
  }

  // Update existing items
  for (const item of toUpdate) {
    const { error: updateError } = await supabase
      .from('content_metadata')
      .update({
        title: item.title,
        description: item.description,
        author: item.author,
        category: item.category,
        difficulty: item.difficulty,
        duration: item.duration,
        tags: item.tags,
        mbti_types: item.mbti_types,
        roles: item.roles,
        videos: item.videos,
        external_links: item.external_links,
        published: item.published,
        featured: item.featured,
        sort_order: item.sort_order,
        content_updated_at: item.content_updated_at,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', item.slug)

    if (updateError) {
      console.error(`Error updating ${item.slug}:`, updateError)
    }
  }

  if (toUpdate.length > 0) {
    console.log(`Updated ${toUpdate.length} existing items`)
  }

  // Find and report orphaned database entries (files that were deleted)
  const currentSlugs = new Set(contentItems.map(item => item.slug))
  const orphanedSlugs = [...existingSlugSet].filter(slug => !currentSlugs.has(slug))

  if (orphanedSlugs.length > 0) {
    console.log(`\nOrphaned entries (MDX files deleted):`)
    orphanedSlugs.forEach(slug => console.log(`  - ${slug}`))
    console.log('Run with --cleanup flag to remove these entries')

    if (process.argv.includes('--cleanup')) {
      const { error: deleteError } = await supabase
        .from('content_metadata')
        .delete()
        .in('slug', orphanedSlugs)

      if (deleteError) {
        console.error('Error deleting orphaned entries:', deleteError)
      } else {
        console.log(`Deleted ${orphanedSlugs.length} orphaned entries`)
      }
    }
  }

  console.log('\nSync complete!')
}

// Run sync
syncContent().catch(console.error)
