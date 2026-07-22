// HTTP client for the Innerframe NestJS backend.
// Access token lives in memory (lost on page refresh, restored via refresh token).
// Refresh token lives in sessionStorage (cleared on browser close per security rules).

const API_BASE =
  ((import.meta.env.VITE_API_URL as string | undefined) ?? 'https://innerframe-api.onrender.com')
    .replace(/\/$/, '') + '/api/v1'

const REFRESH_KEY = 'innerframe_rt'

let _accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  _accessToken = token
}

export function getAccessToken(): string | null {
  return _accessToken
}

export function setRefreshToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(REFRESH_KEY, token)
    else sessionStorage.removeItem(REFRESH_KEY)
  } catch { /* private browsing may block sessionStorage */ }
}

export function getRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(REFRESH_KEY)
  } catch {
    return null
  }
}

async function tryRefresh(): Promise<boolean> {
  const rt = getRefreshToken()
  if (!rt) return false
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: rt }),
    })
    if (!res.ok) {
      setRefreshToken(null)
      setAccessToken(null)
      return false
    }
    const data = (await res.json()) as { access_token: string; refresh_token: string }
    setAccessToken(data.access_token)
    setRefreshToken(data.refresh_token)
    return true
  } catch {
    return false
  }
}

/** Called on app mount to restore session from sessionStorage refresh token. */
export async function restoreSession(): Promise<string | null> {
  const ok = await tryRefresh()
  return ok ? _accessToken : null
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  if (_accessToken) headers.set('Authorization', `Bearer ${_accessToken}`)
  if (!headers.has('Content-Type') && init?.body !== undefined && init.body !== null) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })

  if (res.status === 401 && _accessToken) {
    // Token expired — try a silent refresh then replay
    const refreshed = await tryRefresh()
    if (refreshed) {
      headers.set('Authorization', `Bearer ${_accessToken!}`)
      return fetch(`${API_BASE}${path}`, { ...init, headers })
    }
    setAccessToken(null)
  }

  return res
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path)
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(err.message ?? `GET ${path} failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(err.message ?? `POST ${path} failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(err.message ?? `PATCH ${path} failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function apiDelete(path: string): Promise<void> {
  const res = await apiFetch(path, { method: 'DELETE' })
  if (!res.ok && res.status !== 204) {
    const err = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(err.message ?? `DELETE ${path} failed: ${res.status}`)
  }
}
