import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TypeBadge } from './TypeBadge'
import { getTypeName, getCognitiveFunctions, getTemperament, TEMPERAMENT_NAMES } from '@/lib/mbti'
import type { MBTIType } from '@/types/database'

interface TypeCardProps {
  type: MBTIType
  strengths?: string[]
  growthAreas?: string[]
  showFunctions?: boolean
}

export function TypeCard({ type, strengths, growthAreas, showFunctions = true }: TypeCardProps) {
  const typeName = getTypeName(type, 'ru')
  const typeNameEn = getTypeName(type, 'en')
  const functions = getCognitiveFunctions(type)
  const temperament = getTemperament(type)
  const temperamentName = TEMPERAMENT_NAMES[temperament]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-3">
              <TypeBadge type={type} size="lg" />
              <span>{typeName}</span>
            </CardTitle>
            <CardDescription className="mt-1">
              {typeNameEn} · {temperamentName.ru} ({temperamentName.en})
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showFunctions && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Когнитивные функции</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-blue-50 rounded px-3 py-2">
                <span className="text-gray-500">Доминирующая:</span>{' '}
                <span className="font-medium">{functions.dominant}</span>
              </div>
              <div className="bg-green-50 rounded px-3 py-2">
                <span className="text-gray-500">Вспомогательная:</span>{' '}
                <span className="font-medium">{functions.auxiliary}</span>
              </div>
              <div className="bg-yellow-50 rounded px-3 py-2">
                <span className="text-gray-500">Третичная:</span>{' '}
                <span className="font-medium">{functions.tertiary}</span>
              </div>
              <div className="bg-red-50 rounded px-3 py-2">
                <span className="text-gray-500">Подчинённая:</span>{' '}
                <span className="font-medium">{functions.inferior}</span>
              </div>
            </div>
          </div>
        )}

        {strengths && strengths.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Сильные стороны</h4>
            <ul className="space-y-1">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {growthAreas && growthAreas.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Зоны развития</h4>
            <ul className="space-y-1">
              {growthAreas.map((area, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-500 mt-0.5">→</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
