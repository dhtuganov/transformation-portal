# AI Insights System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         OTRAR PORTAL                            │
│                     AI Personalization Engine                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │─────▶│   API Route  │─────▶│   AI Engine  │
│  React/Next  │      │   /insights  │      │ Claude Haiku │
└──────────────┘      └──────────────┘      └──────────────┘
       │                     │                      │
       │                     │                      │
       ▼                     ▼                      ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│    User      │      │   Supabase   │      │  Anthropic   │
│  Profile     │      │   Database   │      │     API      │
│ (MBTI Type)  │      │  ai_usage    │      │  (Haiku)     │
└──────────────┘      └──────────────┘      └──────────────┘
```

## Component Architecture

### 1. Frontend Layer (React Components)

```
src/lib/ai/example-component.tsx
│
├─ DailyInsightCard
│  ├─ Fetches daily insight
│  ├─ Displays title, content, action item
│  ├─ Shows XP reward
│  └─ Quota status badge
│
├─ JournalAnalysisCard
│  ├─ Text input for journal entry
│  ├─ Analyzes emotional tone
│  ├─ Extracts themes
│  └─ Provides feedback
│
└─ TypeSpecificTipCard
   ├─ Context-based tips
   ├─ Cognitive function focus
   └─ Type-specific rationale
```

### 2. API Layer (Next.js Routes)

```
src/app/api/insights/
│
├─ daily/route.ts
│  ├─ GET  → Generate daily insight
│  └─ POST → Custom insights (tip/journal/inferior)
│     ├─ type: "tip" → Type-specific advice
│     ├─ type: "journal" → Journal analysis
│     └─ type: "inferior" → Weak function exercise
│
└─ quota/route.ts
   └─ GET → Check remaining quota
      ├─ tokensRemaining
      ├─ requestsRemaining
      └─ resetAt
```

### 3. AI Engine Layer (Core Logic)

```
src/lib/ai/
│
├─ personalization-engine.ts (Main Engine)
│  │
│  ├─ PersonalizationEngine class
│  │  ├─ generateDailyInsight()
│  │  ├─ generateTypeSpecificTip()
│  │  ├─ analyzeJournalEntry()
│  │  ├─ generateInferiorFunctionExercise()
│  │  └─ getRemainingQuota()
│  │
│  └─ getPersonalizationEngine() (Singleton)
│
├─ prompts.ts (Prompt Engineering)
│  ├─ getSystemPrompt()
│  ├─ getDailyInsightPrompt(mbtiType)
│  ├─ getJournalAnalysisPrompt(mbtiType, entry)
│  ├─ getTypeSpecificTipPrompt(mbtiType, context)
│  ├─ getInferiorFunctionPrompt(mbtiType)
│  └─ extractJSON() / validateResponseFormat()
│
├─ sandbox.ts (Safety & Rate Limiting)
│  ├─ checkRateLimit(userId)
│  ├─ trackUsage(userId, tokens)
│  ├─ validateTopic(input)
│  ├─ sanitizeInput(input)
│  └─ performSafetyCheck(userId, input)
│
└─ types.ts (Type Definitions)
   ├─ DailyInsight
   ├─ JournalAnalysis
   ├─ TypeSpecificTip
   ├─ AIUsage
   ├─ RateLimitCheck
   └─ PersonalizationConfig
```

### 4. Database Layer (Supabase/PostgreSQL)

```
Database: public.ai_usage
│
├─ Columns:
│  ├─ id (UUID, primary key)
│  ├─ user_id (UUID, FK to auth.users)
│  ├─ date (DATE, unique per user)
│  ├─ tokens_used (INTEGER)
│  ├─ request_count (INTEGER)
│  └─ last_request_at (TIMESTAMPTZ)
│
├─ Indexes:
│  ├─ idx_ai_usage_user_date (user_id, date DESC)
│  └─ idx_ai_usage_date (date DESC)
│
└─ RLS Policies:
   ├─ Users can view/insert/update own records
   └─ Admins can view all records
```

### 5. External Services

```
Anthropic API (Claude Haiku)
│
├─ Model: claude-3-haiku-20240307
├─ Max Tokens: 300
├─ Temperature: 0.7
├─ System Prompt: MBTI expertise
└─ Response Format: JSON

Supabase (Authentication & Database)
│
├─ Auth: User authentication
├─ Database: PostgreSQL
├─ RLS: Row-level security
└─ Storage: ai_usage tracking
```

## Data Flow Diagrams

### Daily Insight Generation

```
User clicks "Get Insight"
    │
    ▼
Frontend: DailyInsightCard.fetchInsight()
    │
    ▼
API: GET /api/insights/daily
    │
    ├─ Authenticate user (Supabase)
    │  └─ Get user_id
    │
    ├─ Fetch user profile
    │  └─ Get mbti_type
    │
    ├─ Safety check (sandbox.ts)
    │  ├─ Check rate limit
    │  │  └─ Query ai_usage table
    │  └─ Validate topic
    │
    ▼
PersonalizationEngine.generateDailyInsight()
    │
    ├─ Generate prompt (prompts.ts)
    │  └─ getDailyInsightPrompt(mbtiType)
    │
    ├─ Call Anthropic API
    │  └─ Claude Haiku response (JSON)
    │
    ├─ Parse response
    │  └─ extractJSON() + validate
    │
    ├─ Track usage (sandbox.ts)
    │  └─ Update ai_usage table
    │
    └─ Return DailyInsight
        │
        ▼
API: Return JSON response
    │
    ▼
Frontend: Display insight
    ├─ Title
    ├─ Content
    ├─ Cognitive function badge
    ├─ Action item
    ├─ XP reward
    └─ Update quota display
```

### Rate Limiting Flow

```
User makes request
    │
    ▼
checkRateLimit(userId)
    │
    ├─ Get current date (YYYY-MM-DD)
    │
    ├─ Query ai_usage table
    │  └─ WHERE user_id = userId AND date = today
    │
    ├─ If no record found:
    │  └─ Return { allowed: true, tokensRemaining: 1000, requestsRemaining: 10 }
    │
    ├─ If record found:
    │  ├─ Calculate: tokensRemaining = 1000 - tokens_used
    │  ├─ Calculate: requestsRemaining = 10 - request_count
    │  │
    │  ├─ If tokensRemaining <= 0 OR requestsRemaining <= 0:
    │  │  └─ Return { allowed: false, resetAt: tomorrow_midnight }
    │  │
    │  └─ Else:
    │     └─ Return { allowed: true, tokensRemaining, requestsRemaining }
    │
    └─ Return RateLimitCheck

If allowed = false:
    └─ Return 429 error "Превышен дневной лимит"

If allowed = true:
    └─ Proceed with AI request
       └─ After completion: trackUsage(userId, tokens)
```

### Safety Validation Flow

```
performSafetyCheck(userId, userInput)
    │
    ├─ Check rate limit
    │  └─ checkRateLimit(userId)
    │     └─ If not allowed: return { passed: false, reason: "Превышен лимит" }
    │
    ├─ Validate topic
    │  └─ validateTopic(userInput)
    │     ├─ Check disallowed topics (politics, religion, medical, etc.)
    │     ├─ Check allowed topics (psychology, development, etc.)
    │     └─ If invalid: return { passed: false, reason: "Не связан с психологией" }
    │
    ├─ Sanitize input
    │  └─ sanitizeInput(userInput)
    │     ├─ Remove: "system:", "assistant:", "[INST]", etc.
    │     └─ Truncate to max 2000 chars
    │
    └─ Return { passed: true, rateLimitCheck }
```

## Security Architecture

### Authentication Flow

```
Request → API Route
    │
    ├─ createClient() (Supabase)
    │
    ├─ supabase.auth.getUser()
    │  ├─ Verify JWT token
    │  └─ Get user object
    │
    ├─ If error or no user:
    │  └─ Return 401 Unauthorized
    │
    └─ If authenticated:
       └─ Proceed with request
```

### RLS Policies (ai_usage table)

```
View Own Usage:
    SELECT ... WHERE auth.uid() = user_id

Insert Own Usage:
    INSERT ... WITH CHECK (auth.uid() = user_id)

Update Own Usage:
    UPDATE ... WHERE auth.uid() = user_id

Admin View All:
    SELECT ... WHERE EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
```

### Input Sanitization

```
User Input → sanitizeInput()
    │
    ├─ Remove prompt injection attempts
    │  ├─ "system:" → ""
    │  ├─ "assistant:" → ""
    │  ├─ "[INST]" → ""
    │  └─ "[/INST]" → ""
    │
    ├─ Truncate to 2000 chars
    │
    └─ Return sanitized string
       │
       └─ Use in prompt safely
```

## MBTI Type System Integration

### Cognitive Functions Mapping

```
MBTI Type → Cognitive Functions Stack
    │
    ├─ INTJ: Ni (dominant) → Te (auxiliary) → Fi (tertiary) → Se (inferior)
    ├─ ENFP: Ne (dominant) → Fi (auxiliary) → Te (tertiary) → Si (inferior)
    └─ ... (all 16 types)

Each function has:
    ├─ Name (Ni, Ne, Ti, Te, Fi, Fe, Si, Se)
    ├─ Russian name (Интровертная интуиция, etc.)
    ├─ Description (Vision, exploration, logic, etc.)
    └─ Role in type (dominant, auxiliary, tertiary, inferior)
```

### Insight Generation by Function

```
generateDailyInsight(mbtiType)
    │
    ├─ Get cognitive functions for type
    │  └─ getCognitiveFunctions(mbtiType)
    │     └─ { dominant: "Ni", auxiliary: "Te", tertiary: "Fi", inferior: "Se" }
    │
    ├─ Build prompt with function context
    │  └─ "Для типа INTJ с доминирующей Ni..."
    │
    ├─ Claude generates insight
    │  └─ Focuses on developing one function
    │     ├─ Dominant (strengthening)
    │     ├─ Auxiliary (supporting)
    │     ├─ Tertiary (developing)
    │     └─ Inferior (gentle exercise)
    │
    └─ Return insight with cognitiveFunction tag
```

## Performance Characteristics

### Response Times

```
Request → API → AI → Response
   │       │     │       │
  10ms    20ms  2-3s   10ms
   │       │     │       │
   └───────┴─────┴───────┘
      Total: ~2-3 seconds
```

### Token Usage

```
Daily Insight:
    ├─ Prompt: ~200 tokens
    ├─ Response: ~150-200 tokens
    └─ Total: ~400 tokens per insight

User Daily Budget: 1000 tokens
    └─ Supports: ~2-3 full insights

Journal Analysis:
    ├─ Prompt: ~300 tokens (includes entry)
    ├─ Response: ~200 tokens
    └─ Total: ~500 tokens per analysis
```

### Database Performance

```
Rate Limit Check:
    ├─ Query: SELECT * FROM ai_usage WHERE user_id = ? AND date = ?
    ├─ Index: idx_ai_usage_user_date (B-tree)
    └─ Time: <5ms (indexed)

Usage Update:
    ├─ Query: UPDATE ai_usage SET tokens_used = ?, request_count = ?
    └─ Time: <10ms
```

## Error Handling Strategy

### Layered Error Handling

```
Frontend
    ├─ Catch network errors
    ├─ Display user-friendly messages
    └─ Show quota status

API Route
    ├─ Catch authentication errors → 401
    ├─ Catch validation errors → 400
    ├─ Catch rate limit errors → 429
    └─ Catch server errors → 500

AI Engine
    ├─ Catch API errors (Anthropic)
    ├─ Catch parsing errors (JSON)
    └─ Log and re-throw

Database
    ├─ Catch connection errors
    ├─ Catch query errors
    └─ Rollback transactions
```

### Error Messages (Russian)

```
400 (No MBTI):  "Пройдите MBTI-тестирование"
400 (Invalid):  "Запрос не связан с психологией"
401 (Auth):     "Необходима авторизация"
429 (Limit):    "Превышен дневной лимит. Попробуйте завтра."
500 (Server):   "Произошла ошибка. Попробуйте позже."
```

## Scalability Considerations

### Current Architecture (MVP)

- **Users**: Up to 1000 active users
- **Requests**: 10 req/day/user = 10,000 req/day max
- **Cost**: $4.50/month per 100 users
- **Database**: Single PostgreSQL instance

### Future Scaling (>1000 users)

1. **Caching Layer**
   - Redis for frequent insights
   - Cache common MBTI type insights
   - Reduce API calls by 30-40%

2. **Queue System**
   - BullMQ for async processing
   - Handle burst traffic
   - Background job processing

3. **CDN for Static Insights**
   - Pre-generate common insights
   - Serve from edge locations
   - Reduce latency

4. **Database Optimization**
   - Partitioning ai_usage by date
   - Archive old records (>90 days)
   - Read replicas for analytics

## Monitoring & Observability

### Key Metrics to Track

```
Business Metrics:
    ├─ Daily active users using AI
    ├─ Average insights per user
    ├─ XP awarded via AI
    └─ User satisfaction (feedback)

Technical Metrics:
    ├─ API response time (p50, p95, p99)
    ├─ Error rate (4xx, 5xx)
    ├─ Rate limit hits (429 errors)
    ├─ Token usage per user
    └─ Database query performance

Cost Metrics:
    ├─ Anthropic API spend
    ├─ Cost per user
    └─ Cost per insight
```

### Logging Strategy

```
Application Logs:
    ├─ Info: Successful insight generation
    ├─ Warn: Rate limit approaching (80%)
    ├─ Error: API failures, parsing errors
    └─ Debug: Request/response payloads (dev only)

Database Logs:
    ├─ Slow queries (>100ms)
    └─ Failed transactions

API Logs (Anthropic):
    ├─ Request count
    ├─ Token usage
    └─ Error responses
```

---

**Last Updated**: 2025-12-07
**Version**: 1.0
**Status**: Production Ready (after installation)
