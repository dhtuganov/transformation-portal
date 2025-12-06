import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { QuizCard } from '@/components/quiz/QuizCard';
import { Quiz } from '@/types/quiz';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata = {
  title: 'Тесты | Otrar Transformation Portal',
  description: 'Пройдите тесты для определения вашего типа личности и оценки знаний',
};

export default async function QuizzesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Fetch all published quizzes
  const { data: quizzes, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false }) as { data: Quiz[] | null; error: unknown };

  // Fetch user's attempts
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('quiz_id, status, score, total_points')
    .eq('user_id', user.id) as { data: { quiz_id: string; status: string; score: number | null; total_points: number | null }[] | null };

  // Group quizzes by type
  const mbtiQuizzes = quizzes?.filter((q) => q.quiz_type === 'mbti') || [];
  const knowledgeQuizzes = quizzes?.filter((q) => q.quiz_type === 'knowledge') || [];
  const assessmentQuizzes = quizzes?.filter((q) => q.quiz_type === 'assessment') || [];

  // Get attempts count per quiz
  const getAttemptsInfo = (quizId: string) => {
    const quizAttempts = attempts?.filter((a) => a.quiz_id === quizId && a.status === 'completed') || [];
    const completed = quizAttempts.length;
    const best = quizAttempts.reduce((max, a) => {
      if (a.score !== null && a.total_points !== null && a.total_points > 0) {
        const percent = Math.round((a.score / a.total_points) * 100);
        return percent > max ? percent : max;
      }
      return max;
    }, 0);
    return { completed, best: best > 0 ? best : undefined };
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Тесты</h1>
        <p className="text-muted-foreground">
          Пройдите тесты для определения вашего типа личности и оценки знаний
        </p>
      </div>

      <Tabs defaultValue="mbti" className="space-y-6">
        <TabsList>
          <TabsTrigger value="mbti">
            MBTI ({mbtiQuizzes.length})
          </TabsTrigger>
          <TabsTrigger value="knowledge">
            Знания ({knowledgeQuizzes.length})
          </TabsTrigger>
          <TabsTrigger value="assessment">
            Оценка ({assessmentQuizzes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mbti" className="space-y-4">
          {mbtiQuizzes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mbtiQuizzes.map((quiz) => {
                const info = getAttemptsInfo(quiz.id);
                return (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    completedAttempts={info.completed}
                    bestScore={info.best}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>MBTI тесты скоро появятся</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          {knowledgeQuizzes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {knowledgeQuizzes.map((quiz) => {
                const info = getAttemptsInfo(quiz.id);
                return (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    completedAttempts={info.completed}
                    bestScore={info.best}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Тесты на знания скоро появятся</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          {assessmentQuizzes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assessmentQuizzes.map((quiz) => {
                const info = getAttemptsInfo(quiz.id);
                return (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    completedAttempts={info.completed}
                    bestScore={info.best}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Оценочные тесты скоро появятся</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">О тестировании</h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>MBTI тесты</strong> — определение вашего типа личности</li>
          <li>• <strong>Тесты на знания</strong> — проверка знаний по трансформации и MBTI</li>
          <li>• <strong>Оценочные тесты</strong> — оценка компетенций и навыков</li>
        </ul>
      </div>
    </div>
  );
}
