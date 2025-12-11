# CLAUDE.md - Otrar Portal

## Quick Start

**Project:** Otrar Portal - Corporate Transformation Platform
**Stack:** Next.js 15 + Supabase + Claude Haiku AI + Tailwind + Shadcn/ui
**Production:** https://otrar.netlify.app
**GitHub:** https://github.com/dhtuganov/transformation-portal
**Parent:** [[5 Otrar Travel/CLAUDE.md]]

### Commands
```bash
npm run dev              # Development server (port 3000)
npm run build            # Production build
npm run lint             # ESLint check
npm run validate-content # MDX validation
```

### Test Users
| Email | MBTI | Role |
|-------|------|------|
| test@creata.kz | INTJ | Test user |
| david@creata.team | ENFP | Admin |
| aliya@otrar.kz | ESTJ | Executive |
| albina@otrar.kz | ISFJ | Executive |

---

## Features Status

### Core Infrastructure
| Feature | Status | Notes |
|---------|--------|-------|
| Auth (Supabase) | ✅ | Email/password, OAuth ready |
| RLS Policies | ✅ | Role-based access control |
| Profiles | ✅ | MBTI type, role, department |
| Navigation | ✅ | Role-based menu |
| MDX Content | ✅ | 117 articles |
| Pre-build Validation | ✅ | `scripts/validate-content.ts` |

### MBTI Features
| Feature | Status | Route |
|---------|--------|-------|
| My Type | ✅ | `/dashboard/my-type` |
| Team Builder | ✅ | `/dashboard/team-builder` |
| Type Simulator | ✅ | `/dashboard/type-simulator` |
| Relationships | ✅ | `/dashboard/relationships` |
| Career Compass | ✅ | `/dashboard/career` |

### AI Personalization (Claude Haiku)
| Feature | Status | Notes |
|---------|--------|-------|
| Daily Insights | ✅ | MBTI-specific, 10 XP |
| Journal Analysis | ✅ | Emotional tone, themes, 15 XP |
| Type-Specific Tips | ✅ | Contextual advice, 5 XP |
| Inferior Function Exercises | ✅ | Safe development exercises |
| Rate Limiting | ✅ | 1000 tokens/day, 10 requests/day |
| Usage Tracking | ✅ | `ai_usage` table |

### Shadow Work System
| Feature | Status | Notes |
|---------|--------|-------|
| 8-Week Programs | ✅ | All 8 inferior functions |
| Exercise Library | ✅ | 72+ exercises |
| Progress Tracking | ✅ | Streaks, XP, integration level |
| Stress Radar | ✅ | Daily check-ins, inferior detection |

### Strategy Section (Executive Only)
| Feature | Status | Route |
|---------|--------|-------|
| Overview | ✅ | `/dashboard/strategy` |
| Team Profile | ✅ | `/dashboard/strategy/team-profile` |
| Organizational | ✅ | `/dashboard/strategy/organizational` |
| Hiring | ✅ | `/dashboard/strategy/hiring` |
| Change Management | ✅ | `/dashboard/strategy/change-management` |
| Roadmap | ✅ | `/dashboard/strategy/roadmap` |
| KPI | ✅ | `/dashboard/strategy/kpi` |

### Learning & Assessment
| Feature | Status | Notes |
|---------|--------|-------|
| Article System | ✅ | MDX + metadata |
| 16 MBTI Articles | ✅ | All types described |
| MBTI Quiz (16Q) | ✅ | Type determination |
| Progress Tracking | ✅ | `learning_progress` table |
| Full-Text Search (RU) | ✅ | PostgreSQL tsvector |

### Admin Tools
| Feature | Status | Route |
|---------|--------|-------|
| Content Dashboard | ✅ | `/admin/content` |
| Team Management | ✅ | `/dashboard/team` |
| Manager Dashboard | ✅ | `/dashboard/manager` |

---

## Architecture

```
otrar-portal/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # Main dashboard
│   │   │   ├── strategy/          # Executive strategy (7 pages)
│   │   │   ├── shadow-work/       # 8-week programs
│   │   │   ├── my-type/           # Personal type profile
│   │   │   ├── team-builder/      # Team compatibility
│   │   │   ├── relationships/     # Relationship navigator
│   │   │   ├── career/            # Career compass
│   │   │   ├── stress-radar/      # Stress tracking
│   │   │   ├── type-simulator/    # Scenario simulator
│   │   │   ├── learning/          # MDX articles
│   │   │   ├── quizzes/           # Assessments
│   │   │   ├── profile/           # User profile
│   │   │   ├── development/       # IPR module
│   │   │   └── team/              # Manager view
│   │   ├── admin/
│   │   │   └── content/           # Content quality dashboard
│   │   ├── auth/                  # Login, Register
│   │   └── api/
│   │       └── insights/          # AI endpoints
│   ├── components/
│   │   ├── ui/                    # Shadcn/ui
│   │   ├── mbti/                  # TypeBadge, descriptions
│   │   ├── layout/                # Navbar
│   │   ├── strategy/              # Strategy section components
│   │   └── learning/              # Content components
│   ├── lib/
│   │   ├── ai/                    # Claude Haiku integration
│   │   ├── mbti.ts                # MBTI utilities
│   │   ├── mbti-types/            # 16 type profiles
│   │   ├── shadow-work/           # Shadow Work library
│   │   └── supabase/              # Database client
│   └── content/
│       └── articles/              # MDX content (117 files)
├── supabase/
│   └── migrations/                # Database migrations
├── scripts/
│   └── validate-content.ts        # Pre-build validation
└── CLAUDE.md                      # This file
```

---

## Database Schema

### Core Tables
| Table | Purpose |
|-------|---------|
| `profiles` | User profiles with MBTI type, role |
| `quiz_results` | Assessment results history |
| `learning_progress` | Content progress |
| `content_metadata` | MDX metadata for search |
| `teams` / `team_members` | Team structure |

### AI & Shadow Work Tables
| Table | Purpose |
|-------|---------|
| `ai_usage` | AI API usage tracking |
| `shadow_work_programs` | 8 programs for inferior functions |
| `shadow_work_weeks` | Weekly curriculum |
| `shadow_work_exercises` | Daily exercises |
| `shadow_work_enrollments` | User enrollments |
| `shadow_work_progress` | Exercise completions |
| `stress_check_ins` | Daily stress tracking |

### Roles
| Role | Access |
|------|--------|
| `employee` | Basic features |
| `manager` | Team dashboard |
| `executive` | Strategy section |
| `admin` | Full access |

---

## AI Integration (Claude Haiku)

### Configuration
```env
ANTHROPIC_API_KEY=sk-ant-...
```

### Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/insights/daily` | GET | Daily insight |
| `/api/insights/daily` | POST | Custom (tip/journal/inferior) |
| `/api/insights/quota` | GET | Check remaining quota |

### Files
| File | Purpose |
|------|---------|
| `src/lib/ai/personalization-engine.ts` | Main AI engine |
| `src/lib/ai/prompts.ts` | MBTI-specific prompts |
| `src/lib/ai/sandbox.ts` | Rate limiting, safety |
| `src/lib/ai/types.ts` | TypeScript interfaces |

### Cost
- Model: claude-3-haiku-20240307
- ~$0.045/month per active user (5 insights/day)
- ~$4.50/month for 100 users

---

## Shadow Work System

### Program Structure
- 8 weeks per program
- 8 programs (one per inferior function)
- 72+ exercises total
- Weekly themes: Awareness → Recognition → Integration → Mastery

### Inferior Functions by Type
| Inferior | Types |
|----------|-------|
| Se | INTJ, INFJ |
| Si | ENTP, ENFP |
| Ne | ISTJ, ISFJ |
| Ni | ESTP, ESFP |
| Te | INFP, ISFP |
| Ti | ENFJ, ESFJ |
| Fe | INTP, ISTP |
| Fi | ENTJ, ESTJ |

### Files
| File | Purpose |
|------|---------|
| `src/lib/shadow-work/program.ts` | Curriculum definition |
| `src/lib/shadow-work/exercises.ts` | Exercise library |
| `src/lib/shadow-work/progress.ts` | Progress tracking |

---

## Strategy Section

### Access Control
- Only `executive` and `admin` roles
- Middleware protection in `src/middleware.ts`
- Navbar conditional rendering

### Content Source
Based on: `5 Otrar Travel/Transformation Project/2 Design/Обновлённое видение трансформации Otrar Travel 2.0.md`

### Pages
| Page | Content |
|------|---------|
| Overview | Executive Summary, Formula: SF + NT + NF |
| Team Profile | MBTI distribution, cognitive analysis |
| Organizational | Bimodal model (Mode 1/Mode 2), Hunter/Farmer |
| Hiring | CDO, Commercial Director, HRBP profiles |
| Change Management | ADKAR for sensors, Digital Champions |
| Roadmap | 4 phases until 2026 |
| KPI | Business, team, culture metrics |

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

## Migrations Applied

| Migration | Status | Description |
|-----------|--------|-------------|
| `20251205000000_initial_schema` | ✅ | Core tables |
| `20251205170000_create_profile_trigger` | ✅ | Auto profile creation |
| `20251205180000_fix_rls_policies` | ✅ | Basic RLS |
| `20251205190000_create_quiz_system` | ✅ | Quiz tables |
| `20251205200000_create_ipr_system` | ✅ | IPR tables |
| `20251205210000_fix_profiles_recursion` | ✅ | RLS recursion fix |
| `20251206110000_create_content_metadata` | ✅ | Content + search |
| `20251207600000_simple_profiles_policy` | ✅ | Simplified RLS |
| `20251207700000_ai_usage_tracking` | ✅ | AI usage table |
| `20251208000000_shadow_work_system` | ✅ | Shadow Work tables |
| `20251208100000_seed_shadow_work_programs` | ✅ | 8 programs seeded |

---

## Recent Changes

### 2025-12-11: Strategy Section + MBTI Update
- ✅ Strategy section fully implemented (7 pages)
- ✅ David Tuganov MBTI updated: INTJ → ENFP
- ✅ Executive access protection working

### 2025-12-10: Maturity Assessment + JDs
- ✅ Business Function Maturity Assessment (48 questions)
- ✅ Google Form auto-generation script
- ✅ Job Descriptions: CDO, Commercial Director, HRBP
- ✅ MBTI Team Profile structured

### 2025-12-09: Phase 2-3 + Deployment
- ✅ Production deployment to Netlify
- ✅ Shadow Work migrations applied
- ✅ My Type page with 6 tabs
- ✅ Team Builder with compatibility matrix
- ✅ Pre-build MDX validation
- ✅ Content quality dashboard

### 2025-12-08: AI + Advanced Features
- ✅ Claude Haiku AI integration
- ✅ Shadow Work system
- ✅ Stress Radar
- ✅ Type Simulator
- ✅ Relationship Navigator
- ✅ Career Compass

### 2025-12-06-07: Content System
- ✅ MDX + Supabase hybrid
- ✅ Full-text search (Russian)
- ✅ MBTI visual components
- ✅ 16 MBTI type articles

---

## Pending Tasks

### Phase 1: Foundation
- [ ] Gamification MVP (XP, streaks, achievements)
- [ ] Multi-tenant database schema
- [ ] Feature flags system
- [ ] Adaptive assessment engine (IRT)

### Phase 2: Content
- [ ] Shadow Work program content (36 more exercises)
- [ ] Daily insight system refinement
- [ ] Achievement system (30+)

### Future
- [ ] Mobile app
- [ ] Telegram bot integration
- [ ] Analytics dashboard for admins
- [ ] Multi-language support (EN, KZ)

---

## Development Tips

### TypeScript Pattern for Supabase
```typescript
// Use generic for .single()
const { data } = await supabase
  .from('profiles')
  .select('mbti_type')
  .eq('id', user.id)
  .single<{ mbti_type: string | null }>()
```

### Running from Correct Directory
```bash
# CORRECT: Run from project folder
cd ~/Projects/otrar-portal && claude

# WRONG: Don't run from Google Drive
cd "!Obsidian now" && claude  # Shell issues!
```

### Regenerate Supabase Types
```bash
npx supabase gen types typescript --project-id PROJECT_ID > src/types/supabase.ts
```

---

## Related Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| Parent project | `5 Otrar Travel/CLAUDE.md` | Transformation context |
| Session archive | `5 Otrar Travel/Development-archive.md` | Historical sessions |
| Transformation plan | `5 Otrar Travel/Transformation Project/` | Business docs |

---

*Version: 2.0 | Last Updated: 2025-12-11*
*Build: 129+ pages | Stack: Next.js 15 + Supabase + Claude Haiku*
