-- Otrar Transformation Platform - Gamification System
-- Version: 2.0
-- Date: 2025-12-07
-- Purpose: XP, levels, streaks, achievements, challenges

-- ===========================================
-- USER GAMIFICATION STATS
-- ===========================================
CREATE TABLE public.user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  tenant_id UUID REFERENCES public.tenants(id) DEFAULT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',

  -- XP & Level
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  level_name TEXT DEFAULT 'Explorer',

  -- Streaks
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,

  -- Stats
  total_articles_read INTEGER DEFAULT 0,
  total_quizzes_completed INTEGER DEFAULT 0,
  total_exercises_completed INTEGER DEFAULT 0,
  total_journal_entries INTEGER DEFAULT 0,
  total_challenges_completed INTEGER DEFAULT 0,

  -- Weekly/Monthly tracking
  weekly_xp INTEGER DEFAULT 0,
  monthly_xp INTEGER DEFAULT 0,
  week_start_date DATE,
  month_start_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- LEVELS DEFINITION
-- ===========================================
CREATE TABLE public.gamification_levels (
  level INTEGER PRIMARY KEY,
  name_ru TEXT NOT NULL,
  name_en TEXT NOT NULL,
  min_xp INTEGER NOT NULL,
  max_xp INTEGER, -- NULL for max level
  badge_icon TEXT,
  color TEXT
);

INSERT INTO public.gamification_levels (level, name_ru, name_en, min_xp, max_xp, badge_icon, color) VALUES
  (1, 'Исследователь', 'Explorer', 0, 499, '🔍', '#6B7280'),
  (2, 'Искатель', 'Seeker', 500, 1499, '🧭', '#3B82F6'),
  (3, 'Ученик', 'Apprentice', 1500, 3499, '📚', '#10B981'),
  (4, 'Путешественник', 'Journeyer', 3500, 7499, '🚀', '#8B5CF6'),
  (5, 'Проводник', 'Guide', 7500, 14999, '🌟', '#F59E0B'),
  (6, 'Мудрец', 'Sage', 15000, NULL, '🔮', '#EF4444');

-- ===========================================
-- ACHIEVEMENTS DEFINITION
-- ===========================================
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'discovery',     -- Assessment, onboarding
    'learning',      -- Content consumption
    'practice',      -- Exercises, journaling
    'consistency',   -- Streaks
    'shadow_work',   -- Inferior function development
    'connection',    -- Relationships, team activities
    'mastery',       -- Advanced achievements
    'special'        -- Events, milestones
  )),

  -- Display
  name_ru TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ru TEXT NOT NULL,
  description_en TEXT NOT NULL,
  icon TEXT NOT NULL,

  -- Requirements
  requirement_type TEXT NOT NULL, -- 'count', 'streak', 'completion', 'score'
  requirement_value INTEGER NOT NULL,
  requirement_context JSONB, -- Additional conditions

  -- Rewards
  xp_reward INTEGER DEFAULT 50,
  badge_url TEXT,

  -- Visibility
  is_hidden BOOLEAN DEFAULT false, -- Hidden until earned
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed achievements
INSERT INTO public.achievements (code, category, name_ru, name_en, description_ru, description_en, icon, requirement_type, requirement_value, xp_reward) VALUES
  -- Discovery
  ('first_assessment', 'discovery', 'Первый шаг', 'First Step', 'Пройдите первый тест MBTI', 'Complete your first MBTI assessment', '🎯', 'completion', 1, 100),
  ('type_revealed', 'discovery', 'Тип раскрыт', 'Type Revealed', 'Узнайте свой тип личности', 'Discover your personality type', '🔓', 'completion', 1, 50),
  ('cognitive_explorer', 'discovery', 'Исследователь функций', 'Function Explorer', 'Изучите все 8 когнитивных функций', 'Learn about all 8 cognitive functions', '🧠', 'count', 8, 200),

  -- Learning
  ('first_article', 'learning', 'Первое чтение', 'First Read', 'Прочитайте первую статью', 'Read your first article', '📖', 'completion', 1, 25),
  ('bookworm', 'learning', 'Книжный червь', 'Bookworm', 'Прочитайте 10 статей', 'Read 10 articles', '📚', 'count', 10, 100),
  ('scholar', 'learning', 'Учёный', 'Scholar', 'Прочитайте 50 статей', 'Read 50 articles', '🎓', 'count', 50, 500),
  ('quiz_starter', 'learning', 'Начинающий', 'Quiz Starter', 'Пройдите первый обучающий тест', 'Complete your first learning quiz', '✅', 'completion', 1, 50),
  ('quiz_master', 'learning', 'Мастер тестов', 'Quiz Master', 'Пройдите 20 тестов', 'Complete 20 quizzes', '🏆', 'count', 20, 300),

  -- Consistency
  ('streak_3', 'consistency', 'На волне', 'On a Roll', '3 дня подряд', '3 day streak', '🔥', 'streak', 3, 50),
  ('streak_7', 'consistency', 'Неделя силы', 'Week of Power', '7 дней подряд', '7 day streak', '💪', 'streak', 7, 150),
  ('streak_30', 'consistency', 'Месяц трансформации', 'Month of Transformation', '30 дней подряд', '30 day streak', '⭐', 'streak', 30, 500),
  ('streak_100', 'consistency', 'Легенда', 'Legend', '100 дней подряд', '100 day streak', '👑', 'streak', 100, 2000),

  -- Shadow Work
  ('shadow_awareness', 'shadow_work', 'Осознание тени', 'Shadow Awareness', 'Начните программу Shadow Work', 'Start the Shadow Work program', '🌑', 'completion', 1, 100),
  ('shadow_recognition', 'shadow_work', 'Распознавание', 'Recognition', 'Завершите 2 недели Shadow Work', 'Complete 2 weeks of Shadow Work', '🌗', 'completion', 1, 200),
  ('shadow_integration', 'shadow_work', 'Интеграция', 'Integration', 'Завершите программу Shadow Work', 'Complete Shadow Work program', '🌕', 'completion', 1, 500),
  ('inferior_growth', 'shadow_work', 'Рост подчинённой', 'Inferior Growth', 'Улучшите подчинённую функцию на 20%', 'Improve inferior function by 20%', '📈', 'score', 20, 300),

  -- Connection
  ('first_relationship', 'connection', 'Первая связь', 'First Connection', 'Добавьте первые отношения', 'Add your first relationship', '🤝', 'completion', 1, 50),
  ('team_player', 'connection', 'Командный игрок', 'Team Player', 'Проанализируйте совместимость с 5 людьми', 'Analyze compatibility with 5 people', '👥', 'count', 5, 150),

  -- Practice
  ('first_journal', 'practice', 'Первая запись', 'First Entry', 'Напишите первую запись в дневнике', 'Write your first journal entry', '📝', 'completion', 1, 25),
  ('reflection_habit', 'practice', 'Привычка рефлексии', 'Reflection Habit', 'Напишите 30 записей в дневнике', 'Write 30 journal entries', '💭', 'count', 30, 300),

  -- Mastery
  ('type_expert', 'mastery', 'Эксперт своего типа', 'Type Expert', 'Изучите все материалы по своему типу', 'Study all materials for your type', '🌟', 'completion', 1, 500),
  ('transformation_complete', 'mastery', 'Трансформация', 'Transformation Complete', 'Достигните 6 уровня', 'Reach level 6', '🔮', 'completion', 1, 1000);

-- ===========================================
-- USER ACHIEVEMENTS (earned)
-- ===========================================
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,

  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 0, -- For progressive achievements
  notified BOOLEAN DEFAULT false,

  UNIQUE(user_id, achievement_id)
);

-- ===========================================
-- CHALLENGES
-- ===========================================
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) DEFAULT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',

  -- Identification
  code TEXT UNIQUE NOT NULL,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('daily', 'weekly', 'special')),

  -- Display
  title_ru TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ru TEXT NOT NULL,
  description_en TEXT NOT NULL,
  icon TEXT,

  -- Requirements
  task_type TEXT NOT NULL, -- 'read_article', 'complete_quiz', 'journal_entry', 'exercise'
  task_count INTEGER DEFAULT 1,
  task_filter JSONB, -- {"mbti_types": ["INTJ", "INTP"], "category": "shadow-work"}

  -- MBTI relevance (which types benefit most)
  recommended_types TEXT[] DEFAULT '{}',

  -- Rewards
  xp_reward INTEGER NOT NULL,

  -- Availability
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- USER CHALLENGES (progress)
-- ===========================================
CREATE TABLE public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,

  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'expired')),
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  UNIQUE(user_id, challenge_id)
);

-- ===========================================
-- XP TRANSACTIONS (audit log)
-- ===========================================
CREATE TABLE public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  amount INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'article', 'quiz', 'achievement', 'challenge', 'streak', 'exercise'
  source_id UUID, -- Reference to the source entity
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_user_gamification_user ON public.user_gamification(user_id);
CREATE INDEX idx_user_gamification_tenant ON public.user_gamification(tenant_id);
CREATE INDEX idx_user_gamification_xp ON public.user_gamification(total_xp DESC);
CREATE INDEX idx_user_gamification_streak ON public.user_gamification(current_streak DESC);

CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON public.user_achievements(achievement_id);

CREATE INDEX idx_challenges_type ON public.challenges(challenge_type);
CREATE INDEX idx_challenges_active ON public.challenges(is_active) WHERE is_active = true;
CREATE INDEX idx_challenges_tenant ON public.challenges(tenant_id);

CREATE INDEX idx_user_challenges_user ON public.user_challenges(user_id);
CREATE INDEX idx_user_challenges_status ON public.user_challenges(status);

CREATE INDEX idx_xp_transactions_user ON public.xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_date ON public.xp_transactions(created_at DESC);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_levels ENABLE ROW LEVEL SECURITY;

-- Gamification stats: User can view own, leaderboard visible
CREATE POLICY "Users can view own gamification stats"
  ON public.user_gamification FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view leaderboard in tenant"
  ON public.user_gamification FOR SELECT
  TO authenticated
  USING (
    tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Achievements: Everyone can view definitions
CREATE POLICY "Everyone can view active achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (is_active = true);

-- User achievements: Own only
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Challenges: Tenant-scoped
CREATE POLICY "Users can view active challenges in tenant"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
  );

-- User challenges: Own only
CREATE POLICY "Users can manage own challenges"
  ON public.user_challenges FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- XP transactions: Own only
CREATE POLICY "Users can view own xp transactions"
  ON public.xp_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Levels: Public reference data
CREATE POLICY "Everyone can view levels"
  ON public.gamification_levels FOR SELECT
  TO authenticated
  USING (true);

-- ===========================================
-- TRIGGERS
-- ===========================================

CREATE TRIGGER user_gamification_updated_at
  BEFORE UPDATE ON public.user_gamification
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Function to add XP and update level
CREATE OR REPLACE FUNCTION public.add_user_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_source_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS public.user_gamification AS $$
DECLARE
  v_stats public.user_gamification;
  v_new_level INTEGER;
  v_level_name TEXT;
BEGIN
  -- Ensure user has gamification record
  INSERT INTO public.user_gamification (user_id, tenant_id)
  SELECT p_user_id, p.tenant_id
  FROM public.profiles p WHERE p.id = p_user_id
  ON CONFLICT (user_id) DO NOTHING;

  -- Add XP
  UPDATE public.user_gamification
  SET
    total_xp = total_xp + p_amount,
    weekly_xp = weekly_xp + p_amount,
    monthly_xp = monthly_xp + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING * INTO v_stats;

  -- Log transaction
  INSERT INTO public.xp_transactions (user_id, amount, source, source_id, description)
  VALUES (p_user_id, p_amount, p_source, p_source_id, p_description);

  -- Check for level up
  SELECT level, name_ru INTO v_new_level, v_level_name
  FROM public.gamification_levels
  WHERE min_xp <= v_stats.total_xp
  ORDER BY min_xp DESC
  LIMIT 1;

  IF v_new_level > v_stats.level THEN
    UPDATE public.user_gamification
    SET level = v_new_level, level_name = v_level_name
    WHERE user_id = p_user_id
    RETURNING * INTO v_stats;
  END IF;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS public.user_gamification AS $$
DECLARE
  v_stats public.user_gamification;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT * INTO v_stats FROM public.user_gamification WHERE user_id = p_user_id;

  IF v_stats IS NULL THEN
    -- Create record if doesn't exist
    INSERT INTO public.user_gamification (user_id, current_streak, last_activity_date, tenant_id)
    SELECT p_user_id, 1, v_today, p.tenant_id
    FROM public.profiles p WHERE p.id = p_user_id
    RETURNING * INTO v_stats;
  ELSIF v_stats.last_activity_date = v_today THEN
    -- Already active today, no change
    NULL;
  ELSIF v_stats.last_activity_date = v_today - INTERVAL '1 day' THEN
    -- Consecutive day, increase streak
    UPDATE public.user_gamification
    SET
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_activity_date = v_today,
      updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO v_stats;
  ELSE
    -- Streak broken, reset to 1
    UPDATE public.user_gamification
    SET
      current_streak = 1,
      last_activity_date = v_today,
      updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO v_stats;
  END IF;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
