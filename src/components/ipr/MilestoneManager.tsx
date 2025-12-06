'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GoalMilestone, MilestoneStatus } from '@/types/ipr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Plus, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MilestoneManagerProps {
  goalId: string;
}

export function MilestoneManager({ goalId }: MilestoneManagerProps) {
  const supabase = createClient();
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMilestones();
  }, [goalId]);

  async function fetchMilestones() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase
        .from('goal_milestones') as any)
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at') as { data: GoalMilestone[] | null; error: Error | null };

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      toast.error('Ошибка при загрузке этапов');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Название этапа обязательно');
      return;
    }

    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase
        .from('goal_milestones') as any)
        .insert({
          goal_id: goalId,
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          due_date: newDueDate || null,
          status: 'pending',
        })
        .select()
        .single() as { data: GoalMilestone | null; error: Error | null };

      if (error) throw error;
      if (data) {
        setMilestones([...milestones, data]);
        setNewTitle('');
        setNewDescription('');
        setNewDueDate('');
        setShowAddForm(false);
        toast.success('Этап добавлен');
      }
    } catch (error) {
      console.error('Error adding milestone:', error);
      toast.error('Ошибка при добавлении этапа');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(milestone: GoalMilestone) {
    const newStatus: MilestoneStatus = milestone.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase
        .from('goal_milestones') as any)
        .update({
          status: newStatus,
          completed_at: completedAt,
        })
        .eq('id', milestone.id);

      if (error) throw error;

      setMilestones(
        milestones.map((m) =>
          m.id === milestone.id
            ? { ...m, status: newStatus, completed_at: completedAt }
            : m
        )
      );
      toast.success(newStatus === 'completed' ? 'Этап завершён' : 'Этап возобновлён');
    } catch (error) {
      console.error('Error toggling milestone status:', error);
      toast.error('Ошибка при обновлении статуса');
    }
  }

  async function handleDeleteMilestone(milestoneId: string) {
    if (!confirm('Удалить этот этап?')) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase
        .from('goal_milestones') as any)
        .delete()
        .eq('id', milestoneId);

      if (error) throw error;

      setMilestones(milestones.filter((m) => m.id !== milestoneId));
      toast.success('Этап удалён');
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast.error('Ошибка при удалении этапа');
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const totalCount = milestones.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Этапы выполнения</CardTitle>
            {totalCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {completedCount} из {totalCount} выполнено
              </p>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        ) : (
          <>
            {showAddForm && (
              <form onSubmit={handleAddMilestone} className="space-y-3 p-3 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="milestone-title" className="text-sm">
                    Название этапа *
                  </Label>
                  <Input
                    id="milestone-title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Например: Пройти курс по теме"
                    required
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="milestone-description" className="text-sm">
                    Описание
                  </Label>
                  <Input
                    id="milestone-description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Детали этапа"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="milestone-due-date" className="text-sm">
                    Срок
                  </Label>
                  <Input
                    id="milestone-due-date"
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewTitle('');
                      setNewDescription('');
                      setNewDueDate('');
                    }}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" size="sm" disabled={saving || !newTitle.trim()}>
                    {saving ? 'Добавление...' : 'Добавить'}
                  </Button>
                </div>
              </form>
            )}

            {milestones.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Этапы не добавлены
              </p>
            ) : (
              <div className="space-y-2">
                {milestones.map((milestone) => {
                  const isCompleted = milestone.status === 'completed';
                  const isOverdue =
                    milestone.due_date &&
                    new Date(milestone.due_date) < new Date() &&
                    !isCompleted;

                  return (
                    <div
                      key={milestone.id}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                        isCompleted ? 'bg-green-50/50 border-green-200' : 'bg-background',
                        isOverdue && 'bg-red-50/50 border-red-200'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(milestone)}
                        className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            isCompleted && 'line-through text-muted-foreground'
                          )}
                        >
                          {milestone.title}
                        </p>
                        {milestone.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {milestone.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {milestone.due_date && (
                            <div
                              className={cn(
                                'flex items-center gap-1 text-xs',
                                isOverdue
                                  ? 'text-red-600 font-medium'
                                  : 'text-muted-foreground'
                              )}
                            >
                              <Calendar className="w-3 h-3" />
                              {formatDate(milestone.due_date)}
                            </div>
                          )}
                          {isCompleted && milestone.completed_at && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              Завершено {formatDate(milestone.completed_at)}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMilestone(milestone.id)}
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
