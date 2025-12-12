import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function addAdmin() {
  const admin = {
    full_name: 'Зарина Сатубалдина',
    job_title: 'Трансформационный консультант',
    email: 'zarina@creata.team',
    role: 'admin'
  }

  console.log(`Создаю админа: ${admin.full_name}...\n`)

  // Проверяем существующего пользователя
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === admin.email.toLowerCase())

  if (existingUser) {
    // Обновляем профиль
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: admin.full_name,
        job_title: admin.job_title,
        role: admin.role,
        department: 'Creata'
      })
      .eq('id', existingUser.id)

    if (error) {
      console.error(`✗ Ошибка обновления:`, error.message)
    } else {
      console.log(`↻ Обновлён: ${admin.full_name} (admin)`)
    }
  } else {
    // Создаём нового auth пользователя
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: admin.email,
      password: 'CreataAdmin2024!',
      email_confirm: true,
      user_metadata: {
        full_name: admin.full_name
      }
    })

    if (createError) {
      console.error(`✗ Ошибка создания auth:`, createError.message)
      return
    }

    // Обновляем профиль
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: admin.full_name,
        job_title: admin.job_title,
        role: admin.role,
        department: 'Creata'
      })
      .eq('id', newUser.user.id)

    if (updateError) {
      console.error(`✗ Ошибка обновления профиля:`, updateError.message)
    } else {
      console.log(`✓ Создан: ${admin.full_name} (admin) - ${admin.job_title}`)
    }
  }

  console.log('\n✅ Готово!')
}

addAdmin().catch(console.error)
