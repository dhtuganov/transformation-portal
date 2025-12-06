'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, User, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { UserRole } from '@/types/database'

type Profile = {
  id: string
  email: string
  full_name: string | null
  role: string
  department: string | null
  branch: string | null
  mbti_type: string | null
  mbti_verified: boolean
  created_at: string
}

type Props = {
  users: Profile[]
}

const ROLE_LABELS: Record<UserRole, string> = {
  employee: 'Сотрудник',
  manager: 'Менеджер',
  executive: 'Руководитель',
  admin: 'Администратор',
}

const ROLE_COLORS: Record<UserRole, string> = {
  employee: 'bg-gray-100 text-gray-800',
  manager: 'bg-blue-100 text-blue-800',
  executive: 'bg-purple-100 text-purple-800',
  admin: 'bg-red-100 text-red-800',
}

export function UserTable({ users }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [updatingRoles, setUpdatingRoles] = useState<Set<string>>(new Set())

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingRoles(prev => new Set(prev).add(userId))

    try {
      const response = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      toast.success('Роль пользователя обновлена')
      // Reload page to reflect changes
      window.location.reload()
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Ошибка при обновлении роли')
    } finally {
      setUpdatingRoles(prev => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени или email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Фильтр по роли" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все роли</SelectItem>
            <SelectItem value="employee">Сотрудник</SelectItem>
            <SelectItem value="manager">Менеджер</SelectItem>
            <SelectItem value="executive">Руководитель</SelectItem>
            <SelectItem value="admin">Администратор</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Найдено пользователей: {filteredUsers.length}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">Пользователь</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Роль</th>
                <th className="text-left px-4 py-3 text-sm font-medium">MBTI</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Отдел</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Дата регистрации</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {user.full_name || 'Не указано'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                      disabled={updatingRoles.has(user.id)}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">
                          <Badge className={ROLE_COLORS.employee}>
                            {ROLE_LABELS.employee}
                          </Badge>
                        </SelectItem>
                        <SelectItem value="manager">
                          <Badge className={ROLE_COLORS.manager}>
                            {ROLE_LABELS.manager}
                          </Badge>
                        </SelectItem>
                        <SelectItem value="executive">
                          <Badge className={ROLE_COLORS.executive}>
                            {ROLE_LABELS.executive}
                          </Badge>
                        </SelectItem>
                        <SelectItem value="admin">
                          <Badge className={ROLE_COLORS.admin}>
                            {ROLE_LABELS.admin}
                          </Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    {user.mbti_type ? (
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-medium">{user.mbti_type}</span>
                        {user.mbti_verified ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {user.department || user.branch || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link href={`/admin/users/${user.id}`}>
                        Просмотр
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Пользователи не найдены
        </div>
      )}
    </div>
  )
}
