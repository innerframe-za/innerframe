import { FallingLeaves } from '@/components/marketing/FallingLeaves'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

export default function DemoPage() {
  return (
    <>
      {/* Falling leaves sit behind everything via fixed positioning */}
      <FallingLeaves count={28} />

      <MarketingNav />

      <main className="relative" style={{ zIndex: 1 }}>
        {/* Hero */}
        <section
          className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
          style={{ backgroundColor: '#6c846c' }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 border"
            style={{
              color: '#D4AF37',
              borderColor: 'rgba(212,175,55,0.4)',
              backgroundColor: 'rgba(212,175,55,0.08)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
            Ambient Design Demo
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-6 max-w-3xl"
            style={{ color: '#1E3A2F' }}
          >
            Calm in the{' '}
            <span style={{ color: '#D4AF37' }}>Details.</span>
          </h1>

          <p
            className="text-base md:text-lg max-w-xl mb-10 leading-relaxed"
            style={{ color: '#5a5a5a' }}
          >
            A gentle reminder that great care environments are built on quiet
            consistency — the kind of steady, unobtrusive support that lets the
            important things take centre stage.
          </p>

          <a
            href="/"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium transition-colors"
            style={{ backgroundColor: '#D4AF37', color: '#1E3A2F' }}
          >
            Back to Home
          </a>
        </section>

        {/* Feature strip */}
        <section
          className="py-20 px-6"
          style={{ backgroundColor: '#6c846c' }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2
              className="text-2xl md:text-3xl font-medium mb-4 gold-underline mx-auto w-fit"
              style={{ color: '#1E3A2F' }}
            >
              Serenity by Design
            </h2>
            <p
              className="text-sm md:text-base max-w-2xl mx-auto mb-16"
              style={{ color: '#5a5a5a' }}
            >
              Background animations fade softly — present but never distracting.
              Exactly how operational support should feel.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Faded & Subtle',
                  body: 'Leaves render at 17% opacity — visible enough to add warmth, invisible enough to keep focus on your content.',
                },
                {
                  title: 'Randomised Motion',
                  body: 'Each leaf gets a unique size, speed, sway, and delay on mount, so the scene never loops obviously.',
                },
                {
                  title: 'Zero Interaction Cost',
                  body: 'pointer-events: none means clicks, taps, and selections pass straight through to your content.',
                },
              ].map(card => (
                <div
                  key={card.title}
                  className="p-6 rounded-2xl border text-left"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderColor: 'rgba(30,58,47,0.1)',
                  }}
                >
                  <h3 className="text-base font-medium mb-2" style={{ color: '#1E3A2F' }}>
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#5a5a5a' }}>
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </>
  )
}
