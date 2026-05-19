'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export type UserRole = 'home_admin' | 'staff' | 'super_admin'

export type UserProfile = {
  id: string
  orgId: string
  role: UserRole
  fullName: string
  email: string
}

/**
 * Returns the currently logged-in user's profile from public.users.
 * Subscribes to auth state changes so it updates on login/logout.
 */
export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setUser(null)
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('org_id, role, full_name, email')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        setUser({
          id: authUser.id,
          orgId: profile.org_id,
          role: profile.role as UserRole,
          fullName: profile.full_name,
          email: profile.email,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
