import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useUser, UserRole } from '@/lib/auth/useUser'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: ReactNode
  /** Where to redirect if the role check fails. Defaults to /dashboard. */
  fallback?: string
}

/**
 * Renders children only if the logged-in user has one of the allowed roles.
 * Shows a spinner while the user profile is loading; redirects otherwise.
 */
export function RoleGuard({ allowedRoles, children, fallback = '/dashboard' }: RoleGuardProps) {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0E8' }}>
        <span className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(30,58,47,0.2)', borderTopColor: '#1E3A2F' }} />
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}
