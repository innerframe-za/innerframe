import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { createClient } from '@/lib/supabase/client'
import { Search, Menu, X, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useUser } from '@/lib/auth/useUser'
import { usePermissions, type PillarSlug } from '@/lib/auth/usePermissions'

type DropdownItem = { label: string; href: string }

type NavItem = {
  label: string
  href?: string
  pillarSlug?: PillarSlug
  dropdown?: DropdownItem[]
}

const tabItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Admin', href: '/pillar/admin', pillarSlug: 'admin' },
  { label: 'Residence', href: '/residents' },
  { label: 'Finance', href: '/pillar/finance', pillarSlug: 'finance' },
  { label: 'Kitchen', href: '/pillar/kitchen', pillarSlug: 'kitchen' },
  {
    label: 'HR',
    pillarSlug: 'hr',
    dropdown: [
      { label: 'HR Documents', href: '/pillar/hr' },
      { label: 'Staff Files', href: '/staff-files' },
    ],
  },
  { label: 'Board Governance', href: '/pillar/board-governance', pillarSlug: 'board_governance' },
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
      }, () => {})
    return () => { cancelled = true }
  }, [user?.orgId])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!openDropdown) return
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

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
  const { permissions } = usePermissions()

  const visibleTabs = tabItems.filter(item =>
    !item.pillarSlug || isAdmin || permissions[item.pillarSlug]?.canView !== false
  )

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
          borderBottom: '1px solid rgba(212,175,55,0.25)',
        }}
        role="navigation"
        aria-label="Portal top navigation"
      >
        {/* Wordmark */}
        <Link to="/dashboard" className="flex-shrink-0 flex flex-col items-start leading-none min-w-0">
          <span
            className="whitespace-nowrap"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 600,
              fontSize: 'clamp(18px, 5vw, 24px)',
              color: '#faf7f0',
              letterSpacing: '0.14em',
            }}
          >
            INNERFRAME
          </span>
          <span
            className="whitespace-nowrap hidden sm:block"
            style={{
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontWeight: 400,
              fontSize: '10px',
              color: 'rgba(250,247,240,0.5)',
              letterSpacing: '0.22em',
              marginTop: '3px',
              textTransform: 'uppercase',
            }}
          >
            Care Solutions
          </span>
        </Link>

        {/* Right section: facility name + avatar + sign out */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {facilityName && (
            <span
              className="hidden sm:block text-xs px-2.5 py-1 rounded-md"
              style={{
                color: 'rgba(255,255,255,0.65)',
                backgroundColor: 'rgba(255,255,255,0.07)',
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontFamily: "'Outfit', system-ui",
                letterSpacing: '0.01em',
              }}
            >
              {facilityName}
            </span>
          )}

          {/* Profile avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all duration-150 cursor-pointer"
            style={{ backgroundColor: '#D4AF37', color: '#1E3A2F', fontFamily: "'Outfit', system-ui" }}
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

          {/* Sign out — desktop */}
          <button
            type="button"
            onClick={handleLogout}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all duration-150 hover:text-white"
            style={{
              color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.12)',
              fontFamily: "'Outfit', system-ui",
            }}
            aria-label="Sign out"
          >
            <LogOut size={13} />
            Sign out
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden flex w-8 h-8 items-center justify-center rounded-md transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.75)' }}
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
        className="hidden md:flex fixed left-0 right-0 z-40 items-center justify-between px-4"
        style={{
          top: '56px',
          height: '44px',
          backgroundColor: '#698169',
          borderBottom: '2px solid #D4AF37',
        }}
        role="navigation"
        aria-label="Portal section navigation"
      >
        {/* Tab links */}
        <div
          className="flex items-center h-full overflow-x-auto gap-0 flex-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {visibleTabs.map(item => {
            // Dropdown item (HR)
            if (item.dropdown) {
              const isOpen = openDropdown === item.label
              const isActive = item.dropdown.some(sub => location.pathname.startsWith(sub.href))
              return (
                <div key={item.label} ref={dropdownRef} className="relative flex items-center h-full">
                  <button
                    type="button"
                    className="relative flex items-center gap-1 h-full px-3.5 text-xs font-medium whitespace-nowrap transition-colors duration-150 flex-shrink-0"
                    style={{
                      color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.55)',
                      fontFamily: "'Outfit', system-ui",
                      letterSpacing: '0.01em',
                    }}
                    onClick={() => setOpenDropdown(isOpen ? null : item.label)}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <ChevronDown
                      size={10}
                      style={{
                        transition: 'transform 0.15s',
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                      }}
                    />
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-sm"
                        style={{ backgroundColor: '#D4AF37' }}
                        aria-hidden="true"
                      />
                    )}
                  </button>

                  {isOpen && (
                    <div
                      className="absolute top-full left-0 min-w-[160px] overflow-hidden rounded-b-lg shadow-lg"
                      style={{
                        backgroundColor: '#5a7060',
                        border: '1px solid rgba(212,175,55,0.3)',
                        borderTop: 'none',
                        zIndex: 60,
                      }}
                    >
                      {item.dropdown.map(sub => {
                        const subActive = location.pathname.startsWith(sub.href)
                        return (
                          <Link
                            key={sub.href}
                            to={sub.href}
                            className="flex items-center px-4 py-2.5 text-xs font-medium transition-colors duration-150"
                            style={{
                              color: subActive ? '#D4AF37' : 'rgba(255,255,255,0.85)',
                              backgroundColor: subActive ? 'rgba(212,175,55,0.1)' : 'transparent',
                              fontFamily: "'Outfit', system-ui",
                            }}
                            onClick={() => setOpenDropdown(null)}
                            onMouseEnter={e => {
                              if (!subActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
                            }}
                            onMouseLeave={e => {
                              if (!subActive) e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            {sub.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Regular link
            const active = isTabActive(item.href!)
            return (
              <Link
                key={item.href}
                to={item.href!}
                className="relative flex items-center h-full px-3.5 text-xs font-medium whitespace-nowrap transition-colors duration-150 flex-shrink-0"
                style={{
                  color: active ? '#D4AF37' : 'rgba(255,255,255,0.55)',
                  fontFamily: "'Outfit', system-ui",
                  letterSpacing: '0.01em',
                }}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-sm"
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
          className="flex items-center flex-shrink-0 ml-3"
        >
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Search…"
              className="pl-8 pr-4 py-1.5 text-xs rounded-lg outline-none transition-all duration-150 focus:w-[240px]"
              style={{
                width: '180px',
                border: '1px solid rgba(255,255,255,0.15)',
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                fontFamily: "'Outfit', system-ui",
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(212,175,55,0.6)'
                e.target.style.backgroundColor = 'rgba(255,255,255,0.12)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.15)'
                e.target.style.backgroundColor = 'rgba(255,255,255,0.08)'
              }}
              aria-label="Search documents and residents"
            />
          </div>
        </form>
      </nav>

      {/* ── Mobile dropdown ── */}
      {mobileOpen && (
        <div
          className="fixed left-0 right-0 z-30 px-4 py-3 flex flex-col gap-0.5 md:hidden"
          style={{ top: '56px', backgroundColor: '#698169', borderBottom: '2px solid #D4AF37' }}
        >
          {visibleTabs.map(item => {
            // Dropdown items shown as a labelled group on mobile
            if (item.dropdown) {
              return (
                <div key={item.label}>
                  <p
                    className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Outfit', system-ui" }}
                  >
                    {item.label}
                  </p>
                  {item.dropdown.map(sub => {
                    const subActive = location.pathname.startsWith(sub.href)
                    return (
                      <Link
                        key={sub.href}
                        to={sub.href}
                        className="flex items-center pl-5 pr-3 py-2 rounded-lg text-sm transition-colors duration-150"
                        style={{
                          color: subActive ? '#D4AF37' : 'rgba(255,255,255,0.7)',
                          backgroundColor: subActive ? 'rgba(212,175,55,0.08)' : 'transparent',
                          fontFamily: "'Outfit', system-ui",
                        }}
                        onClick={() => setMobileOpen(false)}
                      >
                        {sub.label}
                      </Link>
                    )
                  })}
                </div>
              )
            }

            const active = isTabActive(item.href!)
            return (
              <Link
                key={item.href}
                to={item.href!}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors duration-150"
                style={{
                  color: active ? '#D4AF37' : 'rgba(255,255,255,0.7)',
                  backgroundColor: active ? 'rgba(212,175,55,0.08)' : 'transparent',
                  fontFamily: "'Outfit', system-ui",
                }}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}

          <form onSubmit={handleSearch} className="mt-2 pb-1">
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
                placeholder="Search documents and residents…"
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg outline-none"
                style={{
                  border: '1px solid rgba(255,255,255,0.15)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  fontFamily: "'Outfit', system-ui",
                }}
              />
            </div>
          </form>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mt-1 transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Outfit', system-ui" }}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}
    </>
  )
}
