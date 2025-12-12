import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Brain,
  BookOpen,
  ClipboardCheck,
  Moon,
  Target,
  Sparkles,
  Users,
  Activity,
  Compass,
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Building2,
  UserPlus,
  RefreshCw,
  Map,
  User,
  Link2,
  Heart,
  Lightbulb,
  ArrowRight,
} from 'lucide-react'

export const metadata = {
  title: 'Руководство | Otrar Transformation Portal',
  description: 'Полное руководство по использованию портала трансформации',
}

// Portal sections data
const portalSections = [
  {
    href: '/dashboard/my-type',
    title: 'Мой тип',
    description: 'MBTI-профиль, когнитивный стек, портрет личности',
    icon: Brain,
    color: 'bg-blue-500',
  },
  {
    href: '/dashboard/learning',
    title: 'Обучение',
    description: '241 статья, персонализированные рекомендации',
    icon: BookOpen,
    color: 'bg-green-500',
  },
  {
    href: '/dashboard/quizzes',
    title: 'Тесты',
    description: 'MBTI-диагностика, оценка компетенций',
    icon: ClipboardCheck,
    color: 'bg-yellow-500',
  },
  {
    href: '/dashboard/shadow-work',
    title: 'Shadow Work',
    description: '8 недель, 72+ упражнений развития',
    icon: Moon,
    color: 'bg-indigo-500',
  },
  {
    href: '/dashboard/development',
    title: 'ИПР',
    description: 'Индивидуальный план развития с прогрессом',
    icon: Target,
    color: 'bg-pink-500',
  },
  {
    href: '/dashboard/test-insights',
    title: 'AI Инсайты',
    description: 'Ежедневные персонализированные рекомендации',
    icon: Sparkles,
    color: 'bg-purple-500',
  },
  {
    href: '/dashboard/team-builder',
    title: 'Team Builder',
    description: 'Анализ совместимости, коммуникация',
    icon: Users,
    color: 'bg-orange-500',
  },
  {
    href: '/dashboard/stress-radar',
    title: 'Stress Radar',
    description: 'Мониторинг стресса, профилактика выгорания',
    icon: Activity,
    color: 'bg-red-500',
  },
  {
    href: '/dashboard/career',
    title: 'Career Compass',
    description: 'Карьерные пути для вашего типа',
    icon: Compass,
    color: 'bg-cyan-500',
  },
]

// Manager sections
const managerSections = [
  {
    href: '/dashboard/manager',
    title: 'Manager Dashboard',
    description: 'Обзор прогресса команды, статистика обучения',
    icon: LayoutDashboard,
    color: 'bg-blue-500',
  },
  {
    href: '/dashboard/team',
    title: 'Команда',
    description: 'Список сотрудников, MBTI-профили',
    icon: Users,
    color: 'bg-green-500',
  },
  {
    href: '/dashboard/team',
    title: 'Skill Gap Analysis',
    description: 'Карта компетенций, зоны развития команды',
    icon: BarChart3,
    color: 'bg-purple-500',
  },
]

// Executive sections
const executiveSections = [
  {
    href: '/dashboard/strategy',
    title: 'Стратегия',
    description: 'Executive Summary трансформации',
    icon: TrendingUp,
    color: 'bg-blue-500',
  },
  {
    href: '/dashboard/strategy/team-profile',
    title: 'Профиль команды',
    description: 'Психотипы, распределение, когнитивный анализ',
    icon: Users,
    color: 'bg-green-500',
  },
  {
    href: '/dashboard/strategy/organizational',
    title: 'Организация',
    description: 'Бимодальная модель, Hunter/Farmer',
    icon: Building2,
    color: 'bg-purple-500',
  },
  {
    href: '/dashboard/strategy/hiring',
    title: 'Стратегия найма',
    description: 'CDO, Commercial Director, HRBP',
    icon: UserPlus,
    color: 'bg-orange-500',
  },
  {
    href: '/dashboard/strategy/change-management',
    title: 'Управление изменениями',
    description: 'ADKAR, Digital Champions, культура',
    icon: RefreshCw,
    color: 'bg-pink-500',
  },
  {
    href: '/dashboard/strategy/roadmap',
    title: 'Дорожная карта',
    description: '4 фазы реализации до конца 2026',
    icon: Map,
    color: 'bg-cyan-500',
  },
  {
    href: '/dashboard/strategy/kpi',
    title: 'KPI трансформации',
    description: 'Бизнес, команда, культура метрики',
    icon: BarChart3,
    color: 'bg-indigo-500',
  },
]

// Section card component
function SectionCard({ href, title, description, icon: Icon, color }: {
  href: string
  title: string
  description: string
  icon: React.ElementType
  color: string
}) {
  return (
    <Link href={href}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
        <CardHeader className="pb-2">
          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-2`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
            {title}
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Card */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <CardHeader>
          <Badge className="w-fit mb-2">Руководство</Badge>
          <CardTitle className="text-2xl">Руководство по порталу трансформации</CardTitle>
          <CardDescription className="text-base">
            Всё, что нужно знать для эффективного использования платформы и понимания философии трансформации
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="philosophy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="philosophy">Философия</TabsTrigger>
          <TabsTrigger value="sections">Разделы</TabsTrigger>
          <TabsTrigger value="managers">Для менеджеров</TabsTrigger>
          <TabsTrigger value="executives">Для руководителей</TabsTrigger>
        </TabsList>

        {/* Philosophy Tab */}
        <TabsContent value="philosophy" className="space-y-6">
          {/* Personal Transformation */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Что такое личная трансформация</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Личная трансформация — это осознанный процесс развития через понимание своих когнитивных паттернов.
                MBTI помогает увидеть, как мы воспринимаем мир и принимаем решения.
              </p>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold mb-2">Когнитивный стек развития:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. <strong>Доминантная функция</strong> — ваша суперсила, работает естественно</li>
                  <li>2. <strong>Вспомогательная функция</strong> — поддержка доминантной, развивается к 30 годам</li>
                  <li>3. <strong>Третичная функция</strong> — зона роста среднего возраста</li>
                  <li>4. <strong>Подчинённая функция</strong> — Shadow, главная зона трансформации</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                Shadow Work — это работа с подчинённой функцией, интеграция «тени» в сознание для достижения целостности и баланса.
              </p>
            </CardContent>
          </Card>

          {/* Corporate Transformation */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Что такое корпоративная трансформация</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Корпоративная трансформация — системное изменение процессов, культуры и структуры организации
                для достижения новых бизнес-целей и адаптации к изменяющимся условиям рынка.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <Badge className="mb-2 bg-blue-500">Mode 1: Марафонцы</Badge>
                  <h4 className="font-semibold mb-1">Надёжность</h4>
                  <p className="text-sm text-muted-foreground">
                    Стабильность, безопасность, точность. Текущий денежный поток, безупречный сервис.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <Badge className="mb-2 bg-orange-500">Mode 2: Спринтеры</Badge>
                  <h4 className="font-semibold mb-1">Инновации</h4>
                  <p className="text-sm text-muted-foreground">
                    Скорость, эксперименты, MVP. Новые продукты, AI-решения, инновации.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MBTI in Transformation */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Как MBTI помогает в трансформации</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <strong>16 типов = 16 уникальных путей развития</strong>
                    <p className="text-sm text-muted-foreground">Каждый тип имеет свой оптимальный способ обучения и роста</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <strong>Когнитивный стек определяет стиль обучения</strong>
                    <p className="text-sm text-muted-foreground">Интуиты предпочитают концепции, сенсорики — практику</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <strong>Подчинённая функция = главная зона роста</strong>
                    <p className="text-sm text-muted-foreground">Shadow Work помогает интегрировать слабые стороны</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Personal + Business Connection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Связь личного развития и бизнес-результатов</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-6">
                <h4 className="font-semibold mb-4 text-center">Формула успеха</h4>
                <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                  <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 px-3 py-2 rounded-lg">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Личное развитие</span>
                  </div>
                  <span className="text-xl">+</span>
                  <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/50 px-3 py-2 rounded-lg">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Командная синергия</span>
                  </div>
                  <span className="text-xl">=</span>
                  <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-bold text-primary">Бизнес-результат</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">+25%</div>
                  <p className="text-xs text-muted-foreground">Вовлечённость</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">+30%</div>
                  <p className="text-xs text-muted-foreground">Продуктивность</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">-40%</div>
                  <p className="text-xs text-muted-foreground">Текучесть</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">Основные разделы портала</h3>
            <p className="text-muted-foreground">
              9 инструментов для вашего личного и профессионального развития
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portalSections.map((section) => (
              <SectionCard key={section.href} {...section} />
            ))}
          </div>
        </TabsContent>

        {/* Managers Tab */}
        <TabsContent value="managers" className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">Инструменты для менеджеров</h3>
            <p className="text-muted-foreground">
              Управляйте развитием команды с помощью MBTI-аналитики
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {managerSections.map((section) => (
              <SectionCard key={section.title} {...section} />
            ))}
          </div>

          {/* Manager tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Советы по управлению командой
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Коммуникация по типам</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>ST типы</strong> — факты, конкретика, логика</li>
                    <li>• <strong>SF типы</strong> — эмпатия, поддержка, детали</li>
                    <li>• <strong>NT типы</strong> — концепции, стратегия, вызов</li>
                    <li>• <strong>NF типы</strong> — смысл, ценности, вдохновение</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Делегирование задач</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Te</strong> — организация, системы, эффективность</li>
                    <li>• <strong>Ti</strong> — анализ, исследование, точность</li>
                    <li>• <strong>Fe</strong> — командная работа, клиенты, культура</li>
                    <li>• <strong>Fi</strong> — ценности, качество, аутентичность</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Executives Tab */}
        <TabsContent value="executives" className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">Стратегические инструменты</h3>
            <p className="text-muted-foreground">
              Полная программа корпоративной трансформации для руководителей
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {executiveSections.map((section) => (
              <SectionCard key={section.href} {...section} />
            ))}
          </div>

          {/* Key insight */}
          <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Heart className="h-5 w-5" />
                Ключевой вывод
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700 dark:text-amber-300">
                Трансформация требует не замены людей, а добавления недостающих элементов.
                Сильное SF-ядро (сервис) нуждается в NT-лидерах (стратегия) и NF-проводниках (культура)
                для достижения баланса и устойчивого роста.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
