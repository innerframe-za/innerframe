import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  DollarSign,
  UtensilsCrossed,
  Stethoscope,
  Scale,
  Search,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { useUser } from '@/lib/auth/useUser'

const navItems = [
  { label: 'Admin Office', href: '/pillar/admin', icon: ClipboardList },
  { label: 'Finance', href: '/pillar/finance', icon: DollarSign },
  { label: 'Kitchen', href: '/pillar/kitchen', icon: UtensilsCrossed },
  { label: 'Medical', href: '/pillar/medical', icon: Stethoscope },
  { label: 'Board Governance', href: '/pillar/board-governance', icon: Scale },
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`)
      setSearchValue('')
    }
  }

  const handleLogout = () => {
    navigate('/dashboard')
  }

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 gap-4"
        style={{
          height: '64px',
          backgroundColor: '#1E3A2F',
          borderBottom: '2px solid #D4AF37',
        }}
        role="navigation"
        aria-label="Portal navigation"
      >
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
          <img
            src="/logo.jpeg"
            alt="Innerframe Care Solutions"
            width={40}
            height={40}
            className="rounded object-contain"
          />
          <div className="hidden sm:block">
            <div className="text-sm font-medium tracking-wide text-white leading-tight">
              INNERFRAME
            </div>
            <div
              className="text-xs leading-tight"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              CARE SOLUTIONS
            </div>
          </div>
        </Link>

        {/* Desktop: pillar nav links */}
        <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className="relative px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap"
                style={{
                  color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.65)',
                }}
                onMouseEnter={e => {
                  if (!isActive)
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      'rgba(255,255,255,0.9)'
                }}
                onMouseLeave={e => {
                  if (!isActive)
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      'rgba(255,255,255,0.65)'
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t"
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
          className="hidden md:flex items-center gap-2 flex-shrink-0"
        >
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Search..."
              className="w-44 pl-8 pr-3 py-1.5 text-xs rounded border bg-transparent outline-none transition-all"
              style={{
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.5)'
                e.target.style.width = '200px'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.2)'
                e.target.style.width = '176px'
              }}
              aria-label="Search documents and residents"
            />
          </div>
        </form>

        {/* Right side: user info + avatar */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto lg:ml-0">
          {user && (
            <span
              className="hidden md:block text-xs px-2 py-1 rounded"
              style={{
                color: 'rgba(255,255,255,0.6)',
                backgroundColor: 'rgba(255,255,255,0.08)',
              }}
            >
              {user.fullName}
            </span>
          )}

          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 cursor-pointer"
            style={{ backgroundColor: '#D4AF37', color: '#1E3A2F' }}
            title={user?.fullName ?? 'User'}
            aria-label="Go to settings"
            onClick={() => navigate('/settings')}
          >
            {user ? getInitials(user.fullName) : '?'}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="hidden md:flex w-7 h-7 items-center justify-center rounded transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e =>
              ((e.currentTarget as HTMLButtonElement).style.color = '#ffffff')
            }
            onMouseLeave={e =>
              ((e.currentTarget as HTMLButtonElement).style.color =
                'rgba(255,255,255,0.5)')
            }
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>

          <button
            type="button"
            className="lg:hidden flex w-7 h-7 items-center justify-center rounded"
            style={{ color: 'rgba(255,255,255,0.8)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="fixed top-[64px] left-0 right-0 z-40 px-4 py-4 flex flex-col gap-1 lg:hidden"
          style={{ backgroundColor: '#1E3A2F', borderBottom: '2px solid #D4AF37' }}
        >
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded text-sm"
                style={{
                  color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.75)',
                  backgroundColor: isActive
                    ? 'rgba(212,175,55,0.1)'
                    : 'transparent',
                }}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={16} aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}

          <form onSubmit={handleSearch} className="mt-2">
            <input
              type="search"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Search documents and residents..."
              className="w-full px-3 py-2 text-sm rounded border bg-transparent outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
            />
          </form>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded text-sm mt-2"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </>
  )
}
