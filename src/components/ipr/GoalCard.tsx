'use client';

import {
  DevelopmentGoal,
  GOAL_CATEGORY_LABELS,
  GOAL_PRIORITY_LABELS,
  GOAL_STATUS_LABELS,
  getProgressColor,
} from '@/types/ipr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalCardProps {
  goal: DevelopmentGoal;
  onClick?: () => void;
}

export function GoalCard({ goal, onClick }: GoalCardProps) {
  const category = GOAL_CATEGORY_LABELS[goal.category];
  const priority = GOAL_PRIORITY_LABELS[goal.priority];
  const status = GOAL_STATUS_LABELS[goal.status];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };

  const isOverdue = goal.due_date && new Date(goal.due_date) < new Date() && goal.status !== 'completed';

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isOverdue && 'border-red-300 bg-red-50/30'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-2xl">{category.emoji}</span>
          <div className="flex gap-1">
            <Badge variant="secondary" className={cn('text-xs', priority.color)}>
              <Flag className="w-3 h-3 mr-1" />
              {priority.label}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-base mt-2 line-clamp-2">{goal.title}</CardTitle>
        {goal.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {goal.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <Badge variant="outline" className={cn(status.color)}>
            {status.label}
          </Badge>
          {goal.due_date && (
            <span
              className={cn(
                'flex items-center gap-1 text-muted-foreground',
                isOverdue && 'text-red-600 font-medium'
              )}
            >
              <Calendar className="w-3 h-3" />
              {formatDate(goal.due_date)}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Прогресс</span>
            <span>{goal.progress_percent}%</span>
          </div>
          <Progress value={goal.progress_percent} className="h-2" />
        </div>

        {goal.mbti_dimension && (
          <div className="text-xs text-muted-foreground">
            MBTI: {goal.mbti_dimension}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
