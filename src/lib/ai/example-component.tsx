/**
 * Example React Component: Daily Insight Card
 *
 * This component demonstrates how to integrate the AI personalization engine
 * into your Next.js frontend.
 *
 * Place this in: src/components/insights/DailyInsightCard.tsx
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, TrendingUp, Clock, RefreshCw } from 'lucide-react'
import type { DailyInsight } from '@/lib/ai/types'

export function DailyInsightCard() {
  const [insight, setInsight] = useState<DailyInsight | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quota, setQuota] = useState<{ tokensRemaining: number; requestsRemaining: number } | null>(null)

  // Fetch quota on mount
  useEffect(() => {
    fetchQuota()
  }, [])

  const fetchQuota = async () => {
    try {
      const response = await fetch('/api/insights/quota')
      const data = await response.json()

      if (data.success) {
        setQuota(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch quota:', err)
    }
  }

  const fetchInsight = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/insights/daily')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate insight')
      }

      if (data.success) {
        setInsight(data.data)
        // Update quota after successful request
        await fetchQuota()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle>Ежедневный инсайт</CardTitle>
          </div>
          {quota && (
            <Badge variant="outline" className="text-xs">
              {quota.requestsRemaining} запросов осталось
            </Badge>
          )}
        </div>
        <CardDescription>
          Персонализированный инсайт на основе вашего типа личности
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Insight Display */}
        {insight && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">{insight.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {insight.content}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {insight.cognitiveFunction}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +{insight.xpReward} XP
              </Badge>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Действие на сегодня:</p>
              <p className="text-sm text-muted-foreground">
                {insight.actionItem}
              </p>
            </div>

            {insight.generatedAt && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(insight.generatedAt).toLocaleString('ru-RU')}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4">
          <Button
            onClick={fetchInsight}
            disabled={loading || (quota?.requestsRemaining === 0)}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Генерация инсайта...
              </>
            ) : insight ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Новый инсайт
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Получить инсайт
              </>
            )}
          </Button>

          {quota?.requestsRemaining === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Вы достигли дневного лимита. Попробуйте завтра!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Example: Journal Analysis Component
 */
export function JournalAnalysisCard() {
  const [entry, setEntry] = useState('')
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const analyzeEntry = async () => {
    if (!entry.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/insights/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'journal',
          journalEntry: entry
        })
      })

      const data = await response.json()
      if (data.success) {
        setAnalysis(data.data)
      }
    } catch (err) {
      console.error('Analysis failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Анализ записи</CardTitle>
        <CardDescription>
          AI-анализ вашей рефлексии
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Опишите свои мысли и наблюдения..."
          className="w-full min-h-[150px] p-3 border rounded-md"
        />

        <Button onClick={analyzeEntry} disabled={loading || !entry.trim()}>
          {loading ? 'Анализ...' : 'Анализировать'}
        </Button>

        {analysis && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <p className="text-sm font-medium">Эмоциональный тон:</p>
              <Badge>{analysis.emotionalTone}</Badge>
            </div>

            <div>
              <p className="text-sm font-medium">Ключевые темы:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {analysis.themes.map((theme: string, i: number) => (
                  <Badge key={i} variant="outline">{theme}</Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">Обратная связь:</p>
              <p className="text-sm text-muted-foreground mt-1">
                {analysis.feedback}
              </p>
            </div>

            <Badge variant="outline">+{analysis.xpReward} XP</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Example: Type-Specific Tip Component
 */
export function TypeSpecificTipCard({ context }: { context: string }) {
  const [tip, setTip] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchTip = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/insights/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tip',
          context
        })
      })

      const data = await response.json()
      if (data.success) {
        setTip(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch tip:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (context) {
      fetchTip()
    }
  }, [context])

  if (loading) return <div>Загрузка совета...</div>

  if (!tip) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Совет для вашего типа</CardTitle>
        <Badge variant="secondary">{tip.cognitiveFunction}</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">{tip.tip}</p>
        <p className="text-xs text-muted-foreground italic">
          {tip.rationale}
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * Usage Examples:
 *
 * 1. In a dashboard page:
 *
 * import { DailyInsightCard } from '@/components/insights/DailyInsightCard'
 *
 * export default function DashboardPage() {
 *   return (
 *     <div className="container py-8">
 *       <DailyInsightCard />
 *     </div>
 *   )
 * }
 *
 * 2. In a journal page:
 *
 * import { JournalAnalysisCard } from '@/components/insights/DailyInsightCard'
 *
 * export default function JournalPage() {
 *   return (
 *     <div className="container py-8">
 *       <JournalAnalysisCard />
 *     </div>
 *   )
 * }
 *
 * 3. Contextual tip in a learning module:
 *
 * import { TypeSpecificTipCard } from '@/components/insights/DailyInsightCard'
 *
 * export default function LearningModule() {
 *   return (
 *     <div>
 *       <h1>Работа в команде</h1>
 *       <TypeSpecificTipCard context="Работа в команде над долгосрочным проектом" />
 *     </div>
 *   )
 * }
 */
