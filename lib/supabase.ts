import { createClient } from "@supabase/supabase-js"

// Fallback values for v0.dev environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jxwvedmbnhmnuujjxwc.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4d3ZlZG1ibmhtbnV1amp4d2MiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxNzE5NzQ4NCwiZXhwIjoyMDMyNzczNDg0fQ.qjneN9S9c_XQttgPkeK1msYRFXW_1tmsYRFXW"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar: string | null
}
