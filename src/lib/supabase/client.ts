import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient(url, key)
}
