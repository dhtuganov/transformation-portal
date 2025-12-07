'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Sparkles,
  TrendingUp,
  Clock,
  RefreshCw,
  Copy,
  Check,
  BookmarkPlus,
  History,
  Brain,
  Target,
  MessageSquare,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import type { DailyInsight, TypeSpecificTip, JournalAnalysis } from '@/lib/ai/types'

type InsightHistory = {
  id: string
  type: 'daily' | 'tip' | 'journal' | 'inferior'
  data: DailyInsight | TypeSpecificTip | JournalAnalysis
  createdAt: Date
}

export default function InsightsPage() {
  // State
  const [activeTab, setActiveTab] = useState('daily')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Current insights
  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null)
  const [tip, setTip] = useState<TypeSpecificTip | null>(null)
  const [journalAnalysis, setJournalAnalysis] = useState<JournalAnalysis | null>(null)
  const [inferiorExercise, setInferiorExercise] = useState<DailyInsight | null>(null)

  // Input for context-based insights
  const [tipContext, setTipContext] = useState('')
  const [journalEntry, setJournalEntry] = useState('')

  // Quota
  const [quota, setQuota] = useState<{ tokensRemaining: number; requestsRemaining: number } | null>(null)

  // History (stored in localStorage)
  const [history, setHistory] = useState<InsightHistory[]>([])

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('insight-history')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setHistory(parsed.map((h: InsightHistory) => ({
          ...h,
          createdAt: new Date(h.createdAt)
        })))
      } catch (e) {
        console.error('Failed to parse history:', e)
      }
    }
    fetchQuota()
  }, [])

  // Save history to localStorage
  const saveToHistory = useCallback((type: InsightHistory['type'], data: InsightHistory['data']) => {
    const newEntry: InsightHistory = {
      id: crypto.randomUUID(),
      type,
      data,
      createdAt: new Date()
    }

    setHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, 20) // Keep last 20
      localStorage.setItem('insight-history', JSON.stringify(updated))
      return updated
    })

    toast.success('Инсайт сохранён в историю')
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

  const fetchDailyInsight = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/insights/daily')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate insight')
      }

      if (data.success) {
        setDailyInsight(data.data)
        await fetchQuota()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
      toast.error(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const fetchTip = async () => {
    if (!tipContext.trim()) {
      toast.error('Введите контекст ситуации')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/insights/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tip', context: tipContext })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate tip')
      }

      if (data.success) {
        setTip(data.data)
        await fetchQuota()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
      toast.error(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const fetchJournalAnalysis = async () => {
    if (!journalEntry.trim()) {
      toast.error('Введите запись из дневника')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/insights/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'journal', journalEntry })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze journal')
      }

      if (data.success) {
        setJournalAnalysis(data.data)
        await fetchQuota()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
      toast.error(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const fetchInferiorExercise = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/insights/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'inferior' })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate exercise')
      }

      if (data.success) {
        setInferiorExercise(data.data)
        await fetchQuota()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
      toast.error(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Скопировано в буфер обмена')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Не удалось скопировать')
    }
  }

  const getInsightText = (insight: DailyInsight) => {
    return `${insight.title}\n\n${insight.content}\n\nДействие на сегодня: ${insight.actionItem}\n\nКогнитивная функция: ${insight.cognitiveFunction}`
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-500" />
            AI Инсайты
          </h1>
          <p className="text-muted-foreground mt-1">
            Персонализированные инсайты на основе вашего типа личности
          </p>
        </div>
        {quota && (
          <Badge variant="outline" className="text-sm px-3 py-1">
            <Zap className="h-4 w-4 mr-1" />
            {quota.requestsRemaining} запросов сегодня
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Ежедневный</span>
          </TabsTrigger>
          <TabsTrigger value="tip" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Совет</span>
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Дневник</span>
          </TabsTrigger>
          <TabsTrigger value="inferior" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Развитие</span>
          </TabsTrigger>
        </TabsList>

        {/* Daily Insight Tab */}
        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Ежедневный инсайт
              </CardTitle>
              <CardDescription>
                Получите персонализированный инсайт для развития ваших когнитивных функций
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dailyInsight && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold">{dailyInsight.title}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(getInsightText(dailyInsight))}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => saveToHistory('daily', dailyInsight)}
                      >
                        <BookmarkPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {dailyInsight.content}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">
                      {dailyInsight.cognitiveFunction}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +{dailyInsight.xpReward} XP
                    </Badge>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Действие на сегодня:</p>
                    <p className="text-sm text-muted-foreground">
                      {dailyInsight.actionItem}
                    </p>
                  </div>

                  {dailyInsight.generatedAt && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(dailyInsight.generatedAt).toLocaleString('ru-RU')}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              )}

              <Button
                onClick={fetchDailyInsight}
                disabled={loading || quota?.requestsRemaining === 0}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Генерация...
                  </>
                ) : dailyInsight ? (
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tip Tab */}
        <TabsContent value="tip">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Персональный совет
              </CardTitle>
              <CardDescription>
                Опишите ситуацию и получите совет, адаптированный под ваш тип личности
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Опишите ситуацию, в которой вам нужен совет...&#10;&#10;Например: &quot;Мне сложно делегировать задачи команде&quot; или &quot;Как лучше подготовиться к сложному разговору с руководителем?&quot;"
                value={tipContext}
                onChange={(e) => setTipContext(e.target.value)}
                className="min-h-[120px]"
              />

              {tip && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary">{tip.cognitiveFunction}</Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(`${tip.tip}\n\n${tip.rationale}`)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => saveToHistory('tip', tip)}
                      >
                        <BookmarkPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {tip.tip}
                  </p>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Почему это работает:</p>
                    <p className="text-sm text-muted-foreground">
                      {tip.rationale}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={fetchTip}
                disabled={loading || quota?.requestsRemaining === 0 || !tipContext.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Генерация совета...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Получить совет
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journal Tab */}
        <TabsContent value="journal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                Анализ дневника
              </CardTitle>
              <CardDescription>
                Напишите о своих мыслях и чувствах — AI проанализирует их через призму ваших когнитивных функций
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Напишите о том, что вас беспокоит или радует...&#10;&#10;Это может быть рефлексия о прошедшем дне, размышления о решении или просто поток мыслей."
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                className="min-h-[150px]"
              />

              {journalAnalysis && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge variant={
                      journalAnalysis.emotionalTone === 'positive' ? 'default' :
                      journalAnalysis.emotionalTone === 'negative' ? 'destructive' :
                      'secondary'
                    }>
                      {journalAnalysis.emotionalTone === 'positive' ? 'Позитивный тон' :
                       journalAnalysis.emotionalTone === 'negative' ? 'Негативный тон' :
                       journalAnalysis.emotionalTone === 'mixed' ? 'Смешанный тон' :
                       'Нейтральный тон'}
                    </Badge>
                    {journalAnalysis.xpReward && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +{journalAnalysis.xpReward} XP
                      </Badge>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Ключевые темы:</p>
                    <div className="flex gap-2 flex-wrap">
                      {journalAnalysis.themes.map((theme, i) => (
                        <Badge key={i} variant="outline">{theme}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Когнитивные функции:</p>
                    <div className="flex gap-2 flex-wrap">
                      {journalAnalysis.cognitiveFunctionsUsed.map((fn, i) => (
                        <Badge key={i} variant="secondary">{fn}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Возможности для роста:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      {journalAnalysis.growthOpportunities.map((opp, i) => (
                        <li key={i}>{opp}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Обратная связь:</p>
                    <p className="text-sm text-muted-foreground">
                      {journalAnalysis.feedback}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={fetchJournalAnalysis}
                disabled={loading || quota?.requestsRemaining === 0 || !journalEntry.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Анализ...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Проанализировать
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inferior Function Tab */}
        <TabsContent value="inferior">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-pink-500" />
                Развитие слабой функции
              </CardTitle>
              <CardDescription>
                Получите безопасное упражнение для развития вашей инфериорной (слабой) когнитивной функции
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Важно:</strong> Инфериорная функция — самая уязвимая часть вашей личности.
                  Развивать её нужно постепенно, без давления, через игру и эксперименты.
                </p>
              </div>

              {inferiorExercise && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold">{inferiorExercise.title}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(getInsightText(inferiorExercise))}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => saveToHistory('inferior', inferiorExercise)}
                      >
                        <BookmarkPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {inferiorExercise.content}
                  </p>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {inferiorExercise.cognitiveFunction}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +{inferiorExercise.xpReward} XP
                    </Badge>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Упражнение:</p>
                    <p className="text-sm text-muted-foreground">
                      {inferiorExercise.actionItem}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={fetchInferiorExercise}
                disabled={loading || quota?.requestsRemaining === 0}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Генерация упражнения...
                  </>
                ) : inferiorExercise ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Новое упражнение
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Получить упражнение
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* History Section */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              История инсайтов
            </CardTitle>
            <CardDescription>
              Последние сохранённые инсайты (хранятся локально)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-muted/50 rounded-lg flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {item.type === 'daily' ? 'Ежедневный' :
                         item.type === 'tip' ? 'Совет' :
                         item.type === 'journal' ? 'Дневник' : 'Развитие'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <p className="text-sm truncate">
                      {'title' in item.data ? item.data.title :
                       'tip' in item.data ? item.data.tip.substring(0, 100) + '...' :
                       item.data.feedback?.substring(0, 100) + '...'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const text = 'title' in item.data
                        ? getInsightText(item.data as DailyInsight)
                        : 'tip' in item.data
                        ? `${(item.data as TypeSpecificTip).tip}\n\n${(item.data as TypeSpecificTip).rationale}`
                        : (item.data as JournalAnalysis).feedback || ''
                      copyToClipboard(text)
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {history.length > 5 && (
              <Button
                variant="ghost"
                className="w-full mt-3"
                onClick={() => {
                  // Could expand to show all, or navigate to a dedicated history page
                  toast.info(`Всего сохранено ${history.length} инсайтов`)
                }}
              >
                Показать все ({history.length})
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quota Warning */}
      {quota?.requestsRemaining === 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="pt-6">
            <p className="text-center text-amber-800 dark:text-amber-200">
              Вы достигли дневного лимита запросов. Попробуйте завтра!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
