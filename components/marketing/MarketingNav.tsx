import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '#who-we-are', label: 'Who we are' },
  { href: '#pillars', label: 'What we do' },
  { href: '#why-innerframe', label: 'Why Innerframe' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#contact', label: 'Blog' },
]

export function MarketingNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 w-full"
      style={{ backgroundColor: '#698169', height: '78px' }}
    >
      <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img
            src="/logo-full.jpeg"
            alt="Innerframe Care Solutions"
            style={{ height: '56px', objectFit: 'contain' }}
          />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: '#faf7f0', letterSpacing: '0.05em' }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Portal pill button */}
        <div className="hidden md:block">
          <Link
            to="/login"
            className="text-sm font-medium transition-opacity hover:opacity-85"
            style={{
              backgroundColor: '#334739',
              color: '#faf7f0',
              borderRadius: '30px',
              padding: '12px 28px',
              display: 'inline-block',
            }}
          >
            Portal
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          style={{ color: '#faf7f0' }}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="md:hidden px-8 py-6 flex flex-col gap-5 border-t"
          style={{ backgroundColor: '#698169', borderColor: 'rgba(250,247,240,0.15)' }}
        >
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: '#faf7f0', letterSpacing: '0.05em' }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/login"
            className="text-sm font-medium self-start"
            style={{
              backgroundColor: '#334739',
              color: '#faf7f0',
              borderRadius: '30px',
              padding: '12px 28px',
              display: 'inline-block',
            }}
            onClick={() => setOpen(false)}
          >
            Portal
          </Link>
        </div>
      )}
    </nav>
  )
}
