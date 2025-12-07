import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, BookOpen, Video, FileText, CheckSquare } from 'lucide-react'
import type { ContentItem } from '@/types/content'

interface ContentCardProps {
  content: ContentItem
  progress?: {
    status: 'not_started' | 'in_progress' | 'completed'
    progress_percent: number
  }
}

// Main category labels with icons
const MAIN_CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  business: { label: 'Бизнес', icon: '💼' },
  personal: { label: 'Личное развитие', icon: '🧠' },
  industry: { label: 'Отрасль', icon: '✈️' },
}

// Subcategory labels for display
const SUBCATEGORY_LABELS: Record<string, string> = {
  // Business
  'project-management': 'Управление проектами',
  leadership: 'Лидерство',
  negotiation: 'Переговоры',
  'team-management': 'Управление командой',
  'knowledge-management': 'Управление знаниями',
  operations: 'Операции',
  sales: 'Продажи',
  marketing: 'Маркетинг',
  finance: 'Финансы',
  strategy: 'Стратегия',
  // Personal
  psychology: 'Психология',
  'psychology/mbti': 'MBTI',
  'time-management': 'Тайм-менеджмент',
  'career-development': 'Карьера',
  communication: 'Коммуникации',
  'digital-skills': 'Digital',
  'change-management': 'Change Management',
  presentations: 'Презентации',
  'problem-solving': 'Решение проблем',
  'systems-thinking': 'Системное мышление',
  // Industry
  travel: 'Travel',
  'travel/aviation': 'Авиация',
  'travel/mice': 'MICE',
  'travel/tourism': 'Туризм',
  'travel/concierge': 'Консьерж',
}

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Начинающий', color: 'bg-green-100 text-green-800' },
  intermediate: { label: 'Средний', color: 'bg-yellow-100 text-yellow-800' },
  advanced: { label: 'Продвинутый', color: 'bg-red-100 text-red-800' },
}

const ContentIcon = ({ type }: { type?: string }) => {
  switch (type) {
    case 'video':
      return <Video className="h-4 w-4" />
    case 'document':
      return <FileText className="h-4 w-4" />
    case 'checklist':
      return <CheckSquare className="h-4 w-4" />
    default:
      return <BookOpen className="h-4 w-4" />
  }
}

export function ContentCard({ content, progress }: ContentCardProps) {
  const difficulty = DIFFICULTY_LABELS[content.difficulty || 'beginner']
  const mainCategory = MAIN_CATEGORY_LABELS[content.category || '']
  const subcategory = SUBCATEGORY_LABELS[content.subcategory || ''] || content.subcategory

  return (
    <Link href={`/dashboard/learning/${content.slug}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              {mainCategory && (
                <span className="text-sm" title={mainCategory.label}>
                  {mainCategory.icon}
                </span>
              )}
              <ContentIcon type={content.category} />
              {subcategory && (
                <span className="text-xs uppercase tracking-wide">
                  {subcategory}
                </span>
              )}
            </div>
            {progress?.status === 'completed' && (
              <Badge variant="default" className="bg-green-600">
                Завершено
              </Badge>
            )}
            {progress?.status === 'in_progress' && (
              <Badge variant="secondary">
                {progress.progress_percent}%
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg line-clamp-2 mt-2">
            {content.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {content.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-2">
            {content.duration && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{content.duration} мин</span>
              </div>
            )}
            {difficulty && (
              <Badge variant="outline" className={`text-xs ${difficulty.color}`}>
                {difficulty.label}
              </Badge>
            )}
            {content.mbti_types && content.mbti_types.length > 0 && content.mbti_types[0] !== 'all' && (
              <div className="flex gap-1">
                {content.mbti_types.slice(0, 3).map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
                {content.mbti_types.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{content.mbti_types.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
