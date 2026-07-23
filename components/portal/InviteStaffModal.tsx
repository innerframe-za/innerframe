import { useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiPost } from '@/lib/api/client'

const schema = z.object({
  email:     z.string().email('Enter a valid email address'),
  role_code: z.enum(['org_admin', 'care_manager', 'nurse', 'carer', 'admin_staff', 'viewer']),
})

type FormData = z.infer<typeof schema>

interface InviteStaffModalProps {
  orgId: string
  onClose: () => void
  onSuccess: (member: { id: string; email: string; role: string }) => void
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs" style={{ color: '#dc2626' }} role="alert">{message}</p>
}

export function InviteStaffModal({ orgId, onClose, onSuccess }: InviteStaffModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role_code: 'care_manager' },
  })

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    try {
      const res = await apiPost<{ membership_id: string; message?: string }>(
        `/organisations/${orgId}/invite`,
        { email: data.email, role_code: data.role_code }
      )
      onSuccess({ id: res.membership_id ?? crypto.randomUUID(), email: data.email, role: data.role_code })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to send invitation. Please try again.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border shadow-xl"
        style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#ddd6c8' }}>
          <div className="flex items-center gap-2.5">
            <UserPlus size={16} style={{ color: '#1E3A2F' }} />
            <h2 className="text-sm font-semibold" style={{ color: '#1E3A2F' }}>Invite Staff Member</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
          <p className="text-xs" style={{ color: '#5a5a5a' }}>
            An invitation email will be sent to the staff member. They will be prompted to set a password on first login.
          </p>

          {/* Email */}
          <div>
            <label htmlFor="inv-email" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>
              Email Address *
            </label>
            <input
              id="inv-email"
              type="email"
              placeholder="jane@yourfacility.co.za"
              autoComplete="off"
              className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors"
              style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
              {...register('email')}
              onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
              onBlur={e => { e.target.style.borderColor = '#ddd6c8'; register('email').onBlur(e) }}
            />
            <FieldError message={errors.email?.message} />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="inv-role" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>Role</label>
            <select
              id="inv-role"
              className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors bg-white"
              style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
              {...register('role_code')}
              onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
              onBlur={e => { e.target.style.borderColor = '#ddd6c8'; register('role_code').onBlur(e) }}
            >
              <option value="org_admin">Org Admin</option>
              <option value="care_manager">Care Manager</option>
              <option value="nurse">Nurse</option>
              <option value="carer">Carer</option>
              <option value="admin_staff">Admin Staff</option>
              <option value="viewer">Viewer</option>
            </select>
            <FieldError message={errors.role_code?.message} />
          </div>

          {submitError && (
            <div
              className="px-3 py-2.5 rounded border text-xs"
              style={{ color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' }}
              role="alert"
            >
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
                ? <><span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }} />Sending...</>
                : <><UserPlus size={14} />Send Invitation</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
