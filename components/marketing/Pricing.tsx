import { Check } from 'lucide-react'

const PLANS = [
  {
    name: 'Starter',
    price: 'R 1,200',
    period: 'per month',
    tagline: 'For smaller homes getting structured.',
    residents: 'Up to 30 residents',
    highlight: false,
    features: [
      'Resident profiles & CRM',
      'Staff accounts (up to 10)',
      'Document storage & management',
      'Core compliance tools',
      '5-pillar portal access',
    ],
    cta: 'Get Started',
    href: '#contact',
  },
  {
    name: 'Growth',
    price: 'R 2,200',
    period: 'per month',
    tagline: 'Full compliance, all 5 pillars.',
    residents: '31–80 residents',
    highlight: true,
    features: [
      'Everything in Starter',
      'Advanced reporting & DSD compliance tracking',
      'Unlimited staff accounts',
      'Inspection preparation tools',
      'Multi-pillar workflow management',
    ],
    cta: 'Get Started',
    href: '#contact',
  },
  {
    name: 'Partner',
    price: 'R 3,500',
    period: 'per month',
    tagline: 'Dedicated support and SLA.',
    residents: '80+ residents',
    highlight: false,
    features: [
      'Everything in Growth',
      'Dedicated onboarding support',
      'Priority helpline',
      'SLA-backed uptime guarantee',
      'Quarterly compliance review session',
    ],
    cta: 'Get Started',
    href: '#contact',
  },
]

export function Pricing() {
  return (
    <section
      id="pricing"
      className="py-20 px-6"
      style={{ backgroundColor: '#faf7f0' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-14">
          <div className="inline-block">
            <h2
              className="text-3xl font-semibold gold-underline"
              style={{
                color: '#334739',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: 'normal',
              }}
            >
              Pricing
            </h2>
          </div>
          <p
            className="mt-6 text-base max-w-xl mx-auto"
            style={{ color: '#5a5a5a' }}
          >
            Simple monthly pricing that grows with your facility. Billed via debit order — aligned with your DSD subsidy cycle.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className="rounded-xl p-8 border flex flex-col"
              style={{
                backgroundColor: plan.highlight ? '#334739' : '#ffffff',
                borderColor: plan.highlight ? '#334739' : '#ddd6c8',
                boxShadow: plan.highlight
                  ? '0 8px 32px rgba(51,71,57,0.25)'
                  : '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
              }}
            >
              {/* Plan name */}
              <h3
                className="font-semibold mb-1"
                style={{
                  color: plan.highlight ? '#d3b24b' : '#334739',
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: 'normal',
                  fontSize: '22px',
                }}
              >
                {plan.name}
              </h3>

              {/* Resident range badge */}
              <span
                className="inline-block text-xs font-medium mb-3 px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: plan.highlight ? 'rgba(211,178,75,0.18)' : '#f0ece3',
                  color: plan.highlight ? '#d3b24b' : '#698169',
                }}
              >
                {plan.residents}
              </span>

              <p
                className="text-xs mb-6"
                style={{ color: plan.highlight ? 'rgba(250,247,240,0.65)' : '#5a5a5a' }}
              >
                {plan.tagline}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span
                  className="font-semibold"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'normal',
                    fontSize: '36px',
                    color: plan.highlight ? '#faf7f0' : '#334739',
                  }}
                >
                  {plan.price}
                </span>
                <span
                  className="text-sm ml-2"
                  style={{ color: plan.highlight ? 'rgba(250,247,240,0.6)' : '#5a5a5a' }}
                >
                  {plan.period}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check
                      size={14}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: plan.highlight ? '#d3b24b' : '#334739' }}
                      aria-hidden="true"
                    />
                    <span style={{ color: plan.highlight ? 'rgba(250,247,240,0.85)' : '#5a5a5a' }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={plan.href}
                className="block text-center text-sm font-medium transition-[transform,opacity] duration-150 ease-out hover:opacity-85 active:scale-[0.97]"
                style={{
                  backgroundColor: plan.highlight ? '#d3b24b' : '#334739',
                  color: plan.highlight ? '#334739' : '#faf7f0',
                  borderRadius: '30px',
                  padding: '14px 24px',
                  letterSpacing: '0.03em',
                }}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <p
          className="text-center text-xs mt-8"
          style={{ color: '#5a5a5a' }}
        >
          All prices exclude VAT. A once-off onboarding fee (R 1,500–R 3,000) applies to all new clients — covers data migration, resident capture, and staff setup. Custom pricing available for facility groups.{' '}
          <a href="#contact" style={{ color: '#334739', textDecoration: 'underline' }}>
            Contact us
          </a>{' '}
          to discuss your needs.
        </p>
      </div>
    </section>
  )
}
