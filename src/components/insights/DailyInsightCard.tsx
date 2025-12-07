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
