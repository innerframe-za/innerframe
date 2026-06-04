import { useEffect } from 'react'
import { useReveal } from '@/lib/hooks/useReveal'

const VALUES = [
  {
    title: 'Structure First',
    body: 'Great care starts with great systems. Before anything else, we build the foundations that hold everything together — policies, files, registers, and controls.',
  },
  {
    title: 'Compliance as a Culture',
    body: "DSD compliance is not a once-off event. We embed it into daily workflows so your team lives it year-round, not only when an inspection is due.",
  },
  {
    title: 'SA-Rooted Expertise',
    body: 'We understand the realities of running an old age home in South Africa — the DSD funding model, Section 20 and 21 requirements, local labour law, and the human element.',
  },
]

export function WhoWeAre() {
  const { ref, visible } = useReveal()

  return (
    <section
      id="who-we-are"
      className="py-24 px-6"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div
        ref={ref}
        className={`max-w-6xl mx-auto reveal-section${visible ? ' is-visible' : ''}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left — story */}
          <div>
            <div className="inline-block mb-10">
              <h2
                className="gold-underline"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 600,
                  fontSize: 'clamp(28px, 3vw, 36px)',
                  color: '#334739',
                  lineHeight: 1.15,
                }}
              >
                Who We Are
              </h2>
            </div>

            <p className="text-base leading-relaxed mb-5" style={{ color: '#5a5a5a', maxWidth: '480px' }}>
              Innerframe Care Solutions was founded with a single purpose: to give South
              African old age homes the operational backbone they need to deliver
              consistently excellent care.
            </p>
            <p className="text-base leading-relaxed mb-5" style={{ color: '#5a5a5a', maxWidth: '480px' }}>
              Too many facilities struggle not because they lack dedication, but because
              they lack structure. Policies are missing. Files are incomplete. Compliance
              happens reactively, only when an inspection is due.
            </p>
            <p className="text-base leading-relaxed" style={{ color: '#5a5a5a', maxWidth: '480px' }}>
              We work directly with facility managers, boards, and care teams to build
              systems that last — practical, DSD-aligned, and tailored to the South
              African context.
            </p>
          </div>

          {/* Right — values, clean list, no card containers */}
          <div className="lg:pt-2">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className={`reveal-section delay-${(i + 1) * 100}${visible ? ' is-visible' : ''}`}
                style={{
                  paddingTop: i === 0 ? 0 : '28px',
                  paddingBottom: '28px',
                  borderBottom: i < VALUES.length - 1 ? '1px solid #ede8dc' : 'none',
                }}
              >
                {/* Gold accent dot + title */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#d3b24b',
                      flexShrink: 0,
                      marginTop: '3px',
                      display: 'inline-block',
                    }}
                  />
                  <h3
                    style={{
                      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                      fontWeight: 600,
                      fontSize: '15px',
                      color: '#334739',
                    }}
                  >
                    {v.title}
                  </h3>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: '#5a5a5a', paddingLeft: '16px' }}
                >
                  {v.body}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
