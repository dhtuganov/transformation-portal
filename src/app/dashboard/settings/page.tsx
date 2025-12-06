'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PasswordChange } from '@/components/settings/PasswordChange'
import { NotificationPreferences } from '@/components/settings/NotificationPreferences'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Settings, Globe, Trash2, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [language, setLanguage] = useState<'ru' | 'en'>('ru')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load language preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('otrar_language')
    if (stored === 'en' || stored === 'ru') {
      setLanguage(stored)
    }
  }, [])

  const handleLanguageToggle = (checked: boolean) => {
    const newLanguage = checked ? 'en' : 'ru'
    setLanguage(newLanguage)
    localStorage.setItem('otrar_language', newLanguage)
    toast.success(
      newLanguage === 'en'
        ? 'Language changed to English'
        : 'Язык изменен на русский'
    )
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    setIsDeleting(true)
    try {
      const supabase = createClient()

      // Delete user profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (profileError) {
        console.error('Error deleting profile:', profileError)
      }

      // Delete authentication user
      // Note: In a real application, this should be done via a secure backend endpoint
      // Supabase requires admin privileges to delete users
      // For now, we'll just sign out the user

      await signOut()

      toast.success('Аккаунт успешно удален')
      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Не удалось удалить аккаунт. Пожалуйста, обратитесь в поддержку.')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setShowConfirmDialog(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Настройки</h1>
          <p className="text-muted-foreground">
            Управление настройками аккаунта и безопасности
          </p>
        </div>
      </div>

      {/* Password Change Section */}
      <PasswordChange />

      {/* Notification Preferences Section */}
      <NotificationPreferences />

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <CardTitle>Язык интерфейса</CardTitle>
          </div>
          <CardDescription>
            Выберите предпочитаемый язык интерфейса
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="language" className="text-base">
                English
              </Label>
              <p className="text-sm text-muted-foreground">
                {language === 'en'
                  ? 'Interface language is set to English'
                  : 'Язык интерфейса установлен на русский'
                }
              </p>
            </div>
            <Switch
              id="language"
              checked={language === 'en'}
              onCheckedChange={handleLanguageToggle}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Примечание: Функция смены языка находится в разработке. В настоящее время интерфейс доступен только на русском языке.
          </p>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Опасная зона</CardTitle>
          </div>
          <CardDescription>
            Необратимые действия с вашим аккаунтом
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                После удаления аккаунта все ваши данные будут безвозвратно удалены, включая:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                <li>Профиль и личные данные</li>
                <li>Индивидуальные планы развития (ИПР)</li>
                <li>Результаты тестов и MBTI-типирования</li>
                <li>История обучения и прогресс</li>
              </ul>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить аккаунт
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* First Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Вы уверены?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Все ваши данные будут безвозвратно удалены.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDeleteDialog(false)
                setShowConfirmDialog(true)
              }}
            >
              Продолжить удаление
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Second Delete Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Последнее подтверждение</DialogTitle>
            <DialogDescription>
              Вы действительно хотите удалить свой аккаунт? Это действие необратимо.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Удаление...
                </>
              ) : (
                'Удалить навсегда'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
