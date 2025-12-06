'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Eye, Edit, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

type QuizWithCounts = {
  id: string
  slug: string
  title: string
  description: string | null
  quiz_type: string
  difficulty: string
  duration_minutes: number
  published: boolean
  created_at: string
  questionCount: number
  attemptCount: number
}

type Props = {
  quizzes: QuizWithCounts[]
}

const QUIZ_TYPE_LABELS: Record<string, string> = {
  knowledge: 'Тест знаний',
  mbti: 'MBTI',
  assessment: 'Оценка',
  feedback: 'Обратная связь',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Начальный',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
}

export function QuizList({ quizzes }: Props) {
  const [publishingStates, setPublishingStates] = useState<Record<string, boolean>>(
    quizzes.reduce((acc, quiz) => ({ ...acc, [quiz.id]: quiz.published }), {})
  )
  const [updatingQuizzes, setUpdatingQuizzes] = useState<Set<string>>(new Set())

  const handlePublishToggle = async (quizId: string, currentState: boolean) => {
    setUpdatingQuizzes(prev => new Set(prev).add(quizId))

    try {
      const response = await fetch('/api/admin/quizzes/toggle-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, published: !currentState }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle publish status')
      }

      setPublishingStates(prev => ({ ...prev, [quizId]: !currentState }))
      toast.success(!currentState ? 'Тест опубликован' : 'Тест снят с публикации')
    } catch (error) {
      console.error('Error toggling publish:', error)
      toast.error('Ошибка при изменении статуса публикации')
    } finally {
      setUpdatingQuizzes(prev => {
        const next = new Set(prev)
        next.delete(quizId)
        return next
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Всего тестов: {quizzes.length}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">Название</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Тип</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Сложность</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Вопросов</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Прохождений</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Длительность</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Опубликован</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">{quiz.title}</div>
                      {quiz.description && (
                        <div className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {quiz.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">
                      {QUIZ_TYPE_LABELS[quiz.quiz_type] || quiz.quiz_type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={DIFFICULTY_COLORS[quiz.difficulty]}>
                      {DIFFICULTY_LABELS[quiz.difficulty] || quiz.difficulty}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-medium">{quiz.questionCount}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-muted-foreground">{quiz.attemptCount}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {quiz.duration_minutes} мин
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={publishingStates[quiz.id] || false}
                        onCheckedChange={() => handlePublishToggle(quiz.id, publishingStates[quiz.id])}
                        disabled={updatingQuizzes.has(quiz.id)}
                      />
                      {publishingStates[quiz.id] ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link href={`/admin/quizzes/${quiz.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Просмотр
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Изменить
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Тесты не найдены. Создайте первый тест.
        </div>
      )}
    </div>
  )
}
