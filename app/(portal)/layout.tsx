import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/portal/Navbar'

export const runtime = 'edge'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Skip auth check if Supabase is not configured (mirrors middleware guard)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E8' }}>
      <Navbar />
      {/* Push content below fixed navbar */}
      <main className="pt-[64px]">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
