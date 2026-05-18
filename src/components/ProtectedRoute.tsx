import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/portal/Navbar'

// Auth is bypassed during development — restore Supabase session check before going live
export function ProtectedRoute() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E8' }}>
      <Navbar />
      <main className="pt-[64px]">
        <div className="p-6"><Outlet /></div>
      </main>
    </div>
  )
}
