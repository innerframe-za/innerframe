// Re-export types so existing imports continue to work without changes.
export type { UserRole, UserProfile } from '@/lib/auth/AuthContext'

import { useAuth } from '@/lib/auth/AuthContext'

export function useUser() {
  const { user, loading } = useAuth()
  return { user, loading }
}
