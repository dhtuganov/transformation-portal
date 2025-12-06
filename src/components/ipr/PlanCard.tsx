'use client';

import {
  DevelopmentPlan,
  DevelopmentGoal,
  PLAN_STATUS_LABELS,
  calculatePlanProgress,
} from '@/types/ipr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, Target, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PlanCardProps {
  plan: DevelopmentPlan;
  goals?: DevelopmentGoal[];
}

export function PlanCard({ plan, goals = [] }: PlanCardProps) {
  const status = PLAN_STATUS_LABELS[plan.status];
  const progress = calculatePlanProgress(goals);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const completedGoals = goals.filter((g) => g.status === 'completed').length;
  const inProgressGoals = goals.filter((g) => g.status === 'in_progress').length;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{plan.title}</CardTitle>
          <Badge variant="secondary" className={cn(status.color)}>
            {status.label}
          </Badge>
        </div>
        {plan.description && (
          <CardDescription className="line-clamp-2">
            {plan.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {(plan.period_start || plan.period_end) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(plan.period_start)} — {formatDate(plan.period_end)}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Общий прогресс</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span>{goals.length} целей</span>
          </span>
          {completedGoals > 0 && (
            <span className="text-green-600">{completedGoals} выполнено</span>
          )}
          {inProgressGoals > 0 && (
            <span className="text-blue-600">{inProgressGoals} в работе</span>
          )}
        </div>

        <Button asChild variant="outline" className="w-full">
          <Link href={`/dashboard/development/${plan.id}`}>
            Открыть план
            <ChevronRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
