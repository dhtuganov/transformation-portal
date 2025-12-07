# CLAUDE.md - Otrar Portal

## Quick Start

**Project:** Otrar Portal - Corporate Transformation Platform
**Stack:** Next.js 15 + Supabase + Claude Haiku AI
**Parent:** [[5 Otrar Travel/CLAUDE.md]]

### Key Commands
```bash
npm run dev      # Start development server (port 3000)
npm run build    # Production build
npm run lint     # ESLint check
```

### Test Users
| Email | Password | MBTI | Role |
|-------|----------|------|------|
| test@creata.kz | test123 | INTJ | Test user |
| david@creata.team | - | ENFP | Admin |

---

## Architecture Overview

```
otrar-portal/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Protected routes
│   │   │   ├── page.tsx        # Main dashboard
│   │   │   ├── profile/        # User profile with MBTI
│   │   │   ├── test-insights/  # AI-generated insights
│   │   │   ├── articles/       # MDX content library
│   │   │   └── quiz/           # MBTI assessment
│   │   ├── auth/               # Authentication pages
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # Shadcn/ui components
│   │   ├── mbti/               # MBTI-specific components
│   │   └── layout/             # Layout components
│   ├── lib/
│   │   ├── ai/                 # Claude Haiku integration
│   │   │   ├── personalization-engine.ts
│   │   │   └── prompts.ts
│   │   ├── mbti.ts             # MBTI utilities & data
│   │   └── supabase/           # Database client
│   └── content/
│       └── articles/           # MDX content
├── supabase/
│   └── migrations/             # Database migrations
└── CLAUDE.md                   # This file
```

---

## Database Schema (Supabase)

### Core Tables
| Table | Purpose |
|-------|---------|
| `profiles` | User profiles with MBTI type |
| `quiz_results` | Assessment results history |
| `ai_usage` | AI API usage tracking |

### Key Columns in `profiles`
- `id` (UUID) - References auth.users
- `full_name` (text)
- `mbti_type` (text) - 4-letter MBTI code
- `department` (text)
- `position` (text)

---

## AI Integration (Claude Haiku)

### Configuration
```env
ANTHROPIC_API_KEY=sk-ant-...
```

### Personalization Engine
**File:** `src/lib/ai/personalization-engine.ts`

Generates type-specific content:
- Daily insights
- Practical tips
- Journal analysis
- Inferior function exercises

### Usage Tracking
- Stored in `ai_usage` table
- Quota: configurable per user/tenant

---

## MBTI Data Structures

### Core Exports (`src/lib/mbti.ts`)

```typescript
// Type names in Russian and English
export const TYPE_NAMES: Record<MBTIType, { ru: string; en: string }>

// Cognitive function stack for each type
export function getCognitiveFunctions(type: MBTIType): CognitiveFunctions

// Temperament groupings
export function getTemperament(type: MBTIType): Temperament

// NEW: Detailed function descriptions
export const COGNITIVE_FUNCTION_DESCRIPTIONS: Record<string, {
  name: string           // Full Russian name
  shortName: string      // Ni, Ne, Ti, Te, Fi, Fe, Si, Se
  description: string    // How it works
  strengths: string[]    // Key strengths
  challenges: string[]   // Common challenges
}>

// NEW: Comprehensive type descriptions
export const TYPE_DESCRIPTIONS: Record<MBTIType, {
  shortDescription: string     // One-liner
  detailedDescription: string  // Full paragraph
  workStyle: string           // Work preferences
  stressPattern: string       // Stress behavior + inferior function
  growthPath: string          // Development recommendations
}>
```

### Cognitive Functions
| Function | Name | Focus |
|----------|------|-------|
| Ni | Интровертная интуиция | Patterns, future vision |
| Ne | Экстравертная интуиция | Possibilities, connections |
| Ti | Интровертное мышление | Internal logic, analysis |
| Te | Экстравертное мышление | External systems, efficiency |
| Fi | Интровертное чувство | Values, authenticity |
| Fe | Экстравертное чувство | Harmony, social dynamics |
| Si | Интровертное ощущение | Memory, tradition |
| Se | Экстравертное ощущение | Present moment, action |

---

## Key Pages

### Dashboard (`/dashboard`)
- Stats overview (total users, tested users, articles)
- Quick actions: AI Insights, Tests, Learning, IDP, Profile, Functions, Team
- Recent activity

### Profile (`/dashboard/profile`)
**4 Tabs:**
1. **Overview** - Basic info, type badge, short description
2. **Functions** - Cognitive stack visualization with progress bars
3. **Work** - Work style preferences
4. **Growth** - Development path, stress patterns

### AI Insights (`/dashboard/test-insights`)
**4 Insight Types:**
1. **Daily** - Personalized daily insight
2. **Tip** - Practical workplace tip
3. **Journal** - Journal entry analysis
4. **Inferior** - Inferior function exercise

**Features:**
- Copy to clipboard
- Save to localStorage history (last 20)
- Quota display

### Articles (`/dashboard/articles`)
- MDX-based content library
- Categories: Digital, Change Management, MBTI
- Search and filtering

---

## Content Structure (MDX)

```
content/articles/
├── core/                    # Универсальные навыки
│   ├── psychology/          # Психология
│   ├── soft-skills/         # Лидерство, переговоры, etc.
│   └── digital/             # Digital навыки
├── industry/                # Отраслевой контент
│   └── travel/              # Travel & Tourism
│       ├── aviation/        # GDS, тарифы
│       ├── mice/            # MICE мероприятия
│       ├── tourism/         # Туризм, визы
│       └── concierge/       # VIP-сервис
├── functional/              # По департаментам
│   ├── marketing/
│   ├── sales/
│   ├── operations/
│   └── finance/
├── mbti/                    # MBTI типы
└── CONTENT_STYLE_GUIDE.md   # Гайд по контенту
```

### Категории контента
| Category | Subcategories | Description |
|----------|---------------|-------------|
| `business` | project-management, leadership, negotiation, team-management, operations, marketing, sales, finance, strategy | Бизнес навыки |
| `personal` | psychology, psychology/mbti, time-management, career-development, communication, digital-skills, change-management | Личное развитие |
| `industry` | travel/aviation, travel/mice, travel/tourism, travel/concierge | Отраслевые знания |

### MDX Frontmatter
```yaml
---
title: "Название статьи"
description: "SEO описание (150-160 символов)"
category: "business" | "personal" | "industry"
subcategory: "project-management"
difficulty: "beginner" | "intermediate" | "advanced"
duration: 15  # минуты
xp_reward: 25
published: true
author: "ТОО «Нейрошторм»"
tags: ["tag1", "tag2"]
mbti_types: ["all"]  # или ["INTJ", "ENFP"]
---
```

### Slash Commands для контента
```
/clean-content    # Очистка импортированного контента
/import-notion    # Инструкция по импорту из Notion
```

### Скрипты
```bash
# Анализ контента
npx tsx scripts/clean-imported-content.ts

# Применить очистку
npx tsx scripts/clean-imported-content.ts --apply
```

---

## Development Session Log

### Session: 2024-12-08

**Completed Tasks:**

1. **Dashboard Quick Actions Update**
   - Changed grid layout to `grid-cols-2 md:grid-cols-4`
   - Added 7 colorful action buttons with icons
   - Files: `src/app/dashboard/page.tsx`

2. **Content Audit & Fixes**
   - Updated `bard-vs-chatgpt.mdx` → renamed to Gemini vs ChatGPT
   - Fixed `model-klarka-fishera.mdx` - removed broken external links
   - Added ASCII diagrams for visual content

3. **AI Insights Page Redesign**
   - Converted to client component with useState/useEffect
   - Added 4 tabs for different insight types
   - Implemented copy to clipboard functionality
   - Added localStorage history (max 20 items)
   - Files: `src/app/dashboard/test-insights/page.tsx`

4. **MBTI Library Enhancement**
   - Added `COGNITIVE_FUNCTION_DESCRIPTIONS` (8 functions)
   - Added `TYPE_DESCRIPTIONS` (16 types with 5 fields each)
   - Files: `src/lib/mbti.ts`

5. **Profile Page Complete Redesign**
   - Added 4 tabs: Overview, Functions, Work, Growth
   - Detailed cognitive function visualization
   - Progress bars showing function prominence
   - Integration with type descriptions
   - Files: `src/app/dashboard/profile/page.tsx`

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Multi-Tenant Architecture (Planned)

### Phase 1 Foundation
- [x] Assessment system (MBTI quiz)
- [x] AI personalization (Claude Haiku)
- [x] Content library (MDX)
- [x] User profiles with MBTI
- [ ] Multi-tenant database schema
- [ ] Feature flags system

### Phase 2 Content & Engagement
- [x] Enhanced type profiles
- [ ] Shadow Work 8-week program
- [x] Daily insight system
- [ ] Stress tracking & radar
- [ ] Achievement system

### Phase 3 Advanced Features
- [ ] Type Simulator
- [ ] Relationship Navigator
- [ ] Career Compass
- [ ] Team Builder (B2B)

See plan file: `~/.claude/plans/polished-wiggling-star.md`

---

## Useful Queries

### Get user with MBTI type
```sql
SELECT id, full_name, mbti_type, department
FROM profiles
WHERE mbti_type IS NOT NULL;
```

### Check AI usage
```sql
SELECT user_id, insight_type, tokens_used, created_at
FROM ai_usage
ORDER BY created_at DESC
LIMIT 10;
```

---

## Related Documentation

- **Parent project:** [[5 Otrar Travel/CLAUDE.md]]
- **Transformation plan:** [[5 Otrar Travel/Transformation Project/]]
- **Psychology research:** [[Research/Psychology/Markdown/]]
- **Platform plan:** `~/.claude/plans/polished-wiggling-star.md`

---

*Version: 1.0 | Last Updated: 2024-12-08*
*Stack: Next.js 15 + Supabase + Claude Haiku*
*Language: Russian (primary), English (technical)*
