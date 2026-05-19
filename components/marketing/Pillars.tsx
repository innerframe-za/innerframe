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
    description:
      'Policies, staff files, resident records, daily registers, compliance systems, and audit-ready documentation.',
  },
  {
    icon: DollarSign,
    name: 'Finance',
    tagline: 'Financial Transparency & Sustainability',
    description:
      'Budgeting, DSD allocation tracking, payroll controls, procurement workflows, and monthly reporting packs.',
  },
  {
    icon: UtensilsCrossed,
    name: 'Kitchen',
    tagline: 'Safe Nutrition. Safe Residents.',
    description:
      'Meal planning, food safety logs, temperature controls, hygiene standards, and special dietary monitoring.',
  },
  {
    icon: Stethoscope,
    name: 'Medical',
    tagline: 'Resident Safety & Clinical Compliance',
    description:
      'Medication management, care plans, incident reporting, infection control, and nursing documentation systems.',
  },
  {
    icon: Scale,
    name: 'Board Governance',
    tagline: 'Leadership, Accountability & Sustainability',
    description:
      'Board structure, meeting schedules, risk registers, strategic plans, and DSD reporting oversight.',
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
      style={{ backgroundColor: 'var(--color-if-bg)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-14">
          <div className="inline-block">
            <h2
              className="text-3xl font-medium gold-underline"
              style={{ color: 'var(--color-if-text-heading)' }}
            >
              The 5 Pillars
            </h2>
          </div>
          <p
            className="mt-6 text-base max-w-xl mx-auto"
            style={{ color: 'var(--color-if-text-muted)' }}
          >
            Every well-run care facility needs five operational foundations.
            Innerframe assesses, structures, and implements all five — so
            nothing falls through the cracks.
          </p>
        </div>

        {/* Pillar cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon
            return (
              <article
                key={pillar.name}
                className="bg-white rounded-xl p-6 border transition-transform hover:-translate-y-0.5"
                style={{
                  borderColor: 'var(--color-if-border)',
                  borderTopWidth: '3px',
                  /* Alternate top border: primary green on even, gold on odd */
                  borderTopColor: index % 2 === 0 ? 'var(--color-if-primary)' : 'var(--color-if-gold-text)',
                  boxShadow: '0 1px 3px var(--color-if-shadow), 0 4px 12px var(--color-if-shadow)',
                }}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(47, 67, 55, 0.07)' }}
                >
                  <Icon
                    size={20}
                    style={{ color: 'var(--color-if-primary)' }}
                    aria-hidden="true"
                  />
                </div>

                {/* Content */}
                <h3
                  className="font-medium text-base mb-1"
                  style={{ color: 'var(--color-if-primary)' }}
                >
                  {pillar.name}
                </h3>
                <p
                  className="text-xs mb-3 font-medium"
                  style={{ color: 'var(--color-if-gold-text)' }}
                >
                  {pillar.tagline}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-if-text-muted)' }}>
                  {pillar.description}
                </p>
              </article>
            )
          })}

          {/* Sixth card fills the grid row cleanly */}
          <div
            className="hidden lg:block rounded-xl p-6 border"
            style={{
              borderColor: 'var(--color-if-border)',
              backgroundColor: 'rgba(47, 67, 55, 0.03)',
            }}
          >
            <div className="h-full flex flex-col justify-center text-center px-4">
              <div
                className="text-3xl font-medium mb-3"
                style={{ color: 'var(--color-if-text-heading)' }}
              >
                5
              </div>
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--color-if-primary)' }}
              >
                Interconnected pillars
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--color-if-text-muted)' }}>
                Every pillar strengthens the others. Weakness in one creates
                risk across all.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
