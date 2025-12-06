'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bell } from 'lucide-react'

interface NotificationSettings {
  emailPlanApprovals: boolean
  emailLearningReminders: boolean
  emailQuizResults: boolean
}

const DEFAULT_SETTINGS: NotificationSettings = {
  emailPlanApprovals: true,
  emailLearningReminders: true,
  emailQuizResults: true,
}

const STORAGE_KEY = 'otrar_notification_preferences'

export function NotificationPreferences() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setSettings(parsed)
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = (newSettings: NotificationSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
      setSettings(newSettings)
      toast.success('Настройки уведомлений сохранены')
    } catch (error) {
      console.error('Error saving notification preferences:', error)
      toast.error('Не удалось сохранить настройки')
    }
  }

  const handleToggle = (key: keyof NotificationSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    }
    saveSettings(newSettings)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Уведомления</CardTitle>
          </div>
          <CardDescription>
            Управление настройками уведомлений
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-muted rounded" />
            <div className="h-6 bg-muted rounded" />
            <div className="h-6 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <CardTitle>Уведомления</CardTitle>
        </div>
        <CardDescription>
          Управление настройками уведомлений по электронной почте
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Plan Approvals */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="emailPlanApprovals" className="text-base">
                Утверждение планов
              </Label>
              <p className="text-sm text-muted-foreground">
                Получать уведомления об утверждении или отклонении ИПР
              </p>
            </div>
            <Switch
              id="emailPlanApprovals"
              checked={settings.emailPlanApprovals}
              onCheckedChange={() => handleToggle('emailPlanApprovals')}
            />
          </div>

          {/* Learning Reminders */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="emailLearningReminders" className="text-base">
                Напоминания об обучении
              </Label>
              <p className="text-sm text-muted-foreground">
                Получать напоминания о незавершенных учебных материалах
              </p>
            </div>
            <Switch
              id="emailLearningReminders"
              checked={settings.emailLearningReminders}
              onCheckedChange={() => handleToggle('emailLearningReminders')}
            />
          </div>

          {/* Quiz Results */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="emailQuizResults" className="text-base">
                Результаты тестов
              </Label>
              <p className="text-sm text-muted-foreground">
                Получать уведомления о завершении и результатах тестов
              </p>
            </div>
            <Switch
              id="emailQuizResults"
              checked={settings.emailQuizResults}
              onCheckedChange={() => handleToggle('emailQuizResults')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
