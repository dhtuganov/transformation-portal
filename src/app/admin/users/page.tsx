import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserTable } from '@/components/admin/UserTable'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'User Management | Otrar Admin',
  description: 'Управление пользователями',
}

type Profile = {
  id: string
  email: string
  full_name: string | null
  role: string
  department: string | null
  branch: string | null
  mbti_type: string | null
  mbti_verified: boolean
  created_at: string
}

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get all users
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false }) as { data: Profile[] | null }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Управление пользователями</h1>
        <p className="text-muted-foreground mt-1">
          Просмотр и управление учетными записями пользователей
        </p>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Все пользователи</CardTitle>
          <CardDescription>
            Список всех зарегистрированных пользователей системы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable users={users || []} />
        </CardContent>
      </Card>
    </div>
  )
}
