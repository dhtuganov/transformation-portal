-- Otrar Transformation Portal - IPR (Individual Development Plan) System
-- Version: 1.0
-- Date: 2025-12-05

-- ===========================================
-- DEVELOPMENT PLANS TABLE (ИПР)
-- ===========================================
CREATE TABLE public.development_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  period_start DATE,
  period_end DATE,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- DEVELOPMENT GOALS TABLE (Цели развития)
-- ===========================================
CREATE TABLE public.development_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.development_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'skill' CHECK (category IN ('skill', 'knowledge', 'behavior', 'mbti_growth')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')),
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  mbti_dimension TEXT CHECK (mbti_dimension IS NULL OR mbti_dimension IN ('EI', 'SN', 'TF', 'JP')),
  related_content_ids UUID[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- GOAL MILESTONES TABLE (Этапы целей)
-- ===========================================
CREATE TABLE public.goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.development_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- GOAL COMMENTS TABLE (Комментарии к целям)
-- ===========================================
CREATE TABLE public.goal_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.development_goals(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  comment_type TEXT DEFAULT 'comment' CHECK (comment_type IN ('comment', 'feedback', 'approval', 'request_changes')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- TRIGGERS
-- ===========================================

CREATE TRIGGER development_plans_updated_at
  BEFORE UPDATE ON public.development_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER development_goals_updated_at
  BEFORE UPDATE ON public.development_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE public.development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_comments ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS POLICIES: Development Plans
-- ===========================================

-- Users can view and manage their own plans
CREATE POLICY "Users can view own plans"
  ON public.development_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plans"
  ON public.development_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON public.development_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Managers can view and approve team plans
CREATE POLICY "Managers can view team plans"
  ON public.development_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = development_plans.user_id
      AND t.manager_id = auth.uid()
    )
  );

CREATE POLICY "Managers can update team plans for approval"
  ON public.development_plans FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = development_plans.user_id
      AND t.manager_id = auth.uid()
    )
  );

-- Executives and admins can view all plans
CREATE POLICY "Executives and admins can view all plans"
  ON public.development_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'executive')
    )
  );

-- ===========================================
-- RLS POLICIES: Development Goals
-- ===========================================

-- Users can manage goals for their own plans
CREATE POLICY "Users can view own goals"
  ON public.development_goals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.development_plans
      WHERE id = development_goals.plan_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own goals"
  ON public.development_goals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.development_plans
      WHERE id = development_goals.plan_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own goals"
  ON public.development_goals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.development_plans
      WHERE id = development_goals.plan_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own goals"
  ON public.development_goals FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.development_plans
      WHERE id = development_goals.plan_id AND user_id = auth.uid()
    )
  );

-- Managers can view team goals
CREATE POLICY "Managers can view team goals"
  ON public.development_goals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.development_plans dp
      JOIN public.teams t ON EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = t.id AND tm.user_id = dp.user_id
      )
      WHERE dp.id = development_goals.plan_id
      AND t.manager_id = auth.uid()
    )
  );

-- ===========================================
-- RLS POLICIES: Goal Milestones
-- ===========================================

-- Users can manage milestones for their own goals
CREATE POLICY "Users can manage own milestones"
  ON public.goal_milestones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.development_goals dg
      JOIN public.development_plans dp ON dp.id = dg.plan_id
      WHERE dg.id = goal_milestones.goal_id AND dp.user_id = auth.uid()
    )
  );

-- Managers can view team milestones
CREATE POLICY "Managers can view team milestones"
  ON public.goal_milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.development_goals dg
      JOIN public.development_plans dp ON dp.id = dg.plan_id
      JOIN public.teams t ON EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = t.id AND tm.user_id = dp.user_id
      )
      WHERE dg.id = goal_milestones.goal_id
      AND t.manager_id = auth.uid()
    )
  );

-- ===========================================
-- RLS POLICIES: Goal Comments
-- ===========================================

-- Users and managers can view comments
CREATE POLICY "Users can view comments on own goals"
  ON public.goal_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.development_goals dg
      JOIN public.development_plans dp ON dp.id = dg.plan_id
      WHERE dg.id = goal_comments.goal_id AND dp.user_id = auth.uid()
    )
  );

-- Users can create comments
CREATE POLICY "Users can create comments"
  ON public.goal_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Managers can view and create comments on team goals
CREATE POLICY "Managers can view team goal comments"
  ON public.goal_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.development_goals dg
      JOIN public.development_plans dp ON dp.id = dg.plan_id
      JOIN public.teams t ON EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = t.id AND tm.user_id = dp.user_id
      )
      WHERE dg.id = goal_comments.goal_id
      AND t.manager_id = auth.uid()
    )
  );

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_development_plans_user ON public.development_plans(user_id);
CREATE INDEX idx_development_plans_status ON public.development_plans(status);
CREATE INDEX idx_development_goals_plan ON public.development_goals(plan_id);
CREATE INDEX idx_development_goals_status ON public.development_goals(status);
CREATE INDEX idx_development_goals_category ON public.development_goals(category);
CREATE INDEX idx_goal_milestones_goal ON public.goal_milestones(goal_id);
CREATE INDEX idx_goal_comments_goal ON public.goal_comments(goal_id);
