import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { serialize } from 'next-mdx-remote/serialize'
import { createClient } from '@/lib/supabase/server'
import { getContentBySlug, getAllContent } from '@/lib/mdx/content'
import { MDXRenderer } from '@/components/learning/MDXRenderer'
import { ReadingProgress } from '@/components/learning/ReadingProgress'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

// DEMO MODE flag - set to false when connecting real Supabase
const DEMO_MODE = false

// Mock user for demo
const MOCK_USER = { id: 'demo-user-123' }

// Generate static params for all content (for static generation)
export async function generateStaticParams() {
  const allContent = getAllContent()
  return allContent.map((content) => ({
    slug: content.slug,
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
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')

    headings.push({ id, text, level })
  }

  return headings
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params

  // Get content by slug
  const contentItem = getContentBySlug(slug)

  if (!contentItem) {
    notFound()
  }

  // Serialize MDX content
  const mdxSource = await serialize(contentItem.content)

  // Extract headings for TOC
  const headings = extractHeadings(contentItem.content)

  // Get user and check auth
  let user = MOCK_USER

  if (!DEMO_MODE) {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      redirect('/login')
    }

    user = authUser
  }

  // Get all content for prev/next navigation
  const allContent = getAllContent()
  const currentIndex = allContent.findIndex((c) => c.slug === slug)
  const prevContent = currentIndex > 0 ? allContent[currentIndex - 1] : null
  const nextContent = currentIndex < allContent.length - 1 ? allContent[currentIndex + 1] : null

  // Difficulty and category labels
  const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
    beginner: { label: 'Начинающий', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    intermediate: { label: 'Средний', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    advanced: { label: 'Продвинутый', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  }

  const CATEGORY_LABELS: Record<string, string> = {
    mbti: 'MBTI',
    skills: 'Навыки',
    transformation: 'Трансформация',
  }

  const difficulty = DIFFICULTY_LABELS[contentItem.difficulty || 'beginner']
  const categoryLabel = CATEGORY_LABELS[contentItem.category || ''] || contentItem.category

  return (
    <>
      {/* Reading Progress Tracker */}
      <ReadingProgress
        userId={user.id}
        contentSlug={slug}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Main Content */}
          <div className="min-w-0">
            {/* Back Button */}
            <div className="mb-6">
              <Button variant="ghost" asChild>
                <Link href="/dashboard/learning" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Назад к библиотеке
                </Link>
              </Button>
            </div>

            {/* Article Header */}
            <article className="space-y-6">
              <header className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {categoryLabel && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {categoryLabel}
                    </Badge>
                  )}
                  {difficulty && (
                    <Badge variant="outline" className={difficulty.color}>
                      {difficulty.label}
                    </Badge>
                  )}
                  {contentItem.duration && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {contentItem.duration} мин
                    </Badge>
                  )}
                </div>

                <h1 className="text-4xl font-bold tracking-tight">
                  {contentItem.title}
                </h1>

                {contentItem.description && (
                  <p className="text-lg text-muted-foreground">
                    {contentItem.description}
                  </p>
                )}

                {(contentItem.author || contentItem.date) && (
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {contentItem.author && <span>Автор: {contentItem.author}</span>}
                    {contentItem.date && (
                      <span>
                        {new Date(contentItem.date).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                )}

                {contentItem.mbti_types && contentItem.mbti_types.length > 0 && contentItem.mbti_types[0] !== 'all' && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">Для типов:</span>
                    {contentItem.mbti_types.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                )}
              </header>

              {/* MDX Content */}
              <div className="prose prose-slate dark:prose-invert max-w-none mt-8">
                <MDXRenderer mdxSource={mdxSource} />
              </div>

              {/* Navigation */}
              <div className="border-t pt-8 mt-12">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    {prevContent && (
                      <Link href={`/dashboard/learning/${prevContent.slug}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <ChevronLeft className="h-4 w-4" />
                              Предыдущая статья
                            </div>
                            <div className="font-medium line-clamp-2">
                              {prevContent.title}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )}
                  </div>

                  <div className="flex-1">
                    {nextContent && (
                      <Link href={`/dashboard/learning/${nextContent.slug}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-1">
                              Следующая статья
                              <ChevronRight className="h-4 w-4" />
                            </div>
                            <div className="font-medium line-clamp-2">
                              {nextContent.title}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar - Table of Contents */}
          {headings.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-4">Содержание</h3>
                    <nav className="space-y-2">
                      {headings.map((heading) => (
                        <a
                          key={heading.id}
                          href={`#${heading.id}`}
                          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                          style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                        >
                          {heading.text}
                        </a>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  )
}
