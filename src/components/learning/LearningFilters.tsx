'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { SearchBar } from './SearchBar'
import { FilterPanel, type FilterOptions } from './FilterPanel'

export function LearningFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current filter values from URL
  const currentFilters = useMemo(() => {
    const query = searchParams.get('q') || ''
    const categories = searchParams.get('category')?.split(',').filter(Boolean) || []
    const difficulty = searchParams.get('difficulty') as 'beginner' | 'intermediate' | 'advanced' | undefined
    const mbtiTypes = searchParams.get('mbti')?.split(',').filter(Boolean) || []

    return { query, categories, difficulty, mbtiTypes }
  }, [searchParams])

  // Update URL with new filters
  const updateFilters = useCallback(
    (updates: Partial<{ query: string; categories: string[]; difficulty?: 'beginner' | 'intermediate' | 'advanced'; mbtiTypes: string[] }>) => {
      const params = new URLSearchParams(searchParams.toString())

      // Update query
      if (updates.query !== undefined) {
        if (updates.query) {
          params.set('q', updates.query)
        } else {
          params.delete('q')
        }
      }

      // Update categories
      if (updates.categories !== undefined) {
        if (updates.categories.length > 0) {
          params.set('category', updates.categories.join(','))
        } else {
          params.delete('category')
        }
      }

      // Update difficulty
      if (updates.difficulty !== undefined) {
        if (updates.difficulty) {
          params.set('difficulty', updates.difficulty)
        } else {
          params.delete('difficulty')
        }
      }

      // Update MBTI types
      if (updates.mbtiTypes !== undefined) {
        if (updates.mbtiTypes.length > 0) {
          params.set('mbti', updates.mbtiTypes.join(','))
        } else {
          params.delete('mbti')
        }
      }

      // Update URL
      const newUrl = params.toString() ? `?${params.toString()}` : '/dashboard/learning'
      router.push(newUrl, { scroll: false })
    },
    [searchParams, router]
  )

  const handleSearchChange = useCallback(
    (query: string) => {
      updateFilters({ query })
    },
    [updateFilters]
  )

  const handleFilterChange = useCallback(
    (filters: FilterOptions) => {
      updateFilters({
        categories: filters.categories,
        difficulty: filters.difficulty,
        mbtiTypes: filters.mbtiTypes,
      })
    },
    [updateFilters]
  )

  return (
    <div className="space-y-4">
      <SearchBar value={currentFilters.query} onChange={handleSearchChange} />
      <FilterPanel
        filters={{
          categories: currentFilters.categories,
          difficulty: currentFilters.difficulty,
          mbtiTypes: currentFilters.mbtiTypes,
        }}
        onChange={handleFilterChange}
      />
    </div>
  )
}
