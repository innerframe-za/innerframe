import { useReveal } from '@/lib/hooks/useReveal'

const PILLARS = [
  {
    name: 'Admin Office',
    tagline: 'The Structure Behind the Facility',
    points: [
      'Policies & procedures',
      'Staff file management',
      'Resident records',
      'Daily operational registers',
      'Audit-ready documentation',
    ],
  },
  {
    name: 'Finance',
    tagline: 'Financial Transparency & Sustainability',
    points: [
      'Budgeting & cash flow',
      'DSD allocation tracking',
      'Payroll controls',
      'Procurement workflows',
      'Monthly reporting packs',
    ],
  },
  {
    name: 'Kitchen',
    tagline: 'Safe Nutrition. Safe Residents.',
    points: [
      'Meal planning & menus',
      'Food safety logs',
      'Temperature monitoring',
      'Hygiene schedules',
      'Special dietary monitoring',
    ],
  },
  {
    name: 'Medical',
    tagline: 'Resident Safety & Clinical Compliance',
    points: [
      'Medication management',
      'Care plans',
      'Incident reporting',
      'Infection control',
      'Nursing documentation',
    ],
  },
  {
    name: 'Board Governance',
    tagline: 'Leadership, Accountability & Sustainability',
    points: [
      'Board structure',
      'Meeting schedules & minutes',
      'Risk registers',
      'Strategic plans',
      'DSD reporting oversight',
    ],
  },
]

export function Pillars() {
  const { ref, visible } = useReveal()

  return (
    <section
      id="pillars"
      style={{ backgroundColor: '#334739', padding: 'clamp(64px, 8vw, 100px) 0' }}
    >
      <div className="max-w-6xl mx-auto px-6" ref={ref}>

        {/* Section header */}
        <div
          className={`reveal-section${visible ? ' is-visible' : ''}`}
          style={{ marginBottom: 'clamp(40px, 6vw, 64px)' }}
        >
          <h2
            className="gold-underline"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 600,
              fontSize: 'clamp(28px, 3.5vw, 38px)',
              color: '#faf7f0',
              lineHeight: 1.15,
            }}
          >
            Five Pillars of Operational Excellence
          </h2>
          <p
            style={{
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'rgba(250,247,240,0.6)',
              marginTop: '20px',
              maxWidth: '520px',
            }}
          >
            Every well-run care facility needs five operational foundations.
            Innerframe assesses, structures, and implements all five.
          </p>
        </div>

        {/* Pillar rows */}
        <div>
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.name}
              className={`reveal-section delay-${Math.min((i + 1) * 100, 500)}${visible ? ' is-visible' : ''}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '0',
                borderTop: '1px solid rgba(250,247,240,0.1)',
                padding: 'clamp(24px, 3.5vw, 40px) 0',
              }}
            >
              {/* Inner two-column on md+ */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 'clamp(16px, 3vw, 48px)',
                  alignItems: 'start',
                }}
              >
                {/* Left: name + tagline */}
                <div>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontWeight: 600,
                      fontSize: 'clamp(22px, 2.2vw, 28px)',
                      color: '#faf7f0',
                      lineHeight: 1.2,
                      marginBottom: '8px',
                    }}
                  >
                    {pillar.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Outfit', system-ui, sans-serif",
                      fontSize: '13px',
                      color: '#d3b24b',
                      lineHeight: 1.5,
                    }}
                  >
                    {pillar.tagline}
                  </p>
                </div>

                {/* Right: points in 2-col grid */}
                <ul
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '10px 24px',
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {pillar.points.map(point => (
                    <li
                      key={point}
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '8px',
                        fontFamily: "'Outfit', system-ui, sans-serif",
                        fontSize: '13px',
                        color: 'rgba(250,247,240,0.68)',
                        lineHeight: 1.55,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(211,178,75,0.6)',
                          flexShrink: 0,
                          marginTop: '5px',
                          display: 'inline-block',
                        }}
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {/* Closing rule */}
          <div style={{ borderTop: '1px solid rgba(250,247,240,0.1)' }} />
        </div>

        {/* CTA strip */}
        <div
          className={`reveal-section delay-300${visible ? ' is-visible' : ''}`}
          style={{ marginTop: 'clamp(40px, 5vw, 56px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}
        >
          <p
            style={{
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontSize: '14px',
              color: 'rgba(250,247,240,0.55)',
            }}
          >
            Not sure which pillars need attention first? The assessment tells you.
          </p>
          <a
            href="#contact"
            style={{
              backgroundColor: '#d3b24b',
              color: '#334739',
              borderRadius: '40px',
              padding: '13px 32px',
              fontSize: '14px',
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontWeight: 600,
              textDecoration: 'none',
              flexShrink: 0,
              transition: 'background-color 0.15s ease-out',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#b8972e')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#d3b24b')}
          >
            Start the Assessment
          </a>
        </div>
      </div>
    </section>
  )
}
