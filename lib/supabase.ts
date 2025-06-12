import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let supabaseInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  // Return null if environment variables are not set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables not configured")
    return null
  }

  // Create instance only once
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error)
      return null
    }
  }

  return supabaseInstance
}

// Export a getter function instead of the client directly
export const supabase = {
  get client() {
    return getSupabase()
  },
}
