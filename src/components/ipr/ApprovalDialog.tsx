'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  planTitle: string;
  employeeName: string;
  onSuccess: () => void;
}

export function ApprovalDialog({
  open,
  onOpenChange,
  planId,
  planTitle,
  employeeName,
  onSuccess,
}: ApprovalDialogProps) {
  const [comment, setComment] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async () => {
    if (!action) return;

    // Validate: rejection requires comment
    if (action === 'reject' && !comment.trim()) {
      toast.error('Необходимо указать причину отклонения');
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Пользователь не авторизован');
        return;
      }

      // Update the development plan
      const updateData: {
        approved_by: string;
        approved_at: string;
        status?: string;
      } = {
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      };

      // If approved, change status to 'active'
      if (action === 'approve') {
        updateData.status = 'active';
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase
        .from('development_plans') as any)
        .update(updateData)
        .eq('id', planId);

      if (updateError) throw updateError;

      // Add a comment if provided
      if (comment.trim()) {
        // Get the first goal to attach comment (or we could create a plan-level comment system)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: goals } = await (supabase
          .from('development_goals') as any)
          .select('id')
          .eq('plan_id', planId)
          .limit(1);

        if (goals && goals.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase
            .from('goal_comments') as any)
            .insert({
              goal_id: goals[0].id,
              author_id: user.id,
              content: comment.trim(),
              comment_type: action === 'approve' ? 'approval' : 'request_changes',
            });
        }
      }

      toast.success(
        action === 'approve'
          ? `План "${planTitle}" утверждён`
          : `План "${planTitle}" отклонён`
      );

      // Reset and close
      setComment('');
      setAction(null);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Ошибка при обновлении плана');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = (newAction: 'approve' | 'reject') => {
    setAction(newAction);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Рассмотрение ИПР</DialogTitle>
          <DialogDescription>
            План развития: <strong>{planTitle}</strong>
            <br />
            Сотрудник: <strong>{employeeName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!action && (
            <div className="flex gap-3">
              <Button
                variant="default"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleAction('approve')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Утвердить
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleAction('reject')}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Отклонить
              </Button>
            </div>
          )}

          {action && (
            <>
              <div className="rounded-lg border p-3 bg-muted/50">
                <p className="text-sm font-medium">
                  {action === 'approve' ? (
                    <span className="text-green-600">✓ Утверждение плана</span>
                  ) : (
                    <span className="text-red-600">✗ Отклонение плана</span>
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">
                  Комментарий {action === 'reject' && <span className="text-red-500">*</span>}
                </Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    action === 'approve'
                      ? 'Опционально: добавьте комментарий...'
                      : 'Укажите причину отклонения...'
                  }
                  rows={4}
                  className={action === 'reject' && !comment.trim() ? 'border-red-300' : ''}
                />
                {action === 'reject' && !comment.trim() && (
                  <p className="text-xs text-red-500">Комментарий обязателен при отклонении</p>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setComment('');
              setAction(null);
              onOpenChange(false);
            }}
            disabled={submitting}
          >
            Отмена
          </Button>
          {action && (
            <Button
              onClick={handleSubmit}
              disabled={submitting || (action === 'reject' && !comment.trim())}
            >
              {submitting ? 'Обработка...' : action === 'approve' ? 'Утвердить' : 'Отклонить'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
