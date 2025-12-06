'use client';

import { Quiz } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, HelpCircle, Target } from 'lucide-react';
import Link from 'next/link';

interface QuizCardProps {
  quiz: Quiz;
  completedAttempts?: number;
  bestScore?: number;
}

const difficultyLabels = {
  beginner: { label: 'Начальный', color: 'bg-green-100 text-green-800' },
  intermediate: { label: 'Средний', color: 'bg-yellow-100 text-yellow-800' },
  advanced: { label: 'Продвинутый', color: 'bg-red-100 text-red-800' },
};

const typeLabels = {
  knowledge: { label: 'Знания', emoji: '📚' },
  mbti: { label: 'MBTI', emoji: '🧠' },
  assessment: { label: 'Оценка', emoji: '📊' },
  feedback: { label: 'Обратная связь', emoji: '💬' },
};

export function QuizCard({ quiz, completedAttempts = 0, bestScore }: QuizCardProps) {
  const difficulty = difficultyLabels[quiz.difficulty];
  const quizType = typeLabels[quiz.quiz_type];

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <span className="text-3xl">{quizType.emoji}</span>
          <Badge variant="secondary" className={difficulty.color}>
            {difficulty.label}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-2">{quiz.title}</CardTitle>
        {quiz.description && (
          <CardDescription className="line-clamp-2">
            {quiz.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {quiz.duration_minutes} мин
          </span>
          <span className="flex items-center gap-1">
            <HelpCircle className="w-4 h-4" />
            {quizType.label}
          </span>
          {quiz.passing_score > 0 && (
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              {quiz.passing_score}%
            </span>
          )}
        </div>

        {completedAttempts > 0 && (
          <div className="text-sm text-muted-foreground mb-4">
            <span>Пройдено: {completedAttempts} раз(а)</span>
            {bestScore !== undefined && quiz.quiz_type !== 'mbti' && (
              <span className="ml-2">| Лучший: {bestScore}%</span>
            )}
          </div>
        )}

        <div className="mt-auto">
          <Button asChild className="w-full">
            <Link href={`/dashboard/quizzes/${quiz.slug}`}>
              {completedAttempts > 0 ? 'Пройти снова' : 'Начать'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
