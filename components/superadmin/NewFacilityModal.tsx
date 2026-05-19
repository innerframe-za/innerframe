import { useState } from 'react'
import { X, Eye, EyeOff, Building2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  facilityName: z.string().min(2, 'Facility name is required'),
  adminName: z.string().min(2, 'Admin full name is required'),
  adminEmail: z.string().email('Enter a valid email address'),
  adminPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
})

type FormData = z.infer<typeof schema>

export interface NewFacilityResult {
  id: string
  name: string
  contactEmail: string | null
  contactPhone: string | null
  createdAt: string
  staffCount: number
  residentCount: number
}

interface Props {
  onClose: () => void
  onSuccess: (facility: NewFacilityResult) => void
}

const WEBHOOK_URL = import.meta.env.VITE_N8N_INVITE_WEBHOOK_URL as string | undefined

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs" style={{ color: '#dc2626' }} role="alert">{message}</p>
}

export function NewFacilityModal({ onClose, onSuccess }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)

    if (!WEBHOOK_URL) {
      setSubmitError('Invite webhook is not configured. Set VITE_N8N_INVITE_WEBHOOK_URL in .env.local')
      return
    }

    let supabase: ReturnType<typeof createClient>
    try {
      supabase = createClient()
    } catch {
      setSubmitError('App is not configured correctly.')
      return
    }

    // Step 1 — create the organisation row (super admin RLS bypass allows this)
    const { data: org, error: orgErr } = await supabase
      .from('organisations')
      .insert({ name: data.facilityName, contact_email: data.adminEmail })
      .select('id, name, contact_email, contact_phone, created_at')
      .single()

    if (orgErr || !org) {
      setSubmitError(orgErr?.message ?? 'Failed to create organisation.')
      return
    }

    // Step 2 — invite the home_admin via n8n (keeps service role key off the frontend)
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.adminEmail,
          password: data.adminPassword,
          fullName: data.adminName,
          role: 'home_admin',
          orgId: org.id,
        }),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok || json.ok === false) {
        // Clean up the orphaned org so the super admin can retry cleanly
        await supabase.from('organisations').delete().eq('id', org.id)
        setSubmitError(json.error ?? `Invite failed (${res.status}). Facility was not saved. Check n8n logs.`)
        return
      }
    } catch {
      await supabase.from('organisations').delete().eq('id', org.id)
      setSubmitError('Could not reach the invite service. Facility was not saved. Check your n8n instance.')
      return
    }

    onSuccess({
      id: org.id,
      name: org.name,
      contactEmail: org.contact_email,
      contactPhone: org.contact_phone,
      createdAt: org.created_at,
      staffCount: 1, // the new home_admin counts as staff
      residentCount: 0,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl border shadow-xl" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#ddd6c8' }}>
          <div className="flex items-center gap-2.5">
            <Building2 size={16} style={{ color: '#1E3A2F' }} />
            <h2 className="text-sm font-semibold" style={{ color: '#1E3A2F' }}>New Facility</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors"
            style={{ color: '#5a5a5a' }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#1a1a1a')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#5a5a5a')}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
          <p className="text-xs" style={{ color: '#5a5a5a' }}>
            Creates the facility and invites the home admin. They'll be prompted to set a permanent password on first login.
          </p>

          {/* Facility name */}
          <div>
            <label htmlFor="nf-name" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>Facility Name</label>
            <input
              id="nf-name"
              type="text"
              placeholder="Sunrise Care Home"
              autoComplete="off"
              className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors"
              style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
              {...register('facilityName')}
              onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
              onBlur={e => { e.target.style.borderColor = '#ddd6c8'; register('facilityName').onBlur(e) }}
            />
            <FieldError message={errors.facilityName?.message} />
          </div>

          <div className="border-t pt-4" style={{ borderColor: '#ddd6c8' }}>
            <p className="text-xs font-medium mb-3" style={{ color: '#5a5a5a' }}>Home Admin Account</p>

            {/* Admin full name */}
            <div className="space-y-4">
              <div>
                <label htmlFor="nf-admin-name" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>Full Name</label>
                <input
                  id="nf-admin-name"
                  type="text"
                  placeholder="Jane Manager"
                  autoComplete="off"
                  className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors"
                  style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
                  {...register('adminName')}
                  onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                  onBlur={e => { e.target.style.borderColor = '#ddd6c8'; register('adminName').onBlur(e) }}
                />
                <FieldError message={errors.adminName?.message} />
              </div>

              {/* Admin email */}
              <div>
                <label htmlFor="nf-admin-email" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>Email Address</label>
                <input
                  id="nf-admin-email"
                  type="email"
                  placeholder="jane@sunrisecare.co.za"
                  autoComplete="off"
                  className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors"
                  style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
                  {...register('adminEmail')}
                  onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                  onBlur={e => { e.target.style.borderColor = '#ddd6c8'; register('adminEmail').onBlur(e) }}
                />
                <FieldError message={errors.adminEmail?.message} />
              </div>

              {/* Temp password */}
              <div>
                <label htmlFor="nf-admin-password" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>Temporary Password</label>
                <div className="relative">
                  <input
                    id="nf-admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 chars, 1 uppercase, 1 number"
                    autoComplete="new-password"
                    className="w-full px-3 py-2.5 pr-10 rounded border text-sm outline-none transition-colors"
                    style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
                    {...register('adminPassword')}
                    onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                    onBlur={e => { e.target.style.borderColor = '#ddd6c8'; register('adminPassword').onBlur(e) }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#5a5a5a' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <FieldError message={errors.adminPassword?.message} />
              </div>
            </div>
          </div>

          {submitError && (
            <div className="px-3 py-2.5 rounded border text-xs" style={{ color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' }} role="alert">
              {submitError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded border text-sm font-medium transition-colors"
              style={{ borderColor: '#ddd6c8', color: '#5a5a5a' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#1E3A2F'; el.style.color = '#1E3A2F' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#ddd6c8'; el.style.color = '#5a5a5a' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
              onMouseEnter={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2D5A3D' }}
              onMouseLeave={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E3A2F' }}
            >
              {isSubmitting
                ? <><span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }} />Creating...</>
                : <><Building2 size={14} />Create Facility</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
