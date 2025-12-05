# Task: Otrar Transformation Portal MVP

**Status:** COMPLETED
**Created:** 2025-12-04
**Priority:** High

---

## Objective

Создать MVP веб-портала трансформации для Otrar Travel с функционалом:
- Аутентификация (Email/Password + Google OAuth)
- MBTI-профили сотрудников
- Библиотека обучения с MDX-контентом
- Dashboard руководителя (карта психотипов команды)

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Auth, PostgreSQL, Storage)
- **Hosting:** Netlify
- **Content:** MDX files

## Task Breakdown

### Phase 1: Infrastructure Setup
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Configure Tailwind CSS and shadcn/ui
- [ ] Set up Supabase project and environment variables
- [ ] Configure Netlify deployment
- [ ] Create database schema (migrations)
- [ ] Set up Row Level Security policies

### Phase 2: Authentication
- [ ] Implement Supabase Auth client
- [ ] Create login page
- [ ] Create registration page
- [ ] Implement Google OAuth
- [ ] Set up protected routes middleware
- [ ] Create auth context/hooks

### Phase 3: User Profiles
- [ ] Create profile database table trigger
- [ ] Build profile page UI
- [ ] Implement MBTI type display component
- [ ] Create profile edit functionality
- [ ] Build TypeBadge component with MBTI colors

### Phase 4: Learning Library
- [ ] Set up MDX processing (contentlayer or next-mdx-remote)
- [ ] Create content directory structure
- [ ] Build ContentCard component
- [ ] Create learning page with filters
- [ ] Implement progress tracking (database)
- [ ] Build article/content page renderer
- [ ] Create MBTI-based recommendations

### Phase 5: Manager Dashboard
- [ ] Create team MBTI distribution chart (Recharts)
- [ ] Build team list with profile cards
- [ ] Implement team learning progress view
- [ ] Add role-based navigation

### Phase 6: Content & Polish
- [ ] Create initial MDX content (5-10 articles)
- [ ] Polish UI/UX
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Loading states

## Progress Log

| Date | Phase | Status | Notes |
|------|-------|--------|-------|
| 2025-12-04 | Planning | In Progress | Creating implementation plan |

## Dependencies

- Supabase account (free tier sufficient for MVP)
- Netlify account (free tier sufficient for MVP)
- GitHub repository

## Success Criteria

1. User can register/login with email or Google
2. User can view their MBTI profile
3. User can browse learning materials filtered by MBTI type
4. Manager can see team MBTI distribution chart
5. Site deployed and accessible on Netlify
