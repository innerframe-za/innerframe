import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const C = {
  evergreen: '#496353',
  ivory: '#F8F5EF',
  gold: '#B89C69',
}

const INTER = "'Inter', system-ui, sans-serif"
const CORMORANT = "'Cormorant Garamond', Georgia, serif"

const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#how-we-work', label: 'How We Work' },
  { href: '#contact', label: 'Contact' },
]

export function MarketingNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 w-full transition-shadow duration-300"
      style={{
        backgroundColor: C.evergreen,
        height: '72px',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.15)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
        {/* Wordmark */}
        <Link to="/" className="flex-shrink-0 flex flex-col items-start leading-none" aria-label="Innerframe Care Solutions home">
          <span style={{ fontFamily: CORMORANT, fontWeight: 600, fontSize: '24px', color: C.ivory, letterSpacing: '0.1em' }}>
            INNERFRAME
          </span>
          <span style={{ fontFamily: INTER, fontWeight: 400, fontSize: '10px', color: 'rgba(248,245,239,0.65)', letterSpacing: '0.2em', marginTop: '2px' }}>
            CARE SOLUTIONS
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              style={{ fontFamily: INTER, fontWeight: 500, fontSize: '15px', color: 'rgba(248,245,239,0.85)', letterSpacing: '0.02em', transition: 'color 150ms ease' }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = C.ivory)}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(248,245,239,0.85)')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Portal button */}
        <div className="hidden md:block">
          <Link
            to="/login"
            style={{
              fontFamily: INTER,
              fontWeight: 500,
              fontSize: '15px',
              color: C.ivory,
              border: `1.5px solid rgba(248,245,239,0.5)`,
              borderRadius: '12px',
              padding: '10px 24px',
              display: 'inline-block',
              transition: 'border-color 150ms ease, background-color 150ms ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = C.ivory
              ;(e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(248,245,239,0.08)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(248,245,239,0.5)'
              ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
            }}
          >
            Client Portal
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          style={{ color: C.ivory }}
        >
          {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="md:hidden px-8 py-6 flex flex-col gap-5 border-t"
          style={{ backgroundColor: C.evergreen, borderColor: 'rgba(248,245,239,0.12)' }}
        >
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              style={{ fontFamily: INTER, fontWeight: 500, fontSize: '16px', color: 'rgba(248,245,239,0.85)' }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/login"
            style={{
              fontFamily: INTER,
              fontWeight: 500,
              fontSize: '15px',
              color: C.ivory,
              border: `1.5px solid rgba(248,245,239,0.4)`,
              borderRadius: '12px',
              padding: '12px 24px',
              display: 'inline-block',
              alignSelf: 'flex-start',
              marginTop: '4px',
            }}
            onClick={() => setOpen(false)}
          >
            Client Portal
          </Link>
        </div>
      )}
    </nav>
  )
}
