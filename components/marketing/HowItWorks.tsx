import { useReveal } from '@/lib/hooks/useReveal'

const STEPS = [
  {
    number: '01',
    title: 'Assess',
    subtitle: 'Full Facility Evaluation',
    description:
      'A comprehensive review of all five pillars — identifying compliance gaps, operational weaknesses, and documentation risks before anything else.',
  },
  {
    number: '02',
    title: 'Structure',
    subtitle: 'Build Your Systems',
    description:
      'We create the files, policies, controls, and workflows your facility needs. Every document is DSD-compliant and tailored to your specific context.',
  },
  {
    number: '03',
    title: 'Implement',
    subtitle: 'Train, Monitor & Sustain',
    description:
      'We train your staff, monitor the new systems, and give you the tools to maintain compliance long after the initial engagement ends.',
  },
]

export function HowItWorks() {
  const { ref, visible } = useReveal()

  return (
    <section
      id="how-it-works"
      className="py-24 px-6"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="max-w-6xl mx-auto" ref={ref}>

        {/* Section heading */}
        <div className={`text-center mb-16 reveal-section${visible ? ' is-visible' : ''}`}>
          <h2
            className="gold-underline inline-block"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 600,
              fontSize: 'clamp(28px, 3vw, 36px)',
              color: '#334739',
              lineHeight: 1.15,
            }}
          >
            How It Works
          </h2>
          <p
            className="mt-6 text-base max-w-lg mx-auto"
            style={{ color: '#5a5a5a', lineHeight: 1.7 }}
          >
            A structured three-step process that transforms your facility from reactive
            to audit-ready.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={`relative flex flex-col items-center text-center reveal-section delay-${(i + 1) * 100}${visible ? ' is-visible' : ''}`}
            >
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="hidden md:block absolute"
                  style={{
                    top: '28px',
                    left: 'calc(50% + 36px)',
                    right: 'calc(-50% + 36px)',
                    height: '1px',
                    backgroundColor: '#ddd6c8',
                  }}
                />
              )}

              {/* Step number circle */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '1.5px solid #d3b24b',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontWeight: 600,
                    fontSize: '18px',
                    color: '#d3b24b',
                  }}
                >
                  {step.number}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 600,
                  fontSize: 'clamp(20px, 2.2vw, 24px)',
                  color: '#334739',
                  marginBottom: '6px',
                  lineHeight: 1.2,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Outfit', system-ui, sans-serif",
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#d3b24b',
                  letterSpacing: '0.04em',
                  marginBottom: '14px',
                  textTransform: 'uppercase',
                }}
              >
                {step.subtitle}
              </p>
              <p
                style={{
                  fontFamily: "'Outfit', system-ui, sans-serif",
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: '#5a5a5a',
                  maxWidth: '280px',
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Outcome strip */}
        <div
          className={`mt-16 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 reveal-section delay-400${visible ? ' is-visible' : ''}`}
          style={{
            backgroundColor: '#334739',
            border: '1px solid rgba(212,175,55,0.25)',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "'Outfit', system-ui, sans-serif",
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#d3b24b',
                marginBottom: '8px',
              }}
            >
              The Innerframe Outcome
            </p>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 600,
                fontSize: 'clamp(20px, 2vw, 24px)',
                color: '#faf7f0',
                lineHeight: 1.2,
              }}
            >
              Structured. Compliant. Compassionate.
            </h3>
          </div>
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
