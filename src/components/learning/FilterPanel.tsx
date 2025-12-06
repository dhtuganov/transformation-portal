'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Filter, X } from 'lucide-react'
import type { MBTIType } from '@/types/database'

export interface FilterOptions {
  categories: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  mbtiTypes: string[]
}

interface FilterPanelProps {
  filters: FilterOptions
  onChange: (filters: FilterOptions) => void
  availableCategories?: string[]
  availableMbtiTypes?: string[]
}

const CATEGORY_LABELS: Record<string, string> = {
  mbti: 'MBTI',
  skills: 'Навыки',
  transformation: 'Трансформация',
}

const DIFFICULTY_OPTIONS = [
  { value: 'beginner' as const, label: 'Начинающий', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
  { value: 'intermediate' as const, label: 'Средний', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
  { value: 'advanced' as const, label: 'Продвинутый', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
]

const ALL_MBTI_TYPES: MBTIType[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
]

export function FilterPanel({
  filters,
  onChange,
  availableCategories = ['mbti', 'skills', 'transformation'],
  availableMbtiTypes = ALL_MBTI_TYPES,
}: FilterPanelProps) {
  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    onChange({ ...filters, categories: newCategories })
  }

  const setDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    onChange({
      ...filters,
      difficulty: filters.difficulty === difficulty ? undefined : difficulty,
    })
  }

  const toggleMbtiType = (type: string) => {
    const newTypes = filters.mbtiTypes.includes(type)
      ? filters.mbtiTypes.filter((t) => t !== type)
      : [...filters.mbtiTypes, type]
    onChange({ ...filters, mbtiTypes: newTypes })
  }

  const resetFilters = () => {
    onChange({ categories: [], mbtiTypes: [] })
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.difficulty !== undefined ||
    filters.mbtiTypes.length > 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Фильтры
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Сбросить
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filters */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Категория</h4>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category) => (
              <Badge
                key={category}
                variant={filters.categories.includes(category) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleCategory(category)}
              >
                {CATEGORY_LABELS[category] || category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Уровень сложности</h4>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY_OPTIONS.map((option) => (
              <Badge
                key={option.value}
                variant="outline"
                className={`cursor-pointer ${
                  filters.difficulty === option.value ? option.color : ''
                }`}
                onClick={() => setDifficulty(option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* MBTI Type Filter */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Тип MBTI</h4>
          <div className="grid grid-cols-4 gap-2">
            {availableMbtiTypes.map((type) => (
              <Badge
                key={type}
                variant={filters.mbtiTypes.includes(type) ? 'default' : 'outline'}
                className="cursor-pointer text-center justify-center"
                onClick={() => toggleMbtiType(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-2 border-t text-xs text-muted-foreground">
            Активных фильтров:{' '}
            {filters.categories.length +
              (filters.difficulty ? 1 : 0) +
              filters.mbtiTypes.length}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
