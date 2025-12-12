import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Пользователи для удаления (старые дубликаты и тестовые)
const usersToDelete = [
  'aliya@otrar.kz',      // дубликат Алии
  'albina@otrar.kz',     // дубликат Альбины
  'zarina@creata.team'   // тестовый пользователь
]

async function cleanupDuplicates() {
  console.log('Удаляю дубликаты и тестовых пользователей...\n')

  for (const email of usersToDelete) {
    // Получаем профиль
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('email', email)
      .single()

    if (!profile) {
      console.log(`⊘ ${email} - не найден`)
      continue
    }

    // Пробуем удалить auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(profile.id)

    if (authError) {
      // Если auth user не найден, удаляем только профиль
      if (authError.message.includes('not found')) {
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', profile.id)

        if (profileError) {
          console.error(`✗ Ошибка удаления профиля ${profile.full_name}:`, profileError.message)
        } else {
          console.log(`✓ Удалён профиль: ${profile.full_name} (${email})`)
        }
      } else {
        console.error(`✗ Ошибка удаления auth ${profile.full_name}:`, authError.message)
      }
    } else {
      console.log(`✓ Удалён: ${profile.full_name} (${email})`)
    }
  }

  console.log('\n✅ Очистка завершена!')

  // Показываем итоговый список
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('full_name, job_title, mbti_type, email, role')
    .order('full_name')

  console.log('\n📋 Итоговый список сотрудников:\n')
  allProfiles?.forEach((p, i) => {
    console.log(`${i + 1}. ${p.full_name}`)
    console.log(`   ${p.job_title || 'Должность не указана'} | ${p.mbti_type || 'Тип не определён'} | ${p.role}`)
    console.log(`   ${p.email}\n`)
  })
}

cleanupDuplicates().catch(console.error)
