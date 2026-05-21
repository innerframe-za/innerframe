import { useState, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/portal/Navbar'
import { PortalFooter } from '@/components/portal/PortalFooter'

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

/**
 * Wraps all portal routes. Checks Supabase session — redirects to /login
 * if unauthenticated. Super admins are bounced to /superadmin if they try
 * to access facility portal routes. Staff with force_password_change are
 * redirected to /change-password before accessing anything else.
 */
export function ProtectedRoute() {
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [forcePasswordChange, setForcePasswordChange] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const location = useLocation()

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>
    try {
      supabase = createClient()
    } catch {
      setAuthState('unauthenticated')
      return
    }

    async function loadSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setAuthState('unauthenticated')
          return
        }
        setForcePasswordChange(session.user.user_metadata?.force_password_change === true)
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setUserRole(profile?.role ?? null)
        setAuthState('authenticated')
      } catch {
        setAuthState('unauthenticated')
      }
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setForcePasswordChange(false)
        setUserRole(null)
        setAuthState('unauthenticated')
        return
      }
      setForcePasswordChange(session.user.user_metadata?.force_password_change === true)
      supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()
        .then(({ data: profile }) => {
          setUserRole(profile?.role ?? null)
          setAuthState('authenticated')
        }, () => {
          setAuthState('unauthenticated')
        })
    })

    return () => subscription.unsubscribe()
  }, [])

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0E8' }}>
        <span className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(30,58,47,0.2)', borderTopColor: '#1E3A2F' }} />
      </div>
    )
  }

  if (authState === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  // Staff must change password before accessing anything else
  if (forcePasswordChange && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  // /change-password renders without the Navbar shell
  if (location.pathname === '/change-password') {
    return <Outlet />
  }

  // Super admins belong in /superadmin — block access to facility portal routes
  if (userRole === 'super_admin' && !location.pathname.startsWith('/superadmin')) {
    return <Navigate to="/superadmin" replace />
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-[100px] min-h-screen flex flex-col" style={{ backgroundColor: '#F5F0E8' }}>
        <div className="p-6 flex-1"><Outlet /></div>
        <PortalFooter />
      </main>
    </div>
  )
}
