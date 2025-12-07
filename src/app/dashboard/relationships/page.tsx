'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Heart,
  Users,
  Briefcase,
  UserPlus,
  MessageCircle,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react'

// Type compatibility data based on cognitive functions
const TYPE_COMPATIBILITY: Record<string, Record<string, {
  score: number
  strengths: string[]
  challenges: string[]
  tips: string[]
}>> = {
  'INTJ': {
    'ENFP': {
      score: 95,
      strengths: ['Взаимодополняющие функции (Ni-Ne)', 'Глубокие интеллектуальные беседы', 'Баланс структуры и спонтанности'],
      challenges: ['Разный темп принятия решений', 'ENFP может казаться хаотичным', 'INTJ может казаться холодным'],
      tips: ['Цените энтузиазм ENFP', 'Делитесь своими планами открыто', 'Выделяйте время на спонтанность']
    },
    'ENTP': {
      score: 85,
      strengths: ['Интеллектуальное партнёрство', 'Любовь к идеям и инновациям', 'Взаимное уважение к логике'],
      challenges: ['Оба склонны к спорам', 'ENTP может не доводить до конца', 'Конкуренция за правоту'],
      tips: ['Превращайте споры в мозговые штурмы', 'Разделяйте зоны ответственности', 'Признавайте сильные стороны друг друга']
    },
    'INFJ': {
      score: 80,
      strengths: ['Одинаковая доминанта (Ni)', 'Понимание долгосрочного мышления', 'Глубина и значимость отношений'],
      challenges: ['Оба интроверты - нужно выходить из зоны комфорта', 'Разное отношение к эмоциям', 'Возможна изоляция от мира'],
      tips: ['Планируйте совместные выходы', 'INTJ: учитесь выражать эмоции', 'Создайте ритуалы общения']
    },
    'INTJ': {
      score: 70,
      strengths: ['Полное понимание друг друга', 'Эффективное партнёрство', 'Общие цели и методы'],
      challenges: ['Дублирование слепых зон', 'Конкуренция', 'Недостаток эмоциональной экспрессии'],
      tips: ['Сознательно развивайте Fe', 'Распределяйте лидерство', 'Добавляйте игривость']
    },
    'ESFP': {
      score: 45,
      strengths: ['Противоположные сильные стороны', 'ESFP помогает жить настоящим', 'Баланс планов и действий'],
      challenges: ['Очень разные приоритеты', 'Коммуникационные барьеры', 'Разное отношение к будущему'],
      tips: ['Найдите общие активности', 'Учитесь у противоположности', 'Терпение и принятие различий']
    }
  },
  'ENFP': {
    'INTJ': {
      score: 95,
      strengths: ['Интеллектуальная глубина', 'INTJ даёт структуру идеям ENFP', 'Взаимное вдохновение'],
      challenges: ['INTJ может казаться критичным', 'Разный темп жизни', 'Потребность в пространстве'],
      tips: ['Давайте INTJ время на размышление', 'Цените его преданность', 'Не принимайте критику лично']
    },
    'INFJ': {
      score: 90,
      strengths: ['Глубокое эмоциональное понимание', 'Общая любовь к идеям', 'Поддержка и принятие'],
      challenges: ['Оба идеалисты - возможно разочарование', 'INFJ нужно больше тишины', 'Переизбыток эмоций'],
      tips: ['Уважайте потребность INFJ в уединении', 'Делитесь мечтами', 'Поддерживайте друг друга в трудностях']
    },
    'ENFP': {
      score: 75,
      strengths: ['Бесконечный энтузиазм', 'Понимание спонтанности', 'Творческое партнёрство'],
      challenges: ['Хаос × 2', 'Кто будет организатором?', 'Сложности с завершением дел'],
      tips: ['Договоритесь о ролях', 'Используйте внешние системы организации', 'Празднуйте маленькие победы']
    }
  },
  'INFJ': {
    'ENFP': {
      score: 90,
      strengths: ['Эмоциональная глубина', 'Взаимное вдохновение', 'Понимание без слов'],
      challenges: ['ENFP нужно больше социальности', 'INFJ может чувствовать истощение', 'Разные энергетические уровни'],
      tips: ['Планируйте время вместе и отдельно', 'Открыто говорите о потребностях', 'Создайте баланс активности']
    },
    'ENTP': {
      score: 85,
      strengths: ['Интеллектуальная стимуляция', 'Разные но дополняющие перспективы', 'Взаимный рост'],
      challenges: ['ENTP может казаться нечувствительным', 'Разный подход к конфликтам', 'INFJ может обижаться'],
      tips: ['ENTP: учитесь мягкости', 'INFJ: говорите о чувствах прямо', 'Цените различия как силу']
    }
  },
  'ENTP': {
    'INFJ': {
      score: 85,
      strengths: ['Глубокие разговоры', 'Взаимное развитие', 'Баланс логики и эмоций'],
      challenges: ['ENTP может ранить словами', 'INFJ закрывается при конфликте', 'Разное отношение к гармонии'],
      tips: ['Будьте деликатны в критике', 'Давайте INFJ время обработать', 'Извиняйтесь искренне']
    },
    'INTJ': {
      score: 85,
      strengths: ['Партнёрство в идеях', 'Взаимное уважение интеллекта', 'Эффективность вместе'],
      challenges: ['Споры за лидерство', 'Оба упрямы', 'Разный темп работы'],
      tips: ['Чётко разделите роли', 'Споры - это нормально', 'Доводите проекты до конца']
    }
  }
}

// Default compatibility for types not in detailed data
const getCompatibility = (userType: string, otherType: string) => {
  if (TYPE_COMPATIBILITY[userType]?.[otherType]) {
    return TYPE_COMPATIBILITY[userType][otherType]
  }
  if (TYPE_COMPATIBILITY[otherType]?.[userType]) {
    const reverse = TYPE_COMPATIBILITY[otherType][userType]
    return {
      ...reverse,
      tips: reverse.tips.map(tip => tip) // Adjust tips if needed
    }
  }
  // Generate default based on function similarity
  return {
    score: 60,
    strengths: ['Возможность учиться друг у друга', 'Разные перспективы', 'Взаимодополнение'],
    challenges: ['Требуется больше усилий для понимания', 'Разные приоритеты', 'Коммуникационные различия'],
    tips: ['Изучите когнитивные функции друг друга', 'Проявляйте терпение', 'Фокусируйтесь на общих целях']
  }
}

// Relationship type descriptions
const RELATIONSHIP_TYPES = {
  partner: { label: 'Партнёр', icon: Heart, color: 'text-pink-500' },
  colleague: { label: 'Коллега', icon: Users, color: 'text-blue-500' },
  manager: { label: 'Руководитель', icon: Briefcase, color: 'text-amber-500' },
  subordinate: { label: 'Подчинённый', icon: UserPlus, color: 'text-green-500' },
  friend: { label: 'Друг', icon: Users, color: 'text-purple-500' },
  family: { label: 'Семья', icon: Heart, color: 'text-red-500' }
}

// Communication guides by type
const COMMUNICATION_GUIDES: Record<string, {
  doList: string[]
  dontList: string[]
  phrases: string[]
}> = {
  'INTJ': {
    doList: ['Будьте логичны и конкретны', 'Уважайте их время', 'Приходите с готовыми решениями', 'Давайте время на обдумывание'],
    dontList: ['Не тратьте время на small talk', 'Не давите эмоционально', 'Не меняйте планы в последний момент', 'Не критикуйте без обоснования'],
    phrases: ['Я проанализировал и предлагаю...', 'Какой план действий ты видишь?', 'Вот факты, давай обсудим', 'Мне нужно твоё экспертное мнение']
  },
  'ENFP': {
    doList: ['Будьте энтузиастичны', 'Делитесь идеями', 'Поддерживайте их мечты', 'Будьте гибкими'],
    dontList: ['Не будьте слишком критичны', 'Не игнорируйте эмоции', 'Не требуйте жёсткой структуры', 'Не обесценивайте энтузиазм'],
    phrases: ['Какие у тебя идеи?', 'Это звучит захватывающе!', 'Давай попробуем новый подход', 'Как ты себя чувствуешь по этому поводу?']
  },
  'INFJ': {
    doList: ['Будьте искренни', 'Слушайте внимательно', 'Уважайте их интуицию', 'Давайте время наедине'],
    dontList: ['Не будьте поверхностны', 'Не давите на быстрые решения', 'Не нарушайте их границы', 'Не обесценивайте их чувства'],
    phrases: ['Что ты чувствуешь по этому поводу?', 'Мне важно твоё мнение', 'Я ценю твою глубину', 'Давай поговорим наедине']
  },
  'ENTP': {
    doList: ['Будьте готовы к дебатам', 'Предлагайте новые идеи', 'Цените их креативность', 'Давайте свободу'],
    dontList: ['Не будьте слишком серьёзны', 'Не требуйте деталей сразу', 'Не воспринимайте критику лично', 'Не ограничивайте их'],
    phrases: ['А если посмотреть с другой стороны?', 'Интересная теория!', 'Давай покритикуем эту идею', 'Что если попробовать иначе?']
  },
  'ISTJ': {
    doList: ['Будьте точны и конкретны', 'Соблюдайте договорённости', 'Предоставляйте факты', 'Уважайте традиции'],
    dontList: ['Не меняйте планы резко', 'Не будьте расплывчаты', 'Не игнорируйте опыт', 'Не давите на инновации'],
    phrases: ['Вот конкретные данные', 'Как мы делали это раньше?', 'Давай составим план', 'Я выполню в срок']
  },
  'ISFJ': {
    doList: ['Будьте тёплыми и внимательными', 'Цените их заботу', 'Давайте чёткие инструкции', 'Выражайте благодарность'],
    dontList: ['Не будьте резкими', 'Не игнорируйте их вклад', 'Не меняйте правила внезапно', 'Не забывайте о деталях'],
    phrases: ['Спасибо за твою помощь', 'Как я могу тебе помочь?', 'Я ценю твоё внимание к деталям', 'Давай убедимся, что всем комфортно']
  }
}

// Get communication guide with fallback
const getCommunicationGuide = (type: string) => {
  return COMMUNICATION_GUIDES[type] || {
    doList: ['Изучите их когнитивные функции', 'Проявляйте уважение', 'Будьте открыты', 'Адаптируйтесь к их стилю'],
    dontList: ['Не навязывайте свой стиль', 'Не делайте поспешных выводов', 'Не игнорируйте их потребности'],
    phrases: ['Как тебе удобнее?', 'Что для тебя важно?', 'Давай найдём общий подход']
  }
}

// Conflict resolution by type pairing
const CONFLICT_TIPS: Record<string, Record<string, string[]>> = {
  'INTJ': {
    'ENFP': [
      'INTJ: выразите эмоции словами, не только логикой',
      'ENFP: дайте INTJ время собраться с мыслями',
      'Фокусируйтесь на решении, а не на эмоциях',
      'Признайте разные способы обработки конфликта'
    ],
    'ENTP': [
      'Не превращайте спор в борьбу эго',
      'Договоритесь о теме и границах дискуссии',
      'Признайте когда пора остановиться',
      'Используйте юмор для разрядки'
    ]
  }
}

const ALL_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
]

interface Relationship {
  id: string
  name: string
  type: keyof typeof RELATIONSHIP_TYPES
  theirType: string
  notes?: string
}

export default function RelationshipsPage() {
  // Mock user type - in real app would come from profile
  const userType = 'INTJ'

  const [relationships, setRelationships] = useState<Relationship[]>([
    { id: '1', name: 'Анна', type: 'partner', theirType: 'ENFP', notes: 'Вместе 3 года' },
    { id: '2', name: 'Руслан', type: 'manager', theirType: 'ENTJ', notes: 'Директор департамента' },
    { id: '3', name: 'Мария', type: 'colleague', theirType: 'ISFJ', notes: 'Работаем в одной команде' }
  ])

  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRelationship, setNewRelationship] = useState({
    name: '',
    type: 'colleague' as keyof typeof RELATIONSHIP_TYPES,
    theirType: 'ENFP',
    notes: ''
  })

  const [exploringType, setExploringType] = useState<string | null>(null)

  const addRelationship = () => {
    if (!newRelationship.name) return

    const relationship: Relationship = {
      id: Date.now().toString(),
      ...newRelationship
    }

    setRelationships([...relationships, relationship])
    setNewRelationship({ name: '', type: 'colleague', theirType: 'ENFP', notes: '' })
    setShowAddForm(false)
  }

  const deleteRelationship = (id: string) => {
    setRelationships(relationships.filter(r => r.id !== id))
    if (selectedRelationship?.id === id) {
      setSelectedRelationship(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Навигатор отношений</h1>
        <p className="text-muted-foreground">
          Понимайте других и улучшайте взаимодействие с помощью MBTI
        </p>
        <Badge variant="outline" className="mt-2">Ваш тип: {userType}</Badge>
      </div>

      <Tabs defaultValue="my-relationships" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-relationships">Мои отношения</TabsTrigger>
          <TabsTrigger value="explore">Исследовать типы</TabsTrigger>
          <TabsTrigger value="communication">Гид по общению</TabsTrigger>
        </TabsList>

        {/* My Relationships Tab */}
        <TabsContent value="my-relationships" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Relationships List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Люди в вашей жизни</h2>
                <Button size="sm" onClick={() => setShowAddForm(true)}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              </div>

              {showAddForm && (
                <Card className="p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Имя"
                    value={newRelationship.name}
                    onChange={e => setNewRelationship({...newRelationship, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                  <select
                    value={newRelationship.type}
                    onChange={e => setNewRelationship({...newRelationship, type: e.target.value as keyof typeof RELATIONSHIP_TYPES})}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    {Object.entries(RELATIONSHIP_TYPES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                  <select
                    value={newRelationship.theirType}
                    onChange={e => setNewRelationship({...newRelationship, theirType: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    {ALL_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Заметки (опционально)"
                    value={newRelationship.notes}
                    onChange={e => setNewRelationship({...newRelationship, notes: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addRelationship}>Сохранить</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>Отмена</Button>
                  </div>
                </Card>
              )}

              {relationships.map(rel => {
                const relType = RELATIONSHIP_TYPES[rel.type]
                const Icon = relType.icon
                const isSelected = selectedRelationship?.id === rel.id

                return (
                  <Card
                    key={rel.id}
                    className={`p-4 cursor-pointer transition-colors ${isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
                    onClick={() => setSelectedRelationship(rel)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-muted ${relType.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{rel.name}</div>
                          <div className="text-sm text-muted-foreground">{relType.label}</div>
                        </div>
                      </div>
                      <Badge variant="secondary">{rel.theirType}</Badge>
                    </div>
                    {rel.notes && (
                      <p className="text-xs text-muted-foreground mt-2">{rel.notes}</p>
                    )}
                  </Card>
                )
              })}

              {relationships.length === 0 && !showAddForm && (
                <Card className="p-6 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Добавьте людей, чтобы получить персонализированные советы
                  </p>
                </Card>
              )}
            </div>

            {/* Relationship Details */}
            <div className="md:col-span-2">
              {selectedRelationship ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {selectedRelationship.name}
                          <Badge>{selectedRelationship.theirType}</Badge>
                        </CardTitle>
                        <CardDescription>
                          {RELATIONSHIP_TYPES[selectedRelationship.type].label} •
                          Совместимость: {userType} ↔ {selectedRelationship.theirType}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRelationship(selectedRelationship.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(() => {
                      const compat = getCompatibility(userType, selectedRelationship.theirType)
                      const guide = getCommunicationGuide(selectedRelationship.theirType)

                      return (
                        <>
                          {/* Compatibility Score */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Совместимость</span>
                              <span className="text-lg font-bold">{compat.score}%</span>
                            </div>
                            <Progress value={compat.score} className="h-3" />
                          </div>

                          {/* Strengths */}
                          <div>
                            <h4 className="font-medium flex items-center gap-2 mb-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              Сильные стороны
                            </h4>
                            <ul className="space-y-1">
                              {compat.strengths.map((s, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-green-500">•</span> {s}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Challenges */}
                          <div>
                            <h4 className="font-medium flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              Возможные трудности
                            </h4>
                            <ul className="space-y-1">
                              {compat.challenges.map((c, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-amber-500">•</span> {c}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Tips */}
                          <div>
                            <h4 className="font-medium flex items-center gap-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-blue-500" />
                              Советы для улучшения
                            </h4>
                            <ul className="space-y-1">
                              {compat.tips.map((t, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-blue-500">•</span> {t}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Communication Quick Tips */}
                          <div className="pt-4 border-t">
                            <h4 className="font-medium flex items-center gap-2 mb-3">
                              <MessageCircle className="h-4 w-4 text-purple-500" />
                              Как общаться с {selectedRelationship.theirType}
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                                <div className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                                  ✓ Делайте
                                </div>
                                <ul className="text-xs space-y-1">
                                  {guide.doList.slice(0, 3).map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                                <div className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                                  ✗ Избегайте
                                </div>
                                <ul className="text-xs space-y-1">
                                  {guide.dontList.slice(0, 3).map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center p-8">
                  <div className="text-center">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Выберите человека</h3>
                    <p className="text-sm text-muted-foreground">
                      Нажмите на карточку слева, чтобы увидеть советы по взаимодействию
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Explore Types Tab */}
        <TabsContent value="explore" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Исследовать совместимость</CardTitle>
              <CardDescription>
                Выберите тип, чтобы узнать о совместимости с вашим типом ({userType})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3 mb-6">
                {ALL_TYPES.map(type => (
                  <Button
                    key={type}
                    variant={exploringType === type ? 'default' : 'outline'}
                    className="h-auto py-3"
                    onClick={() => setExploringType(type)}
                  >
                    <div className="text-center">
                      <div className="font-bold">{type}</div>
                      <div className="text-xs opacity-70">
                        {getCompatibility(userType, type).score}%
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              {exploringType && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {userType} <ArrowRight className="inline h-4 w-4 mx-2" /> {exploringType}
                    </h3>
                    <Badge variant="secondary" className="text-lg px-4">
                      {getCompatibility(userType, exploringType).score}%
                    </Badge>
                  </div>

                  {(() => {
                    const compat = getCompatibility(userType, exploringType)
                    return (
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                          <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">
                            Сильные стороны
                          </h4>
                          <ul className="text-sm space-y-1">
                            {compat.strengths.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
                          <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2">
                            Трудности
                          </h4>
                          <ul className="text-sm space-y-1">
                            {compat.challenges.map((c, i) => (
                              <li key={i}>• {c}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                            Советы
                          </h4>
                          <ul className="text-sm space-y-1">
                            {compat.tips.map((t, i) => (
                              <li key={i}>• {t}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Guide Tab */}
        <TabsContent value="communication" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(COMMUNICATION_GUIDES).map(([type, guide]) => (
              <Card key={type}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline" className="text-lg">{type}</Badge>
                    Гид по общению
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-green-600 mb-2">✓ Делайте</h4>
                    <ul className="text-sm space-y-1">
                      {guide.doList.map((item, i) => (
                        <li key={i} className="text-muted-foreground">• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-600 mb-2">✗ Избегайте</h4>
                    <ul className="text-sm space-y-1">
                      {guide.dontList.map((item, i) => (
                        <li key={i} className="text-muted-foreground">• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium text-purple-600 mb-2">
                      <Sparkles className="inline h-3 w-3 mr-1" />
                      Полезные фразы
                    </h4>
                    <ul className="text-sm space-y-1">
                      {guide.phrases.map((phrase, i) => (
                        <li key={i} className="text-muted-foreground italic">"{phrase}"</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
