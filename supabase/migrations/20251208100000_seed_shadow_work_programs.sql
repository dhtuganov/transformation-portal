-- Seed Shadow Work Programs
-- 8-week programs for each inferior function

-- ============================================
-- PROGRAMS FOR EACH INFERIOR FUNCTION
-- ============================================

-- Se Inferior (INTJ, INFJ)
INSERT INTO shadow_work_programs (slug, title, title_en, description, description_en, duration_weeks, target_function, applicable_types, difficulty)
VALUES (
  'se-integration',
  'Интеграция Se: Присутствие в моменте',
  'Se Integration: Being Present',
  'Программа для типов с подчинённой Se (INTJ, INFJ). Развивает осознанность тела, сенсорное восприятие и способность наслаждаться настоящим моментом.',
  'Program for types with inferior Se (INTJ, INFJ). Develops body awareness, sensory perception and ability to enjoy the present moment.',
  8,
  'Se',
  ARRAY['INTJ', 'INFJ'],
  'intermediate'
);

-- Ne Inferior (ISTJ, ISFJ)
INSERT INTO shadow_work_programs (slug, title, title_en, description, description_en, duration_weeks, target_function, applicable_types, difficulty)
VALUES (
  'ne-integration',
  'Интеграция Ne: Открытость возможностям',
  'Ne Integration: Embracing Possibilities',
  'Программа для типов с подчинённой Ne (ISTJ, ISFJ). Развивает способность видеть альтернативы, принимать неопределённость и генерировать новые идеи.',
  'Program for types with inferior Ne (ISTJ, ISFJ). Develops ability to see alternatives, embrace uncertainty and generate new ideas.',
  8,
  'Ne',
  ARRAY['ISTJ', 'ISFJ'],
  'intermediate'
);

-- Fe Inferior (INTP, ISTP)
INSERT INTO shadow_work_programs (slug, title, title_en, description, description_en, duration_weeks, target_function, applicable_types, difficulty)
VALUES (
  'fe-integration',
  'Интеграция Fe: Гармония с другими',
  'Fe Integration: Harmony with Others',
  'Программа для типов с подчинённой Fe (INTP, ISTP). Развивает эмоциональный интеллект, навыки коммуникации и способность строить отношения.',
  'Program for types with inferior Fe (INTP, ISTP). Develops emotional intelligence, communication skills and relationship building.',
  8,
  'Fe',
  ARRAY['INTP', 'ISTP'],
  'intermediate'
);

-- Te Inferior (INFP, ISFP)
INSERT INTO shadow_work_programs (slug, title, title_en, description, description_en, duration_weeks, target_function, applicable_types, difficulty)
VALUES (
  'te-integration',
  'Интеграция Te: Эффективность в действии',
  'Te Integration: Effectiveness in Action',
  'Программа для типов с подчинённой Te (INFP, ISFP). Развивает организованность, способность принимать решения и доводить дела до конца.',
  'Program for types with inferior Te (INFP, ISFP). Develops organization, decision-making and ability to follow through.',
  8,
  'Te',
  ARRAY['INFP', 'ISFP'],
  'intermediate'
);

-- Fi Inferior (ENTJ, ESTJ)
INSERT INTO shadow_work_programs (slug, title, title_en, description, description_en, duration_weeks, target_function, applicable_types, difficulty)
VALUES (
  'fi-integration',
  'Интеграция Fi: Связь с ценностями',
  'Fi Integration: Connecting with Values',
  'Программа для типов с подчинённой Fi (ENTJ, ESTJ). Развивает осознание личных ценностей, эмпатию и эмоциональную аутентичность.',
  'Program for types with inferior Fi (ENTJ, ESTJ). Develops awareness of personal values, empathy and emotional authenticity.',
  8,
  'Fi',
  ARRAY['ENTJ', 'ESTJ'],
  'intermediate'
);

-- Ti Inferior (ENFJ, ESFJ)
INSERT INTO shadow_work_programs (slug, title, title_en, description, description_en, duration_weeks, target_function, applicable_types, difficulty)
VALUES (
  'ti-integration',
  'Интеграция Ti: Независимое мышление',
  'Ti Integration: Independent Thinking',
  'Программа для типов с подчинённой Ti (ENFJ, ESFJ). Развивает критическое мышление, логический анализ и независимость суждений.',
  'Program for types with inferior Ti (ENFJ, ESFJ). Develops critical thinking, logical analysis and independent judgment.',
  8,
  'Ti',
  ARRAY['ENFJ', 'ESFJ'],
  'intermediate'
);

-- Si Inferior (ENTP, ENFP)
INSERT INTO shadow_work_programs (slug, title, title_en, description, description_en, duration_weeks, target_function, applicable_types, difficulty)
VALUES (
  'si-integration',
  'Интеграция Si: Стабильность и традиции',
  'Si Integration: Stability and Traditions',
  'Программа для типов с подчинённой Si (ENTP, ENFP). Развивает внимание к деталям, последовательность и связь с прошлым опытом.',
  'Program for types with inferior Si (ENTP, ENFP). Develops attention to detail, consistency and connection to past experience.',
  8,
  'Si',
  ARRAY['ENTP', 'ENFP'],
  'intermediate'
);

-- Ni Inferior (ESTP, ESFP)
INSERT INTO shadow_work_programs (slug, title, title_en, description, description_en, duration_weeks, target_function, applicable_types, difficulty)
VALUES (
  'ni-integration',
  'Интеграция Ni: Видение будущего',
  'Ni Integration: Future Vision',
  'Программа для типов с подчинённой Ni (ESTP, ESFP). Развивает стратегическое мышление, рефлексию и способность видеть долгосрочные паттерны.',
  'Program for types with inferior Ni (ESTP, ESFP). Develops strategic thinking, reflection and ability to see long-term patterns.',
  8,
  'Ni',
  ARRAY['ESTP', 'ESFP'],
  'intermediate'
);

-- ============================================
-- WEEKS FOR Se INTEGRATION PROGRAM
-- (Template that can be adapted for others)
-- ============================================

-- Get the Se program ID
DO $$
DECLARE
  se_program_id UUID;
BEGIN
  SELECT id INTO se_program_id FROM shadow_work_programs WHERE slug = 'se-integration';

  -- Week 1: Awareness
  INSERT INTO shadow_work_weeks (program_id, week_number, title, title_en, description, description_en, theme, learning_objectives)
  VALUES (
    se_program_id,
    1,
    'Осознание: Где я нахожусь?',
    'Awareness: Where Am I?',
    'Первая неделя посвящена осознанию того, как мало внимания мы уделяем телу и настоящему моменту. Начинаем замечать паттерны избегания.',
    'First week focuses on awareness of how little attention we pay to body and present moment. Start noticing avoidance patterns.',
    'awareness',
    ARRAY['Осознать своё отношение к телу', 'Заметить паттерны избегания Se', 'Начать вести дневник ощущений']
  );

  -- Week 2: Recognition
  INSERT INTO shadow_work_weeks (program_id, week_number, title, title_en, description, description_en, theme, learning_objectives)
  VALUES (
    se_program_id,
    2,
    'Распознавание: Триггеры и сопротивление',
    'Recognition: Triggers and Resistance',
    'Учимся распознавать ситуации, когда подчинённая Se активируется негативно, и понимать наше сопротивление.',
    'Learning to recognize situations when inferior Se activates negatively, and understanding our resistance.',
    'recognition',
    ARRAY['Идентифицировать триггеры стресса', 'Распознавать признаки активации Se', 'Понять своё сопротивление']
  );

  -- Week 3: Recognition continued
  INSERT INTO shadow_work_weeks (program_id, week_number, title, title_en, description, description_en, theme, learning_objectives)
  VALUES (
    se_program_id,
    3,
    'Распознавание: Тело как союзник',
    'Recognition: Body as Ally',
    'Продолжаем работу с распознаванием, начинаем относиться к телу как к источнику мудрости, а не как к препятствию.',
    'Continue recognition work, begin relating to body as source of wisdom, not obstacle.',
    'recognition',
    ARRAY['Слушать сигналы тела', 'Найти "домашние" телесные практики', 'Развить телесную осознанность']
  );

  -- Week 4: Integration begins
  INSERT INTO shadow_work_weeks (program_id, week_number, title, title_en, description, description_en, theme, learning_objectives)
  VALUES (
    se_program_id,
    4,
    'Интеграция: Первые шаги',
    'Integration: First Steps',
    'Начинаем осторожно интегрировать Se через небольшие ежедневные практики. Фокус на удовольствии, а не на достижениях.',
    'Begin carefully integrating Se through small daily practices. Focus on pleasure, not achievement.',
    'integration',
    ARRAY['Практиковать "микро-Se" ежедневно', 'Найти удовольствие в простых вещах', 'Преодолеть перфекционизм в теле']
  );

  -- Week 5: Integration deepens
  INSERT INTO shadow_work_weeks (program_id, week_number, title, title_en, description, description_en, theme, learning_objectives)
  VALUES (
    se_program_id,
    5,
    'Интеграция: Расширение зоны комфорта',
    'Integration: Expanding Comfort Zone',
    'Постепенно расширяем зону комфорта, пробуя новые сенсорные опыты и физические активности.',
    'Gradually expand comfort zone by trying new sensory experiences and physical activities.',
    'integration',
    ARRAY['Попробовать новый физический опыт', 'Исследовать сенсорные удовольствия', 'Практиковать спонтанность']
  );

  -- Week 6: Integration consolidation
  INSERT INTO shadow_work_weeks (program_id, week_number, title, title_en, description, description_en, theme, learning_objectives)
  VALUES (
    se_program_id,
    6,
    'Интеграция: Закрепление практик',
    'Integration: Consolidating Practices',
    'Закрепляем успешные практики. Учимся использовать Se как ресурс в стрессовых ситуациях.',
    'Consolidate successful practices. Learn to use Se as resource in stressful situations.',
    'integration',
    ARRAY['Создать устойчивую рутину', 'Использовать Se для управления стрессом', 'Интегрировать тело в принятие решений']
  );

  -- Week 7: Mastery begins
  INSERT INTO shadow_work_weeks (program_id, week_number, title, title_en, description, description_en, theme, learning_objectives)
  VALUES (
    se_program_id,
    7,
    'Мастерство: Танец Ni-Se',
    'Mastery: The Ni-Se Dance',
    'Учимся балансировать между доминантной Ni и развивающейся Se. Создаём гармоничное взаимодействие.',
    'Learn to balance between dominant Ni and developing Se. Create harmonious interaction.',
    'mastery',
    ARRAY['Интегрировать Se с Ni', 'Использовать Se для заземления видения', 'Найти свой уникальный баланс']
  );

  -- Week 8: Mastery and continuation
  INSERT INTO shadow_work_weeks (program_id, week_number, title, title_en, description, description_en, theme, learning_objectives)
  VALUES (
    se_program_id,
    8,
    'Мастерство: Путь продолжается',
    'Mastery: The Journey Continues',
    'Завершаем программу, создаём план для дальнейшего развития Se в повседневной жизни.',
    'Complete the program, create plan for continued Se development in daily life.',
    'mastery',
    ARRAY['Оценить прогресс', 'Создать план дальнейшего развития', 'Отпраздновать достижения']
  );
END $$;

-- ============================================
-- EXERCISES FOR WEEK 1 (Se Integration)
-- ============================================

DO $$
DECLARE
  week1_id UUID;
BEGIN
  SELECT sw.id INTO week1_id
  FROM shadow_work_weeks sw
  JOIN shadow_work_programs sp ON sw.program_id = sp.id
  WHERE sp.slug = 'se-integration' AND sw.week_number = 1;

  -- Day 1: Reflection
  INSERT INTO shadow_work_exercises (week_id, day_number, exercise_type, title, title_en, description, description_en, instructions, instructions_en, duration_minutes, xp_reward)
  VALUES (
    week1_id,
    1,
    'reflection',
    'Мои отношения с телом',
    'My Relationship with My Body',
    'Исследуем ваше текущее отношение к физическому телу и сенсорному опыту.',
    'Explore your current relationship with your physical body and sensory experience.',
    E'1. Найдите тихое место и сядьте удобно\n2. Закройте глаза и сделайте три глубоких вдоха\n3. Просканируйте тело от головы до ног\n4. Запишите в дневник:\n   - Какие части тела вы ощущаете хорошо?\n   - Какие части тела вы игнорируете?\n   - Как часто вы обращаете внимание на физические ощущения?\n   - Что вы чувствуете, когда думаете о физической активности?',
    E'1. Find a quiet place and sit comfortably\n2. Close your eyes and take three deep breaths\n3. Scan your body from head to toe\n4. Write in your journal:\n   - Which parts of your body do you feel well?\n   - Which parts do you ignore?\n   - How often do you pay attention to physical sensations?\n   - How do you feel when thinking about physical activity?',
    20,
    15
  );

  -- Day 2: Observation
  INSERT INTO shadow_work_exercises (week_id, day_number, exercise_type, title, title_en, description, description_en, instructions, instructions_en, duration_minutes, xp_reward)
  VALUES (
    week1_id,
    2,
    'observation',
    'Наблюдение за избеганием',
    'Observing Avoidance',
    'Учимся замечать моменты, когда мы избегаем физического опыта или присутствия в моменте.',
    'Learning to notice moments when we avoid physical experience or being present.',
    E'Сегодня ваша задача — быть наблюдателем:\n\n1. В течение дня замечайте моменты, когда вы:\n   - Уходите в мысли вместо присутствия\n   - Откладываете физические потребности (еда, отдых)\n   - Избегаете физической активности\n   - Не замечаете окружающую среду\n\n2. Вечером запишите 3-5 таких моментов\n\n3. Без осуждения отметьте: что вы делали вместо присутствия?',
    E'Today your task is to be an observer:\n\n1. Throughout the day notice moments when you:\n   - Escape into thoughts instead of being present\n   - Postpone physical needs (food, rest)\n   - Avoid physical activity\n   - Don''t notice your surroundings\n\n2. In the evening, write down 3-5 such moments\n\n3. Without judgment, note: what were you doing instead of being present?',
    15,
    10
  );

  -- Day 3: Practice
  INSERT INTO shadow_work_exercises (week_id, day_number, exercise_type, title, title_en, description, description_en, instructions, instructions_en, duration_minutes, xp_reward)
  VALUES (
    week1_id,
    3,
    'practice',
    '5-4-3-2-1 Заземление',
    '5-4-3-2-1 Grounding',
    'Простая техника заземления через пять чувств.',
    'Simple grounding technique through five senses.',
    E'Выполните это упражнение 3 раза в течение дня:\n\n1. Остановитесь на минуту\n2. Назовите:\n   - 5 вещей, которые вы ВИДИТЕ\n   - 4 вещи, которые вы СЛЫШИТЕ\n   - 3 вещи, которые вы ОСЯЗАЕТЕ\n   - 2 вещи, которые вы ЧУВСТВУЕТЕ на запах\n   - 1 вещь, которую вы ОЩУЩАЕТЕ на вкус\n\n3. Отметьте, как изменилось ваше состояние после упражнения\n\nЗапишите наблюдения в дневник.',
    E'Do this exercise 3 times during the day:\n\n1. Stop for a minute\n2. Name:\n   - 5 things you SEE\n   - 4 things you HEAR\n   - 3 things you TOUCH\n   - 2 things you SMELL\n   - 1 thing you TASTE\n\n3. Note how your state changed after the exercise\n\nRecord observations in your journal.',
    15,
    10
  );

  -- Day 4: Journaling
  INSERT INTO shadow_work_exercises (week_id, day_number, exercise_type, title, title_en, description, description_en, instructions, instructions_en, duration_minutes, xp_reward)
  VALUES (
    week1_id,
    4,
    'journaling',
    'История моего тела',
    'History of My Body',
    'Глубокое исследование вашей истории отношений с физическим телом.',
    'Deep exploration of your history with your physical body.',
    E'Напишите свободным потоком (10-15 минут) на следующие темы:\n\n1. Вспомните момент из детства, когда вы чувствовали себя полностью в теле. Что это было? Как это ощущалось?\n\n2. Когда вы начали "жить в голове"? Что этому способствовало?\n\n3. Какие послания о теле вы получали от семьи, школы, культуры?\n\n4. Если бы ваше тело могло говорить, что бы оно сказало вам прямо сейчас?',
    E'Write in free flow (10-15 minutes) on these topics:\n\n1. Remember a moment from childhood when you felt fully in your body. What was it? How did it feel?\n\n2. When did you start "living in your head"? What contributed to this?\n\n3. What messages about the body did you receive from family, school, culture?\n\n4. If your body could speak, what would it tell you right now?',
    20,
    15
  );

  -- Day 5: Meditation
  INSERT INTO shadow_work_exercises (week_id, day_number, exercise_type, title, title_en, description, description_en, instructions, instructions_en, duration_minutes, xp_reward)
  VALUES (
    week1_id,
    5,
    'meditation',
    'Дыхание и тело',
    'Breath and Body',
    'Медитация осознанного дыхания с фокусом на телесных ощущениях.',
    'Mindful breathing meditation focused on body sensations.',
    E'1. Сядьте удобно, спина прямая\n2. Закройте глаза\n3. Дышите естественно\n\n4. Направьте внимание на:\n   - Ощущение воздуха в ноздрях (2 мин)\n   - Движение груди при дыхании (2 мин)\n   - Движение живота (2 мин)\n   - Всё тело как единое целое (4 мин)\n\n5. Когда мысли уводят — мягко возвращайтесь к телу\n\n6. Завершите тремя глубокими вдохами',
    E'1. Sit comfortably, back straight\n2. Close your eyes\n3. Breathe naturally\n\n4. Direct attention to:\n   - Sensation of air in nostrils (2 min)\n   - Chest movement while breathing (2 min)\n   - Belly movement (2 min)\n   - Whole body as unity (4 min)\n\n5. When thoughts lead away — gently return to body\n\n6. End with three deep breaths',
    15,
    10
  );

  -- Day 6: Action
  INSERT INTO shadow_work_exercises (week_id, day_number, exercise_type, title, title_en, description, description_en, instructions, instructions_en, duration_minutes, xp_reward)
  VALUES (
    week1_id,
    6,
    'action',
    'Прогулка осознанности',
    'Mindful Walk',
    'Первый шаг к интеграции Se — осознанная прогулка.',
    'First step toward Se integration — a mindful walk.',
    E'Выйдите на 15-минутную прогулку с особым фокусом:\n\n1. Первые 5 минут: фокус на ОЩУЩЕНИЯХ\n   - Как ноги касаются земли?\n   - Какова температура воздуха?\n   - Что чувствует кожа?\n\n2. Следующие 5 минут: фокус на ВИДЕНИИ\n   - Замечайте цвета, формы, движение\n   - Смотрите как художник, не как аналитик\n\n3. Последние 5 минут: фокус на ЗВУКАХ\n   - Что вы слышите вблизи? Вдали?\n   - Какие звуки приятны?\n\nЗапишите 3 открытия после прогулки.',
    E'Go for a 15-minute walk with special focus:\n\n1. First 5 minutes: focus on SENSATIONS\n   - How do feet touch the ground?\n   - What is the air temperature?\n   - What does skin feel?\n\n2. Next 5 minutes: focus on SEEING\n   - Notice colors, shapes, movement\n   - Look like an artist, not analyst\n\n3. Last 5 minutes: focus on SOUNDS\n   - What do you hear nearby? Far away?\n   - Which sounds are pleasant?\n\nWrite down 3 discoveries after the walk.',
    20,
    15
  );

  -- Day 7: Reflection (weekly review)
  INSERT INTO shadow_work_exercises (week_id, day_number, exercise_type, title, title_en, description, description_en, instructions, instructions_en, duration_minutes, xp_reward)
  VALUES (
    week1_id,
    7,
    'reflection',
    'Недельный обзор',
    'Weekly Review',
    'Подведение итогов первой недели и планирование следующей.',
    'Summary of first week and planning for the next.',
    E'Ответьте на вопросы в дневнике:\n\n1. ОСОЗНАНИЕ:\n   - Что нового я узнал о своём отношении к телу?\n   - Какие паттерны избегания я заметил?\n\n2. ПРАКТИКА:\n   - Какое упражнение было самым полезным?\n   - Какое вызвало наибольшее сопротивление?\n\n3. ИНСАЙТЫ:\n   - Какой главный инсайт этой недели?\n   - Что удивило меня?\n\n4. НАМЕРЕНИЕ:\n   - Что я хочу продолжить делать?\n   - Что я готов попробовать на следующей неделе?',
    E'Answer questions in your journal:\n\n1. AWARENESS:\n   - What new did I learn about my relationship with my body?\n   - What avoidance patterns did I notice?\n\n2. PRACTICE:\n   - Which exercise was most useful?\n   - Which caused the most resistance?\n\n3. INSIGHTS:\n   - What is the main insight of this week?\n   - What surprised me?\n\n4. INTENTION:\n   - What do I want to continue doing?\n   - What am I ready to try next week?',
    25,
    20
  );
END $$;
