'use client';

import { useState } from 'react';
import { GoalCategory, GoalPriority, GOAL_CATEGORY_LABELS, GOAL_PRIORITY_LABELS } from '@/types/ipr';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface CreateGoalDialogProps {
  planId: string;
  onCreateGoal: (goal: {
    plan_id: string;
    title: string;
    description: string;
    category: GoalCategory;
    priority: GoalPriority;
    due_date: string | null;
    mbti_dimension: string | null;
  }) => Promise<void>;
  mbtiType?: string | null;
}

export function CreateGoalDialog({ planId, onCreateGoal, mbtiType }: CreateGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('skill');
  const [priority, setPriority] = useState<GoalPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [mbtiDimension, setMbtiDimension] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onCreateGoal({
        plan_id: planId,
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        due_date: dueDate || null,
        mbti_dimension: mbtiDimension || null,
      });
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('skill');
    setPriority('medium');
    setDueDate('');
    setMbtiDimension('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Добавить цель
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Новая цель развития</DialogTitle>
            <DialogDescription>
              Добавьте цель в ваш индивидуальный план развития
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название цели *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Улучшить навыки презентации"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Подробное описание цели"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <select
                  id="category"
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
                <Label htmlFor="priority">Приоритет</Label>
                <select
                  id="priority"
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
                <Label htmlFor="due_date">Срок выполнения</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              {category === 'mbti_growth' && (
                <div className="space-y-2">
                  <Label htmlFor="mbti_dimension">MBTI измерение</Label>
                  <select
                    id="mbti_dimension"
                    value={mbtiDimension}
                    onChange={(e) => setMbtiDimension(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Выберите...</option>
                    <option value="EI">E/I (Экстра/Интроверсия)</option>
                    <option value="SN">S/N (Сенсорика/Интуиция)</option>
                    <option value="TF">T/F (Мышление/Чувство)</option>
                    <option value="JP">J/P (Суждение/Восприятие)</option>
                  </select>
                </div>
              )}
            </div>

            {mbtiType && category === 'mbti_growth' && (
              <p className="text-sm text-muted-foreground">
                Ваш тип MBTI: <strong>{mbtiType}</strong>.
                Выберите измерение для развития баланса.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? 'Создание...' : 'Создать цель'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
