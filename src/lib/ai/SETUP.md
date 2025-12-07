# AI Personalization Engine - Setup Guide

Quick setup guide for the Claude Haiku integration.

## Prerequisites

- Node.js 18+ installed
- Supabase project configured
- Anthropic API account

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd /Users/david/Projects/otrar-portal
npm install @anthropic-ai/sdk
```

### 2. Get Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-api03-`)

### 3. Configure Environment

Add to your `.env.local` file:

```bash
# Anthropic API Configuration
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE
```

### 4. Run Database Migration

```bash
# Option 1: Using Supabase CLI (recommended)
npx supabase migration up

# Option 2: Apply specific migration
npx supabase db push

# Option 3: Run in Supabase Dashboard
# Copy contents of supabase/migrations/20251207700000_ai_usage_tracking.sql
# Paste into SQL Editor and execute
```

### 5. Verify Migration

Check that the `ai_usage` table was created:

```sql
-- In Supabase SQL Editor
SELECT * FROM public.ai_usage LIMIT 1;
```

You should see the table structure (even if empty).

### 6. Test API Endpoints

Start the development server:

```bash
npm run dev
```

Test the quota endpoint (easiest to test):

```bash
# Replace <YOUR_TOKEN> with a valid Supabase auth token
curl -X GET http://localhost:3000/api/insights/quota \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "tokensRemaining": 1000,
    "requestsRemaining": 10,
    "resetAt": "2025-12-08T00:00:00.000Z"
  }
}
```

### 7. Test Daily Insight Generation

```bash
curl -X GET http://localhost:3000/api/insights/daily \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "title": "Развивайте стратегическое мышление",
    "content": "...",
    "cognitiveFunction": "Ni",
    "actionItem": "...",
    "xpReward": 10,
    "generatedAt": "2025-12-07T12:00:00.000Z"
  }
}
```

## Troubleshooting

### Error: "Anthropic API key is required"

**Problem**: Environment variable not set

**Solution**:
```bash
# Check if variable is set
echo $ANTHROPIC_API_KEY

# If empty, add to .env.local:
ANTHROPIC_API_KEY=sk-ant-api03-...

# Restart dev server
npm run dev
```

### Error: "MBTI type not set"

**Problem**: User profile doesn't have MBTI type

**Solution**:
1. Log in to the application
2. Complete the MBTI assessment
3. Or manually set in database:
```sql
UPDATE profiles
SET mbti_type = 'INTJ'
WHERE id = '<user-id>';
```

### Error: "Profile not found"

**Problem**: Authentication token invalid or user not in database

**Solution**:
1. Check token is valid
2. Verify user exists in `auth.users`
3. Verify profile exists in `public.profiles`

### Error: "Rate limit exceeded"

**Problem**: Daily quota exhausted (for testing)

**Solution**:
```sql
-- Reset usage for testing
DELETE FROM public.ai_usage
WHERE user_id = '<user-id>';
```

### Migration Errors

**Problem**: Migration fails or table already exists

**Solution**:
```sql
-- Drop table and re-run migration
DROP TABLE IF EXISTS public.ai_usage CASCADE;

-- Then re-run migration
```

## Configuration Options

### Increase Rate Limits (for testing)

Edit `/src/lib/ai/sandbox.ts`:

```typescript
export const DEFAULT_CONFIG: PersonalizationConfig = {
  dailyTokenBudget: 5000,      // Increase from 1000
  maxRequestsPerDay: 50,       // Increase from 10
  maxTokensPerRequest: 500,    // Increase from 300
  // ... rest of config
}
```

### Change AI Model

Edit `/src/lib/ai/personalization-engine.ts`:

```typescript
const response = await this.anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',  // Change from haiku
  // ... rest of config
})
```

**Note**: Haiku is recommended for cost and speed.

### Customize Prompts

Edit `/src/lib/ai/prompts.ts`:

- `getSystemPrompt()` - Base instructions for Claude
- `getDailyInsightPrompt()` - Daily insight generation
- `getJournalAnalysisPrompt()` - Journal entry analysis
- `getTypeSpecificTipPrompt()` - Contextual tips

## Testing Checklist

- [ ] Dependencies installed (`@anthropic-ai/sdk`)
- [ ] Environment variable set (`ANTHROPIC_API_KEY`)
- [ ] Database migration applied (`ai_usage` table exists)
- [ ] RLS policies enabled (users can only see own data)
- [ ] API endpoints respond (test with curl)
- [ ] Rate limiting works (make 11 requests, 11th should fail)
- [ ] Topic validation works (try politics/religion, should fail)
- [ ] XP rewards integration (check if XP is awarded)

## Production Checklist

- [ ] Use production Anthropic API key
- [ ] Set rate limits appropriately (1000 tokens/day recommended)
- [ ] Enable HTTPS only
- [ ] Monitor API usage (Anthropic dashboard)
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure backup for `ai_usage` table
- [ ] Test load (concurrent requests)
- [ ] Review RLS policies (security)
- [ ] Set up monitoring for quota exceeded events
- [ ] Document escalation path for API issues

## Cost Estimation

**Claude Haiku Pricing** (as of Dec 2024):
- Input: $0.25 per million tokens
- Output: $1.25 per million tokens

**Per User Daily Cost**:
- Assumptions: 5 insights/day, 200 tokens each
- Input: ~500 tokens
- Output: ~1000 tokens
- **Cost**: ~$0.0015 per user per day
- **Monthly**: ~$0.045 per active user

**100 Active Users**:
- Monthly cost: ~$4.50

## Next Steps

1. ✅ Complete setup
2. Test with real user accounts
3. Integrate with dashboard UI
4. Add gamification (XP rewards)
5. Create user feedback loop
6. Monitor usage analytics
7. Iterate on prompt quality

## Support

If you encounter issues:

1. Check logs: `npm run dev` console output
2. Check Supabase logs: Dashboard → Logs
3. Check Anthropic logs: Console → API Logs
4. Review this guide
5. Check README.md for detailed docs

## Useful Commands

```bash
# Install dependency
npm install @anthropic-ai/sdk

# Run migrations
npx supabase migration up

# Start dev server
npm run dev

# Check environment variables
cat .env.local | grep ANTHROPIC

# Reset database (careful!)
npx supabase db reset

# Generate TypeScript types
npx supabase gen types typescript > src/types/database.ts
```
