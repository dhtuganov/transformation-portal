'use client';

import {
  QuizAttempt,
  Quiz,
  QuizQuestion,
  QuizAnswer,
  MBTIResult,
  MBTI_DESCRIPTIONS,
} from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface AttemptDetailsProps {
  attempt: QuizAttempt;
  quiz: Quiz;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function MBTIResultDisplay({ result, attempt }: { result: MBTIResult; attempt: QuizAttempt }) {
  const typeInfo = MBTI_DESCRIPTIONS[result.type];

  const dimensionLabels = {
    EI: { first: 'Экстраверсия (E)', second: 'Интроверсия (I)' },
    SN: { first: 'Сенсорика (S)', second: 'Интуиция (N)' },
    TF: { first: 'Мышление (T)', second: 'Чувство (F)' },
    JP: { first: 'Суждение (J)', second: 'Восприятие (P)' },
  };

  // Prepare data for chart
  const chartData = (Object.entries(result.dimensions) as [keyof typeof result.dimensions, typeof result.dimensions.EI][]).map(
    ([dimension, data]) => {
      const firstKey = dimension[0] as keyof typeof data;
      const secondKey = dimension[1] as keyof typeof data;
      const firstValue = data[firstKey] as number;
      const secondValue = data[secondKey] as number;

      return {
        dimension,
        [firstKey]: firstValue,
        [secondKey]: secondValue,
        dominant: data.dominant,
      };
    }
  );

  return (
    <div className="space-y-6">
      <Card className="border-primary">
        <CardHeader className="text-center pb-2">
          <span className="text-6xl mb-2">{typeInfo.emoji}</span>
          <CardTitle className="text-3xl">
            Ваш тип: {result.type}
          </CardTitle>
          <p className="text-xl text-muted-foreground">{typeInfo.name}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Badge variant="secondary" className="text-sm">
              Уверенность: {result.confidence}%
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <Calendar className="w-4 h-4" />
            {format(new Date(attempt.completed_at!), 'dd MMMM yyyy, HH:mm', { locale: ru })}
          </div>
          {attempt.time_spent_seconds > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
              <Clock className="w-4 h-4" />
              Время: {formatDuration(attempt.time_spent_seconds)}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Детализация по измерениям</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {(Object.entries(result.dimensions) as [keyof typeof result.dimensions, typeof result.dimensions.EI][]).map(
            ([dimension, data]) => {
              const labels = dimensionLabels[dimension];
              const firstKey = dimension[0] as keyof typeof data;
              const secondKey = dimension[1] as keyof typeof data;
              const firstValue = data[firstKey] as number;
              const secondValue = data[secondKey] as number;
              const total = firstValue + secondValue;
              const firstPercent = total > 0 ? (firstValue / total) * 100 : 50;

              return (
                <div key={dimension} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={data.dominant === firstKey ? 'font-semibold text-primary' : 'text-muted-foreground'}>
                      {labels.first}
                    </span>
                    <span className={data.dominant === secondKey ? 'font-semibold text-primary' : 'text-muted-foreground'}>
                      {labels.second}
                    </span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all"
                      style={{ width: `${firstPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{firstValue} ответов</span>
                    <span>{secondValue} ответов</span>
                  </div>
                </div>
              );
            }
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">График распределения</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dimension" />
              <YAxis />
              <Tooltip />
              <Bar dataKey={chartData[0]?.dimension[0]} fill="hsl(var(--primary))" />
              <Bar dataKey={chartData[0]?.dimension[1]} fill="hsl(var(--muted))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function KnowledgeResultDisplay({
  attempt,
  quiz,
  questions,
  answers,
}: {
  attempt: QuizAttempt;
  quiz: Quiz;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
}) {
  const percentage = attempt.total_points
    ? Math.round(((attempt.score || 0) / attempt.total_points) * 100)
    : 0;
  const passed = attempt.passed;
  const correctCount = answers.filter((a) => a.is_correct).length;
  const totalCount = answers.length;

  return (
    <div className="space-y-6">
      <Card className={passed ? 'border-green-500' : 'border-red-500'}>
        <CardHeader className="text-center">
          <div className="text-6xl mb-2">{passed ? '✅' : '❌'}</div>
          <CardTitle className="text-3xl">{percentage}%</CardTitle>
          <p className="text-lg text-muted-foreground">
            {passed ? 'Тест пройден!' : 'Тест не пройден'}
          </p>
          <p className="text-sm text-muted-foreground">
            Правильных ответов: {correctCount} из {totalCount}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <Calendar className="w-4 h-4" />
            {format(new Date(attempt.completed_at!), 'dd MMMM yyyy, HH:mm', { locale: ru })}
          </div>
          {attempt.time_spent_seconds > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
              <Clock className="w-4 h-4" />
              Время: {formatDuration(attempt.time_spent_seconds)}
            </div>
          )}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Проходной балл</span>
              <span className="font-medium">{quiz.passing_score}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Вопросы и ответы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question, index) => {
            const answer = answers.find((a) => a.question_id === question.id);
            if (!answer) return null;

            const isCorrect = answer.is_correct;
            const userAnswer = Array.isArray(answer.user_answer)
              ? answer.user_answer
              : [answer.user_answer];
            const correctAnswer = Array.isArray(question.correct_answer)
              ? question.correct_answer
              : question.correct_answer ? [question.correct_answer] : [];

            return (
              <div
                key={question.id}
                className={`p-4 rounded-lg border-2 ${
                  isCorrect
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium mb-2">
                      {index + 1}. {question.question_text}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Ваш ответ:
                        </span>
                        <div className="mt-1">
                          {userAnswer.map((ans) => {
                            const option = question.options.find((o) => o.value === ans);
                            return (
                              <Badge
                                key={ans}
                                variant={isCorrect ? 'default' : 'destructive'}
                                className="mr-2"
                              >
                                {option?.label || ans}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>

                      {!isCorrect && quiz.show_correct_answers && correctAnswer.length > 0 && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Правильный ответ:
                          </span>
                          <div className="mt-1">
                            {correctAnswer.map((ans) => {
                              const option = question.options.find((o) => o.value === ans);
                              return (
                                <Badge key={ans} variant="outline" className="mr-2 border-green-600 text-green-600">
                                  {option?.label || ans}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {question.explanation && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Пояснение:
                          </p>
                          <p className="text-sm">{question.explanation}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">
                      Баллов: {answer.points_earned} из {question.points}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export function AttemptDetails({ attempt, quiz, questions, answers }: AttemptDetailsProps) {
  if (attempt.status !== 'completed') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center mb-4">
            Этот тест еще не завершен
          </p>
          <Button asChild>
            <Link href="/dashboard/quizzes/history">Вернуться к истории</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-muted-foreground">Детали попытки</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/quizzes/history">Назад к истории</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/quizzes/${quiz.slug}`}>Пройти снова</Link>
          </Button>
        </div>
      </div>

      {quiz.quiz_type === 'mbti' ? (
        <MBTIResultDisplay result={attempt.result_data as MBTIResult} attempt={attempt} />
      ) : (
        <KnowledgeResultDisplay
          attempt={attempt}
          quiz={quiz}
          questions={questions}
          answers={answers}
        />
      )}
    </div>
  );
}
