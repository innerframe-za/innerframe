import { useState } from 'react'
import { X, Eye, EyeOff, UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be 50 characters or less')
    .regex(/^[a-zA-Z0-9@._-]+$/, 'Only letters, numbers, @ . _ - allowed'),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  role: z.enum(['staff', 'home_admin']),
})

type FormData = z.infer<typeof schema>

interface InviteStaffModalProps {
  orgId: string
  onClose: () => void
  onSuccess: (member: { id: string; fullName: string; email: string; role: string; username: string }) => void
}

const WEBHOOK_URL = import.meta.env.VITE_N8N_ADD_STAFF_WEBHOOK_URL as string | undefined

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs" style={{ color: '#dc2626' }} role="alert">{message}</p>
}

export function InviteStaffModal({ orgId, onClose, onSuccess }: InviteStaffModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'staff' },
  })

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)

    if (!WEBHOOK_URL) {
      setSubmitError('Add staff webhook is not configured. Set VITE_N8N_ADD_STAFF_WEBHOOK_URL in .env.local')
      return
    }

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_email: data.email,
          admin_full_name: data.fullName,
          admin_password: data.password,
          role: data.role,
          org_id: orgId,
          username: data.username,
        }),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok || json.ok === false) {
        setSubmitError(json.error ?? `Request failed (${res.status}). Check n8n logs.`)
        return
      }

      // Supabase returns the created user — extract the id from the n8n response
      // n8n passes through the Supabase response body under $json
      const newUserId: string = json.id ?? json.user?.id ?? crypto.randomUUID()

      onSuccess({ id: newUserId, fullName: data.fullName, email: data.email, role: data.role, username: data.username })
    } catch {
      setSubmitError('Could not reach the invite service. Check your n8n instance is running.')
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl border shadow-xl" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }} onClick={e => e.stopPropagation()}>
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
            The staff member will be prompted to set a new password on first login.
          </p>

          {/* Full name */}
          <div>
            <label htmlFor="inv-name" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>Full Name</label>
            <input
              id="inv-name"
              type="text"
              placeholder="Jane Nurse"
              autoComplete="off"
              className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors"
              style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
              {...register('fullName')}
              onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
              onBlur={e => { e.target.style.borderColor = '#ddd6c8'; register('fullName').onBlur(e) }}
            />
            <FieldError message={errors.fullName?.message} />
          </div>

          {/* Username */}
          <div>
            <label htmlFor="inv-username" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>Username</label>
            <input
              id="inv-username"
              type="text"
              placeholder="jane@sunrisecare"
              autoComplete="off"
              className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors"
              style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
              {...register('username')}
              onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
              onBlur={e => { e.target.style.borderColor = '#ddd6c8'; register('username').onBlur(e) }}
            />
            <p className="mt-1 text-xs" style={{ color: '#5a5a5a' }}>Staff will use this to sign in instead of their email.</p>
            <FieldError message={errors.username?.message} />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="inv-email" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>Email Address</label>
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

          {/* Temporary password */}
          <div>
            <label htmlFor="inv-password" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>
              Temporary Password
            </label>
            <div className="relative">
              <input
                id="inv-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                autoComplete="new-password"
                className="w-full px-3 py-2.5 pr-10 rounded border text-sm outline-none transition-colors"
                style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
                {...register('password')}
                onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                onBlur={e => { e.target.style.borderColor = '#ddd6c8'; register('password').onBlur(e) }}
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
            <FieldError message={errors.password?.message} />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="inv-role" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>Role</label>
            <select
              id="inv-role"
              className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors bg-white"
              style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
              {...register('role')}
              onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
              onBlur={e => { e.target.style.borderColor = '#ddd6c8'; register('role').onBlur(e) }}
            >
              <option value="staff">Staff</option>
              <option value="home_admin">Home Admin</option>
            </select>
            <FieldError message={errors.role?.message} />
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
                : <><UserPlus size={14} />Create Account</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
