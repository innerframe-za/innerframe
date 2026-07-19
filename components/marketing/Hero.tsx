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

function BotanicalMotif() {
  return (
    <svg
      width="480"
      height="480"
      viewBox="0 0 480 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Concentric rings */}
      <circle cx="240" cy="240" r="218" stroke={C.sageSoft} strokeWidth="1" opacity="0.45" />
      <circle cx="240" cy="240" r="152" stroke={C.sageSoft} strokeWidth="0.75" opacity="0.3" />
      <circle cx="240" cy="240" r="48" stroke={C.gold} strokeWidth="0.75" opacity="0.35" />

      {/* Primary leaf — upper right, large */}
      <path
        d="M310 72 C378 118 396 210 348 264 C304 216 264 136 310 72Z"
        fill={C.sageSoft}
        fillOpacity="0.32"
      />
      <path
        d="M310 72 C292 152 298 232 342 266"
        stroke={C.sage}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Secondary leaf — lower left */}
      <path
        d="M148 360 C92 304 92 212 138 176 C164 218 162 308 148 360Z"
        fill={C.sageSoft}
        fillOpacity="0.22"
      />
      <path
        d="M148 360 C158 298 154 218 138 176"
        stroke={C.sage}
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* Tertiary small leaf accent — upper left */}
      <path
        d="M178 112 C206 128 216 160 196 178 C178 162 168 134 178 112Z"
        fill={C.sage}
        fillOpacity="0.18"
      />

      {/* Dashed curved stem */}
      <path
        d="M240 56 C252 150 235 270 215 388"
        stroke={C.sageSoft}
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="3 9"
        opacity="0.38"
      />

      {/* Gold berry/node accents */}
      <circle cx="332" cy="172" r="4" fill={C.gold} opacity="0.52" />
      <circle cx="298" cy="214" r="3" fill={C.gold} opacity="0.44" />
      <circle cx="240" cy="240" r="3.5" fill={C.gold} opacity="0.5" />
      <circle cx="180" cy="272" r="2.5" fill={C.gold} opacity="0.4" />
      <circle cx="158" cy="316" r="2" fill={C.gold} opacity="0.34" />

      {/* Small decorative dots */}
      <circle cx="192" cy="136" r="2" fill={C.sageSoft} opacity="0.5" />
      <circle cx="164" cy="200" r="1.5" fill={C.sageSoft} opacity="0.4" />
    </svg>
  )
}

export function Hero() {
  return (
    <section
      style={{ backgroundColor: C.ivory, minHeight: 'calc(100vh - 72px)' }}
      className="flex items-center px-6 py-24"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-center">
        {/* Left: content */}
        <div style={{ maxWidth: '620px' }}>
          {/* Gold eyebrow — used once, deliberately */}
          <p
            className="mb-8"
            style={{
              fontFamily: INTER,
              fontWeight: 500,
              fontSize: '12px',
              color: C.gold,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Care Consultancy · South Africa
          </p>

          <h1
            style={{
              fontFamily: CORMORANT,
              fontWeight: 600,
              fontSize: 'clamp(42px, 5.5vw, 64px)',
              lineHeight: 1.12,
              color: C.slate,
              marginBottom: '28px',
            }}
          >
            Building Stronger Foundations for Lasting Care
          </h1>

          <p
            style={{
              fontFamily: INTER,
              fontWeight: 400,
              fontSize: '18px',
              lineHeight: 1.75,
              color: C.slate,
              opacity: 0.72,
              maxWidth: '480px',
              marginBottom: '44px',
            }}
          >
            Working alongside care organisations to strengthen governance,
            compliance, and operational structure — so you can focus on what
            matters most.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#contact"
              style={{
                fontFamily: INTER,
                fontWeight: 600,
                fontSize: '16px',
                backgroundColor: C.evergreen,
                color: '#ffffff',
                borderRadius: '12px',
                padding: '14px 32px',
                display: 'inline-block',
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#3A5445')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = C.evergreen)}
            >
              Book a Consultation
            </a>
            <a
              href="#services"
              style={{
                fontFamily: INTER,
                fontWeight: 500,
                fontSize: '16px',
                border: `1.5px solid ${C.evergreen}`,
                color: C.evergreen,
                backgroundColor: 'transparent',
                borderRadius: '12px',
                padding: '14px 32px',
                display: 'inline-block',
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(200,212,200,0.35)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
            >
              Our Services
            </a>
          </div>
        </div>

        {/* Right: botanical motif */}
        <div className="hidden lg:block flex-shrink-0">
          <BotanicalMotif />
        </div>
      </div>
    </section>
  )
}
