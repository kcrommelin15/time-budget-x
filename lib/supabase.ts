import { createClient } from "@supabase/supabase-js"

// Your actual Supabase project URL from the screenshots
const supabaseUrl = "https://jxwvedmbnhmnuujjxwc.supabase.co"

// You'll need to get your actual anon key from Supabase Dashboard > Settings > API
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key-here"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
