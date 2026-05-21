import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { createClient } from '@/lib/supabase/client'
import { Search, Menu, X, LogOut, Settings } from 'lucide-react'
import { useUser } from '@/lib/auth/useUser'

const tabItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Admin', href: '/pillar/admin' },
  { label: 'Residence', href: '/residents' },
  { label: 'Finance', href: '/pillar/finance' },
  { label: 'Kitchen', href: '/pillar/kitchen' },
  { label: 'Medical Residence', href: '/pillar/medical-residence' },
  { label: 'HR', href: '/pillar/hr' },
  { label: 'Board Governance', href: '/pillar/board-governance' },
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

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useUser()
  const [searchValue, setSearchValue] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [facilityName, setFacilityName] = useState<string | null>(null)
  const [avatarHovered, setAvatarHovered] = useState(false)

  // Fetch the facility name for the top bar
  useEffect(() => {
    if (!user?.orgId) return
    let cancelled = false
    const supabase = createClient()
    supabase
      .from('organisations')
      .select('name')
      .eq('id', user.orgId)
      .single()
      .then(({ data }) => {
        if (!cancelled && data) setFacilityName(data.name)
      }, () => { /* silent — facility name is display-only */ })
    return () => { cancelled = true }
  }, [user?.orgId])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`)
      setSearchValue('')
      setMobileOpen(false)
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } finally {
      navigate('/login')
    }
  }

  const isAdmin = user?.role === 'home_admin' || user?.role === 'super_admin'

  const isTabActive = (href: string) => {
    if (href === '/dashboard') return location.pathname === '/dashboard'
    if (href === '/residents') return location.pathname.startsWith('/residents')
    return location.pathname.startsWith(href)
  }

  return (
    <>
      {/* ── Top bar: brand + facility + user controls ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
        style={{
          height: '56px',
          backgroundColor: '#1E3A2F',
          borderBottom: '1px solid rgba(212,175,55,0.3)',
        }}
        role="navigation"
        aria-label="Portal top navigation"
      >
        {/* Wordmark — matches MarketingNav exactly */}
        <Link to="/dashboard" className="flex-shrink-0 flex flex-col items-center leading-none">
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 600,
              fontSize: '26px',
              color: '#faf7f0',
              letterSpacing: '0.12em',
            }}
          >
            INNERFRAME
          </span>
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 400,
              fontSize: '11px',
              color: 'rgba(250,247,240,0.8)',
              letterSpacing: '0.18em',
              marginTop: '3px',
            }}
          >
            — CARE SOLUTIONS —
          </span>
        </Link>

        {/* Right section: facility name + avatar + sign out */}
        <div className="flex items-center gap-3">
          {/* Facility name */}
          {facilityName && (
            <span
              className="hidden sm:block text-xs px-2.5 py-1 rounded"
              style={{ color: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(255,255,255,0.08)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {facilityName}
            </span>
          )}

          {/* Profile avatar — shows gear icon on hover for admins */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-all ${isAdmin ? 'cursor-pointer' : ''}`}
            style={{ backgroundColor: '#D4AF37', color: '#1E3A2F' }}
            title={isAdmin ? 'Settings' : (user?.fullName ?? 'User')}
            aria-label={isAdmin ? 'Go to settings' : undefined}
            onClick={() => { if (isAdmin) navigate('/settings') }}
            onMouseEnter={() => { if (isAdmin) setAvatarHovered(true) }}
            onMouseLeave={() => setAvatarHovered(false)}
          >
            {isAdmin && avatarHovered
              ? <Settings size={14} />
              : (user ? getInitials(user.fullName) : '?')
            }
          </div>

          {/* Sign out */}
          <button
            type="button"
            onClick={handleLogout}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.4)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)'
            }}
            aria-label="Sign out"
          >
            <LogOut size={13} />
            Sign Out
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden flex w-8 h-8 items-center justify-center rounded"
            style={{ color: 'rgba(255,255,255,0.8)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* ── Second bar: tab navigation + search ── */}
      <nav
        className="fixed left-0 right-0 z-40 flex items-center justify-between px-4"
        style={{
          top: '56px',
          height: '44px',
          backgroundColor: '#698169',
          borderBottom: '2px solid #D4AF37',
        }}
        role="navigation"
        aria-label="Portal section navigation"
      >
        {/* Tab links — horizontally scrollable on small screens */}
        <div
          className="hidden md:flex items-center h-full overflow-x-auto gap-0 flex-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {tabItems.map(item => {
            const active = isTabActive(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className="relative flex items-center h-full px-3 text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0"
                style={{ color: active ? '#D4AF37' : 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.9)'
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)'
                }}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: '#D4AF37' }}
                    aria-hidden="true"
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center flex-shrink-0 ml-auto"
        >
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Search..."
              className="w-40 pl-7 pr-3 py-1 text-xs rounded border bg-transparent outline-none transition-all"
              style={{ borderColor: 'rgba(255,255,255,0.18)', color: '#ffffff' }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.45)'
                e.target.style.width = '190px'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.18)'
                e.target.style.width = '160px'
              }}
              aria-label="Search documents and residents"
            />
          </div>
        </form>
      </nav>

      {/* ── Mobile dropdown ── */}
      {mobileOpen && (
        <div
          className="fixed left-0 right-0 z-30 px-4 py-4 flex flex-col gap-1 md:hidden"
          style={{ top: '100px', backgroundColor: '#698169', borderBottom: '2px solid #D4AF37' }}
        >
          {tabItems.map(item => {
            const active = isTabActive(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center px-3 py-2.5 rounded text-sm"
                style={{
                  color: active ? '#D4AF37' : 'rgba(255,255,255,0.75)',
                  backgroundColor: active ? 'rgba(212,175,55,0.1)' : 'transparent',
                }}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}

          <form onSubmit={handleSearch} className="mt-2">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              />
              <input
                type="search"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="Search documents and residents..."
                className="w-full pl-8 pr-3 py-2 text-sm rounded border bg-transparent outline-none"
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
              />
            </div>
          </form>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded text-sm mt-1"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      )}
    </>
  )
}
