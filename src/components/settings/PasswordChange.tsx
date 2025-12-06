'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
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
import { Loader2, Lock } from 'lucide-react'

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Введите текущий пароль'),
  newPassword: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
  confirmPassword: z.string().min(1, 'Подтвердите новый пароль'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})

type PasswordChangeValues = z.infer<typeof passwordChangeSchema>

export function PasswordChange() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: PasswordChangeValues) => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      // Verify current password by attempting to sign in
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        throw new Error('Пользователь не найден')
      }

      // Attempt to sign in with current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      })

      if (signInError) {
        throw new Error('Неверный текущий пароль')
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (updateError) {
        throw updateError
      }

      toast.success('Пароль успешно изменен')
      form.reset()
    } catch (error) {
      console.error('Error changing password:', error)
      const errorMessage = error instanceof Error ? error.message : 'Не удалось изменить пароль'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          <CardTitle>Изменить пароль</CardTitle>
        </div>
        <CardDescription>
          Обновите ваш пароль для обеспечения безопасности аккаунта
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Current Password */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Текущий пароль</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Введите текущий пароль"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Новый пароль</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Введите новый пароль"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Минимум 8 символов
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Подтвердите новый пароль</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Повторите новый пароль"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  'Изменить пароль'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
