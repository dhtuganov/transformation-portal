'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  DevelopmentPlan,
  DevelopmentGoal,
  GoalCategory,
  GoalPriority,
  GoalStatus,
  PLAN_STATUS_LABELS,
  GOAL_STATUS_LABELS,
  calculatePlanProgress,
} from '@/types/ipr';
import { GoalCard } from '@/components/ipr/GoalCard';
import { CreateGoalDialog } from '@/components/ipr/CreateGoalDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar, Edit, Play, CheckCircle, Archive } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PlanPageProps {
  params: Promise<{ planId: string }>;
}

export default function PlanPage({ params }: PlanPageProps) {
  const { planId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [plan, setPlan] = useState<DevelopmentPlan | null>(null);
  const [goals, setGoals] = useState<DevelopmentGoal[]>([]);
  const [mbtiType, setMbtiType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<DevelopmentGoal | null>(null);
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [goalProgress, setGoalProgress] = useState(0);
  const [goalStatus, setGoalStatus] = useState<GoalStatus>('not_started');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  async function fetchPlan() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Fetch plan
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: planData, error: planError } = await (supabase
        .from('development_plans') as any)
        .select('*')
        .eq('id', planId)
        .single() as { data: DevelopmentPlan | null; error: Error | null };

      if (planError) throw planError;
      setPlan(planData);

      // Fetch goals
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: goalsData } = await (supabase
        .from('development_goals') as any)
        .select('*')
        .eq('plan_id', planId)
        .order('created_at') as { data: DevelopmentGoal[] | null };

      setGoals(goalsData || []);

      // Fetch user's MBTI type
      const { data: profile } = await supabase
        .from('profiles')
        .select('mbti_type')
        .eq('id', user.id)
        .single() as { data: { mbti_type: string | null } | null };

      setMbtiType(profile?.mbti_type || null);
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGoal(goalData: {
    plan_id: string;
    title: string;
    description: string;
    category: GoalCategory;
    priority: GoalPriority;
    due_date: string | null;
    mbti_dimension: string | null;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase
      .from('development_goals') as any)
      .insert(goalData)
      .select()
      .single() as { data: DevelopmentGoal | null; error: Error | null };

    if (error) throw error;
    if (data) setGoals([...goals, data]);
  }

  async function handleUpdateGoal() {
    if (!selectedGoal) return;
    setSaving(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase
        .from('development_goals') as any)
        .update({
          progress_percent: goalProgress,
          status: goalStatus,
          completed_at: goalStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', selectedGoal.id);

      if (error) throw error;

      setGoals(goals.map((g) =>
        g.id === selectedGoal.id
          ? { ...g, progress_percent: goalProgress, status: goalStatus }
          : g
      ));
      setEditGoalOpen(false);
    } catch (error) {
      console.error('Error updating goal:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePlanStatus(newStatus: 'active' | 'completed' | 'archived') {
    if (!plan) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase
        .from('development_plans') as any)
        .update({ status: newStatus })
        .eq('id', plan.id);

      if (error) throw error;
      setPlan({ ...plan, status: newStatus });
    } catch (error) {
      console.error('Error updating plan status:', error);
    }
  }

  function openGoalEdit(goal: DevelopmentGoal) {
    setSelectedGoal(goal);
    setGoalProgress(goal.progress_percent);
    setGoalStatus(goal.status);
    setEditGoalOpen(true);
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-64 w-full mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p className="text-lg text-muted-foreground mb-4">План не найден</p>
        <Button asChild>
          <Link href="/dashboard/development">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к планам
          </Link>
        </Button>
      </div>
    );
  }

  const progress = calculatePlanProgress(goals);
  const status = PLAN_STATUS_LABELS[plan.status];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/development">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Все планы
          </Link>
        </Button>
      </div>

      {/* Plan Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">{plan.title}</CardTitle>
                <Badge variant="secondary" className={cn(status.color)}>
                  {status.label}
                </Badge>
              </div>
              {plan.description && (
                <p className="text-muted-foreground">{plan.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              {plan.status === 'draft' && (
                <Button size="sm" onClick={() => handleUpdatePlanStatus('active')}>
                  <Play className="w-4 h-4 mr-2" />
                  Активировать
                </Button>
              )}
              {plan.status === 'active' && (
                <Button size="sm" variant="outline" onClick={() => handleUpdatePlanStatus('completed')}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Завершить
                </Button>
              )}
              {(plan.status === 'completed') && (
                <Button size="sm" variant="ghost" onClick={() => handleUpdatePlanStatus('archived')}>
                  <Archive className="w-4 h-4 mr-2" />
                  В архив
                </Button>
              )}
            </div>
          </div>
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
            <Progress value={progress} className="h-3" />
          </div>

          <div className="flex gap-4 text-sm">
            <span>{goals.length} целей</span>
            <span className="text-green-600">
              {goals.filter((g) => g.status === 'completed').length} выполнено
            </span>
            <span className="text-blue-600">
              {goals.filter((g) => g.status === 'in_progress').length} в работе
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Цели развития</h2>
        <CreateGoalDialog
          planId={plan.id}
          onCreateGoal={handleCreateGoal}
          mbtiType={mbtiType}
        />
      </div>

      {goals.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              В этом плане пока нет целей
            </p>
            <CreateGoalDialog
              planId={plan.id}
              onCreateGoal={handleCreateGoal}
              mbtiType={mbtiType}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={() => openGoalEdit(goal)}
            />
          ))}
        </div>
      )}

      {/* Edit Goal Dialog */}
      <Dialog open={editGoalOpen} onOpenChange={setEditGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Обновить прогресс</DialogTitle>
            <DialogDescription>
              {selectedGoal?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Статус</Label>
              <select
                value={goalStatus}
                onChange={(e) => setGoalStatus(e.target.value as GoalStatus)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {Object.entries(GOAL_STATUS_LABELS).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Прогресс</Label>
                <span className="text-sm text-muted-foreground">{goalProgress}%</span>
              </div>
              <Input
                type="range"
                min={0}
                max={100}
                step={5}
                value={goalProgress}
                onChange={(e) => setGoalProgress(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {goalStatus === 'completed' && goalProgress < 100 && (
              <p className="text-sm text-orange-600">
                Рекомендуется установить прогресс 100% для завершённых целей
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditGoalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateGoal} disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
