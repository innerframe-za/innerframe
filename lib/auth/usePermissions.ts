// Per-pillar staff permissions are not yet in the backend.
// All authenticated users receive full access until the feature is re-implemented.

export type PillarSlug =
  | 'admin'
  | 'finance'
  | 'kitchen'
  | 'medical'
  | 'board_governance'
  | 'hr'

export interface PillarPermission {
  canView: boolean
  canEdit: boolean
}

const FULL_ACCESS: Record<PillarSlug, PillarPermission> = {
  admin:            { canView: true, canEdit: true },
  finance:          { canView: true, canEdit: true },
  kitchen:          { canView: true, canEdit: true },
  medical:          { canView: true, canEdit: true },
  board_governance: { canView: true, canEdit: true },
  hr:               { canView: true, canEdit: true },
}

export function usePermissions() {
  return { permissions: FULL_ACCESS, loading: false }
}
