'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Activity,
  AlertTriangle,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Brain,
  Calendar,
  CheckCircle2,
  Flame,
  Heart,
  Loader2,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react'
import { COGNITIVE_FUNCTIONS, COGNITIVE_FUNCTION_DESCRIPTIONS, TYPE_DESCRIPTIONS } from '@/lib/mbti'
import type { MBTIType, StressCheckIn, StressMood } from '@/types/database'

const MOOD_OPTIONS: { value: StressMood; label: string; emoji: string; color: string }[] = [
  { value: 'great', label: 'Отлично', emoji: '😊', color: 'text-green-500' },
  { value: 'good', label: 'Хорошо', emoji: '🙂', color: 'text-lime-500' },
  { value: 'neutral', label: 'Нормально', emoji: '😐', color: 'text-yellow-500' },
  { value: 'low', label: 'Устал', emoji: '😔', color: 'text-orange-500' },
  { value: 'stressed', label: 'Стресс', emoji: '😰', color: 'text-red-500' },
]

const COMMON_TRIGGERS = [
  'Дедлайны',
  'Конфликты',
  'Перегрузка',
  'Неопределённость',
  'Недосып',
  'Критика',
  'Изоляция',
  'Многозадачность',
]

const COPING_STRATEGIES = [
  'Прогулка',
  'Медитация',
  'Спорт',
  'Разговор',
  'Музыка',
  'Сон',
  'Природа',
  'Творчество',
]

export default function StressRadarPage() {
  const [userType, setUserType] = useState<MBTIType | null>(null)
  const [checkIns, setCheckIns] = useState<StressCheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCheckIn, setShowCheckIn] = useState(false)

  // Check-in form state
  const [stressLevel, setStressLevel] = useState<number>(5)
  const [energyLevel, setEnergyLevel] = useState<number>(5)
  const [mood, setMood] = useState<StressMood>('neutral')
  const [triggers, setTriggers] = useState<string[]>([])
  const [copingUsed, setCopingUsed] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [inferiorActive, setInferiorActive] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('mbti_type')
      .eq('id', user.id)
      .single()

    if (profile?.mbti_type) {
      setUserType(profile.mbti_type as MBTIType)
    }

    // Get check-ins (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: checkInsData } = await (supabase
      .from('stress_check_ins') as any)
      .select('*')
      .eq('user_id', user.id)
      .gte('checked_in_at', thirtyDaysAgo.toISOString())
      .order('checked_in_at', { ascending: false })

    setCheckIns(checkInsData || [])
    setLoading(false)
  }

  const saveCheckIn = async () => {
    setSaving(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await (supabase
      .from('stress_check_ins') as any)
      .insert({
        user_id: user.id,
        stress_level: stressLevel,
        energy_level: energyLevel,
        mood,
        triggers: triggers.length > 0 ? triggers : null,
        coping_strategies_used: copingUsed.length > 0 ? copingUsed : null,
        notes: notes || null,
        inferior_function_active: inferiorActive,
      })

    // Reset form
    setStressLevel(5)
    setEnergyLevel(5)
    setMood('neutral')
    setTriggers([])
    setCopingUsed([])
    setNotes('')
    setInferiorActive(false)
    setShowCheckIn(false)

    await loadData()
    setSaving(false)
  }

  const toggleTrigger = (trigger: string) => {
    setTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    )
  }

  const toggleCoping = (strategy: string) => {
    setCopingUsed(prev =>
      prev.includes(strategy)
        ? prev.filter(s => s !== strategy)
        : [...prev, strategy]
    )
  }

  // Calculate stats
  const getAverageStress = () => {
    if (checkIns.length === 0) return 0
    return Math.round(checkIns.reduce((acc, c) => acc + c.stress_level, 0) / checkIns.length)
  }

  const getAverageEnergy = () => {
    const withEnergy = checkIns.filter(c => c.energy_level)
    if (withEnergy.length === 0) return 0
    return Math.round(withEnergy.reduce((acc, c) => acc + (c.energy_level || 0), 0) / withEnergy.length)
  }

  const getStressTrend = () => {
    if (checkIns.length < 2) return 'stable'
    const recent = checkIns.slice(0, 7)
    const older = checkIns.slice(7, 14)
    if (older.length === 0) return 'stable'
    const recentAvg = recent.reduce((acc, c) => acc + c.stress_level, 0) / recent.length
    const olderAvg = older.reduce((acc, c) => acc + c.stress_level, 0) / older.length
    if (recentAvg > olderAvg + 1) return 'increasing'
    if (recentAvg < olderAvg - 1) return 'decreasing'
    return 'stable'
  }

  const getInferiorFunction = () => {
    if (!userType) return null
    return COGNITIVE_FUNCTIONS[userType]?.inferior
  }

  const inferiorFn = getInferiorFunction()
  const inferiorDesc = inferiorFn ? COGNITIVE_FUNCTION_DESCRIPTIONS[inferiorFn] : null
  const typeDesc = userType ? TYPE_DESCRIPTIONS[userType] : null
  const todayCheckIn = checkIns.find(c => {
    const checkInDate = new Date(c.checked_in_at).toDateString()
    return checkInDate === new Date().toDateString()
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-red-500" />
            Stress Radar
          </h1>
          <p className="text-gray-600 mt-1">
            Отслеживайте стресс и управляйте энергией
          </p>
        </div>
        {!showCheckIn && (
          <Button
            onClick={() => setShowCheckIn(true)}
            className="bg-red-500 hover:bg-red-600"
            disabled={!!todayCheckIn}
          >
            {todayCheckIn ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Сегодня отмечено
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" />
                Check-in
              </>
            )}
          </Button>
        )}
      </div>

      {/* Check-in Form */}
      {showCheckIn && (
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
          <CardHeader>
            <CardTitle>Ежедневный Check-in</CardTitle>
            <CardDescription>Как вы себя чувствуете сегодня?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stress Level */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Уровень стресса</label>
                <span className="text-sm text-gray-500">{stressLevel}/10</span>
              </div>
              <Slider
                value={[stressLevel]}
                onValueChange={([v]) => setStressLevel(v)}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Спокойно</span>
                <span>Сильный стресс</span>
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Уровень энергии</label>
                <span className="text-sm text-gray-500">{energyLevel}/10</span>
              </div>
              <Slider
                value={[energyLevel]}
                onValueChange={([v]) => setEnergyLevel(v)}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Истощён</span>
                <span>Полон сил</span>
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="text-sm font-medium block mb-2">Настроение</label>
              <div className="flex gap-2 flex-wrap">
                {MOOD_OPTIONS.map(option => (
                  <Button
                    key={option.value}
                    variant={mood === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMood(option.value)}
                    className={mood === option.value ? '' : option.color}
                  >
                    {option.emoji} {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Triggers */}
            <div>
              <label className="text-sm font-medium block mb-2">Что вызвало стресс?</label>
              <div className="flex gap-2 flex-wrap">
                {COMMON_TRIGGERS.map(trigger => (
                  <Badge
                    key={trigger}
                    variant={triggers.includes(trigger) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTrigger(trigger)}
                  >
                    {trigger}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Coping */}
            <div>
              <label className="text-sm font-medium block mb-2">Что помогло справиться?</label>
              <div className="flex gap-2 flex-wrap">
                {COPING_STRATEGIES.map(strategy => (
                  <Badge
                    key={strategy}
                    variant={copingUsed.includes(strategy) ? 'default' : 'outline'}
                    className="cursor-pointer bg-green-100 text-green-700 hover:bg-green-200"
                    onClick={() => toggleCoping(strategy)}
                  >
                    {strategy}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Inferior Function */}
            {inferiorFn && (
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Заметили активацию {inferiorFn}?</p>
                    <p className="text-sm text-gray-500">
                      {typeDesc?.stressPattern}
                    </p>
                  </div>
                  <Button
                    variant={inferiorActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInferiorActive(!inferiorActive)}
                  >
                    {inferiorActive ? 'Да' : 'Нет'}
                  </Button>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-sm font-medium block mb-2">Заметки (опционально)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Любые дополнительные мысли..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCheckIn(false)}
              >
                Отмена
              </Button>
              <Button
                onClick={saveCheckIn}
                disabled={saving}
                className="bg-red-500 hover:bg-red-600"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Сохранить
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Средний стресс</p>
                <p className="text-3xl font-bold">{getAverageStress()}/10</p>
              </div>
              <div className={`p-3 rounded-full ${getAverageStress() > 6 ? 'bg-red-100' : getAverageStress() > 4 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                <Flame className={`h-6 w-6 ${getAverageStress() > 6 ? 'text-red-500' : getAverageStress() > 4 ? 'text-yellow-500' : 'text-green-500'}`} />
              </div>
            </div>
            <Progress
              value={getAverageStress() * 10}
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Средняя энергия</p>
                <p className="text-3xl font-bold">{getAverageEnergy()}/10</p>
              </div>
              <div className={`p-3 rounded-full ${getAverageEnergy() < 4 ? 'bg-red-100' : getAverageEnergy() < 7 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                {getAverageEnergy() < 4 ? (
                  <BatteryLow className="h-6 w-6 text-red-500" />
                ) : getAverageEnergy() < 7 ? (
                  <BatteryMedium className="h-6 w-6 text-yellow-500" />
                ) : (
                  <BatteryFull className="h-6 w-6 text-green-500" />
                )}
              </div>
            </div>
            <Progress
              value={getAverageEnergy() * 10}
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Тренд стресса</p>
                <p className="text-3xl font-bold capitalize">
                  {getStressTrend() === 'increasing' ? 'Растёт' :
                   getStressTrend() === 'decreasing' ? 'Падает' : 'Стабильно'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                getStressTrend() === 'increasing' ? 'bg-red-100' :
                getStressTrend() === 'decreasing' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {getStressTrend() === 'increasing' ? (
                  <TrendingUp className="h-6 w-6 text-red-500" />
                ) : getStressTrend() === 'decreasing' ? (
                  <TrendingDown className="h-6 w-6 text-green-500" />
                ) : (
                  <Activity className="h-6 w-6 text-gray-500" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              За последние 7 дней vs предыдущие
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inferior Function Alert */}
      {inferiorFn && checkIns.filter(c => c.inferior_function_active).length > 2 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-800">Обнаружен паттерн активации {inferiorFn}</h3>
                <p className="text-amber-700 mt-1">
                  Вы отметили активацию подчинённой функции {checkIns.filter(c => c.inferior_function_active).length} раз за последний месяц.
                  Это может указывать на хронический стресс.
                </p>
                {inferiorDesc && (
                  <p className="text-sm text-amber-600 mt-2">
                    {inferiorDesc.name}: {inferiorDesc.challenges.join(', ')}
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
                  asChild
                >
                  <a href="/dashboard/shadow-work">
                    <Brain className="mr-2 h-4 w-4" />
                    Начать Shadow Work
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Check-ins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            История check-in
          </CardTitle>
          <CardDescription>
            Последние 30 дней
          </CardDescription>
        </CardHeader>
        <CardContent>
          {checkIns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Пока нет записей</p>
              <p className="text-sm">Начните отслеживать своё состояние</p>
            </div>
          ) : (
            <div className="space-y-3">
              {checkIns.slice(0, 10).map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-gray-50"
                >
                  <div className="text-center min-w-[60px]">
                    <p className="text-xs text-gray-500">
                      {new Date(checkIn.checked_in_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {MOOD_OPTIONS.find(m => m.value === checkIn.mood)?.emoji || '😐'}
                      </span>
                      <span className="text-sm font-medium">
                        Стресс: {checkIn.stress_level}/10
                      </span>
                      {checkIn.energy_level && (
                        <span className="text-sm text-gray-500">
                          · Энергия: {checkIn.energy_level}/10
                        </span>
                      )}
                      {checkIn.inferior_function_active && (
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">
                          {inferiorFn} активна
                        </Badge>
                      )}
                    </div>
                    {checkIn.triggers && checkIn.triggers.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {checkIn.triggers.map((t, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
