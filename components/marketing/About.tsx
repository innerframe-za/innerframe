const C = {
  evergreen: '#496353',
  sage: '#78907C',
  sageSoft: '#C8D4C8',
  gold: '#B89C69',
  ivory: '#F8F5EF',
  slate: '#38423D',
}

const INTER = "'Inter', system-ui, sans-serif"
const CORMORANT = "'Cormorant Garamond', Georgia, serif"

export function About() {
  return (
    <section
      id="about"
      style={{ backgroundColor: '#ffffff', paddingTop: 'clamp(80px, 10vw, 120px)', paddingBottom: 'clamp(80px, 10vw, 120px)' }}
      className="px-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section heading with gold rule */}
        <div style={{ marginBottom: '40px', maxWidth: '760px' }}>
          <h2
            style={{
              fontFamily: CORMORANT,
              fontWeight: 600,
              fontSize: 'clamp(32px, 4vw, 42px)',
              lineHeight: 1.15,
              color: C.slate,
              marginBottom: '16px',
            }}
          >
            A consulting firm with a heart for care
          </h2>
          <div style={{ width: '36px', height: '2px', backgroundColor: C.gold }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-16 gap-y-6">
          <p
            style={{
              fontFamily: INTER,
              fontSize: '18px',
              lineHeight: 1.75,
              color: C.slate,
              opacity: 0.78,
            }}
          >
            Innerframe Care Solutions partners with old age homes, assisted living facilities, non-profit care organisations, and community care providers to build the governance, compliance, and operational foundations that make excellent care possible.
          </p>

          <p
            style={{
              fontFamily: INTER,
              fontSize: '18px',
              lineHeight: 1.75,
              color: C.slate,
              opacity: 0.78,
            }}
          >
            We don't provide care directly. We work alongside the people who do — bringing structure, clarity, and practical systems to organisations that are deeply committed to their residents and communities, but need stronger frameworks to operate sustainably.
          </p>

          <p
            style={{
              fontFamily: INTER,
              fontSize: '18px',
              lineHeight: 1.75,
              color: C.slate,
              opacity: 0.78,
            }}
          >
            Our approach is grounded in South African regulatory reality — DSD alignment, POPIA compliance, and the specific funding and operational challenges facing care organisations in this context.
          </p>
        </div>

        {/* Pull quote — subtle background tint */}
        <blockquote
          style={{
            marginTop: '48px',
            padding: '28px 36px',
            backgroundColor: 'rgba(200,212,200,0.15)',
            borderRadius: '16px',
            maxWidth: '680px',
          }}
        >
          <p
            style={{
              fontFamily: CORMORANT,
              fontWeight: 600,
              fontSize: '24px',
              lineHeight: 1.5,
              color: C.evergreen,
              fontStyle: 'italic',
            }}
          >
            "Timeless, not trendy. Professional, not corporate. Compassionate, not clinical."
          </p>
        </blockquote>
      </div>
    </section>
  )
}
