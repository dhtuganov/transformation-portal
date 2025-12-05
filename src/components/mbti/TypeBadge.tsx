import { Badge } from '@/components/ui/badge'
import { getTypeColor, getTypeName } from '@/lib/mbti'
import type { MBTIType } from '@/types/database'

interface TypeBadgeProps {
  type: MBTIType
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

export function TypeBadge({ type, size = 'md', showName = false }: TypeBadgeProps) {
  const color = getTypeColor(type)
  const name = getTypeName(type, 'ru')

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <Badge
      className={`font-semibold ${sizeClasses[size]}`}
      style={{
        backgroundColor: color,
        color: 'white',
      }}
    >
      {type}
      {showName && ` · ${name}`}
    </Badge>
  )
}
