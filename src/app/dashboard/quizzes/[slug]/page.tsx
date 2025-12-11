'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Quiz } from '@/components/quiz/Quiz';
import { QuizWithQuestions, MBTIResult } from '@/types/quiz';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { awardQuizXP, updateStreak } from '@/lib/gamification/actions';

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
  const [showXPNotification, setShowXPNotification] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);

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

      // Award XP for completing the quiz
      const score = 'score' in result ? Math.round((result.score / result.total) * 100) : 100;
      const xpResult = await awardQuizXP(user.id, quiz.id, score, quiz.title);

      if (xpResult.success) {
        setXpAmount(xpResult.xpAwarded);
        setShowXPNotification(true);

        // Update streak
        await updateStreak(user.id);

        // Hide notification after 5 seconds
        setTimeout(() => {
          setShowXPNotification(false);
        }, 5000);
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

      {/* XP Award Notification */}
      {showXPNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 fade-in duration-300">
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 border-yellow-300 px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-lg"
          >
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            +{xpAmount} XP
          </Badge>
        </div>
      )}
    </div>
  );
}
