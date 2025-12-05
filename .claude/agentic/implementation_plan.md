# Implementation Plan: Otrar Transformation Portal MVP

**Version:** 1.0
**Status:** AWAITING APPROVAL
**Author:** Claude Code

---

## Executive Summary

Этот план описывает поэтапную разработку MVP Transformation Portal для Otrar Travel. MVP включает аутентификацию, MBTI-профили, библиотеку обучения и базовый dashboard руководителя.

---

## Phase 1: Infrastructure Setup

### 1.1 Initialize Project

```bash
npx create-next-app@latest otrar-transformation-portal \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### 1.2 Install Dependencies

```bash
# UI Components
npx shadcn@latest init
npx shadcn@latest add button card input label avatar badge tabs
npx shadcn@latest add dialog dropdown-menu navigation-menu separator
npx shadcn@latest add progress skeleton toast

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# MDX
npm install next-mdx-remote gray-matter

# Charts (for dashboard)
npm install recharts

# Utils
npm install clsx tailwind-merge lucide-react
```

### 1.3 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (home dashboard)
│   │   ├── profile/page.tsx
│   │   ├── learning/
│   │   │   ├── page.tsx (library)
│   │   │   └── [slug]/page.tsx (article)
│   │   └── team/page.tsx (manager only)
│   ├── api/
│   │   └── auth/callback/route.ts
│   ├── layout.tsx
│   └── page.tsx (landing/redirect)
├── components/
│   ├── ui/ (shadcn components)
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── mbti/
│   │   ├── TypeBadge.tsx
│   │   ├── TypeCard.tsx
│   │   └── TeamChart.tsx
│   ├── learning/
│   │   ├── ContentCard.tsx
│   │   ├── ContentGrid.tsx
│   │   └── ProgressBar.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── dashboard/
│       └── StatCard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── mdx/
│   │   └── content.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   └── useProfile.ts
├── types/
│   ├── database.ts
│   └── content.ts
└── content/
    └── articles/
        └── mbti/
            └── introduction.mdx
```

### 1.4 Supabase Setup

**Database Schema (SQL Migration):**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'executive', 'admin')),
  department TEXT,
  branch TEXT,
  mbti_type TEXT CHECK (mbti_type IS NULL OR mbti_type ~ '^[EI][SN][TF][JP]$'),
  mbti_verified BOOLEAN DEFAULT false,
  job_title TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MBTI profiles (detailed)
CREATE TABLE public.mbti_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mbti_type TEXT NOT NULL CHECK (mbti_type ~ '^[EI][SN][TF][JP]$'),
  dominant_function TEXT,
  auxiliary_function TEXT,
  tertiary_function TEXT,
  inferior_function TEXT,
  strengths JSONB DEFAULT '[]',
  growth_areas JSONB DEFAULT '[]',
  communication_style JSONB DEFAULT '{}',
  assessed_by TEXT,
  assessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content metadata
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT DEFAULT 'article' CHECK (content_type IN ('article', 'video', 'test', 'document', 'checklist')),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  mbti_types TEXT[] DEFAULT '{}',
  roles TEXT[] DEFAULT '{}',
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER,
  author TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning progress
CREATE TABLE public.learning_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percent INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER DEFAULT 0,
  UNIQUE(user_id, content_id)
);

-- Teams
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  branch TEXT,
  manager_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members
CREATE TABLE public.team_members (
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mbti_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Managers can view team profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = profiles.id
      AND t.manager_id = auth.uid()
    )
  );

CREATE POLICY "Admins can do everything"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'executive')
    )
  );

-- RLS Policies for content (public read for published)
CREATE POLICY "Anyone can view published content"
  ON public.content FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can manage content"
  ON public.content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for learning_progress
CREATE POLICY "Users can manage own progress"
  ON public.learning_progress FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can view team progress"
  ON public.learning_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = learning_progress.user_id
      AND t.manager_id = auth.uid()
    )
  );
```

### 1.5 Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Phase 2: Authentication

### 2.1 Supabase Client Setup

**lib/supabase/client.ts:**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**lib/supabase/server.ts:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

### 2.2 Middleware for Protected Routes

**middleware.ts:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged in users from auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### 2.3 Login/Register Pages

Login and registration forms with:
- Email/Password fields
- Google OAuth button
- Error handling
- Loading states
- Redirect after success

---

## Phase 3: User Profiles

### 3.1 Profile Page Components

**MBTI Type Badge with Colors:**
```typescript
const MBTI_COLORS = {
  // Analysts (NT) - Purple
  INTJ: '#7C3AED', INTP: '#7C3AED', ENTJ: '#7C3AED', ENTP: '#7C3AED',
  // Diplomats (NF) - Green
  INFJ: '#10B981', INFP: '#10B981', ENFJ: '#10B981', ENFP: '#10B981',
  // Sentinels (SJ) - Blue
  ISTJ: '#3B82F6', ISFJ: '#3B82F6', ESTJ: '#3B82F6', ESFJ: '#3B82F6',
  // Explorers (SP) - Orange
  ISTP: '#F97316', ISFP: '#F97316', ESTP: '#F97316', ESFP: '#F97316',
}
```

### 3.2 Profile Data Fetching

Server component to fetch profile data and MBTI details from Supabase.

---

## Phase 4: Learning Library

### 4.1 MDX Content Structure

**content/articles/mbti/introduction.mdx:**
```mdx
---
title: "Введение в MBTI"
description: "Что такое MBTI и как это помогает в работе"
author: "Зарина Сатубалдина"
date: "2025-12-01"
category: "mbti"
tags: ["MBTI", "введение", "психотипы"]
mbti_types: []
roles: ["all"]
difficulty: "beginner"
duration: 10
published: true
---

# Введение в MBTI

Myers-Briggs Type Indicator (MBTI) — это инструмент для понимания различий в том, как люди воспринимают мир и принимают решения...
```

### 4.2 Content Processing

Using `next-mdx-remote` for rendering MDX with custom components.

### 4.3 Progress Tracking

- Track when user starts reading
- Mark as completed when scrolled to bottom or manually
- Store progress in Supabase

---

## Phase 5: Manager Dashboard

### 5.1 Team MBTI Chart

Using Recharts for pie/bar chart of team MBTI distribution:
- Color-coded by temperament
- Interactive hover
- Click to filter

### 5.2 Team Learning Progress

Table/grid showing:
- Team member name
- MBTI type
- Learning progress %
- Last active

---

## Phase 6: Deployment

### 6.1 Netlify Configuration

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 6.2 Environment Variables in Netlify

Configure in Netlify dashboard:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SITE_URL

---

## Implementation Order

1. **Phase 1.1-1.3:** Project setup, dependencies, structure
2. **Phase 1.4:** Supabase schema (can be done in parallel)
3. **Phase 2:** Authentication (blocking for all features)
4. **Phase 3:** Profile page (simple, demonstrates auth working)
5. **Phase 4:** Learning library (core feature)
6. **Phase 5:** Manager dashboard (requires test data)
7. **Phase 6:** Deployment and polish

---

## Estimated LOC

| Component | Files | Est. Lines |
|-----------|-------|------------|
| Infrastructure | 10 | 300 |
| Auth | 8 | 400 |
| Profiles | 6 | 350 |
| Learning | 12 | 600 |
| Dashboard | 6 | 400 |
| Shared/Utils | 8 | 250 |
| **Total** | **50** | **~2,300** |

---

## Approval Required

Before starting implementation, please confirm:

1. **Tech stack OK?** (Next.js 15 + Supabase + Netlify)
2. **Feature scope OK?** (Auth, Profiles, Learning, Basic Dashboard)
3. **Database schema OK?** (as described above)
4. **Ready to proceed with Phase 1?**

---

**Status:** AWAITING APPROVAL
