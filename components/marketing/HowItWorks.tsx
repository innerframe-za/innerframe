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

const STEPS = [
  {
    number: '01',
    title: 'Assess',
    subtitle: 'Full Facility Evaluation',
    description:
      'A comprehensive assessment across all operational areas — governance, compliance, finance, staffing, and systems. We identify gaps, risks, and opportunities before recommending anything.',
  },
  {
    number: '02',
    title: 'Structure',
    subtitle: 'Build Your Frameworks',
    description:
      'We design and implement the policies, controls, documentation, and workflows your organisation needs. Every framework is DSD-aligned and tailored to your specific context.',
  },
  {
    number: '03',
    title: 'Sustain',
    subtitle: 'Monitor, Train & Support',
    description:
      'Ongoing coaching, staff training, periodic reviews, and continuous improvement to ensure your systems stay effective long after the initial engagement ends.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-we-work"
      style={{
        backgroundColor: '#ffffff',
        paddingTop: 'clamp(80px, 10vw, 120px)',
        paddingBottom: 'clamp(80px, 10vw, 120px)',
      }}
      className="px-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div style={{ marginBottom: '72px' }}>
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
            How we work
          </h2>
          <div style={{ width: '36px', height: '2px', backgroundColor: C.gold, marginBottom: '20px' }} />
          <p
            style={{
              fontFamily: INTER,
              fontSize: '18px',
              lineHeight: 1.75,
              color: C.slate,
              opacity: 0.72,
              maxWidth: '520px',
            }}
          >
            A structured three-phase process that moves your organisation from where it is to where it needs to be.
          </p>
        </div>

        {/* Steps — horizontal on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {STEPS.map((step, index) => (
            <div
              key={step.number}
              style={{
                paddingRight: index < STEPS.length - 1 ? 'clamp(24px, 4vw, 48px)' : '0',
                paddingBottom: index < STEPS.length - 1 ? '48px' : '0',
              }}
              className={
                [
                  index > 0 ? 'md:pl-12' : '',
                  index > 0 ? 'pt-12 md:pt-0 border-t md:border-t-0' : '',
                  index < STEPS.length - 1 ? 'md:border-r' : '',
                ].join(' ')
              }
            >
              {/* Step number */}
              <div style={{ marginBottom: '24px' }}>
                <span
                  style={{
                    fontFamily: CORMORANT,
                    fontWeight: 600,
                    fontSize: '48px',
                    lineHeight: 1,
                    color: C.gold,
                    opacity: 0.6,
                  }}
                >
                  {step.number}
                </span>
              </div>

              {/* Content */}
              <h3
                style={{
                  fontFamily: CORMORANT,
                  fontWeight: 600,
                  fontSize: '28px',
                  lineHeight: 1.2,
                  color: C.slate,
                  marginBottom: '8px',
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: INTER,
                  fontWeight: 500,
                  fontSize: '13px',
                  color: C.gold,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}
              >
                {step.subtitle}
              </p>
              <p
                style={{
                  fontFamily: INTER,
                  fontSize: '16px',
                  lineHeight: 1.75,
                  color: C.slate,
                  opacity: 0.72,
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Outcome strip */}
        <div
          style={{
            marginTop: '72px',
            backgroundColor: C.ivory,
            borderRadius: '20px',
            padding: '40px 48px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '32px',
            flexWrap: 'wrap',
            border: `1px solid rgba(200,212,200,0.5)`,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: INTER,
                fontWeight: 500,
                fontSize: '12px',
                color: C.gold,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              The Innerframe outcome
            </p>
            <h3
              style={{
                fontFamily: CORMORANT,
                fontWeight: 600,
                fontSize: '26px',
                lineHeight: 1.3,
                color: C.slate,
              }}
            >
              Structured. Compliant. Sustainable.
            </h3>
          </div>
          <a
            href="#contact"
            style={{
              fontFamily: INTER,
              fontWeight: 600,
              fontSize: '15px',
              flexShrink: 0,
              backgroundColor: C.evergreen,
              color: '#ffffff',
              borderRadius: '12px',
              padding: '14px 28px',
              display: 'inline-block',
              transition: 'background-color 150ms ease',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#3A5445')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = C.evergreen)}
          >
            Start the Assessment
          </a>
        </div>
      </div>
    </section>
  )
}
