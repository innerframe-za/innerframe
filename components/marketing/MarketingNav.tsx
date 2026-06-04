import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '#who-we-are',  label: 'Who we are'   },
  { href: '#pillars',     label: 'What we do'   },
  { href: '#how-it-works',label: 'How it works' },
  { href: '#pricing',     label: 'Pricing'      },
  { href: '#contact',     label: 'Contact'      },
]

export function MarketingNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 w-full"
      style={{
        backgroundColor: '#334739',
        height: '78px',
        borderBottom: scrolled
          ? '1px solid rgba(211,178,75,0.28)'
          : '1px solid transparent',
        transition: 'border-color 0.3s ease-out, box-shadow 0.3s ease-out',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.18)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">

        {/* Wordmark */}
        <Link to="/" className="flex-shrink-0 flex flex-col items-center leading-none">
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
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontWeight: 400,
              fontSize: '10px',
              color: 'rgba(250,247,240,0.55)',
              letterSpacing: '0.22em',
              marginTop: '3px',
              textTransform: 'uppercase',
            }}
          >
            Care Solutions
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "'Outfit', system-ui, sans-serif",
                fontSize: '13px',
                letterSpacing: '0.03em',
                color: 'rgba(250,247,240,0.72)',
                textDecoration: 'none',
                transition: 'color 0.15s ease-out',
              }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = '#faf7f0')}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(250,247,240,0.72)')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Portal pill */}
        <div className="hidden md:block">
          <Link
            to="/login"
            style={{
              backgroundColor: '#d3b24b',
              color: '#334739',
              borderRadius: '40px',
              padding: '10px 26px',
              fontSize: '13px',
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontWeight: 600,
              letterSpacing: '0.02em',
              display: 'inline-block',
              textDecoration: 'none',
              transition: 'background-color 0.15s ease-out',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#b8972e')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#d3b24b')}
          >
            Client Portal
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          style={{ color: '#faf7f0' }}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="md:hidden px-8 py-6 flex flex-col gap-5 border-t"
          style={{
            backgroundColor: '#2a3d30',
            borderColor: 'rgba(250,247,240,0.1)',
          }}
        >
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "'Outfit', system-ui, sans-serif",
                fontSize: '15px',
                color: 'rgba(250,247,240,0.8)',
                textDecoration: 'none',
              }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/login"
            style={{
              backgroundColor: '#d3b24b',
              color: '#334739',
              borderRadius: '40px',
              padding: '12px 28px',
              fontSize: '14px',
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontWeight: 600,
              display: 'inline-block',
              textDecoration: 'none',
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
