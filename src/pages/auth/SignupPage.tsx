import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const schema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupFormData = z.infer<typeof schema>

function borderFocus(e: React.FocusEvent<HTMLInputElement>) { e.target.style.borderColor = '#1E3A2F' }
function borderBlur(e: React.FocusEvent<HTMLInputElement>) { e.target.style.borderColor = '#ddd6c8' }

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormData>({
    resolver: zodResolver(schema),
  })

  const emailReg = register('email')
  const passwordReg = register('password')
  const confirmReg = register('confirmPassword')

  const onSubmit = async (data: SignupFormData) => {
    setAuthError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email: data.email, password: data.password })
    if (error) { setAuthError(error.message); return }
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#ffffff' }}>
      <div className="w-full max-w-[400px] rounded-2xl border p-8" style={{ backgroundColor: '#F5F0E8', borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.jpeg" alt="Innerframe Care Solutions" width={120} height={60} className="object-contain rounded mb-4" />
          <h1 className="text-lg font-medium" style={{ color: '#1E3A2F' }}>Create an account</h1>
          <p className="text-sm mt-1" style={{ color: '#5a5a5a' }}>Get access to your Innerframe portal</p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="px-4 py-5 rounded-xl border text-sm" style={{ backgroundColor: 'rgba(30,58,47,0.05)', borderColor: 'rgba(30,58,47,0.2)', color: '#1E3A2F' }}>
              <p className="font-medium mb-1">Check your email</p>
              <p style={{ color: '#5a5a5a' }}>We've sent a confirmation link. Click it to activate your account before signing in.</p>
            </div>
            <Link to="/login" className="block w-full text-center px-4 py-3 rounded-full text-sm font-medium transition-colors" style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>Email address</label>
              <input id="email" type="email" autoComplete="email" placeholder="your@email.co.za"
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                style={{ borderColor: '#ddd6c8', color: '#1a1a1a', backgroundColor: '#ffffff' }}
                onFocus={borderFocus} {...emailReg} onBlur={e => { borderBlur(e); emailReg.onBlur(e) }}
              />
              {errors.email && <p className="mt-1 text-xs" style={{ color: '#dc2626' }} role="alert">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Min. 8 characters"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-colors"
                  style={{ borderColor: '#ddd6c8', color: '#1a1a1a', backgroundColor: '#ffffff' }}
                  onFocus={borderFocus} {...passwordReg} onBlur={e => { borderBlur(e); passwordReg.onBlur(e) }}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)} style={{ color: '#5a5a5a' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs" style={{ color: '#dc2626' }} role="alert">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>Confirm password</label>
              <div className="relative">
                <input id="confirmPassword" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-colors"
                  style={{ borderColor: '#ddd6c8', color: '#1a1a1a', backgroundColor: '#ffffff' }}
                  onFocus={borderFocus} {...confirmReg} onBlur={e => { borderBlur(e); confirmReg.onBlur(e) }}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowConfirm(!showConfirm)} style={{ color: '#5a5a5a' }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs" style={{ color: '#dc2626' }} role="alert">{errors.confirmPassword.message}</p>}
            </div>

            {authError && (
              <div className="px-3 py-2.5 rounded-lg border text-xs" style={{ color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' }} role="alert">
                {authError}
              </div>
            )}

            <button type="submit" disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-medium mt-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
              onMouseEnter={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2D5A3D' }}
              onMouseLeave={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E3A2F' }}
            >
              {isSubmitting ? <><span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }} />Creating account...</> : 'Create account'}
            </button>
          </form>
        )}

        {!submitted && (
          <p className="text-xs text-center mt-6" style={{ color: '#5a5a5a' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1E3A2F' }} className="font-medium underline">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}
