import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Your actual Supabase credentials
const SUPABASE_URL = "https://jxwvedmbnnhmnuujjxwc.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4d3ZlZG1ibm5obW51dWpqeHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MjAxODIsImV4cCI6MjA2NDM5NjE4Mn0.L94Q6K-LhTCY7QLt07DgQUS7CiZMPjROC1I0Ax0fO1s"

let supabaseInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  // Use environment variables if available, otherwise use hardcoded values
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY

  console.log("Supabase URL:", supabaseUrl)
  console.log("Supabase Key exists:", !!supabaseAnonKey)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials")
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

// Export the client directly
export const supabase = getSupabase()
