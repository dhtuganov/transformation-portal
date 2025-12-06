'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Quiz } from '@/components/quiz/Quiz';
import { QuizWithQuestions, MBTIResult } from '@/types/quiz';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface QuizPageProps {
  params: Promise<{ slug: string }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        // Check auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth');
          return;
        }

        // Fetch quiz
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: quizData, error: quizError } = await (supabase
          .from('quizzes') as any)
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single();

        if (quizError || !quizData) {
          setError('Тест не найден');
          return;
        }

        // Fetch questions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: questions, error: questionsError } = await (supabase
          .from('quiz_questions') as any)
          .select('*')
          .eq('quiz_id', quizData.id)
          .order('question_order');

        if (questionsError) {
          setError('Ошибка загрузки вопросов');
          return;
        }

        setQuiz({
          ...quizData,
          questions: questions || [],
        } as QuizWithQuestions);
      } catch (err) {
        setError('Произошла ошибка');
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [slug, router, supabase]);

  const handleComplete = async (result: MBTIResult | { score: number; total: number; passed: boolean }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !quiz) return;

      // Save attempt
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: attemptError } = await (supabase
        .from('quiz_attempts') as any)
        .insert({
          user_id: user.id,
          quiz_id: quiz.id,
          status: 'completed',
          completed_at: new Date().toISOString(),
          result_data: result,
          score: 'type' in result ? null : result.score,
          total_points: 'type' in result ? null : result.total,
          passed: 'type' in result ? null : result.passed,
        });

      if (attemptError) {
        console.error('Error saving attempt:', attemptError);
      }

      // Update profile with MBTI type if it's an MBTI quiz
      if ('type' in result) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: profileError } = await (supabase
          .from('profiles') as any)
          .update({
            mbti_type: result.type,
            mbti_verified: false,
          })
          .eq('id', user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }
    } catch (err) {
      console.error('Error completing quiz:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl text-center">
        <p className="text-lg text-muted-foreground mb-4">{error || 'Тест не найден'}</p>
        <Button asChild>
          <Link href="/dashboard/quizzes">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к списку
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/quizzes">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Все тесты
          </Link>
        </Button>
      </div>

      <Quiz quiz={quiz} onComplete={handleComplete} />
    </div>
  );
}
