import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send, CheckCircle, MapPin, Clock } from 'lucide-react'

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

const schema = z.object({
  name: z.string().min(2, 'Please enter your name').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^[0-9+\s\-()]{7,20}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  organisation: z.string().min(2, 'Please enter your organisation name').max(200),
  message: z
    .string()
    .min(10, 'Please tell us a bit more (min 10 characters)')
    .max(2000),
})

type FormData = z.infer<typeof schema>

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: `1.5px solid rgba(200,212,200,0.6)`,
  backgroundColor: C.ivory,
  color: C.slate,
  fontFamily: INTER,
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 150ms ease',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: INTER,
  fontWeight: 500,
  fontSize: '13px',
  color: C.slate,
  marginBottom: '6px',
  opacity: 0.8,
}

const CONTEXT_ITEMS = [
  { Icon: MapPin, label: 'Based in South Africa', sub: 'Serving care organisations nationwide' },
  { Icon: CheckCircle, label: 'DSD & POPIA specialists', sub: 'Regulatory experts in the SA care sector' },
  { Icon: Clock, label: 'Responds within one business day', sub: 'No obligation — start with a conversation' },
]

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
    if (!webhookUrl) {
      setServerError('Contact form is not configured. Please email us directly.')
      return
    }
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source: 'innerframe-website', timestamp: new Date().toISOString() }),
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
      reset()
    } catch {
      setServerError('Something went wrong. Please try again or email us directly.')
    }
  }

  if (submitted) {
    return (
      <section
        id="contact"
        style={{ backgroundColor: C.ivory, paddingTop: 'clamp(80px, 10vw, 120px)', paddingBottom: 'clamp(80px, 10vw, 120px)' }}
        className="px-6"
      >
        <div className="max-w-xl mx-auto text-center">
          <div
            style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(200,212,200,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
          >
            <CheckCircle size={28} strokeWidth={1.5} style={{ color: C.evergreen }} />
          </div>
          <h2 style={{ fontFamily: CORMORANT, fontWeight: 600, fontSize: '32px', color: C.slate, marginBottom: '12px' }}>
            Message received
          </h2>
          <p style={{ fontFamily: INTER, fontSize: '16px', lineHeight: 1.7, color: C.slate, opacity: 0.7 }}>
            Thank you for reaching out. A member of the Innerframe team will be in touch within one business day.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="contact"
      style={{
        backgroundColor: C.ivory,
        paddingTop: 'clamp(80px, 10vw, 120px)',
        paddingBottom: 'clamp(80px, 10vw, 120px)',
      }}
      className="px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left: context */}
          <div>
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
              Let's start a conversation
            </h2>
            <div style={{ width: '36px', height: '2px', backgroundColor: C.gold, marginBottom: '28px' }} />

            <p
              style={{
                fontFamily: INTER,
                fontSize: '18px',
                lineHeight: 1.75,
                color: C.slate,
                opacity: 0.72,
                maxWidth: '440px',
                marginBottom: '48px',
              }}
            >
              Tell us about your organisation and the challenges you're facing. We'll arrange a no-obligation assessment and show you what stronger foundations look like in practice.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {CONTEXT_ITEMS.map(({ Icon, label, sub }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(200,212,200,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} strokeWidth={1.5} style={{ color: C.evergreen }} aria-hidden="true" />
                  </div>
                  <div>
                    <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: '15px', color: C.slate, marginBottom: '3px' }}>
                      {label}
                    </div>
                    <div style={{ fontFamily: INTER, fontSize: '14px', color: C.slate, opacity: 0.6 }}>
                      {sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '40px',
                border: '1px solid rgba(200,212,200,0.5)',
                boxShadow: '0 2px 8px rgba(73,99,83,0.06), 0 8px 24px rgba(73,99,83,0.05)',
              }}
              noValidate
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Name */}
                <div>
                  <label htmlFor="name" style={labelStyle}>
                    Your Name <span style={{ color: C.gold }}>*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Jane Smith"
                    style={inputStyle}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    {...register('name')}
                    onFocus={e => { e.target.style.borderColor = C.evergreen; e.target.style.boxShadow = '0 0 0 3px rgba(73,99,83,0.12)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(200,212,200,0.6)'; e.target.style.boxShadow = 'none' }}
                  />
                  {errors.name && (
                    <p id="name-error" style={{ fontFamily: INTER, fontSize: '13px', color: '#dc2626', marginTop: '4px' }} role="alert">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Organisation */}
                <div>
                  <label htmlFor="organisation" style={labelStyle}>
                    Organisation <span style={{ color: C.gold }}>*</span>
                  </label>
                  <input
                    id="organisation"
                    type="text"
                    placeholder="Sunrise Care Home"
                    style={inputStyle}
                    aria-invalid={!!errors.organisation}
                    aria-describedby={errors.organisation ? 'org-error' : undefined}
                    {...register('organisation')}
                    onFocus={e => { e.target.style.borderColor = C.evergreen; e.target.style.boxShadow = '0 0 0 3px rgba(73,99,83,0.12)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(200,212,200,0.6)'; e.target.style.boxShadow = 'none' }}
                  />
                  {errors.organisation && (
                    <p id="org-error" style={{ fontFamily: INTER, fontSize: '13px', color: '#dc2626', marginTop: '4px' }} role="alert">
                      {errors.organisation.message}
                    </p>
                  )}
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" style={labelStyle}>
                      Email <span style={{ color: C.gold }}>*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="jane@carehome.co.za"
                      style={inputStyle}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      {...register('email')}
                      onFocus={e => (e.target.style.borderColor = C.evergreen)}
                      onBlur={e => (e.target.style.borderColor = 'rgba(200,212,200,0.6)')}
                    />
                    {errors.email && (
                      <p id="email-error" style={{ fontFamily: INTER, fontSize: '13px', color: '#dc2626', marginTop: '4px' }} role="alert">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" style={labelStyle}>Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="012 345 6789"
                      style={inputStyle}
                      {...register('phone')}
                      onFocus={e => (e.target.style.borderColor = C.evergreen)}
                      onBlur={e => (e.target.style.borderColor = 'rgba(200,212,200,0.6)')}
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" style={labelStyle}>
                    How can we help? <span style={{ color: C.gold }}>*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Tell us about your organisation, your current challenges, and what you're hoping to achieve..."
                    style={{ ...inputStyle, resize: 'none' }}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    {...register('message')}
                    onFocus={e => { e.target.style.borderColor = C.evergreen; e.target.style.boxShadow = '0 0 0 3px rgba(73,99,83,0.12)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(200,212,200,0.6)'; e.target.style.boxShadow = 'none' }}
                  />
                  {errors.message && (
                    <p id="message-error" style={{ fontFamily: INTER, fontSize: '13px', color: '#dc2626', marginTop: '4px' }} role="alert">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Server error */}
                {serverError && (
                  <p
                    style={{ fontFamily: INTER, fontSize: '13px', color: '#dc2626', padding: '12px 14px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}
                    role="alert"
                  >
                    {serverError}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    fontFamily: INTER,
                    fontWeight: 600,
                    fontSize: '15px',
                    backgroundColor: isSubmitting ? C.sage : C.evergreen,
                    color: '#ffffff',
                    borderRadius: '12px',
                    padding: '14px 28px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background-color 150ms ease',
                  }}
                  onMouseEnter={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3A5445' }}
                  onMouseLeave={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.evergreen }}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="animate-spin"
                        style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#ffffff',
                          borderRadius: '50%',
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send size={14} strokeWidth={2} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </section>
  )
}
