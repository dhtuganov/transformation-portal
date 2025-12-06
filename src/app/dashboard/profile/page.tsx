import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { TypeCard } from '@/components/mbti/TypeCard'
import { User, Mail, Building, MapPin, Briefcase, Edit } from 'lucide-react'
import type { MBTIType, MBTIProfile } from '@/types/database'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Мой профиль | Otrar Transformation Portal',
  description: 'Ваш профиль и MBTI-тип',
}

// DEMO MODE flag - set to false when connecting real Supabase
const DEMO_MODE = false

// Mock data for demo
const MOCK_PROFILE = {
  id: 'demo-user-1',
  email: 'demo@otrar.kz',
  full_name: 'Айгуль Сериккызы',
  role: 'manager',
  mbti_type: 'ENFP',
  mbti_verified: true,
  department: 'Продажи',
  branch: 'Алматы',
  job_title: 'Менеджер по продажам',
  avatar_url: null,
}

const MOCK_MBTI_PROFILE: MBTIProfile = {
  id: 'demo-mbti-1',
  user_id: 'demo-user-1',
  mbti_type: 'ENFP',
  dominant_function: 'Ne',
  auxiliary_function: 'Fi',
  tertiary_function: 'Te',
  inferior_function: 'Si',
  strengths: ['Креативность', 'Эмпатия', 'Энтузиазм', 'Гибкость мышления'],
  growth_areas: ['Завершение начатого', 'Фокусировка', 'Работа с деталями'],
  communication_style: {
    preferred: 'Открытый диалог',
    avoid: 'Излишний формализм',
    tips: 'Давайте возможность высказаться',
  },
  assessed_by: 'Зарина Сатубалдина',
  assessed_at: '2024-10-15T10:00:00Z',
  created_at: '2024-10-15T10:00:00Z',
}

const ROLE_LABELS: Record<string, string> = {
  employee: 'Сотрудник',
  manager: 'Менеджер',
  executive: 'Руководитель',
  admin: 'Администратор',
}

type ProfileData = {
  id: string
  email: string
  full_name: string | null
  role: string
  mbti_type: string | null
  mbti_verified: boolean
  department: string | null
  branch: string | null
  job_title: string | null
  avatar_url: string | null
}

export default async function ProfilePage() {
  let profile: ProfileData | null = MOCK_PROFILE
  let mbtiProfile: MBTIProfile | null = MOCK_MBTI_PROFILE
  let userEmail = MOCK_PROFILE.email

  if (!DEMO_MODE) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    userEmail = user.email || ''

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single() as { data: ProfileData | null }

    profile = profileData

    // Get detailed MBTI profile if exists
    mbtiProfile = null
    if (profile?.mbti_type) {
      const { data } = await supabase
        .from('mbti_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single() as { data: MBTIProfile | null }
      mbtiProfile = data
    }
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return userEmail?.[0]?.toUpperCase() || 'U'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Мой профиль</h1>
          <p className="text-muted-foreground mt-1">
            Информация о вас и вашем MBTI-типе
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/profile/edit">
            <Edit className="mr-2 h-4 w-4" />
            Редактировать профиль
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Info Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4">
              {profile?.full_name || 'Пользователь'}
            </CardTitle>
            <CardDescription>
              <Badge variant="secondary" className="mt-1">
                {ROLE_LABELS[profile?.role || 'employee']}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{userEmail}</span>
            </div>
            {profile?.job_title && (
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{profile.job_title}</span>
              </div>
            )}
            {profile?.department && (
              <div className="flex items-center gap-3 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{profile.department}</span>
              </div>
            )}
            {profile?.branch && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profile.branch}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* MBTI Profile Card */}
        <div className="md:col-span-2">
          {profile?.mbti_type ? (
            <TypeCard
              type={profile.mbti_type as MBTIType}
              strengths={mbtiProfile?.strengths as string[] | undefined}
              growthAreas={mbtiProfile?.growth_areas as string[] | undefined}
              showFunctions
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  MBTI-профиль
                </CardTitle>
                <CardDescription>
                  Ваш психотип ещё не определён
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium mb-2">MBTI-тип не определён</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Для определения вашего MBTI-типа обратитесь к Зарине Сатубалдиной
                    или пройдите тестирование. После определения типа вы получите
                    персонализированные рекомендации.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Additional Info */}
      {profile?.mbti_type && mbtiProfile && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Communication Style */}
          {mbtiProfile.communication_style && Object.keys(mbtiProfile.communication_style as object).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Стиль коммуникации</CardTitle>
                <CardDescription>
                  Как эффективно взаимодействовать с вами
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(mbtiProfile.communication_style as Record<string, string>).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium capitalize">{key}:</span>{' '}
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assessment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Информация об оценке</CardTitle>
              <CardDescription>
                Данные о вашем MBTI-тестировании
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Статус</span>
                <Badge variant={profile.mbti_verified ? 'default' : 'secondary'}>
                  {profile.mbti_verified ? 'Подтверждён' : 'Ожидает подтверждения'}
                </Badge>
              </div>
              {mbtiProfile.assessed_by && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Оценщик</span>
                  <span>{mbtiProfile.assessed_by}</span>
                </div>
              )}
              {mbtiProfile.assessed_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Дата оценки</span>
                  <span>{new Date(mbtiProfile.assessed_at).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
