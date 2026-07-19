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


export function Hero() {
  return (
    <section
      style={{ backgroundColor: C.ivory, minHeight: 'calc(100vh - 72px)' }}
      className="flex items-center px-6 py-24"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: content */}
        <div style={{ maxWidth: '620px' }}>
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

        {/* Right: logo */}
        <div className="flex items-center justify-center lg:justify-end">
          <img
            src="/Logo_Transparent.png"
            alt="Innerframe Care Solutions"
            style={{
              width: 'min(520px, 90vw)',
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>
    </section>
  )
}
