export function Hero() {
  return (
    <section
      className="grid grid-cols-1 md:grid-cols-2 overflow-hidden"
      style={{
        backgroundColor: '#faf7f0',
        minHeight: 'calc(100vh - 78px)',
      }}
    >
      {/* Left column — brand illustration */}
      <div
        className="hidden md:flex items-center justify-center py-10 px-10"
        style={{ backgroundColor: '#faf7f0' }}
      >
        <img
          src="/logo-full.jpeg"
          alt="Innerframe Care Solutions brand illustration"
          style={{
            maxHeight: 'calc(100vh - 160px)',
            maxWidth: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Right column — text content */}
      <div className="flex flex-col justify-center px-10 py-16 md:pr-20 md:pl-10">
        {/* Eyebrow label */}
        <p
          className="text-xs font-medium uppercase tracking-widest mb-6"
          style={{ color: '#698169' }}
        >
          South African Care Facility Specialists
        </p>

        {/* Headline — dark green + gold accent on last line */}
        <h1
          className="leading-tight mb-6"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 600,
            fontStyle: 'normal',
            fontSize: 'clamp(38px, 4.5vw, 58px)',
            lineHeight: '1.15',
          }}
        >
          <span style={{ color: '#334739' }}>Stronger Structure.</span>
          <br />
          <span style={{ color: '#334739' }}>Better Care.</span>
          <br />
          <span style={{ color: '#d3b24b' }}>Effortless Compliance.</span>
        </h1>

        {/* Body copy */}
        <p
          className="text-base mb-10"
          style={{ color: '#5a5a5a', maxWidth: '420px', lineHeight: '1.7' }}
        >
          Innerframe helps South African old age homes build the operational
          systems, compliance structures, and management frameworks they need
          to deliver excellent care — and pass every inspection.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-4">
          <a
            href="#contact"
            className="font-medium transition-opacity hover:opacity-85"
            style={{
              backgroundColor: '#334739',
              color: '#faf7f0',
              borderRadius: '30px',
              padding: '14px 32px',
              fontSize: '15px',
              letterSpacing: '0.03em',
              display: 'inline-block',
            }}
          >
            Get Started
          </a>
          <a
            href="#pillars"
            className="font-medium transition-opacity hover:opacity-75"
            style={{
              border: '2px solid #334739',
              color: '#334739',
              backgroundColor: 'transparent',
              borderRadius: '30px',
              padding: '12px 30px',
              fontSize: '15px',
              display: 'inline-block',
            }}
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  )
}
