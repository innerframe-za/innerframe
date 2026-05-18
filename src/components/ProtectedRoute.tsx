import { useEffect, useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/portal/Navbar'

export function ProtectedRoute() {
  const [status, setStatus] = useState<'loading' | 'auth' | 'unauth'>('loading')

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setStatus(session ? 'auth' : 'unauth')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setStatus(session ? 'auth' : 'unauth')
    })

    return () => subscription.unsubscribe()
  }, [])

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(30,58,47,0.2)', borderTopColor: '#1E3A2F' }} />
    </div>
  )

  if (status === 'unauth') return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E8' }}>
      <Navbar />
      <main className="pt-[64px]">
        <div className="p-6"><Outlet /></div>
      </main>
    </div>
  )
}
