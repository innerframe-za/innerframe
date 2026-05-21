import { Link } from 'react-router-dom'

export function MarketingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="py-12 px-6 border-t"
      style={{ backgroundColor: '#1a1a1a', borderColor: '#333333' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.jpeg"
                alt="Innerframe Care Solutions"
                width={36}
                height={36}
                className="rounded object-contain"
              />
              <div>
                <div className="font-medium text-sm tracking-wide" style={{ color: '#F5F0E8' }}>
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
            <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: '#d3b24b' }}>
              Quick Links
            </p>
            <ul className="space-y-2">
              {[
                { href: '#pillars', label: 'What We Do' },
                { href: '#how-it-works', label: 'How It Works' },
                { href: '#who-its-for', label: "Who It's For" },
                { href: '#contact', label: 'Contact Us' },
              ].map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-xs transition-colors"
                    style={{ color: '#5a5a5a' }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.color = '#F5F0E8')}
                    onMouseLeave={e => ((e.target as HTMLElement).style.color = '#5a5a5a')}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Portal */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: '#d3b24b' }}>
              Clients
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs transition-colors"
              style={{ color: '#F5F0E8' }}
            >
              Client Portal Login →
            </Link>
            <p className="text-xs mt-3" style={{ color: '#5a5a5a' }}>
              Already a client? Sign in to access your facility's documents,
              residents, and compliance tools.
            </p>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: '#d3b24b' }}>
              Legal
            </p>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Medical Disclaimer', 'Confidentiality Notice'].map(item => (
                <li key={item}>
                  <span
                    className="text-xs cursor-default"
                    style={{ color: '#5a5a5a' }}
                    title="Documentation coming soon"
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* POPIA notice strip */}
        <div
          className="py-4 border-t border-b text-xs text-center leading-relaxed"
          style={{ borderColor: '#2a2a2a', color: '#404040' }}
        >
          Personal information is collected and processed in accordance with the{' '}
          <strong style={{ color: '#555555' }}>
            Protection of Personal Information Act (POPIA), Act 4 of 2013
          </strong>
          . All resident data is treated as confidential.{' '}
          This platform does not constitute medical advice — all clinical decisions must be made by qualified healthcare professionals.
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: '#5a5a5a' }}>
            &copy; {year} Innerframe Care Solutions. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: '#3a3a3a' }}>
            Made by{' '}
            <span style={{ color: '#5a5a5a' }}>Cortex Analytics</span>
            {' '}· South Africa
          </p>
        </div>
      </div>
    </footer>
  )
}
