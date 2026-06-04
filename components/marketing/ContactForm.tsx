import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send, CheckCircle } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Please enter your name').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^[0-9+\s\-()]{7,20}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  facility: z.string().min(2, 'Please enter your facility name').max(200),
  message: z
    .string()
    .min(10, 'Please tell us a bit more (min 10 characters)')
    .max(2000),
})

type ContactFormData = z.infer<typeof schema>

const inputBase =
  'w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors'
const inputStyle = { borderColor: '#ddd6c8', color: '#1a1a1a' }

function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#334739'
}
function handleBlurStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#ddd6c8'
}

/**
 * Contact form that POSTs to the n8n webhook URL via NEXT_PUBLIC_N8N_WEBHOOK_URL.
 * Validates with zod before submitting. Never exposes the webhook URL in source.
 */
export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
  })

  // Destructure all registers upfront so we can merge onBlur without collisions
  const nameReg = register('name')
  const emailReg = register('email')
  const phoneReg = register('phone')
  const facilityReg = register('facility')
  const messageReg = register('message')

  const onSubmit = async (data: ContactFormData) => {
    setError(null)
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL

    if (!webhookUrl) {
      setError('Contact form is not configured yet. Please email us directly.')
      return
    }

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source: 'innerframe-website',
          timestamp: new Date().toISOString(),
        }),
      })

      if (!res.ok) throw new Error('Submission failed')

      setSubmitted(true)
      reset()
    } catch {
      setError(
        'Something went wrong submitting the form. Please try again or email us directly.'
      )
    }
  }

  if (submitted) {
    return (
      <section
        id="contact"
        className="py-20 px-6"
        style={{ backgroundColor: '#334739' }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'rgba(212,175,55,0.15)' }}
          >
            <CheckCircle size={32} style={{ color: '#d3b24b' }} />
          </div>
          <h2 className="text-2xl font-semibold mb-3" style={{ color: '#faf7f0', fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'normal' }}>
            Message received
          </h2>
          <p className="text-sm" style={{ color: 'rgba(245,240,232,0.7)' }}>
            Thank you for reaching out. A member of the Innerframe team will be
            in touch within one business day.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="contact"
      className="py-20 px-6"
      style={{ backgroundColor: '#334739' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: heading + context */}
          <div>
            <div className="inline-block mb-6">
              <h2
                className="text-3xl font-semibold gold-underline"
                style={{ color: '#faf7f0', fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'normal' }}
              >
                Get in Touch
              </h2>
            </div>
            <p
              className="text-base leading-relaxed mb-8"
              style={{ color: 'rgba(245,240,232,0.75)' }}
            >
              Ready to bring structure to your facility? Tell us about your old
              age home and we&apos;ll be in touch to arrange a no-obligation
              assessment.
            </p>
            <div className="space-y-4">
              {[
                { label: 'Based in South Africa', sub: 'Serving facilities nationwide' },
                { label: 'DSD Compliance Specialists', sub: 'Section 20 & 21 ready' },
                { label: 'No long-term contracts required', sub: 'Start with an assessment' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                    style={{ backgroundColor: '#d3b24b' }}
                    aria-hidden="true"
                  />
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#faf7f0' }}>
                      {item.label}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(245,240,232,0.55)' }}>
                      {item.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-xl p-8 border"
            style={{ backgroundColor: '#ffffff', borderColor: '#ddd6c8' }}
            noValidate
          >
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: '#1a1a1a' }}
                >
                  Your Name <span style={{ color: '#d3b24b' }}>*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Jane Smith"
                  className={inputBase}
                  style={inputStyle}
                  onFocus={handleFocus}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  {...nameReg}
                  onBlur={e => { handleBlurStyle(e); nameReg.onBlur(e) }}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-xs" style={{ color: '#dc2626' }} role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Facility */}
              <div>
                <label
                  htmlFor="facility"
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: '#1a1a1a' }}
                >
                  Facility Name <span style={{ color: '#d3b24b' }}>*</span>
                </label>
                <input
                  id="facility"
                  type="text"
                  placeholder="Sunrise Old Age Home"
                  className={inputBase}
                  style={inputStyle}
                  onFocus={handleFocus}
                  aria-invalid={!!errors.facility}
                  aria-describedby={errors.facility ? 'facility-error' : undefined}
                  {...facilityReg}
                  onBlur={e => { handleBlurStyle(e); facilityReg.onBlur(e) }}
                />
                {errors.facility && (
                  <p id="facility-error" className="mt-1 text-xs" style={{ color: '#dc2626' }} role="alert">
                    {errors.facility.message}
                  </p>
                )}
              </div>

              {/* Email + Phone row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: '#1a1a1a' }}
                  >
                    Email <span style={{ color: '#d3b24b' }}>*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="jane@facility.co.za"
                    className={inputBase}
                    style={inputStyle}
                    onFocus={handleFocus}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    {...emailReg}
                    onBlur={e => { handleBlurStyle(e); emailReg.onBlur(e) }}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-xs" style={{ color: '#dc2626' }} role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: '#1a1a1a' }}
                  >
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="012 345 6789"
                    className={inputBase}
                    style={inputStyle}
                    onFocus={handleFocus}
                    aria-invalid={!!errors.phone}
                    {...phoneReg}
                    onBlur={e => { handleBlurStyle(e); phoneReg.onBlur(e) }}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs" style={{ color: '#dc2626' }} role="alert">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: '#1a1a1a' }}
                >
                  Tell us about your facility{' '}
                  <span style={{ color: '#d3b24b' }}>*</span>
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Tell us your biggest operational challenges, current compliance status, and what you're hoping to achieve..."
                  className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors resize-none"
                  style={inputStyle}
                  onFocus={handleFocus}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                  {...messageReg}
                  onBlur={e => { handleBlurStyle(e); messageReg.onBlur(e) }}
                />
                {errors.message && (
                  <p id="message-error" className="mt-1 text-xs" style={{ color: '#dc2626' }} role="alert">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Server error */}
              {error && (
                <p
                  className="text-xs p-3 rounded border"
                  style={{ color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' }}
                  role="alert"
                >
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded text-sm font-medium transition-[transform,background-color] duration-150 ease-out disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.97]"
                style={{ backgroundColor: '#334739', color: '#ffffff' }}
                onMouseEnter={e => {
                  if (!isSubmitting)
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2D5A3D'
                }}
                onMouseLeave={e => {
                  if (!isSubmitting)
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#334739'
                }}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="w-4 h-4 rounded-full border-2 animate-spin"
                      style={{
                        borderColor: 'rgba(255,255,255,0.3)',
                        borderTopColor: '#ffffff',
                      }}
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
