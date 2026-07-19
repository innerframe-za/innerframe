import { Home, ShieldCheck, HeartHandshake, Sprout } from 'lucide-react'

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

const PILLARS = [
  { Icon: Home,           label: 'Structure'   },
  { Icon: ShieldCheck,    label: 'Compliance'  },
  { Icon: HeartHandshake, label: 'Support'     },
  { Icon: Sprout,         label: 'Growth'      },
]

// Leaf templates: all point upward from (0,0). Rotate/translate via SVG transform.
const LEAF_LG  = 'M 0 0 C -42 -28 -30 -85 0 -120 C 30 -85 40 -30 0 0 Z'
const LEAF_MD  = 'M 0 0 C -30 -20 -20 -62 0 -88  C 20 -62 28 -22 0 0 Z'
const LEAF_SM  = 'M 0 0 C -18 -12 -12 -38 0 -56  C 12 -38 16 -13 0 0 Z'

function DesktopBotanical() {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '560px', height: '620px' }}>
      {/* Leaf + background SVG layer sits behind the logo */}
      <svg
        viewBox="0 0 600 650"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden="true"
        overflow="visible"
      >
        {/* Soft organic background blobs */}
        <ellipse cx="490" cy="490" rx="195" ry="120"
          fill="rgba(120,144,124,0.07)" transform="rotate(-28 490 490)" />
        <ellipse cx="545" cy="195" rx="145" ry="85"
          fill="rgba(120,144,124,0.05)" transform="rotate(18 545 195)" />
        <ellipse cx="120" cy="525" rx="155" ry="88"
          fill="rgba(120,144,124,0.06)" transform="rotate(42 120 525)" />

        {/* Main vine — thin gold, winding from lower-left to upper-right */}
        <path d="M 225 645 C 255 540 280 440 305 360 C 338 275 392 198 460 132"
          stroke="#B89C69" strokeWidth="1.3" fill="none" strokeOpacity="0.40" />
        {/* Side branch stubs */}
        <path d="M 318 382 C 365 364 418 357 468 352"
          stroke="#B89C69" strokeWidth="0.8" fill="none" strokeOpacity="0.28" />
        <path d="M 344 300 C 392 283 444 278 485 275"
          stroke="#B89C69" strokeWidth="0.8" fill="none" strokeOpacity="0.28" />
        <path d="M 292 445 C 338 438 390 450 428 462"
          stroke="#B89C69" strokeWidth="0.8" fill="none" strokeOpacity="0.28" />

        {/* === LARGE LEAVES === */}

        {/* Upper-right — points NE */}
        <g transform="translate(418, 242) rotate(-52)">
          <path d={LEAF_LG} fill="#496353" fillOpacity="0.72" />
          <path d="M 0 0 L 0 -120" stroke="#496353" strokeWidth="0.6" strokeOpacity="0.20" fill="none" />
        </g>

        {/* Right — points E, partially off viewport (clipped by section) */}
        <g transform="translate(470, 330) rotate(38)">
          <path d={LEAF_LG} fill="#78907C" fillOpacity="0.65" />
          <path d="M 0 0 L 0 -120" stroke="#78907C" strokeWidth="0.6" strokeOpacity="0.20" fill="none" />
        </g>

        {/* Upper-left — points slightly NW */}
        <g transform="translate(248, 192) rotate(22)">
          <path d={LEAF_LG} fill="#496353" fillOpacity="0.65" />
          <path d="M 0 0 L 0 -120" stroke="#496353" strokeWidth="0.6" strokeOpacity="0.20" fill="none" />
        </g>

        {/* Far right large — half off-screen */}
        <g transform="translate(552, 308) rotate(-32)">
          <path d="M 0 0 C -50 -34 -36 -105 0 -148 C 36 -105 46 -36 0 0 Z"
            fill="#78907C" fillOpacity="0.58" />
        </g>

        {/* === MEDIUM LEAVES === */}

        {/* Lower-right */}
        <g transform="translate(452, 435) rotate(28)">
          <path d={LEAF_MD} fill="#496353" fillOpacity="0.55" />
        </g>

        {/* Left — points W */}
        <g transform="translate(200, 352) rotate(-122)">
          <path d={LEAF_MD} fill="#78907C" fillOpacity="0.52" />
        </g>

        {/* Lower-center, slight SE lean */}
        <g transform="translate(330, 485) rotate(12)">
          <path d={LEAF_MD} fill="#496353" fillOpacity="0.46" />
        </g>

        {/* === SMALL ACCENT LEAVES === */}

        {/* Upper-right accent */}
        <g transform="translate(505, 152) rotate(-42)">
          <path d={LEAF_SM} fill="#B89C69" fillOpacity="0.50" />
        </g>

        {/* Left accent */}
        <g transform="translate(158, 272) rotate(162)">
          <path d={LEAF_SM} fill="#496353" fillOpacity="0.38" />
        </g>

        {/* Lower accent */}
        <g transform="translate(488, 492) rotate(58)">
          <path d={LEAF_SM} fill="#78907C" fillOpacity="0.34" />
        </g>
      </svg>

      {/* Logo centered over the botanical layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '90px 55px 110px 35px',
          zIndex: 1,
        }}
      >
        <img
          src="/Logo_Transparent.png"
          alt="Innerframe Care Solutions"
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      </div>
    </div>
  )
}

function MobileBotanical() {
  return (
    <svg
      viewBox="0 0 200 520"
      width="200"
      height="520"
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {/* Thin gold branch */}
      <path d="M 100 520 C 112 415 122 315 135 215 C 148 125 165 62 185 20"
        stroke="#B89C69" strokeWidth="1" fill="none" strokeOpacity="0.35" />

      {/* Leaves along the branch */}
      <g transform="translate(148, 205) rotate(-42)">
        <path d="M 0 0 C -35 -22 -25 -68 0 -95 C 25 -68 32 -24 0 0 Z"
          fill="#496353" fillOpacity="0.60" />
      </g>
      <g transform="translate(165, 295) rotate(32)">
        <path d="M 0 0 C -28 -18 -18 -55 0 -78 C 18 -55 24 -20 0 0 Z"
          fill="#78907C" fillOpacity="0.55" />
      </g>
      <g transform="translate(132, 368) rotate(-18)">
        <path d="M 0 0 C -26 -17 -17 -52 0 -72 C 17 -52 22 -19 0 0 Z"
          fill="#496353" fillOpacity="0.50" />
      </g>
      <g transform="translate(158, 440) rotate(44)">
        <path d="M 0 0 C -20 -13 -14 -40 0 -58 C 14 -40 18 -14 0 0 Z"
          fill="#78907C" fillOpacity="0.44" />
      </g>
      <g transform="translate(178, 148) rotate(-58)">
        <path d="M 0 0 C -17 -11 -12 -36 0 -52 C 12 -36 16 -12 0 0 Z"
          fill="#B89C69" fillOpacity="0.40" />
      </g>
    </svg>
  )
}

export function Hero() {
  return (
    <section
      id="hero"
      style={{ backgroundColor: C.ivory, minHeight: 'calc(100vh - 72px)' }}
      className="relative overflow-hidden px-6 flex items-center"
    >
      {/* Mobile botanical — floats on the right edge behind content */}
      <div
        className="lg:hidden"
        style={{
          position: 'absolute',
          right: '-16px',
          top: '32px',
          opacity: 0.72,
          zIndex: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <MobileBotanical />
      </div>

      <div
        className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center py-16 lg:py-24"
        style={{ position: 'relative', zIndex: 1 }}
      >

        {/* ── LEFT: content ── */}
        <div>

          {/* Mobile logo — centered above the text, hidden on desktop */}
          <div className="lg:hidden mb-10" style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src="/Logo_Transparent.png"
              alt="Innerframe Care Solutions"
              style={{ width: 'min(230px, 62vw)', height: 'auto' }}
            />
          </div>

          {/* Brand tagline — 3-line stacked, middle line in gold */}
          <div style={{ marginBottom: '20px', lineHeight: 1.95 }}>
            {(['Stronger Structures.', 'Better Care.', 'Brighter Futures.'] as const).map(
              (line, i) => (
                <div
                  key={line}
                  style={{
                    fontFamily: INTER,
                    fontWeight: 600,
                    fontSize: '11.5px',
                    letterSpacing: '0.20em',
                    textTransform: 'uppercase',
                    color: i === 1 ? C.gold : C.slate,
                  }}
                >
                  {line}
                </div>
              )
            )}
          </div>

          {/* Gold accent rule */}
          <div
            style={{
              width: '40px',
              height: '2px',
              backgroundColor: C.gold,
              marginBottom: '28px',
            }}
          />

          {/* H1 — roman + italic gold */}
          <h1
            style={{
              fontFamily: CORMORANT,
              fontWeight: 600,
              fontSize: 'clamp(40px, 5.2vw, 62px)',
              lineHeight: 1.12,
              color: C.slate,
              marginBottom: '24px',
            } as React.CSSProperties}
          >
            Building the foundation for{' '}
            <em style={{ color: C.gold, fontStyle: 'italic' }}>
              care that lasts.
            </em>
          </h1>

          {/* Body */}
          <p
            style={{
              fontFamily: INTER,
              fontWeight: 400,
              fontSize: '17px',
              lineHeight: 1.78,
              color: C.slate,
              opacity: 0.78,
              maxWidth: '460px',
              marginBottom: '36px',
            }}
          >
            We partner with care organisations to strengthen structures, ensure
            compliance, and support sustainable growth.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4" style={{ marginBottom: '52px' }}>
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
              onMouseEnter={e =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = '#3A5445')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = C.evergreen)
              }
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
              onMouseEnter={e =>
                ((e.currentTarget as HTMLElement).style.backgroundColor =
                  'rgba(200,212,200,0.35)')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')
              }
            >
              Our Services
            </a>
          </div>

          {/* 4-pillar strip */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0 }}>
            {PILLARS.map(({ Icon, label }, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && (
                  <div
                    style={{
                      width: '1px',
                      height: '40px',
                      backgroundColor: 'rgba(73,99,83,0.22)',
                      margin: '0 18px',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />
                )}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '7px',
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={1.5}
                    style={{ color: C.evergreen }}
                    aria-hidden="true"
                  />
                  <span
                    style={{
                      fontFamily: INTER,
                      fontWeight: 600,
                      fontSize: '10px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: C.slate,
                      opacity: 0.70,
                    }}
                  >
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: botanical composition (desktop only) ── */}
        <div className="hidden lg:flex items-center justify-end">
          <DesktopBotanical />
        </div>

      </div>
    </section>
  )
}
