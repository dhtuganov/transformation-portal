# Otrar Transformation Portal

Платформа для управления трансформацией и развития сотрудников Otrar Travel.

## Функциональность

- **Аутентификация**: Email/Password + Google OAuth через Supabase
- **MBTI-профили**: Отображение психотипов сотрудников с когнитивными функциями
- **Библиотека обучения**: MDX-контент с фильтрацией по MBTI-типу
- **Dashboard руководителя**: Карта психотипов команды, прогресс обучения

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Hosting**: Netlify
- **Content**: MDX files

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Выполните SQL из `supabase/migrations/001_initial_schema.sql`
3. Настройте Google OAuth в Authentication > Providers

### 3. Переменные окружения

Скопируйте `.env.example` в `.env.local` и заполните:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Запуск

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## Роли пользователей

| Роль | Доступ |
|------|--------|
| employee | Профиль, обучение |
| manager | + Dashboard команды |
| executive | + Все сотрудники |
| admin | + Управление контентом |

## Лицензия

Proprietary - Otrar Travel / Neurostorm LLP
