'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  Brain,
  MessageSquare,
  Lightbulb,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { TypeBadge } from '@/components/mbti/TypeBadge'
import {
  ALL_MBTI_TYPES,
  MBTI_TYPE_NAMES,
  COGNITIVE_FUNCTIONS,
  COGNITIVE_FUNCTION_DESCRIPTIONS,
  TYPE_DESCRIPTIONS,
  getTemperament,
  TEMPERAMENT_NAMES
} from '@/lib/mbti'
import type { MBTIType } from '@/types/database'

// Сценарии для симуляции
const SCENARIOS = [
  {
    id: 'brainstorm',
    title: 'Мозговой штурм',
    description: 'Команда обсуждает новый проект. Как разные типы будут участвовать?',
    icon: Lightbulb,
    context: 'Вы на совещании, где нужно придумать решение проблемы с клиентами.'
  },
  {
    id: 'conflict',
    title: 'Конфликт в команде',
    description: 'Возник спор о приоритетах. Как разные типы реагируют?',
    icon: AlertCircle,
    context: 'Два коллеги не согласны о том, какую задачу делать первой.'
  },
  {
    id: 'feedback',
    title: 'Обратная связь',
    description: 'Нужно дать критику коллеге. Как разные типы это делают?',
    icon: MessageSquare,
    context: 'Коллега сделал работу с ошибками, нужно это обсудить.'
  },
  {
    id: 'decision',
    title: 'Принятие решения',
    description: 'Срочное решение с неполной информацией. Как типы принимают решения?',
    icon: Brain,
    context: 'Нужно выбрать поставщика до конца дня, но данных мало.'
  },
]

// Реакции типов на сценарии
const TYPE_REACTIONS: Record<string, Record<MBTIType, { thought: string; action: string; tip: string }>> = {
  brainstorm: {
    INTJ: {
      thought: 'Сначала нужно понять корневую причину проблемы...',
      action: 'Молча анализирует, затем предлагает стратегическое решение',
      tip: 'Дайте INTJ время обдумать. Их идеи часто приходят позже, но глубже.'
    },
    INTP: {
      thought: 'А что если мы посмотрим на это с другой стороны...',
      action: 'Задаёт неожиданные вопросы, ищет логические несоответствия',
      tip: 'INTP видят паттерны, которые другие упускают. Слушайте их "странные" идеи.'
    },
    ENTJ: {
      thought: 'Давайте структурируем обсуждение и поставим цели',
      action: 'Берёт инициативу, организует процесс',
      tip: 'ENTJ эффективны в организации, но дайте другим высказаться.'
    },
    ENTP: {
      thought: 'Это напоминает мне другую ситуацию, когда...',
      action: 'Генерирует множество идей, играет в адвоката дьявола',
      tip: 'ENTP стимулируют дискуссию. Не все их идеи практичны, но они зажигают других.'
    },
    INFJ: {
      thought: 'Как это повлияет на клиентов в долгосрочной перспективе?',
      action: 'Предлагает решение с учётом человеческого фактора',
      tip: 'INFJ видят последствия для людей. Их интуиция часто точна.'
    },
    INFP: {
      thought: 'Это соответствует нашим ценностям как компании?',
      action: 'Оценивает идеи через призму аутентичности',
      tip: 'INFP могут молчать, но имеют глубокие мысли. Спросите их мнение напрямую.'
    },
    ENFJ: {
      thought: 'Давайте убедимся, что все высказались',
      action: 'Фасилитирует обсуждение, поддерживает участников',
      tip: 'ENFJ создают атмосферу для идей. Они могут упустить свои ради группы.'
    },
    ENFP: {
      thought: 'Представьте, если бы мы могли...',
      action: 'Предлагает креативные, нестандартные решения',
      tip: 'ENFP вдохновляют команду. Помогите им довести идеи до практики.'
    },
    ISTJ: {
      thought: 'Что работало раньше в похожих ситуациях?',
      action: 'Предлагает проверенные методы, указывает на риски',
      tip: 'ISTJ — память команды. Их осторожность предотвращает ошибки.'
    },
    ISFJ: {
      thought: 'Как это повлияет на сотрудников?',
      action: 'Думает о практической реализации и комфорте команды',
      tip: 'ISFJ видят детали, которые другие упускают. Их забота — ресурс.'
    },
    ESTJ: {
      thought: 'Какой бюджет и сроки?',
      action: 'Требует конкретики, фокусируется на реализуемости',
      tip: 'ESTJ приземляют идеи. Их вопросы помогают оценить реальность.'
    },
    ESFJ: {
      thought: 'Все ли согласны с этим направлением?',
      action: 'Ищет консенсус, беспокоится о групповой гармонии',
      tip: 'ESFJ чувствуют настроение группы. Они замечают, если кто-то молчит.'
    },
    ISTP: {
      thought: 'Как это будет работать технически?',
      action: 'Анализирует практичность, предлагает оптимизацию',
      tip: 'ISTP мало говорят, но когда говорят — это практично.'
    },
    ISFP: {
      thought: 'Насколько это аутентично для нашего бренда?',
      action: 'Оценивает эстетику и соответствие ценностям',
      tip: 'ISFP видят несоответствия. Их молчание может означать несогласие.'
    },
    ESTP: {
      thought: 'Давайте попробуем и посмотрим, что получится!',
      action: 'Предлагает быстрые эксперименты',
      tip: 'ESTP — двигатели действия. Их импульсивность может ускорить прогресс.'
    },
    ESFP: {
      thought: 'Это будет круто выглядеть для клиентов!',
      action: 'Фокусируется на впечатлении и опыте',
      tip: 'ESFP чувствуют, что "зайдёт" аудитории. Их энтузиазм заразителен.'
    },
  },
  conflict: {
    INTJ: {
      thought: 'Какой вариант объективно лучше для целей компании?',
      action: 'Пытается решить логически, может казаться холодным',
      tip: 'INTJ избегают эмоциональных конфликтов. Помогите им увидеть человеческую сторону.'
    },
    INTP: {
      thought: 'Обе стороны имеют свою логику...',
      action: 'Анализирует аргументы, может увлечься дебатами',
      tip: 'INTP увлекаются интеллектуальной стороной спора. Напомните о цели.'
    },
    ENTJ: {
      thought: 'Нужно принять решение и двигаться дальше',
      action: 'Быстро принимает сторону, может давить',
      tip: 'ENTJ хотят результата. Дайте им понять, что процесс тоже важен.'
    },
    ENTP: {
      thought: 'Интересно, а что если оба не правы?',
      action: 'Может обострить спор, предлагая третий вариант',
      tip: 'ENTP любят дискуссию. Их провокации — способ найти истину.'
    },
    INFJ: {
      thought: 'Что стоит за позицией каждого?',
      action: 'Пытается понять глубинные мотивы, ищет компромисс',
      tip: 'INFJ видят скрытые причины. Используйте их как медиаторов.'
    },
    INFP: {
      thought: 'Это несправедливо по отношению к...',
      action: 'Защищает того, кого считает обиженным',
      tip: 'INFP борются за справедливость. Их эмоции — сигнал о ценностях.'
    },
    ENFJ: {
      thought: 'Как мы можем сохранить отношения?',
      action: 'Активно медиирует, ищет win-win',
      tip: 'ENFJ — природные миротворцы. Они могут жертвовать своей позицией ради мира.'
    },
    ENFP: {
      thought: 'Давайте посмотрим на это с позитивной стороны',
      action: 'Пытается разрядить обстановку, предлагает компромисс',
      tip: 'ENFP избегают негатива. Помогите им не игнорировать реальные проблемы.'
    },
    ISTJ: {
      thought: 'Какие правила и процедуры это регулируют?',
      action: 'Обращается к установленному порядку',
      tip: 'ISTJ ищут опору в правилах. Это стабилизирует ситуацию.'
    },
    ISFJ: {
      thought: 'Как это влияет на командную атмосферу?',
      action: 'Беспокоится о последствиях для отношений',
      tip: 'ISFJ чувствуют напряжение команды. Их дискомфорт — индикатор проблемы.'
    },
    ESTJ: {
      thought: 'Кто прав по факту?',
      action: 'Быстро выносит суждение, может быть резким',
      tip: 'ESTJ ценят ясность. Их резкость — не злоба, а стремление к порядку.'
    },
    ESFJ: {
      thought: 'Давайте не будем ссориться...',
      action: 'Активно пытается примирить стороны',
      tip: 'ESFJ страдают от конфликтов. Дайте им знать, что несогласие — это нормально.'
    },
    ISTP: {
      thought: 'Это не моя проблема...',
      action: 'Может отстраниться или предложить практическое решение',
      tip: 'ISTP избегают драмы. Их отстранённость — не равнодушие.'
    },
    ISFP: {
      thought: 'Это не соответствует моим ценностям...',
      action: 'Может тихо уйти или неожиданно высказаться',
      tip: 'ISFP избегают конфликтов, но если затронуты ценности — взрываются.'
    },
    ESTP: {
      thought: 'Хватит говорить, давайте что-то делать!',
      action: 'Пытается перевести спор в действие',
      tip: 'ESTP теряют терпение от долгих обсуждений. Дайте им задачу.'
    },
    ESFP: {
      thought: 'Почему все такие серьёзные?',
      action: 'Пытается разрядить обстановку юмором',
      tip: 'ESFP избегают негатива. Их лёгкость может помочь или раздражать.'
    },
  },
  feedback: {
    INTJ: {
      thought: 'Нужно быть честным ради их развития',
      action: 'Даёт прямую, логичную критику',
      tip: 'INTJ честны, но могут забыть о feelings. Напомните добавить позитив.'
    },
    INTP: {
      thought: 'Как объяснить это логически?',
      action: 'Фокусируется на анализе ошибки, не на человеке',
      tip: 'INTP отделяют работу от личности. Это может казаться холодным.'
    },
    ENTJ: {
      thought: 'Это нужно исправить немедленно',
      action: 'Даёт чёткую, директивную обратную связь',
      tip: 'ENTJ прямолинейны. Их критика — про работу, не про человека.'
    },
    ENTP: {
      thought: 'Интересно, почему они так сделали?',
      action: 'Задаёт вопросы, превращает feedback в диалог',
      tip: 'ENTP делают критику менее болезненной через curiosity.'
    },
    INFJ: {
      thought: 'Как сказать так, чтобы не ранить?',
      action: 'Долго готовится, выбирает слова осторожно',
      tip: 'INFJ могут слишком смягчать. Помогите им быть конкретнее.'
    },
    INFP: {
      thought: 'Я не хочу их расстраивать...',
      action: 'Избегает критики или делает её очень мягко',
      tip: 'INFP ненавидят критиковать. Им нужна поддержка в этом.'
    },
    ENFJ: {
      thought: 'Как помочь им расти?',
      action: 'Обрамляет критику в развитие и поддержку',
      tip: 'ENFJ — мастера развивающей обратной связи.'
    },
    ENFP: {
      thought: 'Давайте начнём с хорошего!',
      action: 'Много позитива, критика может потеряться',
      tip: 'ENFP могут размывать критику. Помогите им быть конкретнее.'
    },
    ISTJ: {
      thought: 'Факты говорят сами за себя',
      action: 'Даёт детальную, фактологическую обратную связь',
      tip: 'ISTJ очень конкретны. Их критика — roadmap к исправлению.'
    },
    ISFJ: {
      thought: 'Как это сказать мягко?',
      action: 'Очень осторожен, может избегать критики',
      tip: 'ISFJ боятся обидеть. Их мягкость — забота, не слабость.'
    },
    ESTJ: {
      thought: 'Это не соответствует стандарту',
      action: 'Прямая, структурированная критика',
      tip: 'ESTJ говорят как есть. Это эффективно, но может ранить.'
    },
    ESFJ: {
      thought: 'Как сохранить хорошие отношения после этого?',
      action: 'Критикует осторожно, много заботится о feelings',
      tip: 'ESFJ балансируют честность и гармонию. Это ценный навык.'
    },
    ISTP: {
      thought: 'Вот что не работает и как это починить',
      action: 'Краткая, практичная критика',
      tip: 'ISTP говорят по делу. Их краткость — эффективность, не грубость.'
    },
    ISFP: {
      thought: 'Это так неловко...',
      action: 'Избегает или делает критику очень личной и мягкой',
      tip: 'ISFP критикуют через sharing своего опыта.'
    },
    ESTP: {
      thought: 'Вот ошибка, вот решение, двигаемся дальше',
      action: 'Быстрая, прямая, без церемоний',
      tip: 'ESTP не тратят время на формальности. Это экономит время.'
    },
    ESFP: {
      thought: 'Давайте не будем на этом зацикливаться',
      action: 'Быстро переходит к позитиву и решениям',
      tip: 'ESFP избегают негатива. Помогите им не игнорировать проблемы.'
    },
  },
  decision: {
    INTJ: {
      thought: 'Какой вариант соответствует долгосрочной стратегии?',
      action: 'Полагается на интуицию и анализ',
      tip: 'INTJ доверяют своему видению. Их решения часто оправдываются.'
    },
    INTP: {
      thought: 'Мне нужно больше данных...',
      action: 'Может затянуть с решением, анализируя варианты',
      tip: 'INTP склонны к параличу анализа. Установите deadline.'
    },
    ENTJ: {
      thought: 'Решение нужно сейчас, разберёмся по ходу',
      action: 'Быстро принимает решение и действует',
      tip: 'ENTJ действуют быстро. Их уверенность может быть преждевременной.'
    },
    ENTP: {
      thought: 'Какой вариант открывает больше возможностей?',
      action: 'Ищет гибкое решение с пространством для манёвра',
      tip: 'ENTP оставляют себе опции. Это мудро в неопределённости.'
    },
    INFJ: {
      thought: 'Что подсказывает интуиция?',
      action: 'Полагается на внутреннее чувство, потом рационализирует',
      tip: 'INFJ "знают" ответ до анализа. Их интуиция часто верна.'
    },
    INFP: {
      thought: 'Что соответствует нашим ценностям?',
      action: 'Оценивает варианты через призму ethics',
      tip: 'INFP принимают решения сердцем. Это не слабость — это компас.'
    },
    ENFJ: {
      thought: 'Как это повлияет на людей?',
      action: 'Учитывает человеческий фактор в первую очередь',
      tip: 'ENFJ помнят о people impact. Это важный lens для решений.'
    },
    ENFP: {
      thought: 'Какой вариант более волнующий?',
      action: 'Выбирает то, что вдохновляет',
      tip: 'ENFP идут за энтузиазмом. Помогите им проверить практичность.'
    },
    ISTJ: {
      thought: 'Что проверено и надёжно?',
      action: 'Выбирает более консервативный, проверенный вариант',
      tip: 'ISTJ минимизируют риск. Их осторожность спасает от ошибок.'
    },
    ISFJ: {
      thought: 'Какой вариант безопаснее для всех?',
      action: 'Думает о последствиях для людей',
      tip: 'ISFJ — guardians. Их забота предотвращает проблемы.'
    },
    ESTJ: {
      thought: 'Какой вариант эффективнее?',
      action: 'Выбирает по критериям ROI и эффективности',
      tip: 'ESTJ оптимизируют под результат. Это прагматично.'
    },
    ESFJ: {
      thought: 'Что думает команда?',
      action: 'Ищет консенсус или совет от доверенных людей',
      tip: 'ESFJ ценят коллективное мнение. Это democratic approach.'
    },
    ISTP: {
      thought: 'Что сработает здесь и сейчас?',
      action: 'Быстрое практичное решение',
      tip: 'ISTP решают в моменте. Их practical wisdom ценна.'
    },
    ISFP: {
      thought: 'Что чувствуется правильным?',
      action: 'Полагается на внутренние ценности',
      tip: 'ISFP знают что "не то". Их дискомфорт — red flag.'
    },
    ESTP: {
      thought: 'Давайте попробуем и посмотрим!',
      action: 'Действует быстро, готов корректировать',
      tip: 'ESTP — мастера iteration. Их bias to action полезен.'
    },
    ESFP: {
      thought: 'Какой вариант даст результат быстрее?',
      action: 'Выбирает то, что принесёт быстрый успех',
      tip: 'ESFP хотят видеть результат. Это мотивирует команду.'
    },
  },
}

export default function TypeSimulatorPage() {
  const [userType, setUserType] = useState<MBTIType | null>(null)
  const [selectedType, setSelectedType] = useState<MBTIType | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<string>('brainstorm')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserType()
  }, [])

  const loadUserType = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('mbti_type')
        .eq('id', user.id)
        .single()

      if (profile?.mbti_type) {
        setUserType(profile.mbti_type as MBTIType)
      }
    }
    setLoading(false)
  }

  const currentScenario = SCENARIOS.find(s => s.id === selectedScenario)!
  const currentReactions = TYPE_REACTIONS[selectedScenario]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="h-8 w-8 text-indigo-600" />
          Type Simulator
        </h1>
        <p className="text-gray-600 mt-1">
          Узнайте, как разные типы мыслят и действуют в рабочих ситуациях
        </p>
      </div>

      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Выберите сценарий</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-3">
            {SCENARIOS.map((scenario) => {
              const Icon = scenario.icon
              return (
                <Button
                  key={scenario.id}
                  variant={selectedScenario === scenario.id ? 'default' : 'outline'}
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => setSelectedType(null)}
                  asChild={false}
                >
                  <div onClick={() => setSelectedScenario(scenario.id)} className="cursor-pointer w-full text-center">
                    <Icon className="h-6 w-6 mx-auto" />
                    <span className="text-sm font-medium">{scenario.title}</span>
                  </div>
                </Button>
              )
            })}
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{currentScenario.context}</p>
          </div>
        </CardContent>
      </Card>

      {/* Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Выберите тип для симуляции</span>
            {selectedType && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedType(null)}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Сбросить
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            {userType && (
              <span>
                Ваш тип: <Badge className="ml-1">{userType}</Badge>
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {ALL_MBTI_TYPES.map((type) => {
              const isSelected = selectedType === type
              const isUser = userType === type

              return (
                <Button
                  key={type}
                  variant={isSelected ? 'default' : isUser ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className={`relative ${isUser ? 'ring-2 ring-indigo-300' : ''}`}
                >
                  {type}
                  {isUser && (
                    <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-indigo-500" />
                  )}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Simulation Result */}
      {selectedType && currentReactions[selectedType] && (
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader>
            <div className="flex items-center gap-4">
              <TypeBadge type={selectedType} size="lg" showName />
              <div>
                <CardTitle>{MBTI_TYPE_NAMES[selectedType].ru}</CardTitle>
                <CardDescription>
                  {TYPE_DESCRIPTIONS[selectedType].shortDescription}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cognitive Stack */}
            <div className="flex gap-2">
              {Object.entries(COGNITIVE_FUNCTIONS[selectedType]).map(([position, fn]) => (
                <Badge key={position} variant="outline" className="text-xs">
                  {position === 'dominant' ? '1st' :
                   position === 'auxiliary' ? '2nd' :
                   position === 'tertiary' ? '3rd' : '4th'}: {fn}
                </Badge>
              ))}
            </div>

            {/* Thought */}
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Что думает</p>
                  <p className="italic">&quot;{currentReactions[selectedType].thought}&quot;</p>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-start gap-3">
                <ArrowRight className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Как действует</p>
                  <p>{currentReactions[selectedType].action}</p>
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-amber-700 mb-1">Совет для работы с {selectedType}</p>
                  <p className="text-amber-800">{currentReactions[selectedType].tip}</p>
                </div>
              </div>
            </div>

            {/* Compare with user type */}
            {userType && userType !== selectedType && (
              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Сравнение с вашим типом ({userType})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Вы думаете:</p>
                      <p className="text-sm italic">&quot;{currentReactions[userType].thought}&quot;</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">{selectedType} думает:</p>
                      <p className="text-sm italic">&quot;{currentReactions[selectedType].thought}&quot;</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-indigo-800">
                      <strong>Ключевое различие:</strong> {' '}
                      {getTemperament(userType) === getTemperament(selectedType)
                        ? `Вы оба ${TEMPERAMENT_NAMES[getTemperament(userType)].ru}, но с разными когнитивными функциями.`
                        : `Вы ${TEMPERAMENT_NAMES[getTemperament(userType)].ru}, а ${selectedType} — ${TEMPERAMENT_NAMES[getTemperament(selectedType)].ru}. Это влияет на приоритеты.`
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* No selection prompt */}
      {!selectedType && (
        <Card className="bg-gray-50">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Выберите тип выше, чтобы увидеть, как он думает и действует в этом сценарии</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
