import { createClient as supabaseCreateClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  }
  return supabaseCreateClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
