'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AvatarUpload } from './AvatarUpload'
import { Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const profileFormSchema = z.object({
  full_name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(100, 'Имя слишком длинное'),
  job_title: z.string().min(2, 'Должность должна содержать минимум 2 символа').max(100, 'Название должности слишком длинное').optional().or(z.literal('')),
  department: z.string().min(2, 'Название департамента должно содержать минимум 2 символа').max(100, 'Название департамента слишком длинное').optional().or(z.literal('')),
  branch: z.string().min(2, 'Название филиала должно содержать минимум 2 символа').max(100, 'Название филиала слишком длинное').optional().or(z.literal('')),
  avatar_url: z.string().nullable().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  profile: Profile
  userId: string
}

export function ProfileForm({ profile, userId }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      job_title: profile.job_title || '',
      department: profile.department || '',
      branch: profile.branch || '',
      avatar_url: profile.avatar_url,
    },
  })

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      const updateData: Database['public']['Tables']['profiles']['Update'] = {
        full_name: data.full_name,
        job_title: data.job_title || null,
        department: data.department || null,
        branch: data.branch || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }



      const { error } = await (supabase
        .from('profiles') as ReturnType<typeof supabase.from>)
        .update(updateData)
        .eq('id', userId)

      if (error) {
        throw error
      }

      toast.success('Профиль успешно обновлен')
      router.push('/dashboard/profile')
      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Не удалось обновить профиль. Попробуйте еще раз.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (url: string | null) => {
    setAvatarUrl(url)
    form.setValue('avatar_url', url)
  }

  return (
    <div className="space-y-6">
      {/* MBTI Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>MBTI-тип</CardTitle>
          <CardDescription>
            {profile.mbti_type
              ? 'Ваш текущий MBTI-тип можно изменить только через тестирование'
              : 'Пройдите тест для определения вашего MBTI-типа'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile.mbti_type ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="text-lg px-4 py-2">
                  {profile.mbti_type}
                </Badge>
                {profile.mbti_verified && (
                  <Badge variant="secondary">Подтвержден</Badge>
                )}
              </div>
              <Button variant="outline" asChild>
                <Link href="/dashboard/quizzes">Пройти тест повторно</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  MBTI-тип не определен
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/quizzes">Пройти MBTI-тест</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Личная информация</CardTitle>
          <CardDescription>
            Обновите вашу персональную информацию
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Фото профиля</label>
                <AvatarUpload
                  userId={userId}
                  currentAvatarUrl={avatarUrl}
                  onAvatarChange={handleAvatarChange}
                  userFullName={profile.full_name || 'Пользователь'}
                />
              </div>

              {/* Full Name */}
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Полное имя</FormLabel>
                    <FormControl>
                      <Input placeholder="Иванов Иван Иванович" {...field} />
                    </FormControl>
                    <FormDescription>
                      Ваше полное имя как в документах
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Job Title */}
              <FormField
                control={form.control}
                name="job_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Должность</FormLabel>
                    <FormControl>
                      <Input placeholder="Менеджер по продажам" {...field} />
                    </FormControl>
                    <FormDescription>
                      Ваша текущая должность в компании
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department */}
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Департамент</FormLabel>
                    <FormControl>
                      <Input placeholder="Продажи" {...field} />
                    </FormControl>
                    <FormDescription>
                      Департамент, в котором вы работаете
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Branch */}
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Филиал</FormLabel>
                    <FormControl>
                      <Input placeholder="Алматы" {...field} />
                    </FormControl>
                    <FormDescription>
                      Филиал компании, в котором вы работаете
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/profile')}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    'Сохранить изменения'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
