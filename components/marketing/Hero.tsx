import { useEffect, useState } from 'react'

export function Hero() {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setEntered(true)
      return
    }
    // Double rAF ensures paint has occurred before the transition starts
    let id1 = requestAnimationFrame(() => {
      let id2 = requestAnimationFrame(() => setEntered(true))
      return () => cancelAnimationFrame(id2)
    })
    return () => cancelAnimationFrame(id1)
  }, [])

  const ease = 'cubic-bezier(0.23, 1, 0.32, 1)'

  function fadeUp(delayMs: number): React.CSSProperties {
    return {
      opacity: entered ? 1 : 0,
      transform: entered ? 'none' : 'translateY(28px)',
      transition: `opacity 0.8s ${ease} ${delayMs}ms, transform 0.8s ${ease} ${delayMs}ms`,
    }
  }

  return (
    <section
      aria-label="Innerframe Care Solutions"
      style={{
        backgroundColor: '#334739',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(100px, 10vw, 140px) clamp(24px, 7vw, 96px) clamp(80px, 8vw, 120px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle dot-grid texture */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle, rgba(250,247,240,0.045) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          pointerEvents: 'none',
        }}
      />

      {/* Large background watermark — decorative */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: '-2%',
          top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(180px, 22vw, 340px)',
          fontWeight: 700,
          color: 'rgba(250,247,240,0.025)',
          lineHeight: 1,
          userSelect: 'none',
          pointerEvents: 'none',
          letterSpacing: '-0.04em',
        }}
      >
        IF
      </div>

      {/* Content */}
      <div style={{ maxWidth: '880px', position: 'relative' }}>

        {/* Eyebrow label with gold rule */}
        <div style={{ ...fadeUp(0), display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
          <div
            style={{ width: '44px', height: '1px', backgroundColor: '#d3b24b', flexShrink: 0 }}
          />
          <span
            style={{
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontSize: '11px',
              letterSpacing: '0.16em',
              color: 'rgba(211,178,75,0.8)',
              textTransform: 'uppercase',
            }}
          >
            South African Care Facility Specialists
          </span>
        </div>

        {/* Main headline */}
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 600,
            fontSize: 'clamp(50px, 7.5vw, 90px)',
            lineHeight: 1.07,
            letterSpacing: '-0.025em',
            marginBottom: '36px',
          }}
        >
          <span
            style={{
              ...fadeUp(120),
              color: '#faf7f0',
              display: 'block',
              textWrap: 'balance' as React.CSSProperties['textWrap'],
            }}
          >
            Stronger Structures.
          </span>
          <span
            style={{
              ...fadeUp(220),
              color: '#faf7f0',
              display: 'block',
              textWrap: 'balance' as React.CSSProperties['textWrap'],
            }}
          >
            Better Care.
          </span>
          <span
            style={{
              ...fadeUp(320),
              color: '#d3b24b',
              display: 'block',
              textWrap: 'balance' as React.CSSProperties['textWrap'],
            }}
          >
            Brighter Futures.
          </span>
        </h1>

        {/* Body */}
        <p
          style={{
            ...fadeUp(440),
            fontFamily: "'Outfit', system-ui, sans-serif",
            fontSize: 'clamp(15px, 1.6vw, 17px)',
            lineHeight: 1.75,
            color: 'rgba(250,247,240,0.68)',
            maxWidth: '500px',
            marginBottom: '52px',
          }}
        >
          We help South African old age homes build the operational systems,
          compliance structures, and management frameworks they need to deliver
          excellent care and pass every inspection.
        </p>

        {/* CTAs */}
        <div
          style={{
            ...fadeUp(560),
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <a
            href="#contact"
            style={{
              backgroundColor: '#d3b24b',
              color: '#334739',
              borderRadius: '40px',
              padding: '15px 38px',
              fontSize: '14px',
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontWeight: 600,
              letterSpacing: '0.03em',
              display: 'inline-block',
              textDecoration: 'none',
              transition: 'background-color 0.15s ease-out, transform 0.12s ease-out',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#b8972e'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#d3b24b'
            }}
          >
            Book an Assessment
          </a>
          <a
            href="#pillars"
            style={{
              border: '1.5px solid rgba(250,247,240,0.32)',
              color: 'rgba(250,247,240,0.88)',
              backgroundColor: 'transparent',
              borderRadius: '40px',
              padding: '15px 38px',
              fontSize: '14px',
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontWeight: 500,
              display: 'inline-block',
              textDecoration: 'none',
              transition: 'border-color 0.15s ease-out, color 0.15s ease-out',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = 'rgba(250,247,240,0.65)'
              el.style.color = '#faf7f0'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = 'rgba(250,247,240,0.32)'
              el.style.color = 'rgba(250,247,240,0.88)'
            }}
          >
            See How It Works
          </a>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        style={{
          ...fadeUp(800),
          position: 'absolute',
          bottom: '36px',
          left: 'clamp(24px, 7vw, 96px)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{ width: '1px', height: '36px', backgroundColor: 'rgba(250,247,240,0.2)' }}
        />
        <span
          style={{
            fontFamily: "'Outfit', system-ui, sans-serif",
            fontSize: '10px',
            letterSpacing: '0.14em',
            color: 'rgba(250,247,240,0.28)',
            textTransform: 'uppercase',
          }}
        >
          Scroll
        </span>
      </div>
    </section>
  )
}
