// SPA fallback: serve index.html with 200 for any route that isn't a static asset or API function.
// This replaces the `/* /index.html 200` _redirects rule which Cloudflare Pages rejects as an
// infinite loop when the target file itself matches the wildcard pattern.
export const onRequest: PagesFunction = async (context) => {
  const response = await context.next()

  // Pass through successful responses and API routes untouched
  if (response.status !== 404) return response

  const url = new URL(context.request.url)
  if (url.pathname.startsWith('/api/')) return response

  // Serve index.html with 200 for all unmatched SPA routes
  const indexUrl = new URL('/index.html', context.request.url)
  const indexResponse = await context.env.ASSETS.fetch(new Request(indexUrl.toString()))
  return new Response(indexResponse.body, {
    status: 200,
    headers: indexResponse.headers,
  })
}
