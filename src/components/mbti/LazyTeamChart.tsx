'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { MBTIType } from '@/types/database'

// Dynamic import for TeamChart - recharts (~300KB) loads only when needed
const TeamChart = dynamic(
  () => import('@/components/mbti/TeamChart').then(mod => ({ default: mod.TeamChart })),
  {
    loading: () => (
      <div className="grid gap-6 md:grid-cols-2">
        <Card><CardContent className="pt-6"><Skeleton className="h-[300px]" /></CardContent></Card>
        <Card><CardContent className="pt-6"><Skeleton className="h-[300px]" /></CardContent></Card>
      </div>
    ),
    ssr: false // recharts doesn't work well with SSR
  }
)

interface TeamMember {
  id: string
  full_name: string | null
  mbti_type: MBTIType | null
}

interface LazyTeamChartProps {
  members: TeamMember[]
}

export function LazyTeamChart({ members }: LazyTeamChartProps) {
  return <TeamChart members={members} />
}
