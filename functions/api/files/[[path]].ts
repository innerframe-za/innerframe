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
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

export const onRequestGet: PagesFunction<Env> = async ({ request, params, env }) => {
  // Require a valid Bearer token — Supabase RLS will enforce the rest
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Reconstruct the storage path from wildcard segments
  const pathSegments = Array.isArray(params.path) ? params.path : [params.path as string]
  const storagePath = pathSegments.join('/')

  // Optional ?download=filename triggers Content-Disposition: attachment
  const { searchParams } = new URL(request.url)
  const downloadParam = searchParams.get('download')

  const supabaseUrl = new URL(
    `/storage/v1/object/documents/${storagePath}`,
    env.SUPABASE_URL
  )
  if (downloadParam) supabaseUrl.searchParams.set('download', downloadParam)

  // Forward to Supabase — user's JWT is passed through, service key never touches the browser
  const upstream = await fetch(supabaseUrl.toString(), {
    headers: {
      Authorization: authHeader,
      apikey: env.SUPABASE_ANON_KEY,
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
