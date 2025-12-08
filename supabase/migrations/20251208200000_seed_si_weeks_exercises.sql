-- Add weeks for Si Integration Program
DO $$
DECLARE
  si_program_id UUID;
BEGIN
  SELECT id INTO si_program_id FROM shadow_work_programs WHERE slug = 'si-integration';

  -- Week 1: Awareness
  INSERT INTO shadow_work_weeks (program_id, week_number, title, title_en, description, description_en, theme, learning_objectives)
  VALUES (
    si_program_id,
    1,
    'Осознание: Мой хаос',
    'Awareness: My Chaos',
    'Первая неделя посвящена осознанию того, как часто мы игнорируем детали, рутину и уроки прошлого. Замечаем паттерны избегания Si.',
    'First week focuses on awareness of how often we ignore details, routine and lessons from the past. Notice Si avoidance patterns.',
    'awareness',
    ARRAY['Осознать своё отношение к деталям и рутине', 'Заметить паттерны избегания Si', 'Начать вести дневник наблюдений']
  );

  -- Week 2: Recognition
  INSERT INTO shadow_work_weeks (program_id, week_number, title, title_en, description, description_en, theme, learning_objectives)
  VALUES (
    si_program_id,
    2,
    'Распознавание: Триггеры непоследовательности',
    'Recognition: Inconsistency Triggers',
    'Учимся распознавать ситуации, когда подчинённая Si активируется негативно через забывчивость и хаос.',
    'Learning to recognize situations when inferior Si activates negatively through forgetfulness and chaos.',
    'recognition',
    ARRAY['Идентифицировать триггеры хаоса', 'Распознавать признаки активации Si', 'Понять своё сопротивление рутине']
  );

  -- Week 3-8
  INSERT INTO shadow_work_weeks (program_id, week_number, title, title_en, description, description_en, theme, learning_objectives)
  VALUES
    (si_program_id, 3, 'Распознавание: Память как ресурс', 'Recognition: Memory as Resource', 'Продолжаем работу с распознаванием, начинаем ценить опыт прошлого.', 'Continue recognition work, begin valuing past experience.', 'recognition', ARRAY['Ценить уроки прошлого', 'Найти полезные паттерны', 'Развить внимание к деталям']),
    (si_program_id, 4, 'Интеграция: Первые шаги', 'Integration: First Steps', 'Начинаем осторожно интегрировать Si через небольшие ежедневные практики.', 'Begin carefully integrating Si through small daily practices.', 'integration', ARRAY['Практиковать микро-рутины', 'Вести простой трекер', 'Замечать детали']),
    (si_program_id, 5, 'Интеграция: Создание структуры', 'Integration: Creating Structure', 'Постепенно создаём структуру и последовательность в жизни.', 'Gradually create structure and consistency in life.', 'integration', ARRAY['Создать устойчивую рутину', 'Практиковать последовательность', 'Ценить стабильность']),
    (si_program_id, 6, 'Интеграция: Закрепление', 'Integration: Consolidation', 'Закрепляем успешные практики. Учимся использовать Si как ресурс.', 'Consolidate successful practices. Learn to use Si as resource.', 'integration', ARRAY['Укрепить полезные привычки', 'Использовать Si для заземления', 'Интегрировать прошлый опыт']),
    (si_program_id, 7, 'Мастерство: Танец Ne-Si', 'Mastery: The Ne-Si Dance', 'Учимся балансировать между доминантной Ne и развивающейся Si.', 'Learn to balance between dominant Ne and developing Si.', 'mastery', ARRAY['Интегрировать Si с Ne', 'Использовать Si для реализации идей', 'Найти свой баланс']),
    (si_program_id, 8, 'Мастерство: Путь продолжается', 'Mastery: The Journey Continues', 'Завершаем программу, создаём план для дальнейшего развития Si.', 'Complete the program, create plan for continued Si development.', 'mastery', ARRAY['Оценить прогресс', 'Создать план развития', 'Отпраздновать достижения']);
END $$;

-- Add exercises for Week 1 of Si Integration
DO $$
DECLARE
  week1_id UUID;
BEGIN
  SELECT sw.id INTO week1_id
  FROM shadow_work_weeks sw
  JOIN shadow_work_programs sp ON sw.program_id = sp.id
  WHERE sp.slug = 'si-integration' AND sw.week_number = 1;

  INSERT INTO shadow_work_exercises (week_id, day_number, exercise_type, title, title_en, description, description_en, instructions, instructions_en, duration_minutes, xp_reward)
  VALUES
    (week1_id, 1, 'reflection', 'Мои отношения с рутиной', 'My Relationship with Routine', 'Исследуем ваше текущее отношение к стабильности и деталям.', 'Explore your current relationship with stability and details.', E'1. Найдите тихое место\n2. Запишите в дневник:\n   - Как вы относитесь к рутине?\n   - Что вы чувствуете при слове "расписание"?\n   - Как часто вы забываете детали?', E'1. Find a quiet place\n2. Write in journal:\n   - How do you feel about routine?\n   - What do you feel at the word "schedule"?\n   - How often do you forget details?', 20, 15),
    (week1_id, 2, 'observation', 'Наблюдение за хаосом', 'Observing Chaos', 'Замечаем моменты, когда избегаем структуры.', 'Notice moments when we avoid structure.', E'Сегодня замечайте моменты когда вы:\n- Забываете важные детали\n- Избегаете рутинных задач\n- Начинаете новое, не закончив старое\n\nВечером запишите 3-5 таких моментов.', E'Today notice moments when you:\n- Forget important details\n- Avoid routine tasks\n- Start new things without finishing old\n\nWrite down 3-5 such moments.', 15, 10),
    (week1_id, 3, 'practice', 'Микро-рутина', 'Micro-routine', 'Практика создания маленькой стабильной рутины.', 'Practice creating a small stable routine.', E'Выберите ОДНУ маленькую рутину на сегодня:\n- Утренний стакан воды в одно время\n- Запись 3 благодарностей вечером\n- Проверка календаря в 9:00\n\nВыполните её и отметьте ощущения.', E'Choose ONE small routine for today:\n- Morning glass of water at same time\n- Write 3 gratitudes in evening\n- Check calendar at 9:00\n\nDo it and note your feelings.', 15, 10),
    (week1_id, 4, 'journaling', 'История моей непоследовательности', 'History of My Inconsistency', 'Глубокое исследование паттернов незавершённости.', 'Deep exploration of incompletion patterns.', E'Напишите свободным потоком:\n1. Вспомните проекты которые не довели до конца. Почему?\n2. Когда рутина казалась "тюрьмой"?\n3. Какие уроки прошлого вы игнорируете?\n4. Что бы сказала ваша "внутренняя Si"?', E'Write in free flow:\n1. Remember projects you didnt finish. Why?\n2. When did routine feel like "prison"?\n3. What past lessons do you ignore?\n4. What would your "inner Si" say?', 20, 15),
    (week1_id, 5, 'meditation', 'Заземление в настоящем', 'Grounding in Present', 'Медитация осознанности с фокусом на стабильности.', 'Mindfulness meditation focused on stability.', E'1. Сядьте удобно\n2. Закройте глаза\n3. Почувствуйте опору под собой (2 мин)\n4. Вспомните что-то стабильное в жизни (3 мин)\n5. Благодарность за постоянство (3 мин)\n6. Три глубоких вдоха', E'1. Sit comfortably\n2. Close eyes\n3. Feel support beneath you (2 min)\n4. Remember something stable in life (3 min)\n5. Gratitude for consistency (3 min)\n6. Three deep breaths', 15, 10),
    (week1_id, 6, 'action', 'День одной задачи', 'One Task Day', 'Практика доведения одного дела до конца.', 'Practice finishing one thing completely.', E'Сегодня выберите ОДНУ задачу и:\n1. Доведите её до полного завершения\n2. Не переключайтесь на новые идеи\n3. Отметьте чувства при завершении\n4. Запишите: что помогло? что мешало?', E'Today choose ONE task and:\n1. Complete it fully\n2. Dont switch to new ideas\n3. Note feelings upon completion\n4. Write: what helped? what hindered?', 20, 15),
    (week1_id, 7, 'reflection', 'Недельный обзор', 'Weekly Review', 'Подведение итогов первой недели.', 'Summary of first week.', E'Ответьте на вопросы:\n1. Что я узнал о своём отношении к рутине?\n2. Какие паттерны хаоса заметил?\n3. Какое упражнение было полезным?\n4. Что готов попробовать на следующей неделе?', E'Answer questions:\n1. What did I learn about my relationship with routine?\n2. What chaos patterns did I notice?\n3. Which exercise was useful?\n4. What am I ready to try next week?', 25, 20);
END $$;
