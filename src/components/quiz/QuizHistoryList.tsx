'use client';

import { QuizAttempt, Quiz, MBTIResult, MBTI_DESCRIPTIONS } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface QuizHistoryListProps {
  attempts: (QuizAttempt & { quiz: Quiz })[];
}

const statusLabels = {
  completed: { label: 'Завершено', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  in_progress: { label: 'В процессе', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  abandoned: { label: 'Прервано', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

const typeLabels = {
  knowledge: { label: 'Знания', emoji: '📚' },
  mbti: { label: 'MBTI', emoji: '🧠' },
  assessment: { label: 'Оценка', emoji: '📊' },
  feedback: { label: 'Обратная связь', emoji: '💬' },
};

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function getResultDisplay(attempt: QuizAttempt, quiz: Quiz): {
  primary: string;
  secondary?: string;
} {
  if (quiz.quiz_type === 'mbti' && attempt.status === 'completed') {
    const mbtiResult = attempt.result_data as MBTIResult;
    if (mbtiResult?.type) {
      const typeInfo = MBTI_DESCRIPTIONS[mbtiResult.type];
      return {
        primary: `${mbtiResult.type} - ${typeInfo.name}`,
        secondary: `Уверенность: ${mbtiResult.confidence}%`,
      };
    }
  }

  if (quiz.quiz_type === 'knowledge' && attempt.status === 'completed') {
    const percentage = attempt.total_points
      ? Math.round((attempt.score || 0) / attempt.total_points * 100)
      : 0;
    const passed = attempt.passed;
    return {
      primary: `${percentage}%`,
      secondary: passed ? 'Тест пройден' : 'Не пройден',
    };
  }

  return { primary: 'Нет результата' };
}

export function QuizHistoryList({ attempts }: QuizHistoryListProps) {
  if (attempts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center mb-4">
            У вас пока нет пройденных тестов
          </p>
          <Button asChild>
            <Link href="/dashboard/quizzes">Перейти к тестам</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Group attempts by quiz
  const groupedAttempts = attempts.reduce((acc, attempt) => {
    const quizId = attempt.quiz_id;
    if (!acc[quizId]) {
      acc[quizId] = {
        quiz: attempt.quiz,
        attempts: [],
      };
    }
    acc[quizId].attempts.push(attempt);
    return acc;
  }, {} as Record<string, { quiz: Quiz; attempts: QuizAttempt[] }>);

  return (
    <div className="space-y-6">
      {Object.values(groupedAttempts).map(({ quiz, attempts: quizAttempts }) => {
        const quizType = typeLabels[quiz.quiz_type];
        const completedAttempts = quizAttempts.filter((a) => a.status === 'completed');
        const latestAttempt = quizAttempts[0]; // Assumes attempts are sorted by date desc

        return (
          <Card key={quiz.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{quizType.emoji}</span>
                    <Badge variant="secondary">{quizType.label}</Badge>
                  </div>
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Пройдено: {completedAttempts.length} раз(а)
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/quizzes/${quiz.slug}`}>
                    Пройти снова
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quizAttempts.map((attempt) => {
                  const status = statusLabels[attempt.status];
                  const StatusIcon = status.icon;
                  const result = getResultDisplay(attempt, quiz);

                  return (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <StatusIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className={status.color}>
                              {status.label}
                            </Badge>
                            {attempt.completed_at && (
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(attempt.completed_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                              </span>
                            )}
                            {!attempt.completed_at && (
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(attempt.started_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                              </span>
                            )}
                          </div>

                          {attempt.status === 'completed' && (
                            <div className="mt-1">
                              <p className="text-sm font-medium">{result.primary}</p>
                              {result.secondary && (
                                <p className="text-xs text-muted-foreground">{result.secondary}</p>
                              )}
                            </div>
                          )}

                          {attempt.time_spent_seconds > 0 && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Время: {formatDuration(attempt.time_spent_seconds)}
                            </p>
                          )}
                        </div>
                      </div>

                      {attempt.status === 'completed' && (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/dashboard/quizzes/attempts/${attempt.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Подробнее
                          </Link>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
