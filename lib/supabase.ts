import { createClient } from "@supabase/supabase-js"

// Replace this with your actual Supabase project URL from the dashboard
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://YOUR_ACTUAL_PROJECT_REF.supabase.co"

// Also replace this with your actual anon key from the dashboard
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_ACTUAL_ANON_KEY"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar: string | null
}
