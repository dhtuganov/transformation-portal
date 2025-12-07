'use client'

import { useState } from 'react'
import type { Exercise, ExerciseRecommendation } from '@/lib/shadow-work/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Clock,
  Target,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  TrendingUp,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExerciseCardProps {
  exercise: Exercise
  recommendation?: ExerciseRecommendation
  completed?: boolean
  onComplete?: (exerciseId: string) => void
  className?: string
}

const difficultyConfig = {
  beginner: {
    label: 'Начальный',
    color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  },
  intermediate: {
    label: 'Средний',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
  },
  advanced: {
    label: 'Продвинутый',
    color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  }
}

const typeIcons: Record<string, any> = {
  awareness: Target,
  reflection: Lightbulb,
  practice: TrendingUp,
  integration: CheckCircle2,
  journaling: Target,
  meditation: Target,
  behavioral: TrendingUp
}

export function ExerciseCard({
  exercise,
  recommendation,
  completed = false,
  onComplete,
  className
}: ExerciseCardProps) {
  const [open, setOpen] = useState(false)

  const TypeIcon = typeIcons[exercise.type] || Target
  const difficultyStyle = difficultyConfig[exercise.difficulty]

  const handleComplete = () => {
    onComplete?.(exercise.id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className={cn(
          'transition-all cursor-pointer hover:shadow-md',
          completed && 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900',
          className
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TypeIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className={completed ? 'line-through text-muted-foreground' : ''}>
                  {exercise.title}
                </span>
              </CardTitle>
              {completed && (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
            </div>
            <CardDescription className="line-clamp-2">
              {exercise.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Meta Info */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {exercise.duration} мин
              </Badge>
              <Badge className={difficultyStyle.color}>
                {difficultyStyle.label}
              </Badge>
              {exercise.tags && exercise.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Recommendation */}
            {recommendation && (
              <div className="flex items-start gap-2 p-2 bg-primary/5 rounded-md">
                <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-primary">
                    Релевантность: {recommendation.relevanceScore}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {recommendation.reason}
                  </p>
                </div>
              </div>
            )}

            {/* Action */}
            <Button
              variant={completed ? "outline" : "default"}
              className="w-full gap-2"
              size="sm"
            >
              {completed ? 'Просмотреть' : 'Начать упражнение'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <TypeIcon className="w-6 h-6 text-primary" />
            {exercise.title}
          </DialogTitle>
          <DialogDescription>{exercise.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {exercise.duration} минут
            </Badge>
            <Badge className={difficultyStyle.color}>
              {difficultyStyle.label}
            </Badge>
            <Badge variant="secondary">
              {exercise.targetFunction}
            </Badge>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Инструкции
            </h3>
            <ol className="space-y-2 list-decimal list-inside">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="text-sm">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          {/* Benefits */}
          {exercise.benefits && exercise.benefits.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Польза
              </h3>
              <ul className="space-y-1">
                {exercise.benefits.map((benefit, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reflection Prompts */}
          {exercise.reflectionPrompts && exercise.reflectionPrompts.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Вопросы для рефлексии
              </h3>
              <ul className="space-y-2">
                {exercise.reflectionPrompts.map((prompt, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {prompt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {exercise.tags && exercise.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {exercise.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {!completed && onComplete && (
              <Button onClick={handleComplete} className="flex-1">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Отметить выполненным
              </Button>
            )}
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
