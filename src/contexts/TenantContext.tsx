'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tenant, TenantFeatures, TenantContext as TenantContextType } from '@/types/tenant'
import { TENANTS, DEFAULT_TENANT_ID } from '@/types/tenant'

// ===========================================
// CONTEXT
// ===========================================

const TenantContext = createContext<TenantContextType | null>(null)

// ===========================================
// PROVIDER
// ===========================================

interface TenantProviderProps {
  children: ReactNode
  tenantSlug?: string
}

export function TenantProvider({ children, tenantSlug }: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [locale, setLocale] = useState<'ru' | 'en'>('ru')

  useEffect(() => {
    async function loadTenant() {
      const supabase = createClient()

      try {
        // If no slug provided, try to get from user's profile
        if (!tenantSlug) {
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            // Note: tenant_id column added via migration, using type assertion
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()

            const profileData = profile as Record<string, unknown> | null
            if (profileData?.tenant_id) {
              // Note: tenants table added via migration
              const { data: tenantData } = await (supabase as unknown as { from: (t: string) => { select: (s: string) => { eq: (k: string, v: string) => { single: () => Promise<{ data: Record<string, unknown> | null }> } } } })
                .from('tenants')
                .select('*')
                .eq('id', profileData.tenant_id as string)
                .single()

              if (tenantData) {
                setTenant(transformTenant(tenantData))
                const config = tenantData.config as Record<string, unknown> | null
                setLocale((config?.defaultLocale as 'ru' | 'en') || 'ru')
                setIsLoading(false)
                return
              }
            }
          }
        } else {
          // Load by slug
          const { data: tenantData } = await (supabase as unknown as { from: (t: string) => { select: (s: string) => { eq: (k: string, v: unknown) => { eq: (k: string, v: unknown) => { single: () => Promise<{ data: Record<string, unknown> | null }> } } } } })
            .from('tenants')
            .select('*')
            .eq('slug', tenantSlug)
            .eq('is_active', true)
            .single()

          if (tenantData) {
            setTenant(transformTenant(tenantData))
            const config = tenantData.config as Record<string, unknown> | null
            setLocale((config?.defaultLocale as 'ru' | 'en') || 'ru')
            setIsLoading(false)
            return
          }
        }

        // Fallback to default tenant (Otrar)
        const { data: defaultTenant } = await (supabase as unknown as { from: (t: string) => { select: (s: string) => { eq: (k: string, v: string) => { single: () => Promise<{ data: Record<string, unknown> | null }> } } } })
          .from('tenants')
          .select('*')
          .eq('id', DEFAULT_TENANT_ID)
          .single()

        if (defaultTenant) {
          setTenant(transformTenant(defaultTenant))
          const config = defaultTenant.config as Record<string, unknown> | null
          setLocale((config?.defaultLocale as 'ru' | 'en') || 'ru')
        }
      } catch (error) {
        console.error('Error loading tenant:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTenant()
  }, [tenantSlug])

  const contextValue: TenantContextType = {
    tenant: tenant!,
    features: tenant?.features || getDefaultFeatures(),
    locale,
    isLoading,
  }

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  )
}

// ===========================================
// HOOKS
// ===========================================

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

export function useFeature(feature: keyof TenantFeatures): boolean {
  const { features, isLoading } = useTenant()
  if (isLoading) return false
  return features[feature] ?? false
}

export function useFeatures(): TenantFeatures {
  const { features } = useTenant()
  return features
}

export function useLocale(): 'ru' | 'en' {
  const { locale } = useTenant()
  return locale
}

// ===========================================
// HELPERS
// ===========================================

function transformTenant(data: Record<string, unknown>): Tenant {
  return {
    id: data.id as string,
    slug: data.slug as string,
    name: data.name as string,
    branding: data.branding as Tenant['branding'],
    features: data.features as TenantFeatures,
    config: data.config as Tenant['config'],
    plan: data.plan as Tenant['plan'],
    isActive: data.is_active as boolean,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

function getDefaultFeatures(): TenantFeatures {
  return {
    adaptive_testing: false,
    shadow_work: false,
    type_simulator: false,
    relationship_navigator: false,
    career_compass: false,
    team_builder: false,
    ai_insights: false,
    gamification: false,
    stress_radar: false,
  }
}

// ===========================================
// FEATURE GATE COMPONENT
// ===========================================

interface FeatureGateProps {
  feature: keyof TenantFeatures
  children: ReactNode
  fallback?: ReactNode
}

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const isEnabled = useFeature(feature)

  if (!isEnabled) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// ===========================================
// MULTI-FEATURE GATE
// ===========================================

interface MultiFeaturesGateProps {
  features: (keyof TenantFeatures)[]
  requireAll?: boolean  // true = AND, false = OR
  children: ReactNode
  fallback?: ReactNode
}

export function MultiFeaturesGate({
  features,
  requireAll = true,
  children,
  fallback = null,
}: MultiFeaturesGateProps) {
  const tenantFeatures = useFeatures()

  const isEnabled = requireAll
    ? features.every(f => tenantFeatures[f])
    : features.some(f => tenantFeatures[f])

  if (!isEnabled) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
