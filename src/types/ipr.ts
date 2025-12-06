// IPR (Individual Development Plan) Types for Otrar Transformation Portal

export type PlanStatus = 'draft' | 'active' | 'completed' | 'archived';
export type GoalCategory = 'skill' | 'knowledge' | 'behavior' | 'mbti_growth';
export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';
export type MilestoneStatus = 'pending' | 'completed';
export type CommentType = 'comment' | 'feedback' | 'approval' | 'request_changes';

export interface DevelopmentPlan {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: PlanStatus;
  period_start: string | null;
  period_end: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DevelopmentGoal {
  id: string;
  plan_id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  progress_percent: number;
  due_date: string | null;
  completed_at: string | null;
  mbti_dimension: 'EI' | 'SN' | 'TF' | 'JP' | null;
  related_content_ids: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface GoalComment {
  id: string;
  goal_id: string;
  author_id: string | null;
  content: string;
  comment_type: CommentType;
  created_at: string;
}

export interface DevelopmentPlanWithGoals extends DevelopmentPlan {
  goals: DevelopmentGoalWithMilestones[];
}

export interface DevelopmentGoalWithMilestones extends DevelopmentGoal {
  milestones: GoalMilestone[];
}

// UI helpers
export const GOAL_CATEGORY_LABELS: Record<GoalCategory, { label: string; emoji: string; color: string }> = {
  skill: { label: 'Навык', emoji: '🛠️', color: 'bg-blue-100 text-blue-800' },
  knowledge: { label: 'Знания', emoji: '📚', color: 'bg-purple-100 text-purple-800' },
  behavior: { label: 'Поведение', emoji: '🎯', color: 'bg-green-100 text-green-800' },
  mbti_growth: { label: 'MBTI развитие', emoji: '🧠', color: 'bg-orange-100 text-orange-800' },
};

export const GOAL_PRIORITY_LABELS: Record<GoalPriority, { label: string; color: string }> = {
  low: { label: 'Низкий', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Средний', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'Высокий', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Критичный', color: 'bg-red-100 text-red-800' },
};

export const GOAL_STATUS_LABELS: Record<GoalStatus, { label: string; color: string }> = {
  not_started: { label: 'Не начато', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'В процессе', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Выполнено', color: 'bg-green-100 text-green-800' },
  blocked: { label: 'Заблокировано', color: 'bg-red-100 text-red-800' },
};

export const PLAN_STATUS_LABELS: Record<PlanStatus, { label: string; color: string }> = {
  draft: { label: 'Черновик', color: 'bg-gray-100 text-gray-800' },
  active: { label: 'Активный', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Завершён', color: 'bg-blue-100 text-blue-800' },
  archived: { label: 'Архив', color: 'bg-yellow-100 text-yellow-800' },
};

export const MBTI_DIMENSION_LABELS: Record<string, { label: string; description: string }> = {
  EI: { label: 'E/I', description: 'Экстраверсия / Интроверсия' },
  SN: { label: 'S/N', description: 'Сенсорика / Интуиция' },
  TF: { label: 'T/F', description: 'Мышление / Чувство' },
  JP: { label: 'J/P', description: 'Суждение / Восприятие' },
};

// Helper to get progress color
export function getProgressColor(percent: number): string {
  if (percent >= 100) return 'bg-green-500';
  if (percent >= 75) return 'bg-blue-500';
  if (percent >= 50) return 'bg-yellow-500';
  if (percent >= 25) return 'bg-orange-500';
  return 'bg-gray-300';
}

// Helper to calculate plan progress
export function calculatePlanProgress(goals: DevelopmentGoal[]): number {
  if (goals.length === 0) return 0;
  const totalProgress = goals.reduce((sum, goal) => sum + goal.progress_percent, 0);
  return Math.round(totalProgress / goals.length);
}
