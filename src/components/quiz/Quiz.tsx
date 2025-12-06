'use client';

import { useState, useEffect, useCallback } from 'react';
import { QuizWithQuestions, calculateMBTIResult, MBTIResult } from '@/types/quiz';
import { QuizQuestion } from './QuizQuestion';
import { QuizProgress } from './QuizProgress';
import { QuizResult } from './QuizResult';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface QuizProps {
  quiz: QuizWithQuestions;
  onComplete?: (result: MBTIResult | { score: number; total: number; passed: boolean }) => void;
}

export function Quiz({ quiz, onComplete }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = intro screen
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [result, setResult] = useState<MBTIResult | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const questions = quiz.shuffle_questions
    ? [...quiz.questions].sort(() => Math.random() - 0.5)
    : quiz.questions;

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const canProceed = currentQuestion ? !!answers[currentQuestion.id] : true;

  // Timer
  useEffect(() => {
    if (currentIndex >= 0 && !isComplete) {
      const timer = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentIndex, isComplete]);

  const handleAnswer = useCallback((answer: string | string[]) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
  }, [currentQuestion]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleStart = () => {
    setCurrentIndex(0);
    setTimeSpent(0);
  };

  const handleFinish = () => {
    setIsComplete(true);

    if (quiz.quiz_type === 'mbti') {
      const mbtiResult = calculateMBTIResult(
        questions,
        answers as Record<string, string>
      );
      setResult(mbtiResult);
      onComplete?.(mbtiResult);
    } else {
      // Calculate score for knowledge quizzes
      let score = 0;
      let total = 0;
      questions.forEach((q) => {
        total += q.points;
        const userAnswer = answers[q.id];
        if (JSON.stringify(userAnswer) === JSON.stringify(q.correct_answer)) {
          score += q.points;
        }
      });
      const passed = (score / total) * 100 >= quiz.passing_score;
      onComplete?.({ score, total, passed });
    }
  };

  const handleRetake = () => {
    setCurrentIndex(-1);
    setAnswers({});
    setResult(null);
    setTimeSpent(0);
    setIsComplete(false);
  };

  // Intro screen
  if (currentIndex === -1) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          {quiz.description && (
            <CardDescription className="text-base mt-2">
              {quiz.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center text-sm">
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-semibold text-lg">{questions.length}</div>
              <div className="text-muted-foreground">вопросов</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-semibold text-lg">{quiz.duration_minutes}</div>
              <div className="text-muted-foreground">минут</div>
            </div>
          </div>

          {quiz.quiz_type === 'mbti' && (
            <div className="text-sm text-muted-foreground space-y-2 bg-muted/50 p-4 rounded-lg">
              <p className="font-medium text-foreground">Как проходить тест:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Выбирайте ответ, который ближе к вашему обычному поведению</li>
                <li>Отвечайте быстро, не задумываясь слишком долго</li>
                <li>Нет правильных или неправильных ответов</li>
                <li>Будьте честны с собой</li>
              </ul>
            </div>
          )}

          <Button onClick={handleStart} size="lg" className="w-full">
            Начать тест
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Result screen
  if (isComplete && result) {
    return <QuizResult result={result} onRetake={handleRetake} />;
  }

  // Question screen
  return (
    <div className="space-y-6">
      <QuizProgress
        current={currentIndex + 1}
        total={questions.length}
        answeredCount={answeredCount}
        timeSpent={timeSpent}
        timeLimit={quiz.duration_minutes}
      />

      <QuizQuestion
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        selectedAnswer={answers[currentQuestion.id]}
        onAnswer={handleAnswer}
      />

      <div className="flex justify-between max-w-2xl mx-auto">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        {currentIndex === questions.length - 1 ? (
          <Button
            onClick={handleFinish}
            disabled={answeredCount < questions.length}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Завершить
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!canProceed}>
            Далее
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {answeredCount < questions.length && currentIndex === questions.length - 1 && (
        <p className="text-center text-sm text-muted-foreground">
          Ответьте на все вопросы, чтобы завершить тест
          ({questions.length - answeredCount} осталось)
        </p>
      )}
    </div>
  );
}
