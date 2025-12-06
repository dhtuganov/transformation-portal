'use client';

import { QuizQuestion as QuizQuestionType, QuizOption } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | string[] | undefined;
  onAnswer: (answer: string | string[]) => void;
  showHint?: boolean;
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  showHint = false,
}: QuizQuestionProps) {
  const handleOptionClick = (value: string) => {
    if (question.question_type === 'multiple_choice') {
      const currentAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : [];
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter((a) => a !== value)
        : [...currentAnswers, value];
      onAnswer(newAnswers);
    } else {
      onAnswer(value);
    }
  };

  const isSelected = (value: string) => {
    if (Array.isArray(selectedAnswer)) {
      return selectedAnswer.includes(value);
    }
    return selectedAnswer === value;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Вопрос {questionNumber} из {totalQuestions}
          </span>
          {question.points > 1 && (
            <span className="text-sm text-muted-foreground">
              {question.points} баллов
            </span>
          )}
        </div>
        <CardTitle className="text-xl leading-relaxed">
          {question.question_text}
        </CardTitle>
        {showHint && question.question_hint && (
          <p className="text-sm text-muted-foreground mt-2 italic">
            {question.question_hint}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {question.options.map((option: QuizOption, index: number) => (
          <Button
            key={option.value}
            variant="outline"
            className={cn(
              'w-full h-auto py-4 px-6 text-left justify-start whitespace-normal',
              'transition-all duration-200',
              isSelected(option.value) && 'border-primary bg-primary/10 ring-2 ring-primary',
              !isSelected(option.value) && 'hover:bg-muted/50'
            )}
            onClick={() => handleOptionClick(option.value)}
          >
            <span className="flex items-start gap-3">
              <span
                className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium',
                  isSelected(option.value)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30'
                )}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1">{option.label}</span>
            </span>
          </Button>
        ))}

        {question.question_type === 'multiple_choice' && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            Можно выбрать несколько вариантов
          </p>
        )}
      </CardContent>
    </Card>
  );
}
