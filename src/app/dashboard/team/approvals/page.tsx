'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PlanStatusBadge } from '@/components/ipr/PlanStatusBadge';
import { ApprovalDialog } from '@/components/ipr/ApprovalDialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Target,
  User,
} from 'lucide-react';
import type { DevelopmentPlan, PlanStatus } from '@/types/ipr';
import { redirect } from 'next/navigation';

interface PlanWithEmployee extends DevelopmentPlan {
  employee: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    job_title: string | null;
  } | null;
  goals_count: number;
}

interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export default function ApprovalsPage() {
  const { profile } = useAuth();
  const [plans, setPlans] = useState<PlanWithEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ApprovalStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [selectedPlan, setSelectedPlan] = useState<PlanWithEmployee | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (profile && !['manager', 'executive', 'admin'].includes(profile.role || '')) {
      redirect('/dashboard');
    }
    if (profile) {
      fetchPlans();
    }
  }, [profile]);

  async function fetchPlans() {
    try {
      if (!profile) return;

      // Get team member IDs based on role
      let teamMemberIds: string[] = [];

      if (profile.role === 'admin' || profile.role === 'executive') {
        // Admins/executives see all users
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: allProfiles } = await (supabase
          .from('profiles') as any)
          .select('id');

        teamMemberIds = allProfiles?.map((p: { id: string }) => p.id) || [];
      } else {
        // Managers see their team members
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: teams } = await (supabase
          .from('teams') as any)
          .select('id')
          .eq('manager_id', profile.id);

        if (teams && teams.length > 0) {
          const teamIds = teams.map((t: { id: string }) => t.id);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: members } = await (supabase
            .from('team_members') as any)
            .select('user_id')
            .in('team_id', teamIds);

          teamMemberIds = members?.map((m: { user_id: string }) => m.user_id) || [];
        }
      }

      if (teamMemberIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch development plans for team members
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: plansData, error: plansError } = await (supabase
        .from('development_plans') as any)
        .select(`
          *,
          employee:profiles!development_plans_user_id_fkey(
            id,
            full_name,
            email,
            avatar_url,
            job_title
          )
        `)
        .in('user_id', teamMemberIds)
        .order('created_at', { ascending: false });

      if (plansError) throw plansError;

      // Fetch goals count for each plan
      const plansWithGoals: PlanWithEmployee[] = [];

      for (const plan of plansData || []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: goals } = await (supabase
          .from('development_goals') as any)
          .select('id')
          .eq('plan_id', plan.id);

        plansWithGoals.push({
          ...plan,
          goals_count: goals?.length || 0,
        });
      }

      setPlans(plansWithGoals);

      // Calculate stats
      // Plans pending approval: status='draft' or status='active' but no approved_by
      const pending = plansWithGoals.filter(
        (p) => p.status === 'draft' || (p.status === 'active' && !p.approved_by)
      ).length;

      const approved = plansWithGoals.filter(
        (p) => p.approved_by && p.status === 'active'
      ).length;

      // Rejected plans are those that were updated by manager but status is still 'draft'
      // (In current schema, we don't have explicit 'rejected' status, so this is approximate)
      const rejected = plansWithGoals.filter(
        (p) => p.approved_by && p.status === 'draft'
      ).length;

      setStats({
        pending,
        approved,
        rejected,
        total: plansWithGoals.length,
      });
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDialog = (plan: PlanWithEmployee) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchPlans();
  };

  // Filter plans by approval status
  const pendingPlans = plans.filter(
    (p) => p.status === 'draft' || (p.status === 'active' && !p.approved_by)
  );

  const approvedPlans = plans.filter((p) => p.approved_by && p.status === 'active');

  const rejectedPlans = plans.filter((p) => p.approved_by && p.status === 'draft');

  if (!profile || !['manager', 'executive', 'admin'].includes(profile.role || '')) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Доступ ограничен</CardTitle>
            <CardDescription>
              Эта страница доступна только для руководителей и администраторов.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Утверждение ИПР</h1>
        <p className="text-muted-foreground mt-1">
          Рассмотрите и утвердите планы развития сотрудников
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего планов</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">от команды</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ожидают</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">требуют рассмотрения</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Утверждено</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">активных планов</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Отклонено</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">на доработке</p>
          </CardContent>
        </Card>
      </div>

      {/* Plans Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            <Clock className="w-4 h-4 mr-2" />
            Ожидают ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="approved">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Утверждённые ({stats.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            <XCircle className="w-4 h-4 mr-2" />
            Отклонённые ({stats.rejected})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingPlans.length > 0 ? (
            <div className="space-y-4">
              {pendingPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <Avatar>
                          <AvatarImage src={plan.employee?.avatar_url || undefined} />
                          <AvatarFallback>
                            {plan.employee?.full_name
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2) || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{plan.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <User className="w-3 h-3" />
                                <span>{plan.employee?.full_name || 'Без имени'}</span>
                                {plan.employee?.job_title && (
                                  <>
                                    <span>•</span>
                                    <span>{plan.employee.job_title}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <PlanStatusBadge status={plan.status as PlanStatus} />
                          </div>

                          {plan.description && (
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              <span>{plan.goals_count} целей</span>
                            </div>
                            {plan.period_start && plan.period_end && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(plan.period_start).toLocaleDateString('ru-RU')} —{' '}
                                  {new Date(plan.period_end).toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                Создан {new Date(plan.created_at).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button onClick={() => handleOpenDialog(plan)} className="ml-4">
                        Рассмотреть
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Нет планов, ожидающих утверждения</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedPlans.length > 0 ? (
            <div className="space-y-4">
              {approvedPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <Avatar>
                          <AvatarImage src={plan.employee?.avatar_url || undefined} />
                          <AvatarFallback>
                            {plan.employee?.full_name
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2) || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{plan.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <User className="w-3 h-3" />
                                <span>{plan.employee?.full_name || 'Без имени'}</span>
                                {plan.employee?.job_title && (
                                  <>
                                    <span>•</span>
                                    <span>{plan.employee.job_title}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Утверждено
                              </Badge>
                              <PlanStatusBadge status={plan.status as PlanStatus} />
                            </div>
                          </div>

                          {plan.description && (
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              <span>{plan.goals_count} целей</span>
                            </div>
                            {plan.approved_at && (
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>
                                  Утверждено{' '}
                                  {new Date(plan.approved_at).toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Нет утверждённых планов</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedPlans.length > 0 ? (
            <div className="space-y-4">
              {rejectedPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <Avatar>
                          <AvatarImage src={plan.employee?.avatar_url || undefined} />
                          <AvatarFallback>
                            {plan.employee?.full_name
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2) || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{plan.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <User className="w-3 h-3" />
                                <span>{plan.employee?.full_name || 'Без имени'}</span>
                                {plan.employee?.job_title && (
                                  <>
                                    <span>•</span>
                                    <span>{plan.employee.job_title}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="bg-red-50 text-red-700">
                                <XCircle className="w-3 h-3 mr-1" />
                                Отклонено
                              </Badge>
                              <PlanStatusBadge status={plan.status as PlanStatus} />
                            </div>
                          </div>

                          {plan.description && (
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              <span>{plan.goals_count} целей</span>
                            </div>
                            {plan.approved_at && (
                              <div className="flex items-center gap-1">
                                <XCircle className="w-4 h-4" />
                                <span>
                                  Отклонено {new Date(plan.approved_at).toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Нет отклонённых планов</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      {selectedPlan && (
        <ApprovalDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          planId={selectedPlan.id}
          planTitle={selectedPlan.title}
          employeeName={selectedPlan.employee?.full_name || 'Без имени'}
          onSuccess={handleDialogSuccess}
        />
      )}
    </div>
  );
}
