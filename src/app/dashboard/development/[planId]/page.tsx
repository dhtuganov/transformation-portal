'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  DevelopmentPlan,
  DevelopmentGoal,
  DevelopmentGoalWithMilestones,
  GoalCategory,
  GoalPriority,
  GoalMilestone,
  PLAN_STATUS_LABELS,
  calculatePlanProgress,
} from '@/types/ipr';
import { GoalCard } from '@/components/ipr/GoalCard';
import { CreateGoalDialog } from '@/components/ipr/CreateGoalDialog';
import { GoalEditor } from '@/components/ipr/GoalEditor';
import { MilestoneManager } from '@/components/ipr/MilestoneManager';
import { ExportButton, type ExportFormat } from '@/components/export/ExportButton';
import { exportIPRToPDF } from '@/lib/export/pdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Play, CheckCircle, Archive } from 'lucide-react';
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
  const [goalsWithMilestones, setGoalsWithMilestones] = useState<DevelopmentGoalWithMilestones[]>([]);
  const [mbtiType, setMbtiType] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<DevelopmentGoal | null>(null);
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);

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

      // Fetch milestones for all goals
      if (goalsData && goalsData.length > 0) {
        const goalIds = goalsData.map(g => g.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: milestonesData } = await (supabase
          .from('goal_milestones') as any)
          .select('*')
          .in('goal_id', goalIds)
          .order('due_date') as { data: GoalMilestone[] | null };

        // Combine goals with milestones
        const goalsWithMilestonesData: DevelopmentGoalWithMilestones[] = goalsData.map(goal => ({
          ...goal,
          milestones: milestonesData?.filter(m => m.goal_id === goal.id) || [],
        }));

        setGoalsWithMilestones(goalsWithMilestonesData);
      } else {
        setGoalsWithMilestones([]);
      }

      // Fetch user's profile (MBTI type and name)
      const { data: profile } = await supabase
        .from('profiles')
        .select('mbti_type, full_name')
        .eq('id', user.id)
        .single() as { data: { mbti_type: string | null; full_name: string | null } | null };

      setMbtiType(profile?.mbti_type || null);
      setUserName(profile?.full_name || 'Пользователь');
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

  function handleGoalUpdated(updatedGoal: DevelopmentGoal) {
    setGoals(goals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)));
  }

  function handleGoalDeleted(goalId: string) {
    setGoals(goals.filter((g) => g.id !== goalId));
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
    setEditGoalOpen(true);
    setShowMilestones(false);
  }

  function openMilestones(goal: DevelopmentGoal) {
    setSelectedGoal(goal);
    setShowMilestones(true);
    setEditGoalOpen(false);
  }

  async function handleExport(format: ExportFormat) {
    if (!plan) return;

    if (format === 'pdf') {
      await exportIPRToPDF(plan, goalsWithMilestones, userName);
    }
    // Excel format not implemented for IPR
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
              <ExportButton
                onExport={handleExport}
                formats={['pdf']}
                size="sm"
                variant="outline"
              />
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
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <GoalCard goal={goal} onClick={() => openGoalEdit(goal)} />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => openMilestones(goal)}
                >
                  Управление этапами
                </Button>
              </div>
            ))}
          </div>

          {/* Milestone Manager */}
          {showMilestones && selectedGoal && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Этапы для: {selectedGoal.title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMilestones(false)}
                >
                  Закрыть
                </Button>
              </div>
              <MilestoneManager goalId={selectedGoal.id} />
            </div>
          )}
        </div>
      )}

      {/* Goal Editor Dialog */}
      <GoalEditor
        goal={selectedGoal}
        open={editGoalOpen}
        onOpenChange={setEditGoalOpen}
        onGoalUpdated={handleGoalUpdated}
        onGoalDeleted={handleGoalDeleted}
      />
    </div>
  );
}
