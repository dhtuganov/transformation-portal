# Shadow Work: 8-Week Inferior Function Integration Program

## Overview

The Shadow Work program is a comprehensive 8-week journey designed to help users integrate their inferior (shadow) cognitive function according to MBTI theory. This is the **key differentiator** for the Otrar Portal platform.

## Theory Background

### What is the Inferior Function?

In MBTI/Jungian psychology, every type has four cognitive functions in a specific order:

1. **Dominant** - Primary mode of operation
2. **Auxiliary** - Supporting function
3. **Tertiary** - Develops in maturity
4. **Inferior** - Least developed, activates under stress

The inferior function is called "shadow" because it:
- Operates unconsciously most of the time
- Manifests destructively under stress
- Holds tremendous potential for growth when integrated
- Is the key to psychological wholeness

### Shadow Functions by Type

| Inferior Function | MBTI Types |
|-------------------|------------|
| **Se** (Extraverted Sensing) | INTJ, INFJ |
| **Si** (Introverted Sensing) | ENTP, ENFP |
| **Ne** (Extraverted Intuition) | ISTJ, ISFJ |
| **Ni** (Introverted Intuition) | ESTP, ESFP |
| **Te** (Extraverted Thinking) | INFP, ISFP |
| **Ti** (Introverted Thinking) | ENFJ, ESFJ |
| **Fe** (Extraverted Feeling) | INTP, ISTP |
| **Fi** (Introverted Feeling) | ENTJ, ESTJ |

## Program Structure

### 8-Week Journey

**Phase 1: Awareness (Weeks 1-2)**
- Week 1: Understanding the shadow function
- Week 2: Mapping triggers and patterns

**Phase 2: Management (Weeks 3-4)**
- Week 3: Developing control over reactions
- Week 4: Accepting the shadow as part of self

**Phase 3: Integration (Weeks 5-7)**
- Week 5: Safe experiments with the function
- Week 6: Expanding into real-life situations
- Week 7: Creating sustainable habits

**Phase 4: Mastery (Week 8)**
- Week 8: Integration and future planning

### Daily Exercises

Each week includes 7-9 exercises specifically designed for each inferior function:

- **Types**: Awareness, Reflection, Practice, Integration, Journaling, Meditation, Behavioral
- **Difficulty**: Beginner, Intermediate, Advanced
- **Duration**: 5-60 minutes

## File Structure

```
/src/lib/shadow-work/
├── types.ts              # TypeScript interfaces
├── program.ts            # 8-week structure & logic
├── exercises.ts          # Type-specific exercises
├── progress.ts           # Progress tracking
├── index.ts              # Public exports
└── README.md             # This file

/content/programs/shadow-work/
├── week-1-awareness.mdx
├── week-2-recognition.mdx
├── week-3-triggers.mdx
├── week-4-acceptance.mdx
├── week-5-integration-1.mdx
├── week-6-integration-2.mdx
├── week-7-practice.mdx
└── week-8-mastery.mdx

/src/components/features/shadow-work/
├── ShadowWorkDashboard.tsx  # Main program view
├── WeekCard.tsx             # Week overview card
├── ExerciseCard.tsx         # Exercise card with details
├── ProgressTracker.tsx      # Visual progress tracking
└── index.ts                 # Component exports
```

## Usage

### Initialize Program

```typescript
import { initializeShadowWorkProgram, initializeShadowWorkProfile } from '@/lib/shadow-work'

const program = initializeShadowWorkProgram(userId, 'INTJ')
const profile = initializeShadowWorkProfile(userId, 'INTJ')
```

### Get Exercises for Week

```typescript
import { getExercisesForWeek } from '@/lib/shadow-work'

const exercises = getExercisesForWeek('INTJ', 1) // Week 1 exercises
```

### Track Progress

```typescript
import { completeExercise, advanceToNextWeek } from '@/lib/shadow-work'

// Complete an exercise
const updatedProgram = completeExercise(
  program,
  exerciseId,
  actualDuration,
  notes,
  insights
)

// Advance to next week
const advancedProgram = advanceToNextWeek(program)
```

### Display Dashboard

```typescript
import { ShadowWorkDashboard } from '@/components/features/shadow-work'
import { getDashboardData } from '@/lib/shadow-work'

const dashboardData = getDashboardData(program, profile)

<ShadowWorkDashboard
  data={dashboardData}
  onCompleteExercise={handleComplete}
  onAdvanceWeek={handleAdvance}
/>
```

## Exercise Examples

### For Se (INTJ/INFJ)

**Week 1: Body Scan Meditation**
- Duration: 10 minutes
- Type: Meditation
- Goal: Develop bodily awareness

**Week 5: Mindful Movement**
- Duration: 20 minutes
- Type: Practice
- Goal: Integration of body and mind

### For Ne (ISTJ/ISFJ)

**Week 1: Possibility Thinking Journal**
- Duration: 15 minutes
- Type: Journaling
- Goal: See alternatives in situations

**Week 6: Divergent Thinking Exercise**
- Duration: 25 minutes
- Type: Practice
- Goal: Generate creative solutions

## Integration Levels

Progress is measured on a 0-100 scale:

- **0-25%**: Awareness phase - recognizing the function
- **25-50%**: Development phase - learning to use it
- **50-75%**: Integration phase - applying in life
- **75-100%**: Mastery phase - natural usage

Calculation factors:
- Completed weeks (40%)
- Total exercises completed (40%)
- Consistency/streak (20%)

## Data Models

### ShadowWorkProgram

```typescript
interface ShadowWorkProgram {
  userId: string
  mbtiType: MBTIType
  inferiorFunction: CognitiveFunction
  startDate: Date
  currentWeek: WeekNumber
  weeks: Week[]
  progress: WeekProgress[]
  overallInsights: string[]
  streakDays: number
  totalExercisesCompleted: number
}
```

### ShadowWorkProfile

```typescript
interface ShadowWorkProfile {
  userId: string
  mbtiType: MBTIType
  inferiorFunction: CognitiveFunction
  integrationLevel: number
  commonTriggers: string[]
  behaviorPatterns: string[]
  breakthroughs: Breakthrough[]
  growthAreas: GrowthArea[]
}
```

## Database Integration

The program is designed to work with Supabase:

### Required Tables

```sql
-- shadow_work_programs table
CREATE TABLE shadow_work_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  mbti_type TEXT NOT NULL,
  inferior_function TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_week INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  total_exercises_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- shadow_work_progress table
CREATE TABLE shadow_work_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES shadow_work_programs NOT NULL,
  week_number INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  insights JSONB DEFAULT '[]',
  challenges JSONB DEFAULT '[]'
);

-- shadow_work_exercise_completions table
CREATE TABLE shadow_work_exercise_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  progress_id UUID REFERENCES shadow_work_progress NOT NULL,
  exercise_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER, -- minutes
  notes TEXT,
  insights JSONB DEFAULT '[]',
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  will_repeat BOOLEAN
);

-- shadow_work_profiles table
CREATE TABLE shadow_work_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  mbti_type TEXT NOT NULL,
  integration_level INTEGER DEFAULT 0,
  common_triggers JSONB DEFAULT '[]',
  behavior_patterns JSONB DEFAULT '[]',
  total_practice_hours NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Future Enhancements

### Planned Features

1. **Community Features**
   - Group programs
   - Peer accountability partners
   - Shared breakthroughs

2. **Advanced Analytics**
   - Integration heatmaps
   - Trigger pattern analysis
   - Predictive recommendations

3. **Content Expansion**
   - Audio-guided exercises
   - Video demonstrations
   - Interactive visualizations

4. **Gamification**
   - Achievement badges
   - Streak rewards
   - Level progression

5. **AI Integration**
   - Personalized exercise recommendations
   - Pattern recognition in journals
   - Adaptive difficulty

## References

- Lenore Thomson - "Personality Type: An Owner's Manual"
- Naomi Quenk - "Was That Really Me?"
- Carl Jung - "Psychological Types"
- Paul D. Tieger & Barbara Barron-Tieger - "Do What You Are"

## License

Copyright (c) 2025 Otrar Portal. All rights reserved.
