import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, DollarSign, UtensilsCrossed, Stethoscope, Scale, Menu, X, CheckCircle2, ArrowRight, Phone, Mail, MapPin } from 'lucide-react'

/* ─── Brand tokens (mirrors index.css) ─── */
const C = {
  greenDark:    '#334739',
  greenMid:     '#698169',
  greenLight:   '#3B6B4A',
  gold:         '#d3b24b',
  goldDark:     '#b8972e',
  cream:        '#faf7f0',
  creamSurface: '#f0ece3',
  border:       '#ddd6c8',
  text:         '#1a1a1a',
  textMuted:    '#5a5a5a',
}

/* ─── Data ─── */
const pillars = [
  {
    slug: 'admin',
    name: 'Admin Office',
    tagline: 'The structure behind the facility',
    icon: ClipboardList,
    items: ['Policies & procedures', 'Staff & resident files', 'Admission and discharge', 'Compliance filing'],
  },
  {
    slug: 'finance',
    name: 'Finance',
    tagline: 'Financial transparency & sustainability',
    icon: DollarSign,
    items: ['Budget tracking', 'DSD allocation management', 'Payroll controls', 'Procurement & stock'],
  },
  {
    slug: 'kitchen',
    name: 'Kitchen',
    tagline: 'Safe nutrition. Safe residents.',
    icon: UtensilsCrossed,
    items: ['Temperature & hygiene logs', 'Menu & dietary planning', 'Stock rotation (FIFO)', 'Cleaning schedules'],
  },
  {
    slug: 'medical',
    name: 'Medical',
    tagline: 'Resident safety & clinical compliance',
    icon: Stethoscope,
    items: ['Medication management', 'Care plans & observations', 'Incident & fall registers', 'Infection control'],
  },
  {
    slug: 'board',
    name: 'Board Governance',
    tagline: 'Leadership, accountability & sustainability',
    icon: Scale,
    items: ['Governance structure', 'Board packs & minutes', 'Risk register', 'Strategic planning'],
  },
]

const steps = [
  {
    number: '01',
    title: 'Assess',
    body: 'We conduct a full evaluation of your facility across all five operational pillars. You receive a clear gap report against DSD Section 20 and 21 requirements — no generics, no guesswork.',
  },
  {
    number: '02',
    title: 'Structure',
    body: 'We build your systems: file structures, policies, registers, checklists, and workflows tailored to your facility\'s size, funding model, and staff capacity.',
  },
  {
    number: '03',
    title: 'Implement',
    body: 'We train your team, embed the systems into daily operations, and set up the Innerframe portal so you can track documents and compliance readiness on an ongoing basis.',
  },
]

const forCards = [
  {
    role: 'Facility Directors',
    description: 'You\'re responsible for everything — DSD compliance, staff management, resident care, and board relations. Innerframe gives you the structure to hold it all together.',
  },
  {
    role: 'Home Administrators',
    description: 'You\'re in the detail daily. Our systems reduce the admin burden — clear file structures, complete registers, and a portal that shows exactly what is done and what isn\'t.',
  },
  {
    role: 'Board Members',
    description: 'You need confidence that the facility is compliant and well-run. Our governance pillar builds the oversight structures that give the board real visibility.',
  },
  {
    role: 'New Facilities',
    description: 'Starting a registered care facility is complex. We help you build the operational foundation from day one — before your first DSD inspection, not after.',
  },
]

/* ─── Nav ─── */
function Nav() {
  const [open, setOpen] = useState(false)
  const links = [
    { label: 'What We Do', href: '#pillars' },
    { label: 'How It Works', href: '#process' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
  ]
  return (
    <header style={{ background: C.greenDark, position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        {/* Logo */}
        <Link to="/landing2" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 700, color: C.cream, letterSpacing: '-0.01em' }}>
            Innerframe
          </span>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.7rem', fontWeight: 500, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Care Solutions
          </span>
        </Link>

        {/* Desktop links */}
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="hidden md:flex">
          {links.map(l => (
            <a key={l.href} href={l.href} style={{ color: 'rgba(250,247,240,0.75)', fontFamily: "'Outfit', sans-serif", fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.cream)}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,247,240,0.75)')}
            >
              {l.label}
            </a>
          ))}
          <Link to="/login" style={{
            background: C.gold, color: C.greenDark, fontFamily: "'Outfit', sans-serif",
            fontSize: '0.8rem', fontWeight: 700, padding: '0.45rem 1.1rem',
            borderRadius: 6, textDecoration: 'none', letterSpacing: '0.03em',
          }}>
            Portal Login
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(o => !o)} style={{ color: C.cream, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} className="md:hidden">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: C.greenDark, borderTop: `1px solid rgba(255,255,255,0.1)`, padding: '1rem 1.5rem 1.5rem' }} className="md:hidden">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ display: 'block', color: 'rgba(250,247,240,0.8)', fontFamily: "'Outfit', sans-serif", fontSize: '1rem', padding: '0.7rem 0', textDecoration: 'none', borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
              {l.label}
            </a>
          ))}
          <Link to="/login" onClick={() => setOpen(false)} style={{
            display: 'block', marginTop: '1rem', background: C.gold, color: C.greenDark,
            fontFamily: "'Outfit', sans-serif", fontSize: '0.875rem', fontWeight: 700,
            padding: '0.7rem 1rem', borderRadius: 6, textDecoration: 'none', textAlign: 'center',
          }}>
            Portal Login
          </Link>
        </div>
      )}
    </header>
  )
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section style={{ background: C.greenDark, paddingTop: '7rem', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: 720 }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: C.gold, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            DSD Compliance · Old Age Home Management · South Africa
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.6rem, 6vw, 4.25rem)', fontWeight: 700, color: C.cream, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
            Structured operations.<br />
            Compliant facilities.<br />
            <span style={{ color: C.gold }}>Confident inspections.</span>
          </h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.075rem', color: 'rgba(250,247,240,0.75)', lineHeight: 1.75, maxWidth: 580, marginBottom: '2.5rem' }}>
            Innerframe builds the operational systems, compliance structures, and document frameworks that South African registered care facilities need to pass DSD inspections and deliver excellent resident care.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem' }}>
            <a href="#contact" style={{
              background: C.gold, color: C.greenDark, fontFamily: "'Outfit', sans-serif",
              fontWeight: 700, fontSize: '0.9rem', padding: '0.85rem 2rem',
              borderRadius: 8, textDecoration: 'none', letterSpacing: '0.02em',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            }}>
              Book a Facility Assessment <ArrowRight size={16} />
            </a>
            <a href="#process" style={{
              color: C.cream, fontFamily: "'Outfit', sans-serif", fontWeight: 500,
              fontSize: '0.9rem', padding: '0.85rem 1.75rem', border: `1px solid rgba(250,247,240,0.25)`,
              borderRadius: 8, textDecoration: 'none',
            }}>
              See How It Works
            </a>
          </div>
        </div>

        {/* Trust bar */}
        <div style={{ marginTop: '3.5rem', paddingTop: '2rem', borderTop: `1px solid rgba(255,255,255,0.1)`, display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          {[
            'DSD Section 20 & 21 Aligned',
            'POPIA Compliant Systems',
            'Built for South African Facilities',
            'Consulting + Client Portal',
          ].map(tag => (
            <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={15} color={C.gold} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.8rem', color: 'rgba(250,247,240,0.65)', fontWeight: 500 }}>{tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Who We Are ─── */
function WhoWeAre() {
  return (
    <section style={{ background: C.cream, padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
        <div>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: C.greenMid, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            About Innerframe
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 700, color: C.greenDark, lineHeight: 1.2, letterSpacing: '-0.01em', marginBottom: '1.5rem' }}>
            We understand the operational reality of running a registered care facility.
          </h2>
        </div>
        <div>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', color: C.textMuted, lineHeight: 1.8, marginBottom: '1.25rem' }}>
            Running a South African old age home is not just about caring for residents — it is about managing a complex compliance environment, a multi-department operation, and the expectations of the Department of Social Development, all with limited administrative capacity.
          </p>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', color: C.textMuted, lineHeight: 1.8, marginBottom: '1.5rem' }}>
            Innerframe Care Solutions exists to close the gap between where most facilities are and where DSD requirements say they need to be. We do that through structured consulting and an ongoing client portal for document and compliance management.
          </p>
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
            {[['Two-sided', 'Consulting + portal'], ['SA-specific', 'DSD, POPIA, ZAR'], ['Five pillars', 'Full-facility coverage']].map(([head, sub]) => (
              <div key={head}>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 700, color: C.greenDark }}>{head}</p>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.8rem', color: C.textMuted, marginTop: 2 }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Pillars ─── */
function Pillars() {
  return (
    <section id="pillars" style={{ background: C.creamSurface, padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: C.greenMid, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            What We Do
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', fontWeight: 700, color: C.greenDark, lineHeight: 1.2, letterSpacing: '-0.01em', maxWidth: 560 }}>
            Five pillars. One compliant facility.
          </h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', color: C.textMuted, lineHeight: 1.7, maxWidth: 560, marginTop: '0.875rem' }}>
            Every registered care facility is assessed and structured across these five operational areas. No pillar is optional — DSD inspections cover all of them.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {pillars.map(p => {
            const Icon = p.icon
            return (
              <div key={p.slug} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: C.creamSurface, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} color={C.greenDark} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 700, color: C.greenDark, margin: 0 }}>{p.name}</h3>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', color: C.textMuted, margin: 0, fontStyle: 'italic' }}>{p.tagline}</p>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {p.items.map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.gold, flexShrink: 0 }} />
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', color: C.textMuted }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─── How It Works ─── */
function HowItWorks() {
  return (
    <section id="process" style={{ background: C.greenDark, padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: C.gold, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            The Process
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', fontWeight: 700, color: C.cream, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            Three steps to a compliant facility.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          {steps.map((s, i) => (
            <div key={s.number} style={{ position: 'relative', paddingLeft: '1rem', borderLeft: `2px solid ${i === 0 ? C.gold : 'rgba(255,255,255,0.15)'}` }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', fontWeight: 700, color: i === 0 ? C.gold : 'rgba(255,255,255,0.2)', lineHeight: 1, marginBottom: '0.5rem' }}>{s.number}</p>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.15rem', fontWeight: 700, color: C.cream, marginBottom: '0.75rem' }}>{s.title}</h3>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', color: 'rgba(250,247,240,0.65)', lineHeight: 1.75 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Who It's For ─── */
function WhoItsFor() {
  return (
    <section style={{ background: C.cream, padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: C.greenMid, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Who It's For
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', fontWeight: 700, color: C.greenDark, lineHeight: 1.2, letterSpacing: '-0.01em', maxWidth: 480 }}>
            Built for the people who run South African care facilities.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {forCards.map(card => (
            <div key={card.role} style={{ background: C.creamSurface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '1.75rem' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 700, color: C.greenDark, marginBottom: '0.75rem' }}>{card.role}</h3>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.875rem', color: C.textMuted, lineHeight: 1.75 }}>{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Pricing ─── */
function Pricing() {
  return (
    <section id="pricing" style={{ background: C.creamSurface, padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: C.greenMid, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Pricing
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', fontWeight: 700, color: C.greenDark, lineHeight: 1.2, letterSpacing: '-0.01em', maxWidth: 480 }}>
            Transparent pricing. No surprises.
          </h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', color: C.textMuted, marginTop: '0.75rem', maxWidth: 500 }}>
            All pricing in ZAR. Contact us for a custom quote — scope varies by facility size and number of pillars required.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', maxWidth: 900 }}>
          {/* Consulting */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: '2rem' }}>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: C.greenMid, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Consulting Engagement</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.25rem', fontWeight: 700, color: C.greenDark, lineHeight: 1 }}>Custom</p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.8rem', color: C.textMuted, marginTop: '0.25rem', marginBottom: '1.5rem' }}>Quoted per facility</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['Full five-pillar assessment', 'System build & documentation', 'Staff training', 'DSD inspection preparation', 'Project report & handover'].map(item => (
                <li key={item} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={15} color={C.greenLight} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.875rem', color: C.textMuted }}>{item}</span>
                </li>
              ))}
            </ul>
            <a href="#contact" style={{ display: 'inline-block', marginTop: '1.75rem', background: C.greenDark, color: C.cream, fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.875rem', padding: '0.7rem 1.5rem', borderRadius: 8, textDecoration: 'none' }}>
              Request a Quote
            </a>
          </div>

          {/* Portal */}
          <div style={{ background: C.greenDark, border: `1px solid ${C.greenDark}`, borderRadius: 12, padding: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: C.gold, color: C.greenDark, fontFamily: "'Outfit', sans-serif", fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 4, letterSpacing: '0.05em' }}>
              ONGOING
            </div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Client Portal</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.25rem', fontWeight: 700, color: C.cream, lineHeight: 1 }}>Monthly</p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.8rem', color: 'rgba(250,247,240,0.55)', marginTop: '0.25rem', marginBottom: '1.5rem' }}>Per facility</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['Document management across all pillars', 'Compliance tracking dashboard', 'Resident records & care files', 'Staff file management', 'DSD inspection readiness view'].map(item => (
                <li key={item} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={15} color={C.gold} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.875rem', color: 'rgba(250,247,240,0.75)' }}>{item}</span>
                </li>
              ))}
            </ul>
            <a href="#contact" style={{ display: 'inline-block', marginTop: '1.75rem', background: C.gold, color: C.greenDark, fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.875rem', padding: '0.7rem 1.5rem', borderRadius: 8, textDecoration: 'none' }}>
              Get Access
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Contact ─── */
function ContactForm() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', facility: '', email: '', phone: '', message: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setSent(true)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.7rem 0.875rem', fontFamily: "'Outfit', sans-serif",
    fontSize: '0.9rem', color: C.text, background: '#fff',
    border: `1px solid ${C.border}`, borderRadius: 8, outline: 'none', boxSizing: 'border-box',
  }

  return (
    <section id="contact" style={{ background: C.cream, padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem', alignItems: 'start' }}>
        {/* Left */}
        <div>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: C.greenMid, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Get in Touch
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', fontWeight: 700, color: C.greenDark, lineHeight: 1.2, letterSpacing: '-0.01em', marginBottom: '1.25rem' }}>
            Let's talk about your facility.
          </h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', color: C.textMuted, lineHeight: 1.8, marginBottom: '2rem' }}>
            Tell us about your facility and where you're at with DSD compliance. We'll come back to you within one business day.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {[
              { icon: Phone, text: '+27 (0) 000 000 0000' },
              { icon: Mail, text: 'info@innerframe.co.za' },
              { icon: MapPin, text: 'South Africa (nationwide)' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: C.creamSurface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={C.greenDark} />
                </div>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', color: C.textMuted }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ background: C.creamSurface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '2rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle2 size={40} color={C.greenLight} style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: C.greenDark, marginBottom: '0.5rem' }}>Message received</h3>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', color: C.textMuted }}>We'll be in touch within one business day.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', fontWeight: 600, color: C.greenDark }}>Your Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Jane Dlamini" style={inputStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', fontWeight: 600, color: C.greenDark }}>Facility Name</label>
                  <input name="facility" value={form.facility} onChange={handleChange} required placeholder="Sunview Care Home" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', fontWeight: 600, color: C.greenDark }}>Email Address</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="jane@sunviewcare.co.za" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', fontWeight: 600, color: C.greenDark }}>Phone Number</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+27 82 000 0000" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', fontWeight: 600, color: C.greenDark }}>Tell us about your situation</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={4} placeholder="E.g. We have a DSD inspection coming up in 3 months and our compliance files are incomplete..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <button type="submit" disabled={loading} style={{
                background: loading ? C.greenMid : C.greenDark, color: C.cream,
                fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.9rem',
                padding: '0.85rem', borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'background 0.15s',
              }}>
                {loading ? 'Sending…' : <><span>Send Message</span><ArrowRight size={16} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer style={{ background: C.greenDark, padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
        <div style={{ maxWidth: 320 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.75rem' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.35rem', fontWeight: 700, color: C.cream }}>Innerframe</span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.65rem', fontWeight: 500, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Care Solutions</span>
          </div>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem', color: 'rgba(250,247,240,0.55)', lineHeight: 1.7 }}>
            Structured. Compliant. Compassionate.<br />Stronger structures. Better care. Brighter futures.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '3.5rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Services</p>
            {['Facility Assessment', 'System Build', 'Staff Training', 'Client Portal', 'Compliance Support'].map(item => (
              <p key={item} style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem', color: 'rgba(250,247,240,0.55)', marginBottom: '0.35rem' }}>{item}</p>
            ))}
          </div>
          <div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Pillars</p>
            {['Admin Office', 'Finance', 'Kitchen', 'Medical', 'Board Governance'].map(item => (
              <p key={item} style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem', color: 'rgba(250,247,240,0.55)', marginBottom: '0.35rem' }}>{item}</p>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1120, margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.5rem' }}>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', color: 'rgba(250,247,240,0.35)' }}>
          © {new Date().getFullYear()} Innerframe Care Solutions. All rights reserved.
        </p>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', color: 'rgba(250,247,240,0.35)' }}>
          Registered in South Africa
        </p>
      </div>
    </footer>
  )
}

/* ─── Page ─── */
export default function Landing2Page() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 68 }}>
        <Hero />
        <WhoWeAre />
        <Pillars />
        <HowItWorks />
        <WhoItsFor />
        <Pricing />
        <ContactForm />
      </main>
      <Footer />
    </>
  )
}
