'use client'
import { ArrowRight, ChevronDown } from 'lucide-react'

/**
 * Full-width hero section for the marketing landing page.
 * Dark green bg with cream headline — communicates authority and warmth.
 */
export function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: '#6c846c', minHeight: '88vh' }}
    >
      {/* Gold top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: '#D4AF37' }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 flex flex-col items-center text-center">
        {/* Eyebrow label */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 border"
          style={{
            color: '#D4AF37',
            borderColor: 'rgba(212,175,55,0.4)',
            backgroundColor: 'rgba(212,175,55,0.08)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: '#D4AF37' }}
          />
          South African Care Facility Specialists
        </div>

        {/* Main headline */}
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-6 max-w-4xl"
          style={{ color: '#1E3A2F' }}
        >
          Stronger Structures.
          <br />
          Better Care.
          <br />
          <span style={{ color: '#D4AF37' }}>Brighter Futures.</span>
        </h1>

        {/* Sub-headline */}
        <p
          className="text-base md:text-lg max-w-2xl mb-10 leading-relaxed"
          style={{ color: '#5a5a5a' }}
        >
          Innerframe helps South African old age homes build the operational
          systems, compliance structures, and management frameworks they need to
          deliver excellent care — and pass every inspection.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm font-medium transition-colors"
            style={{ backgroundColor: '#D4AF37', color: '#1E3A2F' }}
            onMouseEnter={e =>
              ((e.target as HTMLElement).style.backgroundColor = '#B8960C')
            }
            onMouseLeave={e =>
              ((e.target as HTMLElement).style.backgroundColor = '#D4AF37')
            }
          >
            Get Started
            <ArrowRight size={16} />
          </a>
          <a
            href="#pillars"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm font-medium border transition-colors"
            style={{
              color: '#1E3A2F',
              borderColor: 'rgba(30,58,47,0.3)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={e => {
              const el = e.target as HTMLElement
              el.style.backgroundColor = 'rgba(30,58,47,0.05)'
            }}
            onMouseLeave={e => {
              const el = e.target as HTMLElement
              el.style.backgroundColor = 'transparent'
            }}
          >
            Learn More
          </a>
        </div>

        {/* Proof strip */}
        <div
          className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 pt-8 border-t w-full max-w-2xl"
          style={{ borderColor: 'rgba(30,58,47,0.12)' }}
        >
          {[
            { value: '5', label: 'Operational Pillars' },
            { value: 'DSD', label: 'Compliance Ready' },
            { value: '100%', label: 'SA-focused Support' },
          ].map(item => (
            <div key={item.label} className="text-center flex-1">
              <div
                className="text-2xl font-medium"
                style={{ color: '#D4AF37' }}
              >
                {item.value}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: '#5a5a5a' }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <span
          className="text-xs"
          style={{ color: 'rgba(30,58,47,0.4)' }}
        >
          scroll
        </span>
        <ChevronDown
          size={16}
          style={{ color: 'rgba(30,58,47,0.4)' }}
          className="animate-bounce"
        />
      </div>
    </section>
  )
}
