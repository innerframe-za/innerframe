/// <reference types="@cloudflare/workers-types" />

// Cloudflare Pages Function — proxies Supabase storage requests through
// the app's own domain so ad blockers never see a supabase.co URL.
//
// Route: GET /api/files/*  (catches any storage path)
//
// Required env vars (set in Cloudflare Pages → Settings → Environment Variables):
//   SUPABASE_URL      — e.g. https://xxxxx.supabase.co
//   SUPABASE_ANON_KEY — the project's anon/public key

interface Env {
  // CF Pages makes all dashboard env vars available to Functions.
  // The project already sets VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY for
  // the Vite build, so we read those here rather than requiring separate secrets.
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
}

export const onRequestGet: PagesFunction<Env> = async ({ request, params, env }) => {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    return new Response('Storage proxy not configured', { status: 503 })
  }

  // Require a valid Bearer token — Supabase RLS will enforce the rest
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Reconstruct the storage path from wildcard segments
  const pathSegments = Array.isArray(params.path) ? params.path : [params.path as string]
  const storagePath = pathSegments.join('/')

  // Reject path traversal attempts
  if (storagePath.includes('..')) {
    return new Response('Bad Request', { status: 400 })
  }

  // Optional ?download=filename triggers Content-Disposition: attachment
  const { searchParams } = new URL(request.url)
  const downloadParam = searchParams.get('download')

  // Use /authenticated/ path — required for private buckets with bearer token + RLS
  const supabaseUrl = new URL(
    `/storage/v1/object/authenticated/documents/${storagePath}`,
    env.VITE_SUPABASE_URL
  )
  if (downloadParam) supabaseUrl.searchParams.set('download', downloadParam)

  // Forward to Supabase — user's JWT is passed through, service key never touches the browser
  const upstream = await fetch(supabaseUrl.toString(), {
    headers: {
      Authorization: authHeader,
      apikey: env.VITE_SUPABASE_ANON_KEY,
    },
  })

  if (!upstream.ok) {
    return new Response('File not found or access denied', { status: upstream.status })
  }

  const headers = new Headers({
    'Content-Type': upstream.headers.get('Content-Type') ?? 'application/octet-stream',
    'Cache-Control': 'private, max-age=300',
  })

  const disposition = upstream.headers.get('Content-Disposition')
  if (disposition) headers.set('Content-Disposition', disposition)

  return new Response(upstream.body, { status: 200, headers })
}
