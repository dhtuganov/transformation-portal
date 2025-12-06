import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This endpoint is for development seed only
// Uses service role to bypass RLS
export async function POST(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== 'Bearer seed-secret-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // We need service_role key for bypassing RLS
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return NextResponse.json({
      error: 'SUPABASE_SERVICE_ROLE_KEY not set. Add it to .env.local'
    }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )

  const demoEmployees = [
    // Руководство
    { email: 'leia.organa@otrar.kz', full_name: 'Лея Органа', role: 'executive', department: 'Руководство', job_title: 'Исполнительный директор', mbti_type: 'ENTJ', mbti_verified: true },

    // Менеджеры
    { email: 'luke.skywalker@otrar.kz', full_name: 'Люк Скайуокер', role: 'manager', department: 'Корпоративные продажи', job_title: 'Руководитель отдела продаж', mbti_type: 'ENFJ', mbti_verified: true },
    { email: 'obiwan.kenobi@otrar.kz', full_name: 'Оби-Ван Кеноби', role: 'manager', department: 'HR', job_title: 'HR-директор', mbti_type: 'INFJ', mbti_verified: true },
    { email: 'mace.windu@otrar.kz', full_name: 'Мейс Винду', role: 'manager', department: 'Операции', job_title: 'Руководитель операций', mbti_type: 'ISTJ', mbti_verified: true },

    // MICE отдел
    { email: 'han.solo@otrar.kz', full_name: 'Хан Соло', role: 'employee', department: 'MICE', job_title: 'Менеджер по MICE', mbti_type: 'ESTP', mbti_verified: true },
    { email: 'rey.skywalker@otrar.kz', full_name: 'Рей Скайуокер', role: 'employee', department: 'MICE', job_title: 'Координатор мероприятий', mbti_type: 'INFP', mbti_verified: true },

    // Корпоративные продажи
    { email: 'ahsoka.tano@otrar.kz', full_name: 'Асока Тано', role: 'employee', department: 'Корпоративные продажи', job_title: 'Менеджер по продажам', mbti_type: 'ESFP', mbti_verified: true },
    { email: 'poe.dameron@otrar.kz', full_name: 'По Дэмерон', role: 'employee', department: 'Корпоративные продажи', job_title: 'Аккаунт-менеджер', mbti_type: 'ENTP', mbti_verified: true },

    // Маркетинг
    { email: 'padme.amidala@otrar.kz', full_name: 'Падме Амидала', role: 'employee', department: 'Маркетинг', job_title: 'Маркетолог', mbti_type: 'ENFP', mbti_verified: true },
    { email: 'finn@otrar.kz', full_name: 'Финн', role: 'employee', department: 'Маркетинг', job_title: 'SMM-менеджер', mbti_type: 'ESFJ', mbti_verified: true },

    // IT отдел
    { email: 'anakin.skywalker@otrar.kz', full_name: 'Анакин Скайуокер', role: 'employee', department: 'IT', job_title: 'Системный администратор', mbti_type: 'ISTP', mbti_verified: true },
    { email: 'kylo.ren@otrar.kz', full_name: 'Кайло Рен', role: 'employee', department: 'IT', job_title: 'Разработчик', mbti_type: 'INTJ', mbti_verified: true },

    // Операции
    { email: 'chewbacca@otrar.kz', full_name: 'Чубакка', role: 'employee', department: 'Операции', job_title: 'Логист', mbti_type: 'ISFP', mbti_verified: true },
    { email: 'din.djarin@otrar.kz', full_name: 'Дин Джарин', role: 'employee', department: 'Операции', job_title: 'Менеджер по визовой поддержке', mbti_type: 'ISFJ', mbti_verified: true },

    // Финансы
    { email: 'yoda@otrar.kz', full_name: 'Йода', role: 'employee', department: 'Финансы', job_title: 'Финансовый аналитик', mbti_type: 'INTP', mbti_verified: true },
  ]

  try {
    const results = []

    for (const employee of demoEmployees) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(employee, { onConflict: 'email' })
        .select()

      if (error) {
        results.push({ email: employee.email, status: 'error', message: error.message })
      } else {
        results.push({ email: employee.email, status: 'success', data })
      }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length

    return NextResponse.json({
      message: `Inserted ${successCount} employees, ${errorCount} errors`,
      results
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to seed data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
