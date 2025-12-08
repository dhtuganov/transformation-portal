import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Users, CheckCircle2, MessageSquare, Lightbulb, Award, Eye, Heart, BookOpen, Rocket, PartyPopper } from 'lucide-react'

export const metadata = {
  title: 'Управление изменениями | Стратегия | Otrar',
}

const digitalChampions = [
  { name: 'Айман Абдирова', type: 'ESFP', reason: 'Энергия, энтузиазм, влияние на коллег' },
  { name: 'Наиля Умарходжиева', type: 'ESTJ', reason: 'Организованность, авторитет, системность' },
  { name: 'Екатерина Кораблева', type: 'ISTP', reason: 'Практичность, быстрое освоение инструментов' },
  { name: 'Татьяна Звездина', type: 'ISFP', reason: 'Опыт, филиальная сеть, уважение' },
]

const adkarSteps = [
  {
    letter: 'A',
    name: 'Awareness',
    nameRu: 'Осознание',
    approach: 'Через ФАКТЫ, не эмоции',
    icon: Eye,
    color: 'bg-blue-500',
    examples: [
      {
        type: 'ISTJ',
        wrong: '«Мы станем цифровыми лидерами!»',
        right: '«Мы теряем 15% маржи из-за ручной обработки. Конкуренты с автобронированием обрабатывают заявки в 3 раза быстрее. Если не внедрим — через 2 года сократим штат»',
      },
      {
        type: 'ISFP',
        wrong: '«Это повысит эффективность»',
        right: '«Вы тратите 4 часа на бумажную работу вместо подбора идеального отеля. Новая система освободит это время для клиента»',
      },
    ],
  },
  {
    letter: 'D',
    name: 'Desire',
    nameRu: 'Желание',
    approach: 'Через БЕЗОПАСНОСТЬ и ЭСТЕТИКУ',
    icon: Heart,
    color: 'bg-red-500',
    motivators: [
      { type: 'ISTJ', motivator: 'Компетентность не станет бесполезной', action: 'Статус «Эксперт-суперюзер» новой системы' },
      { type: 'ISFP', motivator: 'Красивая и удобная среда работы', action: 'Геймификация обучения, командные награды (фам-трип)' },
    ],
  },
  {
    letter: 'K',
    name: 'Knowledge',
    nameRu: 'Знание',
    approach: 'СТРУКТУРИРОВАННОЕ обучение + «песочницы»',
    icon: BookOpen,
    color: 'bg-yellow-500',
    details: [
      { label: 'Для ISTJ', wrong: '«Разберитесь по ходу»', right: 'Подробные мануалы, скринкасты, SOP' },
      { label: 'Для всех', feature: 'Training Sandbox (Песочница)', description: 'Можно нажимать любые кнопки без страха сломать боевую систему. Критически важно для снятия тревожности у ISTJ.' },
    ],
  },
  {
    letter: 'A',
    name: 'Ability',
    nameRu: 'Способность',
    approach: 'ПИЛОТНЫЕ запуски с авторитетными ISTJ',
    icon: Rocket,
    color: 'bg-green-500',
    strategy: {
      name: 'Стратегия «Маяков» (Lighthouse Projects)',
      steps: [
        'Выбрать один отдел или группу амбассадоров (смесь гибких ISFP + авторитетных ISTJ)',
        'Первыми перевести на новые рельсы',
        'Когда авторитетный ISTJ скажет: «Я проверил, система работает» — сопротивление остальных рухнет',
      ],
    },
  },
  {
    letter: 'R',
    name: 'Reinforcement',
    nameRu: 'Закрепление',
    approach: 'Празднование КОНКРЕТНЫХ побед',
    icon: PartyPopper,
    color: 'bg-purple-500',
    examples: [
      { wrong: '«Мы запустили систему!»', right: '«Благодаря новой системе Мария вчера ушла домой вовремя, а не в 20:00, успев обработать тот же объём заявок»' },
    ],
    note: 'Сенсорикам нужна конкретная, ощутимая выгода — не абстрактные достижения.',
  },
]

const cultureTransformation = [
  { attribute: 'Принятие решений', was: 'Иерархия, долго', will: 'Data-driven, быстро' },
  { attribute: 'Отношение к ошибкам', was: 'Страх, наказание', will: 'Обучение, эксперименты' },
  { attribute: 'Коммуникация', was: 'Вертикальная', will: 'Кросс-функциональная' },
  { attribute: 'Инновации', was: '"Это не для нас"', will: '"Давайте попробуем"' },
  { attribute: 'Клиент', was: '"Мы знаем лучше"', will: '"Спросим клиента"' },
  { attribute: 'Данные', was: '"У меня в голове"', will: '"Покажи в CRM"' },
]

const mechanisms = [
  { name: 'Quick Wins', description: 'Быстрые видимые улучшения (офис, оборудование)', timing: 'Месяц 1' },
  { name: 'Change Team', description: 'Добровольцы-проводники изменений', timing: 'Месяц 2' },
  { name: 'Ритуалы', description: 'Еженедельные стендапы, ретроспективы', timing: 'Месяц 3' },
  { name: 'Прозрачность', description: 'Дашборды, открытые KPI', timing: 'Месяц 4' },
  { name: 'Геймификация', description: 'Баллы за CRM, обучение, предложения', timing: 'Месяц 6' },
  { name: 'Признание', description: 'Публичное признание достижений', timing: 'Постоянно' },
]

export default function ChangeManagementPage() {
  return (
    <div className="space-y-8">
      {/* Intro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Почему стандартные подходы не работают
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Классические модели управления изменениями часто терпят неудачу в сенсорных культурах,
            так как опираются на «вдохновляющие видения».
          </p>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              Для ISTJ видение без плана — это галлюцинация.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Digital Champions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Digital Champions
          </CardTitle>
          <CardDescription>
            5-7 сотрудников из текущей команды, которые станут агентами изменений
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selection Criteria */}
          <div>
            <h4 className="font-medium mb-3">Критерии отбора</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Открытость к новому
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Авторитет среди коллег
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Желание учиться
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Позитивное отношение к изменениям
              </Badge>
            </div>
          </div>

          {/* Recommended Candidates */}
          <div>
            <h4 className="font-medium mb-3">Рекомендуемые кандидаты</h4>
            <div className="grid md:grid-cols-2 gap-3">
              {digitalChampions.map((champion) => (
                <div key={champion.name} className="border rounded-lg p-3 flex items-start gap-3">
                  <Award className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{champion.name}</span>
                      <Badge variant="outline" className="text-xs">{champion.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{champion.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Functions */}
          <div>
            <h4 className="font-medium mb-3">Функции Digital Champions</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Пилотирование новых инструментов (CRM, OBT)</li>
              <li>Обучение коллег</li>
              <li>Сбор обратной связи</li>
              <li>«Продажа» изменений изнутри</li>
              <li>Раннее предупреждение о проблемах</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* ADKAR Model */}
      <Card>
        <CardHeader>
          <CardTitle>Адаптированная модель ADKAR для сенсориков</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {adkarSteps.map((step) => (
            <div key={step.letter + step.name} className="border rounded-lg overflow-hidden">
              <div className={`${step.color} text-white px-4 py-2 flex items-center gap-3`}>
                <span className="text-2xl font-bold">{step.letter}</span>
                <div>
                  <span className="font-semibold">{step.name}</span>
                  <span className="text-white/80 ml-2">({step.nameRu})</span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <step.icon className="h-4 w-4" />
                  <span className="font-medium">{step.approach}</span>
                </div>

                {step.examples && (
                  <div className="space-y-3">
                    {step.examples.map((ex, i) => (
                      <div key={i} className="bg-muted rounded-lg p-3">
                        {'type' in ex && <Badge variant="outline" className="mb-2">{ex.type}</Badge>}
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-red-600 font-medium">✗ Неправильно:</span>
                            <p className="text-muted-foreground">{ex.wrong}</p>
                          </div>
                          <div>
                            <span className="text-green-600 font-medium">✓ Правильно:</span>
                            <p>{ex.right}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {step.motivators && (
                  <div className="space-y-2">
                    {step.motivators.map((m, i) => (
                      <div key={i} className="flex gap-4 text-sm">
                        <Badge variant="outline">{m.type}</Badge>
                        <div>
                          <span className="font-medium">{m.motivator}</span>
                          <span className="text-muted-foreground"> → {m.action}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {step.details && (
                  <div className="space-y-3">
                    {step.details.map((d, i) => (
                      <div key={i} className="bg-muted rounded-lg p-3">
                        <span className="font-medium">{d.label}</span>
                        {'wrong' in d && (
                          <div className="grid md:grid-cols-2 gap-3 text-sm mt-2">
                            <div>
                              <span className="text-red-600">✗</span> {d.wrong}
                            </div>
                            <div>
                              <span className="text-green-600">✓</span> {d.right}
                            </div>
                          </div>
                        )}
                        {'feature' in d && (
                          <div className="mt-2 text-sm">
                            <strong>{d.feature}</strong>
                            <p className="text-muted-foreground">{d.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {step.strategy && (
                  <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{step.strategy.name}</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {step.strategy.steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {step.note && (
                  <p className="text-sm italic text-muted-foreground">{step.note}</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Culture Transformation */}
      <Card>
        <CardHeader>
          <CardTitle>Культурная трансформация</CardTitle>
          <CardDescription>От консервативной к адаптивной культуре</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Атрибут</th>
                  <th className="text-left py-2 px-2 text-red-600">Было</th>
                  <th className="text-left py-2 px-2 text-green-600">Будет</th>
                </tr>
              </thead>
              <tbody>
                {cultureTransformation.map((item) => (
                  <tr key={item.attribute} className="border-b last:border-0">
                    <td className="py-2 px-2 font-medium">{item.attribute}</td>
                    <td className="py-2 px-2 text-muted-foreground">{item.was}</td>
                    <td className="py-2 px-2">{item.will}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mechanisms */}
      <Card>
        <CardHeader>
          <CardTitle>Механизмы культурной трансформации</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mechanisms.map((mech) => (
              <div key={mech.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{mech.name}</h4>
                  <Badge variant="outline" className="text-xs">{mech.timing}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{mech.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
