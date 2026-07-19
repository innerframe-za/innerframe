'use client'
import {
  ClipboardList,
  DollarSign,
  UtensilsCrossed,
  Stethoscope,
  Scale,
} from 'lucide-react'

const pillars = [
  {
    icon: ClipboardList,
    name: 'Admin Office',
    tagline: 'The Structure Behind the Facility',
    points: [
      'Policies & staff files',
      'Resident records',
      'Daily registers',
      'Compliance systems',
      'Audit-ready documentation',
    ],
  },
  {
    icon: DollarSign,
    name: 'Finance',
    tagline: 'Financial Transparency & Sustainability',
    points: [
      'Budgeting',
      'DSD allocation tracking',
      'Payroll controls',
      'Procurement workflows',
      'Monthly reporting packs',
    ],
  },
  {
    icon: UtensilsCrossed,
    name: 'Kitchen',
    tagline: 'Safe Nutrition. Safe Residents.',
    points: [
      'Meal planning',
      'Food safety logs',
      'Temperature controls',
      'Hygiene standards',
      'Special dietary monitoring',
    ],
  },
  {
    icon: Stethoscope,
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
    icon: Scale,
    name: 'Board Governance',
    tagline: 'Leadership, Accountability & Sustainability',
    points: [
      'Board structure',
      'Meeting schedules',
      'Risk registers',
      'Strategic plans',
      'DSD reporting oversight',
    ],
  },
]

/**
 * The 5 Pillars section — showcases Innerframe's core service areas.
 */
export function Pillars() {
  return (
    <section
      id="pillars"
      className="py-16 px-6"
      style={{ backgroundColor: '#faf7f0' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section heading — split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-end mb-12">
          <div>
            <h2
              className="text-3xl font-semibold"
              style={{ color: '#334739', fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'normal' }}
            >
              The 5 Pillars
            </h2>
          </div>
          <div>
            <p
              className="text-base"
              style={{ color: '#5a5a5a' }}
            >
              Every well-run care facility needs five operational foundations.
              Innerframe assesses, structures, and implements all five — so
              nothing falls through the cracks.
            </p>
          </div>
        </div>

        {/* Pillar cards grid — all 5 side by side on large screens */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon
            return (
              <article
                key={pillar.name}
                className="bg-white rounded-xl p-6 border transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 flex flex-col"
                style={{
                  borderColor: '#ddd6c8',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
                  minHeight: '320px',
                }}
              >
                {/* Icon with alternating brand colors */}
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-5"
                  style={{
                    backgroundColor: index % 2 === 0 ? '#334739' : '#d3b24b',
                  }}
                >
                  <Icon
                    size={22}
                    style={{ color: index % 2 === 0 ? '#faf7f0' : '#334739' }}
                    aria-hidden="true"
                  />
                </div>

                {/* Content */}
                <h3
                  className="font-semibold mb-1"
                  style={{ color: '#334739', fontFamily: "'Outfit', system-ui, sans-serif", fontSize: '17px' }}
                >
                  {pillar.name}
                </h3>
                <p
                  className="text-xs mb-2 font-medium leading-snug"
                  style={{ color: '#d3b24b' }}
                >
                  {pillar.tagline}
                </p>

                {/* Bullet points */}
                <ul className="mt-2 space-y-2">
                  {pillar.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-xs leading-snug"
                      style={{ color: '#5a5a5a' }}
                    >
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: '#334739' }}
                        aria-hidden="true"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
