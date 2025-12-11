import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import { createClient } from '@/lib/supabase/server'
import { getContentBySlug, getAllContent } from '@/lib/mdx/content'
import { MDXRenderer } from '@/components/learning/MDXRenderer'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { ReadingProgress } from '@/components/learning/ReadingProgress'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

// DEMO MODE flag - set to false when connecting real Supabase
const DEMO_MODE = false

// Mock user for demo
const MOCK_USER = { id: 'demo-user-123' }

// Generate static params for all content (for static generation)
export async function generateStaticParams() {
  const allContent = getAllContent()
  return allContent.map((content) => ({
    slug: content.slug.split('/'),
  }))
}

// Extract headings from MDX content for TOC
function extractHeadings(content: string): Array<{ id: string; text: string; level: number }> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const headings: Array<{ id: string; text: string; level: number }> = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s-]/gi, '')
      .replace(/\s+/g, '-')

    headings.push({ id, text, level })
  }

  return headings
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const slugPath = slug.join('/')
  const content = getContentBySlug(slugPath)

  if (!content) {
    return { title: 'Не найдено | Otrar Portal' }
  }

  return {
    title: `${content.title} | Обучение`,
    description: content.description,
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const slugPath = slug.join('/')

  // Authentication check
  let userId = MOCK_USER.id
  let userName = 'Демо пользователь'

  if (!DEMO_MODE) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    userId = user.id

    // Get user's full name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle() as { data: { full_name: string | null } | null }

    if (profile?.full_name) {
      userName = profile.full_name
    }
  }

  // Get content
  const content = getContentBySlug(slugPath)

  if (!content) {
    notFound()
  }

  // Serialize MDX with GFM support (tables, strikethrough, etc.)
  const mdxSource: MDXRemoteSerializeResult = await serialize(content.content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
    },
  })

  // Extract headings for TOC
  const headings = extractHeadings(content.content)

  // Get all content for prev/next navigation
  const allContent = getAllContent()
  const currentIndex = allContent.findIndex((c) => c.slug === slugPath)
  const prevContent = currentIndex > 0 ? allContent[currentIndex - 1] : null
  const nextContent = currentIndex < allContent.length - 1 ? allContent[currentIndex + 1] : null

  // Labels for display
  const difficultyLabels: Record<string, string> = {
    beginner: 'Начинающий',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
  }

  const categoryLabels: Record<string, string> = {
    mbti: 'MBTI',
    skills: 'Навыки',
    transformation: 'Трансформация',
  }

  return (
    <div className="relative">
      {/* Reading Progress Bar */}
      <ReadingProgress contentSlug={slugPath} userId={userId} contentTitle={content.title} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/learning" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Назад к библиотеке
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Article Header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {content.category && (
                  <Badge variant="secondary">
                    {categoryLabels[content.category] || content.category}
                  </Badge>
                )}
                {content.difficulty && (
                  <Badge variant="outline">
                    {difficultyLabels[content.difficulty] || content.difficulty}
                  </Badge>
                )}
                {content.duration && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {content.duration} мин
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight mb-4">
                {content.title}
              </h1>

              {content.description && (
                <p className="text-lg text-muted-foreground">
                  {content.description}
                </p>
              )}

              {content.author && (
                <p className="text-sm text-muted-foreground mt-4">
                  Автор: {content.author}
                </p>
              )}
            </div>

            {/* Article Content */}
            <Card>
              <CardContent className="p-8">
                <MDXRenderer mdxSource={mdxSource} />
              </CardContent>
            </Card>

            {/* Prev/Next Navigation */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {prevContent ? (
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <Link href={`/dashboard/learning/${prevContent.slug}`}>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <ChevronLeft className="h-4 w-4" />
                        Предыдущая статья
                      </div>
                      <div className="font-medium">{prevContent.title}</div>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div />
              )}

              {nextContent && (
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <Link href={`/dashboard/learning/${nextContent.slug}`}>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1 justify-end">
                        Следующая статья
                        <ChevronRight className="h-4 w-4" />
                      </div>
                      <div className="font-medium text-right">{nextContent.title}</div>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar - Table of Contents */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Содержание
                  </h3>
                  {headings.length > 0 ? (
                    <nav className="space-y-2">
                      {headings.map((heading, index) => (
                        <a
                          key={index}
                          href={`#${heading.id}`}
                          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                          style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                        >
                          {heading.text}
                        </a>
                      ))}
                    </nav>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Нет заголовков
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              {content.tags && content.tags.length > 0 && (
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Теги</h3>
                    <div className="flex flex-wrap gap-2">
                      {content.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
