import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Map, CheckCircle2, Clock, Circle } from 'lucide-react'

export const metadata = {
  title: 'Дорожная карта | Стратегия | Otrar',
}

const phases = [
  {
    number: 1,
    name: 'Диагностика + Стабилизация рисков',
    period: 'Декабрь 2025 — Январь 2026',
    color: 'bg-blue-500',
    tasks: [
      { track: 'Бизнес', action: 'Аудит ATOM, кредитный аудит, завершение конкурентного анализа', responsible: 'Давид', status: 'in_progress' },
      { track: 'Команда', action: 'MBTI всех 15 ключевых сотрудников, карта психотипов', responsible: 'Зарина', status: 'in_progress' },
      { track: 'Система', action: 'Оценка CRM-альтернатив (не ATOM!), план миграции', responsible: 'Будущий CDO', status: 'pending' },
      { track: 'Культура', action: 'Общее собрание "Зачем меняемся", запуск Portal', responsible: 'Алия + Давид', status: 'pending' },
      { track: 'Наймы', action: 'Начало поиска CDO, Commercial Director', responsible: 'HR + Алия', status: 'pending' },
    ],
  },
  {
    number: 2,
    name: 'Дизайн + Критические наймы',
    period: 'Февраль — Март 2026',
    color: 'bg-purple-500',
    tasks: [
      { track: 'Бизнес', action: 'Стратсессия, миссия/видение/ценности, дорожная карта', responsible: 'Давид', status: 'pending' },
      { track: 'Команда', action: 'ИПР для каждого, выбор Digital Champions', responsible: 'Зарина', status: 'pending' },
      { track: 'Наймы', action: 'CDO (ENTJ/INTJ), HR BP (ENFJ) выходят на работу', responsible: 'HR + Алия', status: 'pending' },
      { track: 'Система', action: 'Внедрение кредитного скоринга + Hard Stop', responsible: 'CDO', status: 'pending' },
      { track: 'Культура', action: 'Первые Quick Wins (офис), Change Team формируется', responsible: 'Альбина', status: 'pending' },
    ],
  },
  {
    number: 3,
    name: 'Реализация Wave 1',
    period: 'Апрель — Июнь 2026',
    color: 'bg-green-500',
    tasks: [
      { track: 'Продажи', action: 'Hunter/Farmer разделение, CRM-миграция', responsible: 'Commercial Director', status: 'pending' },
      { track: 'Маркетинг', action: 'Найм Head of Marketing, базовый SMM, новый сайт', responsible: 'HR BP', status: 'pending' },
      { track: 'Команда', action: 'Тренинг Change Management, обучение CRM', responsible: 'Зарина', status: 'pending' },
      { track: 'Портал', action: 'MVP запуск для всех сотрудников', responsible: 'CDO', status: 'pending' },
      { track: 'Пилоты', action: 'B2C VIP пилот (50 клиентов)', responsible: 'Commercial Director', status: 'pending' },
    ],
  },
  {
    number: 4,
    name: 'Масштабирование',
    period: 'Июль — Декабрь 2026',
    color: 'bg-orange-500',
    tasks: [
      { track: 'B2B', action: 'OBT для топ-20 клиентов', responsible: 'CDO', status: 'pending' },
      { track: 'B2C', action: 'Динамическое пакетирование, расширение VIP', responsible: 'Head of Product', status: 'pending' },
      { track: 'Команда', action: 'Shadow Work программы в Portal, Stress Radar', responsible: 'Portal', status: 'pending' },
      { track: 'Культура', action: 'Геймификация на полную мощность, первые результаты видны', responsible: 'Change Team', status: 'pending' },
      { track: 'Финансы', action: 'Полная AR Automation, снижение DSO', responsible: 'CFO', status: 'pending' },
    ],
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case 'in_progress':
      return <Clock className="h-4 w-4 text-amber-500" />
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-500">Готово</Badge>
    case 'in_progress':
      return <Badge className="bg-amber-500">В процессе</Badge>
    default:
      return <Badge variant="outline">Ожидает</Badge>
  }
}

export default function RoadmapPage() {
  return (
    <div className="space-y-8">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Интегрированная дорожная карта
          </CardTitle>
          <CardDescription>
            4 фазы трансформации до конца 2026 года
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Timeline overview */}
          <div className="flex flex-wrap gap-4 mb-6">
            {phases.map((phase) => (
              <div key={phase.number} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full ${phase.color} text-white flex items-center justify-center font-bold`}>
                  {phase.number}
                </div>
                <div className="text-sm">
                  <div className="font-medium">{phase.name}</div>
                  <div className="text-muted-foreground text-xs">{phase.period}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Phases */}
      {phases.map((phase) => (
        <Card key={phase.number}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${phase.color} text-white flex items-center justify-center font-bold text-lg`}>
                {phase.number}
              </div>
              <div>
                <CardTitle>Фаза {phase.number}: {phase.name}</CardTitle>
                <CardDescription>{phase.period}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 w-24">Трек</th>
                    <th className="text-left py-2 px-2">Действия</th>
                    <th className="text-left py-2 px-2 w-40">Ответственный</th>
                    <th className="text-left py-2 px-2 w-28">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {phase.tasks.map((task, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 px-2">
                        <Badge variant="outline" className="font-medium">{task.track}</Badge>
                      </td>
                      <td className="py-2 px-2">{task.action}</td>
                      <td className="py-2 px-2 text-muted-foreground">{task.responsible}</td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className="text-xs">
                            {task.status === 'completed' ? 'Готово' :
                              task.status === 'in_progress' ? 'В работе' : 'Ожидает'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Critical Systems */}
      <Card>
        <CardHeader>
          <CardTitle>Критические системные изменения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Приоритет</th>
                  <th className="text-left py-2 px-2">Система</th>
                  <th className="text-left py-2 px-2">Описание</th>
                  <th className="text-left py-2 px-2">Срок</th>
                  <th className="text-right py-2 px-2">Бюджет</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-2"><Badge className="bg-red-500">P0</Badge></td>
                  <td className="py-2 px-2 font-medium">Кредитный скоринг + Hard Stop</td>
                  <td className="py-2 px-2 text-muted-foreground">Автоблокировка при превышении лимита</td>
                  <td className="py-2 px-2">Q1 2026</td>
                  <td className="py-2 px-2 text-right">3 000 000 ₸</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-2"><Badge className="bg-red-500">P0</Badge></td>
                  <td className="py-2 px-2 font-medium">CRM (не ATOM!)</td>
                  <td className="py-2 px-2 text-muted-foreground">Миграция данных из голов в систему</td>
                  <td className="py-2 px-2">Q1 2026</td>
                  <td className="py-2 px-2 text-right">2 000 000 ₸</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-2"><Badge className="bg-amber-500">P1</Badge></td>
                  <td className="py-2 px-2 font-medium">OBT для топ-20 клиентов</td>
                  <td className="py-2 px-2 text-muted-foreground">Портал самообслуживания</td>
                  <td className="py-2 px-2">Q2 2026</td>
                  <td className="py-2 px-2 text-right">5 000 000 ₸</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-2"><Badge className="bg-amber-500">P1</Badge></td>
                  <td className="py-2 px-2 font-medium">AR Automation</td>
                  <td className="py-2 px-2 text-muted-foreground">Автоинвойсинг, dunning</td>
                  <td className="py-2 px-2">Q2 2026</td>
                  <td className="py-2 px-2 text-right">1 500 000 ₸</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-2"><Badge variant="outline">P2</Badge></td>
                  <td className="py-2 px-2 font-medium">Mid-Office интеграция</td>
                  <td className="py-2 px-2 text-muted-foreground">Автоматизация выписки</td>
                  <td className="py-2 px-2">Q3 2026</td>
                  <td className="py-2 px-2 text-right">8 000 000 ₸</td>
                </tr>
                <tr>
                  <td className="py-2 px-2"><Badge variant="outline">P2</Badge></td>
                  <td className="py-2 px-2 font-medium">BI Dashboard</td>
                  <td className="py-2 px-2 text-muted-foreground">Аналитика для руководства</td>
                  <td className="py-2 px-2">Q3 2026</td>
                  <td className="py-2 px-2 text-right">2 000 000 ₸</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t font-bold">
                  <td colSpan={4} className="py-2 px-2">Итого</td>
                  <td className="py-2 px-2 text-right">21 500 000 ₸</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
