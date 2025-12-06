'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { DevelopmentPlan, DevelopmentGoal, PLAN_STATUS_LABELS } from '@/types/ipr';
import { PlanCard } from '@/components/ipr/PlanCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Target, Calendar, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PlanWithGoals extends DevelopmentPlan {
  goals: DevelopmentGoal[];
}

export default function DevelopmentPage() {
  const router = useRouter();
  const supabase = createClient();
  const [plans, setPlans] = useState<PlanWithGoals[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Fetch plans
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: plansData, error: plansError } = await (supabase
        .from('development_plans') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as { data: DevelopmentPlan[] | null; error: Error | null };

      if (plansError) throw plansError;

      // Fetch goals for each plan
      const plansWithGoals: PlanWithGoals[] = [];
      for (const plan of (plansData || [])) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: goalsData } = await (supabase
          .from('development_goals') as any)
          .select('*')
          .eq('plan_id', plan.id)
          .order('created_at') as { data: DevelopmentGoal[] | null };

        plansWithGoals.push({
          ...plan,
          goals: goalsData || [],
        });
      }

      setPlans(plansWithGoals);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePlan() {
    if (!newPlanTitle.trim()) return;

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase
        .from('development_plans') as any)
        .insert({
          user_id: user.id,
          title: newPlanTitle.trim(),
          description: newPlanDescription.trim() || null,
          period_start: periodStart || null,
          period_end: periodEnd || null,
          status: 'draft',
        })
        .select()
        .single() as { data: DevelopmentPlan | null; error: Error | null };

      if (error) throw error;

      setCreateDialogOpen(false);
      setNewPlanTitle('');
      setNewPlanDescription('');
      setPeriodStart('');
      setPeriodEnd('');

      // Redirect to the new plan
      if (data) router.push(`/dashboard/development/${data.id}`);
    } catch (error) {
      console.error('Error creating plan:', error);
    } finally {
      setCreating(false);
    }
  }

  const activePlans = plans.filter((p) => p.status === 'active');
  const draftPlans = plans.filter((p) => p.status === 'draft');
  const completedPlans = plans.filter((p) => p.status === 'completed' || p.status === 'archived');

  const totalGoals = plans.reduce((sum, p) => sum + p.goals.length, 0);
  const completedGoals = plans.reduce(
    (sum, p) => sum + p.goals.filter((g) => g.status === 'completed').length,
    0
  );

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Индивидуальный план развития</h1>
          <p className="text-muted-foreground">
            Управляйте вашими целями и отслеживайте прогресс
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Новый план
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать план развития</DialogTitle>
              <DialogDescription>
                Создайте новый план для отслеживания ваших целей
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название плана *</Label>
                <Input
                  id="title"
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  placeholder="Например: ИПР на 2025 год"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Input
                  id="description"
                  value={newPlanDescription}
                  onChange={(e) => setNewPlanDescription(e.target.value)}
                  placeholder="Краткое описание плана"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period_start">Начало периода</Label>
                  <Input
                    id="period_start"
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period_end">Конец периода</Label>
                  <Input
                    id="period_end"
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreatePlan} disabled={creating || !newPlanTitle.trim()}>
                {creating ? 'Создание...' : 'Создать'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные планы</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePlans.length}</div>
            <p className="text-xs text-muted-foreground">
              {draftPlans.length} черновиков
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего целей</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGoals}</div>
            <p className="text-xs text-muted-foreground">
              {completedGoals} выполнено
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Прогресс</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              общий прогресс
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plans */}
      {plans.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Нет планов развития</h3>
            <p className="text-muted-foreground mb-4">
              Создайте свой первый план для отслеживания целей
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Создать план
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">
              Активные ({activePlans.length})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Черновики ({draftPlans.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Завершённые ({completedPlans.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activePlans.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activePlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} goals={plan.goals} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Нет активных планов</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="draft" className="space-y-4">
            {draftPlans.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {draftPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} goals={plan.goals} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Нет черновиков</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedPlans.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} goals={plan.goals} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Нет завершённых планов</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
