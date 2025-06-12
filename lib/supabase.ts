import { createClient } from "@supabase/supabase-js"

// Your actual Supabase credentials - hardcoded to avoid environment variable issues
const SUPABASE_URL = "https://jxwvedmbnnhmnuujjxwc.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4d3ZlZG1ibm5obW51dWpqeHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MjAxODIsImV4cCI6MjA2NDM5NjE4Mn0.L94Q6K-LhTCY7QLt07DgQUS7CiZMPjROC1I0Ax0fO1s"

// Create the Supabase client directly without any complex logic
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Export a function to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY)
}
