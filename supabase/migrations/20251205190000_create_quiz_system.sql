-- Otrar Transformation Portal - Quiz System
-- Version: 1.0
-- Date: 2025-12-05

-- ===========================================
-- QUIZZES TABLE (metadata for quizzes)
-- ===========================================
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  quiz_type TEXT DEFAULT 'knowledge' CHECK (quiz_type IN ('knowledge', 'mbti', 'assessment', 'feedback')),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  mbti_types TEXT[] DEFAULT '{}',
  roles TEXT[] DEFAULT '{}',
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER DEFAULT 15,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  shuffle_questions BOOLEAN DEFAULT false,
  shuffle_options BOOLEAN DEFAULT false,
  show_correct_answers BOOLEAN DEFAULT true,
  published BOOLEAN DEFAULT false,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- QUIZ QUESTIONS TABLE
-- ===========================================
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  question_type TEXT DEFAULT 'single_choice' CHECK (question_type IN ('single_choice', 'multiple_choice', 'scale', 'text', 'mbti_pair')),
  question_text TEXT NOT NULL,
  question_hint TEXT,
  options JSONB DEFAULT '[]',
  correct_answer JSONB,
  points INTEGER DEFAULT 1,
  explanation TEXT,
  mbti_dimension TEXT CHECK (mbti_dimension IS NULL OR mbti_dimension IN ('EI', 'SN', 'TF', 'JP')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- QUIZ ATTEMPTS TABLE (user sessions)
-- ===========================================
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  score INTEGER,
  total_points INTEGER,
  passed BOOLEAN,
  answers JSONB DEFAULT '{}',
  result_data JSONB DEFAULT '{}'
);

-- ===========================================
-- QUIZ ANSWERS TABLE (individual answers)
-- ===========================================
CREATE TABLE public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  user_answer JSONB,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Update updated_at for quizzes
CREATE TRIGGER quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS POLICIES: Quizzes
-- ===========================================

-- Anyone authenticated can view published quizzes
CREATE POLICY "Authenticated users can view published quizzes"
  ON public.quizzes FOR SELECT
  TO authenticated
  USING (published = true);

-- Admins can manage all quizzes
CREATE POLICY "Admins can manage quizzes"
  ON public.quizzes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================================
-- RLS POLICIES: Quiz Questions
-- ===========================================

-- Users can view questions for published quizzes
CREATE POLICY "Users can view questions for published quizzes"
  ON public.quiz_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE id = quiz_questions.quiz_id AND published = true
    )
  );

-- Admins can manage all questions
CREATE POLICY "Admins can manage quiz questions"
  ON public.quiz_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================================
-- RLS POLICIES: Quiz Attempts
-- ===========================================

-- Users can view their own attempts
CREATE POLICY "Users can view own attempts"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own attempts
CREATE POLICY "Users can create own attempts"
  ON public.quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own in-progress attempts
CREATE POLICY "Users can update own in-progress attempts"
  ON public.quiz_attempts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'in_progress');

-- Managers can view team attempts
CREATE POLICY "Managers can view team attempts"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = quiz_attempts.user_id
      AND t.manager_id = auth.uid()
    )
  );

-- Executives and admins can view all attempts
CREATE POLICY "Executives and admins can view all attempts"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'executive')
    )
  );

-- ===========================================
-- RLS POLICIES: Quiz Answers
-- ===========================================

-- Users can manage their own answers
CREATE POLICY "Users can view own answers"
  ON public.quiz_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts
      WHERE id = quiz_answers.attempt_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own answers"
  ON public.quiz_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts
      WHERE id = quiz_answers.attempt_id
      AND user_id = auth.uid()
      AND status = 'in_progress'
    )
  );

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_quizzes_slug ON public.quizzes(slug);
CREATE INDEX idx_quizzes_category ON public.quizzes(category);
CREATE INDEX idx_quizzes_published ON public.quizzes(published);
CREATE INDEX idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_order ON public.quiz_questions(quiz_id, question_order);
CREATE INDEX idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_status ON public.quiz_attempts(status);
CREATE INDEX idx_quiz_answers_attempt ON public.quiz_answers(attempt_id);

-- ===========================================
-- SEED DATA: Sample MBTI Quiz
-- ===========================================

INSERT INTO public.quizzes (slug, title, description, quiz_type, category, duration_minutes, passing_score, published)
VALUES (
  'mbti-quick-test',
  'Экспресс-тест MBTI',
  'Быстрый тест для определения вашего типа личности по MBTI. 16 вопросов, около 10 минут.',
  'mbti',
  'mbti',
  10,
  0,
  true
);

-- MBTI Questions (4 for each dimension)
WITH quiz AS (SELECT id FROM public.quizzes WHERE slug = 'mbti-quick-test')
INSERT INTO public.quiz_questions (quiz_id, question_order, question_type, question_text, options, mbti_dimension)
SELECT
  quiz.id,
  q.question_order,
  'mbti_pair',
  q.question_text,
  q.options::jsonb,
  q.mbti_dimension
FROM quiz, (VALUES
  -- E/I Questions
  (1, 'Что вас больше заряжает энергией?', '[{"value": "E", "label": "Общение с людьми, активные мероприятия"}, {"value": "I", "label": "Время наедине с собой, тихие занятия"}]', 'EI'),
  (2, 'Как вы предпочитаете обрабатывать информацию?', '[{"value": "E", "label": "Обсуждая с другими, размышляя вслух"}, {"value": "I", "label": "Обдумывая в тишине, самостоятельно"}]', 'EI'),
  (3, 'В новой группе вы обычно:', '[{"value": "E", "label": "Быстро знакомитесь и общаетесь"}, {"value": "I", "label": "Сначала наблюдаете, потом общаетесь"}]', 'EI'),
  (4, 'После долгого рабочего дня вы предпочитаете:', '[{"value": "E", "label": "Встретиться с друзьями или коллегами"}, {"value": "I", "label": "Побыть в тишине дома"}]', 'EI'),

  -- S/N Questions
  (5, 'При изучении нового вы фокусируетесь на:', '[{"value": "S", "label": "Конкретных фактах и деталях"}, {"value": "N", "label": "Общей картине и взаимосвязях"}]', 'SN'),
  (6, 'При решении проблем вы полагаетесь на:', '[{"value": "S", "label": "Проверенные методы и личный опыт"}, {"value": "N", "label": "Интуицию и новые подходы"}]', 'SN'),
  (7, 'Какие разговоры вам интереснее?', '[{"value": "S", "label": "О реальных событиях и практических вещах"}, {"value": "N", "label": "О идеях, теориях и возможностях"}]', 'SN'),
  (8, 'В работе вы предпочитаете:', '[{"value": "S", "label": "Чёткие инструкции и известные задачи"}, {"value": "N", "label": "Творческие задачи и эксперименты"}]', 'SN'),

  -- T/F Questions
  (9, 'При принятии решений вы больше опираетесь на:', '[{"value": "T", "label": "Логику, факты и объективный анализ"}, {"value": "F", "label": "Ценности, чувства и влияние на людей"}]', 'TF'),
  (10, 'Что важнее в обратной связи?', '[{"value": "T", "label": "Честность и конструктивность"}, {"value": "F", "label": "Тактичность и поддержка"}]', 'TF'),
  (11, 'В конфликте вы склонны:', '[{"value": "T", "label": "Анализировать ситуацию объективно"}, {"value": "F", "label": "Учитывать чувства всех сторон"}]', 'TF'),
  (12, 'Что вас больше мотивирует?', '[{"value": "T", "label": "Достижение цели и результата"}, {"value": "F", "label": "Гармония в команде и помощь другим"}]', 'TF'),

  -- J/P Questions
  (13, 'Как вы относитесь к планированию?', '[{"value": "J", "label": "Люблю планировать заранее и следовать плану"}, {"value": "P", "label": "Предпочитаю гибкость и спонтанность"}]', 'JP'),
  (14, 'Дедлайны для вас — это:', '[{"value": "J", "label": "Важные ориентиры, которые нужно соблюдать"}, {"value": "P", "label": "Примерные сроки, которые можно адаптировать"}]', 'JP'),
  (15, 'Ваше рабочее место обычно:', '[{"value": "J", "label": "Организованное и упорядоченное"}, {"value": "P", "label": "Творческий беспорядок, всё под рукой"}]', 'JP'),
  (16, 'Вы предпочитаете:', '[{"value": "J", "label": "Завершить дела и закрыть вопросы"}, {"value": "P", "label": "Оставить опции открытыми"}]', 'JP')
) AS q(question_order, question_text, options, mbti_dimension);
