import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/ProfileForm'
import type { Profile } from '@/types/database'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Редактировать профиль | Otrar Transformation Portal',
  description: 'Редактирование вашего профиля',
}

// DEMO MODE flag - set to false when connecting real Supabase
const DEMO_MODE = false

// Mock data for demo
const MOCK_PROFILE: Profile = {
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
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export default async function ProfileEditPage() {
  let profile: Profile | null = MOCK_PROFILE
  let userId = 'demo-user-1'

  if (!DEMO_MODE) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    userId = user.id

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileData) {
      redirect('/dashboard/profile')
    }

    profile = profileData
  }

  if (!profile) {
    redirect('/dashboard/profile')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Редактировать профиль</h1>
        <p className="text-muted-foreground mt-1">
          Обновите вашу персональную информацию
        </p>
      </div>

      <ProfileForm profile={profile} userId={userId} />
    </div>
  )
}
