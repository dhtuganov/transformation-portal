import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { AttemptDetails } from '@/components/quiz/AttemptDetails';
import { QuizAttempt, Quiz, QuizQuestion, QuizAnswer } from '@/types/quiz';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Детали попытки | Otrar Portal',
  description: 'Подробная информация о попытке прохождения теста',
};

interface PageProps {
  params: Promise<{
    attemptId: string;
  }>;
}

export default async function AttemptDetailsPage({ params }: PageProps) {
  const { attemptId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch attempt data
  const { data: attemptData, error: attemptError } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .single();

  if (attemptError || !attemptData) {
    notFound();
  }

  const attempt = attemptData as QuizAttempt;

  // Fetch quiz data separately
  const { data: quizData, error: quizError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', attempt.quiz_id)
    .single();

  if (quizError || !quizData) {
    notFound();
  }

  const quiz = quizData as Quiz;

  // Fetch questions for the quiz
  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quiz.id)
    .order('question_order', { ascending: true });

  if (questionsError || !questions) {
    console.error('Error fetching questions:', questionsError);
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Детали попытки</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive text-center mb-4">
              Не удалось загрузить данные теста
            </p>
            <Button asChild>
              <Link href="/dashboard/quizzes/history">Вернуться к истории</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch user's answers for this attempt
  const { data: answers, error: answersError } = await supabase
    .from('quiz_answers')
    .select('*')
    .eq('attempt_id', attemptId);

  if (answersError) {
    console.error('Error fetching answers:', answersError);
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <AttemptDetails
        attempt={attempt}
        quiz={quiz}
        questions={questions as QuizQuestion[]}
        answers={(answers || []) as QuizAnswer[]}
      />
    </div>
  );
}
