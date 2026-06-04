'use client'
import { Search, Settings, CheckCircle } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Assess',
    subtitle: 'Full Facility Evaluation',
    description:
      'We conduct a comprehensive assessment of all 5 pillars — identifying gaps, compliance risks, and operational weaknesses before anything else.',
  },
  {
    number: '02',
    icon: Settings,
    title: 'Structure',
    subtitle: 'Build Your Systems',
    description:
      'We create the files, policies, controls, and workflows your facility needs. Every document is DSD-compliant and tailored to your specific context.',
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Implement',
    subtitle: 'Train, Monitor & Sustain',
    description:
      'We train your staff, monitor the new systems, and give you the tools to maintain compliance long after the initial engagement ends.',
  },
]

/**
 * How It Works section — 3-step process with gold numbered circles.
 */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 px-6"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-14">
          <div className="inline-block">
            <h2
              className="text-3xl font-semibold gold-underline"
              style={{ color: '#334739', fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'normal' }}
            >
              How It Works
            </h2>
          </div>
          <p
            className="mt-6 text-base max-w-lg mx-auto"
            style={{ color: '#5a5a5a' }}
          >
            A structured three-step process that transforms your facility from
            reactive to audit-ready.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Connector line between steps */}
                {index < steps.length - 1 && (
                  <div
                    className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] right-[calc(-50%+2.5rem)] h-px"
                    style={{ backgroundColor: '#ddd6c8' }}
                    aria-hidden="true"
                  />
                )}

                {/* Gold number circle */}
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center mb-6 border-2 z-10"
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#d3b24b',
                    color: '#d3b24b',
                  }}
                >
                  <span className="text-xl font-medium">{step.number}</span>
                </div>

                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(30,58,47,0.06)' }}
                >
                  <Icon
                    size={20}
                    style={{ color: '#334739' }}
                    aria-hidden="true"
                  />
                </div>

                {/* Content */}
                <h3
                  className="text-xl font-semibold mb-1"
                  style={{ color: '#334739', fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'normal' }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-xs font-medium mb-3"
                  style={{ color: '#d3b24b' }}
                >
                  {step.subtitle}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#5a5a5a' }}>
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Outcome strip */}
        <div
          className="mt-16 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border"
          style={{
            backgroundColor: '#334739',
            borderColor: 'rgba(212,175,55,0.3)',
          }}
        >
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wider mb-2"
              style={{ color: '#d3b24b' }}
            >
              The Innerframe Outcome
            </p>
            <h3
              className="text-xl font-medium"
              style={{ color: '#F5F0E8' }}
            >
              Structured. Compliant. Compassionate.
            </h3>
          </div>
          <a
            href="#contact"
            className="flex-shrink-0 px-6 py-3 rounded-full text-sm font-medium transition-[transform,background-color] duration-150 ease-out active:scale-[0.97]"
            style={{ backgroundColor: '#d3b24b', color: '#334739' }}
            onMouseEnter={e =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = '#b8972e')
            }
            onMouseLeave={e =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = '#d3b24b')
            }
          >
            Start the Assessment
          </a>
        </div>
      </div>
    </section>
  )
}
