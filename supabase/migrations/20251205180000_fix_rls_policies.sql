-- Удаляем проблемные политики
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Managers can view team profiles" ON profiles;

-- Создаём простые политики без рекурсии
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Политика для вставки (триггер использует SECURITY DEFINER)
CREATE POLICY "Allow insert for authenticated"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Для админов/менеджеров - используем service role или отдельную таблицу ролей
-- Пока упростим - разрешим всем аутентифицированным видеть все профили
CREATE POLICY "Authenticated can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);
