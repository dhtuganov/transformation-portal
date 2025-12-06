import { Badge } from '@/components/ui/badge';
import { PlanStatus } from '@/types/ipr';
import { cn } from '@/lib/utils';

interface PlanStatusBadgeProps {
  status: PlanStatus;
  className?: string;
}

const STATUS_CONFIG: Record<PlanStatus, { label: string; className: string }> = {
  draft: {
    label: 'Черновик',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  active: {
    label: 'Активный',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  completed: {
    label: 'Завершён',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  archived: {
    label: 'Архив',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
};

export function PlanStatusBadge({ status, className }: PlanStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
