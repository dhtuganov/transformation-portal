import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QuizList } from '@/components/admin/QuizList'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Quiz Management | Otrar Admin',
  description: 'Управление тестами',
}

type Quiz = {
  id: string
  slug: string
  title: string
  description: string | null
  quiz_type: string
  difficulty: string
  duration_minutes: number
  published: boolean
  created_at: string
}

type QuizQuestion = {
  id: string
  quiz_id: string
}

type QuizAttempt = {
  id: string
  quiz_id: string
}

export default async function QuizzesPage() {
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

  // Get all quizzes
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false }) as { data: Quiz[] | null }

  // Get question counts for each quiz
  const quizzesWithCounts = await Promise.all(
    (quizzes || []).map(async (quiz) => {
      const { count: questionCount } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', quiz.id)

      const { count: attemptCount } = await supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', quiz.id)

      return {
        ...quiz,
        questionCount: questionCount || 0,
        attemptCount: attemptCount || 0,
      }
    })
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управление тестами</h1>
          <p className="text-muted-foreground mt-1">
            Создание и редактирование тестов, опросов и диагностик
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/quizzes/new">
            <Plus className="mr-2 h-4 w-4" />
            Создать тест
          </Link>
        </Button>
      </div>

      {/* Quizzes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Все тесты</CardTitle>
          <CardDescription>
            Список всех тестов и опросов в системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuizList quizzes={quizzesWithCounts} />
        </CardContent>
      </Card>
    </div>
  )
}
