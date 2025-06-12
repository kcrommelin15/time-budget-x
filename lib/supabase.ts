import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let supabaseInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  // Use the environment variables that are already configured in v0
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jxwvedmbnnhmnuujjxwc.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4d3ZlZG1ibm5obW51dWpqeHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MjAxODIsImV4cCI6MjA2NDM5NjE4Mn0.L94Q6K-LhTCY7QLt07DgQUS7CiZMPjROC1I0Ax0fO1s"

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "your_url_here" || supabaseAnonKey === "your_key_here") {
    console.warn("Supabase environment variables not properly configured")
    return null
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch (error) {
    console.error("Invalid Supabase URL format:", supabaseUrl)
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
      console.log("Supabase client initialized successfully")
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error)
      return null
    }
  }

  return supabaseInstance
}

// Export the client directly for easier usage
export const supabase = getSupabase()
