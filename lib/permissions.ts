// Browser-side permission helper for the multi-tenant facility_memberships system.
// Adapted from the Next.js server-component spec: uses the browser Supabase client
// and exposes both a plain async function and a React hook.

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export type PermissionLevel = 'none' | 'view' | 'own' | 'full'

export type AppModule =
  | 'admin'
  | 'staff'
  | 'hr'
  | 'board_governance'
  | 'residence'
  | 'finance'
  | 'kitchen'
  | 'medical'

export interface MembershipPermissions {
  perm_admin:     PermissionLevel
  perm_staff:     PermissionLevel
  perm_hr:        PermissionLevel
  perm_board:     PermissionLevel
  perm_residence: PermissionLevel
  perm_finance:   PermissionLevel
  perm_kitchen:   PermissionLevel
  perm_medical:   PermissionLevel
  role:           string
  status:         string
}

const MODULE_COLUMN: Record<AppModule, keyof MembershipPermissions> = {
  admin:            'perm_admin',
  staff:            'perm_staff',
  hr:               'perm_hr',
  board_governance: 'perm_board',
  residence:        'perm_residence',
  finance:          'perm_finance',
  kitchen:          'perm_kitchen',
  medical:          'perm_medical',
}

// Returns the current user's permission level for a single module.
export async function getModulePermission(
  facilityId: string,
  module: AppModule,
  userId: string,
): Promise<PermissionLevel> {
  const supabase = createClient()
  const column = MODULE_COLUMN[module]

  const { data } = await supabase
    .from('facility_memberships')
    .select(column)
    .eq('facility_id', facilityId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  return ((data as Record<string, unknown>)?.[column] as PermissionLevel) ?? 'none'
}

// Returns all module permissions for the current user in one query.
export async function getAllModulePermissions(
  facilityId: string,
  userId: string,
): Promise<MembershipPermissions | null> {
  const supabase = createClient()

  const { data } = await supabase
    .from('facility_memberships')
    .select(
      'perm_admin, perm_staff, perm_hr, perm_board, perm_residence, perm_finance, perm_kitchen, perm_medical, role, status',
    )
    .eq('facility_id', facilityId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  return data as MembershipPermissions | null
}

// Server-action equivalent: update a staff member's module permissions.
// Verifies the caller holds perm_admin = 'full' before writing.
export async function updateStaffPermissions(
  facilityId: string,
  targetUserId: string,
  permissions: Record<AppModule, PermissionLevel>,
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const callerPerm = await getModulePermission(facilityId, 'admin', user.id)
  if (callerPerm !== 'full') throw new Error('Not authorised — admin permission required')

  const { error } = await supabase
    .from('facility_memberships')
    .update({
      perm_admin:     permissions.admin,
      perm_staff:     permissions.staff,
      perm_hr:        permissions.hr,
      perm_board:     permissions.board_governance,
      perm_residence: permissions.residence,
      perm_finance:   permissions.finance,
      perm_kitchen:   permissions.kitchen,
      perm_medical:   permissions.medical,
    })
    .eq('facility_id', facilityId)
    .eq('user_id', targetUserId)

  if (error) throw error
}

// React hook: returns all module permissions for the current user.
// Fetches once on mount; re-fetches when facilityId or userId changes.
export function useModulePermissions(facilityId: string | undefined, userId: string | undefined) {
  const [permissions, setPermissions] = useState<MembershipPermissions | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!facilityId || !userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    getAllModulePermissions(facilityId, userId)
      .then(data => { setPermissions(data); setLoading(false) })
      .catch(() => { setPermissions(null); setLoading(false) })
  }, [facilityId, userId])

  return { permissions, loading }
}
