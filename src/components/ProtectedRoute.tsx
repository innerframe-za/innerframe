import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth/AuthContext'
import { Navbar } from '@/components/portal/Navbar'
import { PortalFooter } from '@/components/portal/PortalFooter'

/**
 * Wraps all portal routes. Checks JWT auth state — redirects to /login
 * if unauthenticated. Super admins are bounced to /superadmin if they
 * try to access facility portal routes.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3" style={{ backgroundColor: '#F5F0E8' }}>
        <span
          className="w-7 h-7 rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(30,58,47,0.15)', borderTopColor: '#1E3A2F' }}
        />
        <p
          className="text-xs"
          style={{ color: 'rgba(30,58,47,0.4)', letterSpacing: '0.1em', fontFamily: "'Outfit', system-ui" }}
        >
          LOADING
        </p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Super admins belong in /superadmin — block access to facility portal routes
  if (user.role === 'super_admin' && !location.pathname.startsWith('/superadmin')) {
    return <Navigate to="/superadmin" replace />
  }

  return (
    <div className="min-h-dvh">
      <Navbar />
      <main className="pt-[64px] min-h-dvh flex flex-col" style={{ backgroundColor: '#F5F0E8' }}>
        <div className="flex-1">
          <div className="max-w-screen-xl mx-auto px-6 py-8">
            <Outlet />
          </div>
        </div>
        <PortalFooter />
      </main>
    </div>
  )
}
