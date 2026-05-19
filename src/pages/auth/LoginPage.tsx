import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

async function getRoleDestination(supabase: ReturnType<typeof createClient>, userId: string): Promise<string> {
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()
  return data?.role === 'super_admin' ? '/superadmin' : '/dashboard'
}

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof schema>

function borderFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = '#1E3A2F'
}
function borderBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = '#ddd6c8'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Redirect to the correct portal if already logged in
  useEffect(() => {
    let supabase: ReturnType<typeof createClient>
    try { supabase = createClient() } catch { return }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const dest = await getRoleDestination(supabase, session.user.id).catch(() => '/dashboard')
        navigate(dest, { replace: true })
      }
    }).catch(() => {})
  }, [navigate])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
  })

  const emailReg = register('email')
  const passwordReg = register('password')

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null)
    let supabase: ReturnType<typeof createClient>
    try {
      supabase = createClient()
    } catch {
      setAuthError('App is not configured correctly. Please contact support.')
      return
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (error) {
        setAuthError(
          error.message === 'Invalid login credentials'
            ? 'Incorrect email or password. Please try again.'
            : error.message
        )
        return
      }
      const { data: { session } } = await supabase.auth.getSession()
      const dest = session ? await getRoleDestination(supabase, session.user.id).catch(() => '/dashboard') : '/dashboard'
      navigate(dest)
    } catch {
      setAuthError('Sign in failed. If you have an ad blocker, try disabling it for this site.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="w-full max-w-[400px] bg-white rounded-2xl border p-8" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.jpeg" alt="Innerframe Care Solutions" width={120} height={60} className="object-contain rounded mb-4" />
          <h1 className="text-lg font-medium" style={{ color: '#1E3A2F' }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: '#5a5a5a' }}>Sign in to your portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>
              Email address
            </label>
            <input
              id="email" type="email" autoComplete="email" placeholder="your@email.co.za"
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
              style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
              onFocus={borderFocus} aria-invalid={!!errors.email}
              {...emailReg} onBlur={e => { borderBlur(e); emailReg.onBlur(e) }}
            />
            {errors.email && <p className="mt-1 text-xs" style={{ color: '#dc2626' }} role="alert">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>
              Password
            </label>
            <div className="relative">
              <input
                id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-colors"
                style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
                onFocus={borderFocus} aria-invalid={!!errors.password}
                {...passwordReg} onBlur={e => { borderBlur(e); passwordReg.onBlur(e) }}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ color: '#5a5a5a' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs" style={{ color: '#dc2626' }} role="alert">{errors.password.message}</p>}
          </div>

          {authError && (
            <div className="px-3 py-2.5 rounded border text-xs" style={{ color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' }} role="alert">
              {authError}
            </div>
          )}

          <button
            type="submit" disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-medium mt-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
            onMouseEnter={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2D5A3D' }}
            onMouseLeave={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E3A2F' }}
          >
            {isSubmitting ? (
              <><span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }} />Signing in...</>
            ) : 'Sign in'}
          </button>
        </form>

        <p className="text-xs text-center mt-6" style={{ color: '#5a5a5a' }}>
          Contact your administrator to get access.
        </p>
      </div>
    </div>
  )
}
