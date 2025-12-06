// Quiz Types for Otrar Transformation Portal

export type QuizType = 'knowledge' | 'mbti' | 'assessment' | 'feedback';
export type QuestionType = 'single_choice' | 'multiple_choice' | 'scale' | 'text' | 'mbti_pair';
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned';
export type MBTIDimension = 'EI' | 'SN' | 'TF' | 'JP';
export type MBTIType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export interface QuizOption {
  value: string;
  label: string;
}

export interface Quiz {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  quiz_type: QuizType;
  category: string | null;
  tags: string[];
  mbti_types: string[];
  roles: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  passing_score: number;
  max_attempts: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_correct_answers: boolean;
  published: boolean;
  author: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_order: number;
  question_type: QuestionType;
  question_text: string;
  question_hint: string | null;
  options: QuizOption[];
  correct_answer: string | string[] | null;
  points: number;
  explanation: string | null;
  mbti_dimension: MBTIDimension | null;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  status: AttemptStatus;
  started_at: string;
  completed_at: string | null;
  time_spent_seconds: number;
  score: number | null;
  total_points: number | null;
  passed: boolean | null;
  answers: Record<string, unknown>;
  result_data: MBTIResult | Record<string, unknown>;
}

export interface QuizAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  user_answer: string | string[];
  is_correct: boolean | null;
  points_earned: number;
  answered_at: string;
}

export interface MBTIResult {
  type: MBTIType;
  dimensions: {
    EI: { E: number; I: number; dominant: 'E' | 'I' };
    SN: { S: number; N: number; dominant: 'S' | 'N' };
    TF: { T: number; F: number; dominant: 'T' | 'F' };
    JP: { J: number; P: number; dominant: 'J' | 'P' };
  };
  confidence: number;
}

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

export interface QuizState {
  quiz: QuizWithQuestions | null;
  attempt: QuizAttempt | null;
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  isLoading: boolean;
  error: string | null;
}

// Helper function to calculate MBTI result
export function calculateMBTIResult(
  questions: QuizQuestion[],
  answers: Record<string, string>
): MBTIResult {
  const dimensions: {
    EI: { E: number; I: number; dominant: 'E' | 'I' };
    SN: { S: number; N: number; dominant: 'S' | 'N' };
    TF: { T: number; F: number; dominant: 'T' | 'F' };
    JP: { J: number; P: number; dominant: 'J' | 'P' };
  } = {
    EI: { E: 0, I: 0, dominant: 'E' },
    SN: { S: 0, N: 0, dominant: 'S' },
    TF: { T: 0, F: 0, dominant: 'T' },
    JP: { J: 0, P: 0, dominant: 'J' },
  };

  questions.forEach((question) => {
    const answer = answers[question.id];
    if (!answer || !question.mbti_dimension) return;

    const dimension = question.mbti_dimension;
    if (answer === 'E' || answer === 'I') {
      dimensions.EI[answer]++;
    } else if (answer === 'S' || answer === 'N') {
      dimensions.SN[answer]++;
    } else if (answer === 'T' || answer === 'F') {
      dimensions.TF[answer]++;
    } else if (answer === 'J' || answer === 'P') {
      dimensions.JP[answer]++;
    }
  });

  // Determine dominant for each dimension
  dimensions.EI.dominant = dimensions.EI.E >= dimensions.EI.I ? 'E' : 'I';
  dimensions.SN.dominant = dimensions.SN.S >= dimensions.SN.N ? 'S' : 'N';
  dimensions.TF.dominant = dimensions.TF.T >= dimensions.TF.F ? 'T' : 'F';
  dimensions.JP.dominant = dimensions.JP.J >= dimensions.JP.P ? 'J' : 'P';

  const type = `${dimensions.EI.dominant}${dimensions.SN.dominant}${dimensions.TF.dominant}${dimensions.JP.dominant}` as MBTIType;

  // Calculate confidence (how clear the preferences are)
  const totalQuestions = questions.filter(q => q.mbti_dimension).length;
  const clearPreferences = [
    Math.abs(dimensions.EI.E - dimensions.EI.I),
    Math.abs(dimensions.SN.S - dimensions.SN.N),
    Math.abs(dimensions.TF.T - dimensions.TF.F),
    Math.abs(dimensions.JP.J - dimensions.JP.P),
  ].reduce((a, b) => a + b, 0);

  const confidence = Math.round((clearPreferences / totalQuestions) * 100);

  return {
    type,
    dimensions,
    confidence: Math.min(confidence, 100),
  };
}

// MBTI Type descriptions (short)
export const MBTI_DESCRIPTIONS: Record<MBTIType, { name: string; emoji: string }> = {
  INTJ: { name: 'Стратег', emoji: '♟️' },
  INTP: { name: 'Учёный', emoji: '🔬' },
  ENTJ: { name: 'Командир', emoji: '👔' },
  ENTP: { name: 'Полемист', emoji: '💡' },
  INFJ: { name: 'Активист', emoji: '🌟' },
  INFP: { name: 'Посредник', emoji: '🌸' },
  ENFJ: { name: 'Тренер', emoji: '🎯' },
  ENFP: { name: 'Борец', emoji: '🦋' },
  ISTJ: { name: 'Администратор', emoji: '📋' },
  ISFJ: { name: 'Защитник', emoji: '🛡️' },
  ESTJ: { name: 'Менеджер', emoji: '📊' },
  ESFJ: { name: 'Консул', emoji: '🤝' },
  ISTP: { name: 'Виртуоз', emoji: '🔧' },
  ISFP: { name: 'Артист', emoji: '🎨' },
  ESTP: { name: 'Делец', emoji: '🎲' },
  ESFP: { name: 'Развлекатель', emoji: '🎭' },
};
