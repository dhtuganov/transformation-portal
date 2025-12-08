'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { TypeBadge } from '@/components/mbti/TypeBadge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users,
  ArrowLeft,
  Heart,
  AlertTriangle,
  Zap,
  MessageCircle,
  Target,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react'
import type { MBTIType } from '@/types/database'
import {
  MBTI_TYPE_NAMES,
  ALL_MBTI_TYPES,
  TEMPERAMENTS,
  TEMPERAMENT_NAMES,
  TEMPERAMENT_COLORS,
  COGNITIVE_FUNCTIONS,
  getTemperament
} from '@/lib/mbti'

// Type compatibility data based on cognitive function alignment
const TYPE_COMPATIBILITY: Record<MBTIType, {
  ideal: MBTIType[]
  good: MBTIType[]
  neutral: MBTIType[]
  challenging: MBTIType[]
}> = {
  // NF Types
  ENFP: {
    ideal: ['INTJ', 'INFJ'],
    good: ['ENTJ', 'ENFJ', 'ENTP', 'INFP'],
    neutral: ['INTP', 'ISFJ', 'ESFJ', 'ISFP', 'ESFP'],
    challenging: ['ISTJ', 'ESTJ', 'ISTP', 'ESTP']
  },
  INFP: {
    ideal: ['ENFJ', 'ENTJ'],
    good: ['INFJ', 'ENFP', 'INTP', 'ENTP'],
    neutral: ['INTJ', 'ISFJ', 'ESFJ', 'ISFP', 'ESFP'],
    challenging: ['ISTJ', 'ESTJ', 'ISTP', 'ESTP']
  },
  ENFJ: {
    ideal: ['INFP', 'ISFP'],
    good: ['INFJ', 'ENFP', 'INTJ', 'INTP'],
    neutral: ['ENTJ', 'ENTP', 'ISFJ', 'ESFJ'],
    challenging: ['ISTJ', 'ESTJ', 'ISTP', 'ESTP']
  },
  INFJ: {
    ideal: ['ENFP', 'ENTP'],
    good: ['INFP', 'ENFJ', 'INTJ', 'INTP'],
    neutral: ['ENTJ', 'ISFJ', 'ESFJ', 'ISFP'],
    challenging: ['ISTJ', 'ESTJ', 'ISTP', 'ESTP', 'ESFP']
  },
  // NT Types
  ENTJ: {
    ideal: ['INFP', 'INTP'],
    good: ['INTJ', 'ENTP', 'ENFP', 'ENFJ'],
    neutral: ['INFJ', 'ESTJ', 'ISTJ', 'ISTP'],
    challenging: ['ISFJ', 'ESFJ', 'ISFP', 'ESFP', 'ESTP']
  },
  INTJ: {
    ideal: ['ENFP', 'ENTP'],
    good: ['ENTJ', 'INFJ', 'INFP', 'INTP'],
    neutral: ['ENFJ', 'ISTJ', 'ESTJ', 'ISTP'],
    challenging: ['ISFJ', 'ESFJ', 'ISFP', 'ESFP', 'ESTP']
  },
  ENTP: {
    ideal: ['INFJ', 'INTJ'],
    good: ['ENFP', 'ENTJ', 'INTP', 'ENFJ'],
    neutral: ['INFP', 'ESTJ', 'ISTP', 'ESTP'],
    challenging: ['ISTJ', 'ISFJ', 'ESFJ', 'ISFP', 'ESFP']
  },
  INTP: {
    ideal: ['ENTJ', 'ESTJ'],
    good: ['INTJ', 'ENTP', 'ENFP', 'INFJ'],
    neutral: ['INFP', 'ENFJ', 'ISTJ', 'ISTP'],
    challenging: ['ISFJ', 'ESFJ', 'ISFP', 'ESFP', 'ESTP']
  },
  // SJ Types
  ISTJ: {
    ideal: ['ESFP', 'ESTP'],
    good: ['ISFJ', 'ESTJ', 'ESFJ', 'ISTP'],
    neutral: ['INTJ', 'ENTJ', 'INTP', 'ISFP'],
    challenging: ['ENFP', 'INFP', 'ENFJ', 'INFJ', 'ENTP']
  },
  ISFJ: {
    ideal: ['ESFP', 'ESTP'],
    good: ['ISTJ', 'ESTJ', 'ESFJ', 'ISFP'],
    neutral: ['INFJ', 'ENFJ', 'ISTP', 'INTP'],
    challenging: ['ENFP', 'INFP', 'ENTJ', 'INTJ', 'ENTP']
  },
  ESTJ: {
    ideal: ['ISFP', 'ISTP'],
    good: ['ISTJ', 'ISFJ', 'ESFJ', 'ENTJ'],
    neutral: ['INTJ', 'INTP', 'ESTP', 'ESFP'],
    challenging: ['ENFP', 'INFP', 'ENFJ', 'INFJ', 'ENTP']
  },
  ESFJ: {
    ideal: ['ISFP', 'ISTP'],
    good: ['ISTJ', 'ISFJ', 'ESTJ', 'ENFJ'],
    neutral: ['INFJ', 'ENFP', 'ESTP', 'ESFP'],
    challenging: ['INFP', 'ENTJ', 'INTJ', 'ENTP', 'INTP']
  },
  // SP Types
  ISTP: {
    ideal: ['ESFJ', 'ESTJ'],
    good: ['ESTP', 'ISFP', 'ISTJ', 'ISFJ'],
    neutral: ['INTJ', 'ENTJ', 'INTP', 'ESFP'],
    challenging: ['ENFP', 'INFP', 'ENFJ', 'INFJ', 'ENTP']
  },
  ISFP: {
    ideal: ['ENFJ', 'ESFJ', 'ESTJ'],
    good: ['ISTP', 'ESTP', 'ESFP', 'ISFJ'],
    neutral: ['ISTJ', 'INFP', 'INFJ', 'INTJ'],
    challenging: ['ENFP', 'ENTJ', 'ENTP', 'INTP']
  },
  ESTP: {
    ideal: ['ISFJ', 'ISTJ'],
    good: ['ISTP', 'ISFP', 'ESFP', 'ESTJ'],
    neutral: ['ESFJ', 'ENTJ', 'ENTP', 'INTJ'],
    challenging: ['ENFP', 'INFP', 'ENFJ', 'INFJ', 'INTP']
  },
  ESFP: {
    ideal: ['ISFJ', 'ISTJ'],
    good: ['ISTP', 'ISFP', 'ESTP', 'ESFJ'],
    neutral: ['ESTJ', 'ENFJ', 'ENFP', 'INFJ'],
    challenging: ['INFP', 'ENTJ', 'INTJ', 'ENTP', 'INTP']
  }
}

// Communication tips between types
const COMMUNICATION_TIPS: Record<string, {
  approach: string[]
  avoid: string[]
  bridging: string
}> = {
  'NT-NF': {
    approach: [
      'Объясняйте логику за эмоциональными решениями',
      'Признавайте важность ценностей и смысла',
      'Давайте время для обработки эмоций'
    ],
    avoid: [
      'Игнорировать эмоциональный контекст',
      'Быть чрезмерно критичными к идеям',
      'Требовать немедленных решений'
    ],
    bridging: 'Фокус на общих целях и видении. NT предоставляет структуру, NF — вдохновение.'
  },
  'NT-SJ': {
    approach: [
      'Подкрепляйте идеи конкретными данными',
      'Уважайте установленные процессы',
      'Предоставляйте чёткие временные рамки'
    ],
    avoid: [
      'Отвергать опыт и традиции',
      'Менять планы без предупреждения',
      'Игнорировать детали реализации'
    ],
    bridging: 'NT привносит инновации, SJ — надёжность исполнения. Вместе создают устойчивые системы.'
  },
  'NT-SP': {
    approach: [
      'Предлагайте практические эксперименты',
      'Показывайте немедленную пользу идей',
      'Будьте готовы к спонтанным изменениям'
    ],
    avoid: [
      'Застревать в теоретических обсуждениях',
      'Игнорировать практический опыт',
      'Навязывать долгосрочные планы'
    ],
    bridging: 'NT даёт стратегическое направление, SP — быстрое тестирование в реальности.'
  },
  'NF-SJ': {
    approach: [
      'Связывайте ценности с конкретными действиями',
      'Уважайте потребность в стабильности',
      'Показывайте практическую пользу идей'
    ],
    avoid: [
      'Игнорировать установленные правила',
      'Требовать резких изменений',
      'Критиковать традиции без понимания'
    ],
    bridging: 'NF вдохновляет на позитивные изменения, SJ обеспечивает их устойчивость.'
  },
  'NF-SP': {
    approach: [
      'Будьте спонтанны и открыты',
      'Цените момент, не только будущее',
      'Поддерживайте практические эксперименты'
    ],
    avoid: [
      'Чрезмерно анализировать действия',
      'Навязывать глубокий смысл всему',
      'Ограничивать свободу действий'
    ],
    bridging: 'NF привносит глубину смысла, SP — радость настоящего момента.'
  },
  'SJ-SP': {
    approach: [
      'Объясняйте практическую пользу правил',
      'Давайте пространство для адаптации',
      'Цените навыки решения проблем'
    ],
    avoid: [
      'Настаивать на жёстком следовании процедурам',
      'Критиковать импровизацию',
      'Игнорировать актуальный контекст'
    ],
    bridging: 'SJ создаёт надёжную основу, SP адаптирует под текущие условия.'
  }
}

function getCompatibilityLevel(userType: MBTIType, otherType: MBTIType): 'ideal' | 'good' | 'neutral' | 'challenging' {
  const compatibility = TYPE_COMPATIBILITY[userType]
  if (compatibility.ideal.includes(otherType)) return 'ideal'
  if (compatibility.good.includes(otherType)) return 'good'
  if (compatibility.challenging.includes(otherType)) return 'challenging'
  return 'neutral'
}

function getCompatibilityColor(level: 'ideal' | 'good' | 'neutral' | 'challenging') {
  switch (level) {
    case 'ideal': return 'bg-green-100 text-green-800 border-green-300'
    case 'good': return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'neutral': return 'bg-gray-100 text-gray-800 border-gray-300'
    case 'challenging': return 'bg-amber-100 text-amber-800 border-amber-300'
  }
}

function getCompatibilityLabel(level: 'ideal' | 'good' | 'neutral' | 'challenging') {
  switch (level) {
    case 'ideal': return 'Идеальная пара'
    case 'good': return 'Хорошая совместимость'
    case 'neutral': return 'Нейтрально'
    case 'challenging': return 'Требует усилий'
  }
}

function getCommunicationKey(type1: MBTIType, type2: MBTIType): string {
  const getGroup = (type: MBTIType) => {
    if (TEMPERAMENTS.analysts.includes(type)) return 'NT'
    if (TEMPERAMENTS.diplomats.includes(type)) return 'NF'
    if (TEMPERAMENTS.sentinels.includes(type)) return 'SJ'
    return 'SP'
  }

  const group1 = getGroup(type1)
  const group2 = getGroup(type2)

  if (group1 === group2) return `${group1}-${group1}`

  const key = [group1, group2].sort().join('-')
  return key
}

export default function TeamBuilderPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<MBTIType | null>(null)
  const [selectedType, setSelectedType] = useState<MBTIType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('mbti_type')
        .eq('id', user.id)
        .single<{ mbti_type: string | null }>()

      if (profileData?.mbti_type) {
        setUserType(profileData.mbti_type as MBTIType)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!userType) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/my-type">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Link>
          </Button>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Тип личности не определён</h2>
            <p className="text-muted-foreground mb-6">
              Пройдите тест MBTI, чтобы узнать свой тип и получить рекомендации по работе в команде
            </p>
            <Button asChild>
              <Link href="/dashboard/quizzes">Пройти тест</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const compatibility = TYPE_COMPATIBILITY[userType]
  const userTemperament = getTemperament(userType)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/my-type">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Мой тип
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <Users className="h-10 w-10 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">Team Builder</h1>
              <p className="text-muted-foreground">
                Понимание совместимости типов помогает строить эффективные команды и улучшать коммуникацию
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ваш тип:</span>
              <TypeBadge type={userType} size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="compatibility" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compatibility" className="gap-2">
            <Heart className="h-4 w-4 hidden sm:block" />
            Совместимость
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-2">
            <Target className="h-4 w-4 hidden sm:block" />
            Сравнение типов
          </TabsTrigger>
          <TabsTrigger value="tips" className="gap-2">
            <MessageCircle className="h-4 w-4 hidden sm:block" />
            Советы
          </TabsTrigger>
        </TabsList>

        {/* Compatibility Tab */}
        <TabsContent value="compatibility" className="space-y-6">
          {/* Compatibility Matrix */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ideal */}
            <Card className="border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-green-700">
                  <Heart className="h-4 w-4" />
                  Идеальные партнёры
                </CardTitle>
                <CardDescription>Естественное взаимопонимание</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {compatibility.ideal.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className="hover:scale-105 transition-transform"
                    >
                      <TypeBadge type={type} size="sm" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Good */}
            <Card className="border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Хорошая совместимость
                </CardTitle>
                <CardDescription>Продуктивное взаимодействие</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {compatibility.good.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className="hover:scale-105 transition-transform"
                    >
                      <TypeBadge type={type} size="sm" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Neutral */}
            <Card className="border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-gray-700">
                  <Info className="h-4 w-4" />
                  Нейтрально
                </CardTitle>
                <CardDescription>Зависит от контекста</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {compatibility.neutral.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className="hover:scale-105 transition-transform"
                    >
                      <TypeBadge type={type} size="sm" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Challenging */}
            <Card className="border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  Требует усилий
                </CardTitle>
                <CardDescription>Потенциал для роста</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {compatibility.challenging.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className="hover:scale-105 transition-transform"
                    >
                      <TypeBadge type={type} size="sm" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Type Detail */}
          {selectedType && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <TypeBadge type={selectedType} size="lg" />
                    <div>
                      <CardTitle>{selectedType} — {MBTI_TYPE_NAMES[selectedType].ru}</CardTitle>
                      <CardDescription>{MBTI_TYPE_NAMES[selectedType].en}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getCompatibilityColor(getCompatibilityLevel(userType, selectedType))}>
                    {getCompatibilityLabel(getCompatibilityLevel(userType, selectedType))}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Communication Tips for this pair */}
                {(() => {
                  const commKey = getCommunicationKey(userType, selectedType)
                  const tips = COMMUNICATION_TIPS[commKey]
                  if (!tips) return null

                  return (
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Подходы
                        </h4>
                        <ul className="space-y-1">
                          {tips.approach.map((tip, i) => (
                            <li key={i} className="text-sm text-muted-foreground">• {tip}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                        <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          Избегайте
                        </h4>
                        <ul className="space-y-1">
                          {tips.avoid.map((tip, i) => (
                            <li key={i} className="text-sm text-muted-foreground">• {tip}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Синергия
                        </h4>
                        <p className="text-sm text-muted-foreground">{tips.bridging}</p>
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}

          {/* Temperament Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Группы темперамента
              </CardTitle>
              <CardDescription>
                Типы внутри одной группы разделяют базовые ценности и стиль коммуникации
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(TEMPERAMENTS).map(([key, types]) => {
                  const isUserGroup = types.includes(userType)
                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border-2 ${isUserGroup ? 'border-primary bg-primary/5' : 'border-muted'}`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: TEMPERAMENT_COLORS[key as keyof typeof TEMPERAMENT_COLORS] }}
                        />
                        <h4 className="font-medium">{TEMPERAMENT_NAMES[key].ru}</h4>
                        {isUserGroup && <Badge variant="secondary" className="text-xs">Ваша группа</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {types.map((type) => (
                          <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`hover:scale-105 transition-transform ${type === userType ? 'ring-2 ring-primary ring-offset-2 rounded' : ''}`}
                          >
                            <TypeBadge type={type} size="xs" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Сравнение типов</CardTitle>
              <CardDescription>Выберите тип для сравнения когнитивных функций</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select
                value={selectedType || ''}
                onValueChange={(value) => setSelectedType(value as MBTIType)}
              >
                <SelectTrigger className="w-full sm:w-[280px]">
                  <SelectValue placeholder="Выберите тип для сравнения" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_MBTI_TYPES.filter(t => t !== userType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type} — {MBTI_TYPE_NAMES[type].ru}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedType && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* User's Functions */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <TypeBadge type={userType} size="md" />
                      <div>
                        <h4 className="font-medium">{userType}</h4>
                        <p className="text-sm text-muted-foreground">Ваши функции</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {(['dominant', 'auxiliary', 'tertiary', 'inferior'] as const).map((position, index) => {
                        const func = COGNITIVE_FUNCTIONS[userType][position]
                        const colors = ['bg-green-500', 'bg-blue-500', 'bg-amber-500', 'bg-red-500']
                        const labels = ['Доминантная', 'Вспомогательная', 'Третичная', 'Подчинённая']
                        return (
                          <div key={position} className="flex items-center gap-3 p-2 rounded bg-muted/50">
                            <div className={`w-2 h-8 rounded ${colors[index]}`} />
                            <div>
                              <span className="font-mono font-medium">{func}</span>
                              <span className="text-xs text-muted-foreground ml-2">{labels[index]}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Selected Type's Functions */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <TypeBadge type={selectedType} size="md" />
                      <div>
                        <h4 className="font-medium">{selectedType}</h4>
                        <p className="text-sm text-muted-foreground">{MBTI_TYPE_NAMES[selectedType].ru}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {(['dominant', 'auxiliary', 'tertiary', 'inferior'] as const).map((position, index) => {
                        const func = COGNITIVE_FUNCTIONS[selectedType][position]
                        const userFunc = COGNITIVE_FUNCTIONS[userType][position]
                        const colors = ['bg-green-500', 'bg-blue-500', 'bg-amber-500', 'bg-red-500']
                        const labels = ['Доминантная', 'Вспомогательная', 'Третичная', 'Подчинённая']
                        const isMatch = func === userFunc
                        return (
                          <div
                            key={position}
                            className={`flex items-center gap-3 p-2 rounded ${isMatch ? 'bg-green-100 dark:bg-green-950/30' : 'bg-muted/50'}`}
                          >
                            <div className={`w-2 h-8 rounded ${colors[index]}`} />
                            <div className="flex-1">
                              <span className="font-mono font-medium">{func}</span>
                              <span className="text-xs text-muted-foreground ml-2">{labels[index]}</span>
                            </div>
                            {isMatch && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Коммуникация между группами темперамента
              </CardTitle>
              <CardDescription>
                Общие рекомендации для эффективного взаимодействия
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(COMMUNICATION_TIPS).map(([key, tips]) => {
                  const [group1, group2] = key.split('-')
                  const name1 = group1 === 'NT' ? 'Аналитики' : group1 === 'NF' ? 'Дипломаты' : group1 === 'SJ' ? 'Хранители' : 'Искатели'
                  const name2 = group2 === 'NT' ? 'Аналитики' : group2 === 'NF' ? 'Дипломаты' : group2 === 'SJ' ? 'Хранители' : 'Искатели'

                  const isRelevant = (
                    (getTemperament(userType) === 'analysts' && (group1 === 'NT' || group2 === 'NT')) ||
                    (getTemperament(userType) === 'diplomats' && (group1 === 'NF' || group2 === 'NF')) ||
                    (getTemperament(userType) === 'sentinels' && (group1 === 'SJ' || group2 === 'SJ')) ||
                    (getTemperament(userType) === 'explorers' && (group1 === 'SP' || group2 === 'SP'))
                  )

                  return (
                    <Card key={key} className={isRelevant ? 'border-primary' : ''}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>{name1} ↔ {name2}</span>
                          {isRelevant && <Badge variant="secondary" className="text-xs">Для вас</Badge>}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{tips.bridging}</p>
                        <div className="text-xs">
                          <span className="text-green-600 font-medium">+</span>
                          <span className="text-muted-foreground ml-1">{tips.approach[0]}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-red-600 font-medium">-</span>
                          <span className="text-muted-foreground ml-1">{tips.avoid[0]}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* General Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Универсальные принципы командной работы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Разнообразие — сила</h4>
                  <p className="text-sm text-muted-foreground">
                    Команды с разными типами принимают более взвешенные решения
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Уважение различий</h4>
                  <p className="text-sm text-muted-foreground">
                    Разные подходы — не хуже или лучше, а просто другие
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Гибкость стиля</h4>
                  <p className="text-sm text-muted-foreground">
                    Адаптируйте коммуникацию под собеседника для лучшего понимания
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Слепые зоны</h4>
                  <p className="text-sm text-muted-foreground">
                    Ищите в команде людей, чьи сильные стороны компенсируют ваши слабые
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Конфликт как рост</h4>
                  <p className="text-sm text-muted-foreground">
                    Трения между типами — возможность для развития обеих сторон
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Роли по силам</h4>
                  <p className="text-sm text-muted-foreground">
                    Распределяйте задачи с учётом естественных склонностей типов
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
