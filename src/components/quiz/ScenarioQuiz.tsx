'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Users,
  MessageSquare,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  Brain
} from 'lucide-react'
import type { MBTIType } from '@/types/database'

// ===========================================
// TYPES
// ===========================================

interface ScenarioOption {
  id: string
  text: string
  mbtiAlignment: Partial<Record<MBTIType, number>> // Which types would choose this
  feedback: string
  isOptimal?: boolean // Best answer for the scenario
}

interface Scenario {
  id: string
  title: string
  context: string
  situation: string
  stakeholders?: string[]
  options: ScenarioOption[]
  learningPoint: string
  category: 'communication' | 'leadership' | 'conflict' | 'decision' | 'teamwork'
}

interface ScenarioQuizProps {
  scenarios: Scenario[]
  userMbtiType?: MBTIType | null
  onComplete?: (results: ScenarioResult[]) => void
  className?: string
}

interface ScenarioResult {
  scenarioId: string
  selectedOptionId: string
  alignmentScore: number // 0-100 how well it aligns with user's type
  wasOptimal: boolean
}

// ===========================================
// SAMPLE SCENARIOS (Workplace situations)
// ===========================================

export const WORKPLACE_SCENARIOS: Scenario[] = [
  {
    id: 'deadline-pressure',
    title: 'Срочный дедлайн',
    context: 'Вы руководитель проекта. До сдачи проекта клиенту осталось 2 дня.',
    situation: 'Один из ключевых разработчиков сообщает, что обнаружил серьёзный баг, исправление которого займёт минимум 3 дня. Команда уже работает сверхурочно.',
    stakeholders: ['Клиент', 'Команда разработки', 'Руководство'],
    category: 'decision',
    options: [
      {
        id: 'a',
        text: 'Немедленно сообщить клиенту о задержке и предложить промежуточную версию без критичного функционала',
        mbtiAlignment: { INTJ: 90, ENTJ: 85, ISTJ: 80, ESTJ: 75, INTP: 70 },
        feedback: 'Прямой и честный подход. Вы цените прозрачность и долгосрочные отношения выше краткосрочного комфорта.',
        isOptimal: true
      },
      {
        id: 'b',
        text: 'Собрать команду на мозговой штурм — возможно, есть креативное решение, которое мы не рассмотрели',
        mbtiAlignment: { ENTP: 90, ENFP: 85, INFP: 75, INTP: 80, ENFJ: 70 },
        feedback: 'Вы верите в силу коллективного интеллекта и нестандартных решений. Это может сработать, но требует времени.',
      },
      {
        id: 'c',
        text: 'Предложить команде дополнительную мотивацию (бонусы/отгулы) за работу в интенсивном режиме до дедлайна',
        mbtiAlignment: { ESFJ: 85, ENFJ: 80, ESFP: 75, ESTP: 70, ISFJ: 65 },
        feedback: 'Вы фокусируетесь на людях и их потребностях. Важно не перегрузить команду.',
      },
      {
        id: 'd',
        text: 'Проанализировать баг самостоятельно — возможно, его можно временно обойти или он не так критичен',
        mbtiAlignment: { ISTP: 90, INTP: 85, INTJ: 75, ISTJ: 70, ESTP: 65 },
        feedback: 'Вы предпочитаете разобраться в проблеме лично, прежде чем эскалировать. Практичный подход.',
      }
    ],
    learningPoint: 'В кризисных ситуациях важен баланс между честностью с клиентом, заботой о команде и поиском решений. Разные типы MBTI склонны к разным стратегиям — все могут быть эффективны в зависимости от контекста.'
  },
  {
    id: 'team-conflict',
    title: 'Конфликт в команде',
    context: 'Вы HR-бизнес-партнёр. К вам обратились два сотрудника с жалобами друг на друга.',
    situation: 'Маркетолог (ENFP) жалуется, что аналитик (ISTJ) "душит креатив" своими требованиями к данным. Аналитик считает, что маркетолог "витает в облаках" и не подкрепляет идеи фактами.',
    stakeholders: ['Маркетолог', 'Аналитик', 'Руководитель отдела'],
    category: 'conflict',
    options: [
      {
        id: 'a',
        text: 'Провести совместную сессию, где каждый объяснит свой подход к работе и его ценность для команды',
        mbtiAlignment: { ENFJ: 90, INFJ: 85, ENFP: 80, ESFJ: 75, INFP: 70 },
        feedback: 'Вы верите в силу взаимопонимания и эмпатии. Это долгосрочное решение, формирующее культуру.',
        isOptimal: true
      },
      {
        id: 'b',
        text: 'Создать чёткий процесс: сначала идеи, потом валидация данными, с определёнными сроками для каждого этапа',
        mbtiAlignment: { ESTJ: 90, ISTJ: 85, ENTJ: 80, INTJ: 75, ISTP: 65 },
        feedback: 'Вы предпочитаете системные решения. Структура снижает конфликты, но важно не убить креативность.',
      },
      {
        id: 'c',
        text: 'Предложить им поработать над небольшим совместным проектом, чтобы лучше понять стиль друг друга',
        mbtiAlignment: { ESFP: 85, ESTP: 80, ENFP: 75, ENTP: 70, ISFP: 65 },
        feedback: 'Вы верите, что практический опыт важнее теории. Отличный способ построить rapport.',
      },
      {
        id: 'd',
        text: 'Поговорить с каждым отдельно, помочь увидеть ситуацию глазами другого, не форсируя совместную встречу',
        mbtiAlignment: { INFJ: 90, INFP: 85, ISFJ: 80, ISFP: 75, INTP: 65 },
        feedback: 'Вы уважаете личное пространство и понимаете, что не все готовы к открытой конфронтации сразу.',
      }
    ],
    learningPoint: 'Конфликты между разными типами часто возникают из-за разных ценностей и подходов к работе. Понимание MBTI помогает увидеть, что оба подхода ценны и дополняют друг друга.'
  },
  {
    id: 'new-initiative',
    title: 'Новая инициатива',
    context: 'Вы предложили руководству внедрить новую систему OKR для повышения прозрачности целей.',
    situation: 'На презентации часть руководителей отнеслась скептически: "У нас и так всё работает", "Это очередная модная методология". Как вы будете продвигать идею?',
    stakeholders: ['Скептики', 'Сторонники', 'Топ-менеджмент'],
    category: 'leadership',
    options: [
      {
        id: 'a',
        text: 'Подготовить детальный бизнес-кейс с ROI, примерами из индустрии и поэтапным планом внедрения',
        mbtiAlignment: { INTJ: 95, ENTJ: 90, ISTJ: 85, ESTJ: 80, INTP: 75 },
        feedback: 'Вы знаете, что данные и логика — лучшие аргументы для скептиков. Основательный подход.',
        isOptimal: true
      },
      {
        id: 'b',
        text: 'Найти союзников среди руководителей и запустить пилот в их подразделениях, чтобы показать результат на практике',
        mbtiAlignment: { ENTP: 90, ESTP: 85, ENFJ: 80, ENTJ: 75, ESFJ: 70 },
        feedback: 'Вы понимаете силу социального доказательства и политики. Прагматичная стратегия.',
      },
      {
        id: 'c',
        text: 'Провести индивидуальные встречи со скептиками, понять их реальные опасения и адаптировать предложение',
        mbtiAlignment: { INFJ: 90, ENFJ: 85, ISFJ: 80, INFP: 75, ESFJ: 70 },
        feedback: 'Вы цените каждого человека и понимаете, что за скептицизмом часто стоят реальные проблемы.',
      },
      {
        id: 'd',
        text: 'Дать идее "отлежаться" — возможно, время ещё не пришло, и стоит вернуться к ней через полгода',
        mbtiAlignment: { ISFP: 80, INFP: 75, ISTP: 70, INTP: 65, ISFJ: 60 },
        feedback: 'Вы не склонны к конфронтации и понимаете, что timing важен. Но будьте осторожны — идеи могут устареть.',
      }
    ],
    learningPoint: 'Продвижение изменений требует понимания аудитории. Разные люди убеждаются разными аргументами: данными, примерами, личным отношением или временем.'
  },
  {
    id: 'feedback-session',
    title: 'Обратная связь',
    context: 'Вы менеджер. Пришло время ежеквартальной обратной связи одному из сотрудников.',
    situation: 'Сотрудник технически силён, но регулярно опаздывает на встречи, не всегда отвечает в чатах и коллеги жалуются на его недоступность. Как построить разговор?',
    stakeholders: ['Сотрудник', 'Команда'],
    category: 'communication',
    options: [
      {
        id: 'a',
        text: 'Начать с признания его технической экспертизы, затем конкретно описать проблемное поведение и его влияние на команду',
        mbtiAlignment: { ENTJ: 90, ESTJ: 85, INTJ: 80, ENFJ: 75, ISTJ: 70 },
        feedback: 'Классический "сэндвич" обратной связи с фокусом на конкретике. Эффективно, но важен тон.',
        isOptimal: true
      },
      {
        id: 'b',
        text: 'Спросить, как он сам оценивает свою работу и взаимодействие с командой — дать возможность самому увидеть проблему',
        mbtiAlignment: { INFJ: 90, ENFJ: 85, INFP: 80, ENFP: 75, ISFJ: 65 },
        feedback: 'Вы верите в силу self-discovery. Это работает с осознанными людьми, но может затянуться.',
      },
      {
        id: 'c',
        text: 'Показать конкретные метрики: сколько встреч пропущено, среднее время ответа в чатах, feedback от коллег',
        mbtiAlignment: { ISTJ: 90, ISTP: 85, INTJ: 80, INTP: 75, ESTJ: 70 },
        feedback: 'Вы предпочитаете факты эмоциям. Объективно и неопровержимо, но может восприниматься как холодно.',
      },
      {
        id: 'd',
        text: 'Узнать, всё ли в порядке лично — возможно, за поведением стоят проблемы, о которых мы не знаем',
        mbtiAlignment: { ISFJ: 90, ESFJ: 85, INFP: 80, ISFP: 75, ENFP: 65 },
        feedback: 'Вы заботитесь о человеке в первую очередь. Важный first step, но не забудьте вернуться к рабочим вопросам.',
      }
    ],
    learningPoint: 'Эффективная обратная связь учитывает и задачу (исправить поведение), и отношения (сохранить мотивацию). Разные подходы работают для разных людей и ситуаций.'
  },
  {
    id: 'remote-onboarding',
    title: 'Удалённый онбординг',
    context: 'К вам в команду выходит новый сотрудник. Вся команда работает удалённо.',
    situation: 'Новичок — интроверт (INTP), который на собеседовании показал высокую экспертизу, но был немногословен. Как организовать его первую неделю?',
    stakeholders: ['Новый сотрудник', 'Команда', 'HR'],
    category: 'teamwork',
    options: [
      {
        id: 'a',
        text: 'Подготовить подробную документацию, дать время на самостоятельное изучение, предложить 1-на-1 встречи по запросу',
        mbtiAlignment: { INTP: 95, INTJ: 90, ISTP: 85, ISTJ: 80, INFP: 70 },
        feedback: 'Идеально для интровертов! Вы даёте автономию и не давите социальным давлением. Правильный выбор для этого человека.',
        isOptimal: true
      },
      {
        id: 'b',
        text: 'Организовать серию коротких знакомств со всеми членами команды в первые дни — важно быстро интегрироваться',
        mbtiAlignment: { ENFJ: 90, ESFJ: 85, ENFP: 80, ESFP: 75, ESTJ: 65 },
        feedback: 'Отлично работает для экстравертов, но может overwhelm интроверта. Учитывайте тип человека.',
      },
      {
        id: 'c',
        text: 'Назначить buddy из команды, который будет основным контактом для всех вопросов',
        mbtiAlignment: { ISFJ: 85, ESFJ: 80, ENFJ: 75, INFJ: 70, ISFP: 65 },
        feedback: 'Хороший баланс — один контакт вместо многих. Убедитесь, что buddy понимает стиль работы интроверта.',
      },
      {
        id: 'd',
        text: 'Сразу дать небольшую реальную задачу — обучение через практику эффективнее теории',
        mbtiAlignment: { ESTP: 90, ISTP: 85, ENTP: 80, ENTJ: 75, ESTJ: 70 },
        feedback: 'Практичный подход, особенно для технических специалистов. Но убедитесь, что есть поддержка при вопросах.',
      }
    ],
    learningPoint: 'Онбординг должен учитывать личность нового сотрудника. То, что работает для экстраверта, может быть стрессом для интроверта, и наоборот.'
  }
]

// ===========================================
// CATEGORY ICONS
// ===========================================

const CATEGORY_ICONS: Record<Scenario['category'], React.ReactNode> = {
  communication: <MessageSquare className="h-4 w-4" />,
  leadership: <Users className="h-4 w-4" />,
  conflict: <Users className="h-4 w-4" />,
  decision: <Lightbulb className="h-4 w-4" />,
  teamwork: <Users className="h-4 w-4" />,
}

const CATEGORY_LABELS: Record<Scenario['category'], string> = {
  communication: 'Коммуникация',
  leadership: 'Лидерство',
  conflict: 'Конфликты',
  decision: 'Решения',
  teamwork: 'Командная работа',
}

// ===========================================
// SCENARIO QUIZ COMPONENT
// ===========================================

export function ScenarioQuiz({
  scenarios,
  userMbtiType,
  onComplete,
  className
}: ScenarioQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(-1) // -1 = intro
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [results, setResults] = useState<ScenarioResult[]>([])

  const currentScenario = scenarios[currentIndex]
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / scenarios.length) * 100 : 0
  const isComplete = currentIndex >= scenarios.length

  // Calculate alignment score for selected option
  const calculateAlignment = (option: ScenarioOption): number => {
    if (!userMbtiType) return 50 // Neutral if no type
    return option.mbtiAlignment[userMbtiType] || 50
  }

  const handleSelect = (optionId: string) => {
    if (showFeedback) return
    setSelectedOption(optionId)
  }

  const handleConfirm = () => {
    if (!selectedOption || !currentScenario) return

    const option = currentScenario.options.find(o => o.id === selectedOption)
    if (!option) return

    const result: ScenarioResult = {
      scenarioId: currentScenario.id,
      selectedOptionId: selectedOption,
      alignmentScore: calculateAlignment(option),
      wasOptimal: option.isOptimal || false
    }

    setResults([...results, result])
    setShowFeedback(true)
  }

  const handleNext = () => {
    setSelectedOption(null)
    setShowFeedback(false)

    if (currentIndex + 1 >= scenarios.length) {
      onComplete?.(results)
    }
    setCurrentIndex(prev => prev + 1)
  }

  const handleRestart = () => {
    setCurrentIndex(-1)
    setSelectedOption(null)
    setShowFeedback(false)
    setResults([])
  }

  // Calculate final stats
  const finalStats = useMemo(() => {
    if (results.length === 0) return null

    const avgAlignment = Math.round(
      results.reduce((sum, r) => sum + r.alignmentScore, 0) / results.length
    )
    const optimalCount = results.filter(r => r.wasOptimal).length

    return { avgAlignment, optimalCount, total: results.length }
  }, [results])

  // INTRO SCREEN
  if (currentIndex === -1) {
    return (
      <Card className={cn('max-w-3xl mx-auto', className)}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Сценарный практикум</CardTitle>
          <CardDescription className="text-base mt-2">
            Погрузитесь в реальные рабочие ситуации и узнайте, как ваш MBTI-тип влияет на принятие решений
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center text-sm">
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-semibold text-lg">{scenarios.length}</div>
              <div className="text-muted-foreground">сценариев</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-semibold text-lg">~{scenarios.length * 2}</div>
              <div className="text-muted-foreground">минут</div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="font-medium">Как это работает:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Читайте описание ситуации</li>
              <li>Выбирайте действие, которое вам ближе</li>
              <li>Получайте обратную связь и insights</li>
              <li>Узнайте, как ваш тип влияет на решения</li>
            </ul>
          </div>

          {userMbtiType && (
            <p className="text-sm text-center text-muted-foreground">
              Ваш тип: <Badge variant="secondary">{userMbtiType}</Badge>
            </p>
          )}

          <Button onClick={() => setCurrentIndex(0)} size="lg" className="w-full">
            Начать практикум
          </Button>
        </CardContent>
      </Card>
    )
  }

  // RESULTS SCREEN
  if (isComplete && finalStats) {
    return (
      <Card className={cn('max-w-3xl mx-auto', className)}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Практикум завершён!</CardTitle>
          <CardDescription className="text-base mt-2">
            Вы прошли все {finalStats.total} сценариев
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary">{finalStats.avgAlignment}%</div>
              <div className="text-sm text-muted-foreground">Соответствие типу</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-green-600">{finalStats.optimalCount}/{finalStats.total}</div>
              <div className="text-sm text-muted-foreground">Оптимальных решений</div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="font-medium mb-2">Что это значит?</p>
            <p className="text-sm text-muted-foreground">
              {finalStats.avgAlignment >= 75
                ? 'Ваши решения хорошо согласуются с вашим MBTI-типом. Вы действуете в соответствии со своими естественными предпочтениями.'
                : finalStats.avgAlignment >= 50
                ? 'Вы проявляете гибкость в принятии решений, иногда выходя за рамки типичных паттернов вашего типа.'
                : 'Интересно! Ваши решения часто отличаются от типичных для вашего MBTI-типа. Это может говорить о развитых "теневых" функциях.'}
            </p>
          </div>

          <Button onClick={handleRestart} variant="outline" className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Пройти ещё раз
          </Button>
        </CardContent>
      </Card>
    )
  }

  // SCENARIO SCREEN
  if (!currentScenario) return null

  const selectedOptionData = currentScenario.options.find(o => o.id === selectedOption)

  return (
    <div className={cn('max-w-3xl mx-auto space-y-4', className)}>
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Сценарий {currentIndex + 1} из {scenarios.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Scenario Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="gap-1">
              {CATEGORY_ICONS[currentScenario.category]}
              {CATEGORY_LABELS[currentScenario.category]}
            </Badge>
          </div>
          <CardTitle className="text-xl">{currentScenario.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Context */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            {currentScenario.context}
          </div>

          {/* Situation */}
          <p className="text-base leading-relaxed">
            {currentScenario.situation}
          </p>

          {/* Stakeholders */}
          {currentScenario.stakeholders && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Участники: {currentScenario.stakeholders.join(', ')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Что вы сделаете?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentScenario.options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={showFeedback}
              className={cn(
                'w-full text-left p-4 rounded-lg border-2 transition-all',
                selectedOption === option.id
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-muted/50 hover:bg-muted',
                showFeedback && option.isOptimal && 'border-green-500 bg-green-50 dark:bg-green-950/30',
                showFeedback && selectedOption === option.id && !option.isOptimal && 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
              )}
            >
              <div className="flex gap-3">
                <span className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium',
                  selectedOption === option.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30'
                )}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option.text}</span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Feedback */}
      {showFeedback && selectedOptionData && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Ваш выбор</p>
                <p className="text-sm text-muted-foreground">{selectedOptionData.feedback}</p>
              </div>
            </div>

            {userMbtiType && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">{userMbtiType}</Badge>
                <span className="text-muted-foreground">
                  Соответствие типу: {calculateAlignment(selectedOptionData)}%
                </span>
              </div>
            )}

            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-1">Ключевой вывод</p>
              <p className="text-sm text-muted-foreground">{currentScenario.learningPoint}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!showFeedback ? (
          <Button
            onClick={handleConfirm}
            disabled={!selectedOption}
            className="flex-1"
          >
            Подтвердить выбор
          </Button>
        ) : (
          <Button onClick={handleNext} className="flex-1">
            {currentIndex + 1 < scenarios.length ? (
              <>
                Следующий сценарий
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              'Завершить практикум'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

// ===========================================
// EXPORTS
// ===========================================

export type { Scenario, ScenarioOption, ScenarioResult, ScenarioQuizProps }
