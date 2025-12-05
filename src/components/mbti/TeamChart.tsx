'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MBTI_COLORS, getTypeName, TEMPERAMENT_COLORS, getTemperament } from '@/lib/mbti'
import type { MBTIType } from '@/types/database'

interface TeamMember {
  id: string
  full_name: string | null
  mbti_type: MBTIType | null
}

interface TeamChartProps {
  members: TeamMember[]
}

export function TeamChart({ members }: TeamChartProps) {
  // Count by MBTI type
  const typeCounts = members.reduce((acc, member) => {
    if (member.mbti_type) {
      acc[member.mbti_type] = (acc[member.mbti_type] || 0) + 1
    }
    return acc
  }, {} as Record<MBTIType, number>)

  // Prepare data for pie chart
  const chartData = Object.entries(typeCounts).map(([type, count]) => ({
    name: `${type} (${getTypeName(type as MBTIType, 'ru')})`,
    value: count,
    type: type as MBTIType,
  }))

  // Count by temperament
  const temperamentCounts = members.reduce((acc, member) => {
    if (member.mbti_type) {
      const temp = getTemperament(member.mbti_type)
      acc[temp] = (acc[temp] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const temperamentData = Object.entries(temperamentCounts).map(([temp, count]) => ({
    name: temp === 'analysts' ? 'Аналитики (NT)' :
          temp === 'diplomats' ? 'Дипломаты (NF)' :
          temp === 'sentinels' ? 'Хранители (SJ)' :
          temp === 'explorers' ? 'Искатели (SP)' : temp,
    value: count,
    temperament: temp,
  }))

  const undefinedCount = members.filter(m => !m.mbti_type).length
  const totalWithType = members.length - undefinedCount

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Распределение психотипов</CardTitle>
          <CardDescription>
            MBTI-типы ещё не определены для членов команды
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Данные появятся после определения MBTI-типов сотрудников
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* By Type */}
      <Card>
        <CardHeader>
          <CardTitle>По типам MBTI</CardTitle>
          <CardDescription>
            {totalWithType} из {members.length} с определённым типом
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${(name ?? '').split(' ')[0]} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={MBTI_COLORS[entry.type]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} чел.`, 'Количество']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* By Temperament */}
      <Card>
        <CardHeader>
          <CardTitle>По темпераментам</CardTitle>
          <CardDescription>
            Группировка по когнитивным стилям
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={temperamentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ percent }) =>
                    `${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {temperamentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={TEMPERAMENT_COLORS[entry.temperament as keyof typeof TEMPERAMENT_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} чел.`, 'Количество']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
