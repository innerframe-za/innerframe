const VALUES = [
  {
    title: 'Structure First',
    body: 'Great care starts with great systems. We build the operational foundations that hold everything together before anything else.',
  },
  {
    title: 'Compliance as a Culture',
    body: 'DSD compliance is not a once-off event. We embed it into daily workflows so your team lives it year-round, not only when an inspection is scheduled.',
  },
  {
    title: 'SA-Rooted Expertise',
    body: 'We understand the realities of running an old age home in South Africa: the funding constraints, the regulations, and the human element.',
  },
]

export function WhoWeAre() {
  return (
    <section
      id="who-we-are"
      className="py-24 px-6"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left — story */}
          <div>
            <div className="inline-block mb-10">
              <h2
                className="text-3xl font-semibold gold-underline"
                style={{
                  color: '#334739',
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: 'normal',
                }}
              >
                Who We Are
              </h2>
            </div>

            <p className="text-base leading-relaxed mb-5" style={{ color: '#5a5a5a' }}>
              Innerframe Care Solutions was founded with a single purpose: to give South African old age homes the operational backbone they need to deliver consistently excellent care.
            </p>
            <p className="text-base leading-relaxed mb-5" style={{ color: '#5a5a5a' }}>
              Too many facilities struggle not because they lack dedication, but because they lack structure. Policies are missing. Files are incomplete. Compliance happens reactively, only when an inspection is due.
            </p>
            <p className="text-base leading-relaxed" style={{ color: '#5a5a5a' }}>
              We work directly with facility managers, boards, and care teams to build systems that last — practical, DSD-aligned, and tailored to the South African context. Our team brings hands-on experience in healthcare administration, social services compliance, and operational management.
            </p>
          </div>

          {/* Right — values as a numbered divider list */}
          <div className="lg:pt-2">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className="flex gap-5 py-7"
                style={{
                  borderTop: i > 0 ? '1px solid #ddd6c8' : 'none',
                }}
              >
                <span
                  className="flex-shrink-0 leading-none mt-1"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontWeight: 600,
                    fontSize: '22px',
                    color: i % 2 === 0 ? '#334739' : '#d3b24b',
                    minWidth: '2rem',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3
                    className="font-semibold mb-2"
                    style={{
                      color: '#334739',
                      fontFamily: "'Outfit', system-ui, sans-serif",
                      fontSize: '16px',
                    }}
                  >
                    {v.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#5a5a5a' }}>
                    {v.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
