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
      'Policies, processes, workflows, and quality-management systems tailored to your facility — built to run without constant intervention.',
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
              }}
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
                opacity: 0.72,
              }}
            >
              Six areas of practice, each addressing a critical dimension of care-organisation management. Applied together, they create the operational foundation that excellent care requires.
            </p>
          </div>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map(({ Icon, title, description }) => (
            <article
              key={title}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid rgba(200,212,200,0.5)',
                boxShadow: '0 2px 8px rgba(73,99,83,0.06), 0 8px 24px rgba(73,99,83,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(200,212,200,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={20} strokeWidth={1.5} style={{ color: C.evergreen }} aria-hidden="true" />
              </div>

              <div>
                {/* Thin gold rule accent */}
                <div style={{ width: '24px', height: '1.5px', backgroundColor: C.gold, marginBottom: '12px' }} />
                <h3
                  style={{
                    fontFamily: CORMORANT,
                    fontWeight: 600,
                    fontSize: '22px',
                    lineHeight: 1.25,
                    color: C.slate,
                    marginBottom: '12px',
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    fontFamily: INTER,
                    fontSize: '15px',
                    lineHeight: 1.7,
                    color: C.slate,
                    opacity: 0.72,
                  }}
                >
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* CTA below cards */}
        <div
          style={{
            marginTop: '56px',
            paddingTop: '40px',
            borderTop: `1px solid rgba(200,212,200,0.6)`,
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
              opacity: 0.7,
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
