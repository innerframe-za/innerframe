export type UserRole = 'home_admin' | 'staff' | 'super_admin'

export type UserProfile = {
  id: string
  orgId: string
  role: UserRole
  fullName: string
  email: string
}

// Demo stub — replace with real Supabase session lookup when auth is re-enabled
const DEMO_USER: UserProfile = {
  id: 'demo',
  orgId: 'demo-org',
  role: 'home_admin',
  fullName: 'Admin User',
  email: 'admin@innerframe.co.za',
}

export function useUser() {
  return { user: DEMO_USER, loading: false }
}
