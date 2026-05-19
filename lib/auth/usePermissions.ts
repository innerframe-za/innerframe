import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/auth/useUser'

export type PillarSlug = 'admin' | 'finance' | 'kitchen' | 'medical' | 'board_governance'

export interface PillarPermission {
  canView: boolean
  canEdit: boolean
}

// All pillars default to full access (used for home_admin and super_admin)
const FULL_ACCESS: Record<PillarSlug, PillarPermission> = {
  admin: { canView: true, canEdit: true },
  finance: { canView: true, canEdit: true },
  kitchen: { canView: true, canEdit: true },
  medical: { canView: true, canEdit: true },
  board_governance: { canView: true, canEdit: true },
}

/**
 * Returns per-pillar view/edit permissions for the current user.
 * - super_admin and home_admin always get full access.
 * - staff get permissions from the staff_permissions table; missing rows default to full access.
 */
export function usePermissions() {
  const { user, loading: userLoading } = useUser()
  const [permissions, setPermissions] = useState<Record<PillarSlug, PillarPermission>>(FULL_ACCESS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userLoading) return

    // Non-staff roles get unrestricted access — no DB query needed
    if (!user || user.role !== 'staff') {
      setPermissions(FULL_ACCESS)
      setLoading(false)
      return
    }

    let supabase: ReturnType<typeof createClient>
    try {
      supabase = createClient()
    } catch {
      setPermissions(FULL_ACCESS)
      setLoading(false)
      return
    }

    supabase
      .from('staff_permissions')
      .select('pillar_slug, can_view, can_edit')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (!data || data.length === 0) {
          setPermissions(FULL_ACCESS)
        } else {
          // Start from full access and apply any explicit restrictions
          const result = { ...FULL_ACCESS }
          for (const row of data) {
            const slug = row.pillar_slug as PillarSlug
            result[slug] = { canView: row.can_view, canEdit: row.can_edit }
          }
          setPermissions(result)
        }
        setLoading(false)
        return undefined
      }, () => {
        setPermissions(FULL_ACCESS)
        setLoading(false)
      })
  }, [user, userLoading])

  return { permissions, loading }
}
