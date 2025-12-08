import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Users,
  Building2,
  UserPlus,
  RefreshCw,
  Map,
  BarChart3,
  ArrowRight,
  Target,
  Lightbulb,
  Heart
} from 'lucide-react'

export const metadata = {
  title: 'Стратегия трансформации | Otrar',
}

const sections = [
  {
    href: '/dashboard/strategy/team-profile',
    title: 'Профиль команды',
    description: 'Психотипы, распределение, когнитивный анализ',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    href: '/dashboard/strategy/organizational',
    title: 'Организационная структура',
    description: 'Бимодальная модель, Hunter/Farmer',
    icon: Building2,
    color: 'bg-purple-500',
  },
  {
    href: '/dashboard/strategy/hiring',
    title: 'Стратегия найма',
    description: 'CDO, Commercial Director, HR BP',
    icon: UserPlus,
    color: 'bg-green-500',
  },
  {
    href: '/dashboard/strategy/change-management',
    title: 'Управление изменениями',
    description: 'ADKAR, Digital Champions, культура',
    icon: RefreshCw,
    color: 'bg-orange-500',
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
    description: 'Бизнес, команда, культура',
    icon: BarChart3,
    color: 'bg-pink-500',
  },
]

export default function StrategyPage() {
  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
          <CardDescription>
            Обновлённое видение трансформации Otrar Travel 2.0
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Программа трансформации интегрирует три измерения: корпоративную трансформацию
            (процессы, системы, структура), личную трансформацию (MBTI-профиль, ИПР, коучинг)
            и командную трансформацию (ребаланс, культура, найм).
          </p>

          {/* Key Insight */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
              Ключевой вывод
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Текущая команда обладает сильным SF-ядром (сервис, клиентоориентированность),
              но критически не хватает NT-типов (стратегия, инновации) и NF-типов (изменения, культура).
              Трансформация требует не замены людей, а добавления недостающих элементов через стратегический найм.
            </p>
          </div>

          {/* Formula */}
          <div className="bg-muted rounded-lg p-6">
            <h4 className="font-semibold mb-4 text-center">Формула успеха</h4>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 px-3 py-2 rounded-lg">
                <Heart className="h-4 w-4 text-blue-600" />
                <span className="font-medium">SF-ядро</span>
                <span className="text-muted-foreground">(сервис)</span>
              </div>
              <span className="text-xl">+</span>
              <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/50 px-3 py-2 rounded-lg">
                <Lightbulb className="h-4 w-4 text-purple-600" />
                <span className="font-medium">NT-лидеры</span>
                <span className="text-muted-foreground">(стратегия)</span>
              </div>
              <span className="text-xl">+</span>
              <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/50 px-3 py-2 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
                <span className="font-medium">NF-проводники</span>
                <span className="text-muted-foreground">(культура)</span>
              </div>
              <span className="text-xl">=</span>
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-bold text-primary">УСПЕХ</span>
              </div>
            </div>
          </div>

          {/* Bimodal approach */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <Badge className="mb-2 bg-blue-500">Mode 1: Марафонцы</Badge>
              <h4 className="font-semibold mb-1">Надёжность</h4>
              <p className="text-sm text-muted-foreground">
                ISTJ, ISFP — стабильность, безопасность, точность.
                Текущий денежный поток, безупречный сервис.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <Badge className="mb-2 bg-orange-500">Mode 2: Спринтеры</Badge>
              <h4 className="font-semibold mb-1">Инновации</h4>
              <p className="text-sm text-muted-foreground">
                Новые наймы NT/NF — скорость, эксперименты, MVP.
                Мобильное приложение, AI-боты, новые модели.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-2">
                <div className={`w-10 h-10 rounded-lg ${section.color} flex items-center justify-center mb-2`}>
                  <section.icon className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                  {section.title}
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">100%</div>
            <p className="text-sm text-muted-foreground">Сенсорики (S)</p>
            <p className="text-xs text-red-600">Критично — нет интуитов</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">80%</div>
            <p className="text-sm text-muted-foreground">Интроверты (I)</p>
            <p className="text-xs text-amber-600">Избыток — слабый networking</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">3-5</div>
            <p className="text-sm text-muted-foreground">Новых позиций</p>
            <p className="text-xs text-green-600">CDO, ComDir, HRBP, Head of Product</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">4</div>
            <p className="text-sm text-muted-foreground">Фазы трансформации</p>
            <p className="text-xs text-blue-600">до декабря 2026</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
