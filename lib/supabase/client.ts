import { createClient as supabaseCreateClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Singleton — reuse the same client across the app
let _client: ReturnType<typeof supabaseCreateClient> | null = null

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
  }
  if (!_client) {
    _client = supabaseCreateClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return _client
}
