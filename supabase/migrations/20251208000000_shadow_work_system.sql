-- Shadow Work System Migration
-- 8-week program for inferior function integration

-- ============================================
-- SHADOW WORK PROGRAMS
-- ============================================

CREATE TABLE IF NOT EXISTS shadow_work_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT NOT NULL,
  description_en TEXT,
  duration_weeks INTEGER NOT NULL DEFAULT 8,
  target_function TEXT NOT NULL, -- The inferior function this program targets (Se, Ne, Fe, Te, etc.)
  applicable_types TEXT[] NOT NULL, -- MBTI types this program is for
  difficulty TEXT NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- SHADOW WORK WEEKS
-- ============================================

CREATE TABLE IF NOT EXISTS shadow_work_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES shadow_work_programs(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 12),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT NOT NULL,
  description_en TEXT,
  theme TEXT NOT NULL, -- awareness, recognition, integration, mastery
  learning_objectives TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(program_id, week_number)
);

-- ============================================
-- SHADOW WORK EXERCISES
-- ============================================

CREATE TABLE IF NOT EXISTS shadow_work_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES shadow_work_weeks(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('reflection', 'journaling', 'practice', 'meditation', 'observation', 'action')),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT NOT NULL,
  description_en TEXT,
  instructions TEXT NOT NULL,
  instructions_en TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(week_id, day_number)
);

-- ============================================
-- USER PROGRAM ENROLLMENT
-- ============================================

CREATE TABLE IF NOT EXISTS shadow_work_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES shadow_work_programs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_week INTEGER NOT NULL DEFAULT 1,
  current_day INTEGER NOT NULL DEFAULT 1,
  completed_at TIMESTAMPTZ,
  total_xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, program_id)
);

-- ============================================
-- USER EXERCISE PROGRESS
-- ============================================

CREATE TABLE IF NOT EXISTS shadow_work_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES shadow_work_enrollments(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES shadow_work_exercises(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  reflection_text TEXT, -- User's journal/reflection entry
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(enrollment_id, exercise_id)
);

-- ============================================
-- STRESS TRACKING (for Stress Radar feature)
-- ============================================

CREATE TABLE IF NOT EXISTS stress_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'low', 'stressed')),
  triggers TEXT[], -- What caused stress
  coping_strategies_used TEXT[], -- What helped
  notes TEXT,
  inferior_function_active BOOLEAN DEFAULT false, -- Did they notice inferior function activation?
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_shadow_work_programs_target ON shadow_work_programs(target_function);
CREATE INDEX IF NOT EXISTS idx_shadow_work_programs_types ON shadow_work_programs USING GIN(applicable_types);
CREATE INDEX IF NOT EXISTS idx_shadow_work_weeks_program ON shadow_work_weeks(program_id);
CREATE INDEX IF NOT EXISTS idx_shadow_work_exercises_week ON shadow_work_exercises(week_id);
CREATE INDEX IF NOT EXISTS idx_shadow_work_enrollments_user ON shadow_work_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_shadow_work_enrollments_status ON shadow_work_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_shadow_work_progress_enrollment ON shadow_work_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_stress_check_ins_user ON stress_check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_stress_check_ins_date ON stress_check_ins(checked_in_at);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE shadow_work_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_work_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_work_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_work_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_work_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE stress_check_ins ENABLE ROW LEVEL SECURITY;

-- Programs, Weeks, Exercises: readable by all authenticated users
CREATE POLICY "Programs are viewable by authenticated users"
  ON shadow_work_programs FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Weeks are viewable by authenticated users"
  ON shadow_work_weeks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Exercises are viewable by authenticated users"
  ON shadow_work_exercises FOR SELECT
  TO authenticated
  USING (true);

-- Enrollments: users can only see and modify their own
CREATE POLICY "Users can view own enrollments"
  ON shadow_work_enrollments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own enrollments"
  ON shadow_work_enrollments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own enrollments"
  ON shadow_work_enrollments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Progress: users can only see and modify their own
CREATE POLICY "Users can view own progress"
  ON shadow_work_progress FOR SELECT
  TO authenticated
  USING (
    enrollment_id IN (
      SELECT id FROM shadow_work_enrollments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own progress"
  ON shadow_work_progress FOR INSERT
  TO authenticated
  WITH CHECK (
    enrollment_id IN (
      SELECT id FROM shadow_work_enrollments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own progress"
  ON shadow_work_progress FOR UPDATE
  TO authenticated
  USING (
    enrollment_id IN (
      SELECT id FROM shadow_work_enrollments WHERE user_id = auth.uid()
    )
  );

-- Stress check-ins: users can only see and modify their own
CREATE POLICY "Users can view own stress check-ins"
  ON stress_check_ins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own stress check-ins"
  ON stress_check_ins FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at on enrollments
CREATE OR REPLACE FUNCTION update_shadow_work_enrollment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_shadow_work_enrollment_updated
  BEFORE UPDATE ON shadow_work_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_shadow_work_enrollment_timestamp();

-- Update updated_at on progress
CREATE TRIGGER trigger_shadow_work_progress_updated
  BEFORE UPDATE ON shadow_work_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_shadow_work_enrollment_timestamp();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE shadow_work_programs IS '8-week shadow work programs for inferior function integration';
COMMENT ON TABLE shadow_work_weeks IS 'Weekly structure with themes: awareness, recognition, integration, mastery';
COMMENT ON TABLE shadow_work_exercises IS 'Daily exercises: reflection, journaling, practice, meditation, observation, action';
COMMENT ON TABLE shadow_work_enrollments IS 'User enrollment in shadow work programs';
COMMENT ON TABLE shadow_work_progress IS 'User progress on individual exercises';
COMMENT ON TABLE stress_check_ins IS 'Daily stress tracking for Stress Radar feature';
