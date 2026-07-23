import { useState } from 'react'
import { X, Building2, Loader2 } from 'lucide-react'
import { apiPost } from '@/lib/api/client'

export interface NewFacilityResult {
  id:        string
  name:      string
  slug:      string
  createdAt: string
}

interface Props {
  onClose:   () => void
  onSuccess: (result: NewFacilityResult) => void
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
}

export function NewFacilityModal({ onClose, onSuccess }: Props) {
  const [name, setName]           = useState('')
  const [slug, setSlug]           = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]         = useState<string | null>(null)

  function handleNameChange(value: string) {
    setName(value)
    if (!slugTouched) setSlug(toSlug(value))
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true)
    setSlug(toSlug(value))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await apiPost<{ id: string; slug: string; status: string }>('/organisations', {
        name:         name.trim(),
        slug:         slug.trim(),
        country_code: 'ZA',
        plan_code:    'standard',
      })

      onSuccess({
        id:        res.id,
        name:      name.trim(),
        slug:      res.slug,
        createdAt: new Date().toISOString(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        style={{ border: '0.5px solid #ddd6c8' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: '0.5px solid #ddd6c8' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(30,58,47,0.08)' }}>
              <Building2 size={16} style={{ color: '#1E3A2F' }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: '#1E3A2F', fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '-0.01em' }}>
                New Facility
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#5a5a5a' }}>A dedicated database will be provisioned automatically.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#5a5a5a' }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F5F0E8')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent')}
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#1E3A2F', fontFamily: "'Outfit', system-ui" }}>
              Facility Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Sunrise Care Home"
              maxLength={100}
              required
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                border: '1px solid #ddd6c8',
                fontFamily: "'Plus Jakarta Sans', system-ui",
                color: '#1a1a1a',
              }}
              onFocus={e => ((e.currentTarget as HTMLInputElement).style.borderColor = '#1E3A2F')}
              onBlur={e => ((e.currentTarget as HTMLInputElement).style.borderColor = '#ddd6c8')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#1E3A2F', fontFamily: "'Outfit', system-ui" }}>
              Slug <span className="font-normal" style={{ color: '#5a5a5a' }}>(used in URLs and the database name)</span>
            </label>
            <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid #ddd6c8' }}>
              <span className="px-3 py-2.5 text-sm select-none" style={{ backgroundColor: '#F5F0E8', color: '#5a5a5a', borderRight: '1px solid #ddd6c8' }}>
                /
              </span>
              <input
                type="text"
                value={slug}
                onChange={e => handleSlugChange(e.target.value)}
                placeholder="sunrise-care-home"
                maxLength={50}
                required
                className="flex-1 px-3 py-2.5 text-sm font-mono outline-none"
                style={{ color: '#1a1a1a' }}
                onFocus={e => ((e.currentTarget as HTMLInputElement).closest('div')!.style.borderColor = '#1E3A2F')}
                onBlur={e => ((e.currentTarget as HTMLInputElement).closest('div')!.style.borderColor = '#ddd6c8')}
              />
            </div>
            {slug && (
              <p className="text-xs mt-1.5" style={{ color: '#5a5a5a' }}>
                DB will be named <span className="font-mono" style={{ color: '#1E3A2F' }}>tenant_{slug.replace(/-/g, '_')}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="px-3 py-2.5 rounded-lg text-xs" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ border: '1px solid #ddd6c8', color: '#5a5a5a' }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F5F0E8')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim() || !slug.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
              onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2D5A3D' }}
              onMouseLeave={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E3A2F' }}
            >
              {submitting ? (
                <><Loader2 size={14} className="animate-spin" /> Provisioning…</>
              ) : (
                'Create Facility'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
