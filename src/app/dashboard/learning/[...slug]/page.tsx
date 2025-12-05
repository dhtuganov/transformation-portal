import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getContentBySlug } from '@/lib/mdx/content'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Clock, User, Calendar, BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

// DEMO MODE flag - set to false when connecting real Supabase
const DEMO_MODE = true

interface PageProps {
  params: Promise<{ slug: string[] }>
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Начинающий',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
}

const CATEGORY_LABELS: Record<string, string> = {
  mbti: 'MBTI',
  skills: 'Навыки',
  transformation: 'Трансформация',
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const slugPath = slug.join('/')
  const content = getContentBySlug(slugPath)

  if (!content) {
    return { title: 'Не найдено' }
  }

  return {
    title: `${content.title} | Otrar Transformation Portal`,
    description: content.description,
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const slugPath = slug.join('/')

  if (!DEMO_MODE) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }
  }

  const content = getContentBySlug(slugPath)

  if (!content) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/dashboard/learning">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к библиотеке
        </Link>
      </Button>

      {/* Article Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {content.category && (
            <Badge variant="secondary">
              {CATEGORY_LABELS[content.category] || content.category}
            </Badge>
          )}
          {content.difficulty && (
            <Badge variant="outline">
              {DIFFICULTY_LABELS[content.difficulty]}
            </Badge>
          )}
          {content.mbti_types && content.mbti_types.length > 0 && content.mbti_types[0] !== 'all' && (
            content.mbti_types.map((type) => (
              <Badge key={type} variant="outline" className="text-xs">
                {type}
              </Badge>
            ))
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-4">
          {content.title}
        </h1>

        {content.description && (
          <p className="text-lg text-muted-foreground mb-6">
            {content.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {content.author && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{content.author}</span>
            </div>
          )}
          {content.date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(content.date).toLocaleDateString('ru-RU')}</span>
            </div>
          )}
          {content.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{content.duration} мин</span>
            </div>
          )}
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Article Content */}
      <Card>
        <CardContent className="prose prose-gray max-w-none p-8">
          <MDXRemote source={content.content} />
        </CardContent>
      </Card>

      {/* Tags */}
      {content.tags && content.tags.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium mb-2">Теги:</h3>
          <div className="flex flex-wrap gap-2">
            {content.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard/learning">
            <ArrowLeft className="mr-2 h-4 w-4" />
            К библиотеке
          </Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">
            <BookOpen className="mr-2 h-4 w-4" />
            На главную
          </Link>
        </Button>
      </div>
    </div>
  )
}
