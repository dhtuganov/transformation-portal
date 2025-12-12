import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Сотрудники Otrar Travel
const employees = [
  {
    full_name: 'Досмухамбетова Алия Темеркановна',
    job_title: 'Акционер',
    mbti_type: 'ISFP',
    email: 'aliya.dosmukhambetova@otrar.kz',
    role: 'executive'
  },
  {
    full_name: 'Сарсенбаева Альбина Абдуллаевна',
    job_title: 'И.о. управляющего директора',
    mbti_type: 'ISTJ',
    email: 'albina.sarsenbayeva@otrar.kz',
    role: 'executive'
  },
  {
    full_name: 'Бостанжиев Дмитрий Константинович',
    job_title: 'Заместитель управляющего директора',
    mbti_type: 'ISTP',
    email: 'dmitriy.bostanzhiyev@otrar.kz',
    role: 'manager'
  },
  {
    full_name: 'Ауелбаева Гульмира Сексембаевна',
    job_title: 'Главный бухгалтер',
    mbti_type: 'ESFJ',
    email: 'gulmira.auyelbayeva@otrar.kz',
    role: 'manager'
  },
  {
    full_name: 'Атыгаева Марал Адилбековна',
    job_title: 'Координатор по контролю и обеспечению качества',
    mbti_type: 'ISFP',
    email: 'maral.atygayeva@otrar.kz',
    role: 'employee'
  },
  {
    full_name: 'Звездина Татьяна Валентиновна',
    job_title: 'Директор филиала в г.Астана',
    mbti_type: 'ISFP',
    email: 'tatyana.zvezdina@otrar.kz',
    role: 'manager',
    branch: 'Астана'
  },
  {
    full_name: 'Кораблева Екатерина Владимировна',
    job_title: 'Директор филиала в г.Атырау и Западно-Казахстанского региона',
    mbti_type: 'ISTP',
    email: 'yekaterina.korableva@otrar.kz',
    role: 'manager',
    branch: 'Атырау'
  },
  {
    full_name: 'Абдирова Айман Жолауовна',
    job_title: 'Супервайзер отдела туризма',
    mbti_type: 'ESFP',
    email: 'aiman.abdirova@otrar.kz',
    role: 'manager'
  },
  {
    full_name: 'Джулаева Асель Еркасымовна',
    job_title: 'Супервайзер',
    mbti_type: 'ISFP',
    email: 'assel.julayeva@otrar.kz',
    role: 'manager'
  },
  {
    full_name: 'Умарходжиева Наиля Рауфовна',
    job_title: 'Супервайзер',
    mbti_type: 'ESTJ',
    email: 'nailya.umarkhojiyeva@otrar.kz',
    role: 'manager'
  },
  {
    full_name: 'Жумаканов Айдын Толкунович',
    job_title: 'Старший агент',
    mbti_type: 'ISFP',
    email: 'aidyn.zhumakanov@otrar.kz',
    role: 'employee'
  },
  {
    full_name: 'Белых Антонина Борисовна',
    job_title: 'Координатор по авиакомпаниям',
    mbti_type: 'ISTJ',
    email: 'antonina.belykh@otrar.kz',
    role: 'employee'
  },
  {
    full_name: 'Букарев Валерий Олегович',
    job_title: 'Менеджер-программист',
    mbti_type: 'ISFP',
    email: 'valeriy.bukarev@otrar.kz',
    role: 'employee'
  }
]

async function seedEmployees() {
  console.log('Создаю auth пользователей и профили для сотрудников Otrar Travel...\n')

  for (const emp of employees) {
    // Проверяем, существует ли уже пользователь с таким email
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === emp.email.toLowerCase())

    if (existingUser) {
      // Обновляем существующий профиль
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: emp.full_name,
          job_title: emp.job_title,
          mbti_type: emp.mbti_type,
          role: emp.role,
          branch: (emp as any).branch || null,
          department: 'Otrar Travel'
        })
        .eq('id', existingUser.id)

      if (error) {
        console.error(`✗ Ошибка обновления ${emp.full_name}:`, error.message)
      } else {
        console.log(`↻ Обновлён: ${emp.full_name} (${emp.mbti_type})`)
      }
    } else {
      // Создаём нового auth пользователя (это автоматически создаст профиль через триггер)
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: emp.email,
        password: 'OtrarTravel2024!', // Временный пароль, нужно будет сбросить
        email_confirm: true,
        user_metadata: {
          full_name: emp.full_name
        }
      })

      if (createError) {
        console.error(`✗ Ошибка создания auth для ${emp.full_name}:`, createError.message)
        continue
      }

      // Обновляем профиль с дополнительными данными
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: emp.full_name,
          job_title: emp.job_title,
          mbti_type: emp.mbti_type,
          role: emp.role,
          branch: (emp as any).branch || null,
          department: 'Otrar Travel'
        })
        .eq('id', newUser.user.id)

      if (updateError) {
        console.error(`✗ Ошибка обновления профиля ${emp.full_name}:`, updateError.message)
      } else {
        console.log(`✓ Создан: ${emp.full_name} (${emp.mbti_type}) - ${emp.job_title}`)
      }
    }
  }

  console.log('\n✅ Готово!')

  // Показываем итоговый список
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('full_name, job_title, mbti_type, email, role')
    .order('full_name')

  console.log('\n📋 Текущий список сотрудников:\n')
  allProfiles?.forEach((p, i) => {
    console.log(`${i + 1}. ${p.full_name}`)
    console.log(`   ${p.job_title || 'Должность не указана'} | ${p.mbti_type || 'Тип не определён'} | ${p.role}`)
    console.log(`   ${p.email}\n`)
  })
}

seedEmployees().catch(console.error)
