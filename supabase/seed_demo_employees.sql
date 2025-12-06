-- Demo Employees for Otrar Travel (Star Wars theme)
-- Date: 2025-12-06

INSERT INTO public.profiles (id, email, full_name, role, department, job_title, mbti_type, mbti_verified)
VALUES
  -- Руководство
  (gen_random_uuid(), 'leia.organa@otrar.kz', 'Лея Органа', 'executive', 'Руководство', 'Исполнительный директор', 'ENTJ', true),

  -- Менеджеры
  (gen_random_uuid(), 'luke.skywalker@otrar.kz', 'Люк Скайуокер', 'manager', 'Корпоративные продажи', 'Руководитель отдела продаж', 'ENFJ', true),
  (gen_random_uuid(), 'obiwan.kenobi@otrar.kz', 'Оби-Ван Кеноби', 'manager', 'HR', 'HR-директор', 'INFJ', true),
  (gen_random_uuid(), 'mace.windu@otrar.kz', 'Мейс Винду', 'manager', 'Операции', 'Руководитель операций', 'ISTJ', true),

  -- MICE отдел
  (gen_random_uuid(), 'han.solo@otrar.kz', 'Хан Соло', 'employee', 'MICE', 'Менеджер по MICE', 'ESTP', true),
  (gen_random_uuid(), 'rey.skywalker@otrar.kz', 'Рей Скайуокер', 'employee', 'MICE', 'Координатор мероприятий', 'INFP', true),

  -- Корпоративные продажи
  (gen_random_uuid(), 'ahsoka.tano@otrar.kz', 'Асока Тано', 'employee', 'Корпоративные продажи', 'Менеджер по продажам', 'ESFP', true),
  (gen_random_uuid(), 'poe.dameron@otrar.kz', 'По Дэмерон', 'employee', 'Корпоративные продажи', 'Аккаунт-менеджер', 'ENTP', true),

  -- Маркетинг
  (gen_random_uuid(), 'padme.amidala@otrar.kz', 'Падме Амидала', 'employee', 'Маркетинг', 'Маркетолог', 'ENFP', true),
  (gen_random_uuid(), 'finn@otrar.kz', 'Финн', 'employee', 'Маркетинг', 'SMM-менеджер', 'ESFJ', true),

  -- IT отдел
  (gen_random_uuid(), 'anakin.skywalker@otrar.kz', 'Анакин Скайуокер', 'employee', 'IT', 'Системный администратор', 'ISTP', true),
  (gen_random_uuid(), 'kylo.ren@otrar.kz', 'Кайло Рен', 'employee', 'IT', 'Разработчик', 'INTJ', true),

  -- Операции
  (gen_random_uuid(), 'chewbacca@otrar.kz', 'Чубакка', 'employee', 'Операции', 'Логист', 'ISFP', true),
  (gen_random_uuid(), 'din.djarin@otrar.kz', 'Дин Джарин', 'employee', 'Операции', 'Менеджер по визовой поддержке', 'ISFJ', true),

  -- Финансы
  (gen_random_uuid(), 'yoda@otrar.kz', 'Йода', 'employee', 'Финансы', 'Финансовый аналитик', 'INTP', true)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  job_title = EXCLUDED.job_title,
  mbti_type = EXCLUDED.mbti_type,
  mbti_verified = EXCLUDED.mbti_verified;
