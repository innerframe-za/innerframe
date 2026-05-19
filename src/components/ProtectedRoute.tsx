import { useState, useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/portal/Navbar'

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

/**
 * Wraps all portal routes. Checks Supabase session — redirects to /login
 * if unauthenticated, shows a loading state while the session resolves.
 */
export function ProtectedRoute() {
  const [authState, setAuthState] = useState<AuthState>('loading')

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>
    try {
      supabase = createClient()
    } catch {
      // Supabase not configured — treat as unauthenticated
      setAuthState('unauthenticated')
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(session ? 'authenticated' : 'unauthenticated')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(session ? 'authenticated' : 'unauthenticated')
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E8' }}>
      <Navbar />
      <main className="pt-[64px]">
        <div className="p-6"><Outlet /></div>
      </main>
    </div>
  )
}
