'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Building2,
  UserPlus,
  RefreshCw,
  Map,
  BarChart3,
  ChevronLeft
} from 'lucide-react'

const strategyNav = [
  { href: '/dashboard/strategy', label: 'Обзор', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/strategy/team-profile', label: 'Команда', icon: Users },
  { href: '/dashboard/strategy/organizational', label: 'Структура', icon: Building2 },
  { href: '/dashboard/strategy/hiring', label: 'Найм', icon: UserPlus },
  { href: '/dashboard/strategy/change-management', label: 'Изменения', icon: RefreshCw },
  { href: '/dashboard/strategy/roadmap', label: 'Roadmap', icon: Map },
  { href: '/dashboard/strategy/kpi', label: 'KPI', icon: BarChart3 },
]

export default function StrategyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const redirected = useRef(false)

  useEffect(() => {
    if (!loading && !redirected.current) {
      if (!profile?.role || !['executive', 'admin'].includes(profile.role)) {
        redirected.current = true
        router.push('/dashboard')
      } else {
        setAuthorized(true)
      }
    }
  }, [profile, loading, router])

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  if (loading || !authorized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/dashboard" className="hover:text-foreground">
            <ChevronLeft className="h-4 w-4 inline" />
            Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Стратегия трансформации</h1>
        <p className="text-muted-foreground mt-1">
          Внутренний раздел для руководства Otrar Travel
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-1 overflow-x-auto pb-px">
          {strategyNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                isActive(item.href, item.exact)
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Content */}
      {children}
    </div>
  )
}
