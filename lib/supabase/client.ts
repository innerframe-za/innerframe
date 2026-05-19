import { createClient as supabaseCreateClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Singleton — reuse the same client across the app
let _client: SupabaseClient<Database> | null = null

export function createClient(): SupabaseClient<Database> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
  }
  if (!_client) {
    _client = supabaseCreateClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return _client
}
