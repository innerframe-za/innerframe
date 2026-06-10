/// <reference types="@cloudflare/workers-types" />

// Cloudflare Pages Function — creates a Supabase auth user with org metadata.
//
// The Supabase DB trigger (003_auth_user_trigger.sql / 018_username.sql) fires
// automatically after creation and inserts a row in public.users using the
// metadata supplied here.
//
// Required CF Pages env vars:
//   VITE_SUPABASE_URL        — e.g. https://xxxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY   — public anon key (used to validate caller JWT)
//   SUPABASE_SERVICE_ROLE_KEY — service role key (never expose to the browser)
//
// POST /api/create-user
// Headers: Authorization: Bearer <supabase_access_token>
// Body: { email, password, full_name, role, org_id, username? }
// Returns: { ok: true, id: string } | { ok: false, error: string }

interface Env {
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
}

interface RequestBody {
  email: string
  password: string
  full_name: string
  role: string
  org_id: string
  username?: string
}

// Roles a super_admin may create via this endpoint
const SUPER_ADMIN_ALLOWED_ROLES = new Set(['staff', 'home_admin'])
// Roles a home_admin may create (cannot promote to their own level)
const HOME_ADMIN_ALLOWED_ROLES  = new Set(['staff'])

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const UUID_RE  = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json(
      { ok: false, error: 'Server not configured — check CF Pages env vars.' },
      { status: 503 }
    )
  }

  // ── 1. Verify caller JWT ──────────────────────────────────────────────────
  const authHeader = request.headers.get('Authorization') ?? ''
  const callerJwt  = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!callerJwt) {
    return Response.json({ ok: false, error: 'Unauthorized.' }, { status: 401 })
  }

  const meRes = await fetch(`${env.VITE_SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${callerJwt}`,
      apikey: env.VITE_SUPABASE_ANON_KEY,
    },
  })

  if (!meRes.ok) {
    return Response.json({ ok: false, error: 'Unauthorized.' }, { status: 401 })
  }

  const meData = await meRes.json() as { user_metadata?: { role?: string } }
  const callerRole = meData.user_metadata?.role ?? ''

  if (callerRole !== 'super_admin' && callerRole !== 'home_admin') {
    return Response.json({ ok: false, error: 'Forbidden.' }, { status: 403 })
  }

  // ── 2. Parse and validate body ────────────────────────────────────────────
  let body: RequestBody
  try {
    body = await request.json() as RequestBody
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { email, password, full_name, role, org_id, username } = body

  if (!email || !password || !full_name || !role || !org_id) {
    return Response.json(
      { ok: false, error: 'Missing required fields: email, password, full_name, role, org_id.' },
      { status: 400 }
    )
  }

  if (!EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: 'Invalid email address.' }, { status: 400 })
  }
  if (password.length < 8) {
    return Response.json({ ok: false, error: 'Password must be at least 8 characters.' }, { status: 400 })
  }
  if (full_name.length > 200) {
    return Response.json({ ok: false, error: 'Full name must be 200 characters or fewer.' }, { status: 400 })
  }
  if (!UUID_RE.test(org_id)) {
    return Response.json({ ok: false, error: 'Invalid org_id format.' }, { status: 400 })
  }
  if (username && (username.length > 50 || !/^[a-zA-Z0-9@._-]+$/.test(username))) {
    return Response.json({ ok: false, error: 'Invalid username format.' }, { status: 400 })
  }

  // ── 3. Role allowlist (caller-role-aware) ─────────────────────────────────
  const allowedRoles = callerRole === 'super_admin'
    ? SUPER_ADMIN_ALLOWED_ROLES
    : HOME_ADMIN_ALLOWED_ROLES

  if (!allowedRoles.has(role)) {
    return Response.json(
      { ok: false, error: `Role '${role}' is not permitted for your account type.` },
      { status: 403 }
    )
  }

  // ── 4. Create the auth user via Supabase Admin API ────────────────────────
  const supabaseRes = await fetch(`${env.VITE_SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey:        env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        org_id,
        full_name,
        role,
        username: username ?? null,
        force_password_change: true,
      },
    }),
  })

  const data = await supabaseRes.json() as { id?: string; message?: string; msg?: string }

  if (!supabaseRes.ok) {
    const errMsg = data.message ?? data.msg ?? `Supabase returned ${supabaseRes.status}`
    return Response.json({ ok: false, error: errMsg }, { status: supabaseRes.status })
  }

  return Response.json({ ok: true, id: data.id })
}
