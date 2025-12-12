import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  BookOpen,
  Sparkles,
  Moon,
  Users,
  Target,
  ArrowRight,
  UserPlus,
  ClipboardCheck,
  TrendingUp,
  CheckCircle,
} from 'lucide-react'

export const metadata = {
  title: 'Otrar Transformation Portal | Платформа корпоративной трансформации',
  description: 'Раскройте потенциал вашей команды с помощью MBTI-диагностики, персонального развития и AI-инсайтов',
}

const features = [
  {
    icon: Brain,
    title: 'MBTI-диагностика',
    description: 'Определите свой тип личности и когнитивный стек с помощью научно обоснованного теста',
    color: 'bg-blue-500',
  },
  {
    icon: BookOpen,
    title: '241 статья обучения',
    description: 'Персонализированная библиотека знаний для вашего типа и профессиональной роли',
    color: 'bg-green-500',
  },
  {
    icon: Sparkles,
    title: 'AI-персонализация',
    description: 'Ежедневные инсайты и рекомендации от Claude AI на основе вашего профиля',
    color: 'bg-purple-500',
  },
  {
    icon: Moon,
    title: 'Shadow Work',
    description: '8-недельная программа развития подчинённой функции с 72+ упражнениями',
    color: 'bg-indigo-500',
  },
  {
    icon: Users,
    title: 'Team Builder',
    description: 'Анализ совместимости команды и рекомендации по оптимизации взаимодействия',
    color: 'bg-orange-500',
  },
  {
    icon: Target,
    title: 'ИПР и развитие',
    description: 'Индивидуальный план развития с отслеживанием прогресса и геймификацией',
    color: 'bg-pink-500',
  },
]

const steps = [
  {
    icon: UserPlus,
    title: 'Регистрация',
    description: 'Создайте аккаунт за 2 минуты',
  },
  {
    icon: ClipboardCheck,
    title: 'Диагностика',
    description: 'Пройдите MBTI-тест и получите профиль',
  },
  {
    icon: Sparkles,
    title: 'Персонализация',
    description: 'Система подберёт контент для вашего типа',
  },
  {
    icon: TrendingUp,
    title: 'Трансформация',
    description: 'Развивайтесь с Shadow Work, ИПР и AI-инсайтами',
  },
]

const stats = [
  { value: '18', label: 'разделов', description: 'Полный функционал трансформации' },
  { value: '241', label: 'статья', description: 'База знаний MBTI и развития' },
  { value: '16', label: 'типов', description: 'Полный охват MBTI-типологии' },
  { value: '8', label: 'недель', description: 'Программа Shadow Work' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge variant="secondary" className="px-4 py-2 text-sm">
            Платформа корпоративной трансформации
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
            Раскройте потенциал
            <span className="block text-primary">вашей команды</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Otrar Portal объединяет MBTI-диагностику, персональное развитие
            и AI-инсайты для системной трансформации бизнеса
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/register">
                Начать трансформацию
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="#features">
                Узнать больше
              </Link>
            </Button>
          </div>

          <div className="pt-8 flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Бесплатная диагностика</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>AI-персонализация</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Командная аналитика</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Возможности</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Всё для вашей трансформации
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Интегрированная платформа для личного и корпоративного развития
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Как это работает</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Четыре шага к трансформации
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Простой путь от диагностики к осознанному развитию
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 dark:bg-gray-700" />
                )}

                <div className="relative">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 relative z-10">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold z-20">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">{stat.label}</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Готовы начать трансформацию?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Присоединяйтесь к платформе и откройте путь к осознанному развитию
            себя и своей команды
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/register">
                Создать аккаунт
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Войти
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 Otrar Transformation Portal. Все права защищены.
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/login" className="text-gray-500 hover:text-primary transition-colors">
              Вход
            </Link>
            <Link href="/register" className="text-gray-500 hover:text-primary transition-colors">
              Регистрация
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
