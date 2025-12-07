'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  Gift,
  Building2,
  Presentation,
  Clipboard,
  Calendar,
  Play,
  BarChart3,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  Target,
  BookOpen,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  MapPin,
} from 'lucide-react'

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  gift: Gift,
  building: Building2,
  presentation: Presentation,
  clipboard: Clipboard,
  calendar: Calendar,
  play: Play,
  chart: BarChart3,
  target: Target,
  book: BookOpen,
  help: HelpCircle,
  trending: TrendingUp,
  clock: Clock,
  location: MapPin,
}

// Color mapping
const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  green: { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  red: { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
  gray: { bg: 'bg-gray-50 dark:bg-gray-900', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-800' },
}

// ==================== SegmentGrid ====================
interface SegmentItem {
  id: string
  title: string
  subtitle?: string
  icon?: string
  color?: string
  items?: string[]
  stats?: Record<string, string>
}

interface SegmentGridProps {
  items: SegmentItem[]
  columns?: 2 | 3 | 4
}

export function SegmentGrid({ items, columns = 2 }: SegmentGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={`grid grid-cols-1 ${gridCols[columns]} gap-4 my-6`}>
      {items.map((item) => {
        const colors = colorMap[item.color || 'blue']
        const IconComponent = iconMap[item.icon || 'users']

        return (
          <Card key={item.id} className={`${colors.border} border-2`}>
            <CardHeader className={`${colors.bg} pb-3`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
                  {IconComponent && <IconComponent className="w-6 h-6" />}
                </div>
                <div>
                  <Badge variant="outline" className={`${colors.text} mb-1`}>
                    {item.id}
                  </Badge>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  {item.subtitle && (
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {item.items && item.items.length > 0 && (
                <ul className="space-y-1 mb-3">
                  {item.items.map((listItem, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <ChevronRight className={`w-3 h-3 ${colors.text}`} />
                      {listItem}
                    </li>
                  ))}
                </ul>
              )}
              {item.stats && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {Object.entries(item.stats).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {value}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ==================== ProcessFlow ====================
interface ProcessStep {
  title: string
  description?: string
  icon?: string
}

interface ProcessFlowProps {
  title?: string
  steps: ProcessStep[]
  direction?: 'horizontal' | 'vertical'
}

export function ProcessFlow({ title, steps, direction = 'horizontal' }: ProcessFlowProps) {
  const isHorizontal = direction === 'horizontal'

  return (
    <div className="my-6">
      {title && <h4 className="font-semibold mb-4">{title}</h4>}
      <div className={`flex ${isHorizontal ? 'flex-col md:flex-row' : 'flex-col'} gap-2`}>
        {steps.map((step, index) => {
          const IconComponent = iconMap[step.icon || 'circle'] || Circle

          return (
            <div key={index} className="flex items-center">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg flex-1 min-w-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{step.title}</p>
                  {step.description && (
                    <p className="text-sm text-muted-foreground truncate">{step.description}</p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className={`w-5 h-5 text-muted-foreground mx-2 shrink-0 ${!isHorizontal ? 'rotate-90' : ''} ${isHorizontal ? 'hidden md:block' : ''}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==================== Checklist ====================
interface ChecklistSection {
  title: string
  items: string[]
}

interface ChecklistProps {
  title?: string
  sections?: ChecklistSection[]
  items?: string[]
}

export function Checklist({ title, sections, items }: ChecklistProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggleItem = (item: string) => {
    const newChecked = new Set(checked)
    if (newChecked.has(item)) {
      newChecked.delete(item)
    } else {
      newChecked.add(item)
    }
    setChecked(newChecked)
  }

  const renderItems = (itemList: string[]) => (
    <ul className="space-y-2">
      {itemList.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
          onClick={() => toggleItem(item)}
        >
          {checked.has(item) ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          )}
          <span className={checked.has(item) ? 'line-through text-muted-foreground' : ''}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  )

  return (
    <Card className="my-6">
      {title && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clipboard className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? '' : 'pt-6'}>
        {sections ? (
          <div className="space-y-6">
            {sections.map((section, i) => (
              <div key={i}>
                <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  {section.title}
                </h5>
                {renderItems(section.items)}
              </div>
            ))}
          </div>
        ) : items ? (
          renderItems(items)
        ) : null}
      </CardContent>
    </Card>
  )
}

// ==================== ComparisonCards ====================
interface ComparisonItem {
  title: string
  features: string[]
  examples?: string[]
  color?: string
}

interface ComparisonCardsProps {
  items: ComparisonItem[]
}

export function ComparisonCards({ items }: ComparisonCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      {items.map((item, index) => {
        const colors = colorMap[item.color || (index === 0 ? 'blue' : 'green')]

        return (
          <Card key={index} className={`${colors.border} border-2`}>
            <CardHeader className={colors.bg}>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2 mb-4">
                {item.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ChevronRight className={`w-4 h-4 ${colors.text} shrink-0 mt-0.5`} />
                    {feature}
                  </li>
                ))}
              </ul>
              {item.examples && item.examples.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Примеры:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.examples.map((ex, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {ex}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ==================== StatCards ====================
interface StatItem {
  value: string
  label: string
  trend?: string
  icon?: string
}

interface StatCardsProps {
  items: StatItem[]
}

export function StatCards({ items }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
      {items.map((item, index) => {
        const IconComponent = iconMap[item.icon || 'chart']

        return (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
                {item.trend && (
                  <Badge variant="secondary" className="text-green-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {item.trend}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ==================== KeyConcept ====================
interface KeyConceptProps {
  term: string
  definition: string
}

export function KeyConcept({ term, definition }: KeyConceptProps) {
  return (
    <div className="my-6 p-5 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border-l-4 border-primary">
      <div className="flex items-start gap-3">
        <Lightbulb className="w-6 h-6 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-lg text-primary">{term}</p>
          <p className="text-muted-foreground mt-1">{definition}</p>
        </div>
      </div>
    </div>
  )
}

// ==================== LearningObjectives ====================
interface LearningObjectivesProps {
  items: string[]
}

export function LearningObjectives({ items }: LearningObjectivesProps) {
  return (
    <Card className="my-6 border-primary/20">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Target className="w-5 h-5" />
          Цели обучения
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium shrink-0">
                {i + 1}
              </div>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

// ==================== Exercise ====================
interface ExerciseProps {
  number: number
  title: string
  children: React.ReactNode
}

export function Exercise({ number, title, children }: ExerciseProps) {
  return (
    <Card className="my-6 border-orange-200 dark:border-orange-800">
      <CardHeader className="bg-orange-50 dark:bg-orange-950">
        <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 text-sm font-bold">
            {number}
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 prose prose-slate dark:prose-invert max-w-none">
        {children}
      </CardContent>
    </Card>
  )
}

// ==================== Solution ====================
interface SolutionProps {
  children: React.ReactNode
}

export function Solution({ children }: SolutionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-4 border-t pt-4">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span>{isOpen ? 'Скрыть решение' : 'Показать решение'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      {isOpen && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          {children}
        </div>
      )}
    </div>
  )
}

// ==================== Glossary ====================
interface GlossaryTerm {
  term: string
  definition: string
}

interface GlossaryProps {
  terms: GlossaryTerm[]
}

export function Glossary({ terms }: GlossaryProps) {
  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Глоссарий
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          {terms.map((item, i) => (
            <div key={i} className="border-b pb-3 last:border-0 last:pb-0">
              <dt className="font-semibold text-primary">{item.term}</dt>
              <dd className="text-sm text-muted-foreground mt-1">{item.definition}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

// ==================== Quiz ====================
interface QuizQuestion {
  question: string
  hint?: string
  answer?: string
}

interface QuizProps {
  questions: QuizQuestion[]
}

export function Quiz({ questions }: QuizProps) {
  const [showAnswers, setShowAnswers] = useState<Set<number>>(new Set())

  const toggleAnswer = (index: number) => {
    const newSet = new Set(showAnswers)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setShowAnswers(newSet)
  }

  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Контрольные вопросы
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {questions.map((q, i) => (
            <li key={i} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-sm font-medium shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{q.question}</p>
                  {q.hint && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <em>Подсказка: {q.hint}</em>
                    </p>
                  )}
                  {q.answer && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAnswer(i)}
                      className="mt-2 text-primary"
                    >
                      {showAnswers.has(i) ? 'Скрыть ответ' : 'Показать ответ'}
                    </Button>
                  )}
                  {q.answer && showAnswers.has(i) && (
                    <p className="mt-2 p-3 bg-green-50 dark:bg-green-950 rounded-md text-sm">
                      {q.answer}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

// ==================== NextSteps ====================
interface NextArticle {
  slug: string
  title: string
  description?: string
}

interface NextStepsProps {
  articles: NextArticle[]
}

export function NextSteps({ articles }: NextStepsProps) {
  return (
    <Card className="my-6 border-primary/20">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2 text-primary">
          <ArrowRight className="w-5 h-5" />
          Следующие шаги
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {articles.map((article, i) => (
            <a
              key={i}
              href={`/dashboard/learning/${article.slug}`}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium group-hover:text-primary transition-colors">{article.title}</p>
                {article.description && (
                  <p className="text-sm text-muted-foreground truncate">{article.description}</p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
