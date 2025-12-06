'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface QuizProgressProps {
  current: number;
  total: number;
  answeredCount: number;
  timeSpent?: number;
  timeLimit?: number;
}

export function QuizProgress({
  current,
  total,
  answeredCount,
  timeSpent,
  timeLimit,
}: QuizProgressProps) {
  const progressPercent = (current / total) * 100;
  const answeredPercent = (answeredCount / total) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Прогресс: {answeredCount} из {total} отвечено
        </span>
        {timeSpent !== undefined && (
          <span
            className={cn(
              'font-mono',
              timeLimit && timeSpent > timeLimit * 60 * 0.8
                ? 'text-orange-500'
                : 'text-muted-foreground'
            )}
          >
            {formatTime(timeSpent)}
            {timeLimit && ` / ${formatTime(timeLimit * 60)}`}
          </span>
        )}
      </div>
      <Progress value={answeredPercent} className="h-2" />
      <div className="flex justify-between">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              i === current - 1
                ? 'bg-primary ring-2 ring-primary ring-offset-2'
                : i < current
                ? 'bg-primary/60'
                : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
}
