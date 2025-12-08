-- Real Executive Users for Otrar Travel
-- Date: 2025-12-08
-- Purpose: Add executive access for Aliya and Albina

-- Insert real executive profiles
INSERT INTO public.profiles (id, email, full_name, role, department, job_title, mbti_type, mbti_verified)
VALUES
  -- CEO
  (gen_random_uuid(), 'aliya@otrar.kz', 'Алия Досмухамбетова', 'executive', 'Руководство', 'Генеральный директор (CEO)', 'ESTJ', true),

  -- Office Manager (elevated to executive for strategy access)
  (gen_random_uuid(), 'albina@otrar.kz', 'Альбина Сарсенбаева', 'executive', 'Руководство', 'Офис-менеджер / Координатор трансформации', 'ISFJ', true),

  -- Admin/Consultant (David)
  (gen_random_uuid(), 'david@creata.team', 'Давид Туганов', 'admin', 'Консалтинг', 'Трансформационный консультант', 'INTJ', true)

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
