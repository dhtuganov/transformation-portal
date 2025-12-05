'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings } from 'lucide-react'
import { toast } from 'sonner'

export function Navbar() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error('Ошибка выхода')
    } else {
      toast.success('Вы вышли из системы')
      router.push('/login')
      router.refresh()
    }
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.[0].toUpperCase() || 'U'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Otrar</span>
            <span className="text-sm text-muted-foreground">Transformation</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Главная
            </Link>
            <Link
              href="/dashboard/learning"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Обучение
            </Link>
            <Link
              href="/dashboard/profile"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Профиль
            </Link>
            {profile?.role && ['manager', 'executive', 'admin'].includes(profile.role) && (
              <Link
                href="/dashboard/team"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Команда
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.full_name || 'Пользователь'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Профиль</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Настройки</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Выйти</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
