# AI Personalization Engine

Claude Haiku integration for personalized MBTI-based daily insights, journal analysis, and type-specific tips.

## Features

- **Daily Insights**: Personalized insights based on MBTI type and cognitive functions
- **Journal Analysis**: AI-powered analysis of user journal entries with emotional tone detection
- **Type-Specific Tips**: Contextual advice tailored to user's MBTI type
- **Inferior Function Development**: Safe exercises for developing weaker cognitive functions
- **Rate Limiting**: 1000 tokens/day per user, 10 requests/day
- **Topic Validation**: Psychology-focused content only
- **Safety Sandbox**: Prompt injection protection and input sanitization

## Setup

### 1. Install Dependencies

```bash
npm install @anthropic-ai/sdk
```

### 2. Set Environment Variable

Add your Anthropic API key to `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 3. Run Database Migration

Apply the AI usage tracking migration:

```bash
npx supabase migration up
```

Or apply the specific migration:

```bash
npx supabase db push --migration 20251207700000_ai_usage_tracking.sql
```

### 4. Verify Setup

Test the API endpoints:

```bash
# Get daily insight
curl -X GET http://localhost:3000/api/insights/daily \
  -H "Authorization: Bearer <token>"

# Check quota
curl -X GET http://localhost:3000/api/insights/quota \
  -H "Authorization: Bearer <token>"
```

## API Endpoints

### GET /api/insights/daily

Generate a daily insight for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Развивайте стратегическое мышление через Ni",
    "content": "...",
    "cognitiveFunction": "Ni",
    "actionItem": "Посвятите 15 минут размышлениям о долгосрочных целях",
    "xpReward": 10,
    "generatedAt": "2025-12-07T12:00:00Z"
  }
}
```

### POST /api/insights/daily

Generate custom insights with context.

**Request Types:**

1. **Type-Specific Tip**
```json
{
  "type": "tip",
  "context": "Мне сложно принимать быстрые решения под давлением"
}
```

2. **Journal Analysis**
```json
{
  "type": "journal",
  "journalEntry": "Сегодня был сложный день..."
}
```

3. **Inferior Function Exercise**
```json
{
  "type": "inferior"
}
```

### GET /api/insights/quota

Get remaining quota for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "tokensRemaining": 750,
    "requestsRemaining": 7,
    "resetAt": "2025-12-08T00:00:00Z"
  }
}
```

## Usage in Code

### Basic Usage

```typescript
import { getPersonalizationEngine } from '@/lib/ai'

const engine = getPersonalizationEngine()

// Generate daily insight
const insight = await engine.generateDailyInsight(
  userId,
  'INTJ',
  'Алексей'
)

// Analyze journal entry
const analysis = await engine.analyzeJournalEntry(
  userId,
  'ENFP',
  'Сегодня я осознал...'
)

// Get type-specific tip
const tip = await engine.generateTypeSpecificTip(
  userId,
  'ISTP',
  'Работа в команде над долгосрочным проектом'
)
```

### Check Quota Before Request

```typescript
import { checkRateLimit } from '@/lib/ai'

const rateLimitCheck = await checkRateLimit(userId)

if (!rateLimitCheck.allowed) {
  console.log('Quota exceeded. Reset at:', rateLimitCheck.resetAt)
} else {
  console.log('Tokens remaining:', rateLimitCheck.tokensRemaining)
  // Proceed with AI request
}
```

### Custom Configuration

```typescript
import { PersonalizationEngine } from '@/lib/ai'

const engine = new PersonalizationEngine(
  process.env.ANTHROPIC_API_KEY,
  {
    dailyTokenBudget: 2000, // Increase daily limit
    maxRequestsPerDay: 20,
    maxTokensPerRequest: 500
  }
)
```

## Architecture

### Files

```
src/lib/ai/
├── types.ts                    # TypeScript interfaces
├── prompts.ts                  # MBTI-specific prompts
├── sandbox.ts                  # Rate limiting & safety
├── personalization-engine.ts   # Main engine
├── index.ts                    # Public exports
└── README.md                   # This file

src/app/api/insights/
├── daily/route.ts             # Daily insights endpoint
└── quota/route.ts             # Quota check endpoint

supabase/migrations/
└── 20251207700000_ai_usage_tracking.sql
```

### Data Flow

1. **User Request** → API Route (`/api/insights/daily`)
2. **Authentication** → Verify user via Supabase
3. **Safety Check** → Rate limit + topic validation
4. **AI Request** → Claude Haiku via Anthropic SDK
5. **Usage Tracking** → Update `ai_usage` table
6. **Response** → Structured JSON with XP reward

### Rate Limiting

- **Storage**: PostgreSQL (`ai_usage` table)
- **Granularity**: Per user, per day
- **Limits**: 1000 tokens/day, 10 requests/day
- **Reset**: Midnight UTC
- **Cleanup**: Automatic deletion after 90 days

### Safety Features

1. **Topic Validation**: Psychology and personal development only
2. **Input Sanitization**: Remove prompt injection attempts
3. **Token Estimation**: Rough approximation (4 chars = 1 token)
4. **Response Validation**: JSON format verification
5. **Disallowed Topics**: Politics, religion, medical diagnosis, self-harm

## Cognitive Functions

The system uses Jung's cognitive functions framework:

| Function | Russian | Description |
|----------|---------|-------------|
| **Ni** | Интровертная интуиция | Vision, patterns, long-term planning |
| **Ne** | Экстравертная интуиция | Exploration, possibilities, creativity |
| **Ti** | Интровертное мышление | Logical analysis, internal consistency |
| **Te** | Экстравертное мышление | Organization, efficiency, goals |
| **Fi** | Интровертное чувство | Personal values, authenticity |
| **Fe** | Экстравертное чувство | Harmony, empathy, social connection |
| **Si** | Интровертное ощущение | Experience, detail-orientation |
| **Se** | Экстравертное ощущение | Present moment, physical world |

Each MBTI type has a unique stack:
- **Dominant**: Primary mode of operation
- **Auxiliary**: Supporting function
- **Tertiary**: Developing function
- **Inferior**: Weakest, most stressful function

## Prompt Engineering

All prompts are designed with:

1. **Russian Language**: All content in Russian
2. **Token Limit**: Max 300 tokens per response
3. **Practicality**: Actionable, concrete advice
4. **Type Specificity**: Tailored to cognitive functions
5. **JSON Output**: Structured, parseable responses

Example prompt structure:

```
Системная инструкция (expertise, constraints, format)
↓
Контекст пользователя (MBTI type, cognitive functions)
↓
Задача (generate insight, analyze journal, etc.)
↓
Требования (format, length, focus areas)
↓
Формат ответа (JSON schema)
```

## XP Rewards

Gamification integration:

- **Daily Insight**: 10 XP
- **Journal Analysis**: 15 XP
- **Type-Specific Tip**: 5 XP

## Error Handling

| Error | Status | Message |
|-------|--------|---------|
| No MBTI type | 400 | Пройдите MBTI-тестирование |
| Rate limit exceeded | 429 | Превышен дневной лимит |
| Invalid topic | 400 | Запрос не связан с психологией |
| Server error | 500 | Произошла ошибка |

## Testing

```typescript
// Test daily insight generation
const insight = await engine.generateDailyInsight('user-id', 'INTJ')
console.log(insight.title) // "Развивайте Ni через..."

// Test rate limiting
const check = await checkRateLimit('user-id')
console.log(check.allowed) // true/false

// Test topic validation
const validation = validateTopic('политика')
console.log(validation.isValid) // false
```

## Performance

- **Average Response Time**: 2-3 seconds (Claude Haiku)
- **Token Efficiency**: ~200 tokens per insight
- **Database Queries**: 2-3 per request (auth + usage tracking)
- **Daily Capacity**: 1000 tokens = ~5 insights per user

## Future Enhancements

- [ ] Multi-language support (English, Kazakh)
- [ ] Caching for frequently requested insights
- [ ] Team insights (compare MBTI types)
- [ ] Historical trend analysis
- [ ] Integration with learning paths
- [ ] Voice-based insights (TTS)
- [ ] Slack/Telegram bot integration

## Troubleshooting

### API Key Issues

```bash
# Verify API key is set
echo $ANTHROPIC_API_KEY

# Test API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

### Database Issues

```sql
-- Check if table exists
SELECT * FROM public.ai_usage LIMIT 1;

-- View usage for a user
SELECT * FROM public.ai_usage WHERE user_id = '<user-id>';

-- Reset usage (for testing)
DELETE FROM public.ai_usage WHERE user_id = '<user-id>';
```

### Rate Limit Testing

```typescript
// Temporarily increase limits for testing
const engine = new PersonalizationEngine(undefined, {
  dailyTokenBudget: 10000,
  maxRequestsPerDay: 100
})
```

## Security

- ✅ RLS policies on `ai_usage` table
- ✅ User can only view/modify their own usage
- ✅ Admins can view all usage (analytics)
- ✅ Input sanitization (prompt injection protection)
- ✅ Topic validation (psychology only)
- ✅ Authentication required for all endpoints
- ✅ HTTPS only in production

## License

Part of the Otrar Transformation Portal project.

## Support

For issues or questions:
- Check database migrations are applied
- Verify ANTHROPIC_API_KEY is set
- Review Supabase RLS policies
- Check application logs for errors
