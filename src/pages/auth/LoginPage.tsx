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

function focusInput(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = '#334739'
  e.target.style.boxShadow = '0 0 0 3px rgba(51,71,57,0.09)'
}
function blurInput(e: React.FocusEvent<HTMLInputElement>, hasError: boolean) {
  e.target.style.borderColor = hasError ? '#dc2626' : '#ddd6c8'
  e.target.style.boxShadow = 'none'
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
    <div className="min-h-[100dvh] flex flex-col lg:flex-row">

      {/* ── Left brand panel (desktop only) ── */}
      <div
        className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between p-12 xl:p-16 relative overflow-hidden"
        style={{ backgroundColor: '#334739' }}
      >
        {/* Subtle dot texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(250,247,240,0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Tagline */}
        <div className="relative z-10">
          <p
            className="leading-[1.12] mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(2rem, 3vw, 2.75rem)',
              color: '#faf7f0',
              fontWeight: 400,
            }}
          >
            Structured care,<br />
            <em>simplified.</em>
          </p>
          <div style={{ width: 28, height: 2, backgroundColor: '#d3b24b' }} />
          <p
            className="mt-4 text-sm leading-relaxed max-w-[240px]"
            style={{ color: 'rgba(250,247,240,0.5)', fontFamily: "'Outfit', sans-serif" }}
          >
            Compliance, operations, and staff management built for South African care homes.
          </p>
        </div>

        {/* Footer */}
        <p
          className="relative z-10 text-xs"
          style={{ color: 'rgba(250,247,240,0.28)', fontFamily: "'Outfit', sans-serif" }}
        >
          Innerframe Care Solutions
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-14 sm:px-10"
        style={{ backgroundColor: '#faf7f0' }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-10">
          <img
            src="/logo.jpeg"
            alt="Innerframe Care Solutions"
            className="w-12 h-12 rounded-lg object-cover mb-3"
          />
          <span
            className="text-sm font-medium"
            style={{ color: '#334739', fontFamily: "'Outfit', sans-serif" }}
          >
            Innerframe Care Solutions
          </span>
        </div>

        <div className="w-full max-w-[360px]">
          {/* Heading */}
          <div className="mb-8">
            <h1
              className="text-2xl font-semibold mb-1.5 tracking-tight"
              style={{ color: '#1a1a1a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Welcome back
            </h1>
            <p
              className="text-sm"
              style={{ color: '#5a5a5a', fontFamily: "'Outfit', sans-serif" }}
            >
              Sign in to your portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Email / Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="identifier"
                className="block text-xs font-medium"
                style={{ color: '#1a1a1a', fontFamily: "'Outfit', sans-serif" }}
              >
                Email or Username
              </label>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                placeholder="your@email.co.za or username"
                aria-invalid={!!errors.identifier}
                className="w-full px-4 py-2.5 text-sm rounded-lg border outline-none"
                style={{
                  borderColor: errors.identifier ? '#dc2626' : '#ddd6c8',
                  backgroundColor: '#ffffff',
                  color: '#1a1a1a',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  fontFamily: "'Outfit', sans-serif",
                }}
                onFocus={focusInput}
                {...identifierReg}
                onBlur={e => { blurInput(e, !!errors.identifier); identifierReg.onBlur(e) }}
              />
              {errors.identifier && (
                <p className="text-xs" style={{ color: '#dc2626' }} role="alert">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium"
                style={{ color: '#1a1a1a', fontFamily: "'Outfit', sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  className="w-full px-4 py-2.5 pr-10 text-sm rounded-lg border outline-none"
                  style={{
                    borderColor: errors.password ? '#dc2626' : '#ddd6c8',
                    backgroundColor: '#ffffff',
                    color: '#1a1a1a',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                  onFocus={focusInput}
                  {...passwordReg}
                  onBlur={e => { blurInput(e, !!errors.password); passwordReg.onBlur(e) }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{ color: '#698169' }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs" style={{ color: '#dc2626' }} role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Auth error */}
            {authError && (
              <div
                className="px-3.5 py-3 rounded-lg border text-xs leading-relaxed"
                style={{ color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' }}
                role="alert"
              >
                {authError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-semibold mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#334739',
                color: '#ffffff',
                transition: 'background-color 0.15s ease, transform 0.1s ease',
                fontFamily: "'Outfit', sans-serif",
              }}
              onMouseEnter={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3B6B4A' }}
              onMouseLeave={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#334739' }}
              onMouseDown={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)' }}
              onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="w-4 h-4 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }}
                  />
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <p
            className="text-xs text-center mt-7"
            style={{ color: '#5a5a5a', fontFamily: "'Outfit', sans-serif" }}
          >
            Contact your administrator to get access.
          </p>
        </div>
      </div>

    </div>
  )
}
