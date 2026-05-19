import { useState, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/portal/Navbar'

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

/**
 * Wraps all portal routes. Checks Supabase session — redirects to /login
 * if unauthenticated. If the user has force_password_change set in their
 * metadata, redirects to /change-password before allowing portal access.
 */
export function ProtectedRoute() {
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [forcePasswordChange, setForcePasswordChange] = useState(false)
  const location = useLocation()

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>
    try {
      supabase = createClient()
    } catch {
      setAuthState('unauthenticated')
      return
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session) {
          setForcePasswordChange(session.user.user_metadata?.force_password_change === true)
          setAuthState('authenticated')
        } else {
          setAuthState('unauthenticated')
        }
      })
      .catch(() => setAuthState('unauthenticated'))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setForcePasswordChange(session.user.user_metadata?.force_password_change === true)
        setAuthState('authenticated')
      } else {
        setForcePasswordChange(false)
        setAuthState('unauthenticated')
      }
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

  // Staff must set their own password before accessing the portal
  if (forcePasswordChange && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  // /change-password renders without the Navbar shell
  if (location.pathname === '/change-password') {
    return <Outlet />
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E8' }}>
      <Navbar />
      <main className="pt-[64px]">
        <div className="p-6"><Outlet /></div>
      </main>
    </div>
  )
}
