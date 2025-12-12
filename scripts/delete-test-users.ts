import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Тестовые пользователи Star Wars для удаления
const testUsers = [
  'Test User',
  'Анакин Скайуокер',
  'Асока Тано',
  'Дин Джарин',
  'Йода',
  'Кайло Рен',
  'Лея Органа',
  'Люк Скайуокер',
  'Мейс Винду',
  'Оби-Ван Кеноби',
  'Падме Амидала',
  'По Дэмерон',
  'Рей Скайуокер',
  'Финн',
  'Хан Соло',
  'Чубакка'
]

async function deleteTestUsers() {
  console.log('Получаю список профилей...\n')

  // Сначала получаем профили тестовых пользователей
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('full_name', testUsers)

  if (profilesError) {
    console.error('Ошибка получения профилей:', profilesError)
    return
  }

  console.log(`Найдено ${profiles.length} тестовых пользователей для удаления:\n`)
  profiles.forEach((p) => {
    console.log(`  - ${p.full_name} (${p.email || 'no email'})`)
  })

  if (profiles.length === 0) {
    console.log('Тестовые пользователи не найдены.')
    return
  }

  console.log('\nУдаляю пользователей...\n')

  const userIds = profiles.map(p => p.id)

  // Сначала пробуем удалить из auth.users
  for (const profile of profiles) {
    const { error } = await supabase.auth.admin.deleteUser(profile.id)
    if (error) {
      // Если пользователь не найден в auth, удаляем только профиль
      if (error.message.includes('not found')) {
        const { error: deleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', profile.id)

        if (deleteError) {
          console.error(`✗ Ошибка удаления профиля ${profile.full_name}:`, deleteError.message)
        } else {
          console.log(`✓ Удалён профиль: ${profile.full_name}`)
        }
      } else {
        console.error(`✗ Ошибка удаления ${profile.full_name}:`, error.message)
      }
    } else {
      console.log(`✓ Удалён: ${profile.full_name}`)
    }
  }

  console.log('\n✅ Готово!')
}

deleteTestUsers().catch(console.error)
