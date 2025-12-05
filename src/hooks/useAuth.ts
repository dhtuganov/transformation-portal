'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

// DEMO MODE flag - set to false when connecting real Supabase
const DEMO_MODE = true

// Mock data for demo
const MOCK_USER = {
  id: 'demo-user-1',
  email: 'demo@otrar.kz',
  app_metadata: {},
  user_metadata: { full_name: 'Айгуль Сериккызы' },
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
} as User

const MOCK_PROFILE: Profile = {
  id: 'demo-user-1',
  email: 'demo@otrar.kz',
  full_name: 'Айгуль Сериккызы',
  role: 'manager',
  mbti_type: 'ENFP',
  mbti_verified: true,
  department: 'Продажи',
  branch: 'Алматы',
  job_title: 'Менеджер по продажам',
  avatar_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(DEMO_MODE ? MOCK_USER : null)
  const [profile, setProfile] = useState<Profile | null>(DEMO_MODE ? MOCK_PROFILE : null)
  const [loading, setLoading] = useState(!DEMO_MODE)

  const supabase = DEMO_MODE ? null : createClient()

  const fetchProfile = useCallback(async (userId: string) => {
    if (DEMO_MODE || !supabase) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(data)
    }
  }, [supabase])

  useEffect(() => {
    if (DEMO_MODE) return

    if (!supabase) return

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        await fetchProfile(user.id)
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const signIn = async (email: string, password: string) => {
    if (DEMO_MODE || !supabase) {
      return { data: { user: MOCK_USER, session: null }, error: null }
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (DEMO_MODE || !supabase) {
      return { data: { user: MOCK_USER, session: null }, error: null }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    if (DEMO_MODE || !supabase) {
      return { data: { url: '/dashboard', provider: 'google' as const }, error: null }
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    if (DEMO_MODE || !supabase) {
      return { error: null }
    }
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setProfile(null)
    }
    return { error }
  }

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }
}
