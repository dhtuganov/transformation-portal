'use client'

import type { Week } from '@/lib/shadow-work/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  Circle,
  Lock,
  PlayCircle,
  ChevronRight,
  Target,
  BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WeekCardProps {
  week: Week
  status: 'locked' | 'current' | 'in-progress' | 'completed'
  progress?: number
  onClick?: () => void
  className?: string
}

export function WeekCard({
  week,
  status,
  progress = 0,
  onClick,
  className
}: WeekCardProps) {
  const { theme, milestones, dailyExercises } = week

  const isInteractive = status !== 'locked'

  const statusConfig = {
    locked: {
      icon: Lock,
      iconColor: 'text-muted-foreground',
      badge: 'Заблокировано',
      badgeVariant: 'secondary' as const,
      cardBg: 'bg-muted/50'
    },
    current: {
      icon: PlayCircle,
      iconColor: 'text-primary',
      badge: 'Текущая неделя',
      badgeVariant: 'default' as const,
      cardBg: 'bg-primary/5 border-primary'
    },
    'in-progress': {
      icon: Circle,
      iconColor: 'text-blue-500',
      badge: 'В процессе',
      badgeVariant: 'outline' as const,
      cardBg: ''
    },
    completed: {
      icon: CheckCircle2,
      iconColor: 'text-green-500',
      badge: 'Завершено',
      badgeVariant: 'outline' as const,
      cardBg: 'bg-green-50 dark:bg-green-950/20'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Card
      className={cn(
        'transition-all',
        config.cardBg,
        isInteractive && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={isInteractive ? onClick : undefined}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg',
              status === 'current' ? 'bg-primary text-primary-foreground' :
              status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' :
              'bg-muted text-muted-foreground'
            )}>
              {theme.number}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {theme.title}
                <Icon className={cn('w-4 h-4', config.iconColor)} />
              </CardTitle>
              <CardDescription>{theme.subtitle}</CardDescription>
            </div>
          </div>
          <Badge variant={config.badgeVariant}>{config.badge}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {theme.description}
        </p>

        {/* Progress */}
        {status !== 'locked' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Прогресс</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Focus & Goal */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Target className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Фокус</p>
              <p className="text-sm">{theme.focus}</p>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
            Ключевые достижения
          </p>
          <ul className="space-y-1">
            {milestones.slice(0, 3).map((milestone, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className={cn(
                  'w-4 h-4 mt-0.5 flex-shrink-0',
                  status === 'completed' ? 'text-green-500' : 'text-muted-foreground'
                )} />
                <span className={status === 'locked' ? 'text-muted-foreground' : ''}>
                  {milestone}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exercises Count */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            <span>{dailyExercises.length} упражнений</span>
          </div>

          {isInteractive && (
            <Button variant="ghost" size="sm" className="gap-1">
              {status === 'current' ? 'Продолжить' :
               status === 'completed' ? 'Просмотреть' :
               'Начать'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
