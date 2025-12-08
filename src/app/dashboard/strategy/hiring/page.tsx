import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { UserPlus, Brain, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

export const metadata = {
  title: 'Стратегия найма | Стратегия | Otrar',
}

const positions = [
  {
    title: 'Chief Digital Officer (CDO)',
    subtitle: '«Прагматичный Инноватор»',
    idealType: 'INTJ / ENTP',
    timing: 'Q1 2026',
    status: 'planned',
    whyType: 'Идеально для взаимодействия с ISTJ — общая вспомогательная функция Te. Объясняет изменения языком логики, не абстракций.',
    keyFunction: 'Создание цифровой экосистемы и продуктов',
    tasks: [
      'Бимодальная архитектура',
      'Product Management mindset',
      'Единый источник данных (Single Source of Truth)',
    ],
    riskLevel: 'medium',
    risk: 'Средний с ISTJ — требуется доказательство надёжности',
    mitigation: 'Пилотные проекты, «песочницы», демонстрация на фактах',
  },
  {
    title: 'Commercial Director',
    subtitle: '«Системный Завоеватель»',
    idealType: 'ENTJ / ESTJ',
    timing: 'Q1 2026',
    status: 'planned',
    whyType: 'Сильное Te для выстраивания структур продаж, KPI, процессов. Ni видит рыночные возможности.',
    keyFunction: 'Внедрение Data-Driven культуры и агрессивный рост',
    tasks: [
      'Разделение Sales/Account Management',
      'Внедрение CRM как «религии»',
      'Предиктивная аналитика',
    ],
    riskLevel: 'high',
    risk: 'Высокий с ISFP — чистый ENTJ может быть слишком жёстким',
    mitigation: 'Тесная связка с HRBP, фокус на фактах (для ISTJ) и результатах',
  },
  {
    title: 'HR Business Partner',
    subtitle: '«Эмпатичный Стратег»',
    idealType: 'ENFJ / ESFJ',
    timing: 'Q1 2026',
    status: 'planned',
    whyType: 'Доминантное Fe (экстравертное чувство) позволяет «читать» эмоциональное поле группы. Вспомогательная Ni понимает стратегическое видение CDO.',
    keyFunction: 'Переводчик стратегии на язык ценностей и людей',
    tasks: [
      'Глубинные интервью с носителями культуры',
      'Upskilling программы',
      'Медиация конфликтов NT↔SF',
    ],
    riskLevel: 'low',
    risk: 'Низкий — выступает доверенным лицом для ISFP/ISTJ',
    mitigation: 'Не требуется',
  },
  {
    title: 'Head of Product',
    subtitle: '«Инноватор-архитектор»',
    idealType: 'ENTP / INTP',
    timing: 'Q2 2026',
    status: 'planned',
    whyType: 'Ne-Ti комбинация для генерации идей и их структурирования.',
    keyFunction: 'Инновации в сервисах',
    tasks: [
      'Динамическое пакетирование',
      'OBT для клиентов',
      'Новые цифровые продукты',
    ],
    riskLevel: 'medium',
    risk: 'Средний — может быть слишком абстрактным для SF',
    mitigation: 'Визуализация идей, прототипы, демо',
  },
  {
    title: 'Head of Marketing',
    subtitle: '«Бренд-стратег»',
    idealType: 'ENFP / ENTP',
    timing: 'Q2 2026',
    status: 'planned',
    whyType: 'Ne для креатива, Fe/Te для коммуникации и результата.',
    keyFunction: 'Бренд, ABM, цифровой маркетинг',
    tasks: [
      'Account-Based Marketing для B2B',
      'Digital-каналы',
      'Контент-стратегия',
    ],
    riskLevel: 'low',
    risk: 'Низкий — маркетинг изолирован от операций',
    mitigation: 'Не требуется',
  },
]

const risks = [
  {
    title: 'Культурный конфликт',
    description: 'NT-типы могут восприниматься как "холодные" и "слишком умные"',
    mitigation: 'Онбординг через Зарину, buddy-система с ISFP',
  },
  {
    title: 'Непонимание ценности SF',
    description: 'NT может недооценивать важность отношений',
    mitigation: 'Явное объяснение ролей, взаимное обучение',
  },
  {
    title: 'Слишком быстрые изменения',
    description: 'NT-драйв может напугать SF-команду',
    mitigation: 'Поэтапность, объяснение "зачем"',
  },
  {
    title: 'Уход NT из-за "медленности"',
    description: 'Нетерпеливость к темпу изменений',
    mitigation: 'Чёткие KPI, автономия в зоне ответственности',
  },
]

export default function HiringPage() {
  return (
    <div className="space-y-8">
      {/* Strategy Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Принцип: Дополнение, не замена
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-600">СОХРАНИТЬ (SF-ядро)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ISFP × 5</span>
                  <span className="text-muted-foreground">Клиентский сервис, VIP</span>
                </div>
                <div className="flex justify-between">
                  <span>ISTJ × 2</span>
                  <span className="text-muted-foreground">Операции, финансы</span>
                </div>
                <div className="flex justify-between">
                  <span>ISTP × 1</span>
                  <span className="text-muted-foreground">Техническое решение проблем</span>
                </div>
                <div className="flex justify-between">
                  <span>ESFP × 1</span>
                  <span className="text-muted-foreground">Энергия, клиентское общение</span>
                </div>
                <div className="flex justify-between">
                  <span>ESTJ × 1</span>
                  <span className="text-muted-foreground">Управление процессами</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-600">ДОБАВИТЬ (NT + NF)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ENTJ/INTJ × 1-2</span>
                  <span className="text-muted-foreground">CDO, стратегия</span>
                </div>
                <div className="flex justify-between">
                  <span>ENTP/INTP × 1</span>
                  <span className="text-muted-foreground">Продукт, инновации</span>
                </div>
                <div className="flex justify-between">
                  <span>ENFJ/INFJ × 1</span>
                  <span className="text-muted-foreground">HR BP, культура</span>
                </div>
                <div className="flex justify-between">
                  <span>ENFP/ESTP × 1</span>
                  <span className="text-muted-foreground">Маркетинг, бренд</span>
                </div>
              </div>
            </div>
          </div>

          {/* Target Balance */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-3">Целевой баланс после найма</h4>
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div>
                <div className="text-lg font-bold">80% → 55%</div>
                <div className="text-muted-foreground">Интроверты (I)</div>
                <Badge variant="outline" className="mt-1">-25%</Badge>
              </div>
              <div>
                <div className="text-lg font-bold">20% → 45%</div>
                <div className="text-muted-foreground">Экстраверты (E)</div>
                <Badge className="mt-1 bg-green-500">+25%</Badge>
              </div>
              <div>
                <div className="text-lg font-bold">100% → 65%</div>
                <div className="text-muted-foreground">Сенсорики (S)</div>
                <Badge variant="outline" className="mt-1">-35%</Badge>
              </div>
              <div>
                <div className="text-lg font-bold">0% → 35%</div>
                <div className="text-muted-foreground">Интуиты (N)</div>
                <Badge className="mt-1 bg-green-500">+35%</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leadership Triad */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Лидерская триада перемен</h2>

        {positions.slice(0, 3).map((position) => (
          <Card key={position.title}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    {position.title}
                  </CardTitle>
                  <CardDescription>{position.subtitle}</CardDescription>
                </div>
                <div className="text-right">
                  <Badge className="mb-1">{position.idealType}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {position.timing}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1">Почему этот тип?</h4>
                <p className="text-sm text-muted-foreground">{position.whyType}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Ключевая функция</h4>
                  <p className="text-sm">{position.keyFunction}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Задачи</h4>
                  <ul className="text-sm space-y-1">
                    {position.tasks.map((task, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={`rounded-lg p-3 ${
                position.riskLevel === 'high'
                  ? 'bg-red-50 dark:bg-red-950/30'
                  : position.riskLevel === 'medium'
                    ? 'bg-amber-50 dark:bg-amber-950/30'
                    : 'bg-green-50 dark:bg-green-950/30'
              }`}>
                <h4 className="font-medium text-sm mb-1">
                  Риск конфликта: {position.riskLevel === 'high' ? 'Высокий' : position.riskLevel === 'medium' ? 'Средний' : 'Низкий'}
                </h4>
                <p className="text-sm text-muted-foreground">{position.risk}</p>
                {position.mitigation !== 'Не требуется' && (
                  <p className="text-sm mt-2">
                    <strong>Митигация:</strong> {position.mitigation}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Other Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Дополнительные позиции</CardTitle>
          <CardDescription>Q2 2026</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {positions.slice(3).map((position) => (
              <div key={position.title} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{position.title}</h4>
                    <p className="text-sm text-muted-foreground">{position.subtitle}</p>
                  </div>
                  <Badge>{position.idealType}</Badge>
                </div>
                <p className="text-sm mb-2">{position.keyFunction}</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {position.tasks.map((task, i) => (
                    <li key={i}>• {task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Risks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Риски интеграции NT в SF-культуру
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {risks.map((risk) => (
              <Alert key={risk.title}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{risk.title}</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">{risk.description}</p>
                  <p className="text-sm">
                    <strong>Митигация:</strong> {risk.mitigation}
                  </p>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
