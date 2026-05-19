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
      className="py-20 px-6"
      style={{ backgroundColor: '#F5F0E8' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-14">
          <div className="inline-block">
            <h2
              className="text-3xl font-medium gold-underline"
              style={{ color: '#1E3A2F' }}
            >
              The 5 Pillars
            </h2>
          </div>
          <p
            className="mt-6 text-base max-w-xl mx-auto"
            style={{ color: '#5a5a5a' }}
          >
            Every well-run care facility needs five operational foundations.
            Innerframe assesses, structures, and implements all five — so
            nothing falls through the cracks.
          </p>
        </div>

        {/* Pillar cards grid — all 5 side by side on large screens */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon
            return (
              <article
                key={pillar.name}
                className="bg-white rounded-xl p-6 border transition-transform hover:-translate-y-0.5 flex flex-col"
                style={{
                  borderColor: '#ddd6c8',
                  borderTopWidth: '3px',
                  borderTopColor: index % 2 === 0 ? '#1E3A2F' : '#D4AF37',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
                  minHeight: '340px',
                }}
              >
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-5"
                  style={{ backgroundColor: 'rgba(30,58,47,0.07)' }}
                >
                  <Icon
                    size={22}
                    style={{ color: '#1E3A2F' }}
                    aria-hidden="true"
                  />
                </div>

                {/* Content */}
                <h3
                  className="font-semibold text-sm mb-1"
                  style={{ color: '#1E3A2F' }}
                >
                  {pillar.name}
                </h3>
                <p
                  className="text-xs mb-4 font-medium leading-snug"
                  style={{ color: '#D4AF37' }}
                >
                  {pillar.tagline}
                </p>

                {/* Bullet points */}
                <ul className="mt-auto space-y-2">
                  {pillar.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-xs leading-snug"
                      style={{ color: '#5a5a5a' }}
                    >
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: '#1E3A2F' }}
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
