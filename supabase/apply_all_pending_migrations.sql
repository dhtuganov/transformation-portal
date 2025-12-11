-- ============================================
-- COMBINED MIGRATIONS FOR PRODUCTION
-- Date: 2025-12-08
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. EXECUTIVE USERS (run first)
-- ============================================

-- Insert real executive profiles
INSERT INTO public.profiles (id, email, full_name, role, department, job_title, mbti_type, mbti_verified)
VALUES
  -- CEO
  (gen_random_uuid(), 'aliya@otrar.kz', 'Алия Досмухамбетова', 'executive', 'Руководство', 'Генеральный директор (CEO)', 'ESTJ', true),

  -- Office Manager (elevated to executive for strategy access)
  (gen_random_uuid(), 'albina@otrar.kz', 'Альбина Сарсенбаева', 'executive', 'Руководство', 'Офис-менеджер / Координатор трансформации', 'ISFJ', true),

  -- Admin/Consultant (David)
  (gen_random_uuid(), 'david@creata.team', 'Давид Туганов', 'admin', 'Консалтинг', 'Трансформационный консультант', 'ENFP', true)

ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  job_title = EXCLUDED.job_title,
  mbti_type = EXCLUDED.mbti_type,
  mbti_verified = EXCLUDED.mbti_verified;

-- Also update any existing users with these emails to executive/admin role
UPDATE public.profiles SET role = 'executive' WHERE email = 'aliya@otrar.kz';
UPDATE public.profiles SET role = 'executive' WHERE email = 'albina@otrar.kz';
UPDATE public.profiles SET role = 'admin' WHERE email = 'david@creata.team';

-- ============================================
-- 2. SHADOW WORK SYSTEM (if not exists)
-- ============================================

-- Check if shadow_work_programs table exists, if not create the system
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'shadow_work_programs') THEN

    -- SHADOW WORK PROGRAMS
    CREATE TABLE shadow_work_programs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      title_en TEXT,
      description TEXT NOT NULL,
      description_en TEXT,
      duration_weeks INTEGER NOT NULL DEFAULT 8,
      target_function TEXT NOT NULL,
      applicable_types TEXT[] NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- SHADOW WORK WEEKS
    CREATE TABLE shadow_work_weeks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      program_id UUID NOT NULL REFERENCES shadow_work_programs(id) ON DELETE CASCADE,
      week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 12),
      title TEXT NOT NULL,
      title_en TEXT,
      description TEXT NOT NULL,
      description_en TEXT,
      theme TEXT NOT NULL,
      learning_objectives TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(program_id, week_number)
    );

    -- SHADOW WORK EXERCISES
    CREATE TABLE shadow_work_exercises (
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

    -- USER PROGRAM ENROLLMENT
    CREATE TABLE shadow_work_enrollments (
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

    -- USER EXERCISE PROGRESS
    CREATE TABLE shadow_work_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      enrollment_id UUID NOT NULL REFERENCES shadow_work_enrollments(id) ON DELETE CASCADE,
      exercise_id UUID NOT NULL REFERENCES shadow_work_exercises(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      reflection_text TEXT,
      mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
      mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),
      difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
      xp_earned INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(enrollment_id, exercise_id)
    );

    -- STRESS TRACKING
    CREATE TABLE stress_check_ins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
      energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
      mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'low', 'stressed')),
      triggers TEXT[],
      coping_strategies_used TEXT[],
      notes TEXT,
      inferior_function_active BOOLEAN DEFAULT false,
      checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- INDEXES
    CREATE INDEX idx_shadow_work_programs_target ON shadow_work_programs(target_function);
    CREATE INDEX idx_shadow_work_programs_types ON shadow_work_programs USING GIN(applicable_types);
    CREATE INDEX idx_shadow_work_weeks_program ON shadow_work_weeks(program_id);
    CREATE INDEX idx_shadow_work_exercises_week ON shadow_work_exercises(week_id);
    CREATE INDEX idx_shadow_work_enrollments_user ON shadow_work_enrollments(user_id);
    CREATE INDEX idx_shadow_work_enrollments_status ON shadow_work_enrollments(status);
    CREATE INDEX idx_shadow_work_progress_enrollment ON shadow_work_progress(enrollment_id);
    CREATE INDEX idx_stress_check_ins_user ON stress_check_ins(user_id);
    CREATE INDEX idx_stress_check_ins_date ON stress_check_ins(checked_in_at);

    -- RLS POLICIES
    ALTER TABLE shadow_work_programs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE shadow_work_weeks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE shadow_work_exercises ENABLE ROW LEVEL SECURITY;
    ALTER TABLE shadow_work_enrollments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE shadow_work_progress ENABLE ROW LEVEL SECURITY;
    ALTER TABLE stress_check_ins ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Programs are viewable by authenticated users" ON shadow_work_programs FOR SELECT TO authenticated USING (is_active = true);
    CREATE POLICY "Weeks are viewable by authenticated users" ON shadow_work_weeks FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Exercises are viewable by authenticated users" ON shadow_work_exercises FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Users can view own enrollments" ON shadow_work_enrollments FOR SELECT TO authenticated USING (user_id = auth.uid());
    CREATE POLICY "Users can create own enrollments" ON shadow_work_enrollments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
    CREATE POLICY "Users can update own enrollments" ON shadow_work_enrollments FOR UPDATE TO authenticated USING (user_id = auth.uid());
    CREATE POLICY "Users can view own progress" ON shadow_work_progress FOR SELECT TO authenticated USING (enrollment_id IN (SELECT id FROM shadow_work_enrollments WHERE user_id = auth.uid()));
    CREATE POLICY "Users can create own progress" ON shadow_work_progress FOR INSERT TO authenticated WITH CHECK (enrollment_id IN (SELECT id FROM shadow_work_enrollments WHERE user_id = auth.uid()));
    CREATE POLICY "Users can update own progress" ON shadow_work_progress FOR UPDATE TO authenticated USING (enrollment_id IN (SELECT id FROM shadow_work_enrollments WHERE user_id = auth.uid()));
    CREATE POLICY "Users can view own stress check-ins" ON stress_check_ins FOR SELECT TO authenticated USING (user_id = auth.uid());
    CREATE POLICY "Users can create own stress check-ins" ON stress_check_ins FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

    RAISE NOTICE 'Shadow Work tables created successfully';
  ELSE
    RAISE NOTICE 'Shadow Work tables already exist, skipping creation';
  END IF;
END $$;

-- ============================================
-- 3. SEED SHADOW WORK PROGRAMS (if not seeded)
-- ============================================

-- Se Inferior (INTJ, INFJ)
INSERT INTO shadow_work_programs (slug, title, title_en, description, description_en, duration_weeks, target_function, applicable_types, difficulty)
VALUES (
  'se-integration',
  'Интеграция Se: Присутствие в моменте',
  'Se Integration: Being Present',
  'Программа для типов с подчинённой Se (INTJ, INFJ). Развивает осознанность тела, сенсорное восприятие и способность наслаждаться настоящим моментом.',
  'Program for types with inferior Se (INTJ, INFJ). Develops body awareness, sensory perception and ability to enjoy the present moment.',
  8, 'Se', ARRAY['INTJ', 'INFJ'], 'intermediate'
) ON CONFLICT (slug) DO NOTHING;

-- Ne Inferior (ISTJ, ISFJ)
INSERT INTO shadow_work_programs (slug, title, title_en, description, description_en, duration_weeks, target_function, applicable_types, difficulty)
VALUES (
  'ne-integration',
  'Интеграция Ne: Открытость возможностям',
  'Ne Integration: Embracing Possibilities',
  'Программа для типов с подчинённой Ne (ISTJ, ISFJ). Развивает способность видеть альтернативы, принимать неопределённость и генерировать новые идеи.',
  'Program for types with inferior Ne (ISTJ, ISFJ). Develops ability to see alternatives, embrace uncertainty and generate new ideas.',
  8, 'Ne', ARRAY['ISTJ', 'ISFJ'], 'intermediate'
) ON CONFLICT (slug) DO NOTHING;

-- Fe Inferior (INTP, ISTP)
INSERT INTO shadow_work_programs (slug, title, title_en, description, description_en, duration_weeks, target_function, applicable_types, difficulty)
VALUES (
  'fe-integration',
  'Интеграция Fe: Гармония с другими',
  'Fe Integration: Harmony with Others',
  'Программа для типов с подчинённой Fe (INTP, ISTP). Развивает эмоциональный интеллект, навыки коммуникации и способность строить отношения.',
  'Program for types with inferior Fe (INTP, ISTP). Develops emotional intelligence, communication skills and relationship building.',
  8, 'Fe', ARRAY['INTP', 'ISTP'], 'intermediate'
) ON CONFLICT (slug) DO NOTHING;

-- Te Inferior (INFP, ISFP)
INSERT INTO shadow_work_programs (slug, title, title_en, description, description_en, duration_weeks, target_function, applicable_types, difficulty)
VALUES (
  'te-integration',
  'Интеграция Te: Эффективность в действии',
  'Te Integration: Effectiveness in Action',
  'Программа для типов с подчинённой Te (INFP, ISFP). Развивает организованность, способность принимать решения и доводить дела до конца.',
  'Program for types with inferior Te (INFP, ISFP). Develops organization, decision-making and ability to follow through.',
  8, 'Te', ARRAY['INFP', 'ISFP'], 'intermediate'
) ON CONFLICT (slug) DO NOTHING;

-- Fi Inferior (ENTJ, ESTJ)
INSERT INTO shadow_work_programs (slug, title, title_en, description, description_en, duration_weeks, target_function, applicable_types, difficulty)
VALUES (
  'fi-integration',
  'Интеграция Fi: Связь с ценностями',
  'Fi Integration: Connecting with Values',
  'Программа для типов с подчинённой Fi (ENTJ, ESTJ). Развивает осознание личных ценностей, эмпатию и эмоциональную аутентичность.',
  'Program for types with inferior Fi (ENTJ, ESTJ). Develops awareness of personal values, empathy and emotional authenticity.',
  8, 'Fi', ARRAY['ENTJ', 'ESTJ'], 'intermediate'
) ON CONFLICT (slug) DO NOTHING;

-- Ti Inferior (ENFJ, ESFJ)
INSERT INTO shadow_work_programs (slug, title, title_en, description, description_en, duration_weeks, target_function, applicable_types, difficulty)
VALUES (
  'ti-integration',
  'Интеграция Ti: Независимое мышление',
  'Ti Integration: Independent Thinking',
  'Программа для типов с подчинённой Ti (ENFJ, ESFJ). Развивает критическое мышление, логический анализ и независимость суждений.',
  'Program for types with inferior Ti (ENFJ, ESFJ). Develops critical thinking, logical analysis and independent judgment.',
  8, 'Ti', ARRAY['ENFJ', 'ESFJ'], 'intermediate'
) ON CONFLICT (slug) DO NOTHING;

-- Si Inferior (ENTP, ENFP)
INSERT INTO shadow_work_programs (slug, title, title_en, description, description_en, duration_weeks, target_function, applicable_types, difficulty)
VALUES (
  'si-integration',
  'Интеграция Si: Стабильность и традиции',
  'Si Integration: Stability and Traditions',
  'Программа для типов с подчинённой Si (ENTP, ENFP). Развивает внимание к деталям, последовательность и связь с прошлым опытом.',
  'Program for types with inferior Si (ENTP, ENFP). Develops attention to detail, consistency and connection to past experience.',
  8, 'Si', ARRAY['ENTP', 'ENFP'], 'intermediate'
) ON CONFLICT (slug) DO NOTHING;

-- Ni Inferior (ESTP, ESFP)
INSERT INTO shadow_work_programs (slug, title, title_en, description, description_en, duration_weeks, target_function, applicable_types, difficulty)
VALUES (
  'ni-integration',
  'Интеграция Ni: Видение будущего',
  'Ni Integration: Future Vision',
  'Программа для типов с подчинённой Ni (ESTP, ESFP). Развивает стратегическое мышление, рефлексию и способность видеть долгосрочные паттерны.',
  'Program for types with inferior Ni (ESTP, ESFP). Develops strategic thinking, reflection and ability to see long-term patterns.',
  8, 'Ni', ARRAY['ESTP', 'ESFP'], 'intermediate'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Executive users:' as check_type, count(*) as count FROM profiles WHERE role IN ('executive', 'admin');
SELECT 'Shadow Work programs:' as check_type, count(*) as count FROM shadow_work_programs;
