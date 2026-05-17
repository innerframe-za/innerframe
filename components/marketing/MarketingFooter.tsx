'use client'
import Image from 'next/image'
import Link from 'next/link'

/**
 * Marketing footer — logo, tagline, nav links, legal note.
 */
export function MarketingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="py-12 px-6 border-t"
      style={{ backgroundColor: '#1a1a1a', borderColor: '#333333' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.jpeg"
                alt="Innerframe Care Solutions"
                width={36}
                height={36}
                className="rounded object-contain"
              />
              <div>
                <div
                  className="font-medium text-sm tracking-wide"
                  style={{ color: '#F5F0E8' }}
                >
                  INNERFRAME
                </div>
                <div className="text-xs" style={{ color: '#5a5a5a' }}>
                  CARE SOLUTIONS
                </div>
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#5a5a5a' }}>
              Stronger Structures. Better Care. Brighter Futures.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wider mb-4"
              style={{ color: '#D4AF37' }}
            >
              Quick Links
            </p>
            <ul className="space-y-2">
              {[
                { href: '#pillars', label: 'What We Do' },
                { href: '#how-it-works', label: 'How It Works' },
                { href: '#who-its-for', label: 'Who It\'s For' },
                { href: '#contact', label: 'Contact Us' },
              ].map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-xs transition-colors"
                    style={{ color: '#5a5a5a' }}
                    onMouseEnter={e =>
                      ((e.target as HTMLElement).style.color = '#F5F0E8')
                    }
                    onMouseLeave={e =>
                      ((e.target as HTMLElement).style.color = '#5a5a5a')
                    }
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Portal */}
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wider mb-4"
              style={{ color: '#D4AF37' }}
            >
              Clients
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs transition-colors"
              style={{ color: '#F5F0E8' }}
            >
              Client Portal Login →
            </Link>
            <p className="text-xs mt-3" style={{ color: '#5a5a5a' }}>
              Already a client? Sign in to access your facility&apos;s documents,
              residents, and compliance tools.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderColor: '#333333' }}
        >
          <p className="text-xs" style={{ color: '#5a5a5a' }}>
            &copy; {year} Innerframe Care Solutions. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: '#5a5a5a' }}>
            South Africa
          </p>
        </div>
      </div>
    </footer>
  )
}
