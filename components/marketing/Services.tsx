import { useState } from 'react'
import {
  Shield,
  FileCheck,
  Settings2,
  TrendingUp,
  Users,
  Compass,
} from 'lucide-react'

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

const SERVICES = [
  {
    Icon: Shield,
    title: 'Governance & Board Support',
    description:
      'Board structure design, accountability frameworks, risk management, and the governance systems that give leadership clarity and confidence.',
  },
  {
    Icon: FileCheck,
    title: 'Regulatory Compliance',
    description:
      'Full DSD alignment, POPIA compliance, inspection readiness, and the documentation frameworks that keep your facility inspection-ready year-round.',
  },
  {
    Icon: Settings2,
    title: 'Operational Structure',
    description:
      'Policies, processes, workflows, and quality-management systems tailored to your facility — built to run reliably without constant intervention.',
  },
  {
    Icon: TrendingUp,
    title: 'Financial Sustainability',
    description:
      'Budget planning, DSD funding documentation, financial controls, and the reporting tools that keep your organisation financially sound.',
  },
  {
    Icon: Users,
    title: 'Staff Development',
    description:
      'HR frameworks, training programmes, performance management, and workforce-retention strategies that support your people and reduce turnover.',
  },
  {
    Icon: Compass,
    title: 'Strategic Advisory',
    description:
      'Long-term growth planning, partnership development, stakeholder engagement, and the strategic direction that builds a sustainable future.',
  },
]

export function Services() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section
      id="services"
      style={{
        backgroundColor: C.ivory,
        paddingTop: 'clamp(80px, 10vw, 120px)',
        paddingBottom: 'clamp(80px, 10vw, 120px)',
      }}
      className="px-6"
    >
      <div className="max-w-7xl mx-auto">

        {/* Section heading — split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end mb-16">
          <div>
            <h2
              style={{
                fontFamily: CORMORANT,
                fontWeight: 600,
                fontSize: 'clamp(32px, 4vw, 42px)',
                lineHeight: 1.15,
                color: C.slate,
                marginBottom: '16px',
                textWrap: 'balance',
              } as React.CSSProperties}
            >
              What we do
            </h2>
            <div style={{ width: '36px', height: '2px', backgroundColor: C.gold }} />
          </div>
          <div>
            <p
              style={{
                fontFamily: INTER,
                fontSize: '18px',
                lineHeight: 1.75,
                color: C.slate,
                opacity: 0.78,
              }}
            >
              Six areas of practice, each addressing a critical dimension of care-organisation management. Applied together, they create the operational foundation that excellent care requires.
            </p>
          </div>
        </div>

        {/* Service list — editorial horizontal rules, no cards */}
        <div style={{ borderTop: '1px solid rgba(200,212,200,0.7)' }}>
          {SERVICES.map(({ Icon, title, description }, index) => (
            <article
              key={title}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              style={{
                borderBottom: '1px solid rgba(200,212,200,0.7)',
                padding: 'clamp(28px, 3vw, 40px) 0',
                backgroundColor: hovered === index ? 'rgba(200,212,200,0.12)' : 'transparent',
                transition: 'background-color 200ms ease',
              }}
            >
              {/*
               * Mobile:  icon + title side by side (top row), description full-width below
               * Desktop: icon | title | description — 3-column grid
               *
               * Achieved with:
               *   grid-cols-[auto_1fr]      → mobile: icon / title
               *   description: col-span-2   → mobile: spans both cols
               *   lg:grid-cols-[40px_1fr_1.4fr] → desktop: 3 equal-weight columns
               *   lg:col-span-1             → description back to 1 col on desktop
               */}
              <div
                className="grid grid-cols-[auto_1fr] lg:grid-cols-[40px_1fr_1.4fr] gap-x-5 gap-y-3 lg:gap-x-10 lg:items-center"
              >
                <Icon
                  size={22}
                  strokeWidth={1.5}
                  style={{ color: C.evergreen }}
                  aria-hidden="true"
                />
                <h3
                  style={{
                    fontFamily: CORMORANT,
                    fontWeight: 600,
                    fontSize: 'clamp(22px, 2.2vw, 26px)',
                    lineHeight: 1.2,
                    color: C.slate,
                    textWrap: 'balance',
                  } as React.CSSProperties}
                >
                  {title}
                </h3>
                <p
                  className="col-span-2 lg:col-span-1"
                  style={{
                    fontFamily: INTER,
                    fontSize: '15px',
                    lineHeight: 1.75,
                    color: C.slate,
                    opacity: 0.82,
                  }}
                >
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* CTA strip */}
        <div
          style={{
            marginTop: '56px',
            paddingTop: '40px',
            borderTop: '1px solid rgba(200,212,200,0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '16px',
          }}
        >
          <p
            style={{
              fontFamily: INTER,
              fontSize: '18px',
              lineHeight: 1.6,
              color: C.slate,
              opacity: 0.80,
              maxWidth: '520px',
            }}
          >
            Not sure which services apply to your organisation? Start with a no-obligation assessment.
          </p>
          <a
            href="#contact"
            style={{
              fontFamily: INTER,
              fontWeight: 600,
              fontSize: '15px',
              backgroundColor: C.evergreen,
              color: '#ffffff',
              borderRadius: '12px',
              padding: '13px 28px',
              display: 'inline-block',
              transition: 'background-color 150ms ease',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#3A5445')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = C.evergreen)}
          >
            Request an Assessment
          </a>
        </div>

      </div>
    </section>
  )
}
