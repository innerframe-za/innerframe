import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  setAccessToken,
  setRefreshToken,
  restoreSession,
  apiFetch,
  apiPost,
  apiGet,
} from '@/lib/api/client'

export type UserRole = 'super_admin' | 'admin' | 'staff'

export interface Membership {
  org_id: string
  org_name: string
  role: string
}

export interface UserProfile {
  id: string
  orgId: string
  role: UserRole
  fullName: string
  email: string
  memberships: Membership[]
}

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapRole(backendRole: string): UserRole {
  if (backendRole === 'platform_admin') return 'super_admin'
  if (backendRole === 'org_admin' || backendRole === 'care_manager') return 'admin'
  return 'staff'
}

function parseJwt(token: string): Record<string, unknown> {
  try {
    return JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    ) as Record<string, unknown>
  } catch {
    return {}
  }
}

function buildProfile(
  token: string,
  user: { id: string; email: string },
  memberships: Membership[],
): UserProfile {
  const payload = parseJwt(token)
  const orgId = (payload.org_id as string) || memberships[0]?.org_id || ''
  const email = user.email
  return {
    id: user.id,
    orgId,
    role: mapRole((payload.role as string) || ''),
    fullName: email.split('@')[0],
    email,
    memberships,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount: try to restore session from sessionStorage refresh token
  useEffect(() => {
    restoreSession()
      .then(async (token) => {
        if (!token) return
        const payload = parseJwt(token)
        const memberships = await apiGet<Membership[]>('/me/memberships').catch(() => [])
        setUser(
          buildProfile(
            token,
            { id: payload.sub as string, email: payload.email as string },
            memberships,
          )
        )
      })
      .catch(() => { /* failed — stay logged out */ })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiPost<{
      access_token: string
      refresh_token: string
      user: { id: string; email: string; mfa_enabled: boolean }
      memberships: Membership[]
    }>('/auth/login', { email, password })

    setAccessToken(data.access_token)
    setRefreshToken(data.refresh_token)
    setUser(buildProfile(data.access_token, data.user, data.memberships))
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'DELETE' })
    } catch { /* best-effort */ }
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
