/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Content Database Layer
 *
 * This module provides database-backed content operations for:
 * - Full-text search (Russian language support)
 * - Analytics (views, completion rates)
 * - Personalized recommendations based on MBTI type
 * - Bookmarks and ratings
 *
 * Use alongside content.ts which handles MDX file reading.
 *
 * NOTE: TypeScript types for new tables (content_metadata, content_views, etc.)
 * are not yet generated. Using 'any' casts until `supabase gen types` is run
 * after migration is applied.
 */

import { createClient } from '@/lib/supabase/server'

export interface ContentMetadata {
  id: string
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
  videos: Array<{
    url: string
    title: string
    duration?: number
    platform?: string
  }>
  external_links: Array<{
    url: string
    title: string
    description?: string
  }>
  view_count: number
  unique_viewers: number
  avg_completion_rate: number
  avg_rating: number | null
  rating_count: number
  published: boolean
  featured: boolean
  sort_order: number
  content_updated_at: string | null
  created_at: string
  updated_at: string
}

export interface SearchFilters {
  query?: string
  category?: string
  difficulty?: string
  mbtiType?: string
  limit?: number
}

export interface ContentView {
  content_slug: string
  user_id?: string
  session_id?: string
  duration_seconds?: number
  scroll_depth?: number
  completed?: boolean
}

/**
 * Search content using PostgreSQL full-text search
 * Supports Russian language stemming
 */
export async function searchContent(filters: SearchFilters): Promise<ContentMetadata[]> {
  const supabase = await createClient()

   
  const { data, error } = await (supabase.rpc as any)('search_content', {
    search_query: filters.query || null,
    filter_category: filters.category || null,
    filter_difficulty: filters.difficulty || null,
    filter_mbti_type: filters.mbtiType || null,
    limit_count: filters.limit || 20,
  })

  if (error) {
    console.error('Search error:', error)
    return []
  }

  return data || []
}

/**
 * Get content metadata by slug
 */
export async function getContentMetadata(slug: string): Promise<ContentMetadata | null> {
  const supabase = await createClient()

  const { data, error } = await (supabase.from('content_metadata') as any)
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) {
    console.error('Get metadata error:', error)
    return null
  }

  return data
}

/**
 * Get featured content
 */
export async function getFeaturedContent(limit: number = 5): Promise<ContentMetadata[]> {
  const supabase = await createClient()

  const { data, error } = await (supabase.from('content_metadata') as any)
    .select('*')
    .eq('published', true)
    .eq('featured', true)
    .order('sort_order')
    .limit(limit)

  if (error) {
    console.error('Get featured error:', error)
    return []
  }

  return data || []
}

/**
 * Get popular content by view count
 */
export async function getPopularContent(limit: number = 10): Promise<ContentMetadata[]> {
  const supabase = await createClient()

  const { data, error } = await (supabase.from('content_metadata') as any)
    .select('*')
    .eq('published', true)
    .order('view_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Get popular error:', error)
    return []
  }

  return data || []
}

/**
 * Get content recommendations based on MBTI type
 */
export async function getRecommendedContent(
  mbtiType: string,
  limit: number = 10
): Promise<ContentMetadata[]> {
  const supabase = await createClient()

  const { data, error } = await (supabase.from('content_metadata') as any)
    .select('*')
    .eq('published', true)
    .or(`mbti_types.cs.{${mbtiType}},mbti_types.cs.{all}`)
    .order('avg_rating', { ascending: false, nullsFirst: false })
    .order('view_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Get recommendations error:', error)
    return []
  }

  return data || []
}

/**
 * Record a content view
 */
export async function recordContentView(view: ContentView): Promise<void> {
  const supabase = await createClient()

  const { error } = await (supabase.from('content_views') as any).insert({
    content_slug: view.content_slug,
    user_id: view.user_id || null,
    session_id: view.session_id || null,
    duration_seconds: view.duration_seconds || 0,
    scroll_depth: view.scroll_depth || 0,
    completed: view.completed || false,
  })

  if (error) {
    console.error('Record view error:', error)
  }
}

/**
 * Update view progress (for tracking reading progress)
 */
export async function updateViewProgress(
  viewId: string,
  scrollDepth: number,
  durationSeconds: number,
  completed: boolean
): Promise<void> {
  const supabase = await createClient()

  const { error } = await (supabase.from('content_views') as any)
    .update({
      scroll_depth: scrollDepth,
      duration_seconds: durationSeconds,
      completed,
    })
    .eq('id', viewId)

  if (error) {
    console.error('Update view error:', error)
  }
}

/**
 * Rate content
 */
export async function rateContent(
  contentSlug: string,
  userId: string,
  rating: number,
  feedback?: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await (supabase.from('content_ratings') as any).upsert(
    {
      content_slug: contentSlug,
      user_id: userId,
      rating,
      feedback: feedback || null,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'content_slug,user_id',
    }
  )

  if (error) {
    console.error('Rate content error:', error)
  }
}

/**
 * Get user's rating for content
 */
export async function getUserRating(
  contentSlug: string,
  userId: string
): Promise<{ rating: number; feedback: string | null } | null> {
  const supabase = await createClient()

  const { data, error } = await (supabase.from('content_ratings') as any)
    .select('rating, feedback')
    .eq('content_slug', contentSlug)
    .eq('user_id', userId)
    .single()

  if (error) {
    return null
  }

  return data
}

/**
 * Bookmark content
 */
export async function bookmarkContent(
  contentSlug: string,
  userId: string,
  notes?: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await (supabase.from('content_bookmarks') as any).upsert(
    {
      content_slug: contentSlug,
      user_id: userId,
      notes: notes || null,
    },
    {
      onConflict: 'content_slug,user_id',
    }
  )

  if (error) {
    console.error('Bookmark content error:', error)
  }
}

/**
 * Remove bookmark
 */
export async function removeBookmark(contentSlug: string, userId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await (supabase.from('content_bookmarks') as any)
    .delete()
    .eq('content_slug', contentSlug)
    .eq('user_id', userId)

  if (error) {
    console.error('Remove bookmark error:', error)
  }
}

/**
 * Get user's bookmarks
 */
export async function getUserBookmarks(userId: string): Promise<ContentMetadata[]> {
  const supabase = await createClient()

  const { data, error } = await (supabase.from('content_bookmarks') as any)
    .select(
      `
      content_slug,
      notes,
      created_at,
      content_metadata (*)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Get bookmarks error:', error)
    return []
  }

  return (data || []).map((item: { content_metadata: ContentMetadata }) => item.content_metadata)
}

/**
 * Check if content is bookmarked
 */
export async function isBookmarked(contentSlug: string, userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await (supabase.from('content_bookmarks') as any)
    .select('id')
    .eq('content_slug', contentSlug)
    .eq('user_id', userId)
    .single()

  if (error) {
    return false
  }

  return !!data
}

/**
 * Get content by category with analytics
 */
export async function getContentByCategory(category: string): Promise<ContentMetadata[]> {
  const supabase = await createClient()

  const { data, error } = await (supabase.from('content_metadata') as any)
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .order('sort_order')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Get by category error:', error)
    return []
  }

  return data || []
}

/**
 * Get all content with analytics data
 */
export async function getAllContentWithAnalytics(): Promise<ContentMetadata[]> {
  const supabase = await createClient()

  const { data, error } = await (supabase.from('content_metadata') as any)
    .select('*')
    .eq('published', true)
    .order('sort_order')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Get all content error:', error)
    return []
  }

  return data || []
}
