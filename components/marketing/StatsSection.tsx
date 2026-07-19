const C = {
  evergreen: '#496353',
  gold: '#B89C69',
  ivory: '#F8F5EF',
  sageSoft: '#C8D4C8',
}

const INTER = "'Inter', system-ui, sans-serif"
const CORMORANT = "'Cormorant Garamond', Georgia, serif"

const STATS = [
  { number: '50+', label: 'Facilities supported', sub: 'across South Africa' },
  { number: '15+', label: 'Years of sector experience', sub: 'in care & compliance' },
  { number: '5', label: 'Practice areas', sub: 'governance to growth' },
  { number: '100%', label: 'DSD-aligned approach', sub: 'fully regulatory-grounded' },
]

export function StatsSection() {
  return (
    <section
      style={{
        backgroundColor: C.evergreen,
        paddingTop: 'clamp(72px, 9vw, 96px)',
        paddingBottom: 'clamp(72px, 9vw, 96px)',
      }}
      className="px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              style={{
                paddingLeft: index > 0 ? 'clamp(24px, 5vw, 56px)' : '0',
                paddingRight: index < STATS.length - 1 ? 'clamp(24px, 5vw, 56px)' : '0',
                borderLeft: index > 0 ? `1px solid rgba(184,156,105,0.3)` : 'none',
                paddingTop: '0',
                paddingBottom: '0',
              }}
            >
              {/* Number */}
              <div
                style={{
                  fontFamily: CORMORANT,
                  fontWeight: 600,
                  fontSize: 'clamp(44px, 5vw, 64px)',
                  lineHeight: 1,
                  color: C.ivory,
                  marginBottom: '6px',
                }}
              >
                {stat.number}
              </div>

              {/* Thin gold underline */}
              <div
                style={{
                  width: '32px',
                  height: '2px',
                  backgroundColor: C.gold,
                  marginBottom: '16px',
                }}
              />

              {/* Label */}
              <div
                style={{
                  fontFamily: INTER,
                  fontWeight: 600,
                  fontSize: '15px',
                  color: C.ivory,
                  marginBottom: '4px',
                  lineHeight: 1.3,
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontFamily: INTER,
                  fontSize: '13px',
                  color: 'rgba(248,245,239,0.72)',
                  lineHeight: 1.4,
                }}
              >
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
