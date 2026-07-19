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

const VALUES = [
  'Compassion',
  'Integrity',
  'Excellence',
  'Structure',
  'Sustainability',
  'Partnership',
  'Growth',
  'Accountability',
]

export function About() {
  return (
    <section
      id="about"
      style={{ backgroundColor: '#ffffff', paddingTop: 'clamp(80px, 10vw, 120px)', paddingBottom: 'clamp(80px, 10vw, 120px)' }}
      className="px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left: story */}
          <div>
            {/* Section heading with gold rule */}
            <div style={{ marginBottom: '40px' }}>
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

            <p
              style={{
                fontFamily: INTER,
                fontSize: '18px',
                lineHeight: 1.75,
                color: C.slate,
                opacity: 0.78,
                marginBottom: '24px',
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
                marginBottom: '24px',
              }}
            >
              We don't provide care directly. We work alongside the people who do — bringing structure, clarity, and practical systems to organisations that are deeply committed to their residents and communities, but need stronger frameworks to operate sustainably and meet regulatory requirements.
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
              Our approach is grounded in South African regulatory reality — DSD alignment, POPIA compliance, and the specific funding and operational challenges facing care organisations in this context. We bring experience, precision, and genuine care for the sector.
            </p>

            {/* Pull quote — subtle background tint, no side stripe */}
            <blockquote
              style={{
                marginTop: '40px',
                padding: '28px 32px',
                backgroundColor: 'rgba(200,212,200,0.15)',
                borderRadius: '16px',
              }}
            >
              <p
                style={{
                  fontFamily: CORMORANT,
                  fontWeight: 600,
                  fontSize: '22px',
                  lineHeight: 1.5,
                  color: C.evergreen,
                  fontStyle: 'italic',
                }}
              >
                "Timeless, not trendy. Professional, not corporate. Compassionate, not clinical."
              </p>
            </blockquote>
          </div>

          {/* Right: brand values */}
          <div style={{ paddingTop: '8px' }}>
            <p
              style={{
                fontFamily: INTER,
                fontWeight: 500,
                fontSize: '12px',
                color: C.gold,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '28px',
              }}
            >
              What guides us
            </p>

            <div className="grid grid-cols-2 gap-3">
              {VALUES.map((value, i) => (
                <div
                  key={value}
                  style={{
                    backgroundColor: C.ivory,
                    borderRadius: '16px',
                    padding: '20px 24px',
                    border: `1px solid rgba(200,212,200,0.5)`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: i % 3 === 0 ? C.evergreen : i % 3 === 1 ? C.gold : C.sage,
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />
                  <span
                    style={{
                      fontFamily: CORMORANT,
                      fontWeight: 600,
                      fontSize: '18px',
                      color: C.slate,
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
