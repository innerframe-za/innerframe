'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof schema>

/** Shared inline focus/blur style handlers for form inputs */
function borderFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = '#1E3A2F'
}
function borderBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = '#ddd6c8'
}

/**
 * Login page — centered card on cream background.
 * Authenticates via Supabase Auth, redirects to /dashboard on success.
 */
export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
  })

  // Destructure register to merge onBlur without collision
  const emailReg = register('email')
  const passwordReg = register('password')

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null)
    const supabase = createClient()

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

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#F5F0E8' }}
    >
      <div
        className="w-full max-w-[400px] bg-white rounded-lg border p-8"
        style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.jpeg"
            alt="Innerframe Care Solutions"
            width={120}
            height={60}
            className="object-contain rounded mb-4"
          />
          <h1 className="text-lg font-medium" style={{ color: '#1E3A2F' }}>
            Welcome back
          </h1>
          <p className="text-sm mt-1" style={{ color: '#5a5a5a' }}>
            Sign in to your portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium mb-1.5"
              style={{ color: '#1a1a1a' }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="your@email.co.za"
              className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors"
              style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
              onFocus={borderFocus}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...emailReg}
              onBlur={e => {
                borderBlur(e)
                emailReg.onBlur(e)
              }}
            />
            {errors.email && (
              <p
                id="email-error"
                className="mt-1 text-xs"
                style={{ color: '#dc2626' }}
                role="alert"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium mb-1.5"
              style={{ color: '#1a1a1a' }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 rounded border text-sm outline-none transition-colors"
                style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
                onFocus={borderFocus}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...passwordReg}
                onBlur={e => {
                  borderBlur(e)
                  passwordReg.onBlur(e)
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{ color: '#5a5a5a' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p
                id="password-error"
                className="mt-1 text-xs"
                style={{ color: '#dc2626' }}
                role="alert"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Auth error */}
          {authError && (
            <div
              className="px-3 py-2.5 rounded border text-xs"
              style={{
                color: '#dc2626',
                backgroundColor: '#fef2f2',
                borderColor: '#fecaca',
              }}
              role="alert"
            >
              {authError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm font-medium mt-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
            onMouseEnter={e => {
              if (!isSubmitting)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2D5A3D'
            }}
            onMouseLeave={e => {
              if (!isSubmitting)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E3A2F'
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
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Footer note */}
        <p className="text-xs text-center mt-6" style={{ color: '#5a5a5a' }}>
          No self-registration. Accounts are created by Innerframe.
        </p>
      </div>
    </div>
  )
}
