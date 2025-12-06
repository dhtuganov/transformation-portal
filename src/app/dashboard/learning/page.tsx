import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllContent, filterContent } from '@/lib/mdx/content'
import { ContentCard } from '@/components/learning/ContentCard'
import { LearningFilters } from '@/components/learning/LearningFilters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Star, Clock, CheckCircle } from 'lucide-react'
import type { MBTIType } from '@/types/database'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Обучение | Otrar Transformation Portal',
  description: 'Библиотека обучающих материалов',
}

interface SearchParams {
  q?: string
  category?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  mbti?: string
}

// DEMO MODE flag - set to false when connecting real Supabase
const DEMO_MODE = false

// Mock data for demo
const MOCK_PROFILE = { mbti_type: 'ENFP' }
const MOCK_PROGRESS = [
  { content_id: 'mbti/introduction', status: 'completed', progress_percent: 100 },
  { content_id: 'transformation/adkar-model', status: 'in_progress', progress_percent: 45 },
]

export default async function LearningPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  let profile: { mbti_type: string | null } | null = MOCK_PROFILE
  let progressData: Array<{ content_id: string; status: string; progress_percent: number }> | null = MOCK_PROGRESS

  if (!DEMO_MODE) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('mbti_type')
      .eq('id', user.id)
      .single() as { data: { mbti_type: string | null } | null }

    profile = profileData

    // Get user's learning progress
    const { data: progress } = await supabase
      .from('learning_progress')
      .select('content_id, status, progress_percent')
      .eq('user_id', user.id) as { data: Array<{ content_id: string; status: string; progress_percent: number }> | null }

    progressData = progress
  }

  type ProgressEntry = { status: string; progress_percent: number }
  const progressMap = new Map<string, ProgressEntry>()
  if (progressData) {
    progressData.forEach((p) => {
      progressMap.set(p.content_id, { status: p.status, progress_percent: p.progress_percent })
    })
  }

  // Get all content
  const allContent = getAllContent()

  // Apply filters from URL params
  const filteredContent = filterContent(allContent, {
    query: params.q,
    categories: params.category?.split(',').filter(Boolean),
    difficulty: params.difficulty,
    mbtiTypes: params.mbti?.split(',').filter(Boolean),
  })

  // Filter content by user's MBTI type for recommendations
  const userMbtiType = profile?.mbti_type as MBTIType | null
  const recommendedContent = userMbtiType
    ? allContent.filter(
        (item) =>
          item.mbti_types?.includes(userMbtiType) ||
          item.mbti_types?.includes('all')
      )
    : []

  // Stats
  const completedCount = progressData?.filter((p) => p.status === 'completed').length || 0
  const inProgressCount = progressData?.filter((p) => p.status === 'in_progress').length || 0

  // Check if filters are active
  const hasActiveFilters = !!(params.q || params.category || params.difficulty || params.mbti)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Библиотека обучения</h1>
          <p className="text-muted-foreground mt-1">
            Материалы для вашего профессионального развития
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            {completedCount} завершено
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-yellow-600" />
            {inProgressCount} в процессе
          </Badge>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* Recommended Section - Only show if no active filters */}
          {!hasActiveFilters && recommendedContent.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Рекомендовано для вас
                </CardTitle>
                <CardDescription>
                  Материалы, подобранные на основе вашего MBTI-типа {userMbtiType}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                  {recommendedContent.slice(0, 4).map((content) => (
                    <ContentCard
                      key={content.slug}
                      content={content}
                      progress={progressMap.get(content.slug) as { status: 'not_started' | 'in_progress' | 'completed'; progress_percent: number } | undefined}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {hasActiveFilters ? 'Результаты поиска' : 'Все материалы'}
              </h2>
              <Badge variant="secondary">
                {filteredContent.length} {filteredContent.length === 1 ? 'материал' : 'материалов'}
              </Badge>
            </div>

            {filteredContent.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredContent.map((content) => (
                  <ContentCard
                    key={content.slug}
                    content={content}
                    progress={progressMap.get(content.slug) as { status: 'not_started' | 'in_progress' | 'completed'; progress_percent: number } | undefined}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {hasActiveFilters ? 'Ничего не найдено' : 'Материалы скоро появятся'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {hasActiveFilters
                      ? 'Попробуйте изменить параметры поиска или фильтры'
                      : 'Мы работаем над созданием обучающего контента'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Filters Sidebar */}
        <div className="md:sticky md:top-6 md:h-fit">
          <LearningFilters />
        </div>
      </div>
    </div>
  )
}
