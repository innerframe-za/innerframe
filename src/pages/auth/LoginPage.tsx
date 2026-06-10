import { useState } from 'react'
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
  identifier: z.string().min(1, 'Email or username is required'),
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

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
  })

  const identifierReg = register('identifier')
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
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.identifier)
      let loginEmail = data.identifier

      if (!isEmail) {
        const { data: resolvedEmail } = await supabase.rpc('get_email_by_username', {
          p_username: data.identifier,
        })
        if (!resolvedEmail) {
          setAuthError('No account found with that username.')
          return
        }
        loginEmail = resolvedEmail as string
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: data.password,
      })
      if (error) {
        setAuthError(
          error.message === 'Invalid login credentials'
            ? 'Incorrect email/username or password. Please try again.'
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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#ffffff' }}>
      <div className="w-full max-w-[400px] rounded-2xl border p-8" style={{ backgroundColor: '#F5F0E8', borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.jpeg" alt="Innerframe Care Solutions" width={120} height={60} className="object-contain rounded mb-4" />
          <h1 className="text-lg font-medium" style={{ color: '#1E3A2F' }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: '#5a5a5a' }}>Sign in to your portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>
              Email or Username
            </label>
            <input
              id="identifier" type="text" autoComplete="username" placeholder="your@email.co.za or your username"
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
              style={{ borderColor: '#ddd6c8', color: '#1a1a1a', backgroundColor: '#ffffff' }}
              onFocus={borderFocus} aria-invalid={!!errors.identifier}
              {...identifierReg} onBlur={e => { borderBlur(e); identifierReg.onBlur(e) }}
            />
            {errors.identifier && <p className="mt-1 text-xs" style={{ color: '#dc2626' }} role="alert">{errors.identifier.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>
              Password
            </label>
            <div className="relative">
              <input
                id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-colors"
                style={{ borderColor: '#ddd6c8', color: '#1a1a1a', backgroundColor: '#ffffff' }}
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
