import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type UserRole = 'home_admin' | 'staff'

export type UserProfile = {
  id: string
  orgId: string
  role: UserRole
  fullName: string
  email: string
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (!authUser) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('users')
        .select('org_id, role, full_name, email')
        .eq('id', authUser.id)
        .single()

      if (data) {
        setUser({
          id: authUser.id,
          orgId: data.org_id,
          role: data.role as UserRole,
          fullName: data.full_name,
          email: data.email,
        })
      }
      setLoading(false)
    })
  }, [])

  return { user, loading }
}
