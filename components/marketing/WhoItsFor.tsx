import { Check } from 'lucide-react'

const audiences = [
  {
    title: 'Registered Old Age Homes',
    description:
      'Facilities registered with the Department of Social Development that need to maintain DSD compliance and pass regular inspections.',
    checks: [
      'DSD compliance documentation',
      'Audit-ready file structures',
      'Staff and resident file management',
      'Section 20 & 21 requirements',
    ],
  },
  {
    title: 'Care Facility Managers',
    description:
      'Managers who are responsible for day-to-day operations but lack the time or expertise to build proper systems from scratch.',
    checks: [
      'Operational control frameworks',
      'Staff training materials',
      'Incident & complaint management',
      'Monthly reporting packs',
    ],
  },
  {
    title: 'NPO & Church-Run Facilities',
    description:
      'Non-profit and faith-based organisations running care homes who need governance structures and financial accountability systems.',
    checks: [
      'Board governance frameworks',
      'Financial transparency tools',
      'DSD funding documentation',
      'Sustainability planning',
    ],
  },
]

/**
 * "Built for South African Care Facilities" section —
 * highlights the three primary target audiences.
 */
export function WhoItsFor() {
  return (
    <section
      id="who-its-for"
      className="py-20 px-6"
      style={{ backgroundColor: 'var(--color-if-bg)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <div className="inline-block">
            <h2
              className="text-3xl font-medium gold-underline"
              style={{ color: 'var(--color-if-text-heading)' }}
            >
              Built for South African Care Facilities
            </h2>
          </div>
          <p
            className="mt-6 text-base max-w-xl mx-auto"
            style={{ color: 'var(--color-if-text-muted)' }}
          >
            Innerframe was designed specifically for the South African context —
            DSD regulations, ZAR-denominated operations, and the unique
            challenges facing our country&apos;s care homes.
          </p>
        </div>

        {/* Audience cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {audiences.map(audience => (
            <div
              key={audience.title}
              className="bg-white rounded-xl p-6 border"
              style={{
                borderColor: 'var(--color-if-border)',
                boxShadow: '0 1px 3px var(--color-if-shadow), 0 4px 12px var(--color-if-shadow)',
              }}
            >
              <h3
                className="font-medium text-base mb-3"
                style={{ color: 'var(--color-if-primary)' }}
              >
                {audience.title}
              </h3>
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: 'var(--color-if-text-muted)' }}
              >
                {audience.description}
              </p>
              <ul className="space-y-2">
                {audience.checks.map(check => (
                  <li
                    key={check}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: 'var(--color-if-text)' }}
                  >
                    <Check
                      size={14}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: 'var(--color-if-gold-text)' }}
                      aria-hidden="true"
                    />
                    {check}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Context strip */}
        <div
          className="mt-12 rounded-xl p-6 border flex flex-col md:flex-row items-start md:items-center gap-4"
          style={{
            borderColor: 'rgba(211, 178, 75, 0.4)',
            backgroundColor: 'rgba(211, 178, 75, 0.05)',
          }}
        >
          <div
            className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg"
            style={{ backgroundColor: 'rgba(211, 178, 75, 0.15)' }}
            aria-hidden="true"
          >
            🇿🇦
          </div>
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-if-primary)' }}
            >
              Proudly South African
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-if-text-muted)' }}>
              We understand the DSD funding model, Section 20 & 21 requirements,
              local labour law, and the everyday realities of running a care
              facility in South Africa.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
