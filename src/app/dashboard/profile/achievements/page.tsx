import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGamificationPageData } from '@/lib/gamification'
import { AchievementsPageClient } from './client'

export default async function AchievementsPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch gamification data
  const data = await getGamificationPageData(user.id)

  if (!data) {
    // Return page with empty state
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Загрузка данных...</h2>
          <p className="text-muted-foreground">
            Не удалось загрузить данные о достижениях. Попробуйте обновить страницу.
          </p>
        </div>
      </div>
    )
  }

  return (
    <AchievementsPageClient
      gamification={data.gamification}
      achievements={data.achievements}
      userAchievements={data.userAchievements}
      weeklyXp={data.weeklyXp}
    />
  )
}
