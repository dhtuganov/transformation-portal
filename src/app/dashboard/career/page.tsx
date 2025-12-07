'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Compass,
  Target,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Users,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Star,
  Building2,
  Code,
  Palette,
  HeartPulse,
  Scale,
  Megaphone,
  Calculator,
  Wrench
} from 'lucide-react'

// Career paths data by MBTI type
const CAREER_DATA: Record<string, {
  naturalStrengths: string[]
  idealEnvironments: string[]
  topCareers: { title: string; match: number; icon: string }[]
  growthAreas: string[]
  leadershipStyle: string
  teamRole: string
  stressAtWork: string[]
  satisfactionDrivers: string[]
}> = {
  'INTJ': {
    naturalStrengths: [
      'Стратегическое планирование',
      'Системный анализ',
      'Долгосрочное видение',
      'Независимое решение проблем',
      'Высокие стандарты качества'
    ],
    idealEnvironments: [
      'Автономия в работе',
      'Интеллектуальные вызовы',
      'Компетентные коллеги',
      'Минимум бюрократии',
      'Возможность инноваций'
    ],
    topCareers: [
      { title: 'Стратегический консультант', match: 95, icon: 'building' },
      { title: 'Архитектор ПО', match: 92, icon: 'code' },
      { title: 'Научный исследователь', match: 90, icon: 'graduation' },
      { title: 'Инвестиционный аналитик', match: 88, icon: 'calculator' },
      { title: 'Директор по развитию', match: 85, icon: 'trending' }
    ],
    growthAreas: [
      'Развитие эмоционального интеллекта',
      'Делегирование (а не всё делать самому)',
      'Терпение к менее быстрым коллегам',
      'Принятие несовершенства'
    ],
    leadershipStyle: 'Визионер-стратег: задаёт направление и ожидает от команды самостоятельности',
    teamRole: 'Архитектор: создаёт системы и структуры, критикует слабые идеи',
    stressAtWork: [
      'Некомпетентное руководство',
      'Избыточные совещания',
      'Микроменеджмент',
      'Эмоциональные конфликты'
    ],
    satisfactionDrivers: [
      'Решение сложных проблем',
      'Достижение долгосрочных целей',
      'Признание экспертности',
      'Влияние на стратегию'
    ]
  },
  'ENFP': {
    naturalStrengths: [
      'Генерация идей',
      'Вдохновение других',
      'Адаптивность',
      'Налаживание контактов',
      'Креативное решение проблем'
    ],
    idealEnvironments: [
      'Гибкость и свобода',
      'Творческая атмосфера',
      'Разнообразие задач',
      'Командная работа',
      'Значимая миссия'
    ],
    topCareers: [
      { title: 'Предприниматель', match: 95, icon: 'building' },
      { title: 'Креативный директор', match: 92, icon: 'palette' },
      { title: 'HR-менеджер', match: 88, icon: 'users' },
      { title: 'Маркетолог', match: 87, icon: 'megaphone' },
      { title: 'Психолог-консультант', match: 85, icon: 'heart' }
    ],
    growthAreas: [
      'Доведение дел до конца',
      'Фокус на деталях',
      'Работа с рутиной',
      'Принятие критики'
    ],
    leadershipStyle: 'Вдохновитель: мотивирует команду, создаёт позитивную атмосферу',
    teamRole: 'Генератор идей: предлагает инновации, связывает людей',
    stressAtWork: [
      'Жёсткие правила и рутина',
      'Изоляция от команды',
      'Критика без конструктива',
      'Бессмысленные задачи'
    ],
    satisfactionDrivers: [
      'Творческая свобода',
      'Помощь людям развиваться',
      'Новые проекты и идеи',
      'Признание вклада'
    ]
  },
  'INFJ': {
    naturalStrengths: [
      'Глубокое понимание людей',
      'Долгосрочное видение',
      'Этичность и принципиальность',
      'Креативность',
      'Способность вдохновлять'
    ],
    idealEnvironments: [
      'Значимая работа',
      'Гармоничная атмосфера',
      'Возможность уединения',
      'Ценятся идеи',
      'Этичная организация'
    ],
    topCareers: [
      { title: 'Психолог', match: 95, icon: 'heart' },
      { title: 'Писатель/редактор', match: 92, icon: 'palette' },
      { title: 'Консультант по развитию', match: 90, icon: 'graduation' },
      { title: 'НКО руководитель', match: 88, icon: 'users' },
      { title: 'UX-дизайнер', match: 85, icon: 'code' }
    ],
    growthAreas: [
      'Принятие конфликтов',
      'Реалистичные ожидания',
      'Установление границ',
      'Самокритика (уменьшить)'
    ],
    leadershipStyle: 'Наставник: развивает потенциал каждого, ведёт к общей цели',
    teamRole: 'Советник: понимает динамику, помогает с конфликтами',
    stressAtWork: [
      'Неэтичная среда',
      'Поверхностные отношения',
      'Чрезмерная социализация',
      'Игнорирование идей'
    ],
    satisfactionDrivers: [
      'Влияние на жизни людей',
      'Реализация видения',
      'Глубокие отношения',
      'Творческое самовыражение'
    ]
  },
  'ENTP': {
    naturalStrengths: [
      'Стратегическое мышление',
      'Дебаты и аргументация',
      'Адаптивность',
      'Инновации',
      'Быстрое обучение'
    ],
    idealEnvironments: [
      'Интеллектуальные вызовы',
      'Свобода экспериментов',
      'Разнообразие проектов',
      'Конкурентная среда',
      'Минимум рутины'
    ],
    topCareers: [
      { title: 'Предприниматель', match: 95, icon: 'building' },
      { title: 'Венчурный капиталист', match: 92, icon: 'calculator' },
      { title: 'Юрист-консультант', match: 90, icon: 'scale' },
      { title: 'Продакт-менеджер', match: 88, icon: 'code' },
      { title: 'Стратегический консультант', match: 87, icon: 'trending' }
    ],
    growthAreas: [
      'Завершение начатого',
      'Эмпатия в общении',
      'Работа с деталями',
      'Терпение с процессами'
    ],
    leadershipStyle: 'Инноватор: бросает вызов статус-кво, двигает к переменам',
    teamRole: 'Критик: проверяет идеи, предлагает альтернативы',
    stressAtWork: [
      'Скучная рутина',
      'Авторитарное управление',
      'Отсутствие интеллектуальных вызовов',
      'Принуждение к конформизму'
    ],
    satisfactionDrivers: [
      'Решение сложных проблем',
      'Свобода экспериментов',
      'Интеллектуальное признание',
      'Разнообразие проектов'
    ]
  },
  'ISTJ': {
    naturalStrengths: [
      'Надёжность и ответственность',
      'Внимание к деталям',
      'Организованность',
      'Логический анализ',
      'Соблюдение стандартов'
    ],
    idealEnvironments: [
      'Чёткая структура',
      'Стабильность',
      'Признание вклада',
      'Ясные правила',
      'Профессионализм'
    ],
    topCareers: [
      { title: 'Финансовый аналитик', match: 95, icon: 'calculator' },
      { title: 'Аудитор', match: 92, icon: 'scale' },
      { title: 'Системный администратор', match: 90, icon: 'code' },
      { title: 'Операционный менеджер', match: 88, icon: 'building' },
      { title: 'Инженер по качеству', match: 85, icon: 'wrench' }
    ],
    growthAreas: [
      'Гибкость к изменениям',
      'Принятие новых методов',
      'Делегирование контроля',
      'Выражение признательности'
    ],
    leadershipStyle: 'Администратор: обеспечивает порядок и выполнение',
    teamRole: 'Исполнитель: надёжно доводит задачи до конца',
    stressAtWork: [
      'Хаос и неопределённость',
      'Постоянные изменения',
      'Нарушение правил',
      'Непрофессионализм коллег'
    ],
    satisfactionDrivers: [
      'Выполнение обязательств',
      'Стабильность и безопасность',
      'Признание надёжности',
      'Чёткие достижения'
    ]
  },
  'ISFJ': {
    naturalStrengths: [
      'Забота о других',
      'Внимание к деталям',
      'Надёжность',
      'Практическая помощь',
      'Сохранение традиций'
    ],
    idealEnvironments: [
      'Гармоничный коллектив',
      'Помощь людям',
      'Стабильность',
      'Признание вклада',
      'Чёткие ожидания'
    ],
    topCareers: [
      { title: 'Медицинская сестра', match: 95, icon: 'heart' },
      { title: 'HR-специалист', match: 92, icon: 'users' },
      { title: 'Администратор', match: 90, icon: 'building' },
      { title: 'Учитель', match: 88, icon: 'graduation' },
      { title: 'Социальный работник', match: 85, icon: 'heart' }
    ],
    growthAreas: [
      'Установление границ',
      'Принятие перемен',
      'Уверенность в себе',
      'Отказ от перфекционизма'
    ],
    leadershipStyle: 'Поддерживающий лидер: заботится о команде, помогает каждому',
    teamRole: 'Координатор: обеспечивает гармонию и практическую поддержку',
    stressAtWork: [
      'Конфликты в коллективе',
      'Неблагодарность',
      'Быстрые изменения',
      'Игнорирование вклада'
    ],
    satisfactionDrivers: [
      'Благодарность от других',
      'Реальная помощь людям',
      'Стабильные отношения',
      'Вклад в команду'
    ]
  }
}

// Get career data with fallback
const getCareerData = (type: string) => {
  return CAREER_DATA[type] || {
    naturalStrengths: ['Уникальные способности вашего типа', 'Специфические навыки', 'Природные таланты'],
    idealEnvironments: ['Подходящая рабочая среда', 'Комфортные условия', 'Благоприятная культура'],
    topCareers: [
      { title: 'Универсальные возможности', match: 80, icon: 'building' },
      { title: 'Разнообразные роли', match: 75, icon: 'users' }
    ],
    growthAreas: ['Области для развития', 'Навыки для улучшения'],
    leadershipStyle: 'Уникальный стиль лидерства',
    teamRole: 'Важная роль в команде',
    stressAtWork: ['Факторы стресса на работе'],
    satisfactionDrivers: ['Источники удовлетворения']
  }
}

// Department fit scores
const DEPARTMENT_FIT: Record<string, Record<string, number>> = {
  'INTJ': { 'strategy': 95, 'it': 90, 'finance': 85, 'operations': 70, 'sales': 50, 'hr': 45 },
  'ENFP': { 'marketing': 95, 'hr': 90, 'sales': 85, 'strategy': 70, 'operations': 50, 'finance': 45 },
  'INFJ': { 'hr': 95, 'marketing': 80, 'strategy': 75, 'it': 60, 'operations': 55, 'sales': 50 },
  'ENTP': { 'strategy': 95, 'marketing': 85, 'sales': 80, 'it': 75, 'operations': 55, 'finance': 50 },
  'ISTJ': { 'finance': 95, 'operations': 90, 'it': 80, 'hr': 65, 'strategy': 60, 'sales': 55 },
  'ISFJ': { 'hr': 95, 'operations': 85, 'finance': 75, 'marketing': 60, 'it': 55, 'sales': 50 }
}

const DEPARTMENTS = {
  'strategy': { name: 'Стратегия и развитие', icon: Target },
  'it': { name: 'IT и технологии', icon: Code },
  'finance': { name: 'Финансы', icon: Calculator },
  'operations': { name: 'Операции', icon: Wrench },
  'sales': { name: 'Продажи', icon: Briefcase },
  'hr': { name: 'HR и персонал', icon: Users },
  'marketing': { name: 'Маркетинг', icon: Megaphone }
}

const getIcon = (iconName: string) => {
  const icons: Record<string, typeof Building2> = {
    'building': Building2,
    'code': Code,
    'graduation': GraduationCap,
    'calculator': Calculator,
    'trending': TrendingUp,
    'palette': Palette,
    'users': Users,
    'megaphone': Megaphone,
    'heart': HeartPulse,
    'scale': Scale,
    'wrench': Wrench
  }
  return icons[iconName] || Briefcase
}

export default function CareerPage() {
  // Mock user data - in real app from profile
  const userType = 'INTJ'
  const userDepartment = 'IT и технологии'
  const userPosition = 'Senior Developer'

  const careerData = getCareerData(userType)
  const deptFit = DEPARTMENT_FIT[userType] || {}

  const [selectedCareer, setSelectedCareer] = useState<string | null>(null)

  // Calculate current role alignment
  const currentRoleFit = 85 // Would calculate based on actual role

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Compass className="h-8 w-8 text-primary" />
          Карьерный компас
        </h1>
        <p className="text-muted-foreground">
          Карьерные рекомендации на основе вашего типа личности
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline">{userType}</Badge>
          <Badge variant="secondary">{userDepartment}</Badge>
          <Badge variant="secondary">{userPosition}</Badge>
        </div>
      </div>

      {/* Current Role Alignment */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Соответствие текущей роли</h3>
              <p className="text-sm text-muted-foreground">
                Насколько ваша позиция соответствует типу {userType}
              </p>
            </div>
            <div className="text-3xl font-bold text-primary">{currentRoleFit}%</div>
          </div>
          <Progress value={currentRoleFit} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {currentRoleFit >= 80 ? '✨ Отличное соответствие! Вы на своём месте.' :
             currentRoleFit >= 60 ? '👍 Хорошее соответствие с потенциалом для роста.' :
             '💡 Рассмотрите возможности для лучшего соответствия вашим сильным сторонам.'}
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="strengths" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="strengths">Сильные стороны</TabsTrigger>
          <TabsTrigger value="careers">Карьерные пути</TabsTrigger>
          <TabsTrigger value="departments">Департаменты</TabsTrigger>
          <TabsTrigger value="growth">Развитие</TabsTrigger>
        </TabsList>

        {/* Strengths Tab */}
        <TabsContent value="strengths" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Природные сильные стороны
                </CardTitle>
                <CardDescription>
                  Врождённые преимущества типа {userType}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {careerData.naturalStrengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  Идеальная рабочая среда
                </CardTitle>
                <CardDescription>
                  Условия, в которых вы раскрываетесь
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {careerData.idealEnvironments.map((env, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
                      <span>{env}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Роль в команде
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Стиль лидерства</div>
                  <p>{careerData.leadershipStyle}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Роль в команде</div>
                  <p>{careerData.teamRole}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-green-500" />
                  Источники удовлетворения
                </CardTitle>
                <CardDescription>
                  Что приносит радость от работы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {careerData.satisfactionDrivers.map((driver, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {driver}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Careers Tab */}
        <TabsContent value="careers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Рекомендуемые карьерные пути</CardTitle>
              <CardDescription>
                Профессии с наибольшим соответствием вашему типу
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {careerData.topCareers.map((career, i) => {
                  const Icon = getIcon(career.icon)
                  const isSelected = selectedCareer === career.title

                  return (
                    <div
                      key={i}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'ring-2 ring-primary bg-muted/50' : 'hover:bg-muted/30'
                      }`}
                      onClick={() => setSelectedCareer(isSelected ? null : career.title)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{career.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Соответствие: {career.match}%
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={career.match} className="w-24 h-2" />
                          <ChevronRight className={`h-5 w-5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Эта карьера отлично подходит для {userType}, потому что позволяет использовать
                            ваши сильные стороны в {careerData.naturalStrengths[0].toLowerCase()} и
                            {' '}{careerData.naturalStrengths[1].toLowerCase()}.
                          </p>
                          <div className="flex gap-2">
                            <Badge variant="outline">Высокий потенциал</Badge>
                            <Badge variant="outline">Рост 20%+/год</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Соответствие департаментам</CardTitle>
              <CardDescription>
                Где ваш тип будет наиболее эффективен в Otrar Travel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(DEPARTMENTS)
                  .map(([key, dept]) => ({
                    key,
                    ...dept,
                    fit: deptFit[key] || 60
                  }))
                  .sort((a, b) => b.fit - a.fit)
                  .map((dept) => {
                    const Icon = dept.icon
                    const isCurrentDept = dept.name === userDepartment

                    return (
                      <div key={dept.key} className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${isCurrentDept ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{dept.name}</span>
                            {isCurrentDept && <Badge variant="default" className="text-xs">Текущий</Badge>}
                          </div>
                          <Progress value={dept.fit} className="h-2 mt-1" />
                        </div>
                        <div className="text-lg font-bold min-w-[50px] text-right">
                          {dept.fit}%
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Growth Tab */}
        <TabsContent value="growth" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Зоны роста
                </CardTitle>
                <CardDescription>
                  Навыки для развития карьеры
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {careerData.growthAreas.map((area, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <Lightbulb className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-medium">{area}</div>
                        <Button variant="link" className="h-auto p-0 text-xs">
                          Статьи по теме →
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Факторы стресса на работе
                </CardTitle>
                <CardDescription>
                  Что избегать для сохранения продуктивности
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {careerData.stressAtWork.map((stress, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="text-red-500">⚠</span>
                      {stress}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Совет:</strong> Используйте Stress Radar для отслеживания
                    этих триггеров и своевременного принятия мер.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Development Path */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-500" />
                  Рекомендуемый путь развития
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  {[
                    { stage: 'Сейчас', title: userPosition, focus: 'Углубление экспертизы' },
                    { stage: '1-2 года', title: 'Tech Lead', focus: 'Лидерство в команде' },
                    { stage: '3-5 лет', title: 'Архитектор', focus: 'Системное мышление' },
                    { stage: '5+ лет', title: 'CTO / Директор', focus: 'Стратегия и видение' }
                  ].map((step, i, arr) => (
                    <div key={i} className="flex-1 relative">
                      <div className={`p-4 rounded-lg border-2 ${i === 0 ? 'border-primary bg-primary/5' : 'border-dashed'}`}>
                        <div className="text-xs text-muted-foreground mb-1">{step.stage}</div>
                        <div className="font-semibold">{step.title}</div>
                        <div className="text-sm text-muted-foreground">{step.focus}</div>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
