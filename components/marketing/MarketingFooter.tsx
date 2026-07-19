import { Link } from 'react-router-dom'

const C = {
  evergreen: '#496353',
  gold: '#B89C69',
  ivory: '#F8F5EF',
  sageSoft: '#C8D4C8',
}

const INTER = "'Inter', system-ui, sans-serif"
const CORMORANT = "'Cormorant Garamond', Georgia, serif"

const SERVICES_LINKS = [
  'Governance & Board Support',
  'Regulatory Compliance',
  'Operational Structure',
  'Financial Sustainability',
  'Staff Development',
  'Strategic Advisory',
]

const LEGAL_ITEMS = ['Privacy Policy', 'Terms of Service', 'POPIA Notice', 'Medical Disclaimer']

export function MarketingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{ backgroundColor: C.evergreen }}
      className="px-6"
    >
      {/* Main footer body */}
      <div
        className="max-w-7xl mx-auto py-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  fontFamily: CORMORANT,
                  fontWeight: 600,
                  fontSize: '22px',
                  color: C.ivory,
                  letterSpacing: '0.1em',
                  marginBottom: '4px',
                }}
              >
                INNERFRAME
              </div>
              <div
                style={{
                  fontFamily: INTER,
                  fontSize: '10px',
                  color: 'rgba(248,245,239,0.5)',
                  letterSpacing: '0.2em',
                }}
              >
                CARE SOLUTIONS
              </div>
            </div>
            <p
              style={{
                fontFamily: INTER,
                fontSize: '14px',
                lineHeight: 1.7,
                color: 'rgba(248,245,239,0.6)',
                maxWidth: '220px',
              }}
            >
              Building stronger foundations for care organisations across South Africa.
            </p>
          </div>

          {/* Services column */}
          <div>
            <p
              style={{
                fontFamily: INTER,
                fontWeight: 600,
                fontSize: '11px',
                color: C.gold,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}
            >
              Services
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SERVICES_LINKS.map(item => (
                <li key={item}>
                  <a
                    href="#services"
                    style={{
                      fontFamily: INTER,
                      fontSize: '14px',
                      color: 'rgba(248,245,239,0.65)',
                      transition: 'color 150ms ease',
                    }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.color = C.ivory)}
                    onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(248,245,239,0.65)')}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Portal / Clients column */}
          <div>
            <p
              style={{
                fontFamily: INTER,
                fontWeight: 600,
                fontSize: '11px',
                color: C.gold,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}
            >
              Clients
            </p>
            <Link
              to="/login"
              style={{
                fontFamily: INTER,
                fontSize: '14px',
                color: C.ivory,
                display: 'block',
                marginBottom: '10px',
              }}
            >
              Client Portal Login →
            </Link>
            <p
              style={{
                fontFamily: INTER,
                fontSize: '13px',
                lineHeight: 1.6,
                color: 'rgba(248,245,239,0.5)',
                maxWidth: '200px',
              }}
            >
              Existing clients: sign in to access documents, residents, and compliance tools.
            </p>
          </div>

          {/* Legal column */}
          <div>
            <p
              style={{
                fontFamily: INTER,
                fontWeight: 600,
                fontSize: '11px',
                color: C.gold,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}
            >
              Legal
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {LEGAL_ITEMS.map(item => (
                <li key={item}>
                  <span
                    style={{
                      fontFamily: INTER,
                      fontSize: '14px',
                      color: 'rgba(248,245,239,0.45)',
                      cursor: 'default',
                    }}
                    title="Coming soon"
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* POPIA notice strip */}
      <div
        style={{
          borderTop: '1px solid rgba(248,245,239,0.1)',
          borderBottom: '1px solid rgba(248,245,239,0.1)',
        }}
      >
        <div
          className="max-w-7xl mx-auto py-5"
          style={{
            fontFamily: INTER,
            fontSize: '12px',
            lineHeight: 1.6,
            color: 'rgba(248,245,239,0.38)',
            textAlign: 'center',
          }}
        >
          Personal information is collected and processed in accordance with the{' '}
          <strong style={{ color: 'rgba(248,245,239,0.5)', fontWeight: 500 }}>
            Protection of Personal Information Act (POPIA), Act 4 of 2013
          </strong>
          . All resident data is treated as confidential. This platform does not constitute medical advice.
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p
          style={{
            fontFamily: INTER,
            fontSize: '13px',
            color: 'rgba(248,245,239,0.4)',
          }}
        >
          &copy; {year} Innerframe Care Solutions. All rights reserved.
        </p>
        <p
          style={{
            fontFamily: INTER,
            fontSize: '13px',
            color: 'rgba(248,245,239,0.3)',
          }}
        >
          Built by <span style={{ color: 'rgba(248,245,239,0.45)' }}>Cortex Analytics</span> · South Africa
        </p>
      </div>
    </footer>
  )
}
