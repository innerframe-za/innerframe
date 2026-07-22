import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apiGet } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/AuthContext'
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
      { label: 'Staff', href: '/staff-files' },
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
  const { logout } = useAuth()
  const [searchValue, setSearchValue] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [facilityName, setFacilityName] = useState<string | null>(null)
  const [avatarHovered, setAvatarHovered] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const hrButtonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (!user?.orgId) return
    let cancelled = false
    apiGet<{ name: string }>(`/organisations/${user.orgId}`)
      .then(data => { if (!cancelled) setFacilityName(data.name) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [user?.orgId])

  useEffect(() => {
    if (!openDropdown) return
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
        setDropdownPos(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`)
      setSearchValue('')
      setMobileOpen(false)
    }
  }

  const handleLogout = async () => {
    await logout().catch(() => {})
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
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
      {/* ── Unified navigation bar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center"
        style={{
          height: '64px',
          backgroundColor: '#334739',
          boxShadow: '0 1px 0 rgba(212,175,55,0.18), 0 2px 12px rgba(0,0,0,0.18)',
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* ── Brand ── */}
        <Link
          to="/dashboard"
          className="flex-shrink-0 flex flex-col items-start leading-none pl-5 pr-5"
          aria-label="Innerframe — go to dashboard"
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 600,
              fontSize: '22px',
              color: '#FAF7F0',
              letterSpacing: '0.14em',
              lineHeight: 1,
            }}
          >
            INNERFRAME
          </span>
          <span
            className="hidden sm:block"
            style={{
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontWeight: 400,
              fontSize: '9.5px',
              color: 'rgba(250,247,240,0.58)',
              letterSpacing: '0.24em',
              marginTop: '4px',
              textTransform: 'uppercase',
            }}
          >
            Care Solutions
          </span>
        </Link>

        {/* ── Facility name (md+) ── */}
        {facilityName && (
          <div className="hidden md:flex items-center gap-3 flex-shrink-0 mr-3">
            <div
              className="h-5 w-px"
              style={{ backgroundColor: 'rgba(250,247,240,0.12)' }}
              aria-hidden="true"
            />
            <span
              className="text-[11px] truncate max-w-[148px]"
              style={{
                color: 'rgba(250,247,240,0.62)',
                fontFamily: "'Outfit', system-ui",
                letterSpacing: '0.01em',
              }}
            >
              {facilityName}
            </span>
          </div>
        )}

        {/* ── Tab navigation (md+) ── */}
        <div
          className="hidden md:flex items-center h-full flex-1 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
          role="navigation"
          aria-label="Section navigation"
        >
          {visibleTabs.map(item => {
            // HR dropdown
            if (item.dropdown) {
              const isOpen = openDropdown === item.label
              const isActive = item.dropdown.some(sub => location.pathname.startsWith(sub.href))
              return (
                <div key={item.label} ref={dropdownRef} className="relative flex items-center h-full">
                  <button
                    ref={hrButtonRef}
                    type="button"
                    className="relative flex items-center gap-1.5 h-full px-4 whitespace-nowrap flex-shrink-0 transition-colors duration-150"
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      fontFamily: "'Outfit', system-ui",
                      color: isActive ? '#FAF7F0' : 'rgba(250,247,240,0.65)',
                    }}
                    onClick={() => {
                      if (isOpen) {
                        setOpenDropdown(null)
                        setDropdownPos(null)
                      } else {
                        const rect = hrButtonRef.current?.getBoundingClientRect()
                        if (rect) setDropdownPos({ top: rect.bottom, left: rect.left })
                        setOpenDropdown(item.label)
                      }
                    }}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <ChevronDown
                      size={11}
                      aria-hidden="true"
                      style={{
                        transition: 'transform 0.2s cubic-bezier(0.23,1,0.32,1)',
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        opacity: 0.6,
                      }}
                    />
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[2px]"
                        style={{ backgroundColor: '#D4AF37' }}
                        aria-hidden="true"
                      />
                    )}
                  </button>

                  {isOpen && dropdownPos && (
                    <div
                      className="overflow-hidden rounded-b-xl"
                      style={{
                        position: 'fixed',
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        minWidth: '172px',
                        backgroundColor: '#253328',
                        border: '1px solid rgba(212,175,55,0.22)',
                        borderTop: 'none',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
                        zIndex: 60,
                      }}
                    >
                      {item.dropdown.map(sub => {
                        const subActive = location.pathname.startsWith(sub.href)
                        return (
                          <Link
                            key={sub.href}
                            to={sub.href}
                            className="flex items-center px-4 py-3 transition-colors duration-150 hover:bg-[rgba(250,247,240,0.06)]"
                            style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              fontFamily: "'Outfit', system-ui",
                              color: subActive ? '#D4AF37' : 'rgba(250,247,240,0.75)',
                              backgroundColor: subActive ? 'rgba(212,175,55,0.08)' : 'transparent',
                            }}
                            onClick={() => { setOpenDropdown(null); setDropdownPos(null) }}
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

            // Regular tab link
            const active = isTabActive(item.href!)
            return (
              <Link
                key={item.href}
                to={item.href!}
                className="relative flex items-center h-full px-4 whitespace-nowrap flex-shrink-0 transition-colors duration-150 hover:text-[rgba(250,247,240,0.85)]"
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  fontFamily: "'Outfit', system-ui",
                  color: active ? '#FAF7F0' : 'rgba(250,247,240,0.65)',
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

        {/* ── Right controls (md+) ── */}
        <div className="hidden md:flex items-center gap-1.5 flex-shrink-0 pr-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'rgba(250,247,240,0.55)' }}
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="Search…"
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg outline-none transition-all duration-200 focus:w-[204px]"
                style={{
                  width: '148px',
                  border: '1px solid rgba(250,247,240,0.1)',
                  backgroundColor: 'rgba(250,247,240,0.06)',
                  color: '#FAF7F0',
                  fontFamily: "'Outfit', system-ui",
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(212,175,55,0.45)'
                  e.target.style.backgroundColor = 'rgba(250,247,240,0.1)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(250,247,240,0.1)'
                  e.target.style.backgroundColor = 'rgba(250,247,240,0.06)'
                }}
                aria-label="Search documents and residents"
              />
            </div>
          </form>

          {/* Avatar */}
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all duration-150 ml-1"
            style={{ backgroundColor: '#D4AF37', color: '#1E3A2F', fontFamily: "'Outfit', system-ui" }}
            title={isAdmin ? 'Settings' : (user?.fullName ?? 'User')}
            aria-label={isAdmin ? 'Go to settings' : (user?.fullName ?? 'User profile')}
            onClick={() => { if (isAdmin) navigate('/settings') }}
            onMouseEnter={() => { if (isAdmin) setAvatarHovered(true) }}
            onMouseLeave={() => setAvatarHovered(false)}
          >
            {isAdmin && avatarHovered ? <Settings size={14} /> : (user ? getInitials(user.fullName) : '?')}
          </button>

          {/* Sign out — icon only on desktop */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center rounded-md transition-colors duration-150 hover:text-[rgba(250,247,240,0.8)]"
            style={{ color: 'rgba(250,247,240,0.52)' }}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>

        {/* ── Mobile right: avatar + hamburger ── */}
        <div className="ml-auto flex items-center gap-2 pr-4 md:hidden">
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
            style={{ backgroundColor: '#D4AF37', color: '#1E3A2F', fontFamily: "'Outfit', system-ui" }}
            onClick={() => { if (isAdmin) navigate('/settings') }}
            title={isAdmin ? 'Settings' : (user?.fullName ?? 'User')}
            aria-label={isAdmin ? 'Go to settings' : undefined}
          >
            {user ? getInitials(user.fullName) : '?'}
          </button>
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-md transition-colors duration-150"
            style={{ color: 'rgba(250,247,240,0.7)' }}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown ── */}
      {mobileOpen && (
        <div
          className="fixed left-0 right-0 z-40 md:hidden"
          style={{
            top: '64px',
            backgroundColor: '#2B3A30',
            borderBottom: '1px solid rgba(212,175,55,0.18)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.24)',
          }}
          role="navigation"
          aria-label="Mobile navigation"
        >
          {facilityName && (
            <div
              className="px-4 pt-3 pb-2"
              style={{ borderBottom: '1px solid rgba(250,247,240,0.06)' }}
            >
              <p
                className="text-xs"
                style={{ color: 'rgba(250,247,240,0.58)', fontFamily: "'Outfit', system-ui" }}
              >
                {facilityName}
              </p>
            </div>
          )}

          <div className="px-3 py-3 flex flex-col gap-0.5">
            {visibleTabs.map(item => {
              if (item.dropdown) {
                return (
                  <div key={item.label}>
                    <p
                      className="px-3 pt-2 pb-1 text-xs font-medium"
                      style={{ color: 'rgba(250,247,240,0.52)', fontFamily: "'Outfit', system-ui" }}
                    >
                      {item.label}
                    </p>
                    {item.dropdown.map(sub => {
                      const subActive = location.pathname.startsWith(sub.href)
                      return (
                        <Link
                          key={sub.href}
                          to={sub.href}
                          className="flex items-center pl-5 pr-3 py-2.5 rounded-lg text-sm transition-colors duration-150 hover:bg-[rgba(250,247,240,0.05)]"
                          style={{
                            color: subActive ? '#D4AF37' : 'rgba(250,247,240,0.7)',
                            backgroundColor: subActive ? 'rgba(212,175,55,0.07)' : 'transparent',
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
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 hover:bg-[rgba(250,247,240,0.05)]"
                  style={{
                    color: active ? '#D4AF37' : 'rgba(250,247,240,0.7)',
                    backgroundColor: active ? 'rgba(212,175,55,0.07)' : 'transparent',
                    fontFamily: "'Outfit', system-ui",
                  }}
                  aria-current={active ? 'page' : undefined}
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
                  style={{ color: 'rgba(250,247,240,0.55)' }}
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  placeholder="Search documents and residents…"
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg outline-none"
                  style={{
                    border: '1px solid rgba(250,247,240,0.12)',
                    backgroundColor: 'rgba(250,247,240,0.07)',
                    color: '#FAF7F0',
                    fontFamily: "'Outfit', system-ui",
                  }}
                  aria-label="Search documents and residents"
                />
              </div>
            </form>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm mt-1 transition-colors duration-150 hover:text-[rgba(250,247,240,0.65)]"
              style={{ color: 'rgba(250,247,240,0.58)', fontFamily: "'Outfit', system-ui" }}
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  )
}
