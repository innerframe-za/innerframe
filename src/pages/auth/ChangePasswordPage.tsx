import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirm: z.string(),
  })
  .refine(d => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

type FormData = z.infer<typeof schema>

function borderFocus(e: React.FocusEvent<HTMLInputElement>) { e.target.style.borderColor = '#1E3A2F' }
function borderBlur(e: React.FocusEvent<HTMLInputElement>) { e.target.style.borderColor = '#ddd6c8' }

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    let supabase: ReturnType<typeof createClient>
    try { supabase = createClient() } catch {
      setError('App is not configured correctly.')
      return
    }

    // Update password and clear the force_password_change flag
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password,
      data: { force_password_change: false },
    })

    if (updateError) {
      setError(updateError.message)
      return
    }

    // Redirect to the correct portal based on role
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user!.id)
      .single()

    navigate(profile?.role === 'super_admin' ? '/superadmin' : '/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="w-full max-w-[400px] bg-white rounded-2xl border p-8" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(30,58,47,0.08)' }}>
            <ShieldCheck size={24} style={{ color: '#1E3A2F' }} />
          </div>
          <h1 className="text-lg font-medium" style={{ color: '#1E3A2F' }}>Set your password</h1>
          <p className="text-sm mt-1 text-center" style={{ color: '#5a5a5a' }}>
            Choose a secure password to protect your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>
              New Password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                className="w-full px-3 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-colors"
                style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
                onFocus={borderFocus}
                aria-invalid={!!errors.password}
                {...register('password')}
                onBlur={e => { borderBlur(e); register('password').onBlur(e) }}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#5a5a5a' }} aria-label={showPassword ? 'Hide' : 'Show'}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs" style={{ color: '#dc2626' }} role="alert">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-colors"
                style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
                onFocus={borderFocus}
                aria-invalid={!!errors.confirm}
                {...register('confirm')}
                onBlur={e => { borderBlur(e); register('confirm').onBlur(e) }}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#5a5a5a' }} aria-label={showConfirm ? 'Hide' : 'Show'}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirm && <p className="mt-1 text-xs" style={{ color: '#dc2626' }} role="alert">{errors.confirm.message}</p>}
          </div>

          {error && (
            <div className="px-3 py-2.5 rounded border text-xs" style={{ color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' }} role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-medium mt-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
            onMouseEnter={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2D5A3D' }}
            onMouseLeave={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E3A2F' }}
          >
            {isSubmitting
              ? <><span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }} />Saving...</>
              : 'Set Password & Continue'
            }
          </button>
        </form>
      </div>
    </div>
  )
}
