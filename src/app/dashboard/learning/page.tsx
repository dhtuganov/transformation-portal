import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllContent } from '@/lib/mdx/content'
import { ContentCard } from '@/components/learning/ContentCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Star, Clock, CheckCircle } from 'lucide-react'
import type { MBTIType } from '@/types/database'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Обучение | Otrar Transformation Portal',
  description: 'Библиотека обучающих материалов',
}

// DEMO MODE flag - set to false when connecting real Supabase
const DEMO_MODE = false

// Mock data for demo
const MOCK_PROFILE = { mbti_type: 'ENFP' }
const MOCK_PROGRESS = [
  { content_id: 'mbti/introduction', status: 'completed', progress_percent: 100 },
  { content_id: 'transformation/adkar-model', status: 'in_progress', progress_percent: 45 },
]

export default async function LearningPage() {
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

  // Filter content by user's MBTI type for recommendations
  const userMbtiType = profile?.mbti_type as MBTIType | null
  const recommendedContent = userMbtiType
    ? allContent.filter(
        (item) =>
          item.mbti_types?.includes(userMbtiType) ||
          item.mbti_types?.includes('all')
      )
    : []

  // Group content by category
  const mbtiContent = allContent.filter((item) => item.category === 'mbti')
  const skillsContent = allContent.filter((item) => item.category === 'skills')
  const transformationContent = allContent.filter((item) => item.category === 'transformation')

  // Stats
  const completedCount = progressData?.filter((p) => p.status === 'completed').length || 0
  const inProgressCount = progressData?.filter((p) => p.status === 'in_progress').length || 0

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

      {/* Recommended Section */}
      {recommendedContent.length > 0 && (
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendedContent.slice(0, 3).map((content) => (
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

      {/* All Content Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Все ({allContent.length})
          </TabsTrigger>
          <TabsTrigger value="mbti">MBTI ({mbtiContent.length})</TabsTrigger>
          <TabsTrigger value="skills">Навыки ({skillsContent.length})</TabsTrigger>
          <TabsTrigger value="transformation">Трансформация ({transformationContent.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {allContent.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allContent.map((content) => (
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
                <h3 className="text-lg font-medium mb-2">Материалы скоро появятся</h3>
                <p className="text-sm text-muted-foreground">
                  Мы работаем над созданием обучающего контента
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mbti" className="space-y-4">
          {mbtiContent.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mbtiContent.map((content) => (
                <ContentCard
                  key={content.slug}
                  content={content}
                  progress={progressMap.get(content.slug) as { status: 'not_started' | 'in_progress' | 'completed'; progress_percent: number } | undefined}
                />
              ))}
            </div>
          ) : (
            <EmptyState category="MBTI" />
          )}
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          {skillsContent.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {skillsContent.map((content) => (
                <ContentCard
                  key={content.slug}
                  content={content}
                  progress={progressMap.get(content.slug) as { status: 'not_started' | 'in_progress' | 'completed'; progress_percent: number } | undefined}
                />
              ))}
            </div>
          ) : (
            <EmptyState category="Навыки" />
          )}
        </TabsContent>

        <TabsContent value="transformation" className="space-y-4">
          {transformationContent.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {transformationContent.map((content) => (
                <ContentCard
                  key={content.slug}
                  content={content}
                  progress={progressMap.get(content.slug) as { status: 'not_started' | 'in_progress' | 'completed'; progress_percent: number } | undefined}
                />
              ))}
            </div>
          ) : (
            <EmptyState category="Трансформация" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState({ category }: { category: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Материалы в разделе «{category}» скоро появятся</h3>
        <p className="text-sm text-muted-foreground">
          Мы работаем над созданием контента
        </p>
      </CardContent>
    </Card>
  )
}
