import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart3, TrendingUp, Users, Heart, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'KPI трансформации | Стратегия | Otrar',
}

const businessKPIs = [
  { metric: 'Рост выручки', baseline: '0%', q2: '+10%', q4: '+30%', responsible: 'Commercial Director', progress: 0 },
  { metric: 'Новые B2B клиенты', baseline: '~5/год', q2: '+20', q4: '+50', responsible: 'Hunters', progress: 0 },
  { metric: 'B2C VIP клиенты', baseline: '0', q2: '25', q4: '50+', responsible: 'Unit Leisure', progress: 0 },
  { metric: 'DSO (дебиторка)', baseline: '? дней', q2: '-10%', q4: '-20%', responsible: 'CFO', progress: 0 },
  { metric: 'NPS клиентов', baseline: 'Не изм.', q2: 'Baseline', q4: '>40', responsible: 'Customer Success', progress: 0 },
  { metric: 'CRM adoption', baseline: '0%', q2: '50%', q4: '80%+', responsible: 'CDO', progress: 0 },
  { metric: 'OBT transactions', baseline: '0%', q2: '20%', q4: '60%', responsible: 'CDO', progress: 0 },
]

const teamKPIs = [
  { metric: 'MBTI определено', baseline: '10/15', q2: '15/15', q4: '100%', responsible: 'Зарина', progress: 67 },
  { metric: 'ИПР составлено', baseline: '0', q2: '50%', q4: '100%', responsible: 'HR BP', progress: 0 },
  { metric: 'Обучение (часы/чел)', baseline: '0', q2: '20', q4: '50+', responsible: 'HR BP', progress: 0 },
  { metric: 'eNPS команды', baseline: '?', q2: 'Baseline', q4: '>20', responsible: 'HR BP', progress: 0 },
  { metric: 'Текучесть ключевых', baseline: '?', q2: '0%', q4: '<10%', responsible: 'HR BP', progress: 0 },
  { metric: 'Portal weekly usage', baseline: '0', q2: '50%', q4: '80%+', responsible: 'CDO', progress: 0 },
]

const cultureKPIs = [
  { metric: 'Change readiness', baseline: '2/5', q2: '3/5', q4: '4/5', responsible: 'Давид', progress: 40 },
  { metric: 'Digital Champions активны', baseline: '0', q2: '5-7', q4: '5-7', responsible: 'Альбина', progress: 0 },
  { metric: 'Инициативы от команды', baseline: '0', q2: '5', q4: '15+', responsible: 'Change Team', progress: 0 },
  { metric: 'Quick Wins реализовано', baseline: '0', q2: '10', q4: '25+', responsible: 'Альбина', progress: 0 },
]

const risks = [
  { id: 1, risk: 'ATOM-зависимость', severity: 'critical', probability: 'High', mitigation: 'Параллельный CRM, не развивать ATOM' },
  { id: 2, risk: 'Кредитный кризис', severity: 'critical', probability: 'Medium', mitigation: 'Немедленный аудит + Hard Stop Q1' },
  { id: 3, risk: 'Найм NT в SF-культуру', severity: 'critical', probability: 'Medium', mitigation: 'Онбординг через Зарину, buddy-система' },
  { id: 4, risk: 'Уход AM с клиентами', severity: 'high', probability: 'Medium', mitigation: 'CRM-миграция, контрактные обязательства' },
  { id: 5, risk: 'Саботаж изменений', severity: 'high', probability: 'High', mitigation: 'Digital Champions, Quick Wins, прозрачность' },
  { id: 6, risk: 'Алия не делегирует', severity: 'high', probability: 'Medium', mitigation: 'Коучинг, ИПР, ENTJ-партнёр (CDO)' },
  { id: 7, risk: 'Бюджетные ограничения', severity: 'medium', probability: 'Medium', mitigation: 'Поэтапность, приоритизация P0' },
  { id: 8, risk: 'Уход NT из-за "медленности"', severity: 'medium', probability: 'Low', mitigation: 'Чёткие KPI, автономия, терпение' },
]

export default function KPIPage() {
  return (
    <div className="space-y-8">
      {/* Business KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Бизнес-метрики
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Метрика</th>
                  <th className="text-left py-2 px-2">Baseline</th>
                  <th className="text-left py-2 px-2">Q2 2026</th>
                  <th className="text-left py-2 px-2">Q4 2026</th>
                  <th className="text-left py-2 px-2">Ответственный</th>
                  <th className="text-left py-2 px-2 w-32">Прогресс</th>
                </tr>
              </thead>
              <tbody>
                {businessKPIs.map((kpi) => (
                  <tr key={kpi.metric} className="border-b last:border-0">
                    <td className="py-2 px-2 font-medium">{kpi.metric}</td>
                    <td className="py-2 px-2 text-muted-foreground">{kpi.baseline}</td>
                    <td className="py-2 px-2">{kpi.q2}</td>
                    <td className="py-2 px-2 font-medium text-green-600">{kpi.q4}</td>
                    <td className="py-2 px-2 text-muted-foreground">{kpi.responsible}</td>
                    <td className="py-2 px-2">
                      <Progress value={kpi.progress} className="h-2" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Team KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Командные метрики
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Метрика</th>
                  <th className="text-left py-2 px-2">Baseline</th>
                  <th className="text-left py-2 px-2">Q2 2026</th>
                  <th className="text-left py-2 px-2">Q4 2026</th>
                  <th className="text-left py-2 px-2">Ответственный</th>
                  <th className="text-left py-2 px-2 w-32">Прогресс</th>
                </tr>
              </thead>
              <tbody>
                {teamKPIs.map((kpi) => (
                  <tr key={kpi.metric} className="border-b last:border-0">
                    <td className="py-2 px-2 font-medium">{kpi.metric}</td>
                    <td className="py-2 px-2 text-muted-foreground">{kpi.baseline}</td>
                    <td className="py-2 px-2">{kpi.q2}</td>
                    <td className="py-2 px-2 font-medium text-green-600">{kpi.q4}</td>
                    <td className="py-2 px-2 text-muted-foreground">{kpi.responsible}</td>
                    <td className="py-2 px-2">
                      <Progress value={kpi.progress} className="h-2" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Culture KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Культурные метрики
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Метрика</th>
                  <th className="text-left py-2 px-2">Baseline</th>
                  <th className="text-left py-2 px-2">Q2 2026</th>
                  <th className="text-left py-2 px-2">Q4 2026</th>
                  <th className="text-left py-2 px-2">Ответственный</th>
                  <th className="text-left py-2 px-2 w-32">Прогресс</th>
                </tr>
              </thead>
              <tbody>
                {cultureKPIs.map((kpi) => (
                  <tr key={kpi.metric} className="border-b last:border-0">
                    <td className="py-2 px-2 font-medium">{kpi.metric}</td>
                    <td className="py-2 px-2 text-muted-foreground">{kpi.baseline}</td>
                    <td className="py-2 px-2">{kpi.q2}</td>
                    <td className="py-2 px-2 font-medium text-green-600">{kpi.q4}</td>
                    <td className="py-2 px-2 text-muted-foreground">{kpi.responsible}</td>
                    <td className="py-2 px-2">
                      <Progress value={kpi.progress} className="h-2" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Risks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Риски и митигация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 w-8">#</th>
                  <th className="text-left py-2 px-2">Риск</th>
                  <th className="text-left py-2 px-2 w-24">Severity</th>
                  <th className="text-left py-2 px-2 w-24">Probability</th>
                  <th className="text-left py-2 px-2">Митигация</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((risk) => (
                  <tr key={risk.id} className="border-b last:border-0">
                    <td className="py-2 px-2 text-muted-foreground">{risk.id}</td>
                    <td className="py-2 px-2 font-medium">{risk.risk}</td>
                    <td className="py-2 px-2">
                      <Badge className={
                        risk.severity === 'critical' ? 'bg-red-500' :
                          risk.severity === 'high' ? 'bg-orange-500' : 'bg-amber-500'
                      }>
                        {risk.severity === 'critical' ? 'Critical' :
                          risk.severity === 'high' ? 'High' : 'Medium'}
                      </Badge>
                    </td>
                    <td className="py-2 px-2 text-muted-foreground">{risk.probability}</td>
                    <td className="py-2 px-2">{risk.mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">+30%</div>
              <p className="text-muted-foreground mt-1">Целевой рост выручки</p>
              <p className="text-sm text-muted-foreground">к Q4 2026</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">80%+</div>
              <p className="text-muted-foreground mt-1">CRM adoption</p>
              <p className="text-sm text-muted-foreground">к Q4 2026</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">&gt;40</div>
              <p className="text-muted-foreground mt-1">Целевой NPS</p>
              <p className="text-sm text-muted-foreground">к Q4 2026</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
