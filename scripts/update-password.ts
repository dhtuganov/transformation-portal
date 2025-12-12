import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function updatePassword() {
  const email = 'zarina@creata.team'
  const newPassword = '123456'

  console.log(`Обновляю пароль для ${email}...\n`)

  // Находим пользователя
  const { data: users } = await supabase.auth.admin.listUsers()
  const user = users?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

  if (!user) {
    console.error('✗ Пользователь не найден')
    return
  }

  // Обновляем пароль
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword
  })

  if (error) {
    console.error('✗ Ошибка обновления пароля:', error.message)
  } else {
    console.log(`✓ Пароль обновлён для ${email}`)
  }
}

updatePassword().catch(console.error)
