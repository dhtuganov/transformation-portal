'use client';

import { MBTIResult, MBTI_DESCRIPTIONS, MBTIType } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface QuizResultProps {
  result: MBTIResult;
  onRetake?: () => void;
}

export function QuizResult({ result, onRetake }: QuizResultProps) {
  const typeInfo = MBTI_DESCRIPTIONS[result.type];

  const dimensionLabels = {
    EI: { first: 'Экстраверсия (E)', second: 'Интроверсия (I)' },
    SN: { first: 'Сенсорика (S)', second: 'Интуиция (N)' },
    TF: { first: 'Мышление (T)', second: 'Чувство (F)' },
    JP: { first: 'Суждение (J)', second: 'Восприятие (P)' },
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="border-primary">
        <CardHeader className="text-center pb-2">
          <span className="text-6xl mb-2">{typeInfo.emoji}</span>
          <CardTitle className="text-3xl">
            Ваш тип: {result.type}
          </CardTitle>
          <p className="text-xl text-muted-foreground">{typeInfo.name}</p>
        </CardHeader>
        <CardContent className="text-center">
          <Badge variant="secondary" className="text-sm">
            Уверенность: {result.confidence}%
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ваши предпочтения</CardTitle>
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
          <CardTitle className="text-lg">Что дальше?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Узнайте больше о вашем типе личности и как использовать его сильные стороны в работе.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href={`/dashboard/learning/mbti/${result.type.toLowerCase()}`}>
                Подробнее о {result.type}
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/dashboard/profile">
                Обновить профиль
              </Link>
            </Button>
          </div>
          {onRetake && (
            <Button variant="ghost" onClick={onRetake} className="w-full">
              Пройти тест заново
            </Button>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Помните: тип личности — это предпочтения, а не ограничения.
        <br />
        Каждый человек уникален и может развивать любые качества.
      </p>
    </div>
  );
}
