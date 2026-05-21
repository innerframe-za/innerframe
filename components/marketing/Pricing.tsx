import { Check } from 'lucide-react'

const PLANS = [
  {
    name: 'Assessment',
    price: 'R 3,500',
    period: 'once-off',
    tagline: 'Understand where you stand.',
    highlight: false,
    features: [
      'Full 5-pillar facility audit',
      'Compliance gap analysis',
      'Prioritised action report',
      'DSD readiness score',
      'Written recommendations',
    ],
    cta: 'Book an Assessment',
    href: '#contact',
  },
  {
    name: 'Foundation',
    price: 'R 12,000',
    period: 'once-off',
    tagline: 'Build the systems that last.',
    highlight: true,
    features: [
      'Everything in Assessment',
      'Full documentation setup (all 5 pillars)',
      'Policies, templates & registers',
      'Staff training session',
      'DSD-ready file structures',
      '30-day post-implementation support',
    ],
    cta: 'Get Started',
    href: '#contact',
  },
  {
    name: 'Partner',
    price: 'R 2,800',
    period: 'per month',
    tagline: 'Stay compliant, always.',
    highlight: false,
    features: [
      'Monthly compliance check-in',
      'Document updates & maintenance',
      'Inspection preparation support',
      'Staff query helpline',
      'Quarterly pillar review',
    ],
    cta: 'Become a Partner',
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
            Transparent, South Africa-focused pricing. No hidden fees, no long-term lock-in. Start where you are.
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
                className="block text-center text-sm font-medium transition-opacity hover:opacity-85"
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
          All prices exclude VAT. Custom packages available for groups of facilities.{' '}
          <a href="#contact" style={{ color: '#334739', textDecoration: 'underline' }}>
            Contact us
          </a>{' '}
          to discuss your needs.
        </p>
      </div>
    </section>
  )
}
