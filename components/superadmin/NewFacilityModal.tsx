import { useState } from 'react'
import { X, Building2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiPost } from '@/lib/api/client'

// Slug auto-derived from name; user can override
const schema = z.object({
  name: z.string().min(2, 'Facility name is required'),
  adminEmail: z.string().email('Enter a valid email address'),
})

type FormData = z.infer<typeof schema>

export interface NewFacilityResult {
  id: string
  name: string
  slug: string
  createdAt: string
}

interface Props {
  onClose: () => void
  onSuccess: (facility: NewFacilityResult) => void
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs" style={{ color: '#dc2626' }} role="alert">{message}</p>
}

export function NewFacilityModal({ onClose, onSuccess }: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const nameValue = watch('name', '')
  const derivedSlug = slugify(nameValue)

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)

    // Step 1 — create the organisation
    let org: { id: string; name: string; slug: string; created_at: string }
    try {
      org = await apiPost('/organisations', {
        name: data.name.trim(),
        slug: derivedSlug || 'facility',
        country_code: 'ZA',
        plan_code: 'standard',
      })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create facility.')
      return
    }

    // Step 2 — invite the admin (best-effort; org is already created)
    try {
      await apiPost(`/organisations/${org.id}/invite`, {
        email: data.adminEmail.trim(),
        role_code: 'admin',
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setSubmitError(`Facility created but admin invite failed: ${msg}. You can invite them from the facility settings.`)
      // Still call onSuccess so the org appears in the list
      onSuccess({ id: org.id, name: org.name, slug: org.slug, createdAt: org.created_at })
      return
    }

    onSuccess({ id: org.id, name: org.name, slug: org.slug, createdAt: org.created_at })
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
            <h2 className="text-sm font-semibold" style={{ color: '#1E3A2F', fontFamily: "'Outfit', system-ui" }}>New Facility</h2>
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
            Creates the facility and sends an invite email to the admin. The admin sets their password on first login.
          </p>

          {/* Facility name */}
          <div>
            <label htmlFor="nf-name" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>
              Facility Name
            </label>
            <input
              id="nf-name"
              type="text"
              placeholder="Sunrise Care Home"
              autoComplete="off"
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
              style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
              {...register('name')}
              onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
              onBlur={e => { e.target.style.borderColor = '#ddd6c8'; register('name').onBlur(e) }}
            />
            {derivedSlug && (
              <p className="mt-1 text-xs font-mono" style={{ color: '#9ca3af' }}>
                slug: {derivedSlug}
              </p>
            )}
            <FieldError message={errors.name?.message} />
          </div>

          {/* Admin email */}
          <div>
            <label htmlFor="nf-admin-email" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>
              Admin Email
            </label>
            <input
              id="nf-admin-email"
              type="email"
              placeholder="manager@sunrisecare.co.za"
              autoComplete="off"
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
              style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
              {...register('adminEmail')}
              onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
              onBlur={e => { e.target.style.borderColor = '#ddd6c8'; register('adminEmail').onBlur(e) }}
            />
            <p className="mt-1 text-xs" style={{ color: '#5a5a5a' }}>An invite email will be sent to this address.</p>
            <FieldError message={errors.adminEmail?.message} />
          </div>

          {submitError && (
            <div className="px-3 py-2.5 rounded-lg border text-xs" style={{ color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' }} role="alert">
              {submitError}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors"
              style={{ borderColor: '#ddd6c8', color: '#5a5a5a' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#1E3A2F'; el.style.color = '#1E3A2F' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#ddd6c8'; el.style.color = '#5a5a5a' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
