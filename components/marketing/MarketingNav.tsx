import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

/**
 * Top navigation bar for the public marketing site.
 * Cream bg, logo left, CTA right. Collapses to hamburger on mobile.
 */
export function MarketingNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav
      className="w-full bg-white border-b"
      style={{ borderColor: 'var(--color-if-border)' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.jpeg"
            alt="Innerframe Care Solutions"
            width={40}
            height={40}
            className="rounded object-contain"
          />
          <div>
            <div
              className="font-medium tracking-wide text-sm leading-tight"
              style={{ color: 'var(--color-if-primary)' }}
            >
              INNERFRAME
            </div>
            <div className="text-xs leading-tight" style={{ color: 'var(--color-if-text-muted)' }}>
              CARE SOLUTIONS
            </div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {['#pillars', '#how-it-works', '#who-its-for', '#contact'].map((href, i) => {
            const labels = ['What We Do', 'How It Works', "Who It's For", 'Contact']
            return (
              <a
                key={href}
                href={href}
                className="text-sm transition-colors"
                style={{ color: 'var(--color-if-text-muted)' }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--color-if-primary)')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--color-if-text-muted)')}
              >
                {labels[i]}
              </a>
            )
          })}
        </div>

        {/* Client portal CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--color-if-primary)', color: 'var(--color-if-text-on-dark)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-if-secondary)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-if-primary)')}
          >
            Client Portal
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          style={{ color: 'var(--color-if-primary)' }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="md:hidden border-t px-6 py-4 flex flex-col gap-4"
          style={{ borderColor: 'var(--color-if-border)', backgroundColor: '#ffffff' }}
        >
          {[
            { href: '#pillars', label: 'What We Do' },
            { href: '#how-it-works', label: 'How It Works' },
            { href: '#who-its-for', label: "Who It's For" },
            { href: '#contact', label: 'Contact' },
          ].map(link => (
            <a key={link.href} href={link.href} className="text-sm" style={{ color: 'var(--color-if-primary)' }} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <Link
            to="/login"
            className="px-4 py-2 rounded text-sm font-medium text-center"
            style={{ backgroundColor: 'var(--color-if-primary)', color: 'var(--color-if-text-on-dark)' }}
          >
            Client Portal
          </Link>
        </div>
      )}
    </nav>
  )
}
