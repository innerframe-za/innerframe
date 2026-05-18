import { Navbar } from '@/components/portal/Navbar'

export const runtime = 'edge'

// Auth is enforced by middleware.ts — unauthenticated users are redirected
// to /login before this layout ever renders.
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
