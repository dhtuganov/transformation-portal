import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Users, Brain, MessageSquare } from 'lucide-react'

export const metadata = {
  title: 'Профиль команды | Стратегия | Otrar',
}

const teamMembers = [
  { name: 'Досмухамбетова Алия Т.', position: 'Акционер', type: 'ISFP', temperament: 'SP Explorer' },
  { name: 'Сарсенбаева Альбина А.', position: 'И.о. управляющего директора', type: 'ISTJ', temperament: 'SJ Sentinel' },
  { name: 'Бостанжиев Дмитрий К.', position: 'Зам. управляющего директора', type: null, temperament: null },
  { name: 'Ауелбаева Гульмира С.', position: 'Главный бухгалтер', type: null, temperament: null },
  { name: 'Атыгаева Марал А.', position: 'Координатор по качеству', type: 'ISFP', temperament: 'SP Explorer' },
  { name: 'Звездина Татьяна В.', position: 'Директор филиала Астана', type: 'ISFP', temperament: 'SP Explorer' },
  { name: 'Кораблева Екатерина В.', position: 'Директор филиала Атырау/ЗКО', type: 'ISTP', temperament: 'SP Explorer' },
  { name: 'Абдирова Айман Ж.', position: 'Супервайзер отдела туризма', type: 'ESFP', temperament: 'SP Explorer' },
  { name: 'Джулаева Асель Е.', position: 'Супервайзер', type: 'ISFP', temperament: 'SP Explorer' },
  { name: 'Умарходжиева Наиля Р.', position: 'Супервайзер', type: 'ESTJ', temperament: 'SJ Sentinel' },
  { name: 'Жумаканов Айдын Т.', position: 'Старший агент', type: null, temperament: null },
  { name: 'Белых Антонина Б.', position: 'Координатор по авиакомпаниям', type: 'ISTJ', temperament: 'SJ Sentinel' },
  { name: 'Букарев Валерий О.', position: 'Менеджер-программист', type: 'ISFP', temperament: 'SP Explorer' },
]

const distributions = [
  { label: 'Интроверты (I)', value: 80, total: 8, color: 'bg-blue-500', status: 'warning' },
  { label: 'Экстраверты (E)', value: 20, total: 2, color: 'bg-blue-300', status: 'critical' },
  { label: 'Сенсорики (S)', value: 100, total: 10, color: 'bg-red-500', status: 'critical' },
  { label: 'Интуиты (N)', value: 0, total: 0, color: 'bg-red-300', status: 'critical' },
  { label: 'Мыслящие (T)', value: 40, total: 4, color: 'bg-green-500', status: 'ok' },
  { label: 'Чувствующие (F)', value: 60, total: 6, color: 'bg-green-300', status: 'ok' },
  { label: 'Организованные (J)', value: 40, total: 4, color: 'bg-purple-500', status: 'ok' },
  { label: 'Воспринимающие (P)', value: 60, total: 6, color: 'bg-purple-300', status: 'ok' },
]

const cognitiveProfiles = [
  {
    type: 'ISTJ',
    title: 'Архитекторы стабильности',
    members: 'Альбина, Антонина',
    functions: [
      { name: 'Si', role: 'Доминантная', desc: 'База данных прошлого опыта' },
      { name: 'Te', role: 'Вспомогательная', desc: 'Эффективность, протоколы' },
      { name: 'Fi', role: 'Третичная', desc: 'Внутренний кодекс чести' },
      { name: 'Ne', role: 'Подчинённая', desc: 'Ахиллесова пята — неопределённость' },
    ],
    insight: 'ISTJ не против улучшений — они против хаоса. Будут саботировать внедрение, если не увидят пошагового плана и доказательств надёжности.',
    communication: [
      { topic: 'Внедрение CRM', message: '«Система структурирует данные и снизит вероятность ошибок в документах на 40%»' },
      { topic: 'Изменение оргструктуры', message: '«Это оптимизирует процессы и чётко разграничит зоны ответственности»' },
      { topic: 'Цифровое обучение', message: '«Мы предоставим пошаговые инструкции и время для отработки навыков»' },
    ],
  },
  {
    type: 'ISFP',
    title: 'Эмпатичные мастера клиентского опыта',
    members: 'Алия, Марал, Татьяна, Асель, Валерий',
    functions: [
      { name: 'Fi', role: 'Доминантная', desc: 'Личные ценности' },
      { name: 'Se', role: 'Вспомогательная', desc: 'Мастера момента' },
      { name: 'Ni', role: 'Третичная', desc: 'Предвидение трендов' },
      { name: 'Te', role: 'Подчинённая', desc: 'Ахиллесова пята — бюрократия' },
    ],
    insight: 'ISFP станут критиками сложных интерфейсов. Но если показать, что технологии освобождают для творчества — станут амбассадорами.',
    communication: [
      { topic: 'Внедрение CRM', message: '«Система запомнит, что любит клиент, и ты сможешь удивить его при следующем звонке»' },
      { topic: 'Изменение оргструктуры', message: '«Это поможет каждому заниматься тем, что у него получается лучше всего»' },
      { topic: 'Цифровое обучение', message: '«Мы сделали обучение интересным и интерактивным, лучшие получат призы»' },
    ],
  },
]

export default function TeamProfilePage() {
  const determinedCount = teamMembers.filter(m => m.type).length
  const totalCount = teamMembers.length

  return (
    <div className="space-y-8">
      {/* Alert */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Критический дисбаланс</AlertTitle>
        <AlertDescription>
          100% команды — сенсорики (S), 0% интуитов (N). Отсутствуют типы, необходимые для
          стратегического видения и инноваций.
        </AlertDescription>
      </Alert>

      {/* Team Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Текущий состав команды
          </CardTitle>
          <CardDescription>
            Определено {determinedCount} из {totalCount} сотрудников
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">#</th>
                  <th className="text-left py-2 px-2">ФИО</th>
                  <th className="text-left py-2 px-2">Должность</th>
                  <th className="text-left py-2 px-2">Тип</th>
                  <th className="text-left py-2 px-2">Темперамент</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 px-2 text-muted-foreground">{i + 1}</td>
                    <td className="py-2 px-2 font-medium">{member.name}</td>
                    <td className="py-2 px-2 text-muted-foreground">{member.position}</td>
                    <td className="py-2 px-2">
                      {member.type ? (
                        <Badge variant="outline">{member.type}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-muted-foreground">{member.temperament || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Распределение по дихотомиям</CardTitle>
          <CardDescription>На основе 10 определённых профилей</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* E/I */}
            <div>
              <h4 className="font-medium mb-3">Энергия (E/I)</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Интроверты (I)</span>
                  <span className="text-amber-600">80% (8 чел.)</span>
                </div>
                <Progress value={80} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Экстраверты (E)</span>
                  <span className="text-red-600">20% (2 чел.)</span>
                </div>
                <Progress value={20} className="h-2" />
              </div>
            </div>

            {/* S/N */}
            <div>
              <h4 className="font-medium mb-3">Информация (S/N)</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Сенсорики (S)</span>
                  <span className="text-red-600 font-bold">100% (10 чел.)</span>
                </div>
                <Progress value={100} className="h-2 [&>div]:bg-red-500" />
                <div className="flex justify-between text-sm">
                  <span>Интуиты (N)</span>
                  <span className="text-red-600 font-bold">0% (0 чел.)</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </div>

            {/* T/F */}
            <div>
              <h4 className="font-medium mb-3">Решения (T/F)</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Мыслящие (T)</span>
                  <span>40% (4 чел.)</span>
                </div>
                <Progress value={40} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Чувствующие (F)</span>
                  <span>60% (6 чел.)</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </div>

            {/* J/P */}
            <div>
              <h4 className="font-medium mb-3">Образ жизни (J/P)</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Организованные (J)</span>
                  <span>40% (4 чел.)</span>
                </div>
                <Progress value={40} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Воспринимающие (P)</span>
                  <span>60% (6 чел.)</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missing Types */}
      <Card>
        <CardHeader>
          <CardTitle>Отсутствующие критические типы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
              <h4 className="font-semibold text-red-700 dark:text-red-400">NT Analysts</h4>
              <p className="text-sm text-muted-foreground mt-1">INTJ, INTP, ENTJ, ENTP</p>
              <p className="text-sm mt-2">Стратегия, системы, архитектура</p>
            </div>
            <div className="border rounded-lg p-4 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
              <h4 className="font-semibold text-red-700 dark:text-red-400">NF Diplomats</h4>
              <p className="text-sm text-muted-foreground mt-1">ENFJ, INFJ, ENFP, INFP</p>
              <p className="text-sm mt-2">Видение, изменения, культура</p>
            </div>
            <div className="border rounded-lg p-4 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <h4 className="font-semibold text-amber-700 dark:text-amber-400">EN Types</h4>
              <p className="text-sm text-muted-foreground mt-1">ENTJ, ENTP, ENFJ, ENFP</p>
              <p className="text-sm mt-2">Драйв, networking, продвижение</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cognitive Anthropology */}
      {cognitiveProfiles.map((profile) => (
        <Card key={profile.type}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <div>
                <CardTitle>
                  {profile.type}: {profile.title}
                </CardTitle>
                <CardDescription>{profile.members}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cognitive Stack */}
            <div>
              <h4 className="font-medium mb-3">Когнитивный стек</h4>
              <div className="grid md:grid-cols-4 gap-3">
                {profile.functions.map((fn, i) => (
                  <div key={fn.name} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={i === 0 ? 'default' : i === 3 ? 'destructive' : 'secondary'}>
                        {fn.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{fn.role}</span>
                    </div>
                    <p className="text-sm">{fn.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Insight */}
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm italic">{profile.insight}</p>
            </div>

            {/* Communication Strategies */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Стратегия коммуникации
              </h4>
              <div className="space-y-3">
                {profile.communication.map((comm) => (
                  <div key={comm.topic} className="flex gap-4 text-sm">
                    <span className="font-medium min-w-[180px]">{comm.topic}</span>
                    <span className="text-muted-foreground">{comm.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
