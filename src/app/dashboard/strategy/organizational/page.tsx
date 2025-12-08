import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Zap, Shield, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Организационная структура | Стратегия | Otrar',
}

export default function OrganizationalPage() {
  return (
    <div className="space-y-8">
      {/* Bimodal Organization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Бимодальная организационная структура
          </CardTitle>
          <CardDescription>
            Сохранение стабильности при интеграции инноваций
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Попытка мгновенно превратить консервативную компанию в цифровой стартап приведёт к коллапсу.
            Решение — бимодальная модель, позволяющая сохранить стабильность при интеграции инноваций.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Mode 1 */}
            <div className="border rounded-lg p-6 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
                <div>
                  <Badge className="bg-blue-500">Mode 1</Badge>
                  <h3 className="font-bold text-lg">Марафонцы</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Кто</h4>
                  <p>ISTJ, часть ISFP</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Фокус</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Стабильность</li>
                    <li>• Безопасность</li>
                    <li>• Точность</li>
                    <li>• Глубокая экспертиза</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Задача</h4>
                  <p className="text-sm">Текущий денежный поток, безупречный сервис</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Изменения</h4>
                  <p className="text-sm">Медленно, после тестирования</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Лидерство</h4>
                  <p className="text-sm">Операционный директор (из «старых»)</p>
                </div>
              </div>
            </div>

            {/* Mode 2 */}
            <div className="border rounded-lg p-6 bg-orange-50/50 dark:bg-orange-950/20">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-6 w-6 text-orange-600" />
                <div>
                  <Badge className="bg-orange-500">Mode 2</Badge>
                  <h3 className="font-bold text-lg">Спринтеры</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Кто</h4>
                  <p>Новые наймы + «амбассадоры» из Mode 1</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Фокус</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Скорость</li>
                    <li>• Эксперименты</li>
                    <li>• MVP, итерации</li>
                    <li>• Ошибки = обучение</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Задача</h4>
                  <p className="text-sm">Мобильное приложение, AI-боты, новые модели</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Изменения</h4>
                  <p className="text-sm">Быстро, fail fast</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Лидерство</h4>
                  <p className="text-sm">CDO + Commercial Director</p>
                </div>
              </div>
            </div>
          </div>

          {/* The Bridge */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <h3 className="font-bold text-lg mb-2">THE BRIDGE (Мост)</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
              <div className="bg-muted rounded px-4 py-2">
                <strong>HRBP:</strong> Ротация кадров между режимами
              </div>
              <ArrowRight className="h-4 w-4 hidden md:block" />
              <div className="bg-muted rounded px-4 py-2">
                <strong>CDO:</strong> Технологическая интеграция, данные Mode 1 → Mode 2
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Сравнение режимов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Характеристика</th>
                  <th className="text-left py-2 px-2">Mode 1</th>
                  <th className="text-left py-2 px-2">Mode 2</th>
                  <th className="text-left py-2 px-2">Стратегия интеграции</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-2 font-medium">Цель</td>
                  <td className="py-2 px-2">Надёжность и предсказуемость</td>
                  <td className="py-2 px-2">Скорость и гибкость</td>
                  <td className="py-2 px-2 text-muted-foreground">Общие стратсессии раз в квартал</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-2 font-medium">Культура</td>
                  <td className="py-2 px-2">Иерархическая, процедурная (ISTJ)</td>
                  <td className="py-2 px-2">Коллаборативная, гибкая (N-types)</td>
                  <td className="py-2 px-2 text-muted-foreground">Кросс-функциональные проектные группы</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-2 font-medium">Отношение к риску</td>
                  <td className="py-2 px-2">Минимизация рисков</td>
                  <td className="py-2 px-2">Управление рисками (Fail fast)</td>
                  <td className="py-2 px-2 text-muted-foreground">«Песочницы» для тестирования</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-medium">Мотивация</td>
                  <td className="py-2 px-2">Стабильность, признание экспертности</td>
                  <td className="py-2 px-2">Новизна, рост, достижения</td>
                  <td className="py-2 px-2 text-muted-foreground">Геймификация с разными типами наград</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Hunter/Farmer Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Модель продаж Hunter/Farmer
          </CardTitle>
          <CardDescription>Разделение функций для эффективности</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Hunters */}
            <div className="border rounded-lg p-4">
              <Badge className="mb-2 bg-red-500">Hunters (Охотники)</Badge>
              <p className="text-sm text-muted-foreground mb-3">3-5 человек</p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm">Фокус</h4>
                  <ul className="text-sm text-muted-foreground">
                    <li>• Новые Enterprise</li>
                    <li>• Рамочные договоры</li>
                    <li>• Тендеры</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm">KPI</h4>
                  <ul className="text-sm text-muted-foreground">
                    <li>• Объём нового бизнеса</li>
                    <li>• Количество договоров</li>
                    <li>• Pipeline velocity</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Типы</h4>
                  <p className="text-sm">ESTP, ENTP, ENTJ</p>
                  <Badge variant="outline" className="mt-1">Найм</Badge>
                </div>
              </div>
            </div>

            {/* Farmers */}
            <div className="border rounded-lg p-4">
              <Badge className="mb-2 bg-green-500">Farmers (Фермеры)</Badge>
              <p className="text-sm text-muted-foreground mb-3">8-10 человек</p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm">Фокус</h4>
                  <ul className="text-sm text-muted-foreground">
                    <li>• Развитие текущих клиентов</li>
                    <li>• QBR (квартальные обзоры)</li>
                    <li>• Upsell, cross-sell</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm">KPI</h4>
                  <ul className="text-sm text-muted-foreground">
                    <li>• Net Retention Rate</li>
                    <li>• Share of Wallet</li>
                    <li>• NPS клиентов</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Типы</h4>
                  <p className="text-sm">ISFJ, ESFJ, ISFP</p>
                  <Badge variant="outline" className="mt-1 border-green-500 text-green-600">Есть!</Badge>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="border rounded-lg p-4">
              <Badge className="mb-2 bg-blue-500">Support (Поддержка)</Badge>
              <p className="text-sm text-muted-foreground mb-3">5-7 чел. + автоматизация</p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm">Фокус</h4>
                  <ul className="text-sm text-muted-foreground">
                    <li>• Операционная обработка</li>
                    <li>• Изменения</li>
                    <li>• Возвраты</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm">KPI</h4>
                  <ul className="text-sm text-muted-foreground">
                    <li>• SLA</li>
                    <li>• Время обработки</li>
                    <li>• First Contact Resolution</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Типы</h4>
                  <p className="text-sm">ISTJ, ISFJ</p>
                  <Badge variant="outline" className="mt-1 border-green-500 text-green-600">Есть!</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Целевая организационная структура</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm font-mono">
            {/* Акционер */}
            <div className="text-center">
              <div className="inline-block border-2 rounded-lg px-4 py-2 bg-purple-50 dark:bg-purple-950/30">
                <strong>АКЦИОНЕР</strong>
                <br />
                Алия (ISFP)
                <br />
                <span className="text-xs text-muted-foreground">Стратегические решения</span>
              </div>
            </div>

            {/* Executive Level */}
            <div className="grid grid-cols-5 gap-2 text-center">
              <div className="border rounded-lg px-2 py-2">
                <strong>CEO</strong>
                <br />
                Альбина
                <br />
                <Badge variant="outline" className="text-xs">ISTJ</Badge>
              </div>
              <div className="border rounded-lg px-2 py-2 bg-green-50 dark:bg-green-950/30">
                <strong>CDO</strong>
                <br />
                [НАЙМ]
                <br />
                <Badge className="text-xs bg-green-500">ENTJ/INTJ</Badge>
              </div>
              <div className="border rounded-lg px-2 py-2 bg-green-50 dark:bg-green-950/30">
                <strong>Commercial</strong>
                <br />
                [НАЙМ]
                <br />
                <Badge className="text-xs bg-green-500">ENTJ/ESTP</Badge>
              </div>
              <div className="border rounded-lg px-2 py-2">
                <strong>CFO</strong>
                <br />
                [Текущий]
              </div>
              <div className="border rounded-lg px-2 py-2 bg-green-50 dark:bg-green-950/30">
                <strong>HR BP</strong>
                <br />
                [НАЙМ]
                <br />
                <Badge className="text-xs bg-green-500">ENFJ</Badge>
              </div>
            </div>

            {/* Business Units */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="border rounded-lg px-2 py-2">
                <strong>UNIT CORPORATE</strong>
                <br />
                <span className="text-xs text-muted-foreground">B2B клиенты</span>
                <br />
                <span className="text-xs">Hunters • Farmers • Support</span>
              </div>
              <div className="border rounded-lg px-2 py-2">
                <strong>UNIT MICE</strong>
                <br />
                <span className="text-xs text-muted-foreground">Мероприятия</span>
                <br />
                <span className="text-xs">PM • Креатив • Логистика</span>
              </div>
              <div className="border rounded-lg px-2 py-2">
                <strong>UNIT LEISURE</strong>
                <br />
                <span className="text-xs text-muted-foreground">B2C, VIP</span>
                <br />
                <span className="text-xs">Консультанты • Пакетирование</span>
              </div>
            </div>

            {/* Shared Services */}
            <div className="grid grid-cols-3 gap-2 text-center bg-muted/30 rounded-lg p-2">
              <div className="border rounded-lg px-2 py-2 bg-background">
                <strong>IT & Product</strong>
                <br />
                <span className="text-xs">CDO • Head of Product • Dev</span>
              </div>
              <div className="border rounded-lg px-2 py-2 bg-background">
                <strong>Finance & Risk</strong>
                <br />
                <span className="text-xs">CFO • Бухгалтерия • Кредитный контроль</span>
              </div>
              <div className="border rounded-lg px-2 py-2 bg-background">
                <strong>Marketing</strong>
                <br />
                <span className="text-xs">Head of Marketing • Digital • ABM</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
