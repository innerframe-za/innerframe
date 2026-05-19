import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Building2, LogOut, Menu, X, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/auth/useUser'

const navItems = [
  { label: 'Facilities', href: '/superadmin', icon: Building2 },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function SuperAdminShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useUser()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch { /* ignore */ }
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#1E3A2F' }}>
      {/* Sidebar — desktop */}
      <aside
        className="hidden lg:flex flex-col w-64 fixed top-0 left-0 bottom-0 z-30 border-r"
        style={{ backgroundColor: '#1E3A2F', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <img src="/logo.jpeg" alt="Innerframe" width={36} height={36} className="rounded object-contain" />
          <div>
            <div className="text-sm font-semibold tracking-wide text-white leading-tight">INNERFRAME</div>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck size={10} style={{ color: '#D4AF37' }} />
              <span className="text-[10px] font-medium" style={{ color: '#D4AF37' }}>Super Admin</span>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Super admin navigation">
          {navItems.map(item => {
            const isActive = location.pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
                  backgroundColor: isActive ? 'rgba(212,175,55,0.15)' : 'transparent',
                }}
              >
                <Icon size={16} style={{ color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.4)' }} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
              style={{ backgroundColor: '#D4AF37', color: '#1E3A2F' }}
            >
              {user ? getInitials(user.fullName) : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-white">{user?.fullName ?? 'Super Admin'}</p>
              <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{user?.email ?? ''}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#ffffff')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)')}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b"
        style={{ backgroundColor: '#1E3A2F', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2.5">
          <img src="/logo.jpeg" alt="Innerframe" width={28} height={28} className="rounded object-contain" />
          <span className="text-sm font-semibold text-white">INNERFRAME</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>SA</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-8 h-8 flex items-center justify-center"
          style={{ color: 'rgba(255,255,255,0.7)' }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed top-14 left-0 right-0 z-30 px-3 py-3 flex flex-col gap-1 border-b"
          style={{ backgroundColor: '#1E3A2F', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          {navItems.map(item => {
            const isActive = location.pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
                style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)' }}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mt-1"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            <LogOut size={16} />Sign out
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        <main className="pt-14 lg:pt-0 min-h-screen" style={{ backgroundColor: '#F5F0E8' }}>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
