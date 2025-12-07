'use client'

import { cn } from '@/lib/utils'
import type { CognitiveFunction, CognitiveProfile } from '@/types/psychometric'
import { COGNITIVE_FUNCTION_INFO, MBTI_FUNCTION_STACKS } from '@/types/psychometric'
import type { MBTIType } from '@/types/database'

// ===========================================
// FUNCTION STACK VISUALIZATION
// ===========================================

interface CognitiveFunctionStackProps {
  mbtiType: MBTIType
  profile?: CognitiveProfile
  showScores?: boolean
  showDescriptions?: boolean
  locale?: 'ru' | 'en'
  className?: string
}

export function CognitiveFunctionStack({
  mbtiType,
  profile,
  showScores = true,
  showDescriptions = false,
  locale = 'ru',
  className,
}: CognitiveFunctionStackProps) {
  const stack = MBTI_FUNCTION_STACKS[mbtiType]

  const functions: {
    function: CognitiveFunction
    position: 'dominant' | 'auxiliary' | 'tertiary' | 'inferior'
    positionLabel: string
  }[] = [
    { function: stack.dominant, position: 'dominant', positionLabel: locale === 'ru' ? 'Доминантная' : 'Dominant' },
    { function: stack.auxiliary, position: 'auxiliary', positionLabel: locale === 'ru' ? 'Вспомогательная' : 'Auxiliary' },
    { function: stack.tertiary, position: 'tertiary', positionLabel: locale === 'ru' ? 'Третичная' : 'Tertiary' },
    { function: stack.inferior, position: 'inferior', positionLabel: locale === 'ru' ? 'Подчинённая' : 'Inferior' },
  ]

  return (
    <div className={cn('space-y-3', className)}>
      {functions.map(({ function: fn, position, positionLabel }) => {
        const info = COGNITIVE_FUNCTION_INFO[fn]
        const score = profile?.scores[fn] ?? 50

        return (
          <FunctionCard
            key={fn}
            function={fn}
            position={position}
            positionLabel={positionLabel}
            score={showScores ? score : undefined}
            showDescription={showDescriptions}
            locale={locale}
          />
        )
      })}
    </div>
  )
}

// ===========================================
// FUNCTION CARD
// ===========================================

interface FunctionCardProps {
  function: CognitiveFunction
  position: 'dominant' | 'auxiliary' | 'tertiary' | 'inferior' | 'shadow'
  positionLabel: string
  score?: number
  showDescription?: boolean
  locale?: 'ru' | 'en'
}

function FunctionCard({
  function: fn,
  position,
  positionLabel,
  score,
  showDescription = false,
  locale = 'ru',
}: FunctionCardProps) {
  const info = COGNITIVE_FUNCTION_INFO[fn]

  const positionStyles = {
    dominant: 'border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
    auxiliary: 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20',
    tertiary: 'border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20',
    inferior: 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20',
    shadow: 'border-l-4 border-l-gray-400 bg-gray-50 dark:bg-gray-950/20 opacity-60',
  }

  return (
    <div className={cn(
      'rounded-lg p-4 transition-all hover:shadow-md',
      positionStyles[position]
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{info.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{fn}</span>
              <span className="text-sm text-muted-foreground">
                {info.name[locale]}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {positionLabel}
            </span>
          </div>
        </div>

        {score !== undefined && (
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: info.color }}>
              {score}%
            </div>
          </div>
        )}
      </div>

      {score !== undefined && (
        <div className="mt-3">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${score}%`,
                backgroundColor: info.color,
              }}
            />
          </div>
        </div>
      )}

      {showDescription && (
        <p className="mt-2 text-sm text-muted-foreground">
          {info.description[locale]}
        </p>
      )}
    </div>
  )
}

// ===========================================
// SHADOW FUNCTIONS
// ===========================================

interface ShadowFunctionsProps {
  mbtiType: MBTIType
  collapsed?: boolean
  locale?: 'ru' | 'en'
  className?: string
}

export function ShadowFunctions({
  mbtiType,
  collapsed = true,
  locale = 'ru',
  className,
}: ShadowFunctionsProps) {
  const stack = MBTI_FUNCTION_STACKS[mbtiType]
  const shadowLabels = locale === 'ru'
    ? ['Противоположный герой', 'Критический родитель', 'Трикстер', 'Демон']
    : ['Opposing Hero', 'Critical Parent', 'Trickster', 'Demon']

  if (collapsed) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        <span className="font-medium">{locale === 'ru' ? 'Теневые функции:' : 'Shadow functions:'}</span>{' '}
        {stack.shadow.join(' → ')}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="font-medium text-muted-foreground">
        {locale === 'ru' ? 'Теневые функции' : 'Shadow Functions'}
      </h4>
      {stack.shadow.map((fn, index) => (
        <FunctionCard
          key={fn}
          function={fn}
          position="shadow"
          positionLabel={shadowLabels[index]}
          locale={locale}
        />
      ))}
    </div>
  )
}

// ===========================================
// RADAR CHART (for all 8 functions)
// ===========================================

interface FunctionRadarProps {
  profile: CognitiveProfile
  size?: number
  className?: string
}

export function FunctionRadar({
  profile,
  size = 300,
  className,
}: FunctionRadarProps) {
  const functions: CognitiveFunction[] = ['Ni', 'Ne', 'Si', 'Se', 'Ti', 'Te', 'Fi', 'Fe']
  const center = size / 2
  const maxRadius = (size / 2) - 40

  // Calculate points for radar
  const points = functions.map((fn, index) => {
    const angle = (index / functions.length) * 2 * Math.PI - Math.PI / 2
    const score = profile.scores[fn] / 100
    const radius = score * maxRadius

    return {
      function: fn,
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      labelX: center + (maxRadius + 25) * Math.cos(angle),
      labelY: center + (maxRadius + 25) * Math.sin(angle),
      score: profile.scores[fn],
      info: COGNITIVE_FUNCTION_INFO[fn],
    }
  })

  // Create polygon path
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ') + ' Z'

  // Create grid circles
  const gridCircles = [0.25, 0.5, 0.75, 1].map(scale => scale * maxRadius)

  return (
    <div className={cn('relative', className)}>
      <svg width={size} height={size} className="mx-auto">
        {/* Grid circles */}
        {gridCircles.map((radius, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={1}
          />
        ))}

        {/* Grid lines */}
        {functions.map((_, index) => {
          const angle = (index / functions.length) * 2 * Math.PI - Math.PI / 2
          const x2 = center + maxRadius * Math.cos(angle)
          const y2 = center + maxRadius * Math.sin(angle)

          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          )
        })}

        {/* Data polygon */}
        <path
          d={pathD}
          fill="hsl(var(--primary))"
          fillOpacity={0.2}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
        />

        {/* Data points */}
        {points.map((p) => (
          <circle
            key={p.function}
            cx={p.x}
            cy={p.y}
            r={6}
            fill={p.info.color}
            stroke="white"
            strokeWidth={2}
          />
        ))}

        {/* Labels */}
        {points.map((p) => (
          <g key={`label-${p.function}`}>
            <text
              x={p.labelX}
              y={p.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-bold fill-current"
            >
              {p.function}
            </text>
            <text
              x={p.labelX}
              y={p.labelY + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] fill-muted-foreground"
            >
              {p.score}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

// ===========================================
// FUNCTION COMPARISON
// ===========================================

interface FunctionComparisonProps {
  profile1: CognitiveProfile
  profile2: CognitiveProfile
  label1: string
  label2: string
  locale?: 'ru' | 'en'
  className?: string
}

export function FunctionComparison({
  profile1,
  profile2,
  label1,
  label2,
  locale = 'ru',
  className,
}: FunctionComparisonProps) {
  const functions: CognitiveFunction[] = ['Ni', 'Ne', 'Si', 'Se', 'Ti', 'Te', 'Fi', 'Fe']

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex justify-between text-sm font-medium">
        <span>{label1}</span>
        <span>{label2}</span>
      </div>

      {functions.map((fn) => {
        const info = COGNITIVE_FUNCTION_INFO[fn]
        const score1 = profile1.scores[fn]
        const score2 = profile2.scores[fn]
        const diff = score2 - score1

        return (
          <div key={fn} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span>{info.icon}</span>
                <span className="font-medium">{fn}</span>
              </div>
              <span className={cn(
                'text-xs',
                diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-muted-foreground'
              )}>
                {diff > 0 ? '+' : ''}{diff}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs w-8">{score1}</span>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full relative">
                <div
                  className="absolute h-full rounded-full bg-blue-500"
                  style={{ width: `${score1}%` }}
                />
                <div
                  className="absolute h-full border-l-2 border-red-500"
                  style={{ left: `${score2}%` }}
                />
              </div>
              <span className="text-xs w-8 text-right">{score2}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
