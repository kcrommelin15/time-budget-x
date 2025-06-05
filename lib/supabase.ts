import { createClient } from "@supabase/supabase-js"

// Your project details from the screenshots
const supabaseUrl = "https://jxwvedmbnhmnuujjxwc.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4d3ZlZG1ibm5obW51dWpqeHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MjAxODIsImV4cCI6MjA2NDM5NjE4Mn0.L94Q6K-LhTCY7QLt07DgQUS7CiZMPjROC1I0Ax0fO1s"

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar: string | null
}
