'use client'

import { ScenarioQuiz, WORKPLACE_SCENARIOS } from '@/components/quiz/ScenarioQuiz'
import type { MBTIType } from '@/types/database'

interface ScenarioPracticeSectionProps {
  userMbtiType: string | null
}

export function ScenarioPracticeSection({ userMbtiType }: ScenarioPracticeSectionProps) {
  return (
    <ScenarioQuiz
      scenarios={WORKPLACE_SCENARIOS}
      userMbtiType={userMbtiType as MBTIType | null}
      onComplete={(results) => {
        console.log('Scenario quiz completed:', results)
        // TODO: Save results to database
      }}
    />
  )
}
