'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// Dichotomy Scale Component - shows a visual scale between two poles
interface DichotomyScaleProps {
  left: {
    letter: string
    name: string
    traits: string[]
  }
  right: {
    letter: string
    name: string
    traits: string[]
  }
  value?: number // 0-100, 50 is balanced, <50 leans left, >50 leans right
}

export function DichotomyScale({ left, right, value = 50 }: DichotomyScaleProps) {
  return (
    <div className="my-8 p-6 bg-muted/30 rounded-xl border">
      {/* Header with letters */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-center">
          <span className="text-4xl font-bold text-primary">{left.letter}</span>
          <p className="text-sm font-medium mt-1">{left.name}</p>
        </div>
        <div className="flex-1 mx-4 flex items-center">
          <div className="w-full h-3 bg-gradient-to-r from-primary via-muted to-secondary rounded-full relative">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-foreground rounded-full border-2 border-background shadow-lg transition-all"
              style={{ left: `calc(${value}% - 10px)` }}
            />
          </div>
        </div>
        <div className="text-center">
          <span className="text-4xl font-bold text-secondary">{right.letter}</span>
          <p className="text-sm font-medium mt-1">{right.name}</p>
        </div>
      </div>

      {/* Traits comparison */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="space-y-2">
          {left.traits.map((trait, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>{trait}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {right.traits.map((trait, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span>{trait}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Comparison Table with better styling
interface ComparisonTableProps {
  leftHeader: string
  rightHeader: string
  rows: Array<{ left: string; right: string }>
  leftColor?: string
  rightColor?: string
}

export function ComparisonTable({
  leftHeader,
  rightHeader,
  rows,
  leftColor = 'bg-primary/10 text-primary',
  rightColor = 'bg-secondary/10 text-secondary'
}: ComparisonTableProps) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border">
      {/* Headers */}
      <div className="grid grid-cols-2">
        <div className={`p-4 font-semibold text-center ${leftColor}`}>
          {leftHeader}
        </div>
        <div className={`p-4 font-semibold text-center ${rightColor}`}>
          {rightHeader}
        </div>
      </div>
      {/* Rows */}
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-2 border-t">
          <div className="p-4 text-sm bg-primary/5">
            {row.left}
          </div>
          <div className="p-4 text-sm bg-secondary/5">
            {row.right}
          </div>
        </div>
      ))}
    </div>
  )
}

// MBTI Type Card - for displaying a specific type
interface MBTITypeCardProps {
  type: string
  name: string
  nickname?: string
  description: string
  strengths?: string[]
  challenges?: string[]
}

export function MBTITypeCard({ type, name, nickname, description, strengths, challenges }: MBTITypeCardProps) {
  const temperamentColors: Record<string, string> = {
    // Analysts (NT)
    INTJ: 'from-purple-500 to-purple-700',
    INTP: 'from-purple-500 to-purple-700',
    ENTJ: 'from-purple-500 to-purple-700',
    ENTP: 'from-purple-500 to-purple-700',
    // Diplomats (NF)
    INFJ: 'from-green-500 to-green-700',
    INFP: 'from-green-500 to-green-700',
    ENFJ: 'from-green-500 to-green-700',
    ENFP: 'from-green-500 to-green-700',
    // Sentinels (SJ)
    ISTJ: 'from-blue-500 to-blue-700',
    ISFJ: 'from-blue-500 to-blue-700',
    ESTJ: 'from-blue-500 to-blue-700',
    ESFJ: 'from-blue-500 to-blue-700',
    // Explorers (SP)
    ISTP: 'from-orange-500 to-orange-700',
    ISFP: 'from-orange-500 to-orange-700',
    ESTP: 'from-orange-500 to-orange-700',
    ESFP: 'from-orange-500 to-orange-700',
  }

  const gradient = temperamentColors[type] || 'from-gray-500 to-gray-700'

  return (
    <Card className="overflow-hidden my-6">
      <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
        <div className="flex items-center gap-4">
          <span className="text-4xl font-bold">{type}</span>
          <div>
            <h3 className="text-xl font-semibold">{name}</h3>
            {nickname && <p className="text-white/80 text-sm">{nickname}</p>}
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        <p className="text-muted-foreground mb-4">{description}</p>

        {(strengths || challenges) && (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {strengths && (
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Сильные стороны</h4>
                <ul className="space-y-1">
                  {strengths.map((s, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="text-green-500">+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {challenges && (
              <div>
                <h4 className="font-semibold text-orange-600 mb-2">Зоны роста</h4>
                <ul className="space-y-1">
                  {challenges.map((c, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="text-orange-500">!</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Cognitive Functions Stack
interface CognitiveFunctionProps {
  functions: Array<{
    code: string
    name: string
    role: 'dominant' | 'auxiliary' | 'tertiary' | 'inferior'
    description?: string
  }>
}

export function CognitiveFunctionsStack({ functions }: CognitiveFunctionProps) {
  const roleLabels = {
    dominant: { label: 'Доминантная', color: 'bg-green-500' },
    auxiliary: { label: 'Вспомогательная', color: 'bg-blue-500' },
    tertiary: { label: 'Третичная', color: 'bg-yellow-500' },
    inferior: { label: 'Подчинённая', color: 'bg-red-500' },
  }

  const roleSizes = {
    dominant: 100,
    auxiliary: 75,
    tertiary: 50,
    inferior: 25,
  }

  return (
    <div className="my-6 space-y-4">
      <h4 className="font-semibold">Когнитивные функции</h4>
      {functions.map((fn, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-24 text-right text-sm text-muted-foreground">
            {roleLabels[fn.role].label}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold">{fn.code}</span>
              <span className="text-sm">{fn.name}</span>
            </div>
            <Progress value={roleSizes[fn.role]} className="h-2" />
            {fn.description && (
              <p className="text-xs text-muted-foreground mt-1">{fn.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// Question Box - for prompting self-reflection
interface QuestionBoxProps {
  question: string
  children?: React.ReactNode
}

export function QuestionBox({ question, children }: QuestionBoxProps) {
  return (
    <div className="my-6 p-5 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border-l-4 border-primary">
      <p className="text-lg font-medium text-primary mb-2">{question}</p>
      {children && <div className="text-muted-foreground">{children}</div>}
    </div>
  )
}

// Info Callout
interface CalloutProps {
  type?: 'info' | 'tip' | 'warning' | 'note'
  title?: string
  children: React.ReactNode
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const styles = {
    info: 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-950 dark:text-blue-100',
    tip: 'bg-green-50 border-green-500 text-green-900 dark:bg-green-950 dark:text-green-100',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100',
    note: 'bg-gray-50 border-gray-500 text-gray-900 dark:bg-gray-950 dark:text-gray-100',
  }

  const icons = {
    info: 'ℹ️',
    tip: '💡',
    warning: '⚠️',
    note: '📝',
  }

  return (
    <div className={`my-6 p-4 rounded-lg border-l-4 ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icons[type]}</span>
        <div>
          {title && <p className="font-semibold mb-1">{title}</p>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}
