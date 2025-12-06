import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, CheckCircle2, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Quiz = {
  id: string
  slug: string
  title: string
  description: string | null
  quiz_type: string
  category: string | null
  tags: string[]
  mbti_types: string[]
  roles: string[]
  difficulty: string
  duration_minutes: number
  passing_score: number
  max_attempts: number
  shuffle_questions: boolean
  shuffle_options: boolean
  show_correct_answers: boolean
  published: boolean
  author: string | null
  created_at: string
  updated_at: string
}

type QuizQuestion = {
  id: string
  question_order: number
  question_type: string
  question_text: string
  question_hint: string | null
  options: { value: string; label: string }[]
  correct_answer: unknown
  points: number
  explanation: string | null
  mbti_dimension: string | null
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

const QUESTION_TYPE_LABELS: Record<string, string> = {
  single_choice: 'Один вариант',
  multiple_choice: 'Несколько вариантов',
  scale: 'Шкала',
  text: 'Текстовый ответ',
  mbti_pair: 'MBTI пара',
}

export default async function QuizDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get quiz details
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', params.id)
    .single() as { data: Quiz | null }

  if (!quiz) {
    notFound()
  }

  // Get quiz questions
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', params.id)
    .order('question_order', { ascending: true }) as { data: QuizQuestion[] | null }

  // Get attempt count
  const { count: attemptCount } = await supabase
    .from('quiz_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('quiz_id', params.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/quizzes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
            <p className="text-muted-foreground mt-1">
              {quiz.description || 'Описание отсутствует'}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/quizzes/${quiz.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Редактировать
          </Link>
        </Button>
      </div>

      {/* Quiz Info */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Тип теста</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {QUIZ_TYPE_LABELS[quiz.quiz_type] || quiz.quiz_type}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Сложность</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {DIFFICULTY_LABELS[quiz.difficulty] || quiz.difficulty}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Длительность</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quiz.duration_minutes} мин</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Статус</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {quiz.published ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-xl font-bold">Опубликован</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-xl font-bold">Черновик</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Настройки теста</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground">Проходной балл</div>
              <div className="text-lg font-medium">{quiz.passing_score}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Максимум попыток</div>
              <div className="text-lg font-medium">{quiz.max_attempts}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Перемешивать вопросы</div>
              <div className="text-lg font-medium">{quiz.shuffle_questions ? 'Да' : 'Нет'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Перемешивать варианты</div>
              <div className="text-lg font-medium">{quiz.shuffle_options ? 'Да' : 'Нет'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Показывать ответы</div>
              <div className="text-lg font-medium">{quiz.show_correct_answers ? 'Да' : 'Нет'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Прохождений</div>
              <div className="text-lg font-medium">{attemptCount || 0}</div>
            </div>
          </div>

          {quiz.tags && quiz.tags.length > 0 && (
            <div className="mt-4">
              <div className="text-sm text-muted-foreground mb-2">Теги</div>
              <div className="flex flex-wrap gap-2">
                {quiz.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Вопросы ({questions?.length || 0})</CardTitle>
          <CardDescription>Список вопросов теста</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions && questions.length > 0 ? (
              questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-medium text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="font-medium">{question.question_text}</p>
                        <Badge variant="outline">
                          {QUESTION_TYPE_LABELS[question.question_type] || question.question_type}
                        </Badge>
                      </div>

                      {question.question_hint && (
                        <p className="text-sm text-muted-foreground italic">
                          Подсказка: {question.question_hint}
                        </p>
                      )}

                      {question.options && question.options.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="text-sm pl-4">
                              • {option.label}
                            </div>
                          ))}
                        </div>
                      )}

                      {question.explanation && (
                        <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                          <span className="font-medium">Объяснение:</span> {question.explanation}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Баллов: {question.points}</span>
                        {question.mbti_dimension && (
                          <Badge variant="secondary">MBTI: {question.mbti_dimension}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                В этом тесте пока нет вопросов
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
