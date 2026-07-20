import { Home, ShieldCheck, HeartHandshake, Sprout } from 'lucide-react'

const C = {
  evergreen: '#496353',
  sage: '#78907C',
  sageSoft: '#C8D4C8',
  gold: '#B89C69',
  ivory: '#F8F5EF',
  slate: '#38423D',
}

const INTER = "'Inter', system-ui, sans-serif"
const CORMORANT = "'Cormorant Garamond', Georgia, serif"

const PILLARS = [
  { Icon: Home,           label: 'Structure'   },
  { Icon: ShieldCheck,    label: 'Compliance'  },
  { Icon: HeartHandshake, label: 'Support'     },
  { Icon: Sprout,         label: 'Growth'      },
]



export function Hero() {
  return (
    <section
      id="hero"
      style={{ backgroundColor: C.ivory, minHeight: 'calc(100vh - 72px)' }}
      className="relative overflow-hidden px-6 flex items-center"
    >
      <div
        className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center pt-8 pb-16 lg:pt-10 lg:pb-24"
        style={{ position: 'relative', zIndex: 1 }}
      >

        {/* ── LEFT: content ── */}
        <div>

          {/* Mobile: logo centred above the text (Logo_Transparent already contains the leaf) */}
          <div className="lg:hidden mb-10 flex justify-center">
            <img
              src="/logo-full.jpeg"
              alt="Innerframe Care Solutions"
              style={{ width: 'min(340px, 88vw)', height: 'auto' }}
            />
          </div>

          {/* Gold accent rule */}
          <div
            style={{
              width: '40px',
              height: '2px',
              backgroundColor: C.gold,
              marginBottom: '28px',
            }}
          />

          {/* H1 — roman + italic gold */}
          <h1
            style={{
              fontFamily: CORMORANT,
              fontWeight: 600,
              fontSize: 'clamp(40px, 5.2vw, 62px)',
              lineHeight: 1.12,
              color: C.slate,
              marginBottom: '24px',
            } as React.CSSProperties}
          >
            Building the foundation for{' '}
            <em style={{ color: C.gold, fontStyle: 'italic' }}>
              care that lasts.
            </em>
          </h1>

          {/* Body */}
          <p
            style={{
              fontFamily: INTER,
              fontWeight: 400,
              fontSize: '17px',
              lineHeight: 1.78,
              color: C.slate,
              opacity: 0.78,
              maxWidth: '460px',
              marginBottom: '36px',
            }}
          >
            We partner with care organisations to strengthen structures, ensure
            compliance, and support sustainable growth.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4" style={{ marginBottom: '52px' }}>
            <a
              href="#contact"
              style={{
                fontFamily: INTER,
                fontWeight: 600,
                fontSize: '16px',
                backgroundColor: C.evergreen,
                color: '#ffffff',
                borderRadius: '12px',
                padding: '14px 32px',
                display: 'inline-block',
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = '#3A5445')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = C.evergreen)
              }
            >
              Book a Consultation
            </a>
            <a
              href="#services"
              style={{
                fontFamily: INTER,
                fontWeight: 500,
                fontSize: '16px',
                border: `1.5px solid ${C.evergreen}`,
                color: C.evergreen,
                backgroundColor: 'transparent',
                borderRadius: '12px',
                padding: '14px 32px',
                display: 'inline-block',
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLElement).style.backgroundColor =
                  'rgba(200,212,200,0.35)')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')
              }
            >
              Our Services
            </a>
          </div>

          {/* 4-pillar strip — grid keeps all 4 in one row at every width */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {PILLARS.map(({ Icon, label }, i) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '7px',
                  paddingLeft: i > 0 ? '12px' : 0,
                  borderLeft: i > 0 ? '1px solid rgba(73,99,83,0.22)' : 'none',
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  style={{ color: C.evergreen }}
                  aria-hidden="true"
                />
                <span
                  style={{
                    fontFamily: INTER,
                    fontWeight: 600,
                    fontSize: '10px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: C.slate,
                    opacity: 0.70,
                    textAlign: 'center',
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: large logo + leaf anchored to this column (desktop only) ── */}
        <div className="hidden lg:flex items-center justify-center" style={{ position: 'relative', zIndex: 1 }}>
          {/* Leaf anchored to the column's top-right — moves with content, not the viewport */}
          <div
            style={{ position: 'absolute', top: 0, right: 0, zIndex: 2, pointerEvents: 'none' }}
            aria-hidden="true"
          >
            <img
              src="/leaf-branch.png"
              alt=""
              style={{ width: '420px', height: 'auto', display: 'block' }}
            />
          </div>
          <img
            src="/logo_without_leav.png"
            alt="Innerframe Care Solutions"
            style={{ width: '150%', height: 'auto', display: 'block', position: 'relative', zIndex: 1, marginTop: '60px' }}
          />
        </div>

      </div>
    </section>
  )
}
