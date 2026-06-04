import { Check } from 'lucide-react'
import { useReveal } from '@/lib/hooks/useReveal'

const AUDIENCES = [
  {
    title: 'Registered Old Age Homes',
    description:
      'Facilities registered with the Department of Social Development that need to maintain DSD compliance and pass regular inspections.',
    checks: [
      'DSD compliance documentation',
      'Audit-ready file structures',
      'Staff and resident file management',
      'Section 20 and 21 requirements',
    ],
  },
  {
    title: 'Care Facility Managers',
    description:
      'Managers responsible for day-to-day operations who need proper systems built — and the training to maintain them independently.',
    checks: [
      'Operational control frameworks',
      'Staff training materials',
      'Incident and complaint management',
      'Monthly reporting packs',
    ],
  },
  {
    title: 'NPO and Church-Run Facilities',
    description:
      'Non-profit and faith-based organisations running care homes who need governance structures and financial accountability.',
    checks: [
      'Board governance frameworks',
      'Financial transparency tools',
      'DSD funding documentation',
      'Sustainability planning',
    ],
  },
]

export function WhoItsFor() {
  const { ref, visible } = useReveal()

  return (
    <section
      id="who-its-for"
      className="py-24 px-6"
      style={{ backgroundColor: '#faf7f0' }}
    >
      <div className="max-w-6xl mx-auto" ref={ref}>

        {/* Heading */}
        <div className={`text-center mb-14 reveal-section${visible ? ' is-visible' : ''}`}>
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
            Built for South African Care Facilities
          </h2>
          <p
            className="mt-6 text-base max-w-xl mx-auto"
            style={{ color: '#5a5a5a', lineHeight: 1.7 }}
          >
            Innerframe was designed for the South African context — DSD regulations,
            ZAR-denominated operations, and the unique challenges facing our
            country&apos;s care homes.
          </p>
        </div>

        {/* Audience cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AUDIENCES.map((audience, i) => (
            <div
              key={audience.title}
              className={`bg-white rounded-xl p-7 border reveal-section delay-${(i + 1) * 100}${visible ? ' is-visible' : ''}`}
              style={{
                borderColor: '#ddd6c8',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
              }}
            >
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 600,
                  fontSize: 'clamp(18px, 2vw, 21px)',
                  color: '#334739',
                  lineHeight: 1.2,
                  marginBottom: '12px',
                }}
              >
                {audience.title}
              </h3>
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: '#5a5a5a' }}
              >
                {audience.description}
              </p>
              <ul className="space-y-2.5">
                {audience.checks.map(check => (
                  <li key={check} className="flex items-start gap-2.5 text-sm" style={{ color: '#1a1a1a' }}>
                    <Check
                      size={13}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: '#d3b24b' }}
                      aria-hidden="true"
                    />
                    {check}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* SA context note */}
        <div
          className={`mt-10 rounded-xl p-6 border flex items-start gap-5 reveal-section delay-400${visible ? ' is-visible' : ''}`}
          style={{
            borderColor: 'rgba(212,175,55,0.35)',
            backgroundColor: 'rgba(212,175,55,0.04)',
          }}
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '24px',
              lineHeight: 1,
              flexShrink: 0,
              marginTop: '2px',
            }}
          >
            🇿🇦
          </div>
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: '#334739', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
              Proudly South African
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#5a5a5a' }}>
              We understand the DSD funding model, Section 20 and 21 requirements,
              local labour law, POPIA compliance, and the everyday realities of running a
              care facility in South Africa.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
