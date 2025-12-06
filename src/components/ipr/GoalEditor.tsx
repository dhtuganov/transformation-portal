'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  DevelopmentGoal,
  GoalCategory,
  GoalPriority,
  GoalStatus,
  GOAL_CATEGORY_LABELS,
  GOAL_PRIORITY_LABELS,
  GOAL_STATUS_LABELS,
} from '@/types/ipr';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface GoalEditorProps {
  goal: DevelopmentGoal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalUpdated: (goal: DevelopmentGoal) => void;
  onGoalDeleted: (goalId: string) => void;
}

export function GoalEditor({
  goal,
  open,
  onOpenChange,
  onGoalUpdated,
  onGoalDeleted,
}: GoalEditorProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('skill');
  const [priority, setPriority] = useState<GoalPriority>('medium');
  const [status, setStatus] = useState<GoalStatus>('not_started');
  const [progress, setProgress] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [mbtiDimension, setMbtiDimension] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setCategory(goal.category);
      setPriority(goal.priority);
      setStatus(goal.status);
      setProgress(goal.progress_percent);
      setDueDate(goal.due_date || '');
      setMbtiDimension(goal.mbti_dimension || '');
      setNotes(goal.notes || '');
    }
  }, [goal]);

  const handleUpdate = async () => {
    if (!goal) return;
    if (!title.trim()) {
      toast.error('Название цели обязательно');
      return;
    }

    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase
        .from('development_goals') as any)
        .update({
          title: title.trim(),
          description: description.trim() || null,
          category,
          priority,
          status,
          progress_percent: progress,
          due_date: dueDate || null,
          mbti_dimension: mbtiDimension || null,
          notes: notes.trim() || null,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', goal.id)
        .select()
        .single() as { data: DevelopmentGoal | null; error: Error | null };

      if (error) throw error;
      if (data) {
        onGoalUpdated(data);
        toast.success('Цель обновлена');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Ошибка при обновлении цели');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!goal) return;

    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase
        .from('development_goals') as any)
        .delete()
        .eq('id', goal.id);

      if (error) throw error;

      onGoalDeleted(goal.id);
      toast.success('Цель удалена');
      onOpenChange(false);
      setDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Ошибка при удалении цели');
    } finally {
      setLoading(false);
    }
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать цель</DialogTitle>
          <DialogDescription>
            Обновите информацию о цели, прогресс или удалите цель
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Детали</TabsTrigger>
            <TabsTrigger value="progress">Прогресс</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Название цели *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название цели"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Описание</Label>
              <textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Подробное описание цели"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Категория</Label>
                <select
                  id="edit-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GoalCategory)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {Object.entries(GOAL_CATEGORY_LABELS).map(([key, { label, emoji }]) => (
                    <option key={key} value={key}>
                      {emoji} {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Приоритет</Label>
                <select
                  id="edit-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as GoalPriority)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {Object.entries(GOAL_PRIORITY_LABELS).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-due-date">Срок выполнения</Label>
                <Input
                  id="edit-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              {category === 'mbti_growth' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-mbti">MBTI измерение</Label>
                  <select
                    id="edit-mbti"
                    value={mbtiDimension}
                    onChange={(e) => setMbtiDimension(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Не выбрано</option>
                    <option value="EI">E/I (Экстра/Интроверсия)</option>
                    <option value="SN">S/N (Сенсорика/Интуиция)</option>
                    <option value="TF">T/F (Мышление/Чувство)</option>
                    <option value="JP">J/P (Суждение/Восприятие)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Заметки</Label>
              <textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Дополнительные заметки"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-y"
              />
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-status">Статус</Label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
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
              <div className="flex justify-between items-center">
                <Label htmlFor="edit-progress">Прогресс</Label>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Input
                id="edit-progress"
                type="range"
                min={0}
                max={100}
                step={5}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full"
              />
              <Progress value={progress} className="h-2" />
            </div>

            {status === 'completed' && progress < 100 && (
              <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-md">
                Рекомендуется установить прогресс 100% для завершённых целей
              </p>
            )}

            {status !== 'completed' && progress === 100 && (
              <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                Прогресс достиг 100%. Рекомендуется изменить статус на &quot;Выполнено&quot;
              </p>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1">
            {!deleteConfirm ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Подтвердить удаление
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirm(false)}
                >
                  Отмена
                </Button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Закрыть
            </Button>
            <Button onClick={handleUpdate} disabled={loading || !title.trim()}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
