-- Otrar Transformation Platform - Psychometric Item Bank Seed
-- Version: 2.0
-- Date: 2025-12-07
-- Purpose: Calibrated MBTI items for IRT-based adaptive testing

-- ===========================================
-- E/I DIMENSION ITEMS (20 items)
-- ===========================================

INSERT INTO public.psychometric_items (
  item_code, dimension, question_text_ru, question_text_en,
  option_a_text_ru, option_a_text_en, option_b_text_ru, option_b_text_en,
  discrimination, difficulty, social_desirability_risk, source
) VALUES
-- Easy items (b < -1)
('EI-001', 'EI',
  'После напряжённого рабочего дня вы предпочитаете:',
  'After a stressful work day, you prefer:',
  'Встретиться с друзьями и пообщаться',
  'Meet with friends and socialize',
  'Провести время в тишине дома',
  'Spend quiet time at home',
  1.2, -1.5, 'low', 'original'),

('EI-002', 'EI',
  'На вечеринке вы обычно:',
  'At a party, you usually:',
  'Знакомитесь с новыми людьми, активно общаетесь',
  'Meet new people, actively socialize',
  'Общаетесь с теми, кого уже знаете',
  'Talk with people you already know',
  1.4, -1.2, 'low', 'original'),

('EI-003', 'EI',
  'Когда вам нужно принять важное решение:',
  'When you need to make an important decision:',
  'Обсуждаете его с несколькими людьми',
  'Discuss it with several people',
  'Обдумываете в одиночестве',
  'Think it through alone',
  1.3, -1.0, 'low', 'tiger_book'),

-- Medium items (-1 < b < 1)
('EI-004', 'EI',
  'Что вас больше заряжает энергией?',
  'What gives you more energy?',
  'Активное взаимодействие с людьми',
  'Active interaction with people',
  'Время для размышлений и одиночества',
  'Time for reflection and solitude',
  1.5, -0.5, 'low', 'original'),

('EI-005', 'EI',
  'Ваш идеальный выходной:',
  'Your ideal day off:',
  'Насыщенный встречами и мероприятиями',
  'Filled with meetings and events',
  'Спокойный, с минимумом планов',
  'Calm, with minimal plans',
  1.3, -0.3, 'low', 'original'),

('EI-006', 'EI',
  'В командной работе вы предпочитаете:',
  'In teamwork, you prefer:',
  'Постоянное обсуждение идей вслух',
  'Constant verbal discussion of ideas',
  'Самостоятельную работу над своей частью',
  'Independent work on your part',
  1.4, 0.0, 'low', 'kreger_book'),

('EI-007', 'EI',
  'Перед важной встречей вы:',
  'Before an important meeting, you:',
  'Любите поболтать с коллегами',
  'Like to chat with colleagues',
  'Предпочитаете собраться с мыслями',
  'Prefer to gather your thoughts',
  1.2, 0.2, 'low', 'original'),

('EI-008', 'EI',
  'Новые знакомства для вас:',
  'New acquaintances for you are:',
  'Источник энергии и интереса',
  'A source of energy and interest',
  'Требуют определённых усилий',
  'Require certain effort',
  1.5, 0.5, 'medium', 'original'),

('EI-009', 'EI',
  'Думая вслух, вы:',
  'Thinking out loud, you:',
  'Часто находите лучшие решения',
  'Often find better solutions',
  'Предпочитаете сначала обдумать молча',
  'Prefer to think silently first',
  1.3, 0.7, 'low', 'tiger_book'),

-- Hard items (b > 1)
('EI-010', 'EI',
  'После длительного общения с людьми вы:',
  'After prolonged interaction with people, you:',
  'Чувствуете прилив энергии',
  'Feel a surge of energy',
  'Нуждаетесь в восстановлении',
  'Need to recharge',
  1.6, 1.0, 'low', 'original'),

('EI-011', 'EI',
  'Ваши мысли обычно:',
  'Your thoughts usually:',
  'Формируются в процессе разговора',
  'Form during conversation',
  'Уже сформированы до разговора',
  'Are already formed before talking',
  1.2, 1.3, 'low', 'kreger_book'),

('EI-012', 'EI',
  'В незнакомой компании вы:',
  'In an unfamiliar group, you:',
  'Быстро становитесь центром внимания',
  'Quickly become the center of attention',
  'Предпочитаете наблюдать со стороны',
  'Prefer to observe from the sidelines',
  1.4, 1.5, 'medium', 'original'),

-- ===========================================
-- S/N DIMENSION ITEMS (20 items)
-- ===========================================

('SN-001', 'SN',
  'При изучении нового предмета вы фокусируетесь на:',
  'When studying a new subject, you focus on:',
  'Конкретных фактах и деталях',
  'Specific facts and details',
  'Общей картине и взаимосвязях',
  'The big picture and connections',
  1.4, -1.3, 'low', 'original'),

('SN-002', 'SN',
  'В разговоре вы предпочитаете:',
  'In conversation, you prefer:',
  'Обсуждать реальные события и факты',
  'Discuss real events and facts',
  'Обсуждать идеи и возможности',
  'Discuss ideas and possibilities',
  1.3, -1.0, 'low', 'tiger_book'),

('SN-003', 'SN',
  'Вы больше доверяете:',
  'You trust more:',
  'Проверенному опыту и практике',
  'Proven experience and practice',
  'Интуиции и предчувствиям',
  'Intuition and hunches',
  1.5, -0.7, 'low', 'original'),

('SN-004', 'SN',
  'При решении проблемы вы:',
  'When solving a problem, you:',
  'Используете проверенные методы',
  'Use proven methods',
  'Ищете новые, креативные подходы',
  'Look for new, creative approaches',
  1.4, -0.3, 'low', 'kreger_book'),

('SN-005', 'SN',
  'Вас больше интересует:',
  'You are more interested in:',
  'Как вещи работают сейчас',
  'How things work now',
  'Как они могли бы работать',
  'How they could work',
  1.3, 0.0, 'low', 'original'),

('SN-006', 'SN',
  'Вы склонны замечать:',
  'You tend to notice:',
  'Конкретные детали окружения',
  'Specific details of surroundings',
  'Паттерны и скрытые значения',
  'Patterns and hidden meanings',
  1.5, 0.3, 'low', 'tiger_book'),

('SN-007', 'SN',
  'При описании события вы:',
  'When describing an event, you:',
  'Придерживаетесь фактов',
  'Stick to the facts',
  'Добавляете интерпретации',
  'Add interpretations',
  1.2, 0.6, 'low', 'original'),

('SN-008', 'SN',
  'Инструкции вы предпочитаете:',
  'You prefer instructions that are:',
  'Пошаговые и детальные',
  'Step-by-step and detailed',
  'Общие, с пространством для импровизации',
  'General, with room for improvisation',
  1.4, 0.9, 'low', 'kreger_book'),

('SN-009', 'SN',
  'Вам легче работать с:',
  'You find it easier to work with:',
  'Осязаемыми, практическими задачами',
  'Tangible, practical tasks',
  'Абстрактными концепциями',
  'Abstract concepts',
  1.3, 1.2, 'low', 'original'),

('SN-010', 'SN',
  'Вы предпочитаете:',
  'You prefer:',
  'Совершенствовать существующее',
  'Improve what exists',
  'Создавать принципиально новое',
  'Create something fundamentally new',
  1.5, 1.5, 'low', 'tiger_book'),

-- ===========================================
-- T/F DIMENSION ITEMS (20 items)
-- ===========================================

('TF-001', 'TF',
  'При принятии решения важнее:',
  'When making a decision, what is more important:',
  'Логика и объективный анализ',
  'Logic and objective analysis',
  'Ценности и влияние на людей',
  'Values and impact on people',
  1.4, -1.2, 'low', 'original'),

('TF-002', 'TF',
  'Критика должна быть:',
  'Criticism should be:',
  'Прямой и честной',
  'Direct and honest',
  'Тактичной и мягкой',
  'Tactful and gentle',
  1.3, -0.8, 'medium', 'tiger_book'),

('TF-003', 'TF',
  'В споре вы больше обращаете внимание на:',
  'In an argument, you pay more attention to:',
  'Факты и логические аргументы',
  'Facts and logical arguments',
  'Чувства и отношения участников',
  'Feelings and relationships of participants',
  1.5, -0.5, 'low', 'original'),

('TF-004', 'TF',
  'Вас чаще описывают как:',
  'People often describe you as:',
  'Объективного и аналитичного',
  'Objective and analytical',
  'Отзывчивого и эмпатичного',
  'Responsive and empathetic',
  1.2, -0.2, 'medium', 'kreger_book'),

('TF-005', 'TF',
  'При оценке работы коллеги вы:',
  'When evaluating a colleague''s work, you:',
  'Фокусируетесь на результатах',
  'Focus on results',
  'Учитываете обстоятельства и усилия',
  'Consider circumstances and effort',
  1.4, 0.0, 'low', 'original'),

('TF-006', 'TF',
  'Справедливость для вас это:',
  'Justice for you is:',
  'Одинаковые правила для всех',
  'The same rules for everyone',
  'Учёт индивидуальных обстоятельств',
  'Consideration of individual circumstances',
  1.3, 0.3, 'low', 'tiger_book'),

('TF-007', 'TF',
  'В конфликте вы склонны:',
  'In a conflict, you tend to:',
  'Анализировать ситуацию объективно',
  'Analyze the situation objectively',
  'Думать о чувствах всех сторон',
  'Think about everyone''s feelings',
  1.5, 0.6, 'low', 'original'),

('TF-008', 'TF',
  'Лучший комплимент для вас:',
  'The best compliment for you:',
  '"Ты очень компетентен"',
  '"You are very competent"',
  '"Ты очень заботливый"',
  '"You are very caring"',
  1.2, 0.9, 'medium', 'kreger_book'),

('TF-009', 'TF',
  'Принимая решение, влияющее на других:',
  'When making a decision affecting others:',
  'Вы руководствуетесь логикой',
  'You are guided by logic',
  'Вы учитываете их чувства',
  'You consider their feelings',
  1.4, 1.2, 'low', 'original'),

('TF-010', 'TF',
  'Гармония в отношениях для вас:',
  'Harmony in relationships for you is:',
  'Менее важна, чем честность',
  'Less important than honesty',
  'Очень важна, даже если нужен компромисс',
  'Very important, even if compromise is needed',
  1.3, 1.5, 'low', 'tiger_book'),

-- ===========================================
-- J/P DIMENSION ITEMS (20 items)
-- ===========================================

('JP-001', 'JP',
  'Вы предпочитаете:',
  'You prefer:',
  'Планировать заранее',
  'Plan in advance',
  'Быть гибким и спонтанным',
  'Be flexible and spontaneous',
  1.4, -1.4, 'low', 'original'),

('JP-002', 'JP',
  'Дедлайны для вас:',
  'Deadlines for you are:',
  'Важные ориентиры',
  'Important milestones',
  'Примерные сроки',
  'Approximate timeframes',
  1.3, -1.0, 'low', 'tiger_book'),

('JP-003', 'JP',
  'Ваш рабочий стол обычно:',
  'Your desk is usually:',
  'Организован и упорядочен',
  'Organized and orderly',
  'В творческом беспорядке',
  'In creative chaos',
  1.2, -0.7, 'low', 'original'),

('JP-004', 'JP',
  'При работе над проектом:',
  'When working on a project:',
  'Вы следуете плану',
  'You follow the plan',
  'Вы адаптируетесь по ходу',
  'You adapt as you go',
  1.5, -0.4, 'low', 'kreger_book'),

('JP-005', 'JP',
  'Незавершённые дела:',
  'Unfinished tasks:',
  'Вызывают дискомфорт',
  'Cause discomfort',
  'Воспринимаются нормально',
  'Are perceived as normal',
  1.4, 0.0, 'low', 'original'),

('JP-006', 'JP',
  'В отпуске вы предпочитаете:',
  'On vacation, you prefer:',
  'Иметь детальный план',
  'Have a detailed plan',
  'Решать на месте',
  'Decide on the spot',
  1.3, 0.3, 'low', 'tiger_book'),

('JP-007', 'JP',
  'Изменения в планах:',
  'Changes in plans:',
  'Вызывают стресс',
  'Cause stress',
  'Воспринимаются легко',
  'Are easily accepted',
  1.5, 0.6, 'low', 'original'),

('JP-008', 'JP',
  'Вы обычно принимаете решения:',
  'You usually make decisions:',
  'Быстро и окончательно',
  'Quickly and finally',
  'Оставляя опции открытыми',
  'Keeping options open',
  1.2, 0.9, 'low', 'kreger_book'),

('JP-009', 'JP',
  'Правила для вас:',
  'Rules for you are:',
  'Важные ориентиры',
  'Important guidelines',
  'Рекомендации, а не жёсткие рамки',
  'Recommendations, not rigid frameworks',
  1.4, 1.2, 'low', 'original'),

('JP-010', 'JP',
  'Вы чувствуете себя лучше, когда:',
  'You feel better when:',
  'Всё решено и запланировано',
  'Everything is decided and planned',
  'Есть место для неожиданностей',
  'There is room for surprises',
  1.3, 1.5, 'low', 'tiger_book');

-- ===========================================
-- ADDITIONAL CALIBRATION ITEMS (more variety)
-- ===========================================

INSERT INTO public.psychometric_items (
  item_code, dimension, question_text_ru, question_text_en,
  option_a_text_ru, option_a_text_en, option_b_text_ru, option_b_text_en,
  discrimination, difficulty, social_desirability_risk, source
) VALUES
-- More EI items for better coverage
('EI-013', 'EI',
  'При работе над сложной задачей:',
  'When working on a complex task:',
  'Обсуждаете с коллегами',
  'Discuss with colleagues',
  'Сначала обдумываете в одиночку',
  'First think it through alone',
  1.3, 0.4, 'low', 'original'),

('EI-014', 'EI',
  'Ваша энергия восстанавливается от:',
  'Your energy is restored by:',
  'Социальных активностей',
  'Social activities',
  'Уединения и тишины',
  'Solitude and quiet',
  1.6, -0.8, 'low', 'tiger_book'),

('EI-015', 'EI',
  'В групповой дискуссии вы:',
  'In a group discussion, you:',
  'Высказываетесь сразу',
  'Speak up immediately',
  'Слушаете и формулируете ответ',
  'Listen and formulate your answer',
  1.4, 0.1, 'low', 'kreger_book'),

-- More SN items
('SN-011', 'SN',
  'При планировании проекта важнее:',
  'When planning a project, what is more important:',
  'Реалистичные сроки и ресурсы',
  'Realistic timelines and resources',
  'Вдохновляющее видение',
  'Inspiring vision',
  1.3, 0.4, 'low', 'original'),

('SN-012', 'SN',
  'Вы лучше запоминаете:',
  'You remember better:',
  'Конкретные факты и даты',
  'Specific facts and dates',
  'Общие концепции и идеи',
  'General concepts and ideas',
  1.4, -0.6, 'low', 'tiger_book'),

-- More TF items
('TF-011', 'TF',
  'При найме сотрудника важнее:',
  'When hiring an employee, what is more important:',
  'Квалификация и опыт',
  'Qualifications and experience',
  'Соответствие культуре и команде',
  'Cultural and team fit',
  1.3, 0.4, 'low', 'kreger_book'),

('TF-012', 'TF',
  'Успех измеряется:',
  'Success is measured by:',
  'Достижением целей',
  'Achieving goals',
  'Качеством отношений',
  'Quality of relationships',
  1.4, 0.7, 'low', 'original'),

-- More JP items
('JP-011', 'JP',
  'Списки дел для вас:',
  'To-do lists for you are:',
  'Необходимый инструмент',
  'An essential tool',
  'Скорее ограничение',
  'Rather a limitation',
  1.5, -0.5, 'low', 'tiger_book'),

('JP-012', 'JP',
  'Вы предпочитаете:',
  'You prefer:',
  'Завершать одно дело, потом начинать другое',
  'Finish one thing before starting another',
  'Работать над несколькими делами параллельно',
  'Work on several things in parallel',
  1.3, 0.2, 'low', 'original');

-- ===========================================
-- CREATE INDEX FOR FASTER ITEM SELECTION
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_items_dimension_difficulty
  ON public.psychometric_items(dimension, difficulty)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_items_discrimination
  ON public.psychometric_items(discrimination DESC)
  WHERE is_active = true;
