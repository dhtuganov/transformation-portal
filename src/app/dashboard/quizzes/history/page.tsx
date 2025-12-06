import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { QuizHistoryList } from '@/components/quiz/QuizHistoryList';
import { QuizAttempt, Quiz } from '@/types/quiz';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'История тестов | Otrar Portal',
  description: 'История ваших пройденных тестов и результаты',
};

export default async function QuizHistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user's quiz attempts
  const { data: attemptsData, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Error fetching quiz attempts:', error);
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">История тестов</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive text-center mb-4">
              Не удалось загрузить историю тестов
            </p>
            <Button asChild>
              <Link href="/dashboard/quizzes">Перейти к тестам</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const attempts = (attemptsData || []) as QuizAttempt[];

  // Fetch all unique quiz IDs
  const quizIds = [...new Set(attempts.map(a => a.quiz_id))];

  // Fetch quiz data for all attempts
  const { data: quizzesData } = await supabase
    .from('quizzes')
    .select('*')
    .in('id', quizIds);

  const quizzes = (quizzesData || []) as Quiz[];

  // Create a map of quizzes by ID for fast lookup
  const quizMap = new Map(quizzes.map(q => [q.id, q]));

  // Transform data to match component props
  const attemptsWithQuiz = attempts
    .map((attempt) => {
      const quiz = quizMap.get(attempt.quiz_id);
      if (!quiz) return null;
      return {
        ...attempt,
        quiz,
      };
    })
    .filter(Boolean) as (QuizAttempt & { quiz: Quiz })[];

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">История тестов</h1>
          <p className="text-muted-foreground mt-1">
            Все ваши попытки прохождения тестов
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/quizzes">Перейти к тестам</Link>
        </Button>
      </div>

      <QuizHistoryList attempts={attemptsWithQuiz} />
    </div>
  );
}
